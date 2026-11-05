import { TtlCache, decodeEntities, fetchJson, fetchText } from './util.js';

const cache = new TtlCache(30 * 60 * 1000, 24);
const SEARCH = 'https://www.ebi.ac.uk/europepmc/webservices/rest/search';
const FULLTEXT = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function parseAttrs(source = '') {
  const attrs = {};
  const pattern = /([A-Za-z0-9:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = pattern.exec(source))) {
    attrs[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? '');
  }
  return attrs;
}

/**
 * A deliberately small JATS XML reader. Europe PMC full text is well-formed
 * XML; this parser keeps the element tree and text nodes we render instead of
 * pulling in a Node XML dependency.
 */
function parseXml(xml) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const pattern = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<\?[\s\S]*?\?>|<\/\s*([A-Za-z0-9:_-]+)\s*>|<\s*([A-Za-z0-9:_-]+)((?:"[^"]*"|'[^']*'|[^"'>])*)\s*(\/?)>/g;
  const pushText = (value) => {
    const text = decodeEntities(value).replace(/\s+/g, ' ');
    if (text) stack[stack.length - 1].children.push({ tag: '#text', text });
  };
  let last = 0;
  let match;
  while ((match = pattern.exec(xml))) {
    if (match.index > last) pushText(xml.slice(last, match.index));
    last = pattern.lastIndex;
    if (match[0].startsWith('<!--') || match[0].startsWith('<?')) continue;
    if (match[1] !== undefined) {
      pushText(match[1]);
      continue;
    }
    if (match[2]) {
      const tag = match[2].toLowerCase();
      for (let index = stack.length - 1; index > 0; index -= 1) {
        if (stack[index].tag === tag) {
          stack.length = index;
          break;
        }
      }
      continue;
    }
    const tag = match[3].toLowerCase();
    const node = { tag, attrs: parseAttrs(match[4] || ''), children: [] };
    stack[stack.length - 1].children.push(node);
    if (!match[5]) stack.push(node);
  }
  if (last < xml.length) pushText(xml.slice(last));
  return root;
}

function childrenOf(node, tag) {
  return (node?.children || []).filter((child) => child.tag === tag);
}

function firstOf(node, tag) {
  return (node?.children || []).find((child) => child.tag === tag);
}

function descendants(node, tag, out = []) {
  for (const child of node?.children || []) {
    if (child.tag === tag) out.push(child);
    descendants(child, tag, out);
  }
  return out;
}

function textOf(node) {
  if (!node) return '';
  if (node.tag === '#text') return node.text || '';
  return (node.children || []).map(textOf).join(' ');
}

function inline(node) {
  if (!node) return '';
  if (node.tag === '#text') return escapeHtml(node.text || '');
  const content = (node.children || []).map(inline).join('');
  switch (node.tag) {
    case 'italic':
    case 'em':
      return `<em>${content}</em>`;
    case 'bold':
    case 'strong':
      return `<strong>${content}</strong>`;
    case 'sup':
      return `<sup>${content}</sup>`;
    case 'sub':
      return `<sub>${content}</sub>`;
    case 'br':
      return '<br>';
    case 'ext-link': {
      const href = node.attrs['xlink:href'] || node.attrs.href || '';
      if (!href) return content;
      return `<a href="${escapeAttr(href)}" target="_blank" rel="noreferrer">${content}</a>`;
    }
    case 'xref':
      return content;
    case 'inline-formula':
    case 'disp-formula':
    case 'tex-math':
      return `<span class="musee-jats-formula">${content}</span>`;
    case 'alternatives':
    case 'mml:math':
      return content;
    default:
      return content;
  }
}

function inlineChildren(node) {
  return (node?.children || []).map(inline).join('').replace(/\s+/g, ' ').trim();
}

function createContext() {
  return { sections: [], toc: [], counter: 0, current: null };
}

