import { cleanText, decodeEntities, fetchText, stripTags } from './util.js';

const ENDPOINT = 'https://export.arxiv.org/api/query';

function entryBlocks(xml) {
  return [...String(xml).matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((match) => match[1]);
}

function tag(xml, name) {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml);
  return match ? match[1] : '';
}

function attrs(xml, name) {
  return [...String(xml).matchAll(new RegExp(`<${name}\\s([^>]*?)/?>`, 'g'))].map((match) => match[1]);
}

function attribute(attrText, name) {
  const match = new RegExp(`${name}="([^"]*)"`).exec(attrText || '');
  return match ? decodeEntities(match[1]) : '';
}

function parseEntry(xml) {
  const rawId = stripTags(tag(xml, 'id'));
  const arxivId = rawId.replace(/^https?:\/\/arxiv\.org\/abs\//, '').replace(/v\d+$/, '');
  const published = stripTags(tag(xml, 'published')) || stripTags(tag(xml, 'updated'));
  const authors = [...xml.matchAll(/<author>([\s\S]*?)<\/author>/g)]
    .map((match) => cleanText(tag(match[1], 'name')))
    .filter(Boolean);
  const categories = attrs(xml, 'category')
    .map((attr) => attribute(attr, 'term'))
    .filter(Boolean);
  const links = attrs(xml, 'link');
  const pdf = links.map((attr) => ({ title: attribute(attr, 'title'), href: attribute(attr, 'href') })).find((link) => link.title === 'pdf');
  const doi = stripTags(tag(xml, 'arxiv:doi'));
  const journalRef = stripTags(tag(xml, 'arxiv:journal_ref'));

  return {
    id: `arxiv:${arxivId}`,
    source: 'arxiv',
    kind: 'preprint',
    arxivId,
    title: cleanText(tag(xml, 'title')),
    abstract: cleanText(tag(xml, 'summary')),
    authors,
    year: published ? Number(published.slice(0, 4)) : null,
    date: published ? published.slice(0, 10) : '',
    type: 'preprint',
    doi,
    url: `https://arxiv.org/abs/${arxivId}`,
    pdfUrl: pdf?.href ? pdf.href.replace(/^http:/, 'https:') : `https://arxiv.org/pdf/${arxivId}`,
    openAccess: true,
    citedBy: 0,
    journal: null,
    arxiv: {
      id: arxivId,
      primaryCategory: categories[0] || '',
      categories,
      journalRef,
    },
  };
}

async function query(searchQuery, { limit = 20, start = 0, sortBy = 'submittedDate' } = {}) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('search_query', searchQuery);
  url.searchParams.set('start', String(start));
  url.searchParams.set('max_results', String(Math.min(Math.max(limit, 1), 50)));
  url.searchParams.set('sortBy', sortBy);
  url.searchParams.set('sortOrder', 'descending');
  const xml = await fetchText(url.toString(), { timeoutMs: 30000 });
  return entryBlocks(xml).map(parseEntry).filter((paper) => paper.title && paper.arxiv.id);
}

export function latestByCategory(category, options = {}) {
  return query(`cat:${category}`, options);
}

export function searchArxiv(term, options = {}) {
  return query(`all:${term}`, options);
}
