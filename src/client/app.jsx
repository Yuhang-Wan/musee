import { h, useEffect, useMemo, useRef, useState } from './react.js';
import { api, downloadExport, tFormat } from './api.js';
import { CSS } from './styles.js';
import { Button, Empty, ErrorBanner, IconBack, IconBook, IconSearch, IconSettings, IconStar, Loading, Pill, Spinner } from './ui.jsx';
import { PaperDetail, PaperList } from './paper.jsx';
import { LibraryView } from './library.jsx';
import { CitationDialog } from './citation.jsx';
import { JournalCover } from './cover.jsx';
import { SettingsDialog } from './settings.jsx';
import { Reader } from './reader.jsx';
import { Home } from './home.jsx';
import { PdfViewer } from './pdf.jsx';

function tr(t, key, params) {
  return tFormat(t(key), params);
}

function disciplineName(discipline, lang) {
  return discipline.name?.[lang] || discipline.name?.en || discipline.id;
}

function localizedName(venue, lang) {
  if (!venue || lang === 'en') return '';
  return (lang === 'zh' ? venue.nameZh : venue.nameFr) || '';
}

function localizedAbout(venue, lang) {
  if (!venue) return '';
  if (lang === 'zh') return venue.aboutZh || venue.about || '';
  if (lang === 'fr') return venue.aboutFr || venue.about || '';
  return venue.about || '';
}

function issueLabel(paper) {
  if (!paper) return '';
  const volume = paper.volume ? `Vol. ${paper.volume}` : '';
  const issue = paper.issue ? `No. ${paper.issue}` : '';
  return [volume, issue, paper.year].filter(Boolean).join(' ');
}

function seriesLabel(series) {
  if (series === 'nature') return 'Nature';
  if (series === 'science') return 'Science';
  if (series === 'cell') return 'Cell';
  return '';
}

