import { h, useEffect } from './react.js';

export function Button({ variant = '', size = '', active = false, className = '', ...rest }) {
  const classes = ['musee-btn', variant, size, active ? 'active' : '', className].filter(Boolean).join(' ');
  return h('button', { type: 'button', className: classes, ...rest });
}

export function Pill({ tone = '', children }) {
  return h('span', { className: ['musee-pill', tone].filter(Boolean).join(' ') }, children);
}

export function Spinner() {
  return h('span', { className: 'musee-spinner', 'aria-hidden': 'true' });
}

export function Loading({ label }) {
  return h('div', { className: 'musee-loading' }, h(Spinner), h('span', null, label));
}

export function Empty({ title, detail }) {
  return h('div', { className: 'musee-empty' }, title ? h('strong', null, title) : null, detail ? h('div', null, detail) : null);
}

export function ErrorBanner({ message, onRetry, retryLabel }) {
  return h(
    'div',
    { className: 'musee-error', role: 'alert' },
    h('span', { style: { flex: 1 } }, message),
    onRetry ? h(Button, { size: 'sm', onClick: onRetry }, retryLabel) : null,
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return h(
    'div',
    {
      className: 'musee-backdrop',
      role: 'presentation',
      onMouseDown: (event) => {
        if (event.target === event.currentTarget) onClose();
      },
    },
    h(
      'div',
      { className: 'musee-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h(
        'div',
        { className: 'musee-modal-head' },
        h('h2', null, title),
        h('div', { style: { flex: 1 } }),
        h(Button, { variant: 'ghost', size: 'sm', onClick: onClose, 'aria-label': 'Close' }, h(IconClose)),
      ),
      h('div', { className: 'musee-modal-body' }, children),
      footer ? h('div', { className: 'musee-modal-foot' }, footer) : null,
    ),
  );
}

export function IconBook({ size = 18 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
    h('path', { d: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z' }),
    h('path', { d: 'M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z' }),
    h('path', { d: 'M16 4v6l-1.5-1.2L13 10V4' }),
  );
}

export function IconSearch({ size = 16 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', 'aria-hidden': 'true' },
    h('circle', { cx: 11, cy: 11, r: 6.5 }),
    h('path', { d: 'm16 16 4 4' }),
  );
}

export function IconBack({ size = 16 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
    h('path', { d: 'M15 5 8 12l7 7' }),
  );
}

export function IconExternal({ size = 14 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
    h('path', { d: 'M14 4h6v6' }),
    h('path', { d: 'M20 4 11 13' }),
    h('path', { d: 'M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5' }),
  );
}

export function IconBookmark({ size = 14 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
    h('path', { d: 'M6 4h12v17l-6-4-6 4z' }),
  );
}

export function IconTranslate({ size = 14 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
    h('path', { d: 'M4 5h9' }),
    h('path', { d: 'M8.5 5v2c0 4-2 6.5-4.5 8' }),
    h('path', { d: 'M6 10c1.4 2.2 3.2 3.6 6 4.5' }),
    h('path', { d: 'm13 20 4-10 4 10' }),
    h('path', { d: 'M14.6 16h4.8' }),
  );
}

export function IconQuote({ size = 14 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
    h('path', { d: 'M9 7H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1a3 3 0 0 1-3 3' }),
    h('path', { d: 'M20 7h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1a3 3 0 0 1-3 3' }),
  );
}

export function IconClose({ size = 15 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', 'aria-hidden': 'true' },
    h('path', { d: 'M6 6l12 12M18 6 6 18' }),
  );
}

export function IconSettings({ size = 16 }) {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
    h('circle', { cx: 12, cy: 12, r: 3.2 }),
    h('path', { d: 'M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1' }),
  );
}
