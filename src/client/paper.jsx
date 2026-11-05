import { Fragment, h, useEffect, useRef, useState } from './react.js';
import { tFormat } from './api.js';
import { Button, Empty, IconBack, IconBookmark, IconExternal, IconQuote, IconTranslate, Pill, Spinner } from './ui.jsx';

function tr(t, key, params) {
  return tFormat(t(key), params);
}

function shortAuthors(authors = []) {
  if (authors.length <= 3) return authors.join(', ');
  return `${authors.slice(0, 3).join(', ')} 等`;
}

export function PaperList({ papers, onOpen, libraryById, t, emptyTitle }) {
  if (!papers.length) return h(Empty, { title: emptyTitle || t('empty') });
  return h(
    'div',
    { className: 'musee-paper-list' },
    papers.map((paper) => {
      const saved = libraryById?.has(paper.id);
      return h(
        'button',
        { key: paper.id, type: 'button', className: 'musee-paper', onClick: () => onOpen(paper) },
        h('div', { className: 'musee-paper-title' }, paper.title),
        h(
          'div',
          { className: 'musee-paper-meta' },
          paper.journal?.name ? h('span', null, paper.journal.name) : paper.source === 'arxiv' ? h(Pill, { tone: 'brand' }, 'arXiv') : null,
          paper.year ? h('span', null, String(paper.year)) : null,
          paper.authors?.length ? h('span', null, shortAuthors(paper.authors)) : null,
          paper.openAccess ? h(Pill, { tone: 'success' }, t('paper.oa')) : null,
          paper.citedBy ? h('span', null, tr(t, 'paper.cited', { n: paper.citedBy })) : null,
          saved ? h(Pill, { tone: 'brand' }, t('paper.saved')) : null,
        ),
      );
    }),
  );
}

