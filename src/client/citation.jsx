import { h, useEffect, useRef, useState } from './react.js';
import { api, tFormat } from './api.js';
import { Button, Loading, Modal } from './ui.jsx';

const FORMATS = [
  ['gb', 'citation.format.gb'],
  ['apa', 'citation.format.apa'],
  ['mla', 'citation.format.mla'],
  ['ieee', 'citation.format.ieee'],
  ['bibtex', 'citation.format.bibtex'],
  ['ris', 'citation.format.ris'],
];

export function CitationDialog({ papers, t, onClose, showToast }) {
  const [format, setFormat] = useState('gb');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .cite(papers, format)
      .then((data) => {
        if (alive) setText(data.text || '');
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [format, papers]);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
      }
      setCopied(true);
      showToast(t('citation.copied'));
      setTimeout(() => setCopied(false), 1600);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        showToast(t('citation.copied'));
      }
    }
  };

  const title = papers.length > 1 ? tFormat(t('citation.titleBatch'), { n: papers.length }) : t('citation.title');

  return h(
    Modal,
    {
      title,
      onClose,
      footer: [
        h(Button, { key: 'copy', variant: 'primary', onClick: copy, disabled: loading || !text }, copied ? t('citation.copied') : t('citation.copy')),
        h(Button, { key: 'close', onClick: onClose }, t('citation.close')),
      ],
    },
    h(
      'div',
      { className: 'musee-tabs', role: 'tablist' },
      FORMATS.map(([id, label]) =>
        h(
          'button',
          { key: id, type: 'button', className: format === id ? 'active' : '', onClick: () => setFormat(id) },
          t(label),
        ),
      ),
    ),
    loading ? h(Loading, { label: t('loading') }) : null,
    error ? h('div', { className: 'musee-error' }, error) : null,
    !loading && !error
      ? h('textarea', { ref: textareaRef, className: 'musee-cite-text', readOnly: true, value: text, spellCheck: false })
      : null,
  );
}
