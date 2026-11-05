import { h, useMemo, useState } from './react.js';
import { tFormat } from './api.js';
import { Button, Empty, Pill } from './ui.jsx';

const FILTERS = [
  ['all', 'library.filterAll'],
  ['unread', 'status.unread'],
  ['reading', 'status.reading'],
  ['read', 'status.read'],
];

function statusTone(status) {
  if (status === 'read') return 'success';
  if (status === 'reading') return 'brand';
  return '';
}

export function LibraryView({ items, t, onOpen, onRemove, onCite, onExport, showToast }) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(() => new Set());

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => (item.status || 'unread') === filter)),
    [items, filter],
  );

  const selectedItems = useMemo(() => items.filter((item) => selected.has(item.id)), [items, selected]);

  const toggle = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((current) => {
      const allSelected = filtered.length > 0 && filtered.every((item) => current.has(item.id));
      if (allSelected) return new Set();
      return new Set(filtered.map((item) => item.id));
    });
  };

  const exportWith = async (format, filename) => {
    try {
      await onExport(format, filename);
      showToast(t('toast.updated'));
    } catch (error) {
      showToast(error.message);
    }
  };

  return h(
    'div',
    { className: 'musee-page' },
    h('div', { className: 'musee-hero' }, h('h1', null, t('library.title')), h('p', null, t('library.subtitle'))),

    h(
      'div',
      { className: 'musee-row', style: { marginTop: '18px' } },
      h(
        'div',
        { className: 'musee-seg', role: 'tablist' },
        FILTERS.map(([id, label]) =>
          h('button', { key: id, type: 'button', className: filter === id ? 'active' : '', onClick: () => setFilter(id) }, t(label)),
        ),
      ),
      h('div', { style: { flex: 1 } }),
      filtered.length
        ? h('button', { type: 'button', className: 'musee-back', onClick: toggleAll }, t('library.selectAll'))
        : null,
    ),

    !items.length
      ? h(Empty, { title: t('library.empty') })
      : !filtered.length
        ? h(Empty, { title: t('empty') })
        : h(
            'div',
            { className: 'musee-lib-list', style: { marginTop: '14px' } },
            filtered.map((item) =>
              h(
                'div',
                { key: item.id, className: 'musee-lib-row' },
                h('input', {
                  type: 'checkbox',
                  className: 'musee-check',
                  checked: selected.has(item.id),
                  onChange: () => toggle(item.id),
                  'aria-label': item.title,
                }),
                h(
                  'div',
                  { className: 'musee-lib-main', onClick: () => onOpen(item), role: 'button', tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter') onOpen(item); } },
                  h('div', { className: 'musee-lib-title' }, item.title),
                  h(
                    'div',
                    { className: 'musee-lib-meta' },
                    item.journal?.name ? h('span', null, item.journal.name) : item.source === 'arxiv' ? h(Pill, { tone: 'brand' }, 'arXiv') : null,
                    item.year ? h('span', null, String(item.year)) : null,
                    h(Pill, { tone: statusTone(item.status) }, t(`status.${item.status || 'unread'}`)),
                    item.tags?.length ? h('span', null, item.tags.join(' · ')) : null,
                    item.note ? h('span', null, tFormat(t('library.notesCount'), { n: item.note.length })) : null,
                  ),
                  item.note ? h('div', { className: 'musee-lib-note' }, item.note.replace(/\s+/g, ' ').slice(0, 120)) : null,
                ),
                h('button', { type: 'button', className: 'musee-btn ghost sm', onClick: () => onRemove(item) }, t('library.remove')),
              ),
            ),
          ),

    selected.size
      ? h(
          'div',
          { className: 'musee-batchbar' },
          h('strong', null, tFormat(t('library.selected'), { n: selected.size })),
          h(Button, { variant: 'primary', size: 'sm', onClick: () => onCite(selectedItems) }, t('library.cite')),
          h(Button, { size: 'sm', onClick: () => exportWith('bibtex', 'musee-library.bib') }, t('library.exportBibtex')),
          h(Button, { size: 'sm', onClick: () => exportWith('ris', 'musee-library.ris') }, t('library.exportRis')),
          h(Button, { size: 'sm', onClick: () => exportWith('md', 'musee-library.md') }, t('library.exportMd')),
          h(Button, { variant: 'danger', size: 'sm', onClick: async () => { for (const item of selectedItems) await onRemove(item); setSelected(new Set()); } }, t('library.remove')),
          h('button', { type: 'button', className: 'musee-back', onClick: () => setSelected(new Set()) }, t('library.clear')),
        )
      : null,
  );
}
