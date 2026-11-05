import DOMPurify from 'dompurify';
import { h, useEffect, useMemo, useRef, useState } from './react.js';
import { api, tFormat } from './api.js';
import { Button, ErrorBanner, IconBack, IconExternal, Loading, Modal, Spinner } from './ui.jsx';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && String(node.getAttribute('href') || '').startsWith('http')) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noreferrer');
  }
});

const SANITIZE = {
  USE_PROFILES: { html: true, mathMl: true, svg: true },
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta'],
  FORBID_ATTR: ['style'],
  ADD_ATTR: ['target', 'rel'],
};

function tr(t, key, params) {
  return tFormat(t(key), params);
}

const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, blockquote, figcaption, td';

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function blocksOf(root) {
  if (!root) return [];
  return [...root.querySelectorAll(BLOCK_SELECTOR)].filter((element) => element.textContent.trim());
}

function blockOf(node, blocks, root) {
  let element = node?.nodeType === 1 ? node : node?.parentElement;
  while (element && element !== root) {
    if (blocks.includes(element)) return element;
    element = element.parentElement;
  }
  return null;
}

function offsetIn(block, container, offset) {
  try {
    const range = document.createRange();
    range.selectNodeContents(block);
    range.setEnd(container, offset);
    return range.toString().length;
  } catch {
    return 0;
  }
}

function anchorsFromRange(root, range) {
  const blocks = blocksOf(root);
  const startBlock = blockOf(range.startContainer, blocks, root);
  const endBlock = blockOf(range.endContainer, blocks, root);
  if (!startBlock || !endBlock) return null;
  const startIndex = blocks.indexOf(startBlock);
  const endIndex = blocks.indexOf(endBlock);
  if (startIndex < 0 || endIndex < startIndex) return null;
  const anchors = [];
  for (let index = startIndex; index <= endIndex; index += 1) {
    const block = blocks[index];
    const start = index === startIndex ? offsetIn(block, range.startContainer, range.startOffset) : 0;
    const end = index === endIndex ? offsetIn(block, range.endContainer, range.endOffset) : block.textContent.length;
    if (end > start) anchors.push({ block: index, start, end });
  }
  return anchors.length ? anchors : null;
}

function rangeFromAnchor(blocks, anchor) {
  const block = blocks[anchor.block];
  if (!block) return null;
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let position = 0;
  let startNode = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const length = node.nodeValue.length;
    if (!startNode && anchor.start <= position + length) {
      startNode = node;
      startOffset = Math.max(0, anchor.start - position);
    }
    if (startNode && anchor.end <= position + length) {
      endNode = node;
      endOffset = Math.max(0, anchor.end - position);
      break;
    }
    position += length;
  }
  if (!startNode || !endNode) return null;
  try {
    const range = document.createRange();
    range.setStart(startNode, Math.min(startOffset, startNode.nodeValue.length));
    range.setEnd(endNode, Math.min(endOffset, endNode.nodeValue.length));
    return range;
  } catch {
    return null;
  }
}

