import assert from 'node:assert/strict';
import { cite } from '../src/host/cite.js';

const journalPaper = {
  id: 'doi:10.1177/00420980241234567',
  source: 'openalex',
  title: 'Urban heat islands and the geometry of care',
  abstract: 'Test abstract.',
  authors: ['Alice Zhang', 'Bob O. Smith', 'Carol Lee', 'Dan Wu'],
  year: 2024,
  doi: '10.1177/00420980241234567',
  url: 'https://doi.org/10.1177/00420980241234567',
  journal: { name: 'Urban Studies', issn: '0042-0980' },
  volume: '61',
  issue: '3',
  pages: '45-67',
};

const preprint = {
  id: 'arxiv:2401.12345',
  source: 'arxiv',
  title: 'Fast torque-limited motion planning',
  abstract: 'Test abstract.',
  authors: ['Balakumar Sundaralingam', 'Adithyavairavan Murali'],
  year: 2024,
  url: 'https://arxiv.org/abs/2401.12345',
  arxiv: { id: '2401.12345', primaryCategory: 'cs.RO' },
};

const gb = cite([journalPaper], 'gb');
assert.match(gb, /^\[1\] Alice Zhang, Bob O\. Smith, Carol Lee, 等\./);
assert.match(gb, /Urban Studies, 2024, 61\(3\): 45-67\./);
assert.match(gb, /DOI: 10\.1177\/00420980241234567\./);

const apa = cite([journalPaper], 'apa');
assert.match(apa, /^Zhang, A\., Smith, B\. O\., Lee, C\., & Wu, D\. \(2024\)\./);
assert.match(apa, /Urban Studies, 61\(3\), 45-67\./);

const mla = cite([journalPaper], 'mla');
assert.match(mla, /^Zhang, Alice, et al\./);
assert.match(mla, /vol\. 61, no\. 3, 2024, pp\. 45-67/);

const ieee = cite([journalPaper], 'ieee');
assert.match(ieee, /^\[1\] A\. Zhang, B\. O\. Smith, C\. Lee, and D\. Wu,/);
assert.match(ieee, /vol\. 61, no\. 3, pp\. 45-67, 2024, doi: 10\.1177\/00420980241234567\./);

const arxivGb = cite([preprint], 'gb');
assert.match(arxivGb, /arXiv: 2401\.12345/);

const bibtex = cite([journalPaper, preprint], 'bibtex');
assert.equal((bibtex.match(/^@/gm) || []).length, 2);
assert.match(bibtex, /pages = \{45--67\}/);
assert.match(bibtex, /eprint = \{2401\.12345\}/);

const ris = cite([journalPaper, preprint], 'ris');
assert.equal((ris.match(/^TY {2}- /gm) || []).length, 2);
assert.match(ris, /^ER {2}- $/m);
assert.match(ris, /DO {2}- 10\.1177\/00420980241234567/);

assert.throws(() => cite([journalPaper], 'unknown'), /不支持的引用格式/);
assert.ok(cite([], 'gb') === '');

console.log('cite tests ok');
