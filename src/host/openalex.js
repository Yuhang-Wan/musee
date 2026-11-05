import { cleanText, fetchJson } from './util.js';

const BASE = 'https://api.openalex.org/works';

const SELECT = [
  'id',
  'doi',
  'title',
  'display_name',
  'publication_date',
  'publication_year',
  'authorships',
  'primary_location',
  'biblio',
  'cited_by_count',
  'open_access',
  'abstract_inverted_index',
  'type',
].join(',');

function abstractFromIndex(index) {
  if (!index || typeof index !== 'object') return '';
  const words = [];
  for (const [word, positions] of Object.entries(index)) {
    if (!Array.isArray(positions)) continue;
    for (const position of positions) {
      if (Number.isInteger(position) && position >= 0) words[position] = word;
    }
  }
  return words.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function openAlexId(value = '') {
  return String(value).split('/').pop() || '';
}

export function normalizeWork(work) {
  const doi = work.doi ? String(work.doi).replace(/^https?:\/\/doi\.org\//i, '') : '';
  const source = work.primary_location?.source || null;
  const authors = (work.authorships || [])
    .map((authorship) => authorship?.author?.display_name || authorship?.raw_author_name || '')
    .map((name) => cleanText(name))
    .filter(Boolean);

  const biblio = work.biblio || {};
  const firstPage = biblio.first_page || '';
  const lastPage = biblio.last_page || '';
  const pages = firstPage && lastPage && firstPage !== lastPage ? `${firstPage}-${lastPage}` : firstPage || lastPage || '';

  return {
    id: doi ? `doi:${doi.toLowerCase()}` : `openalex:${openAlexId(work.id)}`,
    source: 'openalex',
    title: cleanText(work.title || work.display_name || ''),
    abstract: abstractFromIndex(work.abstract_inverted_index),
    authors,
    year: work.publication_year || (work.publication_date ? Number(String(work.publication_date).slice(0, 4)) : null),
    date: work.publication_date || '',
    type: work.type || 'article',
    doi,
    url: doi ? `https://doi.org/${doi}` : work.primary_location?.landing_page_url || work.id || '',
    pdfUrl: work.open_access?.oa_url || '',
    openAccess: Boolean(work.open_access?.is_oa),
    citedBy: work.cited_by_count || 0,
    journal: source
      ? {
          id: openAlexId(source.id),
          name: source.display_name || '',
          issn: source.issn_l || '',
        }
      : null,
    volume: biblio.volume || '',
    issue: biblio.issue || '',
    pages,
  };
}

function worksUrl(params) {
  const url = new URL(BASE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export async function worksBySource(sourceId, { limit = 20, offset = 0, mailto = '' } = {}) {
  const url = worksUrl({
    filter: `primary_location.source.id:${sourceId}`,
    sort: 'publication_date:desc',
    'per-page': Math.min(Math.max(limit, 1), 50),
    page: Math.max(Math.floor(offset / Math.max(limit, 1)) + 1, 1),
    select: SELECT,
    mailto,
  });
  const data = await fetchJson(url);
  return (data.results || []).map(normalizeWork).filter((paper) => paper.title);
}

export async function searchWorks(query, { limit = 20, mailto = '' } = {}) {
  const url = worksUrl({
    search: query,
    'per-page': Math.min(Math.max(limit, 1), 50),
    select: SELECT,
    mailto,
  });
  const data = await fetchJson(url);
  return (data.results || []).map(normalizeWork).filter((paper) => paper.title);
}

export async function worksByDoi(doi, { mailto = '' } = {}) {
  const url = worksUrl({ filter: `doi:${doi}`, select: SELECT, mailto });
  const data = await fetchJson(url);
  const hit = (data.results || [])[0];
  return hit ? normalizeWork(hit) : null;
}
