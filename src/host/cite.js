const FORMATS = new Set(['gb', 'apa', 'mla', 'ieee', 'bibtex', 'ris']);

function kindOf(paper) {
  if (paper.kind) return paper.kind;
  if (paper.source === 'arxiv') return 'preprint';
  return 'journal';
}

function splitName(name = '') {
  const clean = String(name).replace(/\s+/g, ' ').trim();
  if (!clean) return { family: '', given: '' };
  if (clean.includes(',')) {
    const [family, ...rest] = clean.split(',');
    return { family: family.trim(), given: rest.join(' ').trim() };
  }
  const parts = clean.split(' ');
  if (parts.length === 1) return { family: parts[0], given: '' };
  return { family: parts.pop(), given: parts.join(' ') };
}

function initials(given = '') {
  return given
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .map((part) => (part ? `${part[0].toUpperCase()}.` : ''))
        .join('-'),
    )
    .join(' ');
}

function familyOf(paper) {
  return splitName(paper.authors?.[0] || '').family || 'anon';
}

function ascii(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

function authorApa(name) {
  const { family, given } = splitName(name);
  if (!given) return family;
  return `${family}, ${initials(given)}`;
}

function authorsApa(authors = []) {
  const names = authors.map(authorApa).filter(Boolean);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, & ${names[names.length - 1]}`;
}

function authorsMla(authors = []) {
  if (authors.length === 0) return '';
  const first = splitName(authors[0]);
  const lead = first.given ? `${first.family}, ${first.given}` : first.family;
  if (authors.length === 1) return lead;
  if (authors.length === 2) {
    const second = splitName(authors[1]);
    return `${lead}, and ${second.given ? `${second.given} ${second.family}` : second.family}`;
  }
  return `${lead}, et al`;
}

function authorsIeee(authors = []) {
  const names = authors.map((name) => {
    const { family, given } = splitName(name);
    return given ? `${initials(given)} ${family}` : family;
  });
  if (names.length <= 1) return names[0] || '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function authorsGb(authors = []) {
  if (authors.length === 0) return '';
  if (authors.length > 3) return `${authors.slice(0, 3).join(', ')}, 等`;
  return authors.join(', ');
}

function venue(paper) {
  if (paper.journal?.name) return paper.journal.name;
  if (paper.arxiv?.journalRef) return paper.arxiv.journalRef;
  if (paper.source === 'arxiv') return `arXiv preprint arXiv:${paper.arxiv?.id || ''}`;
  return '';
}

function volumeIssue(paper, separator = ', ') {
  const volume = paper.volume ? `第${paper.volume}卷` : '';
  return [volume, paper.issue ? `第${paper.issue}期` : ''].filter(Boolean).join(separator);
}

function pages(paper) {
  return paper.pages || '';
}

function doiSuffix(paper) {
  return paper.doi ? ` DOI: ${paper.doi}.` : '';
}

function gb(paper) {
  const title = paper.title || '';
  const where = venue(paper);
  const kind = kindOf(paper);
  if (kind === 'preprint') {
    return `${authorsGb(paper.authors)}. ${title}[J/OL]. arXiv: ${paper.arxiv?.id || ''}, ${paper.year || ''}. ${paper.url || ''}`.trim();
  }
  if (!where) {
    return `${authorsGb(paper.authors)}. ${title}[EB/OL]. ${paper.year || ''}. ${paper.url || ''}`.trim();
  }
  const year = paper.year ? String(paper.year) : '';
  const volume = paper.volume ? `${paper.volume}${paper.issue ? `(${paper.issue})` : ''}` : paper.issue ? `(${paper.issue})` : '';
  const place = [year, volume].filter(Boolean).join(', ');
  const tail = pages(paper) ? `: ${pages(paper)}` : '';
  const marker = kind === 'conference' ? '[C]' : '[J]';
  return `${authorsGb(paper.authors)}. ${title}${marker}. ${where}, ${place}${tail}.${doiSuffix(paper)}`.replace(/,\s*\./g, '.');
}

function apa(paper) {
  const kind = kindOf(paper);
  const year = paper.year ? `(${paper.year}).` : '(n.d.).';
  const where = venue(paper);
  const volume = paper.volume || '';
  const issue = paper.issue ? `(${paper.issue})` : '';
  const tail = pages(paper) ? `, ${pages(paper)}` : '';
  const link = paper.doi ? `https://doi.org/${paper.doi}` : paper.url || '';
  if (kind === 'preprint') {
    return `${authorsApa(paper.authors)} ${year} ${paper.title}. arXiv. ${paper.url || ''}`.trim();
  }
  if (kind === 'conference') {
    const pp = pages(paper) ? ` (pp. ${pages(paper)})` : '';
    return `${authorsApa(paper.authors)} ${year} ${paper.title}. In ${where}${pp}. ${link}`.replace(/\s+/g, ' ').trim();
  }
  const journalPart = where ? `${where}${volume ? `, ${volume}` : ''}${issue}${tail}.` : '';
  return `${authorsApa(paper.authors)} ${year} ${paper.title}. ${journalPart} ${link}`.replace(/\s+/g, ' ').trim();
}

function mla(paper) {
  const kind = kindOf(paper);
  const year = paper.year ? String(paper.year) : 'n.d.';
  const where = venue(paper);
  const vol = paper.volume ? `vol. ${paper.volume}` : '';
  const no = paper.issue ? `no. ${paper.issue}` : '';
  const pp = pages(paper) ? `pp. ${pages(paper)}` : '';
  const details = [vol, no, year, pp].filter(Boolean).join(', ');
  const doi = paper.doi ? `DOI: ${paper.doi}.` : paper.url || '';
  if (!where) return `${authorsMla(paper.authors)}. "${paper.title}." ${year}. ${doi}`.trim();
  if (kind === 'conference') {
    return `${authorsMla(paper.authors)}. "${paper.title}." ${where}, ${[year, pp].filter(Boolean).join(', ')}. ${doi}`.replace(/\s+/g, ' ').trim();
  }
  return `${authorsMla(paper.authors)}. "${paper.title}." ${where}, ${details}. ${doi}`.replace(/\s+/g, ' ').trim();
}

function ieee(paper, index = 1) {
  const kind = kindOf(paper);
  const where = venue(paper);
  const vol = paper.volume ? `vol. ${paper.volume}` : '';
  const no = paper.issue ? `no. ${paper.issue}` : '';
  const pp = pages(paper) ? `pp. ${pages(paper)}` : '';
  const details = [vol, no, pp, paper.year ? String(paper.year) : ''].filter(Boolean).join(', ');
  const tail = paper.doi ? `, doi: ${paper.doi}.` : '.';
  if (!where) return `[${index}] ${authorsIeee(paper.authors)}, "${paper.title}," ${paper.year || ''}${tail}`.replace(/\s+/g, ' ').trim();
  const inPrefix = kind === 'conference' ? 'in ' : '';
  return `[${index}] ${authorsIeee(paper.authors)}, "${paper.title}," ${inPrefix}${where}, ${details}${tail}`.replace(/\s+/g, ' ').trim();
}

export function bibtexKey(paper) {
  const first = ascii(familyOf(paper)) || 'anon';
  const year = paper.year || 'nd';
  const word = ascii(String(paper.title || '').split(/\s+/).find((part) => part.length > 2) || 'work');
  return `${first}${year}${word}`.toLowerCase();
}

function bibValue(value = '') {
  return String(value).replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

export function toBibtex(papers = []) {
  return papers
    .map((paper) => {
      const kind = kindOf(paper);
      if (kind === 'preprint') {
        return [
          `@misc{${bibtexKey(paper)},`,
          `  title = {${bibValue(paper.title)}},`,
          paper.authors?.length ? `  author = {${paper.authors.map(bibValue).join(' and ')}},` : '',
          `  year = {${paper.year || ''}},`,
          `  eprint = {${paper.arxiv?.id || ''}},`,
          `  archivePrefix = {arXiv},`,
          paper.arxiv?.primaryCategory ? `  primaryClass = {${paper.arxiv.primaryCategory}},` : '',
          paper.doi ? `  doi = {${paper.doi}},` : '',
          `  url = {${paper.url || ''}},`,
          '}',
        ]
          .filter(Boolean)
          .join('\n');
      }
      if (kind === 'conference') {
        return [
          `@inproceedings{${bibtexKey(paper)},`,
          `  title = {${bibValue(paper.title)}},`,
          paper.authors?.length ? `  author = {${paper.authors.map(bibValue).join(' and ')}},` : '',
          `  booktitle = {${bibValue(venue(paper))}},`,
          `  year = {${paper.year || ''}},`,
          paper.pages ? `  pages = {${paper.pages.replace(/-/g, '--')}},` : '',
          paper.doi ? `  doi = {${paper.doi}},` : '',
          `  url = {${paper.url || ''}},`,
          '}',
        ]
          .filter(Boolean)
          .join('\n');
      }
      return [
        `@article{${bibtexKey(paper)},`,
        `  title = {${bibValue(paper.title)}},`,
        paper.authors?.length ? `  author = {${paper.authors.map(bibValue).join(' and ')}},` : '',
        paper.journal?.name ? `  journal = {${bibValue(paper.journal.name)}},` : '',
        `  year = {${paper.year || ''}},`,
        paper.volume ? `  volume = {${paper.volume}},` : '',
        paper.issue ? `  number = {${paper.issue}},` : '',
        paper.pages ? `  pages = {${paper.pages.replace(/-/g, '--')}},` : '',
        paper.doi ? `  doi = {${paper.doi}},` : '',
        `  url = {${paper.url || ''}},`,
        '}',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
}

export function toRis(papers = []) {
  return papers
    .map((paper) => {
      const kind = kindOf(paper);
      const lines = [kind === 'conference' ? 'TY  - CONF' : kind === 'preprint' ? 'TY  - GEN' : 'TY  - JOUR'];
      for (const author of paper.authors || []) lines.push(`AU  - ${author}`);
      lines.push(`TI  - ${paper.title || ''}`);
      if (kind === 'conference') lines.push(`T2  - ${venue(paper)}`);
      else if (paper.journal?.name) lines.push(`JO  - ${paper.journal.name}`);
      if (kind === 'preprint') lines.push(`PB  - arXiv`);
      if (paper.year) lines.push(`PY  - ${paper.year}`);
      if (paper.volume) lines.push(`VL  - ${paper.volume}`);
      if (paper.issue) lines.push(`IS  - ${paper.issue}`);
      if (paper.pages) {
        const [start, end] = String(paper.pages).split('-');
        lines.push(`SP  - ${start || ''}`);
        if (end) lines.push(`EP  - ${end}`);
      }
      if (paper.doi) lines.push(`DO  - ${paper.doi}`);
      if (paper.url) lines.push(`UR  - ${paper.url}`);
      lines.push('ER  - ');
      return lines.join('\n');
    })
    .join('\n\n');
}

export function cite(papers, format = 'gb') {
  if (!FORMATS.has(format)) throw new Error(`不支持的引用格式: ${format}`);
  if (format === 'bibtex') return toBibtex(papers);
  if (format === 'ris') return toRis(papers);
  if (format === 'gb') return papers.map((paper, i) => `[${i + 1}] ${gb(paper)}`).join('\n');
  if (format === 'apa') return papers.map(apa).join('\n\n');
  if (format === 'mla') return papers.map(mla).join('\n\n');
  return papers.map((paper, i) => ieee(paper, i + 1)).join('\n');
}