function startSection(ctx, title, level) {
  const id = `pmc-sec-${(ctx.counter += 1)}`;
  const section = { id, title: title || `Section ${ctx.counter}`, text: '' };
  ctx.sections.push(section);
  ctx.toc.push({ id, title: section.title, level });
  ctx.current = section;
  const tag = level >= 3 ? 'h4' : level === 2 ? 'h3' : 'h2';
  return { id, html: `<section id="${id}"><${tag}>${escapeHtml(section.title)}</${tag}>` };
}

function renderList(node, ctx) {
  const ordered = (node.attrs['list-type'] || '').includes('order');
  const items = childrenOf(node, 'list-item')
    .map((item) => `<li>${inlineChildren(item)}</li>`)
    .join('');
  const nested = (node.children || [])
    .filter((child) => child.tag === 'list')
    .map((child) => renderBlock(child, ctx))
    .join('');
  return `<${ordered ? 'ol' : 'ul'}>${items}</${ordered ? 'ol' : 'ul'}>${nested}`;
}

function renderFigure(node) {
  const label = textOf(firstOf(node, 'label')).trim();
  const caption = textOf(firstOf(node, 'caption')).trim();
  if (!label && !caption) return '';
  return `<figure class="musee-jats-figure"><figcaption><strong>${escapeHtml(label)}</strong> ${escapeHtml(caption)}</figcaption></figure>`;
}

function renderBlock(node, ctx, level = 1) {
  switch (node.tag) {
    case 'sec': {
      const titleNode = firstOf(node, 'title');
      const title = textOf(titleNode).trim();
      const started = startSection(ctx, title, level);
      let html = started.html;
      for (const child of node.children || []) {
        if (child.tag === 'title') continue;
        html += renderBlock(child, ctx, level + 1);
      }
      return `${html}</section>`;
    }
    case 'p': {
      const text = textOf(node).replace(/\s+/g, ' ').trim();
      if (ctx.current) ctx.current.text += `${ctx.current.text ? '\n\n' : ''}${text}`;
      return `<p>${inlineChildren(node)}</p>`;
    }
    case 'list':
      return renderList(node, ctx);
    case 'fig':
    case 'table-wrap':
      return renderFigure(node);
    case 'disp-formula': {
      const text = textOf(node).replace(/\s+/g, ' ').trim();
      if (ctx.current && text) ctx.current.text += `${ctx.current.text ? '\n\n' : ''}${text}`;
      return `<div class="musee-jats-formula">${escapeHtml(text)}</div>`;
    }
    case 'title':
      return '';
    default:
      return (node.children || []).map((child) => renderBlock(child, ctx, level)).join('');
  }
}

function parseJats(xml, fallback) {
  const doc = parseXml(xml);
  const article = firstOf(doc, 'article') || doc;
  const front = firstOf(article, 'front');
  const meta = firstOf(front, 'article-meta');
  const title = textOf(firstOf(firstOf(meta, 'title-group'), 'article-title')).replace(/\s+/g, ' ').trim() || fallback.title;
  const authors = [];
  for (const contrib of descendants(meta, 'contrib')) {
    if (contrib.attrs['contrib-type'] && contrib.attrs['contrib-type'] !== 'author') continue;
    const name = firstOf(contrib, 'name');
    if (!name) continue;
    const surname = textOf(firstOf(name, 'surname')).trim();
    const given = textOf(firstOf(name, 'given-names')).trim();
    const value = [given, surname].filter(Boolean).join(' ');
    if (value) authors.push(value);
  }
  const ctx = createContext();
  let html = '';
  const abstract = firstOf(meta, 'abstract');
  if (abstract) {
    const started = startSection(ctx, textOf(firstOf(abstract, 'title')).trim() || 'Abstract', 1);
    html += started.html;
    for (const child of abstract.children || []) {
      if (child.tag === 'title') continue;
      html += renderBlock(child, ctx, 1);
    }
    html += '</section>';
  }
  const body = firstOf(article, 'body');
  let syntheticOpen = false;
  if (body) {
    for (const child of body.children || []) {
      if (child.tag === 'p' && !ctx.current) {
        const started = startSection(ctx, 'Introduction', 1);
        html += started.html;
        syntheticOpen = true;
        html += renderBlock(child, ctx, 1);
        continue;
      }
      if (child.tag === 'sec') {
        if (syntheticOpen) {
          html += '</section>';
          syntheticOpen = false;
        }
        html += renderBlock(child, ctx, 1);
        continue;
      }
      html += renderBlock(child, ctx, 1);
    }
    if (syntheticOpen) html += '</section>';
  }
  return {
    title,
    authors: authors.slice(0, 30).join(', '),
    html: `<div class="musee-jats">${html}</div>`,
    toc: ctx.toc,
    sections: ctx.sections.filter((section) => section.text.trim()),
  };
}

