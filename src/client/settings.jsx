import { h } from './react.js';
import { LANGUAGES } from './i18n.js';
import { Button, Modal } from './ui.jsx';

export function SettingsDialog({ t, lang, onLang, targetLang, onTarget, version, dataDir, onClose }) {
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
