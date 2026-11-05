import { h, useEffect, useRef, useState } from './react.js';
import { api, tFormat } from './api.js';
import { Button, ErrorBanner, IconBack, Loading, Modal, Spinner } from './ui.jsx';

function tr(t, key, params) {
  return tFormat(t(key), params);
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function PdfViewer({ paper, item, t, targetLang, onBack, onEnsureSaved, onUpdate }) {
  const [pdf, setPdf] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [pageSize, setPageSize] = useState({ w: 0, h: 0 });
  const [annotations, setAnnotations] = useState(() => (Array.isArray(item?.pdfAnnotations) ? item.pdfAnnotations : []));
  const [selection, setSelection] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [noteEditor, setNoteEditor] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef(null);
  const pageRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const docRef = useRef(null);
  const libRef = useRef(null);
  const renderRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    setError('');
    setPdf(null);
    (async () => {
      const [url, workerUrl, libUrl] = await Promise.all([
        api.pdfUrl(paper.arxivId),
        api.pdfWorkerUrl(),
        api.pdfLibUrl(),
      ]);
      const pdfjs = await import(libUrl);
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      libRef.current = pdfjs;
      const task = pdfjs.getDocument({ url, disableRange: true, disableStream: true, isEvalSupported: false });
      const doc = await task.promise;
      if (!alive) {
        doc.destroy();
        return;
      }
      docRef.current = doc;
      setPageCount(doc.numPages);
      setPdf(doc);
      setStatus('ready');
    })().catch((reason) => {
      if (alive) {
        setError(reason?.message || String(reason));
        setStatus('error');
      }
    });
    return () => {
      alive = false;
      renderRef.current?.cancel?.();
      docRef.current?.destroy?.();
      docRef.current = null;
    };
  }, [paper.arxivId]);

  useEffect(() => {
    if (!pdf) return undefined;
    let alive = true;
    (async () => {
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      const available = Math.max(360, (scrollRef.current?.clientWidth || 900) - 56);
      if (alive) setScale(Math.min(2, Math.max(0.6, available / base.width)));
    })().catch(() => {});
    return () => {
      alive = false;
    };
  }, [pdf]);

  useEffect(() => {
    if (!pdf) return undefined;
    let cancelled = false;
    setSelection(null);
    setPageSize({ w: 0, h: 0 });
    (async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const textContainer = textRef.current;
      if (!canvas || !textContainer) return;
      const TextLayer = libRef.current?.TextLayer;
      if (!TextLayer) return;
      setPageSize({ w: viewport.width, h: viewport.height });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const context = canvas.getContext('2d');
      renderRef.current?.cancel?.();
      const renderTask = page.render({
        canvasContext: context,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
      });
      renderRef.current = renderTask;
      await renderTask.promise.catch((reason) => {
        if (reason?.name !== 'RenderingCancelledException') throw reason;
      });
      if (cancelled) return;
      textContainer.innerHTML = '';
      textContainer.style.width = `${viewport.width}px`;
      textContainer.style.height = `${viewport.height}px`;
      textContainer.style.setProperty('--scale-factor', String(scale));
      const textLayer = new TextLayer({ textContentSource: page.streamTextContent(), container: textContainer, viewport });
      await textLayer.render();
    })().catch((reason) => {
      if (!cancelled) setError(reason?.message || String(reason));
    });
    return () => {
      cancelled = true;
      renderRef.current?.cancel?.();
    };
  }, [pdf, pageNumber, scale]);

  const goPage = (next) => {
    const value = Math.min(Math.max(1, next), pageCount || 1);
    setPageNumber(value);
    setSelection(null);
    setTranslation(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const clearSelection = () => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const onTextMouseUp = () => {
    const current = window.getSelection();
    if (!current || current.isCollapsed || !textRef.current) {
      setSelection(null);
      return;
    }
    const range = current.getRangeAt(0);
    if (!textRef.current.contains(range.commonAncestorContainer)) return;
    const text = current.toString().replace(/\s+/g, ' ').trim();
    const pageRect = pageRef.current?.getBoundingClientRect();
    if (!text || !pageRect) return;
    const rects = [...range.getClientRects()]
      .filter((rect) => rect.width > 2 && rect.height > 2)
      .map((rect) => ({
        x: (rect.left - pageRect.left) / pageRect.width,
        y: (rect.top - pageRect.top) / pageRect.height,
        w: rect.width / pageRect.width,
        h: rect.height / pageRect.height,
      }));
    if (!rects.length) return;
    const bounds = range.getBoundingClientRect();
    setSelection({
      page: pageNumber,
      text,
      rects,
      x: bounds.left + bounds.width / 2,
      y: Math.max(64, bounds.top - 10),
    });
  };

  const persist = async (next) => {
    setSaving(true);
    setActionError('');
    try {
      const target = item?.id ? item : await onEnsureSaved(paper);
      if (!target?.id) throw new Error('论文还没有收藏，无法保存批注。');
      await onUpdate(target.id, { pdfAnnotations: next });
      setAnnotations(next);
    } catch (reason) {
      setActionError(reason?.message || String(reason));
      throw reason;
    } finally {
      setSaving(false);
    }
  };

  const makeAnnotation = () => ({
    id: newId(),
    page: selection.page,
    text: selection.text,
    rects: selection.rects,
    color: '#f5c542',
    note: '',
    createdAt: new Date().toISOString(),
  });

  const highlight = async () => {
    if (!selection) return;
    try {
      await persist([...annotations, makeAnnotation()]);
      clearSelection();
    } catch {
      /* actionError already set */
    }
  };

  const startNote = () => {
    if (!selection) return;
    setNoteEditor(makeAnnotation());
    setNoteText('');
    setSelection(null);
  };

  const editNote = (annotation) => {
    setNoteEditor(annotation);
    setNoteText(annotation.note || '');
  };

  const saveNote = async () => {
    if (!noteEditor) return;
    const exists = annotations.some((annotation) => annotation.id === noteEditor.id);
    const next = exists
      ? annotations.map((annotation) => (annotation.id === noteEditor.id ? { ...annotation, note: noteText } : annotation))
      : [...annotations, { ...noteEditor, note: noteText }];
    try {
      await persist(next);
      setNoteEditor(null);
      setNoteText('');
    } catch {
      /* actionError already set */
    }
  };

  const removeAnnotation = async (annotation) => {
    try {
      await persist(annotations.filter((entry) => entry.id !== annotation.id));
    } catch {
      /* actionError already set */
    }
  };

  const translateSelection = async () => {
    if (!selection) return;
    const source = selection.text;
    const page = selection.page;
    setSelection(null);
    setTranslating(true);
    setTranslation({ page, source });
    try {
      const result = await api.translateSection(`Page ${page}`, source, targetLang);
      setTranslation({ page, source, text: result.text });
    } catch (reason) {
      setTranslation({ page, source, error: reason?.message || String(reason) });
    } finally {
      setTranslating(false);
    }
  };

  const pageAnnotations = annotations.filter((annotation) => annotation.page === pageNumber);

  const header = h(
    'div',
    { className: 'musee-reader-head musee-pdf-head' },
    h('button', { type: 'button', className: 'musee-back', onClick: onBack }, h(IconBack), t('paper.back')),
    h('div', { className: 'musee-reader-title' }, paper.title),
    h('div', { style: { flex: 1 } }),
    h(Button, { size: 'sm', onClick: () => goPage(pageNumber - 1), disabled: pageNumber <= 1, 'aria-label': t('pdf.prev') }, '‹'),
    h('span', { className: 'musee-pdf-pageinfo' }, tr(t, 'pdf.pageOf', { n: pageNumber, total: pageCount || '—' })),
    h(Button, { size: 'sm', onClick: () => goPage(pageNumber + 1), disabled: pageNumber >= pageCount, 'aria-label': t('pdf.next') }, '›'),
    h(Button, { size: 'sm', onClick: () => setScale((value) => Math.max(0.5, Number((value - 0.15).toFixed(2)))), 'aria-label': t('pdf.zoomOut') }, '−'),
    h('span', { className: 'musee-pdf-zoom' }, `${Math.round(scale * 100)}%`),
    h(Button, { size: 'sm', onClick: () => setScale((value) => Math.min(3, Number((value + 0.15).toFixed(2)))), 'aria-label': t('pdf.zoomIn') }, '+'),
    saving ? h(Spinner) : null,
  );

  if (status === 'loading') {
    return h('div', { className: 'musee-pdf-view' }, header, h('div', { className: 'musee-page' }, h(Loading, { label: t('pdf.loading') })));
  }

  if (status === 'error') {
    return h('div', { className: 'musee-pdf-view' }, header, h('div', { className: 'musee-page' }, h(ErrorBanner, { message: tr(t, 'pdf.error', { message: error }) })));
  }

  return h(
    'div',
    { className: 'musee-pdf-view' },
    header,
    actionError ? h('div', { className: 'musee-pdf-actionerror' }, h(ErrorBanner, { message: actionError })) : null,
    h(
      'div',
      { className: 'musee-pdf-body' },
      h(
        'div',
        { className: 'musee-pdf-scroll', ref: scrollRef },
        h(
          'div',
          { className: 'musee-pdf-stage' },
          h(
            'div',
            { className: 'musee-pdf-page', ref: pageRef, style: { width: `${pageSize.w}px`, height: `${pageSize.h}px` } },
            h('canvas', { className: 'musee-pdf-canvas', ref: canvasRef }),
            h('div', { className: 'textLayer musee-pdf-text', ref: textRef, onMouseUp: onTextMouseUp }),
            h(
              'div',
              { className: 'musee-pdf-highlights' },
              pageAnnotations.map((annotation) =>
                annotation.rects.map((rect, index) =>
                  h('div', {
                    key: `${annotation.id}-${index}`,
                    className: 'musee-pdf-hl',
                    style: {
                      left: `${rect.x * 100}%`,
                      top: `${rect.y * 100}%`,
                      width: `${rect.w * 100}%`,
                      height: `${rect.h * 100}%`,
                      background: annotation.color,
                    },
                  }),
                ),
              ),
            ),
          ),
        ),
      ),
      h(
        'aside',
        { className: 'musee-pdf-side' },
        h('div', { className: 'musee-pdf-side-head' }, h('h3', null, t('pdf.annotations')), h('span', null, String(annotations.length))),
        annotations.length
          ? annotations.map((annotation) =>
              h(
                'div',
                { key: annotation.id, className: 'musee-pdf-ann' },
                h(
                  'button',
                  { type: 'button', className: 'musee-pdf-ann-main', onClick: () => goPage(annotation.page) },
                  h('span', { className: 'musee-pdf-ann-page' }, `p.${annotation.page}`),
                  h('span', { className: 'musee-pdf-ann-text' }, annotation.text),
                ),
                annotation.note ? h('div', { className: 'musee-pdf-ann-note' }, annotation.note) : null,
                h(
                  'div',
                  { className: 'musee-pdf-ann-actions' },
                  h('button', { type: 'button', className: 'musee-pdf-ann-action', onClick: () => editNote(annotation) }, '✎'),
                  h('button', { type: 'button', className: 'musee-pdf-ann-action', onClick: () => removeAnnotation(annotation) }, '×'),
                ),
              ),
            )
          : h('p', { className: 'musee-pdf-sidehint' }, t('pdf.noAnnotations')),
        translation
          ? h(
              'div',
              { className: 'musee-pdf-translation' },
              h(
                'div',
                { className: 'musee-pdf-translation-head' },
                h('strong', null, `${t('pdf.translation')} · p.${translation.page}`),
                h('button', { type: 'button', className: 'musee-pdf-ann-action', onClick: () => setTranslation(null) }, '×'),
              ),
              translation.error
                ? h('div', { className: 'musee-error' }, translation.error)
                : translating
                  ? h(Loading, { label: t('loading') })
                  : h('div', { className: 'musee-pdf-translation-body' }, translation.text),
            )
          : null,
        h('p', { className: 'musee-pdf-sidehint' }, t('pdf.hint')),
      ),
    ),
    selection
      ? h(
          'div',
          { className: 'musee-pdf-toolbar', style: { left: `${selection.x}px`, top: `${selection.y}px` } },
          h(Button, { size: 'sm', variant: 'primary', onClick: highlight }, t('pdf.highlight')),
          h(Button, { size: 'sm', onClick: startNote }, t('pdf.note')),
          h(Button, { size: 'sm', onClick: translateSelection }, t('pdf.translate')),
        )
      : null,
    noteEditor
      ? h(
          Modal,
          {
            title: t('pdf.noteTitle'),
            onClose: () => setNoteEditor(null),
            footer: [
              h(Button, { key: 'save', variant: 'primary', onClick: saveNote, disabled: saving }, t('pdf.save')),
              h(Button, { key: 'cancel', onClick: () => setNoteEditor(null) }, t('pdf.cancel')),
            ],
          },
          h('blockquote', { className: 'musee-pdf-quote' }, noteEditor.text),
          h('textarea', {
            className: 'musee-textarea',
            value: noteText,
            placeholder: t('pdf.notePlaceholder'),
            onChange: (event) => setNoteText(event.target.value),
          }),
        )
      : null,
  );
}
