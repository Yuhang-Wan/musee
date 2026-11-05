import { h, useMemo, useSyncExternalStore } from './react.js';
import { App } from './app.jsx';
import { EN, ZH } from './locale.js';

function createPanel(ctx) {
  return function MuseePanel() {
    const snapshot = useSyncExternalStore(
      (callback) => ctx.locale.subscribe(callback),
      () => ctx.locale.getSnapshot(),
    );
    const t = useMemo(() => ctx.locale.bind('musee'), []);
    return h(App, { t, locale: snapshot.active });
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
  inject: ['slots', 'locale'],
  apply(ctx) {
    ctx.effect(() => ctx.locale.register('musee', 'zh', ZH), 'musee: locale zh');
    ctx.effect(() => ctx.locale.register('musee', 'en', EN), 'musee: locale en');

    const Panel = createPanel(ctx);
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'musee' }, Panel));
    ctx.slots.inject('sidebar.panellist', () =>
      ctx.slots.register({ name: 'sidebar.panellist', id: 'musee', order: 6, label: 'Musee' }, MuseeIcon),
    );
  },
};

globalThis.__MUSEE_PLUGIN__ = plugin;
