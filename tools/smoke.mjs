import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { latestByCategory } from '../src/host/arxiv.js';
import { worksBySource } from '../src/host/openalex.js';
import { cite } from '../src/host/cite.js';
import { createStore } from '../src/host/store.js';

const arxiv = await latestByCategory('cs.RO', { limit: 2 });
console.log('arxiv:', arxiv.length, arxiv[0]?.title?.slice(0, 80));
assert.ok(arxiv.length > 0, 'arxiv returned no entries');
assert.ok(arxiv[0].arxiv.id, 'arxiv id missing');

const papers = await worksBySource('S50366009', { limit: 2 });
console.log('openalex:', papers.length, papers[0]?.title?.slice(0, 80));
assert.ok(papers.length > 0, 'openalex returned no entries');
assert.ok(papers[0].title, 'openalex title missing');

const sample = {
  ...papers[0],
  doi: '10.1177/00420980241234567',
  journal: { id: 'S50366009', name: 'Urban Studies', issn: '0042-0980' },
  year: 2024,
  volume: '61',
  issue: '3',
  pages: '45-67',
  authors: ['Alice Zhang', 'Bob O. Smith', 'Carol Lee', 'Dan Wu'],
};

for (const format of ['gb', 'apa', 'mla', 'ieee', 'bibtex', 'ris']) {
  const text = cite([sample, arxiv[0]], format);
  console.log(`--- ${format} ---\n${text}\n`);
  assert.ok(text.trim().length > 0, `${format} empty`);
}

const dir = path.join(os.tmpdir(), `musee-smoke-${process.pid}`);
const store = await createStore(dir);
const saved = await store.savePaper(sample);
assert.equal(saved.status, 'unread');
await store.updateItem(saved.id, { status: 'reading', note: '关键方法：多源数据融合。', tags: ['方法', '城市'] });
assert.equal(store.list()[0].status, 'reading');
assert.match(store.exportMarkdown(), /多源数据融合/);
assert.equal(await store.removeItem(saved.id), true);
assert.equal(store.list().length, 0);
await fs.rm(dir, { recursive: true, force: true });
console.log('store ok');
