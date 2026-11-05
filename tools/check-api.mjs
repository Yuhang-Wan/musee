import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const base = process.env.DSH_WEB_URL || 'http://127.0.0.1:57659';

let token;
try {
  const runtime = JSON.parse(await fs.readFile(path.join(os.homedir(), '.dsh', 'musee', 'runtime.json'), 'utf8'));
  token = runtime.token;
  console.log('runtime:', runtime.version, 'pid', runtime.pid, 'token: present');
} catch (error) {
  console.log('runtime file unavailable:', error.message);
}

if (!token) {
  const html = await (await fetch(base + '/')).text();
  const match = html.match(/name="musee-token" content="([^"]+)"/);
  token = match?.[1];
  console.log('index length:', html.length, 'token:', token ? 'present' : 'MISSING');
}
if (!token) process.exit(1);

async function call(route, options = {}) {
  const response = await fetch(base + '/musee/api' + route, {
    method: options.method || 'GET',
    headers: {
      'x-musee-token': token,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`${route} -> HTTP ${response.status}: ${data.error}`);
  return data;
}

const boot = await call('/bootstrap');
console.log('bootstrap:', boot.version, 'disciplines:', boot.disciplines.map((d) => `${d.id}:${d.journals.length}`).join(','), 'llm:', boot.llm, 'route:', JSON.stringify(boot.route));

const journal = await call('/journal?journalId=urban-studies&limit=2');
console.log('journal papers:', journal.papers.length, '|', journal.papers[0]?.title?.slice(0, 70));

const arxiv = await call('/arxiv?category=cs.RO&limit=2');
console.log('arxiv papers:', arxiv.papers.length, '|', arxiv.papers[0]?.title?.slice(0, 70));

const search = await call('/search?q=urban%20heat%20island&limit=2');
console.log('search papers:', search.papers.length, '|', search.papers[0]?.title?.slice(0, 70));

const paper = journal.papers[0] || search.papers[0];
console.log('translating:', paper.title);
const started = Date.now();
const translated = await call('/translate', { method: 'POST', body: { title: paper.title, abstract: paper.abstract } });
console.log(`translation (${Date.now() - started}ms, cached=${translated.cached}, model=${translated.model}):`);
console.log('TITLE:', translated.title);
console.log('ABSTRACT:', String(translated.abstract).slice(0, 260), '...');

const cite = await call('/cite', { method: 'POST', body: { papers: [paper], format: 'gb' } });
console.log('gb citation:', cite.text.slice(0, 220));

const batch = await call('/cite', {
  method: 'POST',
  body: { papers: [journal.papers[0], arxiv.papers[0]], format: 'apa' },
});
console.log('batch apa:', batch.text.replace(/\s+/g, ' ').slice(0, 260));

const bibtex = await call('/cite', {
  method: 'POST',
  body: { papers: [journal.papers[0], arxiv.papers[0]], format: 'bibtex' },
});
console.log('bibtex entries:', (bibtex.text.match(/^@/gm) || []).length);

const testPaper = {
  id: 'test:musee-smoke',
  source: 'openalex',
  title: 'Musee smoke test paper',
  abstract: 'A disposable record used by the API check.',
  authors: ['Test Author'],
  year: 2026,
  doi: '10.0000/musee.test',
  url: 'https://example.org/musee-test',
  journal: { name: 'Test Journal', issn: '0000-0000' },
  volume: '1',
  issue: '2',
  pages: '1-2',
};
const saved = await call('/library', { method: 'POST', body: { action: 'save', paper: testPaper } });
console.log('library save:', saved.item.id, 'items:', saved.items.length);
const updated = await call('/library', {
  method: 'POST',
  body: { action: 'update', id: testPaper.id, patch: { status: 'reading', note: '冒烟测试笔记', tags: ['test'] } },
});
console.log('library update:', updated.item.status, JSON.stringify(updated.item.note), JSON.stringify(updated.item.tags));
const removed = await call('/library', { method: 'POST', body: { action: 'remove', id: testPaper.id } });
console.log('library remove:', removed.removed, 'items:', removed.items.length);

const exported = await fetch(base + '/musee/api/export?format=md', { headers: { 'x-musee-token': token } });
console.log('export md:', exported.status, exported.headers.get('content-type'));

const conference = await call('/conference?conferenceId=cvpr&limit=2');
console.log('conference papers:', conference.papers.length, 'kind:', conference.papers[0]?.kind);
const conferenceCitation = await call('/cite', {
  method: 'POST',
  body: { papers: [conference.papers[0]], format: 'bibtex' },
});
console.log('conference bibtex:', conferenceCitation.text.split('\n')[0]);

const french = await call('/translate', {
  method: 'POST',
  body: { title: 'Urban heat islands', abstract: 'A short abstract about cities and heat.', lang: 'fr' },
});
console.log('french title:', french.title);

console.log('ALL OK');