function splitChunks(text, max = 6000) {
  const value = String(text || '').trim();
  if (value.length <= max) return value ? [value] : [];
  const chunks = [];
  let rest = value;
  while (rest.length > max) {
    let cut = rest.lastIndexOf('\n\n', max);
    if (cut < max * 0.5) cut = rest.lastIndexOf('. ', max);
    if (cut < max * 0.5) cut = rest.lastIndexOf(' ', max);
    if (cut < 1) cut = max;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

export function Reader({ paper, item, t, targetLang, onBack, onPdf, onEnsureSaved, onUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState('');
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [lightbox, setLightbox] = useState('');
  const [viewMode, setViewMode] = useState('original');
  const [fullTranslations, setFullTranslations] = useState({});
  const [fullProgress, setFullProgress] = useState({ done: 0, total: 0, active: false });
  const [fullError, setFullError] = useState('');
  const [htmlAnnotations, setHtmlAnnotations] = useState(() => (Array.isArray(item?.htmlAnnotations) ? item.htmlAnnotations : []));
  const [selection, setSelection] = useState(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [annotationError, setAnnotationError] = useState('');
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const articleRef = useRef(null);
  const stopFullRef = useRef(false);
  const progressKey = `musee:progress:${paper.id || paper.doi || paper.title}`;
  const [resume] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(progressKey) || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    setData(null);
    setTranslation(null);
    setViewMode('original');
    setFullTranslations({});
    setFullProgress({ done: 0, total: 0, active: false });
    setFullError('');
    stopFullRef.current = false;
    api
      .fulltext(paper)
      .then((result) => {
        if (!alive) return;
        setData(result);
        setActive(result.toc?.[0]?.id || '');
      })
      .catch((reason) => {
        if (alive) setError(reason.message || String(reason));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [paper.arxivId]);

  const sanitized = useMemo(() => {
    if (!data?.available) return '';
    return DOMPurify.sanitize(data.html || '', SANITIZE);
  }, [data]);

  useEffect(() => {
    const api = globalThis.CSS?.highlights;
    const HighlightCtor = globalThis.Highlight;
    if (!api || typeof HighlightCtor !== 'function') return undefined;
    if (viewMode !== 'original' || !articleRef.current) {
      api.delete('musee-annotations');
      return undefined;
    }
    const blocks = blocksOf(articleRef.current);
    const ranges = [];
    for (const annotation of htmlAnnotations) {
      for (const anchor of annotation.ranges || []) {
        const range = rangeFromAnchor(blocks, anchor);
        if (range) ranges.push(range);
      }
    }
    if (ranges.length) api.set('musee-annotations', new HighlightCtor(...ranges));
    else api.delete('musee-annotations');
    return () => api.delete('musee-annotations');
  }, [sanitized, htmlAnnotations, viewMode]);

  useEffect(() => {
    if (!data || !resume?.id) return undefined;
    if (!(data.toc || []).some((entry) => entry.id === resume.id)) return undefined;
    const timer = setTimeout(() => {
      const element = document.getElementById(resume.id);
      if (element) {
        element.scrollIntoView({ block: 'start' });
        setActive(resume.id);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    if (!data || !articleRef.current) return undefined;
    const scroller = articleRef.current.closest('.musee-reader-scroll');
    if (!scroller) return undefined;
    let frame = 0;
    const update = () => {
      const threshold = scroller.getBoundingClientRect().top + 110;
      let current = data.toc?.[0]?.id || '';
      for (const entry of data.toc || []) {
        const element = document.getElementById(entry.id);
        if (element && element.getBoundingClientRect().top <= threshold) current = entry.id;
      }
      if (current) setActive(current);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [data, viewMode]);

  useEffect(() => {
    if (!data || !active) return;
    const entry = (data.toc || []).find((item) => item.id === active);
    try {
      localStorage.setItem(progressKey, JSON.stringify({ id: active, title: entry?.title || active, at: Date.now() }));
    } catch {
      /* storage is optional */
    }
  }, [active, data, progressKey]);

  const sectionMap = useMemo(() => new Map((data?.sections || []).map((section) => [section.id, section])), [data]);

  const scrollTo = (id) => {
    const root = articleRef.current;
    const element = document.getElementById(id);
    if (element && root?.contains(element)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
    }
  };

  const activeSection = (() => {
    if (!active) return null;
    const direct = sectionMap.get(active);
    if (direct) return direct;
    const parent = active.includes('.') ? active.slice(0, active.lastIndexOf('.')) : '';
    return parent ? sectionMap.get(parent) || null : null;
  })();

  useEffect(() => {
    setFullTranslations({});
    setViewMode('original');
  }, [targetLang]);

  const translateAll = async () => {
    const sections = (data?.sections || []).filter((section) => section.text);
    if (!sections.length) return;
    stopFullRef.current = false;
    setFullError('');
    setViewMode('translated');
    setFullProgress({ done: 0, total: sections.length, active: true });
    const results = { ...fullTranslations };
    try {
      for (let index = 0; index < sections.length; index += 1) {
        if (stopFullRef.current) break;
        const section = sections[index];
        if (!results[section.id]) {
          const parts = [];
          for (const chunk of splitChunks(section.text)) {
            if (stopFullRef.current) break;
            const result = await api.translateSection(section.title, chunk, targetLang);
            parts.push(result.text);
          }
          if (!parts.length) break;
          results[section.id] = parts.join('\n\n');
          setFullTranslations({ ...results });
        }
        setFullProgress({ done: index + 1, total: sections.length, active: true });
      }
    } catch (reason) {
      setFullError(tr(t, 'reader.translateAllError', { message: reason.message || String(reason) }));
    } finally {
      setFullProgress((current) => ({ ...current, active: false }));
    }
  };

  const stopFull = () => {
    stopFullRef.current = true;
  };

  const translateSection = async () => {
    if (!activeSection?.text) {
      setTranslation({ id: active, error: t('reader.noText') });
      return;
    }
    setTranslating(true);
    try {
      const result = await api.translateSection(activeSection.title, activeSection.text, targetLang);
      setTranslation({ id: activeSection.id, title: activeSection.title, text: result.text });
    } catch (reason) {
      setTranslation({ id: activeSection.id, title: activeSection.title, error: reason.message || String(reason) });
    } finally {
      setTranslating(false);
    }
  };

  const onArticleMouseUp = () => {
    const current = window.getSelection();
    if (!current || current.isCollapsed || !articleRef.current) {
      setSelection(null);
      return;
    }
    const range = current.getRangeAt(0);
    if (!articleRef.current.contains(range.commonAncestorContainer)) return;
    const anchors = anchorsFromRange(articleRef.current, range);
    const text = current.toString().replace(/\s+/g, ' ').trim();
    if (!anchors || !text) return;
    const bounds = range.getBoundingClientRect();
    setSelection({
      text,
      ranges: anchors,
      x: bounds.left + bounds.width / 2,
      y: Math.max(64, bounds.top - 10),
    });
  };

  const persistAnnotations = async (next) => {
    setSavingAnnotation(true);
    setAnnotationError('');
    try {
      const target = item?.id ? item : await onEnsureSaved(paper);
      if (!target?.id) throw new Error('论文还没有收藏，无法保存批注。');
      await onUpdate(target.id, { htmlAnnotations: next });
      setHtmlAnnotations(next);
    } catch (reason) {
      setAnnotationError(reason?.message || String(reason));
      throw reason;
    } finally {
      setSavingAnnotation(false);
    }
  };

  const makeAnnotation = (note = '') => ({
    id: newId(),
    text: selection.text,
    note,
    section: activeSection?.title || '',
    createdAt: new Date().toISOString(),
    ranges: selection.ranges,
  });

  const highlightSelection = async () => {
    if (!selection) return;
    try {
      await persistAnnotations([...htmlAnnotations, makeAnnotation('')]);
      setNotesOpen(true);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    } catch {
      /* annotationError is set */
    }
  };

  const startAnnotationNote = () => {
    if (!selection) return;
    setNoteDraft(makeAnnotation(''));
    setNoteText('');
    setNotesOpen(true);
    setSelection(null);
  };

  const saveAnnotationNote = async () => {
    if (!noteDraft) return;
    const exists = htmlAnnotations.some((annotation) => annotation.id === noteDraft.id);
    const next = exists
      ? htmlAnnotations.map((annotation) => (annotation.id === noteDraft.id ? { ...annotation, note: noteText } : annotation))
      : [...htmlAnnotations, { ...noteDraft, note: noteText }];
    try {
      await persistAnnotations(next);
      setNoteDraft(null);
      setNoteText('');
    } catch {
      /* annotationError is set */
    }
  };

  const editAnnotation = (annotation) => {
    setNoteDraft(annotation);
    setNoteText(annotation.note || '');
  };

  const removeAnnotation = async (annotation) => {
    try {
      await persistAnnotations(htmlAnnotations.filter((entry) => entry.id !== annotation.id));
    } catch {
      /* annotationError is set */
    }
  };

  const jumpToAnnotation = (annotation) => {
    if (viewMode !== 'original') setViewMode('original');
    setTimeout(() => {
      const blocks = blocksOf(articleRef.current);
      const block = blocks[annotation.ranges?.[0]?.block];
      block?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  const onArticleClick = (event) => {
    const image = event.target.closest?.('img');
    if (image?.src) {
      setLightbox(image.src);
      return;
    }
    const anchor = event.target.closest?.('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (href.startsWith('#')) {
      event.preventDefault();
      scrollTo(href.slice(1));
    }
  };

  const header = h(
    'div',
    { className: 'musee-reader-head' },
    h('button', { type: 'button', className: 'musee-back', onClick: onBack }, h(IconBack), t('paper.back')),
    h('div', { className: 'musee-reader-title' }, data?.title || paper.title),
    h('div', { style: { flex: 1 } }),
    data?.available
      ? h(
          'div',
          { className: 'musee-reader-actions' },
          Object.keys(fullTranslations).length || viewMode === 'translated'
            ? h(
                'div',
                { className: 'musee-seg musee-reader-view' },
                h(
                  'button',
                  { type: 'button', className: viewMode === 'original' ? 'active' : '', onClick: () => setViewMode('original') },
                  t('reader.originalView'),
                ),
                h(
                  'button',
                  { type: 'button', className: viewMode === 'translated' ? 'active' : '', onClick: () => setViewMode('translated') },
                  t('reader.translatedView'),
                ),
              )
            : null,
          fullProgress.active
            ? h(
                Button,
                { size: 'sm', onClick: stopFull },
                h(Spinner),
                tr(t, 'reader.translatingAll', { done: fullProgress.done, total: fullProgress.total }),
              )
            : h(
                Button,
                { size: 'sm', onClick: translateAll, disabled: translating || !(data.sections || []).length },
                t('reader.translateAll'),
              ),
          h(
            Button,
            { size: 'sm', onClick: () => setNotesOpen((value) => !value) },
            `${t('reader.annotations')} ${htmlAnnotations.length}`,
          ),
          h(
            Button,
            { size: 'sm', onClick: translateSection, disabled: translating || !activeSection?.text },
            translating ? h(Spinner) : null,
            translating ? t('reader.translating') : t('reader.translate'),
          ),
        )
      : null,
    data?.absUrl ? h('a', { className: 'musee-btn sm', href: data.absUrl, target: '_blank', rel: 'noreferrer' }, data.source === 'pmc' ? 'Europe PMC' : 'arXiv') : null,
    data?.pdfUrl
      ? onPdf
        ? h(Button, { size: 'sm', onClick: onPdf }, 'PDF')
        : h('a', { className: 'musee-btn sm', href: data.pdfUrl, target: '_blank', rel: 'noreferrer' }, h(IconExternal), 'PDF')
      : null,
  );

  if (loading) {
    return h(
      'div',
      { className: 'musee-reader' },
      header,
      h('div', { className: 'musee-page' }, h(Loading, { label: t('reader.loading') })),
    );
  }

  if (error) {
    return h(
      'div',
      { className: 'musee-reader' },
      header,
      h('div', { className: 'musee-page' }, h(ErrorBanner, { message: tr(t, 'reader.error', { message: error }) })),
    );
  }

  if (!data?.available) {
    return h(
      'div',
      { className: 'musee-reader' },
      header,
      h(
        'div',
        { className: 'musee-page' },
        h('div', { className: 'musee-empty' }, h('strong', null, t('reader.unavailable'))),
        data?.reason ? h('p', { className: 'musee-reader-note', style: { textAlign: 'center' } }, data.reason) : null,
        data?.absUrl
          ? h('div', { style: { textAlign: 'center' } }, h('a', { className: 'musee-btn', href: data.absUrl, target: '_blank', rel: 'noreferrer' }, data.source === 'pmc' ? 'Europe PMC' : 'arXiv'))
          : null,
        data?.pdfUrl
          ? h('div', { style: { textAlign: 'center' } }, h('a', { className: 'musee-btn', href: data.pdfUrl, target: '_blank', rel: 'noreferrer' }, t('reader.openPdf')))
          : null,
      ),
    );
  }

  return h(
    'div',
    { className: 'musee-reader' },
    header,
    h(
      'div',
      { className: `musee-reader-body ${notesOpen ? 'with-notes' : ''}` },
      h(
        'aside',
        { className: 'musee-reader-toc' },
        h('div', { className: 'musee-rail-title' }, t('reader.toc')),
        (data.toc || []).map((item) =>
          h(
            'button',
            {
              key: `${item.id}-${item.title}`,
              type: 'button',
              className: `musee-reader-toc-item level-${item.level} ${active === item.id ? 'active' : ''}`,
              onClick: () => scrollTo(item.id),
            },
            item.title,
          ),
        ),
      ),
      h(
        'div',
        { className: 'musee-reader-scroll' },
        h(
          'div',
          { className: 'musee-reader-paper' },
          data.authors ? h('div', { className: 'musee-reader-authors' }, data.authors) : null,
          annotationError ? h(ErrorBanner, { message: annotationError }) : null,
          fullError ? h(ErrorBanner, { message: fullError }) : null,
          translation
            ? h(
                'div',
                { className: 'musee-reader-translation' },
                h(
                  'div',
                  { className: 'musee-reader-translation-head' },
                  h('strong', null, `${t('reader.translation')} · ${translation.title || ''}`),
                  h('button', { type: 'button', className: 'musee-back', onClick: () => setTranslation(null) }, t('reader.close')),
                ),
                translation.error
                  ? h('div', { className: 'musee-error' }, translation.error)
                  : h('div', { className: 'musee-reader-translation-body' }, translation.text),
              )
            : null,
          viewMode === 'translated'
            ? h(
                'div',
                { className: 'musee-fulltext musee-reader-translated', ref: articleRef },
                h('p', { className: 'musee-reader-note' }, t('reader.translationNote')),
                (data.sections || []).map((section) =>
                  h(
                    'section',
                    { key: section.id, id: section.id, className: 'musee-translated-section' },
                    h('h2', null, section.title),
                    fullTranslations[section.id]
                      ? fullTranslations[section.id]
                          .split(/\n{2,}/)
                          .map((paragraph, index) => h('p', { key: index }, paragraph))
                      : h('p', { className: 'musee-reader-placeholder' }, fullProgress.active ? t('loading') : t('reader.translateAll')),
                  ),
                ),
                h('p', { className: 'musee-reader-note' }, t('reader.referencesOriginal')),
              )
            : h('div', {
                className: 'musee-fulltext',
                ref: articleRef,
                onClick: onArticleClick,
                onMouseUp: onArticleMouseUp,
                dangerouslySetInnerHTML: { __html: sanitized },
              }),
        ),
      ),
      notesOpen
        ? h(
            'aside',
            { className: 'musee-reader-notes' },
            h('div', { className: 'musee-rail-title' }, `${t('reader.annotations')} · ${htmlAnnotations.length}`),
            htmlAnnotations.length
              ? htmlAnnotations.map((annotation) =>
                  h(
                    'div',
                    { key: annotation.id, className: 'musee-reader-ann' },
                    h(
                      'button',
                      { type: 'button', className: 'musee-reader-ann-main', onClick: () => jumpToAnnotation(annotation) },
                      annotation.section ? h('span', { className: 'musee-reader-ann-section' }, annotation.section) : null,
                      h('span', { className: 'musee-reader-ann-text' }, annotation.text),
                    ),
                    annotation.note ? h('div', { className: 'musee-reader-ann-note' }, annotation.note) : null,
                    h(
                      'div',
                      { className: 'musee-reader-ann-actions' },
                      h('button', { type: 'button', className: 'musee-pdf-ann-action', onClick: () => editAnnotation(annotation) }, '✎'),
                      h('button', { type: 'button', className: 'musee-pdf-ann-action', onClick: () => removeAnnotation(annotation) }, '×'),
                    ),
                  ),
                )
              : h('p', { className: 'musee-reader-note' }, t('reader.noAnnotations')),
            h('p', { className: 'musee-reader-note' }, t('reader.annotationHint')),
          )
        : null,
    ),
    selection && viewMode === 'original'
      ? h(
          'div',
          { className: 'musee-reader-toolbar', style: { left: `${selection.x}px`, top: `${selection.y}px` } },
          h(Button, { size: 'sm', variant: 'primary', onClick: highlightSelection, disabled: savingAnnotation }, t('pdf.highlight')),
          h(Button, { size: 'sm', onClick: startAnnotationNote, disabled: savingAnnotation }, t('pdf.note')),
        )
      : null,
    noteDraft
      ? h(
          Modal,
          {
            title: t('pdf.noteTitle'),
            onClose: () => setNoteDraft(null),
            footer: [
              h(Button, { key: 'save', variant: 'primary', onClick: saveAnnotationNote, disabled: savingAnnotation }, savingAnnotation ? t('pdf.saving') : t('pdf.save')),
              h(Button, { key: 'cancel', onClick: () => setNoteDraft(null) }, t('pdf.cancel')),
            ],
          },
          h('blockquote', { className: 'musee-pdf-quote' }, noteDraft.text),
          h('textarea', {
            className: 'musee-textarea',
            value: noteText,
            placeholder: t('pdf.notePlaceholder'),
            onChange: (event) => setNoteText(event.target.value),
          }),
        )
      : null,
    lightbox
      ? h(
          'div',
          { className: 'musee-lightbox', role: 'button', tabIndex: 0, onClick: () => setLightbox(''), onKeyDown: (event) => { if (event.key === 'Escape') setLightbox(''); } },
          h('img', { src: lightbox, alt: '' }),
        )
      : null,
  );
}
