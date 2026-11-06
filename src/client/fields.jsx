import { h, useEffect, useState } from './react.js';
import { api, tFormat } from './api.js';
import { ErrorBanner, IconBack, Loading } from './ui.jsx';

function tr(t, key, params) {
  return tFormat(t(key), params);
}

function fieldName(field, lang) {
  return field?.name?.[lang] || field?.name?.en || field?.id || '';
}

function fieldBlurb(field, lang) {
  return field?.blurb?.[lang] || field?.blurb?.en || '';
}

function metricsText(t, journal) {
  const parts = [];
  if (journal.userIf) parts.push(`${t('metrics.if')} ${journal.userIf}`);
  else if (journal.onlineIf) parts.push(`${t('metrics.ifOa')} ${Number(journal.onlineIf).toFixed(1)}`);
  if (journal.hIndex) parts.push(`${t('metrics.hIndex')} ${journal.hIndex}`);
  if (journal.worksCount) parts.push(tr(t, 'journal.works', { n: Number(journal.worksCount).toLocaleString() }));
  return parts;
}

export function FieldsView({ fields, t, lang, onOpenField }) {
  return h(
    'div',
    { className: 'musee-page musee-fields-page' },
    h(
      'div',
      { className: 'musee-section-head' },
      h('h1', { className: 'musee-display' }, t('fields.title')),
    ),
    h('p', { className: 'musee-settings-hint', style: { maxWidth: '760px', marginBottom: '20px' } }, t('fields.hint')),
    h(
      'div',
      { className: 'musee-field-grid' },
      (fields || []).map((field) =>
        h(
          'button',
          { key: field.id, type: 'button', className: 'musee-field-card', onClick: () => onOpenField(field) },
          h('span', { className: 'musee-field-kicker' }, t('fields.open')),
          h('strong', { className: 'musee-field-name' }, fieldName(field, lang)),
          h('span', { className: 'musee-field-blurb' }, fieldBlurb(field, lang)),
        ),
      ),
    ),
  );
}

export function FieldView({ field, t, lang, onBack, onOpenJournal }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setData(null);
    setError('');
    api
      .field(field.id)
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((reason) => {
        if (alive) setError(reason.message || String(reason));
      });
    return () => {
      alive = false;
    };
  }, [field.id]);

  return h(
    'div',
    { className: 'musee-page musee-fields-page' },
    h('button', { type: 'button', className: 'musee-back', onClick: onBack }, h(IconBack), t('fields.back')),
    h(
      'div',
      { className: 'musee-venue-head' },
      h('div', null, h('span', { className: 'musee-kicker' }, t('fields.kicker')), h('h1', { className: 'musee-display' }, fieldName(field, lang))),
      h('p', { className: 'musee-venue-about' }, fieldBlurb(field, lang)),
    ),
    error ? h(ErrorBanner, { message: error }) : null,
    !data && !error
      ? h('div', { className: 'musee-page' }, h(Loading, { label: t('fields.loading') }))
      : data
        ? h(
            'div',
            { className: 'musee-field-journals' },
            h('p', { className: 'musee-settings-hint' }, t('fields.onlineNote')),
            data.journals.map((journal) =>
              h(
                'button',
                { key: journal.id, type: 'button', className: 'musee-field-journal', onClick: () => onOpenJournal(journal) },
                h(
                  'span',
                  { className: 'musee-field-journal-main' },
                  h('strong', null, journal.name),
                  journal.issn ? h('span', { className: 'musee-field-issn' }, journal.issn) : null,
                ),
                h(
                  'span',
                  { className: 'musee-field-metrics' },
                  metricsText(t, journal).map((part, index) => h('span', { key: `${part}-${index}` }, part)),
                ),
              ),
            ),
          )
        : null,
  );
}
