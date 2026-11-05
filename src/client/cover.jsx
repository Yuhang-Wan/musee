import { h } from './react.js';

const PALETTES = {
  urban: [
    ['#0b3b36', '#d97706'],
    ['#123f3a', '#65a30d'],
    ['#3f2d1e', '#ca8a04'],
  ],
  physics: [
    ['#111c44', '#6d28d9'],
    ['#1e1b4b', '#0e7490'],
    ['#2e1065', '#be185d'],
  ],
  ai: [
    ['#102a6b', '#0891b2'],
    ['#0b1220', '#2563eb'],
    ['#083344', '#0e7490'],
  ],
  conference: [
    ['#0b1120', '#dc2626'],
    ['#111827', '#d97706'],
    ['#071a2b', '#0e7490'],
  ],
};

function hash(value = '') {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

function paletteFor(kind, id) {
  const family = PALETTES[kind] || PALETTES.ai;
  return family[hash(id) % family.length];
}

/**
 * Original typographic cover art. Publisher cover images are copyrighted and
 * have no stable, licensed API, so Musee renders its own deterministic covers.
 */
export function JournalCover({ venue, kind = 'journal', size = 'md', issue = '' }) {
  const [from, to] = paletteFor(kind === 'conference' ? 'conference' : kind, venue?.id || venue?.name || '');
  const short = venue?.short || 'M';
  return h(
    'div',
    {
      className: `musee-cover musee-cover-${size}`,
      style: { '--cover-from': from, '--cover-to': to },
      'aria-hidden': 'true',
    },
    h('span', { className: 'musee-cover-spine' }),
    h('span', { className: 'musee-cover-glow' }),
    h('span', { className: 'musee-cover-short' }, short),
    h('span', { className: 'musee-cover-name' }, venue?.name || ''),
    h(
      'span',
      { className: 'musee-cover-foot' },
      h('span', null, issue || 'LATEST'),
      h('span', { className: 'musee-cover-mark' }, 'MUSEE'),
    ),
  );
}
