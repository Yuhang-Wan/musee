import { h, useMemo, useState } from './react.js';
import { App } from './app.jsx';
import { makeT, readStoredLang, readStoredTarget } from './i18n.js';

function createPanel(ctx) {
  return function MuseePanel() {
    const [lang, setLangState] = useState(() => readStoredLang(ctx));
    const [targetLang, setTargetLangState] = useState(() => readStoredTarget(readStoredLang(ctx)));
    const t = useMemo(() => makeT(lang), [lang]);

    const setLang = (next) => {
      try {
        localStorage.setItem('musee.lang', next);
      } catch {
        /* ignore unavailable storage */
      }
      setLangState(next);
    };
    const setTargetLang = (next) => {
      try {
        localStorage.setItem('musee.target', next);
      } catch {
        /* ignore unavailable storage */
      }
      setTargetLangState(next);
    };

    return h(App, { t, lang, setLang, targetLang, setTargetLang });
  };
}

function MuseeIcon({ size = 18, active = false }) {
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      opacity: active ? 1 : 0.72,
      'aria-hidden': 'true',
    },
    h('path', { d: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15.5H5.5A1.5 1.5 0 0 1 4 18z' }),
    h('path', { d: 'M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15.5h5.5A1.5 1.5 0 0 0 20 18z' }),
    h('path', { d: 'M16.2 4v5.6L14.8 8.5l-1.4 1.1V4' }),
  );
}

const plugin = {
  inject: ['slots'],
  apply(ctx) {
    const Panel = createPanel(ctx);
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'musee' }, Panel));
    ctx.slots.inject('sidebar.panellist', () =>
      ctx.slots.register({ name: 'sidebar.panellist', id: 'musee', order: 6, label: 'Musee' }, MuseeIcon),
    );
  },
};

globalThis.__MUSEE_PLUGIN__ = plugin;
