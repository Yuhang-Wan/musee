import { h, useEffect, useMemo, useRef, useState } from './react.js';
import { api, downloadExport, tFormat } from './api.js';
import { CSS } from './styles.js';
import { Button, Empty, ErrorBanner, IconBack, IconBook, IconSearch, Loading, Pill } from './ui.jsx';
import { PaperDetail, PaperList } from './paper.jsx';
import { LibraryView } from './library.jsx';
import { CitationDialog } from './citation.jsx';

function tr(t, key, params) {
  return tFormat(t(key), params);
}

function disciplineName(discipline, locale) {
  return discipline.name?.[locale] || discipline.name?.zh || discipline.name?.en || discipline.id;
}

export function App({ t, locale }) {
  const [boot, setBoot] = useState(null);
  const [bootError, setBootError] = useState('');
  const [discipline, setDiscipline] = useState('urban');
  const [view, setView] = useState({ kind: 'discover' });
  const [papers, setPapers] = useState([]);
  const [listState, setListState] = useState('idle');
  const [listError, setListError] = useState('');
  const [listTitle, setListTitle] = useState('');
  const [library, setLibrary] = useState([]);
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [citation, setCitation] = useState(null);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [paperFrom, setPaperFrom] = useState({ kind: 'discover' });
  const mainRef = useRef(null);
  const toastTimer = useRef(null);
  const translationsRef = useRef(new Map());
  const listRetryRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };

  const errorText = (error) => (error?.message === 'NO_TOKEN' ? t('error.noToken') : error?.message || String(error));

  useEffect(() => {
    let alive = true;
    api
      .bootstrap()
      .then((data) => {
        if (alive) setBoot(data);
      })
      .catch((error) => {
        if (alive) setBootError(errorText(error));
      });
    api
      .library()
      .then((data) => {
        if (alive) setLibrary(data.items || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const libraryById = useMemo(() => new Map(library.map((item) => [item.id, item])), [library]);
  const currentDiscipline = boot?.disciplines.find((entry) => entry.id === discipline) || null;

  const scrollTop = () => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  };

  const loadList = (loader, title) => {
    setListTitle(title);
    setListState('loading');
    setListError('');
    listRetryRef.current = () => loadList(loader, title);
    scrollTop();
    loader()
      .then((data) => {
        setPapers(data.papers || []);
        setListState('ready');
      })
      .catch((error) => {
        setListError(errorText(error));
        setListState('error');
      });
  };

  const openJournal = (journal) => {
    setView({ kind: 'journal', journal });
    loadList(() => api.journal(journal.id), journal.name);
  };

  const openArxiv = (category) => {
    setView({ kind: 'arxiv', category });
    loadList(() => api.arxiv(category), tr(t, 'arxiv.title', { category }));
  };

  const runSearch = (text) => {
    const q = String(text || '').trim();
    if (!q) return;
    setQuery(q);
    setView({ kind: 'search', q });
    loadList(() => api.search(q), tr(t, 'search.title', { q }));
  };

  const openPaper = (paper) => {
    if (view.kind !== 'paper') setPaperFrom(view);
    setView({ kind: 'paper', paper });
    setTranslation(translationsRef.current.get(paper.id) || null);
    scrollTop();
  };

  const goDiscover = () => {
    setView({ kind: 'discover' });
    scrollTop();
  };

  const goLibrary = () => {
    setView({ kind: 'library' });
    scrollTop();
  };

  const backToList = () => {
    setView(paperFrom || { kind: 'discover' });
    scrollTop();
  };

  const savePaper = async (paper) => {
    try {
      const data = await api.save(paper);
      setLibrary(data.items || []);
      showToast(t('toast.saved'));
    } catch (error) {
      showToast(errorText(error));
    }
  };

  const updateItem = async (id, patch) => {
    setLibrary((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    try {
      const data = await api.update(id, patch);
      setLibrary(data.items || []);
      return data;
    } catch (error) {
      showToast(errorText(error));
      throw error;
    }
  };

  const removeItem = async (item) => {
    try {
      const data = await api.remove(item.id);
      setLibrary(data.items || []);
      showToast(t('toast.removed'));
    } catch (error) {
      showToast(errorText(error));
    }
  };

  const translatePaper = async (paper) => {
    setTranslating(true);
    try {
      const data = await api.translate(paper.title, paper.abstract);
      translationsRef.current.set(paper.id, data);
      setTranslation(data);
    } catch (error) {
      showToast(tr(t, 'toast.translateFailed', { message: errorText(error) }));
    } finally {
      setTranslating(false);
    }
  };

  const exportLibrary = (format, filename) => downloadExport(format, filename);

  const renderList = () => {
    if (listState === 'loading') return h(Loading, { label: t('loading') });
    if (listState === 'error') return h(ErrorBanner, { message: listError, onRetry: listRetryRef.current, retryLabel: t('error.retry') });
    return h(PaperList, { papers, onOpen: openPaper, libraryById, t, emptyTitle: t('empty') });
  };

  const renderMain = () => {
    if (view.kind === 'paper') {
      return h(PaperDetail, {
        paper: view.paper,
        item: libraryById.get(view.paper.id),
        t,
        onBack: backToList,
        onSave: savePaper,
        onUpdate: updateItem,
        onTranslate: translatePaper,
        translation,
        translating,
        onCite: (items) => setCitation({ papers: items }),
      });
    }

    if (view.kind === 'library') {
      return h(LibraryView, {
        items: library,
        t,
        onOpen: openPaper,
        onRemove: removeItem,
        onCite: (items) => setCitation({ papers: items }),
        onExport: exportLibrary,
        showToast,
      });
    }

    if (view.kind === 'discover') {
      const journals = currentDiscipline?.journals || [];
      return h(
        'div',
        { className: 'musee-page' },
        h('div', { className: 'musee-hero' }, h('h1', null, t('discover.title')), h('p', null, t('discover.subtitle'))),
        h(
          'div',
          { className: 'musee-row', style: { marginTop: '18px' } },
          h(
            'div',
            { className: 'musee-seg', role: 'tablist' },
            (boot?.disciplines || []).map((entry) =>
              h(
                'button',
                {
                  key: entry.id,
                  type: 'button',
                  className: discipline === entry.id ? 'active' : '',
                  onClick: () => setDiscipline(entry.id),
                },
                disciplineName(entry, locale),
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: 'musee-section' },
          h('div', { className: 'musee-section-head' }, h('h2', null, t('discover.journals')), h('span', null, currentDiscipline?.blurb?.[locale] || currentDiscipline?.blurb?.zh || '')),
          h(
            'div',
            { className: 'musee-grid' },
            journals.map((journal) =>
              h(
                'button',
                { key: journal.id, type: 'button', className: 'musee-journal', onClick: () => openJournal(journal) },
                h('div', { className: 'musee-journal-name' }, journal.name),
                h('div', { className: 'musee-journal-meta' }, h('span', null, journal.issn), h('span', null, '→')),
              ),
            ),
          ),
        ),
        h(
          'div',
          { className: 'musee-section' },
          h('div', { className: 'musee-section-head' }, h('h2', null, t('discover.arxiv')), h('span', null, t('arxiv.hint'))),
          h(
            'div',
            { className: 'musee-arxiv-row' },
            (currentDiscipline?.arxiv || []).map((category) =>
              h(Button, { key: category, onClick: () => openArxiv(category) }, category),
            ),
          ),
        ),
      );
    }

    return h(
      'div',
      { className: 'musee-page' },
      h('button', { type: 'button', className: 'musee-back', onClick: goDiscover }, h(IconBack), t('discover.title')),
      h('div', { className: 'musee-hero', style: { marginTop: '12px' } }, h('h1', null, listTitle)),
      view.kind === 'journal' ? h('p', { style: { margin: '6px 0 0', color: 'var(--dsw-alias-label-secondary)', fontSize: '12px' } }, view.journal.issn) : null,
      h('div', { style: { marginTop: '18px' } }, renderList()),
    );
  };

  if (bootError) {
    return h(
      'div',
      { className: 'musee-root' },
      h('style', null, CSS),
      h(
        'div',
        { style: { maxWidth: '640px', margin: '80px auto', padding: '0 24px' } },
        h(ErrorBanner, {
          message: bootError,
          onRetry: () => window.location.reload(),
          retryLabel: t('error.refresh') || 'Refresh',
        }),
      ),
    );
  }

  if (!boot) {
    return h(
      'div',
      { className: 'musee-root' },
      h('style', null, CSS),
      h('div', { style: { margin: '80px auto' } }, h(Loading, { label: t('loading') })),
    );
  }

  return h(
    'div',
    { className: 'musee-root' },
    h('style', null, CSS),
    h(
      'header',
      { className: 'musee-header' },
      h(
        'button',
        { type: 'button', className: 'musee-brand', onClick: goDiscover, style: { border: 0, background: 'transparent', cursor: 'pointer', padding: 0 } },
        h('span', { className: 'musee-brand-mark' }, h(IconBook, { size: 17 })),
        h('span', { className: 'musee-brand-name' }, t('brand')),
      ),
      h('span', { className: 'musee-tagline' }, t('tagline')),
      h(
        'nav',
        { className: 'musee-nav' },
        h('button', { type: 'button', className: `musee-nav-btn ${view.kind !== 'library' ? 'active' : ''}`, onClick: goDiscover }, t('nav.discover')),
        h(
          'button',
          { type: 'button', className: `musee-nav-btn ${view.kind === 'library' ? 'active' : ''}`, onClick: goLibrary },
          t('nav.library'),
          library.length ? h('span', { className: 'musee-nav-count' }, String(library.length)) : null,
        ),
      ),
      h(
        'form',
        {
          className: 'musee-search',
          onSubmit: (event) => {
            event.preventDefault();
            runSearch(query);
          },
        },
        h('input', {
          value: query,
          onChange: (event) => setQuery(event.target.value),
          placeholder: t('search.placeholder'),
          'aria-label': t('search.placeholder'),
        }),
        h(Button, { size: 'sm', onClick: () => runSearch(query), 'aria-label': t('search.placeholder') }, h(IconSearch)),
      ),
    ),

    h(
      'div',
      { className: 'musee-body' },
      h(
        'aside',
        { className: 'musee-rail' },
        h('div', { className: 'musee-rail-title' }, t('discover.title')),
        h(
          'div',
          { className: 'musee-rail-group' },
          (boot.disciplines || []).map((entry) =>
            h(
              'button',
              {
                key: entry.id,
                type: 'button',
                className: `musee-rail-item ${discipline === entry.id ? 'active' : ''}`,
                onClick: () => {
                  setDiscipline(entry.id);
                  goDiscover();
                },
              },
              disciplineName(entry, locale),
            ),
          ),
        ),
        h('div', { className: 'musee-rail-title' }, t('discover.journals')),
        h(
          'div',
          { className: 'musee-rail-group' },
          (currentDiscipline?.journals || []).map((journal) =>
            h(
              'button',
              {
                key: journal.id,
                type: 'button',
                className: `musee-rail-item ${view.kind === 'journal' && view.journal.id === journal.id ? 'active' : ''}`,
                onClick: () => openJournal(journal),
                title: journal.name,
              },
              journal.name,
              h('span', { className: 'musee-rail-sub' }, journal.issn),
            ),
          ),
        ),
        h('div', { className: 'musee-rail-title' }, 'arXiv'),
        h(
          'div',
          { className: 'musee-rail-group' },
          (currentDiscipline?.arxiv || []).map((category) =>
            h(
              'button',
              {
                key: category,
                type: 'button',
                className: `musee-rail-item ${view.kind === 'arxiv' && view.category === category ? 'active' : ''}`,
                onClick: () => openArxiv(category),
              },
              category,
            ),
          ),
        ),
      ),
      h('main', { className: 'musee-main', ref: mainRef }, renderMain()),
    ),

    citation ? h(CitationDialog, { papers: citation.papers, t, onClose: () => setCitation(null), showToast }) : null,
    toast ? h('div', { className: 'musee-toast', role: 'status' }, toast) : null,
  );
}