export function PaperDetail({ paper, item, t, onBack, onSave, onUpdate, onTranslate, translation, translating, onCite }) {
  const [mode, setMode] = useState('both');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('unread');
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const dirtyRef = useRef(false);

  useEffect(() => {
    setNote(item?.note || '');
    setTags((item?.tags || []).join(', '));
    setStatus(item?.status || 'unread');
    dirtyRef.current = false;
    setDirty(false);
    setSaveState('idle');
  }, [paper.id, item?.id]);

  useEffect(() => {
    if (!item || !dirty) return undefined;
    const timer = setTimeout(async () => {
      try {
        setSaveState('saving');
        await onUpdate(item.id, {
          note,
          tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        });
        dirtyRef.current = false;
        setDirty(false);
        setSaveState('saved');
      } catch {
        setSaveState('idle');
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [note, tags, dirty, item?.id]);

  const hasTranslation = Boolean(translation?.title || translation?.abstract);
  const showTranslated = hasTranslation && mode !== 'original';
  const showOriginal = !hasTranslation || mode !== 'translated';
  const title = paper.title;

  const metaRows = [];
  const addMeta = (key, label, value) => {
    if (value === undefined || value === null || value === '') return;
    metaRows.push(h(Fragment, { key }, h('dt', null, label), h('dd', null, value)));
  };
  addMeta('journal', t('paper.journal'), paper.journal?.name);
  addMeta('year', t('paper.year'), paper.year ? String(paper.year) : '');
  addMeta(
    'doi',
    t('paper.doi'),
    paper.doi
      ? h('a', { href: `https://doi.org/${paper.doi}`, target: '_blank', rel: 'noreferrer' }, paper.doi)
      : '',
  );
  addMeta('issn', t('paper.issn'), paper.journal?.issn);
  addMeta('volume', t('paper.volume'), paper.volume);
  addMeta('issue', t('paper.issue'), paper.issue);
  addMeta('pages', t('paper.pages'), paper.pages);
  addMeta(
    'arxiv',
    'arXiv',
    paper.source === 'arxiv' && paper.arxiv?.primaryCategory
      ? `${paper.arxiv.id} · ${paper.arxiv.primaryCategory}`
      : '',
  );

  return h(
    'div',
    { className: 'musee-article' },
    h('button', { type: 'button', className: 'musee-back', onClick: onBack }, h(IconBack), t('paper.back')),

    hasTranslation
      ? h(
          'div',
          { className: 'musee-seg', style: { marginTop: '14px' }, role: 'tablist' },
          h('button', { type: 'button', className: mode === 'original' ? 'active' : '', onClick: () => setMode('original') }, t('paper.original')),
          h('button', { type: 'button', className: mode === 'translated' ? 'active' : '', onClick: () => setMode('translated') }, t('paper.translated')),
          h('button', { type: 'button', className: mode === 'both' ? 'active' : '', onClick: () => setMode('both') }, t('paper.both')),
        )
      : null,

    h('h1', null, showTranslated && translation?.title ? translation.title : title),
    showTranslated && translation?.title && mode === 'both' ? h('div', { className: 'translated-title' }, title) : null,

    paper.authors?.length ? h('div', { className: 'musee-authors' }, paper.authors.join(' · ')) : null,

    h(
      'div',
      { className: 'musee-meta-line' },
      paper.journal?.name ? h('span', null, paper.journal.name) : paper.source === 'arxiv' ? h(Pill, { tone: 'brand' }, 'arXiv') : null,
      paper.year ? h('span', null, String(paper.year)) : null,
      paper.volume ? h('span', null, `${t('paper.volume')} ${paper.volume}`) : null,
      paper.issue ? h('span', null, `${t('paper.issue')} ${paper.issue}`) : null,
      paper.pages ? h('span', null, `${t('paper.pages')} ${paper.pages}`) : null,
      paper.openAccess ? h(Pill, { tone: 'success' }, t('paper.oa')) : null,
      paper.citedBy ? h('span', null, tr(t, 'paper.cited', { n: paper.citedBy })) : null,
    ),

    h(
      'div',
      { className: 'musee-actions' },
      h(
        Button,
        { variant: 'primary', active: Boolean(item), onClick: () => (item ? null : onSave(paper)), disabled: Boolean(item) },
        h(IconBookmark),
        item ? t('paper.saved') : t('paper.save'),
      ),
      h(
        Button,
        { onClick: () => onTranslate(paper), disabled: translating || Boolean(hasTranslation) },
        translating ? h(Spinner) : h(IconTranslate),
        translating ? t('paper.translating') : t('paper.translate'),
      ),
      h(Button, { onClick: () => onCite([item || paper]) }, h(IconQuote), t('paper.cite')),
      paper.url
        ? h('a', { className: 'musee-btn', href: paper.url, target: '_blank', rel: 'noreferrer' }, h(IconExternal), t('paper.open'))
        : null,
    ),

    h(
      'div',
      { className: 'musee-card' },
      h('h2', null, t('paper.abstract')),
      !paper.abstract && !hasTranslation ? h('div', { className: 'musee-empty', style: { padding: '14px 0' } }, t('paper.noAbstract')) : null,
      showOriginal && paper.abstract ? h('div', { className: 'musee-abstract' }, paper.abstract) : null,
      showTranslated && translation?.abstract
        ? h('div', { className: 'musee-translated' }, translation.abstract)
        : null,
    ),

    item
      ? h(
          'div',
          { className: 'musee-card' },
          h(
            'h2',
            null,
            t('paper.notes'),
            saveState === 'saving' ? h('span', { className: 'musee-hint' }, '…') : null,
            saveState === 'saved' ? h('span', { className: 'musee-hint' }, '✓') : null,
          ),
          h(
            'div',
            { className: 'musee-row' },
            h(
              'label',
              { className: 'musee-row', style: { gap: '8px' } },
              h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-secondary)' } }, t('paper.status')),
              h(
                'select',
                {
                  className: 'musee-select',
                  style: { width: 'auto' },
                  value: status,
                  onChange: (event) => {
                    const next = event.target.value;
                    setStatus(next);
                    onUpdate(item.id, { status: next }).catch(() => {});
                  },
                },
                h('option', { value: 'unread' }, t('status.unread')),
                h('option', { value: 'reading' }, t('status.reading')),
                h('option', { value: 'read' }, t('status.read')),
              ),
            ),
            h('div', { className: 'grow' }),
            h('span', { className: 'musee-save-state' }, saveState === 'saved' ? t('toast.updated') : ''),
          ),
          h(
            'div',
            { className: 'musee-field' },
            h('label', null, t('paper.tags')),
            h('input', {
              className: 'musee-input',
              value: tags,
              placeholder: t('paper.tagsHint'),
              onChange: (event) => {
                setTags(event.target.value);
                dirtyRef.current = true;
                setDirty(true);
              },
            }),
          ),
          h(
            'div',
            { className: 'musee-field' },
            h('textarea', {
              className: 'musee-textarea',
              value: note,
              placeholder: t('paper.notesHint'),
              onChange: (event) => {
                setNote(event.target.value);
                dirtyRef.current = true;
                setDirty(true);
              },
            }),
          ),
        )
      : h(
          'div',
          { className: 'musee-card' },
          h('h2', null, t('paper.notes')),
          h('div', { style: { color: 'var(--dsw-alias-label-secondary)', fontSize: '13px' } }, t('paper.notesHint')),
        ),

    h(
      'div',
      { className: 'musee-card' },
      h('h2', null, t('paper.meta')),
      h(
        'dl',
        { className: 'musee-meta-grid' },
        metaRows,
      ),
    ),
  );
}
