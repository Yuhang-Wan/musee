import { h, useEffect, useState } from './react.js';
import { api } from './api.js';
import { ErrorBanner, IconBack, IconExternal, Loading } from './ui.jsx';

export function PdfViewer({ paper, t, onBack }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setUrl('');
    setError('');
    api
      .pdfUrl(paper.arxivId)
      .then((value) => {
        if (alive) setUrl(value);
      })
      .catch((reason) => {
        if (alive) setError(reason.message || String(reason));
      });
    return () => {
      alive = false;
    };
  }, [paper.arxivId]);

  return h(
    'div',
    { className: 'musee-pdf-view' },
    h(
      'div',
      { className: 'musee-reader-head' },
      h('button', { type: 'button', className: 'musee-back', onClick: onBack }, h(IconBack), t('paper.back')),
      h('div', { className: 'musee-reader-title' }, paper.title),
      h('div', { style: { flex: 1 } }),
      h(
        'a',
        { className: 'musee-btn sm', href: `https://arxiv.org/pdf/${paper.arxivId}`, target: '_blank', rel: 'noreferrer' },
        h(IconExternal),
        'PDF',
      ),
    ),
    error
      ? h('div', { className: 'musee-page' }, h(ErrorBanner, { message: `${t('pdf.error')} ${error}`.trim() }))
      : url
        ? h('iframe', { className: 'musee-pdf-frame', src: url, title: t('pdf.title') })
        : h('div', { className: 'musee-page' }, h(Loading, { label: t('pdf.loading') })),
  );
}