export function normalizeDoi(value = '') {
  return String(value)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim();
}

export function isDoi(value = '') {
  return /^10\.\d{4,9}\/\S+$/i.test(value);
}

function normalizeTitle(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function findRecord({ doi, title }) {
  const query = doi ? `DOI:"${doi.replace(/"/g, '')}"` : `TITLE:"${String(title || '').replace(/"/g, '')}"`;
  if (!doi && !title) return null;
  const params = new URLSearchParams({ query, format: 'json', resultType: 'core', pageSize: '3' });
  const data = await fetchJson(`${SEARCH}?${params.toString()}`);
  const results = data?.resultList?.result || [];
  return results.find((record) => record.pmcid && (record.isOpenAccess === 'Y' || record.inEPMC === 'Y')) || null;
}

export async function fetchPmcFulltext({ doi = '', title = '' } = {}) {
  const normalized = normalizeDoi(doi);
  const key = `pmc:${normalized || title}`;
  return cache.wrap(key, async () => {
    if (!normalized && !title) return { available: false, source: 'pmc', reason: '没有 DOI，无法查找 PMC 全文。' };
    let record;
    try {
      record = await findRecord({ doi: isDoi(normalized) ? normalized : '' });
      if (!record && title) record = await findRecord({ title });
    } catch (error) {
      return { available: false, source: 'pmc', reason: error?.message || 'Europe PMC 检索失败。' };
    }
    if (!record?.pmcid) {
      return { available: false, source: 'pmc', reason: 'Europe PMC 没有这篇论文的开放全文。' };
    }
    if (title && record.title) {
      const wanted = normalizeTitle(title);
      const found = normalizeTitle(record.title);
      if (wanted && found && wanted !== found && !wanted.includes(found) && !found.includes(wanted)) {
        return { available: false, source: 'pmc', reason: 'Europe PMC 的匹配结果与论文标题不一致。' };
      }
    }
    let xml;
    try {
      xml = await fetchText(`${FULLTEXT}/${encodeURIComponent(record.pmcid)}/fullTextXML`, { timeoutMs: 35000 });
    } catch (error) {
      return {
        available: false,
        source: 'pmc',
        pmcid: record.pmcid,
        absUrl: `https://europepmc.org/article/PMC/${record.pmcid}`,
        reason: error?.message || 'PMC 全文下载失败。',
      };
    }
    if (xml.length > 12 * 1024 * 1024) {
      return { available: false, source: 'pmc', reason: 'PMC 全文过大，已跳过。' };
    }
    try {
      const parsed = parseJats(xml, { title });
      if (!parsed.sections.length) {
        return { available: false, source: 'pmc', pmcid: record.pmcid, reason: 'PMC XML 中没有可读正文。' };
      }
      return {
        available: true,
        source: 'pmc',
        pmcid: record.pmcid,
        title: parsed.title || title,
        authors: parsed.authors,
        toc: parsed.toc,
        sections: parsed.sections,
        html: parsed.html,
        absUrl: `https://europepmc.org/article/PMC/${record.pmcid}`,
        pdfUrl: null,
        note: 'Europe PMC 开放全文；图、表未在文本视图内嵌。',
      };
    } catch (error) {
      return { available: false, source: 'pmc', reason: `PMC 全文解析失败：${error?.message || error}` };
    }
  });
}
