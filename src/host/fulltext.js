import { cleanText, decodeEntities, stripTags } from './util.js';

const ARXIV_BASE = 'https://arxiv.org';

function normalizeArxivId(value = '') {
  return String(value)
    .replace(/^arxiv:/i, '')
    .replace(/^https?:\/\/arxiv\.org\/(?:abs|pdf)\//i, '')
    .replace(/\.pdf$/i, '')
    .replace(/v\d+$/, '')
    .trim();
}

function absoluteUrl(value, baseUrl, versionDir) {
  if (!value || /^(https?:|data:|mailto:|#)/i.test(value)) return value;
  const clean = value.replace(/^\.\//, '');
  if (versionDir && clean.startsWith(`${versionDir}/`)) {
    return `${ARXIV_BASE}/html/${clean}`;
  }
  try {
    return new URL(clean, baseUrl).toString();
  } catch {
    return value;
  }
}

function rewriteUrls(html, baseUrl, versionDir) {
  return html.replace(/\b(src|href)="([^"]*)"/g, (_match, attribute, value) => {
    return `${attribute}="${absoluteUrl(value, baseUrl, versionDir)}"`;
  });
}

function sectionText(html) {
  const text = String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
  return decodeEntities(text)
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractToc(body) {
  const entries = [];
  const starts = [];
  const sectionPattern = /<section\b([^>]*)>/g;
  let match;
  while ((match = sectionPattern.exec(body))) {
    const attributes = match[1] || '';
    const id = /id="([^"]+)"/.exec(attributes)?.[1] || '';
    const classes = /class="([^"]+)"/.exec(attributes)?.[1] || '';
    if (!id) continue;
    const isBibliography = classes.includes('ltx_bibliography');
    const isSubsection = classes.includes('ltx_subsection');
    const isSection = classes.includes('ltx_section');
    if (!isBibliography && !isSubsection && !isSection) continue;
    const level = isSubsection ? 2 : 1;
    const after = body.slice(match.index, match.index + 900);
    const heading = level === 2 ? /<h3[^>]*>([\s\S]*?)<\/h3>/.exec(after) : /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(after);
    if (!heading) continue;
    entries.push({
      id,
      title: cleanText(heading[1]) || (isBibliography ? 'References' : 'Section'),
      level,
      kind: isBibliography ? 'references' : level === 1 ? 'section' : 'subsection',
      start: match.index,
    });
    if (level === 1 && !isBibliography) starts.push({ id, start: match.index, title: cleanText(heading[1]) });
  }
  return { entries, starts };
}

function buildSections(body, starts, abstract) {
  const sections = [];
  if (abstract?.text) sections.push({ id: abstract.id, title: abstract.title, level: 1, text: abstract.text });
  starts.forEach((entry, index) => {
    const end = starts[index + 1]?.start ?? body.length;
    const text = sectionText(body.slice(entry.start, end)).slice(0, 12000);
    if (text) sections.push({ id: entry.id, title: entry.title, level: 1, text });
  });
  return sections;
}

export function parseArxivHtml(html, finalUrl, arxivId) {
  if (!/<article[^>]*class="[^"]*ltx_document/i.test(html)) return null;

  const title = cleanText(/<h1[^>]*class="[^"]*ltx_title_document[^"]*"[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] || '');
  const authors = cleanText(/<div[^>]*class="[^"]*ltx_authors[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(html)?.[1] || '');
  const article = /<article[^>]*class="[^"]*ltx_document[^"]*"[^>]*>([\s\S]*)<\/article>/i.exec(html)?.[1] || html;

  let body = article;
  body = body.replace(/<h1[^>]*class="[^"]*ltx_title_document[^"]*"[^>]*>[\s\S]*?<\/h1>/i, '');
  body = body.replace(/<div[^>]*class="[^"]*ltx_authors[^"]*"[^>]*>[\s\S]*?<\/div>/i, '');
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');

  const abstractMatch = /<div[^>]*class="[^"]*ltx_abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(body);
  const abstract = abstractMatch
    ? {
        id: /id="([^"]+)"/.exec(abstractMatch[0])?.[1] || 'abstract1',
        title: 'Abstract',
        text: sectionText(abstractMatch[1].replace(/<h6[\s\S]*?<\/h6>/i, '')).slice(0, 12000),
      }
    : null;

  const { entries, starts } = extractToc(body);
  const toc = [];
  if (abstract) toc.push({ id: abstract.id, title: 'Abstract', level: 1, kind: 'abstract' });
  toc.push(...entries.map(({ id, title: heading, level, kind }) => ({ id, title: heading, level, kind })));

  const versionFromUrl = /\/html\/([^/]+?)\/?$/.exec(finalUrl)?.[1] || '';
  const versionFromMarkup = /(?:src|href)="(?:\.\/)?([^"/]+v\d+)\//.exec(body)?.[1] || '';
  const versionDir = /v\d+$/.test(versionFromUrl) ? versionFromUrl : versionFromMarkup;
  const baseUrl = versionDir ? `${ARXIV_BASE}/html/${versionDir}/` : `${finalUrl.replace(/\/$/, '')}/`;
  const safeHtml = rewriteUrls(body, baseUrl, versionDir);

  return {
    available: true,
    source: 'arxiv',
    arxivId,
    title,
    authors,
    abstract: abstract?.text || '',
    toc,
    sections: buildSections(body, starts, abstract),
    html: safeHtml,
    absUrl: `${ARXIV_BASE}/abs/${arxivId}`,
    pdfUrl: `${ARXIV_BASE}/pdf/${arxivId}`,
    htmlUrl: finalUrl,
  };
}

export async function fetchArxivFulltext(arxivId) {
  const id = normalizeArxivId(arxivId);
  if (!id) return { available: false, arxivId: '', reason: 'invalid-id' };
  const safePath = id.split('/').map((part) => encodeURIComponent(part)).join('/');
  const url = `${ARXIV_BASE}/html/${safePath}`;
  const response = await fetch(url, {
    headers: { 'user-agent': 'Musee/0.3 (DSH reading plugin)', accept: 'text/html' },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
  });

  const fallback = {
    available: false,
    arxivId: id,
    absUrl: `${ARXIV_BASE}/abs/${id}`,
    pdfUrl: `${ARXIV_BASE}/pdf/${id}`,
    reason: response.ok ? 'no-html' : `http-${response.status}`,
  };
  if (!response.ok) return fallback;

  const html = await response.text();
  if (html.length > 8 * 1024 * 1024) return { ...fallback, reason: 'too-large' };
  const parsed = parseArxivHtml(html, response.url, id);
  return parsed || fallback;
}
