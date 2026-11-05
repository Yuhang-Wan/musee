import DOMPurify from 'dompurify';
import { h, useEffect, useMemo, useRef, useState } from './react.js';
import { api, tFormat } from './api.js';
import { Button, ErrorBanner, IconBack, IconExternal, Loading, Spinner } from './ui.jsx';

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

export function Reader({ paper, t, targetLang, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState('');
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [lightbox, setLightbox] = useState('');
  const articleRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    setData(null);
    setTranslation(null);
    api
      .fulltext(paper.arxivId)
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
          Button,
          { size: 'sm', onClick: translateSection, disabled: translating || !activeSection?.text },
          translating ? h(Spinner) : null,
          translating ? t('reader.translating') : t('reader.translate'),
        )
      : null,
    data?.absUrl ? h('a', { className: 'musee-btn sm', href: data.absUrl, target: '_blank', rel: 'noreferrer' }, 'arXiv') : null,
    data?.pdfUrl
      ? h('a', { className: 'musee-btn sm', href: data.pdfUrl, target: '_blank', rel: 'noreferrer' }, h(IconExternal), 'PDF')
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
      { className: 'musee-reader-body' },
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
          h('div', {
            className: 'musee-fulltext',
            ref: articleRef,
            onClick: onArticleClick,
            dangerouslySetInnerHTML: { __html: sanitized },
          }),
        ),
      ),
    ),
    lightbox
      ? h(
          'div',
          { className: 'musee-lightbox', role: 'button', tabIndex: 0, onClick: () => setLightbox(''), onKeyDown: (event) => { if (event.key === 'Escape') setLightbox(''); } },
          h('img', { src: lightbox, alt: '' }),
        )
      : null,
  );
}
