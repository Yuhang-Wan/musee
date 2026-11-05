import { h, useState } from './react.js';
import { LANGUAGES } from './i18n.js';
import { api, tFormat } from './api.js';
import { Button, Modal } from './ui.jsx';

function tr(t, key, params) {
  return tFormat(t(key), params);
}

export function SettingsDialog({ t, lang, onLang, targetLang, onTarget, translateTitles, onTranslateTitles, version, dataDir, onClose }) {
  const [ifState, setIfState] = useState({ busy: false, message: '', error: '' });

  const importImpactFactors = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIfState({ busy: true, message: '', error: '' });
    try {
      const parsed = JSON.parse(await file.text());
      const values = Array.isArray(parsed)
        ? parsed.map((entry) => ({
            issn: entry?.issn || entry?.ISSN,
            value: entry?.impactFactor ?? entry?.if ?? entry?.value,
          }))
        : parsed;
      const result = await api.importImpactFactors(values);
      setIfState({
        busy: false,
        message: tr(t, 'settings.ifImported', { count: result.count || 0 }),
        error: '',
      });
    } catch (error) {
      setIfState({ busy: false, message: '', error: tr(t, 'settings.ifError', { message: error.message || String(error) }) });
    }
  };
  return h(
    Modal,
    {
      title: t('settings.title'),
      onClose,
      footer: h(Button, { onClick: onClose }, t('settings.close')),
    },
    h(
      'div',
      { className: 'musee-settings' },
      h(
        'section',
        { className: 'musee-settings-section' },
        h('h3', null, t('settings.appearance')),
        h('p', { className: 'musee-settings-hint' }, t('settings.appearanceHint')),
      ),
      h(
        'section',
        { className: 'musee-settings-section' },
        h('h3', null, t('settings.language')),
        h('p', { className: 'musee-settings-hint' }, t('settings.languageHint')),
        h(
          'div',
          { className: 'musee-seg', role: 'radiogroup', 'aria-label': t('settings.language') },
          LANGUAGES.map((language) =>
            h(
              'button',
              {
                key: language.id,
                type: 'button',
                role: 'radio',
                'aria-checked': lang === language.id,
                className: lang === language.id ? 'active' : '',
                onClick: () => onLang(language.id),
              },
              language.label,
            ),
          ),
        ),
      ),
      h(
        'section',
        { className: 'musee-settings-section' },
        h('h3', null, t('settings.translation')),
        h('p', { className: 'musee-settings-hint' }, t('settings.translationHint')),
        h(
          'div',
          { className: 'musee-seg', role: 'radiogroup', 'aria-label': t('settings.translation') },
          [
            ['zh', '中文'],
            ['fr', 'Français'],
          ].map(([id, label]) =>
            h(
              'button',
              {
                key: id,
                type: 'button',
                role: 'radio',
                'aria-checked': targetLang === id,
                className: targetLang === id ? 'active' : '',
                onClick: () => onTarget(id),
              },
              label,
            ),
          ),
        ),
      ),
      h(
        'section',
        { className: 'musee-settings-section' },
        h('h3', null, t('settings.titles')),
        h('p', { className: 'musee-settings-hint' }, t('settings.titlesHint')),
        h(
          'label',
          { className: 'musee-check-row' },
          h('input', {
            type: 'checkbox',
            checked: Boolean(translateTitles),
            onChange: (event) => onTranslateTitles(event.target.checked),
          }),
          h('span', null, t('settings.titlesToggle')),
        ),
      ),
      h(
        'section',
        { className: 'musee-settings-section' },
        h('h3', null, t('settings.if')),
        h('p', { className: 'musee-settings-hint' }, t('settings.ifHint')),
        h(
          'label',
          { className: 'musee-file' },
          h('input', {
            type: 'file',
            accept: '.json,application/json',
            onChange: importImpactFactors,
            disabled: ifState.busy,
          }),
          ifState.busy ? t('loading') : t('settings.ifChoose'),
        ),
        ifState.error ? h('p', { className: 'musee-error' }, ifState.error) : null,
        ifState.message
          ? h(
              'p',
              { className: 'musee-settings-hint' },
              ifState.message,
              ' ',
              h('button', { type: 'button', className: 'musee-resume', onClick: () => window.location.reload() }, t('settings.refresh')),
            )
          : null,
        dataDir ? h('p', { className: 'musee-settings-hint' }, `${dataDir}\\impact-factors.json`) : null,
      ),
      h(
        'section',
        { className: 'musee-settings-section' },
        h('h3', null, t('settings.about')),
        h(
          'dl',
          { className: 'musee-settings-meta' },
          version ? [h('dt', { key: 'v' }, t('settings.version')), h('dd', { key: 'vv' }, version)] : null,
          dataDir ? [h('dt', { key: 'd' }, t('settings.dataDir')), h('dd', { key: 'dd' }, dataDir)] : null,
        ),
        h('p', { className: 'musee-settings-hint' }, t('settings.note')),
      ),
    ),
  );
}