export function App({ t, lang, setLang, targetLang, setTargetLang, translateTitles, setTranslateTitles }) {
  const [boot, setBoot] = useState(null);
  const [bootError, setBootError] = useState('');
  const [discipline, setDiscipline] = useState('urban');
  const [view, setView] = useState({ kind: 'home' });
  const [followed, setFollowed] = useState(() => new Set());
  const [homeFeed, setHomeFeed] = useState([]);
  const [homeState, setHomeState] = useState('idle');
  const [homeError, setHomeError] = useState('');
  const [papers, setPapers] = useState([]);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [listState, setListState] = useState('idle');
  const [listError, setListError] = useState('');
  const [listTitle, setListTitle] = useState('');
  const [journalYears, setJournalYears] = useState([]);
  const [journalTotal, setJournalTotal] = useState(0);
  const [journalYear, setJournalYear] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [titleTranslations, setTitleTranslations] = useState({});
  const [library, setLibrary] = useState([]);
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [citation, setCitation] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [query, setQuery] = useState('');
  const [paperFrom, setPaperFrom] = useState({ kind: 'discover' });
  const mainRef = useRef(null);
  const toastTimer = useRef(null);
  const translationsRef = useRef(new Map());
  const titleCacheRef = useRef(new Map());
  const titlePendingRef = useRef(new Set());
  const journalOffsetRef = useRef(0);
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
        if (alive) {
          setBoot(data);
          setFollowed(new Set(data.followedJournals || []));
        }
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

  const autoTranslateTitles = (list) => {
    if (!translateTitles || lang === 'en' || !boot?.llm || !Array.isArray(list)) return;
    const additions = {};
    const pending = [];
    for (const paper of list) {
      if (!paper?.title) continue;
      const key = `${targetLang}|${paper.title}`;
      const cached = titleCacheRef.current.get(key);
      if (cached) {
        additions[paper.id] = cached;
        continue;
      }
      if (titlePendingRef.current.has(key)) continue;
      titlePendingRef.current.add(key);
      pending.push({ id: paper.id, title: paper.title, key });
    }
    if (Object.keys(additions).length) {
      setTitleTranslations((prev) => ({ ...prev, ...additions }));
    }
    if (!pending.length) return;
    api
      .translateTitles(pending.map((entry) => entry.title), targetLang)
      .then((data) => {
        const fresh = {};
        (data.translations || []).forEach((text, index) => {
          const entry = pending[index];
          if (!entry || !text) return;
          titleCacheRef.current.set(entry.key, text);
          fresh[entry.id] = text;
        });
        if (Object.keys(fresh).length) setTitleTranslations((prev) => ({ ...prev, ...fresh }));
      })
      .catch(() => {})
      .finally(() => {
        for (const entry of pending) titlePendingRef.current.delete(entry.key);
      });
  };

  const loadHome = async () => {
    if (!boot) return;
    setHomeState('loading');
    setHomeError('');
    try {
      const data = await api.home();
      const feed = data.journals || [];
      setHomeFeed(feed);
      setHomeState('ready');
      autoTranslateTitles(feed.flatMap((entry) => entry.papers || []));
    } catch (error) {
      setHomeError(errorText(error));
      setHomeState('error');
    }
  };

  useEffect(() => {
    if (boot) loadHome();
  }, [boot]);

  useEffect(() => {
    setTitleTranslations({});
  }, [lang, targetLang, translateTitles]);

  useEffect(() => {
    if (!translateTitles || lang === 'en') return;
    autoTranslateTitles(papers);
  }, [papers, lang, targetLang, translateTitles, boot?.llm]);

  const scrollTop = () => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  };

  const loadList = (loader, title, onData) => {
    setListTitle(title);
    setListState('loading');
    setListError('');
    listRetryRef.current = () => loadList(loader, title, onData);
    scrollTop();
    loader()
      .then((data) => {
        setPapers(data.papers || []);
        if (onData) onData(data);
        setListState('ready');
      })
      .catch((error) => {
        setListError(errorText(error));
        setListState('error');
      });
  };

  const loadJournal = (journal, year = null, append = false) => {
    setView({ kind: 'journal', journal });
    setSourceInfo(null);
    setListTitle(journal.name);
    setJournalYear(year);
    setListError('');
    listRetryRef.current = () => loadJournal(journal, year, false);
    if (!append) {
      setPapers([]);
      setListState('loading');
      scrollTop();
    } else {
      setLoadingMore(true);
    }
    const limit = 20;
    const offset = append ? journalOffsetRef.current : 0;
    api
      .journal(journal.id, { limit, offset, year })
      .then((data) => {
        journalOffsetRef.current = offset + limit;
        setPapers((prev) => (append ? [...prev, ...(data.papers || [])] : data.papers || []));
        setSourceInfo(data.source || null);
        setJournalYears(data.years || []);
        setJournalTotal(data.total || 0);
        setListState('ready');
        autoTranslateTitles(data.papers || []);
      })
      .catch((error) => {
        setListError(errorText(error));
        setListState('error');
      })
      .finally(() => setLoadingMore(false));
  };

  const openJournal = (journal) => loadJournal(journal, null, false);

  const openConference = (conference) => {
    setView({ kind: 'conference', conference });
    setSourceInfo(null);
    loadList(() => api.conference(conference.id), conference.name);
  };

  const openArxiv = (category) => {
    setView({ kind: 'arxiv', category });
    setSourceInfo(null);
    loadList(() => api.arxiv(category), tr(t, 'arxiv.title', { category }));
  };

  const runSearch = (text) => {
    const q = String(text || '').trim();
    if (!q) return;
    setQuery(q);
    setView({ kind: 'search', q });
    setSourceInfo(null);
    loadList(() => api.search(q), tr(t, 'search.title', { q }));
  };

  const openPaper = (paper) => {
    if (view.kind !== 'paper') setPaperFrom(view);
    setView({ kind: 'paper', paper });
    setTranslation(translationsRef.current.get(paper.id) || null);
    scrollTop();
  };

  const openReader = (paper) => {
    setView({ kind: 'reader', paper });
    scrollTop();
  };

  const goHome = () => {
    setView({ kind: 'home' });
    scrollTop();
    loadHome();
  };

  const goDiscover = () => {
    setView({ kind: 'discover' });
    scrollTop();
  };

  const goLibrary = () => {
    setView({ kind: 'library' });
    scrollTop();
  };

  const openPdf = (paper) => {
    setView({ kind: 'pdf', paper });
    scrollTop();
  };

  const toggleFollow = async (journal) => {
    const next = !followed.has(journal.id);
    try {
      const data = await api.follow(journal.id, next);
      setFollowed(new Set(data.followedJournals || []));
      showToast(next ? t('toast.followed') : t('toast.unfollowed'));
      loadHome();
    } catch (error) {
      showToast(errorText(error));
    }
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
      const data = await api.translate(paper.title, paper.abstract, targetLang);
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
    return h(PaperList, {
      papers,
      onOpen: openPaper,
      libraryById,
      t,
      emptyTitle: t('empty'),
      hideVenue: view.kind === 'conference' || view.kind === 'journal',
      showIssue: view.kind === 'journal',
      titleTranslations,
    });
  };

  const renderVenueHead = (venue, kind, options = {}) => {
    const local = localizedName(venue, lang);
    return h(
      'div',
      { className: 'musee-venue-head' },
      h(JournalCover, { venue, kind, size: 'lg', issue: options.issue || '' }),
      h(
        'div',
        { style: { minWidth: 0 } },
        h(
          'div',
          { className: 'musee-venue-title-row' },
          h('h1', null, venue.name),
          kind === 'journal' && options.onToggleFollow
            ? h(
                'button',
                {
                  type: 'button',
                  className: `musee-follow-btn ${options.followed ? 'active' : ''}`,
                  title: options.followed ? t('home.following') : t('home.follow'),
                  'aria-label': options.followed ? t('home.following') : t('home.follow'),
                  onClick: options.onToggleFollow,
                },
                h(IconStar, { filled: Boolean(options.followed) }),
              )
            : null,
        ),
        local ? h('div', { className: 'musee-venue-local' }, local) : null,
        h('p', { className: 'musee-venue-about' }, localizedAbout(venue, lang)),
        h(
          'div',
          { className: 'musee-venue-meta' },
          options.issn ? h('span', null, options.issn) : null,
          venue.series ? h(Pill, { tone: 'brand' }, seriesLabel(venue.series)) : null,
          options.userIf ? h('span', { title: t('metrics.ifHint') }, `${t('metrics.if')} ${options.userIf}`) : null,
          options.metrics?.twoYearMeanCitedness
            ? h(
                'span',
                { title: t('metrics.twoYearHint') },
                `${t('metrics.twoYear')} ${Number(options.metrics.twoYearMeanCitedness).toFixed(1)}`,
              )
            : null,
          options.metrics?.hIndex ? h('span', null, `${t('metrics.hIndex')} ${options.metrics.hIndex}`) : null,
          options.worksCount ? h('span', null, tr(t, 'journal.works', { n: options.worksCount.toLocaleString() })) : null,
          options.isOa ? h(Pill, { tone: 'success' }, t('journal.oa')) : null,
          kind === 'conference'
            ? h(Pill, { tone: 'brand' }, t(venue.group === 'robotics' ? 'conference.group.robotics' : 'conference.group.ai'))
            : null,
          options.homepage
            ? h('a', { href: options.homepage, target: '_blank', rel: 'noreferrer' }, `${t('journal.officialSite')} ↗`)
            : null,
        ),
      ),
    );
  };

  const renderDiscover = () => {
    const journals = currentDiscipline?.journals || [];
    const conferences = boot?.conferences || [];
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
              disciplineName(entry, lang),
            ),
          ),
        ),
      ),
      h(
        'div',
        { className: 'musee-section' },
        h(
          'div',
          { className: 'musee-section-head' },
          h('h2', null, t('discover.journals')),
          h('span', null, currentDiscipline?.blurb?.[lang] || currentDiscipline?.blurb?.en || ''),
        ),
        h(
          'div',
          { className: 'musee-grid' },
          journals.map((journal) =>
            h(
              'div',
              {
                key: journal.id,
                className: 'musee-journal-card',
                role: 'button',
                tabIndex: 0,
                onClick: () => openJournal(journal),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') openJournal(journal);
                },
              },
              h(JournalCover, { venue: journal, kind: journal.discipline, size: 'sm' }),
              h(
                'div',
                { className: 'musee-journal-body' },
                h(
                  'div',
                  { className: 'musee-journal-title-row' },
                  h('div', { className: 'musee-journal-name' }, journal.name),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: `musee-follow-btn ${followed.has(journal.id) ? 'active' : ''}`,
                      title: followed.has(journal.id) ? t('home.following') : t('home.follow'),
                      'aria-label': followed.has(journal.id) ? t('home.following') : t('home.follow'),
                      onClick: (event) => {
                        event.stopPropagation();
                        toggleFollow(journal);
                      },
                    },
                    h(IconStar, { filled: followed.has(journal.id) }),
                  ),
                ),
                localizedName(journal, lang) ? h('div', { className: 'musee-journal-local' }, localizedName(journal, lang)) : null,
                h('div', { className: 'musee-journal-about' }, localizedAbout(journal, lang)),
                h(
                  'div',
                  { className: 'musee-journal-meta' },
                  h('span', null, journal.issn),
                  h('span', null, journal.short),
                  journal.series ? h('span', null, seriesLabel(journal.series)) : null,
                  journal.userIf ? h('span', null, `${t('metrics.if')} ${journal.userIf}`) : null,
                ),
              ),
            ),
          ),
        ),
      ),
      h(
        'div',
        { className: 'musee-section' },
        h(
          'div',
          { className: 'musee-section-head' },
          h('h2', null, t('discover.conferences')),
          h('span', null, t('discover.conferencesHint')),
        ),
        h(
          'div',
          { className: 'musee-grid' },
          conferences.map((conference) =>
            h(
              'button',
              { key: conference.id, type: 'button', className: 'musee-journal-card', onClick: () => openConference(conference) },
              h(JournalCover, { venue: conference, kind: 'conference', size: 'sm' }),
              h(
                'div',
                { className: 'musee-journal-body' },
                h('div', { className: 'musee-journal-name' }, conference.name),
                localizedName(conference, lang) ? h('div', { className: 'musee-journal-local' }, localizedName(conference, lang)) : null,
                h('div', { className: 'musee-journal-about' }, localizedAbout(conference, lang)),
                h(
                  'div',
                  { className: 'musee-journal-meta' },
                  h('span', null, t(conference.group === 'robotics' ? 'conference.group.robotics' : 'conference.group.ai')),
                ),
              ),
            ),
          ),
        ),
      ),
      (currentDiscipline?.arxiv || []).length
        ? h(
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
          )
        : null,
    );
  };

  const renderMain = () => {
    if (view.kind === 'home') {
      return h(Home, {
        t,
        lang,
        feed: homeFeed,
        recommended: boot?.recommended || [],
        loading: homeState === 'loading' || homeState === 'idle',
        error: homeState === 'error' ? homeError : '',
        followed,
        onOpenJournal: openJournal,
        onOpenPaper: openPaper,
        onDiscover: goDiscover,
        onToggleFollow: toggleFollow,
        titleTranslations,
      });
    }

    if (view.kind === 'pdf') {
      return h(PdfViewer, {
        paper: view.paper,
        t,
        onBack: () => setView({ kind: 'paper', paper: view.paper }),
      });
    }

    if (view.kind === 'reader') {
      return h(Reader, {
        paper: view.paper,
        t,
        targetLang,
        onPdf: () => openPdf(view.paper),
        onBack: () => setView({ kind: 'paper', paper: view.paper }),
      });
    }

    if (view.kind === 'paper') {
      return h(PaperDetail, {
        paper: view.paper,
        item: libraryById.get(view.paper.id),
        t,
        lang,
        onBack: backToList,
        onSave: savePaper,
        onUpdate: updateItem,
        onTranslate: translatePaper,
        translation,
        translating,
        titleTranslation: titleTranslations[view.paper.id],
        onRead: openReader,
        onPdf: openPdf,
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

    if (view.kind === 'discover') return renderDiscover();

    if (view.kind === 'conference') {
      return h(
        'div',
        { className: 'musee-page' },
        h('button', { type: 'button', className: 'musee-back', onClick: goDiscover }, h(IconBack), t('discover.conferences')),
        renderVenueHead(view.conference, 'conference', { issue: papers[0]?.year ? String(papers[0].year) : '' }),
        h('p', { className: 'musee-settings-hint', style: { marginTop: '12px', maxWidth: '720px' } }, t('conference.dataNote')),
        h('div', { className: 'musee-section-head', style: { marginTop: '20px' } }, h('h2', null, t('conference.latest'))),
        renderList(),
      );
    }

    if (view.kind === 'journal') {
      return h(
        'div',
        { className: 'musee-page' },
        h('button', { type: 'button', className: 'musee-back', onClick: goDiscover }, h(IconBack), t('journal.back')),
        renderVenueHead(view.journal, view.journal.discipline, {
          issue: issueLabel(papers[0]),
          issn: view.journal.issn,
          worksCount: sourceInfo?.worksCount,
          isOa: sourceInfo?.isOa,
          homepage: sourceInfo?.homepage,
          metrics: sourceInfo?.metrics,
          userIf: view.journal.userIf,
          followed: followed.has(view.journal.id),
          onToggleFollow: () => toggleFollow(view.journal),
        }),
        h('div', { className: 'musee-section-head', style: { marginTop: '20px', gap: '12px', flexWrap: 'wrap' } },
          h('h2', null, journalYear ? String(journalYear) : t('journal.papers')),
          journalTotal ? h('span', null, tr(t, 'journal.total', { n: journalTotal.toLocaleString() })) : null,
          h('div', { style: { flex: 1 } }),
          journalYears.length
            ? h(
                'select',
                {
                  className: 'musee-select',
                  style: { width: 'auto' },
                  value: journalYear ?? '',
                  'aria-label': t('journal.allYears'),
                  onChange: (event) => loadJournal(view.journal, event.target.value ? Number(event.target.value) : null, false),
                },
                h('option', { value: '' }, t('journal.allYears')),
                journalYears.map((entry) =>
                  h('option', { key: entry.year, value: String(entry.year) }, `${entry.year} (${entry.count})`),
                ),
              )
            : null,
        ),
        renderList(),
        listState === 'ready' && papers.length < journalTotal
          ? h(
              'div',
              { style: { display: 'flex', justifyContent: 'center', marginTop: '16px' } },
              h(
                Button,
                { onClick: () => loadJournal(view.journal, journalYear, true), disabled: loadingMore },
                loadingMore ? h(Spinner) : null,
                `${t('journal.loadMore')} ${papers.length}/${journalTotal}`,
              ),
            )
          : null,
      );
    }

    return h(
      'div',
      { className: 'musee-page' },
      h('button', { type: 'button', className: 'musee-back', onClick: goDiscover }, h(IconBack), t('discover.title')),
      h('div', { className: 'musee-hero', style: { marginTop: '12px' } }, h('h1', null, listTitle)),
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
        h('button', { type: 'button', className: `musee-nav-btn ${view.kind === 'home' ? 'active' : ''}`, onClick: goHome }, t('nav.home')),
        h('button', { type: 'button', className: `musee-nav-btn ${view.kind !== 'home' && view.kind !== 'library' ? 'active' : ''}`, onClick: goDiscover }, t('nav.discover')),
        h(
          'button',
          { type: 'button', className: `musee-nav-btn ${view.kind === 'library' ? 'active' : ''}`, onClick: goLibrary },
          t('nav.library'),
          library.length ? h('span', { className: 'musee-nav-count' }, String(library.length)) : null,
        ),
      ),
      h(
        'button',
        { type: 'button', className: 'musee-icon-btn', onClick: () => setSettingsOpen(true), 'aria-label': t('settings.title'), title: t('settings.title') },
        h(IconSettings),
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
              disciplineName(entry, lang),
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
        h('div', { className: 'musee-rail-title' }, t('discover.conferences')),
        h(
          'div',
          { className: 'musee-rail-group' },
          (boot.conferences || []).map((conference) =>
            h(
              'button',
              {
                key: conference.id,
                type: 'button',
                className: `musee-rail-item ${view.kind === 'conference' && view.conference.id === conference.id ? 'active' : ''}`,
                onClick: () => openConference(conference),
              },
              conference.name,
              h('span', { className: 'musee-rail-sub' }, t(conference.group === 'robotics' ? 'conference.group.robotics' : 'conference.group.ai')),
            ),
          ),
        ),
        (currentDiscipline?.arxiv || []).length
          ? h(
              'div',
              null,
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
            )
          : null,
      ),
      h('main', { className: 'musee-main', ref: mainRef }, renderMain()),
    ),

    settingsOpen
      ? h(SettingsDialog, {
          t,
          lang,
          onLang: setLang,
          targetLang,
          onTarget: setTargetLang,
          translateTitles,
          onTranslateTitles: setTranslateTitles,
          version: boot.version,
          dataDir: boot.dataDir,
          onClose: () => setSettingsOpen(false),
        })
      : null,
    citation ? h(CitationDialog, { papers: citation.papers, t, onClose: () => setCitation(null), showToast }) : null,
    toast ? h('div', { className: 'musee-toast', role: 'status' }, toast) : null,
  );
}
