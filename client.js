window.__ModuleLoader__.load({
  id: 'dsh-musee',
  factory(require) {
    globalThis.__MUSEE_REACT__ = require('react');
    (() => {
      // src/client/react.js
      var React = globalThis.__MUSEE_REACT__;
      var {
        createElement: h,
        Fragment,
        useState,
        useEffect,
        useMemo,
        useRef,
        useCallback,
        useSyncExternalStore
      } = React;

      // src/client/api.js
      function museeToken() {
        return document.querySelector('meta[name="musee-token"]')?.getAttribute("content") || "";
      }
      var tokenPromise = null;
      async function ensureToken() {
        const inline = museeToken();
        if (inline) return inline;
        if (!tokenPromise) {
          tokenPromise = fetch("/musee/api/handshake", { headers: { accept: "application/json" } }).then(async (response) => {
            if (!response.ok) throw new Error("NO_TOKEN");
            const data = await response.json();
            if (!data.token) throw new Error("NO_TOKEN");
            return data.token;
          }).catch((error) => {
            tokenPromise = null;
            throw error;
          });
        }
        return tokenPromise;
      }
      function tFormat(template, params = {}) {
        return String(template).replace(/\{(\w+)\}/g, (_, key) => params[key] === void 0 ? `{${key}}` : String(params[key]));
      }
      async function request(path, options = {}) {
        const token = await ensureToken();
        if (!token) throw new Error("NO_TOKEN");
        const response = await fetch(`/musee/api${path}`, {
          method: options.method || "GET",
          headers: {
            "x-musee-token": token,
            ...options.body ? { "content-type": "application/json" } : {}
          },
          body: options.body ? JSON.stringify(options.body) : void 0
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        return data;
      }
      var api = {
        bootstrap: () => request("/bootstrap"),
        library: () => request("/library"),
        journal: (journalId, limit = 20) => request(`/journal?journalId=${encodeURIComponent(journalId)}&limit=${limit}`),
        arxiv: (category, limit = 20) => request(`/arxiv?category=${encodeURIComponent(category)}&limit=${limit}`),
        search: (query, limit = 20) => request(`/search?q=${encodeURIComponent(query)}&limit=${limit}`),
        translate: (title, abstract) => request("/translate", { method: "POST", body: { title, abstract } }),
        save: (paper) => request("/library", { method: "POST", body: { action: "save", paper } }),
        update: (id, patch) => request("/library", { method: "POST", body: { action: "update", id, patch } }),
        remove: (id) => request("/library", { method: "POST", body: { action: "remove", id } }),
        cite: (papers, format) => request("/cite", { method: "POST", body: { papers, format } })
      };
      async function downloadExport(format, filename) {
        const token = await ensureToken();
        if (!token) throw new Error("NO_TOKEN");
        const response = await fetch(`/musee/api/export?format=${encodeURIComponent(format)}`, {
          headers: { "x-musee-token": token }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        saveBlob(blob, filename);
      }
      function downloadText(filename, text, mime = "text/plain;charset=utf-8") {
        saveBlob(new Blob([text], { type: mime }), filename);
      }
      function saveBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2e3);
      }

      // src/client/styles.js
      var CSS = `
    .musee-root {
      --musee-radius: 10px;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      background: var(--dsw-alias-bg-base);
      color: var(--dsw-alias-label-primary);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .musee-root *, .musee-root *::before, .musee-root *::after { box-sizing: border-box; }
    .musee-root button, .musee-root input, .musee-root textarea, .musee-root select { font: inherit; color: inherit; }
    .musee-root a { color: var(--dsw-alias-brand-primary); text-decoration: none; }
    .musee-root a:hover { text-decoration: underline; }
    .musee-root :focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }

    .musee-header {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 18px;
      height: 56px;
      padding: 0 18px;
      border-bottom: 1px solid var(--dsw-alias-border-l1);
      background: var(--dsw-alias-bg-layer-1);
    }
    .musee-brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
    .musee-brand-mark { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-brand-primary); flex: 0 0 auto; }
    .musee-brand-name { font-weight: 650; letter-spacing: .01em; }
    .musee-tagline { color: var(--dsw-alias-label-secondary); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .musee-nav { display: flex; gap: 4px; }
    .musee-nav-btn { border: 0; background: transparent; color: var(--dsw-alias-label-secondary); padding: 6px 10px; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .musee-nav-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
    .musee-nav-btn.active { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
    .musee-nav-count { margin-left: 6px; font-size: 11px; color: var(--dsw-alias-label-secondary); }

    .musee-search { margin-left: auto; display: flex; align-items: center; gap: 8px; width: min(340px, 40%); }
    .musee-search input {
      width: 100%;
      height: 32px;
      padding: 0 11px;
      border: 1px solid var(--dsw-alias-border-l1);
      border-radius: 8px;
      background: var(--dsw-alias-bg-base);
      color: var(--dsw-alias-label-primary);
    }
    .musee-search input::placeholder { color: var(--dsw-alias-label-secondary); }

    .musee-body { flex: 1 1 auto; display: flex; min-height: 0; }

    .musee-rail {
      flex: 0 0 244px;
      width: 244px;
      min-height: 0;
      overflow: auto;
      padding: 14px 10px 28px;
      border-right: 1px solid var(--dsw-alias-border-l1);
      background: var(--dsw-alias-bg-layer-1);
    }
    .musee-rail-title { padding: 4px 8px 8px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--dsw-alias-label-secondary); }
    .musee-rail-group { margin-bottom: 12px; }
    .musee-rail-item {
      display: block;
      width: 100%;
      text-align: left;
      border: 0;
      background: transparent;
      color: var(--dsw-alias-label-secondary);
      padding: 7px 8px;
      border-radius: 7px;
      cursor: pointer;
      line-height: 1.35;
    }
    .musee-rail-item:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
    .musee-rail-item.active { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; }
    .musee-rail-sub { display: block; font-size: 11px; color: var(--dsw-alias-label-secondary); margin-top: 2px; font-weight: 400; }

    .musee-main { flex: 1 1 auto; min-width: 0; min-height: 0; overflow: auto; }
    .musee-page { max-width: 1080px; margin: 0 auto; padding: 28px 32px 80px; }
    .musee-page.narrow { max-width: 880px; }

    .musee-hero h1 { margin: 0 0 6px; font-size: 24px; line-height: 1.3; letter-spacing: -0.01em; }
    .musee-hero p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; max-width: 720px; }

    .musee-seg { display: inline-flex; gap: 2px; padding: 3px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; background: var(--dsw-alias-bg-layer-1); }
    .musee-seg button { border: 0; background: transparent; color: var(--dsw-alias-label-secondary); padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .musee-seg button.active { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; }

    .musee-section { margin-top: 26px; }
    .musee-section-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
    .musee-section-head h2 { margin: 0; font-size: 15px; font-weight: 600; }
    .musee-section-head span { color: var(--dsw-alias-label-secondary); font-size: 12px; }

    .musee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(252px, 1fr)); gap: 10px; }
    .musee-journal {
      text-align: left;
      border: 1px solid var(--dsw-alias-border-l1);
      border-radius: var(--musee-radius);
      background: var(--dsw-alias-bg-layer-1);
      padding: 14px;
      cursor: pointer;
      min-height: 92px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .musee-journal:hover { border-color: var(--dsw-alias-border-l2); }
    .musee-journal-name { font-weight: 600; line-height: 1.35; }
    .musee-journal-meta { margin-top: auto; color: var(--dsw-alias-label-secondary); font-size: 11px; display: flex; gap: 8px; flex-wrap: wrap; }

    .musee-arxiv-row { display: flex; flex-wrap: wrap; gap: 8px; }

    .musee-paper-list { display: flex; flex-direction: column; gap: 9px; }
    .musee-paper {
      display: block;
      width: 100%;
      text-align: left;
      border: 1px solid var(--dsw-alias-border-l1);
      border-radius: var(--musee-radius);
      background: var(--dsw-alias-bg-layer-1);
      padding: 14px 16px;
      cursor: pointer;
    }
    .musee-paper:hover { border-color: var(--dsw-alias-border-l2); }
    .musee-paper-title { font-weight: 600; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .musee-paper-meta { margin-top: 7px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; color: var(--dsw-alias-label-secondary); font-size: 12px; }

    .musee-pill { display: inline-flex; align-items: center; gap: 4px; padding: 1px 7px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px; font-size: 11px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
    .musee-pill.success { color: var(--dsw-alias-state-success-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 45%, transparent); }
    .musee-pill.brand { color: var(--dsw-alias-brand-primary); border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent); }

    .musee-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 30px;
      padding: 0 12px;
      border: 1px solid var(--dsw-alias-border-l1);
      border-radius: 8px;
      background: var(--dsw-alias-bg-layer-1);
      color: var(--dsw-alias-label-primary);
      cursor: pointer;
      white-space: nowrap;
      font-size: 13px;
    }
    .musee-btn:hover { border-color: var(--dsw-alias-border-l2); }
    .musee-btn:disabled { opacity: .55; cursor: default; }
    .musee-btn.primary { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-brand-primary); background: transparent; }
    .musee-btn.primary.active { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 12%, transparent); }
    .musee-btn.ghost { border-color: transparent; background: transparent; color: var(--dsw-alias-label-secondary); padding: 0 8px; }
    .musee-btn.ghost:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
    .musee-btn.danger { color: var(--dsw-alias-state-error-primary); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent); background: transparent; }
    .musee-btn.sm { height: 26px; padding: 0 9px; font-size: 12px; }

    .musee-back { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--dsw-alias-label-secondary); padding: 4px 0; cursor: pointer; font-size: 13px; }
    .musee-back:hover { color: var(--dsw-alias-label-primary); }

    .musee-article { max-width: 840px; margin: 0 auto; padding: 26px 36px 100px; }
    .musee-article h1 { margin: 10px 0 12px; font-size: 27px; line-height: 1.38; letter-spacing: -0.012em; font-weight: 650; }
    .musee-article .translated-title { margin: 0 0 14px; padding-left: 14px; border-left: 2px solid var(--dsw-alias-brand-primary); color: var(--dsw-alias-label-primary); font-size: 17px; line-height: 1.6; }
    .musee-authors { color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.7; }
    .musee-meta-line { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 10px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; }
    .musee-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 26px; }

    .musee-card { border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); padding: 18px 20px; margin-top: 16px; }
    .musee-card h2 { margin: 0 0 10px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .musee-card h2 .musee-hint { font-weight: 400; font-size: 12px; color: var(--dsw-alias-label-secondary); }
    .musee-abstract { font-size: 15.5px; line-height: 1.9; white-space: pre-wrap; }
    .musee-translated { margin-top: 16px; padding: 14px 0 0 16px; border-left: 2px solid var(--dsw-alias-brand-primary); font-size: 15.5px; line-height: 1.95; white-space: pre-wrap; }
    .musee-divider { height: 1px; background: var(--dsw-alias-border-l1); margin: 16px 0; }

    .musee-field { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
    .musee-field > label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
    .musee-input, .musee-textarea, .musee-select {
      width: 100%;
      border: 1px solid var(--dsw-alias-border-l1);
      border-radius: 8px;
      background: var(--dsw-alias-bg-base);
      color: var(--dsw-alias-label-primary);
      padding: 8px 10px;
    }
    .musee-textarea { min-height: 132px; resize: vertical; line-height: 1.7; }
    .musee-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .musee-row > .grow { flex: 1 1 240px; }
    .musee-save-state { font-size: 11px; color: var(--dsw-alias-label-secondary); margin-left: auto; }

    .musee-meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px 20px; }
    .musee-meta-grid dt { font-size: 11px; color: var(--dsw-alias-label-secondary); margin: 0 0 3px; }
    .musee-meta-grid dd { margin: 0; font-size: 13px; word-break: break-word; }

    .musee-empty { padding: 44px 20px; text-align: center; color: var(--dsw-alias-label-secondary); font-size: 13px; }
    .musee-empty strong { display: block; color: var(--dsw-alias-label-primary); font-size: 15px; margin-bottom: 6px; }

    .musee-spinner { width: 15px; height: 15px; border: 2px solid var(--dsw-alias-border-l2); border-top-color: var(--dsw-alias-brand-primary); border-radius: 50%; animation: musee-spin .8s linear infinite; display: inline-block; vertical-align: -2px; }
    @keyframes musee-spin { to { transform: rotate(360deg); } }
    .musee-loading { display: flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-secondary); padding: 26px 4px; font-size: 13px; }
    .musee-error { border: 1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 40%, transparent); color: var(--dsw-alias-state-error-primary); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); border-radius: 9px; padding: 10px 12px; font-size: 13px; display: flex; gap: 10px; align-items: center; }

    .musee-backdrop {
      position: fixed; inset: 0; z-index: 80;
      background: color-mix(in srgb, var(--dsw-alias-label-primary) 20%, transparent);
      display: flex; align-items: center; justify-content: center; padding: 22px;
    }
    .musee-modal {
      width: min(760px, 100%); max-height: 84vh;
      display: flex; flex-direction: column;
      background: var(--dsw-alias-bg-overlay);
      border: 1px solid var(--dsw-alias-border-l1);
      border-radius: 14px;
      box-shadow: 0 24px 70px color-mix(in srgb, var(--dsw-alias-label-primary) 22%, transparent);
      overflow: hidden;
    }
    .musee-modal-head { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
    .musee-modal-head h2 { margin: 0; font-size: 15px; font-weight: 600; }
    .musee-modal-body { padding: 16px 18px; overflow: auto; }
    .musee-modal-foot { padding: 12px 18px; border-top: 1px solid var(--dsw-alias-border-l1); display: flex; gap: 8px; align-items: center; }
    .musee-tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px; }
    .musee-tabs button { border: 1px solid transparent; background: transparent; color: var(--dsw-alias-label-secondary); padding: 4px 9px; border-radius: 7px; cursor: pointer; font-size: 12px; }
    .musee-tabs button.active { border-color: var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
    .musee-cite-text { width: 100%; min-height: 220px; resize: vertical; border: 1px solid var(--dsw-alias-border-l1); border-radius: 9px; background: var(--dsw-alias-bg-base); padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; line-height: 1.7; white-space: pre-wrap; }

    .musee-lib-list { display: flex; flex-direction: column; gap: 8px; }
    .musee-lib-row { display: flex; gap: 12px; align-items: flex-start; padding: 13px 14px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-1); }
    .musee-lib-row:hover { border-color: var(--dsw-alias-border-l2); }
    .musee-check { width: 15px; height: 15px; margin-top: 3px; accent-color: var(--dsw-alias-brand-primary); flex: 0 0 auto; }
    .musee-lib-main { min-width: 0; flex: 1; cursor: pointer; }
    .musee-lib-title { font-weight: 600; line-height: 1.45; }
    .musee-lib-meta { margin-top: 5px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; color: var(--dsw-alias-label-secondary); font-size: 12px; }
    .musee-lib-note { margin-top: 6px; color: var(--dsw-alias-label-secondary); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .musee-batchbar {
      position: sticky; bottom: 12px; z-index: 5;
      margin-top: 16px; padding: 10px 12px;
      display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
      border: 1px solid var(--dsw-alias-border-l1);
      border-radius: 11px;
      background: var(--dsw-alias-bg-overlay);
      box-shadow: 0 8px 28px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);
      font-size: 13px;
    }

    .musee-toast {
      position: fixed; left: 50%; bottom: 26px; transform: translateX(-50%);
      z-index: 90; max-width: min(520px, calc(100vw - 40px));
      padding: 9px 14px; border-radius: 9px;
      background: var(--dsw-alias-bg-overlay);
      border: 1px solid var(--dsw-alias-border-l1);
      box-shadow: 0 10px 30px color-mix(in srgb, var(--dsw-alias-label-primary) 16%, transparent);
      font-size: 13px;
    }

    .musee-rail::-webkit-scrollbar, .musee-main::-webkit-scrollbar, .musee-modal-body::-webkit-scrollbar { width: 10px; height: 10px; }
    .musee-rail::-webkit-scrollbar-thumb, .musee-main::-webkit-scrollbar-thumb, .musee-modal-body::-webkit-scrollbar-thumb { background: var(--dsw-alias-border-l1); border-radius: 999px; border: 3px solid transparent; background-clip: padding-box; }
    .musee-rail { scrollbar-width: thin; scrollbar-color: var(--dsw-alias-border-l1) transparent; }
    .musee-main { scrollbar-width: thin; scrollbar-color: var(--dsw-alias-border-l1) transparent; }

    @media (max-width: 920px) {
      .musee-rail { display: none; }
      .musee-page { padding: 20px 18px 70px; }
      .musee-article { padding: 20px 18px 80px; }
      .musee-tagline { display: none; }
      .musee-search { width: 46%; }
      .musee-header { gap: 12px; }
    }
    @media (max-width: 640px) {
      .musee-search { width: 100%; margin-left: 0; }
      .musee-header { height: auto; flex-wrap: wrap; padding: 10px 14px; gap: 10px; }
      .musee-nav { order: 3; }
    }
    `;

      // src/client/ui.jsx
      function Button({ variant = "", size = "", active = false, className = "", ...rest }) {
        const classes = ["musee-btn", variant, size, active ? "active" : "", className].filter(Boolean).join(" ");
        return h("button", { type: "button", className: classes, ...rest });
      }
      function Pill({ tone = "", children }) {
        return h("span", { className: ["musee-pill", tone].filter(Boolean).join(" ") }, children);
      }
      function Spinner() {
        return h("span", { className: "musee-spinner", "aria-hidden": "true" });
      }
      function Loading({ label }) {
        return h("div", { className: "musee-loading" }, h(Spinner), h("span", null, label));
      }
      function Empty({ title, detail }) {
        return h("div", { className: "musee-empty" }, title ? h("strong", null, title) : null, detail ? h("div", null, detail) : null);
      }
      function ErrorBanner({ message, onRetry, retryLabel }) {
        return h(
          "div",
          { className: "musee-error", role: "alert" },
          h("span", { style: { flex: 1 } }, message),
          onRetry ? h(Button, { size: "sm", onClick: onRetry }, retryLabel) : null
        );
      }
      function Modal({ title, onClose, children, footer }) {
        useEffect(() => {
          const onKey = (event) => {
            if (event.key === "Escape") onClose();
          };
          window.addEventListener("keydown", onKey);
          return () => window.removeEventListener("keydown", onKey);
        }, [onClose]);
        return h(
          "div",
          {
            className: "musee-backdrop",
            role: "presentation",
            onMouseDown: (event) => {
              if (event.target === event.currentTarget) onClose();
            }
          },
          h(
            "div",
            { className: "musee-modal", role: "dialog", "aria-modal": "true", "aria-label": title },
            h(
              "div",
              { className: "musee-modal-head" },
              h("h2", null, title),
              h("div", { style: { flex: 1 } }),
              h(Button, { variant: "ghost", size: "sm", onClick: onClose, "aria-label": "Close" }, h(IconClose))
            ),
            h("div", { className: "musee-modal-body" }, children),
            footer ? h("div", { className: "musee-modal-foot" }, footer) : null
          )
        );
      }
      function IconBook({ size = 18 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
          h("path", { d: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" }),
          h("path", { d: "M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" }),
          h("path", { d: "M16 4v6l-1.5-1.2L13 10V4" })
        );
      }
      function IconSearch({ size = 16 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", "aria-hidden": "true" },
          h("circle", { cx: 11, cy: 11, r: 6.5 }),
          h("path", { d: "m16 16 4 4" })
        );
      }
      function IconBack({ size = 16 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
          h("path", { d: "M15 5 8 12l7 7" })
        );
      }
      function IconExternal({ size = 14 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
          h("path", { d: "M14 4h6v6" }),
          h("path", { d: "M20 4 11 13" }),
          h("path", { d: "M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" })
        );
      }
      function IconBookmark({ size = 14 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
          h("path", { d: "M6 4h12v17l-6-4-6 4z" })
        );
      }
      function IconTranslate({ size = 14 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
          h("path", { d: "M4 5h9" }),
          h("path", { d: "M8.5 5v2c0 4-2 6.5-4.5 8" }),
          h("path", { d: "M6 10c1.4 2.2 3.2 3.6 6 4.5" }),
          h("path", { d: "m13 20 4-10 4 10" }),
          h("path", { d: "M14.6 16h4.8" })
        );
      }
      function IconQuote({ size = 14 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
          h("path", { d: "M9 7H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1a3 3 0 0 1-3 3" }),
          h("path", { d: "M20 7h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1a3 3 0 0 1-3 3" })
        );
      }
      function IconClose({ size = 15 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", "aria-hidden": "true" },
          h("path", { d: "M6 6l12 12M18 6 6 18" })
        );
      }

      // src/client/paper.jsx
      function tr(t, key, params) {
        return tFormat(t(key), params);
      }
      function shortAuthors(authors = []) {
        if (authors.length <= 3) return authors.join(", ");
        return `${authors.slice(0, 3).join(", ")} 等`;
      }
      function PaperList({ papers, onOpen, libraryById, t, emptyTitle }) {
        if (!papers.length) return h(Empty, { title: emptyTitle || t("empty") });
        return h(
          "div",
          { className: "musee-paper-list" },
          papers.map((paper) => {
            const saved = libraryById?.has(paper.id);
            return h(
              "button",
              { key: paper.id, type: "button", className: "musee-paper", onClick: () => onOpen(paper) },
              h("div", { className: "musee-paper-title" }, paper.title),
              h(
                "div",
                { className: "musee-paper-meta" },
                paper.journal?.name ? h("span", null, paper.journal.name) : paper.source === "arxiv" ? h(Pill, { tone: "brand" }, "arXiv") : null,
                paper.year ? h("span", null, String(paper.year)) : null,
                paper.authors?.length ? h("span", null, shortAuthors(paper.authors)) : null,
                paper.openAccess ? h(Pill, { tone: "success" }, t("paper.oa")) : null,
                paper.citedBy ? h("span", null, tr(t, "paper.cited", { n: paper.citedBy })) : null,
                saved ? h(Pill, { tone: "brand" }, t("paper.saved")) : null
              )
            );
          })
        );
      }
      function PaperDetail({ paper, item, t, onBack, onSave, onUpdate, onTranslate, translation, translating, onCite }) {
        const [mode, setMode] = useState("both");
        const [note, setNote] = useState("");
        const [tags, setTags] = useState("");
        const [status, setStatus] = useState("unread");
        const [dirty, setDirty] = useState(false);
        const [saveState, setSaveState] = useState("idle");
        const dirtyRef = useRef(false);
        useEffect(() => {
          setNote(item?.note || "");
          setTags((item?.tags || []).join(", "));
          setStatus(item?.status || "unread");
          dirtyRef.current = false;
          setDirty(false);
          setSaveState("idle");
        }, [paper.id, item?.id]);
        useEffect(() => {
          if (!item || !dirty) return void 0;
          const timer = setTimeout(async () => {
            try {
              setSaveState("saving");
              await onUpdate(item.id, {
                note,
                tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean)
              });
              dirtyRef.current = false;
              setDirty(false);
              setSaveState("saved");
            } catch {
              setSaveState("idle");
            }
          }, 900);
          return () => clearTimeout(timer);
        }, [note, tags, dirty, item?.id]);
        const hasTranslation = Boolean(translation?.title || translation?.abstract);
        const showTranslated = hasTranslation && mode !== "original";
        const showOriginal = !hasTranslation || mode !== "translated";
        const title = paper.title;
        const metaRows = [];
        const addMeta = (key, label, value) => {
          if (value === void 0 || value === null || value === "") return;
          metaRows.push(h(Fragment, { key }, h("dt", null, label), h("dd", null, value)));
        };
        addMeta("journal", t("paper.journal"), paper.journal?.name);
        addMeta("year", t("paper.year"), paper.year ? String(paper.year) : "");
        addMeta(
          "doi",
          t("paper.doi"),
          paper.doi ? h("a", { href: `https://doi.org/${paper.doi}`, target: "_blank", rel: "noreferrer" }, paper.doi) : ""
        );
        addMeta("issn", t("paper.issn"), paper.journal?.issn);
        addMeta("volume", t("paper.volume"), paper.volume);
        addMeta("issue", t("paper.issue"), paper.issue);
        addMeta("pages", t("paper.pages"), paper.pages);
        addMeta(
          "arxiv",
          "arXiv",
          paper.source === "arxiv" && paper.arxiv?.primaryCategory ? `${paper.arxiv.id} · ${paper.arxiv.primaryCategory}` : ""
        );
        return h(
          "div",
          { className: "musee-article" },
          h("button", { type: "button", className: "musee-back", onClick: onBack }, h(IconBack), t("paper.back")),
          hasTranslation ? h(
            "div",
            { className: "musee-seg", style: { marginTop: "14px" }, role: "tablist" },
            h("button", { type: "button", className: mode === "original" ? "active" : "", onClick: () => setMode("original") }, t("paper.original")),
            h("button", { type: "button", className: mode === "translated" ? "active" : "", onClick: () => setMode("translated") }, t("paper.translated")),
            h("button", { type: "button", className: mode === "both" ? "active" : "", onClick: () => setMode("both") }, t("paper.both"))
          ) : null,
          h("h1", null, showTranslated && translation?.title ? translation.title : title),
          showTranslated && translation?.title && mode === "both" ? h("div", { className: "translated-title" }, title) : null,
          paper.authors?.length ? h("div", { className: "musee-authors" }, paper.authors.join(" · ")) : null,
          h(
            "div",
            { className: "musee-meta-line" },
            paper.journal?.name ? h("span", null, paper.journal.name) : paper.source === "arxiv" ? h(Pill, { tone: "brand" }, "arXiv") : null,
            paper.year ? h("span", null, String(paper.year)) : null,
            paper.volume ? h("span", null, `${t("paper.volume")} ${paper.volume}`) : null,
            paper.issue ? h("span", null, `${t("paper.issue")} ${paper.issue}`) : null,
            paper.pages ? h("span", null, `${t("paper.pages")} ${paper.pages}`) : null,
            paper.openAccess ? h(Pill, { tone: "success" }, t("paper.oa")) : null,
            paper.citedBy ? h("span", null, tr(t, "paper.cited", { n: paper.citedBy })) : null
          ),
          h(
            "div",
            { className: "musee-actions" },
            h(
              Button,
              { variant: "primary", active: Boolean(item), onClick: () => item ? null : onSave(paper), disabled: Boolean(item) },
              h(IconBookmark),
              item ? t("paper.saved") : t("paper.save")
            ),
            h(
              Button,
              { onClick: () => onTranslate(paper), disabled: translating || Boolean(hasTranslation) },
              translating ? h(Spinner) : h(IconTranslate),
              translating ? t("paper.translating") : t("paper.translate")
            ),
            h(Button, { onClick: () => onCite([item || paper]) }, h(IconQuote), t("paper.cite")),
            paper.url ? h("a", { className: "musee-btn", href: paper.url, target: "_blank", rel: "noreferrer" }, h(IconExternal), t("paper.open")) : null
          ),
          h(
            "div",
            { className: "musee-card" },
            h("h2", null, t("paper.abstract")),
            !paper.abstract && !hasTranslation ? h("div", { className: "musee-empty", style: { padding: "14px 0" } }, t("paper.noAbstract")) : null,
            showOriginal && paper.abstract ? h("div", { className: "musee-abstract" }, paper.abstract) : null,
            showTranslated && translation?.abstract ? h("div", { className: "musee-translated" }, translation.abstract) : null
          ),
          item ? h(
            "div",
            { className: "musee-card" },
            h(
              "h2",
              null,
              t("paper.notes"),
              saveState === "saving" ? h("span", { className: "musee-hint" }, "…") : null,
              saveState === "saved" ? h("span", { className: "musee-hint" }, "✓") : null
            ),
            h(
              "div",
              { className: "musee-row" },
              h(
                "label",
                { className: "musee-row", style: { gap: "8px" } },
                h("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)" } }, t("paper.status")),
                h(
                  "select",
                  {
                    className: "musee-select",
                    style: { width: "auto" },
                    value: status,
                    onChange: (event) => {
                      const next = event.target.value;
                      setStatus(next);
                      onUpdate(item.id, { status: next }).catch(() => {
                      });
                    }
                  },
                  h("option", { value: "unread" }, t("status.unread")),
                  h("option", { value: "reading" }, t("status.reading")),
                  h("option", { value: "read" }, t("status.read"))
                )
              ),
              h("div", { className: "grow" }),
              h("span", { className: "musee-save-state" }, saveState === "saved" ? t("toast.updated") : "")
            ),
            h(
              "div",
              { className: "musee-field" },
              h("label", null, t("paper.tags")),
              h("input", {
                className: "musee-input",
                value: tags,
                placeholder: t("paper.tagsHint"),
                onChange: (event) => {
                  setTags(event.target.value);
                  dirtyRef.current = true;
                  setDirty(true);
                }
              })
            ),
            h(
              "div",
              { className: "musee-field" },
              h("textarea", {
                className: "musee-textarea",
                value: note,
                placeholder: t("paper.notesHint"),
                onChange: (event) => {
                  setNote(event.target.value);
                  dirtyRef.current = true;
                  setDirty(true);
                }
              })
            )
          ) : h(
            "div",
            { className: "musee-card" },
            h("h2", null, t("paper.notes")),
            h("div", { style: { color: "var(--dsw-alias-label-secondary)", fontSize: "13px" } }, t("paper.notesHint"))
          ),
          h(
            "div",
            { className: "musee-card" },
            h("h2", null, t("paper.meta")),
            h(
              "dl",
              { className: "musee-meta-grid" },
              metaRows
            )
          )
        );
      }

      // src/client/library.jsx
      var FILTERS = [
        ["all", "library.filterAll"],
        ["unread", "status.unread"],
        ["reading", "status.reading"],
        ["read", "status.read"]
      ];
      function statusTone(status) {
        if (status === "read") return "success";
        if (status === "reading") return "brand";
        return "";
      }
      function LibraryView({ items, t, onOpen, onRemove, onCite, onExport, showToast }) {
        const [filter, setFilter] = useState("all");
        const [selected, setSelected] = useState(() => /* @__PURE__ */ new Set());
        const filtered = useMemo(
          () => filter === "all" ? items : items.filter((item) => (item.status || "unread") === filter),
          [items, filter]
        );
        const selectedItems = useMemo(() => items.filter((item) => selected.has(item.id)), [items, selected]);
        const toggle = (id) => {
          setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        };
        const toggleAll = () => {
          setSelected((current) => {
            const allSelected = filtered.length > 0 && filtered.every((item) => current.has(item.id));
            if (allSelected) return /* @__PURE__ */ new Set();
            return new Set(filtered.map((item) => item.id));
          });
        };
        const exportWith = async (format, filename) => {
          try {
            await onExport(format, filename);
            showToast(t("toast.exported"));
          } catch (error) {
            showToast(error.message);
          }
        };
        const exportSelected = async (format, filename) => {
          try {
            const data = await api.cite(selectedItems, format);
            const mime = format === "bibtex" ? "application/x-bibtex;charset=utf-8" : "application/x-research-info-systems;charset=utf-8";
            downloadText(filename, data.text, mime);
            showToast(t("toast.exported"));
          } catch (error) {
            showToast(error.message);
          }
        };
        return h(
          "div",
          { className: "musee-page" },
          h("div", { className: "musee-hero" }, h("h1", null, t("library.title")), h("p", null, t("library.subtitle"))),
          h(
            "div",
            { className: "musee-row", style: { marginTop: "18px" } },
            h(
              "div",
              { className: "musee-seg", role: "tablist" },
              FILTERS.map(
                ([id, label]) => h("button", { key: id, type: "button", className: filter === id ? "active" : "", onClick: () => setFilter(id) }, t(label))
              )
            ),
            h("div", { style: { flex: 1 } }),
            h(Button, { size: "sm", onClick: () => exportWith("md", "musee-library.md") }, t("library.exportMd")),
            filtered.length ? h("button", { type: "button", className: "musee-back", onClick: toggleAll }, t("library.selectAll")) : null
          ),
          !items.length ? h(Empty, { title: t("library.empty") }) : !filtered.length ? h(Empty, { title: t("empty") }) : h(
            "div",
            { className: "musee-lib-list", style: { marginTop: "14px" } },
            filtered.map(
              (item) => h(
                "div",
                { key: item.id, className: "musee-lib-row" },
                h("input", {
                  type: "checkbox",
                  className: "musee-check",
                  checked: selected.has(item.id),
                  onChange: () => toggle(item.id),
                  "aria-label": item.title
                }),
                h(
                  "div",
                  { className: "musee-lib-main", onClick: () => onOpen(item), role: "button", tabIndex: 0, onKeyDown: (e) => {
                    if (e.key === "Enter") onOpen(item);
                  } },
                  h("div", { className: "musee-lib-title" }, item.title),
                  h(
                    "div",
                    { className: "musee-lib-meta" },
                    item.journal?.name ? h("span", null, item.journal.name) : item.source === "arxiv" ? h(Pill, { tone: "brand" }, "arXiv") : null,
                    item.year ? h("span", null, String(item.year)) : null,
                    h(Pill, { tone: statusTone(item.status) }, t(`status.${item.status || "unread"}`)),
                    item.tags?.length ? h("span", null, item.tags.join(" · ")) : null,
                    item.note ? h("span", null, tFormat(t("library.notesCount"), { n: item.note.length })) : null
                  ),
                  item.note ? h("div", { className: "musee-lib-note" }, item.note.replace(/\s+/g, " ").slice(0, 120)) : null
                ),
                h("button", { type: "button", className: "musee-btn ghost sm", onClick: () => onRemove(item) }, t("library.remove"))
              )
            )
          ),
          selected.size ? h(
            "div",
            { className: "musee-batchbar" },
            h("strong", null, tFormat(t("library.selected"), { n: selected.size })),
            h(Button, { variant: "primary", size: "sm", onClick: () => onCite(selectedItems) }, t("library.cite")),
            h(Button, { size: "sm", onClick: () => exportSelected("bibtex", "musee-selection.bib") }, t("library.exportBibtex")),
            h(Button, { size: "sm", onClick: () => exportSelected("ris", "musee-selection.ris") }, t("library.exportRis")),
            h(Button, { variant: "danger", size: "sm", onClick: async () => {
              for (const item of selectedItems) await onRemove(item);
              setSelected(/* @__PURE__ */ new Set());
            } }, t("library.remove")),
            h("button", { type: "button", className: "musee-back", onClick: () => setSelected(/* @__PURE__ */ new Set()) }, t("library.clear"))
          ) : null
        );
      }

      // src/client/citation.jsx
      var FORMATS = [
        ["gb", "citation.format.gb"],
        ["apa", "citation.format.apa"],
        ["mla", "citation.format.mla"],
        ["ieee", "citation.format.ieee"],
        ["bibtex", "citation.format.bibtex"],
        ["ris", "citation.format.ris"]
      ];
      function CitationDialog({ papers, t, onClose, showToast }) {
        const [format, setFormat] = useState("gb");
        const [text, setText] = useState("");
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [copied, setCopied] = useState(false);
        const textareaRef = useRef(null);
        useEffect(() => {
          let alive = true;
          setLoading(true);
          setError("");
          api.cite(papers, format).then((data) => {
            if (alive) setText(data.text || "");
          }).catch((err) => {
            if (alive) setError(err.message);
          }).finally(() => {
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
              document.execCommand("copy");
            }
            setCopied(true);
            showToast(t("citation.copied"));
            setTimeout(() => setCopied(false), 1600);
          } catch {
            if (textareaRef.current) {
              textareaRef.current.select();
              document.execCommand("copy");
              setCopied(true);
              showToast(t("citation.copied"));
            }
          }
        };
        const title = papers.length > 1 ? tFormat(t("citation.titleBatch"), { n: papers.length }) : t("citation.title");
        return h(
          Modal,
          {
            title,
            onClose,
            footer: [
              h(Button, { key: "copy", variant: "primary", onClick: copy, disabled: loading || !text }, copied ? t("citation.copied") : t("citation.copy")),
              h(Button, { key: "close", onClick: onClose }, t("citation.close"))
            ]
          },
          h(
            "div",
            { className: "musee-tabs", role: "tablist" },
            FORMATS.map(
              ([id, label]) => h(
                "button",
                { key: id, type: "button", className: format === id ? "active" : "", onClick: () => setFormat(id) },
                t(label)
              )
            )
          ),
          loading ? h(Loading, { label: t("loading") }) : null,
          error ? h("div", { className: "musee-error" }, error) : null,
          !loading && !error ? h("textarea", { ref: textareaRef, className: "musee-cite-text", readOnly: true, value: text, spellCheck: false }) : null
        );
      }

      // src/client/app.jsx
      function tr2(t, key, params) {
        return tFormat(t(key), params);
      }
      function disciplineName(discipline, locale) {
        return discipline.name?.[locale] || discipline.name?.zh || discipline.name?.en || discipline.id;
      }
      function App({ t, locale }) {
        const [boot, setBoot] = useState(null);
        const [bootError, setBootError] = useState("");
        const [discipline, setDiscipline] = useState("urban");
        const [view, setView] = useState({ kind: "discover" });
        const [papers, setPapers] = useState([]);
        const [listState, setListState] = useState("idle");
        const [listError, setListError] = useState("");
        const [listTitle, setListTitle] = useState("");
        const [library, setLibrary] = useState([]);
        const [translation, setTranslation] = useState(null);
        const [translating, setTranslating] = useState(false);
        const [citation, setCitation] = useState(null);
        const [toast, setToast] = useState("");
        const [query, setQuery] = useState("");
        const [paperFrom, setPaperFrom] = useState({ kind: "discover" });
        const mainRef = useRef(null);
        const toastTimer = useRef(null);
        const translationsRef = useRef(/* @__PURE__ */ new Map());
        const listRetryRef = useRef(null);
        const showToast = (message) => {
          setToast(message);
          if (toastTimer.current) clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setToast(""), 2400);
        };
        const errorText = (error) => error?.message === "NO_TOKEN" ? t("error.noToken") : error?.message || String(error);
        useEffect(() => {
          let alive = true;
          api.bootstrap().then((data) => {
            if (alive) setBoot(data);
          }).catch((error) => {
            if (alive) setBootError(errorText(error));
          });
          api.library().then((data) => {
            if (alive) setLibrary(data.items || []);
          }).catch(() => {
          });
          return () => {
            alive = false;
            if (toastTimer.current) clearTimeout(toastTimer.current);
          };
        }, []);
        const libraryById = useMemo(() => new Map(library.map((item) => [item.id, item])), [library]);
        const currentDiscipline = boot?.disciplines.find((entry) => entry.id === discipline) || null;
        const scrollTop = () => {
          if (mainRef.current) mainRef.current.scrollTop = 0;
        };
        const loadList = (loader, title) => {
          setListTitle(title);
          setListState("loading");
          setListError("");
          listRetryRef.current = () => loadList(loader, title);
          scrollTop();
          loader().then((data) => {
            setPapers(data.papers || []);
            setListState("ready");
          }).catch((error) => {
            setListError(errorText(error));
            setListState("error");
          });
        };
        const openJournal = (journal) => {
          setView({ kind: "journal", journal });
          loadList(() => api.journal(journal.id), journal.name);
        };
        const openArxiv = (category) => {
          setView({ kind: "arxiv", category });
          loadList(() => api.arxiv(category), tr2(t, "arxiv.title", { category }));
        };
        const runSearch = (text) => {
          const q = String(text || "").trim();
          if (!q) return;
          setQuery(q);
          setView({ kind: "search", q });
          loadList(() => api.search(q), tr2(t, "search.title", { q }));
        };
        const openPaper = (paper) => {
          if (view.kind !== "paper") setPaperFrom(view);
          setView({ kind: "paper", paper });
          setTranslation(translationsRef.current.get(paper.id) || null);
          scrollTop();
        };
        const goDiscover = () => {
          setView({ kind: "discover" });
          scrollTop();
        };
        const goLibrary = () => {
          setView({ kind: "library" });
          scrollTop();
        };
        const backToList = () => {
          setView(paperFrom || { kind: "discover" });
          scrollTop();
        };
        const savePaper = async (paper) => {
          try {
            const data = await api.save(paper);
            setLibrary(data.items || []);
            showToast(t("toast.saved"));
          } catch (error) {
            showToast(errorText(error));
          }
        };
        const updateItem = async (id, patch) => {
          setLibrary((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
          try {
            const data = await api.update(id, patch);
            setLibrary(data.items || []);
            return data;
          } catch (error) {
            showToast(errorText(error));
            throw error;
          }
        };
        const removeItem = async (item) => {
          try {
            const data = await api.remove(item.id);
            setLibrary(data.items || []);
            showToast(t("toast.removed"));
          } catch (error) {
            showToast(errorText(error));
          }
        };
        const translatePaper = async (paper) => {
          setTranslating(true);
          try {
            const data = await api.translate(paper.title, paper.abstract);
            translationsRef.current.set(paper.id, data);
            setTranslation(data);
          } catch (error) {
            showToast(tr2(t, "toast.translateFailed", { message: errorText(error) }));
          } finally {
            setTranslating(false);
          }
        };
        const exportLibrary = (format, filename) => downloadExport(format, filename);
        const renderList = () => {
          if (listState === "loading") return h(Loading, { label: t("loading") });
          if (listState === "error") return h(ErrorBanner, { message: listError, onRetry: listRetryRef.current, retryLabel: t("error.retry") });
          return h(PaperList, { papers, onOpen: openPaper, libraryById, t, emptyTitle: t("empty") });
        };
        const renderMain = () => {
          if (view.kind === "paper") {
            return h(PaperDetail, {
              paper: view.paper,
              item: libraryById.get(view.paper.id),
              t,
              onBack: backToList,
              onSave: savePaper,
              onUpdate: updateItem,
              onTranslate: translatePaper,
              translation,
              translating,
              onCite: (items) => setCitation({ papers: items })
            });
          }
          if (view.kind === "library") {
            return h(LibraryView, {
              items: library,
              t,
              onOpen: openPaper,
              onRemove: removeItem,
              onCite: (items) => setCitation({ papers: items }),
              onExport: exportLibrary,
              showToast
            });
          }
          if (view.kind === "discover") {
            const journals = currentDiscipline?.journals || [];
            return h(
              "div",
              { className: "musee-page" },
              h("div", { className: "musee-hero" }, h("h1", null, t("discover.title")), h("p", null, t("discover.subtitle"))),
              h(
                "div",
                { className: "musee-row", style: { marginTop: "18px" } },
                h(
                  "div",
                  { className: "musee-seg", role: "tablist" },
                  (boot?.disciplines || []).map(
                    (entry) => h(
                      "button",
                      {
                        key: entry.id,
                        type: "button",
                        className: discipline === entry.id ? "active" : "",
                        onClick: () => setDiscipline(entry.id)
                      },
                      disciplineName(entry, locale)
                    )
                  )
                )
              ),
              h(
                "div",
                { className: "musee-section" },
                h("div", { className: "musee-section-head" }, h("h2", null, t("discover.journals")), h("span", null, currentDiscipline?.blurb?.[locale] || currentDiscipline?.blurb?.zh || "")),
                h(
                  "div",
                  { className: "musee-grid" },
                  journals.map(
                    (journal) => h(
                      "button",
                      { key: journal.id, type: "button", className: "musee-journal", onClick: () => openJournal(journal) },
                      h("div", { className: "musee-journal-name" }, journal.name),
                      h("div", { className: "musee-journal-meta" }, h("span", null, journal.issn), h("span", null, "→"))
                    )
                  )
                )
              ),
              h(
                "div",
                { className: "musee-section" },
                h("div", { className: "musee-section-head" }, h("h2", null, t("discover.arxiv")), h("span", null, t("arxiv.hint"))),
                h(
                  "div",
                  { className: "musee-arxiv-row" },
                  (currentDiscipline?.arxiv || []).map(
                    (category) => h(Button, { key: category, onClick: () => openArxiv(category) }, category)
                  )
                )
              )
            );
          }
          return h(
            "div",
            { className: "musee-page" },
            h("button", { type: "button", className: "musee-back", onClick: goDiscover }, h(IconBack), t("discover.title")),
            h("div", { className: "musee-hero", style: { marginTop: "12px" } }, h("h1", null, listTitle)),
            view.kind === "journal" ? h("p", { style: { margin: "6px 0 0", color: "var(--dsw-alias-label-secondary)", fontSize: "12px" } }, view.journal.issn) : null,
            h("div", { style: { marginTop: "18px" } }, renderList())
          );
        };
        if (bootError) {
          return h(
            "div",
            { className: "musee-root" },
            h("style", null, CSS),
            h(
              "div",
              { style: { maxWidth: "640px", margin: "80px auto", padding: "0 24px" } },
              h(ErrorBanner, {
                message: bootError,
                onRetry: () => window.location.reload(),
                retryLabel: t("error.refresh") || "Refresh"
              })
            )
          );
        }
        if (!boot) {
          return h(
            "div",
            { className: "musee-root" },
            h("style", null, CSS),
            h("div", { style: { margin: "80px auto" } }, h(Loading, { label: t("loading") }))
          );
        }
        return h(
          "div",
          { className: "musee-root" },
          h("style", null, CSS),
          h(
            "header",
            { className: "musee-header" },
            h(
              "button",
              { type: "button", className: "musee-brand", onClick: goDiscover, style: { border: 0, background: "transparent", cursor: "pointer", padding: 0 } },
              h("span", { className: "musee-brand-mark" }, h(IconBook, { size: 17 })),
              h("span", { className: "musee-brand-name" }, t("brand"))
            ),
            h("span", { className: "musee-tagline" }, t("tagline")),
            h(
              "nav",
              { className: "musee-nav" },
              h("button", { type: "button", className: `musee-nav-btn ${view.kind !== "library" ? "active" : ""}`, onClick: goDiscover }, t("nav.discover")),
              h(
                "button",
                { type: "button", className: `musee-nav-btn ${view.kind === "library" ? "active" : ""}`, onClick: goLibrary },
                t("nav.library"),
                library.length ? h("span", { className: "musee-nav-count" }, String(library.length)) : null
              )
            ),
            h(
              "form",
              {
                className: "musee-search",
                onSubmit: (event) => {
                  event.preventDefault();
                  runSearch(query);
                }
              },
              h("input", {
                value: query,
                onChange: (event) => setQuery(event.target.value),
                placeholder: t("search.placeholder"),
                "aria-label": t("search.placeholder")
              }),
              h(Button, { size: "sm", onClick: () => runSearch(query), "aria-label": t("search.placeholder") }, h(IconSearch))
            )
          ),
          h(
            "div",
            { className: "musee-body" },
            h(
              "aside",
              { className: "musee-rail" },
              h("div", { className: "musee-rail-title" }, t("discover.title")),
              h(
                "div",
                { className: "musee-rail-group" },
                (boot.disciplines || []).map(
                  (entry) => h(
                    "button",
                    {
                      key: entry.id,
                      type: "button",
                      className: `musee-rail-item ${discipline === entry.id ? "active" : ""}`,
                      onClick: () => {
                        setDiscipline(entry.id);
                        goDiscover();
                      }
                    },
                    disciplineName(entry, locale)
                  )
                )
              ),
              h("div", { className: "musee-rail-title" }, t("discover.journals")),
              h(
                "div",
                { className: "musee-rail-group" },
                (currentDiscipline?.journals || []).map(
                  (journal) => h(
                    "button",
                    {
                      key: journal.id,
                      type: "button",
                      className: `musee-rail-item ${view.kind === "journal" && view.journal.id === journal.id ? "active" : ""}`,
                      onClick: () => openJournal(journal),
                      title: journal.name
                    },
                    journal.name,
                    h("span", { className: "musee-rail-sub" }, journal.issn)
                  )
                )
              ),
              h("div", { className: "musee-rail-title" }, "arXiv"),
              h(
                "div",
                { className: "musee-rail-group" },
                (currentDiscipline?.arxiv || []).map(
                  (category) => h(
                    "button",
                    {
                      key: category,
                      type: "button",
                      className: `musee-rail-item ${view.kind === "arxiv" && view.category === category ? "active" : ""}`,
                      onClick: () => openArxiv(category)
                    },
                    category
                  )
                )
              )
            ),
            h("main", { className: "musee-main", ref: mainRef }, renderMain())
          ),
          citation ? h(CitationDialog, { papers: citation.papers, t, onClose: () => setCitation(null), showToast }) : null,
          toast ? h("div", { className: "musee-toast", role: "status" }, toast) : null
        );
      }

      // src/client/locale.js
      var ZH = {
        brand: "Musee",
        tagline: "期刊与预印本阅读台",
        "nav.discover": "发现",
        "nav.library": "我的库",
        "search.placeholder": "检索论文、作者或主题…",
        "search.title": "检索：{q}",
        "search.empty": "没有找到匹配的论文，换个关键词试试。",
        "discover.title": "按学科浏览期刊",
        "discover.subtitle": "选一本期刊看最新论文，或从 arXiv 分类进入预印本。数据来自 OpenAlex 与 arXiv。",
        "discover.arxiv": "arXiv 最新预印本",
        "discover.journals": "期刊",
        "journal.back": "返回期刊列表",
        "journal.loading": "正在获取最新论文…",
        "journal.empty": "这本期刊暂时没有返回结果。",
        "paper.back": "返回列表",
        "paper.translate": "学术翻译",
        "paper.translating": "正在翻译…",
        "paper.translated": "译文",
        "paper.original": "原文",
        "paper.both": "对照",
        "paper.save": "收藏",
        "paper.saved": "已收藏",
        "paper.cite": "引用",
        "paper.open": "打开原文",
        "paper.notes": "阅读笔记",
        "paper.notesHint": "收藏后可以记笔记、标状态、加标签。",
        "paper.status": "状态",
        "paper.tags": "标签",
        "paper.tagsHint": "用逗号分隔，例如：方法, 综述",
        "paper.abstract": "摘要",
        "paper.noAbstract": "这条记录没有摘要。",
        "paper.meta": "出版信息",
        "paper.doi": "DOI",
        "paper.issn": "ISSN",
        "paper.cited": "被引 {n}",
        "paper.oa": "开放获取",
        "paper.preprint": "预印本",
        "paper.authors": "作者",
        "paper.journal": "期刊",
        "paper.year": "年份",
        "paper.volume": "卷",
        "paper.issue": "期",
        "paper.pages": "页码",
        "status.unread": "待读",
        "status.reading": "在读",
        "status.read": "已读",
        "library.title": "我的库",
        "library.subtitle": "收藏、状态与笔记都在这里；勾选多篇可以批量引用。",
        "library.empty": "还没有收藏。在论文页点“收藏”，就会出现在这里。",
        "library.selected": "已选 {n} 篇",
        "library.selectAll": "全选",
        "library.clear": "取消选择",
        "library.cite": "引用选中",
        "library.exportBibtex": "导出 BibTeX",
        "library.exportRis": "导出 RIS",
        "library.exportMd": "导出 Markdown",
        "library.remove": "移出库",
        "library.notesCount": "{n} 字笔记",
        "library.filterAll": "全部",
        "citation.title": "引用",
        "citation.titleBatch": "批量引用 {n} 篇",
        "citation.copy": "复制",
        "citation.copied": "已复制",
        "citation.close": "关闭",
        "citation.format.gb": "GB/T 7714",
        "citation.format.apa": "APA 7",
        "citation.format.mla": "MLA 9",
        "citation.format.ieee": "IEEE",
        "citation.format.bibtex": "BibTeX",
        "citation.format.ris": "RIS",
        "toast.saved": "已加入我的库",
        "toast.removed": "已移出我的库",
        "toast.updated": "已保存",
        "toast.exported": "已导出",
        "toast.translateFailed": "翻译失败：{message}",
        "error.noToken": "Musee 还没有就绪：请刷新页面后再试。",
        "error.refresh": "刷新页面",
        "error.load": "加载失败：{message}",
        "error.retry": "重试",
        loading: "加载中…",
        "arxiv.title": "arXiv · {category}",
        "arxiv.hint": "最新提交",
        "common.close": "关闭",
        "common.cancel": "取消",
        empty: "暂无内容"
      };
      var EN = {
        brand: "Musee",
        tagline: "A reading desk for journals and preprints",
        "nav.discover": "Discover",
        "nav.library": "Library",
        "search.placeholder": "Search papers, authors, topics…",
        "search.title": "Search: {q}",
        "search.empty": "No matching papers. Try another keyword.",
        "discover.title": "Browse journals by field",
        "discover.subtitle": "Pick a journal for its latest papers, or open a preprint category on arXiv. Data from OpenAlex and arXiv.",
        "discover.arxiv": "Latest on arXiv",
        "discover.journals": "Journals",
        "journal.back": "Back to journals",
        "journal.loading": "Fetching the latest papers…",
        "journal.empty": "This journal returned no papers.",
        "paper.back": "Back to list",
        "paper.translate": "Academic translation",
        "paper.translating": "Translating…",
        "paper.translated": "Translation",
        "paper.original": "Original",
        "paper.both": "Side by side",
        "paper.save": "Save",
        "paper.saved": "Saved",
        "paper.cite": "Cite",
        "paper.open": "Open source",
        "paper.notes": "Reading notes",
        "paper.notesHint": "Save the paper to keep notes, status, and tags.",
        "paper.status": "Status",
        "paper.tags": "Tags",
        "paper.tagsHint": "Comma separated, e.g. methods, review",
        "paper.abstract": "Abstract",
        "paper.noAbstract": "No abstract is available for this record.",
        "paper.meta": "Publication",
        "paper.doi": "DOI",
        "paper.issn": "ISSN",
        "paper.cited": "Cited by {n}",
        "paper.oa": "Open access",
        "paper.preprint": "Preprint",
        "paper.authors": "Authors",
        "paper.journal": "Journal",
        "paper.year": "Year",
        "paper.volume": "Volume",
        "paper.issue": "Issue",
        "paper.pages": "Pages",
        "status.unread": "To read",
        "status.reading": "Reading",
        "status.read": "Read",
        "library.title": "My library",
        "library.subtitle": "Saved papers, reading status, and notes. Select several for batch citations.",
        "library.empty": "Nothing saved yet. Use Save on a paper to collect it here.",
        "library.selected": "{n} selected",
        "library.selectAll": "Select all",
        "library.clear": "Clear",
        "library.cite": "Cite selected",
        "library.exportBibtex": "Export BibTeX",
        "library.exportRis": "Export RIS",
        "library.exportMd": "Export Markdown",
        "library.remove": "Remove",
        "library.notesCount": "{n} characters of notes",
        "library.filterAll": "All",
        "citation.title": "Citation",
        "citation.titleBatch": "Cite {n} papers",
        "citation.copy": "Copy",
        "citation.copied": "Copied",
        "citation.close": "Close",
        "citation.format.gb": "GB/T 7714",
        "citation.format.apa": "APA 7",
        "citation.format.mla": "MLA 9",
        "citation.format.ieee": "IEEE",
        "citation.format.bibtex": "BibTeX",
        "citation.format.ris": "RIS",
        "toast.saved": "Added to your library",
        "toast.removed": "Removed from your library",
        "toast.updated": "Saved",
        "toast.exported": "Exported",
        "toast.translateFailed": "Translation failed: {message}",
        "error.noToken": "Musee is not ready: refresh the page and try again.",
        "error.refresh": "Refresh page",
        "error.load": "Failed to load: {message}",
        "error.retry": "Retry",
        loading: "Loading…",
        "arxiv.title": "arXiv · {category}",
        "arxiv.hint": "Latest submissions",
        "common.close": "Close",
        "common.cancel": "Cancel",
        empty: "Nothing here yet"
      };

      // src/client/index.jsx
      function createPanel(ctx) {
        return function MuseePanel() {
          const snapshot = useSyncExternalStore(
            (callback) => ctx.locale.subscribe(callback),
            () => ctx.locale.getSnapshot()
          );
          const t = useMemo(() => ctx.locale.bind("musee"), []);
          return h(App, { t, locale: snapshot.active });
        };
      }
      function MuseeIcon({ size = 18, active = false }) {
        return h(
          "svg",
          {
            width: size,
            height: size,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.7,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            opacity: active ? 1 : 0.72,
            "aria-hidden": "true"
          },
          h("path", { d: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15.5H5.5A1.5 1.5 0 0 1 4 18z" }),
          h("path", { d: "M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15.5h5.5A1.5 1.5 0 0 0 20 18z" }),
          h("path", { d: "M16.2 4v5.6L14.8 8.5l-1.4 1.1V4" })
        );
      }
      var plugin = {
        inject: ["slots", "locale"],
        apply(ctx) {
          ctx.effect(() => ctx.locale.register("musee", "zh", ZH), "musee: locale zh");
          ctx.effect(() => ctx.locale.register("musee", "en", EN), "musee: locale en");
          const Panel = createPanel(ctx);
          ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: "musee" }, Panel));
          ctx.slots.inject(
            "sidebar.panellist",
            () => ctx.slots.register({ name: "sidebar.panellist", id: "musee", order: 6, label: "Musee" }, MuseeIcon)
          );
        }
      };
      globalThis.__MUSEE_PLUGIN__ = plugin;
    })();

    return globalThis.__MUSEE_PLUGIN__;
  },
});
