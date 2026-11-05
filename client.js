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
        journal: (journalId, { limit = 20, offset = 0, year = null } = {}) => {
          const params = new URLSearchParams({ journalId, limit: String(limit), offset: String(offset) });
          if (year) params.set("year", String(year));
          return request(`/journal?${params.toString()}`);
        },
        conference: (conferenceId, limit = 20) => request(`/conference?conferenceId=${encodeURIComponent(conferenceId)}&limit=${limit}`),
        arxiv: (category, limit = 20) => request(`/arxiv?category=${encodeURIComponent(category)}&limit=${limit}`),
        search: (query, limit = 20) => request(`/search?q=${encodeURIComponent(query)}&limit=${limit}`),
        translate: (title, abstract, lang) => request("/translate", { method: "POST", body: { title, abstract, lang } }),
        translateTitles: (titles, lang) => request("/translate-titles", { method: "POST", body: { titles, lang } }),
        translateSection: (heading, text2, lang) => request("/translate-section", { method: "POST", body: { heading, text: text2, lang } }),
        fulltext: (arxivId) => request(`/fulltext?arxivId=${encodeURIComponent(arxivId)}`),
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
      function downloadText(filename, text2, mime = "text/plain;charset=utf-8") {
        saveBlob(new Blob([text2], { type: mime }), filename);
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

    .musee-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; }
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
    .musee-paper-title-alt { margin-top: 4px; font-size: 13px; line-height: 1.55; color: var(--dsw-alias-label-secondary); }
    .musee-title-alt { margin: 6px 0 12px; font-size: 16px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
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

    .musee-cover {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 0 0 auto;
      overflow: hidden;
      padding: 8px 9px 8px 13px;
      border-radius: 3px 7px 7px 3px;
      background: linear-gradient(150deg, var(--cover-from), var(--cover-to));
      color: #fff;
      box-shadow: 0 7px 18px rgba(15, 23, 42, .22), inset 0 1px 0 rgba(255, 255, 255, .18);
    }
    .musee-cover-spine {
      position: absolute;
      inset: 0 auto 0 0;
      width: 5px;
      background: linear-gradient(90deg, rgba(0, 0, 0, .38), rgba(255, 255, 255, .12));
    }
    .musee-cover-glow {
      position: absolute;
      width: 120%;
      height: 70%;
      right: -30%;
      top: -20%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, .28), transparent 65%);
    }
    .musee-cover-short {
      position: relative;
      font-family: Georgia, "Times New Roman", serif;
      font-weight: 700;
      letter-spacing: .03em;
      line-height: 1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, .25);
    }
    .musee-cover-name {
      position: relative;
      font-size: 7px;
      line-height: 1.25;
      letter-spacing: .04em;
      text-transform: uppercase;
      opacity: .82;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .musee-cover-foot {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 6px;
      font-size: 6px;
      letter-spacing: .12em;
      text-transform: uppercase;
      opacity: .85;
      white-space: nowrap;
    }
    .musee-cover-mark { opacity: .7; }
    .musee-cover-sm { width: 60px; height: 80px; padding: 6px 7px 6px 11px; }
    .musee-cover-sm .musee-cover-short { font-size: 17px; }
    .musee-cover-sm .musee-cover-name { display: none; }
    .musee-cover-sm .musee-cover-foot { font-size: 5px; }
    .musee-cover-md { width: 78px; height: 104px; }
    .musee-cover-md .musee-cover-short { font-size: 22px; }
    .musee-cover-lg { width: 116px; height: 154px; padding: 11px 12px 11px 17px; }
    .musee-cover-lg .musee-cover-short { font-size: 34px; }
    .musee-cover-lg .musee-cover-name { font-size: 8px; }
    .musee-cover-lg .musee-cover-foot { font-size: 7px; }

    .musee-journal-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      text-align: left;
      border: 1px solid var(--dsw-alias-border-l1);
      border-radius: 12px;
      background: var(--dsw-alias-bg-layer-1);
      padding: 13px;
      cursor: pointer;
      min-width: 0;
      transition: border-color .15s ease, transform .15s ease;
    }
    .musee-journal-card:hover { border-color: var(--dsw-alias-border-l2); transform: translateY(-1px); }
    .musee-journal-body { min-width: 0; display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .musee-journal-name { font-weight: 650; line-height: 1.35; }
    .musee-journal-local { font-size: 12px; color: var(--dsw-alias-label-secondary); line-height: 1.4; }
    .musee-journal-about {
      font-size: 12px;
      line-height: 1.55;
      color: var(--dsw-alias-label-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .musee-journal-meta { margin-top: auto; display: flex; flex-wrap: wrap; gap: 8px; color: var(--dsw-alias-label-secondary); font-size: 11px; }

    .musee-venue-head { display: flex; gap: 22px; align-items: flex-start; margin-top: 14px; }
    .musee-venue-head h1 { margin: 0 0 4px; font-size: 27px; line-height: 1.3; letter-spacing: -0.012em; }
    .musee-venue-local { color: var(--dsw-alias-label-secondary); font-size: 14px; margin-bottom: 8px; }
    .musee-venue-about { margin: 0; max-width: 660px; color: var(--dsw-alias-label-secondary); font-size: 13.5px; line-height: 1.7; }
    .musee-venue-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; align-items: center; color: var(--dsw-alias-label-secondary); font-size: 12px; }

    .musee-settings-section { padding: 2px 0 16px; border-bottom: 1px solid var(--dsw-alias-border-l1); margin-bottom: 16px; }
    .musee-settings-section:last-child { border-bottom: 0; margin-bottom: 0; }
    .musee-settings-section h3 { margin: 0 0 4px; font-size: 14px; font-weight: 600; }
    .musee-settings-hint { margin: 0 0 10px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.6; }
    .musee-settings-meta { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; margin: 0 0 10px; font-size: 12px; }
    .musee-settings-meta dt { color: var(--dsw-alias-label-secondary); }
    .musee-settings-meta dd { margin: 0; word-break: break-all; }

    .musee-check-row { display: flex; align-items: center; gap: 9px; font-size: 13px; cursor: pointer; }
    .musee-check-row input { width: 15px; height: 15px; margin: 0; accent-color: var(--dsw-alias-brand-primary); cursor: pointer; }

    .musee-icon-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; border: 1px solid transparent; border-radius: 8px;
      background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
    }
    .musee-icon-btn:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }

    .musee-reader { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--dsw-alias-bg-base); }
    .musee-reader-head {
      flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
      min-height: 52px; padding: 8px 16px;
      border-bottom: 1px solid var(--dsw-alias-border-l1);
      background: var(--dsw-alias-bg-layer-1);
    }
    .musee-reader-title { font-weight: 600; font-size: 14px; max-width: 44%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .musee-reader-body { flex: 1 1 auto; display: flex; min-height: 0; }
    .musee-reader-toc {
      flex: 0 0 250px; width: 250px; overflow: auto; padding: 12px 8px 30px;
      border-right: 1px solid var(--dsw-alias-border-l1);
      background: var(--dsw-alias-bg-layer-1);
    }
    .musee-reader-toc-item {
      display: block; width: 100%; text-align: left;
      border: 0; background: transparent; color: var(--dsw-alias-label-secondary);
      padding: 6px 8px; border-radius: 6px; cursor: pointer;
      font-size: 12.5px; line-height: 1.4;
    }
    .musee-reader-toc-item:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
    .musee-reader-toc-item.active { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font-weight: 600; }
    .musee-reader-toc-item.level-2 { padding-left: 20px; font-size: 12px; }
    .musee-reader-scroll { flex: 1 1 auto; min-width: 0; overflow: auto; }
    .musee-reader-paper { max-width: 860px; margin: 0 auto; padding: 26px 40px 100px; }
    .musee-reader-authors {
      color: var(--dsw-alias-label-secondary); font-size: 12.5px; line-height: 1.7;
      margin-bottom: 20px; max-height: 5em; overflow: hidden;
    }
    .musee-reader-translation {
      border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-1);
      border-radius: 10px; padding: 14px 16px; margin-bottom: 18px;
    }
    .musee-reader-translation-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 12.5px; }
    .musee-reader-translation-head .musee-back { margin-left: auto; }
    .musee-reader-translation-body { font-size: 14.5px; line-height: 1.9; white-space: pre-wrap; }

    .musee-fulltext { font-size: 15px; line-height: 1.85; }
    .musee-fulltext h1, .musee-fulltext h2 { font-size: 22px; line-height: 1.35; margin: 28px 0 12px; }
    .musee-fulltext h3 { font-size: 18px; margin: 24px 0 10px; }
    .musee-fulltext h4, .musee-fulltext h5, .musee-fulltext h6 { font-size: 15px; margin: 18px 0 8px; }
    .musee-fulltext p { margin: 0 0 14px; }
    .musee-fulltext ul, .musee-fulltext ol { padding-left: 24px; margin: 0 0 14px; }
    .musee-fulltext li { margin: 4px 0; }
    .musee-fulltext figure { margin: 22px 0; }
    .musee-fulltext figcaption { font-size: 12.5px; line-height: 1.65; color: var(--dsw-alias-label-secondary); margin-top: 6px; }
    .musee-fulltext img { max-width: 100%; height: auto; border-radius: 6px; background: var(--dsw-alias-bg-layer-1); }
    .musee-fulltext table { border-collapse: collapse; display: block; overflow-x: auto; max-width: 100%; font-size: 12px; margin: 14px 0; }
    .musee-fulltext th, .musee-fulltext td { border: 1px solid var(--dsw-alias-border-l1); padding: 5px 7px; vertical-align: top; }
    .musee-fulltext math { font-size: 1.05em; }
    .musee-fulltext .ltx_equation, .musee-fulltext .ltx_eqn_table { display: block; overflow-x: auto; margin: 14px 0; }
    .musee-fulltext pre { overflow: auto; padding: 10px; background: var(--dsw-alias-bg-layer-1); border-radius: 8px; }
    .musee-fulltext a { color: var(--dsw-alias-brand-primary); }
    .musee-fulltext .ltx_biblist { padding-left: 22px; }
    .musee-fulltext .ltx_bibitem { margin-bottom: 8px; font-size: 13px; line-height: 1.6; }
    .musee-fulltext .ltx_note, .musee-fulltext .ltx_role_footnote { font-size: 12px; color: var(--dsw-alias-label-secondary); }
    .musee-fulltext .ltx_page_header, .musee-fulltext .ltx_page_footer, .musee-fulltext .ltx_TOC { display: none; }

    .musee-lightbox {
      position: fixed; inset: 0; z-index: 95; padding: 30px;
      background: rgba(0, 0, 0, .82);
      display: flex; align-items: center; justify-content: center; cursor: zoom-out;
    }
    .musee-lightbox img { max-width: 96vw; max-height: 92vh; object-fit: contain; border-radius: 6px; }


    @media (max-width: 920px) {
      .musee-rail { display: none; }
      .musee-page { padding: 20px 18px 70px; }
      .musee-article { padding: 20px 18px 80px; }
      .musee-tagline { display: none; }
      .musee-search { width: 46%; }
      .musee-header { gap: 12px; }
      .musee-reader-toc { display: none; }
      .musee-reader-paper { padding: 20px 18px 80px; }
      .musee-reader-title { max-width: 32%; }
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
      function IconSettings({ size = 16 }) {
        return h(
          "svg",
          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", "aria-hidden": "true" },
          h("path", { d: "M4 7h9M17 7h3M4 17h3M11 17h9" }),
          h("circle", { cx: 15, cy: 7, r: 2.2 }),
          h("circle", { cx: 9, cy: 17, r: 2.2 })
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
      function PaperList({ papers, onOpen, libraryById, t, emptyTitle, hideVenue = false, showIssue = false, titleTranslations = {} }) {
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
              titleTranslations[paper.id] ? h("div", { className: "musee-paper-title-alt" }, titleTranslations[paper.id]) : null,
              h(
                "div",
                { className: "musee-paper-meta" },
                paper.kind === "conference" ? h(Pill, { tone: "brand" }, t("paper.conference")) : null,
                !hideVenue && paper.journal?.name ? h("span", null, paper.journal.name) : paper.source === "arxiv" ? h(Pill, { tone: "brand" }, "arXiv") : null,
                showIssue && paper.volume ? h("span", null, `${t("paper.volume")} ${paper.volume}`) : null,
                showIssue && paper.issue ? h("span", null, `${t("paper.issue")} ${paper.issue}`) : null,
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
      function PaperDetail({ paper, item, t, onBack, onSave, onUpdate, onTranslate, translation, translating, onCite, titleTranslation, onRead }) {
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
          titleTranslation && !hasTranslation && !showTranslated ? h("div", { className: "musee-title-alt" }, titleTranslation) : null,
          paper.authors?.length ? h("div", { className: "musee-authors" }, paper.authors.join(" · ")) : null,
          h(
            "div",
            { className: "musee-meta-line" },
            paper.kind === "conference" ? h(Pill, { tone: "brand" }, t("paper.conference")) : null,
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
            paper.arxivId ? h(Button, { variant: "primary", onClick: () => onRead(paper) }, h(IconBook), t("paper.fulltext")) : null,
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
        const [text2, setText] = useState("");
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
              await navigator.clipboard.writeText(text2);
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
              h(Button, { key: "copy", variant: "primary", onClick: copy, disabled: loading || !text2 }, copied ? t("citation.copied") : t("citation.copy")),
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
          !loading && !error ? h("textarea", { ref: textareaRef, className: "musee-cite-text", readOnly: true, value: text2, spellCheck: false }) : null
        );
      }

      // src/client/cover.jsx
      var PALETTES = {
        urban: [
          ["#0b3b36", "#d97706"],
          ["#123f3a", "#65a30d"],
          ["#3f2d1e", "#ca8a04"]
        ],
        physics: [
          ["#111c44", "#6d28d9"],
          ["#1e1b4b", "#0e7490"],
          ["#2e1065", "#be185d"]
        ],
        ai: [
          ["#102a6b", "#0891b2"],
          ["#0b1220", "#2563eb"],
          ["#083344", "#0e7490"]
        ],
        conference: [
          ["#0b1120", "#dc2626"],
          ["#111827", "#d97706"],
          ["#071a2b", "#0e7490"]
        ]
      };
      function hash(value = "") {
        let result = 0;
        for (let index = 0; index < value.length; index += 1) {
          result = result * 31 + value.charCodeAt(index) >>> 0;
        }
        return result;
      }
      function paletteFor(kind, id) {
        const family = PALETTES[kind] || PALETTES.ai;
        return family[hash(id) % family.length];
      }
      function JournalCover({ venue, kind = "journal", size = "md", issue = "" }) {
        const [from, to] = paletteFor(kind === "conference" ? "conference" : kind, venue?.id || venue?.name || "");
        const short = venue?.short || "M";
        return h(
          "div",
          {
            className: `musee-cover musee-cover-${size}`,
            style: { "--cover-from": from, "--cover-to": to },
            "aria-hidden": "true"
          },
          h("span", { className: "musee-cover-spine" }),
          h("span", { className: "musee-cover-glow" }),
          h("span", { className: "musee-cover-short" }, short),
          h("span", { className: "musee-cover-name" }, venue?.name || ""),
          h(
            "span",
            { className: "musee-cover-foot" },
            h("span", null, issue || "LATEST"),
            h("span", { className: "musee-cover-mark" }, "MUSEE")
          )
        );
      }

      // src/client/i18n.js
      var LANGUAGES = [
        { id: "en", label: "English" },
        { id: "zh", label: "中文" },
        { id: "fr", label: "Français" }
      ];
      var EN = {
        brand: "Musee",
        tagline: "A reading desk for journals and preprints",
        "nav.discover": "Discover",
        "nav.conferences": "Conferences",
        "nav.library": "Library",
        "search.placeholder": "Search papers, authors, topics…",
        "search.title": "Search: {q}",
        "search.empty": "No matching papers. Try another keyword.",
        "discover.title": "Browse by field",
        "discover.subtitle": "Journals, top conferences, and arXiv preprints. Data from OpenAlex and arXiv.",
        "discover.arxiv": "Latest on arXiv",
        "discover.journals": "Journals",
        "discover.conferences": "Top conferences",
        "discover.conferencesHint": "Proceedings indexed by OpenAlex; coverage varies by venue.",
        "journal.back": "Back to journals",
        "journal.loading": "Fetching the latest papers…",
        "journal.empty": "This venue returned no papers.",
        "journal.about": "About",
        "journal.officialSite": "Publisher site",
        "journal.works": "{n} works indexed",
        "journal.oa": "Open access",
        "journal.latest": "Latest issue",
        "journal.papers": "Papers",
        "journal.allYears": "All years",
        "journal.total": "{n} papers",
        "journal.loadMore": "Load more",
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
        "paper.fulltext": "Read full text",
        "reader.loading": "Fetching the full text…",
        "reader.unavailable": "No HTML full text is available for this paper. Open the PDF instead.",
        "reader.openPdf": "Open PDF",
        "reader.toc": "Contents",
        "reader.translate": "Translate section",
        "reader.translating": "Translating…",
        "reader.translation": "Section translation",
        "reader.close": "Close",
        "reader.noText": "This section has no translatable text. Pick a top-level section.",
        "reader.error": "Failed to load the full text: {message}",
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
        "paper.conference": "Conference paper",
        "paper.journalPaper": "Journal article",
        "paper.authors": "Authors",
        "paper.journal": "Venue",
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
        "conference.back": "Back to conferences",
        "conference.about": "About this venue",
        "conference.latest": "Recent papers",
        "conference.dataNote": "Indexed from OpenAlex proceedings; some venues publish primarily through OpenReview or their own site and may be incomplete.",
        "conference.group.ai": "AI",
        "conference.group.robotics": "Robotics",
        "settings.title": "Settings",
        "settings.language": "Language",
        "settings.languageHint": "Changes the Musee panel only; it does not switch the whole app.",
        "settings.translation": "Translation language",
        "settings.translationHint": "Titles and abstracts are translated into this language.",
        "settings.titles": "Title translation",
        "settings.titlesHint": "Translates paper titles in lists into the translation language. Calls your model once per batch and caches the result.",
        "settings.titlesToggle": "Translate paper titles automatically",
        "settings.about": "About",
        "settings.version": "Version",
        "settings.dataDir": "Local data",
        "settings.note": "Musee stores your library and cached translations locally. No account, no server, no telemetry.",
        "settings.close": "Close",
        "common.close": "Close",
        "common.cancel": "Cancel",
        empty: "Nothing here yet"
      };
      var ZH = {
        brand: "Musee",
        tagline: "期刊与预印本阅读台",
        "nav.discover": "发现",
        "nav.conferences": "顶会",
        "nav.library": "我的库",
        "search.placeholder": "检索论文、作者或主题…",
        "search.title": "检索：{q}",
        "search.empty": "没有找到匹配的论文，换个关键词试试。",
        "discover.title": "按学科浏览",
        "discover.subtitle": "期刊、顶会与 arXiv 预印本。数据来自 OpenAlex 与 arXiv。",
        "discover.arxiv": "arXiv 最新预印本",
        "discover.journals": "期刊",
        "discover.conferences": "顶会论文",
        "discover.conferencesHint": "来自 OpenAlex 的会议论文集，各会议收录完整度不同。",
        "journal.back": "返回期刊列表",
        "journal.loading": "正在获取最新论文…",
        "journal.empty": "这个来源暂时没有返回结果。",
        "journal.about": "简介",
        "journal.officialSite": "期刊官网",
        "journal.works": "收录 {n} 篇",
        "journal.oa": "开放获取",
        "journal.latest": "最新一期",
        "journal.papers": "论文",
        "journal.allYears": "全部年份",
        "journal.total": "共 {n} 篇",
        "journal.loadMore": "加载更多",
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
        "paper.fulltext": "全文阅读",
        "reader.loading": "正在获取全文…",
        "reader.unavailable": "这篇论文没有 HTML 全文，请打开 PDF。",
        "reader.openPdf": "打开 PDF",
        "reader.toc": "目录",
        "reader.translate": "翻译本节",
        "reader.translating": "正在翻译…",
        "reader.translation": "本节译文",
        "reader.close": "关闭",
        "reader.noText": "这一节没有可翻译的正文，请选择一级章节。",
        "reader.error": "全文加载失败：{message}",
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
        "paper.conference": "会议论文",
        "paper.journalPaper": "期刊论文",
        "paper.authors": "作者",
        "paper.journal": "来源",
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
        "conference.back": "返回顶会列表",
        "conference.about": "会议简介",
        "conference.latest": "最新论文",
        "conference.dataNote": "数据来自 OpenAlex 的会议论文集；部分会议主要通过 OpenReview 或官网发布，收录可能不完整。",
        "conference.group.ai": "人工智能",
        "conference.group.robotics": "机器人",
        "settings.title": "设置",
        "settings.language": "语言",
        "settings.languageHint": "只改变 Musee 面板，不切换整个应用的语言。",
        "settings.translation": "翻译语言",
        "settings.translationHint": "标题与摘要会翻译成这个语言。",
        "settings.titles": "标题翻译",
        "settings.titlesHint": "在论文列表中把标题自动译成翻译语言；每批调用一次模型，结果会缓存。",
        "settings.titlesToggle": "自动翻译论文标题",
        "settings.about": "关于",
        "settings.version": "版本",
        "settings.dataDir": "本地数据目录",
        "settings.note": "Musee 把书库和译文缓存保存在本地，不需要账号，也没有服务器和遥测。",
        "settings.close": "关闭",
        "common.close": "关闭",
        "common.cancel": "取消",
        empty: "暂无内容"
      };
      var FR = {
        brand: "Musee",
        tagline: "Un bureau de lecture pour revues et préprints",
        "nav.discover": "Découvrir",
        "nav.conferences": "Conférences",
        "nav.library": "Bibliothèque",
        "search.placeholder": "Rechercher un article, un auteur, un thème…",
        "search.title": "Recherche : {q}",
        "search.empty": "Aucun article trouvé. Essayez un autre mot-clé.",
        "discover.title": "Parcourir par discipline",
        "discover.subtitle": "Revues, grandes conférences et préprints arXiv. Données OpenAlex et arXiv.",
        "discover.arxiv": "Derniers préprints arXiv",
        "discover.journals": "Revues",
        "discover.conferences": "Grandes conférences",
        "discover.conferencesHint": "Actes indexés par OpenAlex ; la couverture varie selon la conférence.",
        "journal.back": "Retour aux revues",
        "journal.loading": "Récupération des derniers articles…",
        "journal.empty": "Cette source n’a renvoyé aucun article.",
        "journal.about": "À propos",
        "journal.officialSite": "Site de l’éditeur",
        "journal.works": "{n} travaux indexés",
        "journal.oa": "Libre accès",
        "journal.latest": "Dernier numéro",
        "journal.papers": "Articles",
        "journal.allYears": "Toutes les années",
        "journal.total": "{n} articles",
        "journal.loadMore": "Charger plus",
        "paper.back": "Retour à la liste",
        "paper.translate": "Traduction académique",
        "paper.translating": "Traduction en cours…",
        "paper.translated": "Traduction",
        "paper.original": "Original",
        "paper.both": "Côte à côte",
        "paper.save": "Enregistrer",
        "paper.saved": "Enregistré",
        "paper.cite": "Citer",
        "paper.open": "Ouvrir la source",
        "paper.fulltext": "Lire le texte intégral",
        "reader.loading": "Récupération du texte intégral…",
        "reader.unavailable": "Aucun texte intégral HTML n’est disponible. Ouvrez le PDF.",
        "reader.openPdf": "Ouvrir le PDF",
        "reader.toc": "Sommaire",
        "reader.translate": "Traduire la section",
        "reader.translating": "Traduction…",
        "reader.translation": "Traduction de la section",
        "reader.close": "Fermer",
        "reader.noText": "Cette section n’a pas de texte traduisible. Choisissez une section principale.",
        "reader.error": "Échec du chargement du texte intégral : {message}",
        "paper.notes": "Notes de lecture",
        "paper.notesHint": "Enregistrez l’article pour garder notes, statut et étiquettes.",
        "paper.status": "Statut",
        "paper.tags": "Étiquettes",
        "paper.tagsHint": "Séparées par des virgules, par ex. méthodes, revue",
        "paper.abstract": "Résumé",
        "paper.noAbstract": "Aucun résumé disponible pour cette notice.",
        "paper.meta": "Publication",
        "paper.doi": "DOI",
        "paper.issn": "ISSN",
        "paper.cited": "Cité {n} fois",
        "paper.oa": "Libre accès",
        "paper.preprint": "Préprint",
        "paper.conference": "Article de conférence",
        "paper.journalPaper": "Article de revue",
        "paper.authors": "Auteurs",
        "paper.journal": "Source",
        "paper.year": "Année",
        "paper.volume": "Volume",
        "paper.issue": "Numéro",
        "paper.pages": "Pages",
        "status.unread": "À lire",
        "status.reading": "En cours",
        "status.read": "Lu",
        "library.title": "Ma bibliothèque",
        "library.subtitle": "Articles enregistrés, statut de lecture et notes. Sélectionnez-en plusieurs pour des citations groupées.",
        "library.empty": "Rien d’enregistré. Utilisez « Enregistrer » sur un article.",
        "library.selected": "{n} sélectionnés",
        "library.selectAll": "Tout sélectionner",
        "library.clear": "Effacer",
        "library.cite": "Citer la sélection",
        "library.exportBibtex": "Exporter BibTeX",
        "library.exportRis": "Exporter RIS",
        "library.exportMd": "Exporter Markdown",
        "library.remove": "Retirer",
        "library.notesCount": "{n} caractères de notes",
        "library.filterAll": "Tout",
        "citation.title": "Citation",
        "citation.titleBatch": "Citer {n} articles",
        "citation.copy": "Copier",
        "citation.copied": "Copié",
        "citation.close": "Fermer",
        "citation.format.gb": "GB/T 7714",
        "citation.format.apa": "APA 7",
        "citation.format.mla": "MLA 9",
        "citation.format.ieee": "IEEE",
        "citation.format.bibtex": "BibTeX",
        "citation.format.ris": "RIS",
        "toast.saved": "Ajouté à votre bibliothèque",
        "toast.removed": "Retiré de votre bibliothèque",
        "toast.updated": "Enregistré",
        "toast.exported": "Exporté",
        "toast.translateFailed": "Échec de la traduction : {message}",
        "error.noToken": "Musee n’est pas prêt : rechargez la page.",
        "error.refresh": "Recharger la page",
        "error.load": "Échec du chargement : {message}",
        "error.retry": "Réessayer",
        loading: "Chargement…",
        "arxiv.title": "arXiv · {category}",
        "arxiv.hint": "Derniers dépôts",
        "conference.back": "Retour aux conférences",
        "conference.about": "À propos de cette conférence",
        "conference.latest": "Articles récents",
        "conference.dataNote": "Indexé depuis les actes OpenAlex ; certaines conférences publient surtout via OpenReview ou leur site et peuvent être incomplètes.",
        "conference.group.ai": "IA",
        "conference.group.robotics": "Robotique",
        "settings.title": "Paramètres",
        "settings.language": "Langue",
        "settings.languageHint": "Modifie uniquement le panneau Musee, pas toute l’application.",
        "settings.translation": "Langue de traduction",
        "settings.translationHint": "Les titres et résumés sont traduits dans cette langue.",
        "settings.titles": "Traduction des titres",
        "settings.titlesHint": "Traduit automatiquement les titres dans les listes. Un appel de modèle par lot, résultat mis en cache.",
        "settings.titlesToggle": "Traduire automatiquement les titres",
        "settings.about": "À propos",
        "settings.version": "Version",
        "settings.dataDir": "Données locales",
        "settings.note": "Musee conserve votre bibliothèque et les traductions en local. Sans compte, sans serveur, sans télémétrie.",
        "settings.close": "Fermer",
        "common.close": "Fermer",
        "common.cancel": "Annuler",
        empty: "Rien pour le moment"
      };
      var DICTS = { en: EN, zh: ZH, fr: FR };
      function makeT(lang) {
        const dict = DICTS[lang] || EN;
        return (key) => dict[key] ?? EN[key] ?? key;
      }
      function readStoredLang(ctx) {
        try {
          const stored = localStorage.getItem("musee.lang");
          if (stored && DICTS[stored]) return stored;
        } catch {
        }
        const active = ctx?.get?.("locale")?.getLocale?.().active || "en";
        if (String(active).startsWith("zh")) return "zh";
        if (String(active).startsWith("fr")) return "fr";
        return "en";
      }
      function readStoredTarget(lang) {
        try {
          const stored = localStorage.getItem("musee.target");
          if (stored === "zh" || stored === "fr") return stored;
        } catch {
        }
        return lang === "fr" ? "fr" : "zh";
      }
      function readStoredTitles(lang) {
        try {
          const stored = localStorage.getItem("musee.titles");
          if (stored === "1") return true;
          if (stored === "0") return false;
        } catch {
        }
        return lang !== "en";
      }

      // src/client/settings.jsx
      function SettingsDialog({ t, lang, onLang, targetLang, onTarget, translateTitles, onTranslateTitles, version, dataDir, onClose }) {
        return h(
          Modal,
          {
            title: t("settings.title"),
            onClose,
            footer: h(Button, { onClick: onClose }, t("settings.close"))
          },
          h(
            "div",
            { className: "musee-settings" },
            h(
              "section",
              { className: "musee-settings-section" },
              h("h3", null, t("settings.language")),
              h("p", { className: "musee-settings-hint" }, t("settings.languageHint")),
              h(
                "div",
                { className: "musee-seg", role: "radiogroup", "aria-label": t("settings.language") },
                LANGUAGES.map(
                  (language) => h(
                    "button",
                    {
                      key: language.id,
                      type: "button",
                      role: "radio",
                      "aria-checked": lang === language.id,
                      className: lang === language.id ? "active" : "",
                      onClick: () => onLang(language.id)
                    },
                    language.label
                  )
                )
              )
            ),
            h(
              "section",
              { className: "musee-settings-section" },
              h("h3", null, t("settings.translation")),
              h("p", { className: "musee-settings-hint" }, t("settings.translationHint")),
              h(
                "div",
                { className: "musee-seg", role: "radiogroup", "aria-label": t("settings.translation") },
                [
                  ["zh", "中文"],
                  ["fr", "Français"]
                ].map(
                  ([id, label]) => h(
                    "button",
                    {
                      key: id,
                      type: "button",
                      role: "radio",
                      "aria-checked": targetLang === id,
                      className: targetLang === id ? "active" : "",
                      onClick: () => onTarget(id)
                    },
                    label
                  )
                )
              )
            ),
            h(
              "section",
              { className: "musee-settings-section" },
              h("h3", null, t("settings.titles")),
              h("p", { className: "musee-settings-hint" }, t("settings.titlesHint")),
              h(
                "label",
                { className: "musee-check-row" },
                h("input", {
                  type: "checkbox",
                  checked: Boolean(translateTitles),
                  onChange: (event) => onTranslateTitles(event.target.checked)
                }),
                h("span", null, t("settings.titlesToggle"))
              )
            ),
            h(
              "section",
              { className: "musee-settings-section" },
              h("h3", null, t("settings.about")),
              h(
                "dl",
                { className: "musee-settings-meta" },
                version ? [h("dt", { key: "v" }, t("settings.version")), h("dd", { key: "vv" }, version)] : null,
                dataDir ? [h("dt", { key: "d" }, t("settings.dataDir")), h("dd", { key: "dd" }, dataDir)] : null
              ),
              h("p", { className: "musee-settings-hint" }, t("settings.note"))
            )
          )
        );
      }

      // tools/node_modules/dompurify/dist/purify.es.mjs
      function _OverloadYield(e, d) {
        this.v = e, this.k = d;
      }
      function _arrayLikeToArray(r, a) {
        (null == a || a > r.length) && (a = r.length);
        for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
        return n;
      }
      function _arrayWithHoles(r) {
        if (Array.isArray(r)) return r;
      }
      function _iterableToArrayLimit(r, l) {
        var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
        if (null != t) {
          var e, n, i, u, a = [], f = true, o = false;
          try {
            if (i = (t = t.call(r)).next, 0 === l) {
              if (Object(t) !== t) return;
              f = false;
            } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
          } catch (r2) {
            o = true, n = r2;
          } finally {
            try {
              if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
            } finally {
              if (o) throw n;
            }
          }
          return a;
        }
      }
      function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      function _slicedToArray(r, e) {
        return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
      }
      function _unsupportedIterableToArray(r, a) {
        if (r) {
          if ("string" == typeof r) return _arrayLikeToArray(r, a);
          var t = {}.toString.call(r).slice(8, -1);
          return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
        }
      }
      function AsyncGenerator(e) {
        var t, n;
        function resume(t2, n2) {
          try {
            var r = e[t2](n2), o = r.value, u = o instanceof _OverloadYield;
            Promise.resolve(u ? o.v : o).then(function(n3) {
              if (u) {
                var i = "return" === t2 && o.k ? t2 : "next";
                if (!o.k || n3.done) return resume(i, n3);
                n3 = e[i](n3).value;
              }
              settle(!!r.done, n3);
            }, function(e2) {
              resume("throw", e2);
            });
          } catch (e2) {
            settle(2, e2);
          }
        }
        function settle(e2, r) {
          2 === e2 ? t.reject(r) : t.resolve({
            value: r,
            done: e2
          }), (t = t.next) ? resume(t.key, t.arg) : n = null;
        }
        this._invoke = function(e2, r) {
          return new Promise(function(o, u) {
            var i = {
              key: e2,
              arg: r,
              resolve: o,
              reject: u,
              next: null
            };
            n ? n = n.next = i : (t = n = i, resume(e2, r));
          });
        }, "function" != typeof e.return && (this.return = void 0);
      }
      AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function() {
        return this;
      }, AsyncGenerator.prototype.next = function(e) {
        return this._invoke("next", e);
      }, AsyncGenerator.prototype.throw = function(e) {
        return this._invoke("throw", e);
      }, AsyncGenerator.prototype.return = function(e) {
        return this._invoke("return", e);
      };
      var entries = Object.entries;
      var setPrototypeOf = Object.setPrototypeOf;
      var isFrozen = Object.isFrozen;
      var getPrototypeOf = Object.getPrototypeOf;
      var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      var freeze = Object.freeze;
      var seal = Object.seal;
      var create = Object.create;
      var _ref = typeof Reflect !== "undefined" && Reflect;
      var apply = _ref.apply;
      var construct = _ref.construct;
      if (!freeze) freeze = function freeze2(x) {
        return x;
      };
      if (!seal) seal = function seal2(x) {
        return x;
      };
      if (!apply) apply = function apply2(func, thisArg) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
        return func.apply(thisArg, args);
      };
      if (!construct) construct = function construct2(Func) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) args[_key2 - 1] = arguments[_key2];
        return new Func(...args);
      };
      var arrayForEach = unapply(Array.prototype.forEach);
      Array.prototype.indexOf;
      var arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
      var arrayPop = unapply(Array.prototype.pop);
      var arrayPush = unapply(Array.prototype.push);
      var arraySlice = unapply(Array.prototype.slice);
      var arraySplice = unapply(Array.prototype.splice);
      var arrayIsArray = Array.isArray;
      var setCreate = unconstruct(Set);
      var setAdd = unapply(Set.prototype.add);
      var setHas = unapply(Set.prototype.has);
      var stringToLowerCase = unapply(String.prototype.toLowerCase);
      var stringToString = unapply(String.prototype.toString);
      var stringMatch = unapply(String.prototype.match);
      var stringReplace = unapply(String.prototype.replace);
      var stringIndexOf = unapply(String.prototype.indexOf);
      var stringTrim = unapply(String.prototype.trim);
      var numberToString = unapply(Number.prototype.toString);
      var booleanToString = unapply(Boolean.prototype.toString);
      var bigintToString = typeof BigInt === "undefined" ? null : unapply(BigInt.prototype.toString);
      var symbolToString = typeof Symbol === "undefined" ? null : unapply(Symbol.prototype.toString);
      var objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
      var objectToString = unapply(Object.prototype.toString);
      var regExpTest = unapply(RegExp.prototype.test);
      var typeErrorCreate = unconstruct(TypeError);
      function unapply(func) {
        return function(thisArg) {
          if (thisArg instanceof RegExp) thisArg.lastIndex = 0;
          for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) args[_key3 - 1] = arguments[_key3];
          return apply(func, thisArg, args);
        };
      }
      function unconstruct(Func) {
        return function() {
          for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) args[_key4] = arguments[_key4];
          return construct(Func, args);
        };
      }
      function addToSet(set, array) {
        let transformCaseFunc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : stringToLowerCase;
        if (setPrototypeOf) setPrototypeOf(set, null);
        if (!arrayIsArray(array)) return set;
        let l = array.length;
        while (l--) {
          let element = array[l];
          if (typeof element === "string") {
            const lcElement = transformCaseFunc(element);
            if (lcElement !== element) {
              if (!isFrozen(array)) array[l] = lcElement;
              element = lcElement;
            }
          }
          set[element] = true;
        }
        return set;
      }
      function cleanArray(array) {
        for (let index = 0; index < array.length; index++) if (!objectHasOwnProperty(array, index)) array[index] = null;
        return array;
      }
      function clone(object) {
        const newObject = create(null);
        for (const _ref2 of entries(object)) {
          var _ref3 = _slicedToArray(_ref2, 2);
          const property = _ref3[0];
          const value = _ref3[1];
          if (objectHasOwnProperty(object, property)) {
            if (arrayIsArray(value)) newObject[property] = cleanArray(value);
            else if (value && typeof value === "object" && value.constructor === Object) newObject[property] = clone(value);
            else newObject[property] = value;
          }
        }
        return newObject;
      }
      function stringifyValue(value) {
        switch (typeof value) {
          case "string":
            return value;
          case "number":
            return numberToString(value);
          case "boolean":
            return booleanToString(value);
          case "bigint":
            return bigintToString ? bigintToString(value) : "0";
          case "symbol":
            return symbolToString ? symbolToString(value) : "Symbol()";
          case "undefined":
            return objectToString(value);
          case "function":
          case "object": {
            if (value === null) return objectToString(value);
            const valueAsRecord = value;
            const valueToString = lookupGetter(valueAsRecord, "toString");
            if (typeof valueToString === "function") {
              const stringified = valueToString(valueAsRecord);
              return typeof stringified === "string" ? stringified : objectToString(stringified);
            }
            return objectToString(value);
          }
          default:
            return objectToString(value);
        }
      }
      function lookupGetter(object, prop) {
        while (object !== null) {
          const desc = getOwnPropertyDescriptor(object, prop);
          if (desc) {
            if (desc.get) return unapply(desc.get);
            if (typeof desc.value === "function") return unapply(desc.value);
          }
          object = getPrototypeOf(object);
        }
        function fallbackValue() {
          return null;
        }
        return fallbackValue;
      }
      function lookupAccessor(object, prop) {
        while (object !== null) {
          const desc = getOwnPropertyDescriptor(object, prop);
          if (desc) return desc.get ? unapply(desc.get) : null;
          object = getPrototypeOf(object);
        }
        return null;
      }
      function isRegex(value) {
        try {
          regExpTest(value, "");
          return true;
        } catch (_unused) {
          return false;
        }
      }
      var html$1 = freeze([
        "a",
        "abbr",
        "acronym",
        "address",
        "area",
        "article",
        "aside",
        "audio",
        "b",
        "bdi",
        "bdo",
        "big",
        "blink",
        "blockquote",
        "body",
        "br",
        "button",
        "canvas",
        "caption",
        "center",
        "cite",
        "code",
        "col",
        "colgroup",
        "content",
        "data",
        "datalist",
        "dd",
        "decorator",
        "del",
        "details",
        "dfn",
        "dialog",
        "dir",
        "div",
        "dl",
        "dt",
        "element",
        "em",
        "fieldset",
        "figcaption",
        "figure",
        "font",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "head",
        "header",
        "hgroup",
        "hr",
        "html",
        "i",
        "img",
        "input",
        "ins",
        "kbd",
        "label",
        "legend",
        "li",
        "main",
        "map",
        "mark",
        "marquee",
        "menu",
        "menuitem",
        "meter",
        "nav",
        "nobr",
        "ol",
        "optgroup",
        "option",
        "output",
        "p",
        "picture",
        "pre",
        "progress",
        "q",
        "rp",
        "rt",
        "ruby",
        "s",
        "samp",
        "search",
        "section",
        "select",
        "shadow",
        "slot",
        "small",
        "source",
        "spacer",
        "span",
        "strike",
        "strong",
        "style",
        "sub",
        "summary",
        "sup",
        "table",
        "tbody",
        "td",
        "template",
        "textarea",
        "tfoot",
        "th",
        "thead",
        "time",
        "tr",
        "track",
        "tt",
        "u",
        "ul",
        "var",
        "video",
        "wbr"
      ]);
      var svg$1 = freeze([
        "svg",
        "a",
        "altglyph",
        "altglyphdef",
        "altglyphitem",
        "animatecolor",
        "animatemotion",
        "animatetransform",
        "circle",
        "clippath",
        "defs",
        "desc",
        "ellipse",
        "enterkeyhint",
        "exportparts",
        "filter",
        "font",
        "g",
        "glyph",
        "glyphref",
        "hkern",
        "image",
        "inputmode",
        "line",
        "lineargradient",
        "marker",
        "mask",
        "metadata",
        "mpath",
        "part",
        "path",
        "pattern",
        "polygon",
        "polyline",
        "radialgradient",
        "rect",
        "stop",
        "style",
        "switch",
        "symbol",
        "text",
        "textpath",
        "title",
        "tref",
        "tspan",
        "view",
        "vkern"
      ]);
      var svgFilters = freeze([
        "feBlend",
        "feColorMatrix",
        "feComponentTransfer",
        "feComposite",
        "feConvolveMatrix",
        "feDiffuseLighting",
        "feDisplacementMap",
        "feDistantLight",
        "feDropShadow",
        "feFlood",
        "feFuncA",
        "feFuncB",
        "feFuncG",
        "feFuncR",
        "feGaussianBlur",
        "feImage",
        "feMerge",
        "feMergeNode",
        "feMorphology",
        "feOffset",
        "fePointLight",
        "feSpecularLighting",
        "feSpotLight",
        "feTile",
        "feTurbulence"
      ]);
      var svgDisallowed = freeze([
        "animate",
        "color-profile",
        "cursor",
        "discard",
        "font-face",
        "font-face-format",
        "font-face-name",
        "font-face-src",
        "font-face-uri",
        "foreignobject",
        "hatch",
        "hatchpath",
        "mesh",
        "meshgradient",
        "meshpatch",
        "meshrow",
        "missing-glyph",
        "script",
        "set",
        "solidcolor",
        "unknown",
        "use"
      ]);
      var mathMl$1 = freeze([
        "math",
        "menclose",
        "merror",
        "mfenced",
        "mfrac",
        "mglyph",
        "mi",
        "mlabeledtr",
        "mmultiscripts",
        "mn",
        "mo",
        "mover",
        "mpadded",
        "mphantom",
        "mroot",
        "mrow",
        "ms",
        "mspace",
        "msqrt",
        "mstyle",
        "msub",
        "msup",
        "msubsup",
        "mtable",
        "mtd",
        "mtext",
        "mtr",
        "munder",
        "munderover",
        "mprescripts"
      ]);
      var mathMlDisallowed = freeze([
        "maction",
        "maligngroup",
        "malignmark",
        "mlongdiv",
        "mscarries",
        "mscarry",
        "msgroup",
        "mstack",
        "msline",
        "msrow",
        "semantics",
        "annotation",
        "annotation-xml",
        "mprescripts",
        "none"
      ]);
      var text = freeze(["#text"]);
      var html = freeze([
        "accept",
        "action",
        "align",
        "alt",
        "autocapitalize",
        "autocomplete",
        "autopictureinpicture",
        "autoplay",
        "background",
        "bgcolor",
        "border",
        "capture",
        "cellpadding",
        "cellspacing",
        "checked",
        "cite",
        "class",
        "clear",
        "color",
        "cols",
        "colspan",
        "command",
        "commandfor",
        "controls",
        "controlslist",
        "coords",
        "crossorigin",
        "datetime",
        "decoding",
        "default",
        "dir",
        "disabled",
        "disablepictureinpicture",
        "disableremoteplayback",
        "download",
        "draggable",
        "enctype",
        "enterkeyhint",
        "exportparts",
        "face",
        "for",
        "headers",
        "height",
        "hidden",
        "high",
        "href",
        "hreflang",
        "id",
        "inert",
        "inputmode",
        "integrity",
        "ismap",
        "kind",
        "label",
        "lang",
        "list",
        "loading",
        "loop",
        "low",
        "max",
        "maxlength",
        "media",
        "method",
        "min",
        "minlength",
        "multiple",
        "muted",
        "name",
        "nonce",
        "noshade",
        "novalidate",
        "nowrap",
        "open",
        "optimum",
        "part",
        "pattern",
        "placeholder",
        "playsinline",
        "popover",
        "popovertarget",
        "popovertargetaction",
        "poster",
        "preload",
        "pubdate",
        "radiogroup",
        "readonly",
        "rel",
        "required",
        "rev",
        "reversed",
        "role",
        "rows",
        "rowspan",
        "spellcheck",
        "scope",
        "selected",
        "shape",
        "size",
        "sizes",
        "slot",
        "span",
        "srclang",
        "start",
        "src",
        "srcset",
        "step",
        "style",
        "summary",
        "tabindex",
        "title",
        "translate",
        "type",
        "usemap",
        "valign",
        "value",
        "width",
        "wrap",
        "xmlns"
      ]);
      var svg = freeze([
        "accent-height",
        "accumulate",
        "additive",
        "alignment-baseline",
        "amplitude",
        "ascent",
        "attributename",
        "attributetype",
        "azimuth",
        "basefrequency",
        "baseline-shift",
        "begin",
        "bias",
        "by",
        "class",
        "clip",
        "clippathunits",
        "clip-path",
        "clip-rule",
        "color",
        "color-interpolation",
        "color-interpolation-filters",
        "color-profile",
        "color-rendering",
        "cx",
        "cy",
        "d",
        "dx",
        "dy",
        "diffuseconstant",
        "direction",
        "display",
        "divisor",
        "dominant-baseline",
        "dur",
        "edgemode",
        "elevation",
        "end",
        "exponent",
        "fill",
        "fill-opacity",
        "fill-rule",
        "filter",
        "filterunits",
        "flood-color",
        "flood-opacity",
        "font-family",
        "font-size",
        "font-size-adjust",
        "font-stretch",
        "font-style",
        "font-variant",
        "font-weight",
        "fx",
        "fy",
        "g1",
        "g2",
        "glyph-name",
        "glyphref",
        "gradientunits",
        "gradienttransform",
        "height",
        "href",
        "id",
        "image-rendering",
        "in",
        "in2",
        "intercept",
        "k",
        "k1",
        "k2",
        "k3",
        "k4",
        "kerning",
        "keypoints",
        "keysplines",
        "keytimes",
        "lang",
        "lengthadjust",
        "letter-spacing",
        "kernelmatrix",
        "kernelunitlength",
        "lighting-color",
        "local",
        "marker-end",
        "marker-mid",
        "marker-start",
        "markerheight",
        "markerunits",
        "markerwidth",
        "maskcontentunits",
        "maskunits",
        "max",
        "mask",
        "mask-type",
        "media",
        "method",
        "mode",
        "min",
        "name",
        "numoctaves",
        "offset",
        "operator",
        "opacity",
        "order",
        "orient",
        "orientation",
        "origin",
        "overflow",
        "paint-order",
        "path",
        "pathlength",
        "patterncontentunits",
        "patterntransform",
        "patternunits",
        "pointer-events",
        "points",
        "preservealpha",
        "preserveaspectratio",
        "primitiveunits",
        "r",
        "rx",
        "ry",
        "radius",
        "refx",
        "refy",
        "repeatcount",
        "repeatdur",
        "restart",
        "result",
        "rotate",
        "scale",
        "seed",
        "shape-rendering",
        "slope",
        "specularconstant",
        "specularexponent",
        "spreadmethod",
        "startoffset",
        "stddeviation",
        "stitchtiles",
        "stop-color",
        "stop-opacity",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-opacity",
        "stroke",
        "stroke-width",
        "style",
        "surfacescale",
        "systemlanguage",
        "tabindex",
        "tablevalues",
        "targetx",
        "targety",
        "transform",
        "transform-origin",
        "text-anchor",
        "text-decoration",
        "text-orientation",
        "text-rendering",
        "textlength",
        "type",
        "u1",
        "u2",
        "unicode",
        "values",
        "vector-effect",
        "viewbox",
        "visibility",
        "version",
        "vert-adv-y",
        "vert-origin-x",
        "vert-origin-y",
        "width",
        "word-spacing",
        "wrap",
        "writing-mode",
        "xchannelselector",
        "ychannelselector",
        "x",
        "x1",
        "x2",
        "xmlns",
        "y",
        "y1",
        "y2",
        "z",
        "zoomandpan"
      ]);
      var mathMl = freeze([
        "accent",
        "accentunder",
        "align",
        "bevelled",
        "close",
        "columnalign",
        "columnlines",
        "columnspacing",
        "columnspan",
        "denomalign",
        "depth",
        "dir",
        "display",
        "displaystyle",
        "encoding",
        "fence",
        "frame",
        "height",
        "href",
        "id",
        "largeop",
        "length",
        "linethickness",
        "lquote",
        "lspace",
        "mathbackground",
        "mathcolor",
        "mathsize",
        "mathvariant",
        "maxsize",
        "minsize",
        "movablelimits",
        "notation",
        "numalign",
        "open",
        "rowalign",
        "rowlines",
        "rowspacing",
        "rowspan",
        "rspace",
        "rquote",
        "scriptlevel",
        "scriptminsize",
        "scriptsizemultiplier",
        "selection",
        "separator",
        "separators",
        "stretchy",
        "subscriptshift",
        "supscriptshift",
        "symmetric",
        "voffset",
        "width",
        "xmlns"
      ]);
      var xml = freeze([
        "xlink:href",
        "xml:id",
        "xlink:title",
        "xml:space",
        "xmlns:xlink"
      ]);
      var MUSTACHE_EXPR = seal(/{{[\w\W]*|^[\w\W]*}}/g);
      var ERB_EXPR = seal(/<%[\w\W]*|^[\w\W]*%>/g);
      var TMPLIT_EXPR = seal(/\${[\w\W]*/g);
      var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/);
      var ARIA_ATTR = seal(/^aria-[\-\w]+$/);
      var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
      var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
      var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g);
      var DOCTYPE_NAME = seal(/^html$/i);
      var CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);
      var ELEMENT_MARKUP_PROBE = seal(/<[/\w!]/g);
      var COMMENT_MARKUP_PROBE = seal(/<[/\w]/g);
      var FALLBACK_TAG_CLOSE = seal(/<\/no(script|embed|frames)/i);
      var SELF_CLOSING_TAG = seal(/\/>/i);
      var NODE_TYPE = {
        element: 1,
        attribute: 2,
        text: 3,
        cdataSection: 4,
        entityReference: 5,
        entityNode: 6,
        processingInstruction: 7,
        comment: 8,
        document: 9,
        documentType: 10,
        documentFragment: 11,
        notation: 12
      };
      var LITERAL_TEXT_ELEMENTS = freeze(addToSet({}, [
        "style",
        "script",
        "xmp",
        "iframe",
        "noembed",
        "noframes",
        "plaintext",
        "noscript"
      ]));
      var getGlobal = function getGlobal2() {
        return typeof window === "undefined" ? null : window;
      };
      var _createTrustedTypesPolicy = function _createTrustedTypesPolicy2(trustedTypes, purifyHostElement) {
        if (typeof trustedTypes !== "object" || typeof trustedTypes.createPolicy !== "function") return null;
        let suffix = null;
        const ATTR_NAME = "data-tt-policy-suffix";
        if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) suffix = purifyHostElement.getAttribute(ATTR_NAME);
        const policyName = "dompurify" + (suffix ? "#" + suffix : "");
        try {
          return trustedTypes.createPolicy(policyName, {
            createHTML(html2) {
              return html2;
            },
            createScriptURL(scriptUrl) {
              return scriptUrl;
            }
          });
        } catch (_) {
          console.warn("TrustedTypes policy " + policyName + " could not be created.");
          return null;
        }
      };
      var _createHooksMap = function _createHooksMap2() {
        return {
          afterSanitizeAttributes: [],
          afterSanitizeElements: [],
          afterSanitizeShadowDOM: [],
          beforeSanitizeAttributes: [],
          beforeSanitizeElements: [],
          beforeSanitizeShadowDOM: [],
          uponSanitizeAttribute: [],
          uponSanitizeElement: [],
          uponSanitizeShadowNode: []
        };
      };
      var _resolveSetOption = function _resolveSetOption2(cfg, key, fallback, options) {
        return objectHasOwnProperty(cfg, key) && arrayIsArray(cfg[key]) ? addToSet(options.base ? clone(options.base) : {}, cfg[key], options.transform) : fallback;
      };
      var _resolveObjectOption = function _resolveObjectOption2(cfg, key, makeFallback) {
        const value = objectHasOwnProperty(cfg, key) ? cfg[key] : void 0;
        return value && typeof value === "object" ? clone(value) : makeFallback();
      };
      function createDOMPurify() {
        let window2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : getGlobal();
        const DOMPurify = (root) => createDOMPurify(root);
        DOMPurify.version = "3.4.17";
        DOMPurify.removed = [];
        if (!window2 || !window2.document || window2.document.nodeType !== NODE_TYPE.document || !window2.Element) {
          DOMPurify.isSupported = false;
          return DOMPurify;
        }
        let document2 = window2.document;
        const originalDocument = document2;
        const currentScript = originalDocument.currentScript;
        window2.DocumentFragment;
        const HTMLTemplateElement = window2.HTMLTemplateElement, Node = window2.Node, Element = window2.Element, NodeFilter = window2.NodeFilter;
        window2.NamedNodeMap === void 0 && (window2.NamedNodeMap || window2.MozNamedAttrMap);
        window2.HTMLFormElement;
        const DOMParser = window2.DOMParser, trustedTypes = window2.trustedTypes;
        const ElementPrototype = Element.prototype;
        const cloneNode = lookupGetter(ElementPrototype, "cloneNode");
        const remove = lookupGetter(ElementPrototype, "remove");
        const removeAttributeNode = lookupGetter(ElementPrototype, "removeAttributeNode");
        const getNextSibling = lookupGetter(ElementPrototype, "nextSibling");
        const getChildNodes = lookupGetter(ElementPrototype, "childNodes");
        const getParentNode = lookupGetter(ElementPrototype, "parentNode");
        const getShadowRoot = lookupGetter(ElementPrototype, "shadowRoot");
        const getAttributes = lookupGetter(ElementPrototype, "attributes");
        const getNodeType = Node && Node.prototype ? lookupGetter(Node.prototype, "nodeType") : null;
        const getNodeName = Node && Node.prototype ? lookupGetter(Node.prototype, "nodeName") : null;
        const getOwnerDocument = Node && Node.prototype ? lookupGetter(Node.prototype, "ownerDocument") : null;
        const _readNodeType = function _readNodeType2(node) {
          return getNodeType ? getNodeType(node) : node.nodeType;
        };
        const _readNodeName = function _readNodeName2(node) {
          return getNodeName ? getNodeName(node) : node.nodeName;
        };
        const getNamespaceURI = lookupAccessor(ElementPrototype, "namespaceURI");
        const _readNamespaceURI = function _readNamespaceURI2(element) {
          return getNamespaceURI ? getNamespaceURI(element) : element.namespaceURI;
        };
        if (typeof HTMLTemplateElement === "function") {
          const template = document2.createElement("template");
          if (template.content && template.content.ownerDocument) document2 = template.content.ownerDocument;
        }
        let trustedTypesPolicy;
        let emptyHTML = "";
        let defaultTrustedTypesPolicy;
        let defaultTrustedTypesPolicyResolved = false;
        let IN_TRUSTED_TYPES_POLICY = 0;
        const _assertNotInTrustedTypesPolicy = function _assertNotInTrustedTypesPolicy2() {
          if (IN_TRUSTED_TYPES_POLICY > 0) throw typeErrorCreate('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.');
        };
        const _createTrustedHTML = function _createTrustedHTML2(html2) {
          _assertNotInTrustedTypesPolicy();
          IN_TRUSTED_TYPES_POLICY++;
          try {
            return trustedTypesPolicy.createHTML(html2);
          } finally {
            IN_TRUSTED_TYPES_POLICY--;
          }
        };
        const _createTrustedScriptURL = function _createTrustedScriptURL2(scriptUrl) {
          _assertNotInTrustedTypesPolicy();
          IN_TRUSTED_TYPES_POLICY++;
          try {
            return trustedTypesPolicy.createScriptURL(scriptUrl);
          } finally {
            IN_TRUSTED_TYPES_POLICY--;
          }
        };
        const _getDefaultTrustedTypesPolicy = function _getDefaultTrustedTypesPolicy2() {
          if (!defaultTrustedTypesPolicyResolved) {
            defaultTrustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
            defaultTrustedTypesPolicyResolved = true;
          }
          return defaultTrustedTypesPolicy;
        };
        const _document = document2, implementation = _document.implementation, createNodeIterator = _document.createNodeIterator, createDocumentFragment = _document.createDocumentFragment, getElementsByTagName = _document.getElementsByTagName;
        const importNode = originalDocument.importNode;
        let hooks = _createHooksMap();
        DOMPurify.isSupported = typeof entries === "function" && typeof getParentNode === "function" && implementation && implementation.createHTMLDocument !== void 0;
        const MUSTACHE_EXPR$1 = MUSTACHE_EXPR, ERB_EXPR$1 = ERB_EXPR, TMPLIT_EXPR$1 = TMPLIT_EXPR, DATA_ATTR$1 = DATA_ATTR, ARIA_ATTR$1 = ARIA_ATTR, IS_SCRIPT_OR_DATA$1 = IS_SCRIPT_OR_DATA, ATTR_WHITESPACE$1 = ATTR_WHITESPACE, CUSTOM_ELEMENT$1 = CUSTOM_ELEMENT;
        let IS_ALLOWED_URI$1 = IS_ALLOWED_URI;
        let ALLOWED_TAGS = null;
        const DEFAULT_ALLOWED_TAGS = addToSet({}, [
          ...html$1,
          ...svg$1,
          ...svgFilters,
          ...mathMl$1,
          ...text
        ]);
        let ALLOWED_ATTR = null;
        const DEFAULT_ALLOWED_ATTR = addToSet({}, [
          ...html,
          ...svg,
          ...mathMl,
          ...xml
        ]);
        let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
          tagNameCheck: {
            writable: true,
            configurable: false,
            enumerable: true,
            value: null
          },
          attributeNameCheck: {
            writable: true,
            configurable: false,
            enumerable: true,
            value: null
          },
          allowCustomizedBuiltInElements: {
            writable: true,
            configurable: false,
            enumerable: true,
            value: false
          }
        }));
        let FORBID_TAGS = null;
        let FORBID_ATTR = null;
        const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
          tagCheck: {
            writable: true,
            configurable: false,
            enumerable: true,
            value: null
          },
          attributeCheck: {
            writable: true,
            configurable: false,
            enumerable: true,
            value: null
          }
        }));
        let ALLOW_ARIA_ATTR = true;
        let ALLOW_DATA_ATTR = true;
        let ALLOW_UNKNOWN_PROTOCOLS = false;
        let ALLOW_SELF_CLOSE_IN_ATTR = true;
        let SAFE_FOR_TEMPLATES = false;
        let SAFE_FOR_XML = true;
        let WHOLE_DOCUMENT = false;
        let SET_CONFIG = false;
        let SET_CONFIG_ALLOWED_TAGS = null;
        let SET_CONFIG_ALLOWED_ATTR = null;
        let FORCE_BODY = false;
        let RETURN_DOM = false;
        let RETURN_DOM_FRAGMENT = false;
        let RETURN_TRUSTED_TYPE = false;
        let SANITIZE_DOM = true;
        let SANITIZE_NAMED_PROPS = false;
        const SANITIZE_NAMED_PROPS_PREFIX = "user-content-";
        let KEEP_CONTENT = true;
        let IN_PLACE = false;
        let IN_PLACE_VISITED = null;
        let USE_PROFILES = {};
        let FORBID_CONTENTS = null;
        const DEFAULT_FORBID_CONTENTS = addToSet({}, [
          "annotation-xml",
          "audio",
          "colgroup",
          "desc",
          "foreignobject",
          "head",
          "iframe",
          "math",
          "mi",
          "mn",
          "mo",
          "ms",
          "mtext",
          "noembed",
          "noframes",
          "noscript",
          "plaintext",
          "script",
          "selectedcontent",
          "style",
          "svg",
          "template",
          "thead",
          "title",
          "video",
          "xmp"
        ]);
        let DATA_URI_TAGS = null;
        const DEFAULT_DATA_URI_TAGS = addToSet({}, [
          "audio",
          "video",
          "img",
          "source",
          "image",
          "track"
        ]);
        let URI_SAFE_ATTRIBUTES = null;
        const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, [
          "alt",
          "class",
          "for",
          "id",
          "label",
          "name",
          "pattern",
          "placeholder",
          "role",
          "summary",
          "title",
          "value",
          "style",
          "xmlns"
        ]);
        const MATHML_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
        const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
        const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
        let NAMESPACE = HTML_NAMESPACE;
        let IS_EMPTY_INPUT = false;
        let ALLOWED_NAMESPACES = null;
        const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [
          MATHML_NAMESPACE,
          SVG_NAMESPACE,
          HTML_NAMESPACE
        ], stringToString);
        const DEFAULT_MATHML_TEXT_INTEGRATION_POINTS = freeze([
          "mi",
          "mo",
          "mn",
          "ms",
          "mtext"
        ]);
        let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS);
        const DEFAULT_HTML_INTEGRATION_POINTS = freeze(["annotation-xml"]);
        let HTML_INTEGRATION_POINTS = addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS);
        const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, [
          "title",
          "style",
          "font",
          "a",
          "script"
        ]);
        let PARSER_MEDIA_TYPE = null;
        const SUPPORTED_PARSER_MEDIA_TYPES = ["application/xhtml+xml", "text/html"];
        const DEFAULT_PARSER_MEDIA_TYPE = "text/html";
        let transformCaseFunc = null;
        let CONFIG = null;
        const formElement = document2.createElement("form");
        const isRegexOrFunction = function isRegexOrFunction2(testValue) {
          return testValue instanceof RegExp || testValue instanceof Function;
        };
        const _parseConfig = function _parseConfig2() {
          let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          if (CONFIG && CONFIG === cfg) return;
          if (!cfg || typeof cfg !== "object") cfg = {};
          cfg = clone(cfg);
          PARSER_MEDIA_TYPE = SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
          transformCaseFunc = PARSER_MEDIA_TYPE === "application/xhtml+xml" ? stringToString : stringToLowerCase;
          ALLOWED_TAGS = _resolveSetOption(cfg, "ALLOWED_TAGS", DEFAULT_ALLOWED_TAGS, { transform: transformCaseFunc });
          ALLOWED_ATTR = _resolveSetOption(cfg, "ALLOWED_ATTR", DEFAULT_ALLOWED_ATTR, { transform: transformCaseFunc });
          ALLOWED_NAMESPACES = _resolveSetOption(cfg, "ALLOWED_NAMESPACES", DEFAULT_ALLOWED_NAMESPACES, { transform: stringToString });
          URI_SAFE_ATTRIBUTES = _resolveSetOption(cfg, "ADD_URI_SAFE_ATTR", DEFAULT_URI_SAFE_ATTRIBUTES, {
            transform: transformCaseFunc,
            base: DEFAULT_URI_SAFE_ATTRIBUTES
          });
          DATA_URI_TAGS = _resolveSetOption(cfg, "ADD_DATA_URI_TAGS", DEFAULT_DATA_URI_TAGS, {
            transform: transformCaseFunc,
            base: DEFAULT_DATA_URI_TAGS
          });
          FORBID_CONTENTS = _resolveSetOption(cfg, "FORBID_CONTENTS", DEFAULT_FORBID_CONTENTS, { transform: transformCaseFunc });
          FORBID_TAGS = _resolveSetOption(cfg, "FORBID_TAGS", clone({}), { transform: transformCaseFunc });
          FORBID_ATTR = _resolveSetOption(cfg, "FORBID_ATTR", clone({}), { transform: transformCaseFunc });
          USE_PROFILES = objectHasOwnProperty(cfg, "USE_PROFILES") ? cfg.USE_PROFILES && typeof cfg.USE_PROFILES === "object" ? clone(cfg.USE_PROFILES) : cfg.USE_PROFILES : false;
          ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false;
          ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false;
          ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false;
          ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false;
          SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false;
          SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false;
          WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false;
          RETURN_DOM = cfg.RETURN_DOM || false;
          RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false;
          RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
          FORCE_BODY = cfg.FORCE_BODY || false;
          SANITIZE_DOM = cfg.SANITIZE_DOM !== false;
          SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false;
          KEEP_CONTENT = cfg.KEEP_CONTENT !== false;
          IN_PLACE = cfg.IN_PLACE || false;
          IS_ALLOWED_URI$1 = isRegex(cfg.ALLOWED_URI_REGEXP) ? cfg.ALLOWED_URI_REGEXP : IS_ALLOWED_URI;
          NAMESPACE = typeof cfg.NAMESPACE === "string" ? cfg.NAMESPACE : HTML_NAMESPACE;
          MATHML_TEXT_INTEGRATION_POINTS = _resolveObjectOption(cfg, "MATHML_TEXT_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_MATHML_TEXT_INTEGRATION_POINTS));
          HTML_INTEGRATION_POINTS = _resolveObjectOption(cfg, "HTML_INTEGRATION_POINTS", () => addToSet({}, DEFAULT_HTML_INTEGRATION_POINTS));
          const customElementHandling = _resolveObjectOption(cfg, "CUSTOM_ELEMENT_HANDLING", () => create(null));
          CUSTOM_ELEMENT_HANDLING = create(null);
          if (objectHasOwnProperty(customElementHandling, "tagNameCheck") && isRegexOrFunction(customElementHandling.tagNameCheck)) CUSTOM_ELEMENT_HANDLING.tagNameCheck = customElementHandling.tagNameCheck;
          if (objectHasOwnProperty(customElementHandling, "attributeNameCheck") && isRegexOrFunction(customElementHandling.attributeNameCheck)) CUSTOM_ELEMENT_HANDLING.attributeNameCheck = customElementHandling.attributeNameCheck;
          if (objectHasOwnProperty(customElementHandling, "allowCustomizedBuiltInElements") && typeof customElementHandling.allowCustomizedBuiltInElements === "boolean") CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = customElementHandling.allowCustomizedBuiltInElements;
          seal(CUSTOM_ELEMENT_HANDLING);
          if (SAFE_FOR_TEMPLATES) ALLOW_DATA_ATTR = false;
          if (RETURN_DOM_FRAGMENT) RETURN_DOM = true;
          if (USE_PROFILES) {
            ALLOWED_TAGS = addToSet({}, text);
            ALLOWED_ATTR = create(null);
            if (USE_PROFILES.html === true) {
              addToSet(ALLOWED_TAGS, html$1);
              addToSet(ALLOWED_ATTR, html);
            }
            if (USE_PROFILES.svg === true) {
              addToSet(ALLOWED_TAGS, svg$1);
              addToSet(ALLOWED_ATTR, svg);
              addToSet(ALLOWED_ATTR, xml);
            }
            if (USE_PROFILES.svgFilters === true) {
              addToSet(ALLOWED_TAGS, svgFilters);
              addToSet(ALLOWED_ATTR, svg);
              addToSet(ALLOWED_ATTR, xml);
            }
            if (USE_PROFILES.mathMl === true) {
              addToSet(ALLOWED_TAGS, mathMl$1);
              addToSet(ALLOWED_ATTR, mathMl);
              addToSet(ALLOWED_ATTR, xml);
            }
          }
          EXTRA_ELEMENT_HANDLING.tagCheck = null;
          EXTRA_ELEMENT_HANDLING.attributeCheck = null;
          if (objectHasOwnProperty(cfg, "ADD_TAGS")) {
            if (typeof cfg.ADD_TAGS === "function") EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
            else if (arrayIsArray(cfg.ADD_TAGS)) {
              if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) ALLOWED_TAGS = clone(ALLOWED_TAGS);
              addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
            }
          }
          if (objectHasOwnProperty(cfg, "ADD_ATTR")) {
            if (typeof cfg.ADD_ATTR === "function") EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
            else if (arrayIsArray(cfg.ADD_ATTR)) {
              if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) ALLOWED_ATTR = clone(ALLOWED_ATTR);
              addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
            }
          }
          if (objectHasOwnProperty(cfg, "ADD_FORBID_CONTENTS") && arrayIsArray(cfg.ADD_FORBID_CONTENTS)) {
            if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) FORBID_CONTENTS = clone(FORBID_CONTENTS);
            addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
          }
          if (KEEP_CONTENT) ALLOWED_TAGS["#text"] = true;
          if (WHOLE_DOCUMENT) addToSet(ALLOWED_TAGS, [
            "html",
            "head",
            "body"
          ]);
          if (ALLOWED_TAGS.table) {
            addToSet(ALLOWED_TAGS, ["tbody"]);
            delete FORBID_TAGS.tbody;
          }
          if (cfg.TRUSTED_TYPES_POLICY) {
            if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== "function") throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
            if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== "function") throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
            const previousTrustedTypesPolicy = trustedTypesPolicy;
            trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
            try {
              emptyHTML = _createTrustedHTML("");
            } catch (error) {
              trustedTypesPolicy = previousTrustedTypesPolicy;
              throw error;
            }
          } else if (cfg.TRUSTED_TYPES_POLICY === null) {
            trustedTypesPolicy = void 0;
            emptyHTML = "";
          } else {
            if (trustedTypesPolicy === void 0) trustedTypesPolicy = _getDefaultTrustedTypesPolicy();
            if (trustedTypesPolicy && typeof emptyHTML === "string") emptyHTML = _createTrustedHTML("");
          }
          if (freeze) freeze(cfg);
          CONFIG = cfg;
        };
        const ALL_SVG_TAGS = addToSet({}, [
          ...svg$1,
          ...svgFilters,
          ...svgDisallowed
        ]);
        const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
        const _checkSvgNamespace = function _checkSvgNamespace2(tagName, parent, parentTagName) {
          if (parent.namespaceURI === HTML_NAMESPACE) return tagName === "svg";
          if (parent.namespaceURI === MATHML_NAMESPACE) return tagName === "svg" && (parentTagName === "annotation-xml" || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
          return Boolean(ALL_SVG_TAGS[tagName]);
        };
        const _checkMathMlNamespace = function _checkMathMlNamespace2(tagName, parent, parentTagName) {
          if (parent.namespaceURI === HTML_NAMESPACE) return tagName === "math";
          if (parent.namespaceURI === SVG_NAMESPACE) return tagName === "math" && HTML_INTEGRATION_POINTS[parentTagName];
          return Boolean(ALL_MATHML_TAGS[tagName]);
        };
        const _checkHtmlNamespace = function _checkHtmlNamespace2(tagName, parent, parentTagName) {
          if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) return false;
          if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) return false;
          return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
        };
        const _checkValidNamespace = function _checkValidNamespace2(element) {
          const elementNamespace = _readNamespaceURI(element);
          const tagName = stringToLowerCase(_readNodeName(element));
          const parentNode = getParentNode(element);
          let parent;
          let parentTagName;
          if (parentNode && _readNodeType(parentNode) === NODE_TYPE.element) {
            parent = { namespaceURI: _readNamespaceURI(parentNode) };
            parentTagName = stringToLowerCase(_readNodeName(parentNode));
          } else {
            parent = { namespaceURI: NAMESPACE };
            parentTagName = "template";
          }
          if (!ALLOWED_NAMESPACES[elementNamespace]) return false;
          if (elementNamespace === SVG_NAMESPACE) return _checkSvgNamespace(tagName, parent, parentTagName);
          if (elementNamespace === MATHML_NAMESPACE) return _checkMathMlNamespace(tagName, parent, parentTagName);
          if (elementNamespace === HTML_NAMESPACE) return _checkHtmlNamespace(tagName, parent, parentTagName);
          if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && ALLOWED_NAMESPACES[elementNamespace]) return true;
          return false;
        };
        const _forceRemove = function _forceRemove2(node) {
          arrayPush(DOMPurify.removed, { element: node });
          try {
            getParentNode(node).removeChild(node);
          } catch (_) {
            remove(node);
            if (!getParentNode(node)) throw typeErrorCreate("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place");
          }
        };
        const _stripAttributeNode = function _stripAttributeNode2(element, attribute, name) {
          try {
            removeAttributeNode(element, attribute);
          } catch (_) {
            try {
              element.removeAttribute(name);
            } catch (_2) {
            }
          }
        };
        const _neutralizeRoot = function _neutralizeRoot2(root) {
          _neutralizeSubtree(root);
          const childNodes = getChildNodes(root);
          if (childNodes) arrayForEach(arraySlice(childNodes), (child) => {
            try {
              remove(child);
            } catch (_) {
            }
          });
          const attributes = _readNodeType(root) === NODE_TYPE.element ? getAttributes(root) : null;
          if (attributes) for (let i = attributes.length - 1; i >= 0; --i) {
            const attribute = attributes[i];
            const name = attribute && attribute.name;
            if (typeof name === "string") _stripAttributeNode(root, attribute, name);
          }
        };
        const _removeAttribute = function _removeAttribute2(name, element, attr) {
          if (!attr) try {
            attr = element.getAttributeNode(name);
          } catch (_) {
            attr = null;
          }
          arrayPush(DOMPurify.removed, {
            attribute: attr || null,
            from: element
          });
          try {
            if (attr) removeAttributeNode(element, attr);
            else element.removeAttribute(name);
          } catch (_) {
            try {
              element.removeAttribute(name);
            } catch (_2) {
            }
          }
          if (name === "is") {
            if (RETURN_DOM || RETURN_DOM_FRAGMENT) try {
              _forceRemove(element);
            } catch (_) {
            }
            else try {
              element.setAttribute(name, "");
            } catch (_) {
            }
          }
        };
        const _stripDisallowedAttributes = function _stripDisallowedAttributes2(element) {
          const attributes = getAttributes(element);
          if (!attributes) return;
          for (let i = attributes.length - 1; i >= 0; --i) {
            const attribute = attributes[i];
            const name = attribute && attribute.name;
            if (typeof name !== "string" || ALLOWED_ATTR[transformCaseFunc(name)]) continue;
            _stripAttributeNode(element, attribute, name);
          }
        };
        const _walkTree = function _walkTree2(root, visit) {
          let intoShadow = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
          const stack = [root];
          while (stack.length > 0) {
            const node = stack.pop();
            if (visit(node) === false) continue;
            if (intoShadow && _readNodeType(node) === NODE_TYPE.element) {
              const shadowRoot = getShadowRoot(node);
              if (_isDocumentFragment(shadowRoot)) stack.push(shadowRoot);
            }
            const childNodes = getChildNodes(node);
            if (childNodes) for (let i = childNodes.length - 1; i >= 0; --i) stack.push(childNodes[i]);
          }
        };
        const _neutralizeSubtree = function _neutralizeSubtree2(root) {
          _walkTree(root, (node) => {
            if (_readNodeType(node) === NODE_TYPE.element) _stripDisallowedAttributes(node);
          });
        };
        const _collectLiveNodes = function _collectLiveNodes2(root) {
          const nodes = [];
          _walkTree(root, (node) => {
            nodes.push(node);
          }, true);
          return nodes;
        };
        const _neutralizeEscapedElements = function _neutralizeEscapedElements2(root, before) {
          const reachable = setCreate();
          arrayForEach(_collectLiveNodes(root), (node) => {
            if (_readNodeType(node) === NODE_TYPE.element) setAdd(reachable, node);
          });
          arrayForEach(before, (node) => {
            if (_readNodeType(node) === NODE_TYPE.element && !setHas(reachable, node)) _stripDisallowedAttributes(node);
          });
        };
        const _neutralizeDiscarded = function _neutralizeDiscarded2(root, before) {
          let rootRemoved = false;
          arrayForEach(DOMPurify.removed, (entry) => {
            if (entry.element) {
              rootRemoved = rootRemoved || entry.element === root;
              _neutralizeSubtree(entry.element);
            }
          });
          _neutralizeEscapedElements(root, before);
          return rootRemoved;
        };
        const MAX_UNVISITED_ROUNDS = 8;
        const _sanitizeUnvisitedNodes = function _sanitizeUnvisitedNodes2(root, before) {
          const visited = IN_PLACE_VISITED;
          let original = null;
          const getOriginal = () => {
            if (!original) {
              original = setCreate();
              arrayForEach(before, (beforeNode) => {
                setAdd(original, beforeNode);
              });
            }
            return original;
          };
          for (let round = 0; ; round++) {
            const live = _collectLiveNodes(root);
            const containers = [root];
            let pending = false;
            arrayForEach(live, (node) => {
              if (_readNodeType(node) === NODE_TYPE.documentFragment) arrayPush(containers, node);
              else if (!pending && !setHas(visited, node)) pending = setHas(getOriginal(), node);
            });
            if (!pending) return;
            if (round >= MAX_UNVISITED_ROUNDS) throw typeErrorCreate("the tree kept changing during in-place sanitization; refusing to return it");
            arrayForEach(containers, (container, index) => {
              _sanitizeUnvisitedIn(container, index > 0, root, getOriginal());
            });
          }
        };
        const _sanitizeUnvisitedIn = function _sanitizeUnvisitedIn2(container, inShadow, root, original) {
          const iterator = _createNodeIterator(container);
          let node;
          while (node = iterator.nextNode()) {
            if (!setHas(original, node) || setHas(IN_PLACE_VISITED, node)) continue;
            if (inShadow) _executeHooks(hooks.uponSanitizeShadowNode, node, null);
            _sanitizeElements(node, root);
            _sanitizeAttributes(node, root);
            if (_isDocumentFragment(node.content)) _sanitizeShadowDOM2(node.content);
          }
        };
        const _markVisited = function _markVisited2(node) {
          if (IN_PLACE_VISITED) setAdd(IN_PLACE_VISITED, node);
        };
        const _isPatchLinkageAttribute = function _isPatchLinkageAttribute2(lcName, lcTag) {
          if (!SAFE_FOR_XML) return false;
          if (lcName === "patchsrc") return true;
          return lcName === "for" && lcTag !== "label" && lcTag !== "output";
        };
        const _neutralizePatchLinkage = function _neutralizePatchLinkage2(root) {
          if (!SAFE_FOR_XML) return;
          _walkTree(root, (node) => {
            const nodeType = _readNodeType(node);
            if (nodeType === NODE_TYPE.processingInstruction || nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, node.data)) {
              try {
                remove(node);
              } catch (_) {
              }
              return false;
            }
            if (nodeType === NODE_TYPE.element) {
              const element = node;
              const lcTag = transformCaseFunc(_readNodeName(node));
              try {
                if (element.hasAttribute && element.hasAttribute("patchsrc")) element.removeAttribute("patchsrc");
                if (element.hasAttribute && element.hasAttribute("for") && _isPatchLinkageAttribute("for", lcTag)) element.removeAttribute("for");
              } catch (_) {
              }
            }
            return true;
          });
        };
        const _initDocument = function _initDocument2(dirty) {
          let doc = null;
          let leadingWhitespace = null;
          if (FORCE_BODY) dirty = "<remove></remove>" + dirty;
          else {
            const matches = stringMatch(dirty, /^[\r\n\t ]+/);
            leadingWhitespace = matches && matches[0];
          }
          if (PARSER_MEDIA_TYPE === "application/xhtml+xml" && NAMESPACE === HTML_NAMESPACE) dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + "</body></html>";
          const dirtyPayload = trustedTypesPolicy ? _createTrustedHTML(dirty) : dirty;
          if (NAMESPACE === HTML_NAMESPACE) try {
            doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
          } catch (_) {
          }
          if (!doc || !doc.documentElement) {
            doc = implementation.createDocument(NAMESPACE, "template", null);
            try {
              doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
            } catch (_) {
            }
          }
          const body = doc.body || doc.documentElement;
          if (dirty && leadingWhitespace) body.insertBefore(document2.createTextNode(leadingWhitespace), body.childNodes[0] || null);
          if (NAMESPACE === HTML_NAMESPACE) return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? "html" : "body")[0];
          return WHOLE_DOCUMENT ? doc.documentElement : body;
        };
        const _createNodeIterator = function _createNodeIterator2(root) {
          const doc = getOwnerDocument ? getOwnerDocument(root) : root.ownerDocument;
          return createNodeIterator.call(doc || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
        };
        const _stripTemplateExpressions = function _stripTemplateExpressions2(value) {
          value = stringReplace(value, MUSTACHE_EXPR$1, " ");
          value = stringReplace(value, ERB_EXPR$1, " ");
          value = stringReplace(value, TMPLIT_EXPR$1, " ");
          return value;
        };
        const _scrubTemplateExpressions2 = function _scrubTemplateExpressions(node) {
          var _node$querySelectorAl;
          _scrubOwnCharacterData(node);
          const templates = (_node$querySelectorAl = node.querySelectorAll) === null || _node$querySelectorAl === void 0 ? void 0 : _node$querySelectorAl.call(node, "template");
          if (templates) arrayForEach(templates, (tmpl) => {
            if (_isDocumentFragment(tmpl.content)) _scrubTemplateExpressions2(tmpl.content);
          });
        };
        const _scrubOwnCharacterData = function _scrubOwnCharacterData2(node) {
          node.normalize();
          const doc = getOwnerDocument ? getOwnerDocument(node) : node.ownerDocument;
          const walker = createNodeIterator.call(doc || node, node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_CDATA_SECTION | NodeFilter.SHOW_PROCESSING_INSTRUCTION, null);
          let currentNode = walker.nextNode();
          while (currentNode) {
            currentNode.data = _stripTemplateExpressions(currentNode.data);
            currentNode = walker.nextNode();
          }
        };
        const _isClobbered = function _isClobbered2(element) {
          const realTagName = getNodeName ? getNodeName(element) : null;
          if (typeof realTagName !== "string") return false;
          if (transformCaseFunc(realTagName) !== "form") return false;
          return typeof element.nodeName !== "string" || typeof element.textContent !== "string" || typeof element.removeChild !== "function" || element.attributes !== getAttributes(element) || typeof element.removeAttribute !== "function" || typeof element.removeAttributeNode !== "function" || typeof element.getAttributeNode !== "function" || typeof element.setAttribute !== "function" || typeof element.namespaceURI !== "string" || typeof element.insertBefore !== "function" || typeof element.hasChildNodes !== "function" || element.nodeType !== getNodeType(element) || element.childNodes !== getChildNodes(element);
        };
        const _isDocumentFragment = function _isDocumentFragment2(value) {
          if (!getNodeType || typeof value !== "object" || value === null) return false;
          try {
            return getNodeType(value) === NODE_TYPE.documentFragment;
          } catch (_) {
            return false;
          }
        };
        const _isNode = function _isNode2(value) {
          if (!getNodeType || typeof value !== "object" || value === null) return false;
          try {
            return typeof getNodeType(value) === "number";
          } catch (_) {
            return false;
          }
        };
        function _executeHooks(hooks2, currentNode, data) {
          if (hooks2.length === 0) return;
          arrayForEach(hooks2, (hook) => {
            hook.call(DOMPurify, currentNode, data, CONFIG);
          });
        }
        const _isUnsafeNode = function _isUnsafeNode2(currentNode, tagName) {
          if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent) && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.innerHTML)) return true;
          if (SAFE_FOR_XML && LITERAL_TEXT_ELEMENTS[tagName] && _readNodeType(currentNode) === NODE_TYPE.element && _readNamespaceURI(currentNode) === HTML_NAMESPACE && (_isNode(currentNode.firstElementChild) || typeof currentNode.textContent === "string" && regExpTest(ELEMENT_MARKUP_PROBE, currentNode.textContent))) return true;
          if (currentNode.nodeType === NODE_TYPE.processingInstruction) return true;
          if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(COMMENT_MARKUP_PROBE, currentNode.data)) return true;
          return false;
        };
        const _matchesNameCheck = function _matchesNameCheck2(check, name) {
          if (check instanceof RegExp) return regExpTest(check, name);
          if (check instanceof Function) {
            for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) args[_key - 2] = arguments[_key];
            return Boolean(check(name, ...args));
          }
          return false;
        };
        const _sanitizeDisallowedNode = function _sanitizeDisallowedNode2(currentNode, tagName, root) {
          if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) return false;
          if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && !FORBID_CONTENTS[stringToLowerCase(tagName)]) {
            const parentNode = getParentNode(currentNode);
            const childNodes = getChildNodes(currentNode);
            if (childNodes && parentNode) {
              const childCount = childNodes.length;
              for (let i = childCount - 1; i >= 0; --i) {
                const hoisted = currentNode === root ? cloneNode(childNodes[i], true) : childNodes[i];
                parentNode.insertBefore(hoisted, getNextSibling(currentNode));
              }
            }
          }
          _forceRemove(currentNode);
          return true;
        };
        const _forkSharedAllowlist = function _forkSharedAllowlist2(hookList, set, defaultSet, setConfigSet) {
          if (hookList.length === 0) return set;
          return set === defaultSet || set === setConfigSet ? clone(set) : set;
        };
        const _handleHookDetachedNode = function _handleHookDetachedNode2(currentNode, root) {
          if (currentNode === root || getParentNode(currentNode) !== null) return false;
          if (IN_PLACE) _neutralizeSubtree(currentNode);
          return true;
        };
        const _sanitizeElements = function _sanitizeElements2(currentNode, root) {
          _markVisited(currentNode);
          _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
          if (_handleHookDetachedNode(currentNode, root)) return true;
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
            return true;
          }
          const tagName = transformCaseFunc(_readNodeName(currentNode));
          ALLOWED_TAGS = _forkSharedAllowlist(hooks.uponSanitizeElement, ALLOWED_TAGS, DEFAULT_ALLOWED_TAGS, SET_CONFIG_ALLOWED_TAGS);
          _executeHooks(hooks.uponSanitizeElement, currentNode, {
            tagName,
            allowedTags: ALLOWED_TAGS
          });
          if (_handleHookDetachedNode(currentNode, root)) return true;
          if (_isUnsafeNode(currentNode, tagName)) {
            _forceRemove(currentNode);
            return true;
          }
          if (FORBID_TAGS[tagName] || !(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && !ALLOWED_TAGS[tagName]) {
            const removed = _sanitizeDisallowedNode(currentNode, tagName, root);
            if (removed === false) {
              _executeHooks(hooks.afterSanitizeElements, currentNode, null);
              if (_handleHookDetachedNode(currentNode, root)) return true;
            }
            return removed;
          }
          if (_readNodeType(currentNode) === NODE_TYPE.element && !_checkValidNamespace(currentNode)) {
            _forceRemove(currentNode);
            return true;
          }
          if ((tagName === "noscript" || tagName === "noembed" || tagName === "noframes") && regExpTest(FALLBACK_TAG_CLOSE, currentNode.innerHTML)) {
            _forceRemove(currentNode);
            return true;
          }
          if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
            const content = _stripTemplateExpressions(currentNode.textContent);
            if (currentNode.textContent !== content) {
              arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
              currentNode.textContent = content;
            }
          }
          _executeHooks(hooks.afterSanitizeElements, currentNode, null);
          return _handleHookDetachedNode(currentNode, root);
        };
        const _isValidAttribute = function _isValidAttribute2(lcTag, lcName, value) {
          if (FORBID_ATTR[lcName]) return false;
          if (_isPatchLinkageAttribute(lcName, lcTag)) return false;
          if (SANITIZE_DOM && (lcName === "id" || lcName === "name") && (value in document2 || value in formElement)) return false;
          const nameIsPermitted = ALLOWED_ATTR[lcName] || EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag);
          if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$1, lcName)) return true;
          if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$1, lcName)) return true;
          if (!nameIsPermitted) return _isBasicCustomElement(lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName, lcTag) || lcName === "is" && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value);
          if (URI_SAFE_ATTRIBUTES[lcName]) return true;
          if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE$1, ""))) return true;
          if ((lcName === "src" || lcName === "xlink:href" || lcName === "href") && lcTag !== "script" && stringIndexOf(value, "data:") === 0 && DATA_URI_TAGS[lcTag]) return true;
          if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$1, stringReplace(value, ATTR_WHITESPACE$1, ""))) return true;
          return !value;
        };
        const RESERVED_CUSTOM_ELEMENT_NAMES = addToSet({}, [
          "annotation-xml",
          "color-profile",
          "font-face",
          "font-face-format",
          "font-face-name",
          "font-face-src",
          "font-face-uri",
          "missing-glyph"
        ]);
        const _isBasicCustomElement = function _isBasicCustomElement2(tagName) {
          return !RESERVED_CUSTOM_ELEMENT_NAMES[stringToLowerCase(tagName)] && regExpTest(CUSTOM_ELEMENT$1, tagName);
        };
        const _applyTrustedTypesToAttribute = function _applyTrustedTypesToAttribute2(lcTag, lcName, namespaceURI, value) {
          if (trustedTypesPolicy && typeof trustedTypes === "object" && typeof trustedTypes.getAttributeType === "function" && !namespaceURI) switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case "TrustedHTML":
              return _createTrustedHTML(value);
            case "TrustedScriptURL":
              return _createTrustedScriptURL(value);
          }
          return value;
        };
        const _setAttributeValue = function _setAttributeValue2(currentNode, name, namespaceURI, value) {
          try {
            if (namespaceURI) currentNode.setAttributeNS(namespaceURI, name, value);
            else currentNode.setAttribute(name, value);
            if (_isClobbered(currentNode)) {
              _forceRemove(currentNode);
              return false;
            }
            return true;
          } catch (_) {
            _removeAttribute(name, currentNode);
            return false;
          }
        };
        const _isUnsafeAttributeValue = function _isUnsafeAttributeValue2(name, value) {
          if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, value)) return true;
          return stringToLowerCase(name) === "attributename" && stringMatch(value, "href") !== null;
        };
        const _sanitizeAttributes = function _sanitizeAttributes2(currentNode, root) {
          _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
          if (_handleHookDetachedNode(currentNode, root)) return;
          const attributes = currentNode.attributes;
          if (!attributes || _isClobbered(currentNode)) return;
          ALLOWED_ATTR = _forkSharedAllowlist(hooks.uponSanitizeAttribute, ALLOWED_ATTR, DEFAULT_ALLOWED_ATTR, SET_CONFIG_ALLOWED_ATTR);
          const hookEvent = {
            attrName: "",
            attrValue: "",
            keepAttr: true,
            allowedAttributes: ALLOWED_ATTR,
            forceKeepAttr: void 0
          };
          let l = attributes.length;
          const lcTag = transformCaseFunc(currentNode.nodeName);
          while (l--) {
            const attr = attributes[l];
            const name = attr.name, namespaceURI = attr.namespaceURI, attrValue = attr.value;
            const lcName = transformCaseFunc(name);
            const initValue = attrValue;
            let value = name === "value" ? initValue : stringTrim(initValue);
            let recreatedNamedProp = false;
            hookEvent.attrName = lcName;
            hookEvent.attrValue = value;
            hookEvent.keepAttr = true;
            hookEvent.forceKeepAttr = void 0;
            _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
            value = hookEvent.attrValue;
            if (SANITIZE_NAMED_PROPS && (lcName === "id" || lcName === "name") && stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0) {
              _removeAttribute(name, currentNode, attr);
              value = SANITIZE_NAMED_PROPS_PREFIX + value;
              recreatedNamedProp = true;
            }
            if (_isUnsafeAttributeValue(name, value)) {
              _removeAttribute(name, currentNode, attr);
              continue;
            }
            if (hookEvent.forceKeepAttr) continue;
            if (!hookEvent.keepAttr) {
              _removeAttribute(name, currentNode, attr);
              continue;
            }
            if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value)) {
              _removeAttribute(name, currentNode, attr);
              continue;
            }
            if (SAFE_FOR_TEMPLATES) value = _stripTemplateExpressions(value);
            if (!_isValidAttribute(lcTag, lcName, value)) {
              _removeAttribute(name, currentNode, attr);
              continue;
            }
            value = _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value);
            if (value !== initValue) {
              if (_setAttributeValue(currentNode, name, namespaceURI, value) && recreatedNamedProp) arrayPop(DOMPurify.removed);
            }
          }
          _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
          _handleHookDetachedNode(currentNode, root);
        };
        const _sanitizeShadowDOM2 = function _sanitizeShadowDOM(fragment) {
          let shadowNode = null;
          const shadowIterator = _createNodeIterator(fragment);
          _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
          while (shadowNode = shadowIterator.nextNode()) {
            _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
            _sanitizeElements(shadowNode, fragment);
            _sanitizeAttributes(shadowNode, fragment);
            if (_isDocumentFragment(shadowNode.content)) _sanitizeShadowDOM2(shadowNode.content);
            if (_readNodeType(shadowNode) === NODE_TYPE.element) {
              const innerSr = getShadowRoot(shadowNode);
              if (_isDocumentFragment(innerSr)) {
                _sanitizeAttachedShadowRoots(innerSr);
                _sanitizeShadowDOM2(innerSr);
              }
            }
          }
          if (SAFE_FOR_TEMPLATES) _scrubOwnCharacterData(fragment);
          _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
        };
        const _sanitizeAttachedShadowRoots = function _sanitizeAttachedShadowRoots2(root) {
          const stack = [{
            node: root,
            shadow: null
          }];
          while (stack.length > 0) {
            const item = stack.pop();
            if (item.shadow) {
              _sanitizeShadowDOM2(item.shadow);
              continue;
            }
            const node = item.node;
            const isElement = _readNodeType(node) === NODE_TYPE.element;
            const childNodes = getChildNodes(node);
            if (childNodes) for (let i = childNodes.length - 1; i >= 0; --i) stack.push({
              node: childNodes[i],
              shadow: null
            });
            if (isElement) {
              const rootName = getNodeName ? getNodeName(node) : null;
              if (typeof rootName === "string" && transformCaseFunc(rootName) === "template") {
                const content = node.content;
                if (_isDocumentFragment(content)) stack.push({
                  node: content,
                  shadow: null
                });
              }
            }
            if (isElement) {
              const sr = getShadowRoot(node);
              if (_isDocumentFragment(sr)) stack.push({
                node: null,
                shadow: sr
              }, {
                node: sr,
                shadow: null
              });
            }
          }
        };
        DOMPurify.sanitize = function(dirty) {
          let cfg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          let body = null;
          let importedNode = null;
          let currentNode = null;
          let returnNode = null;
          IS_EMPTY_INPUT = !dirty;
          if (IS_EMPTY_INPUT) dirty = "<!-->";
          if (typeof dirty !== "string" && !_isNode(dirty)) {
            dirty = stringifyValue(dirty);
            if (typeof dirty !== "string") throw typeErrorCreate("dirty is not a string, aborting");
          }
          if (!DOMPurify.isSupported) return dirty;
          if (SET_CONFIG) {
            ALLOWED_TAGS = SET_CONFIG_ALLOWED_TAGS;
            ALLOWED_ATTR = SET_CONFIG_ALLOWED_ATTR;
          } else _parseConfig(cfg);
          if (hooks.uponSanitizeElement.length > 0 || hooks.uponSanitizeAttribute.length > 0) ALLOWED_TAGS = clone(ALLOWED_TAGS);
          if (hooks.uponSanitizeAttribute.length > 0) ALLOWED_ATTR = clone(ALLOWED_ATTR);
          DOMPurify.removed = [];
          const inPlace = IN_PLACE && typeof dirty !== "string" && _isNode(dirty);
          let inPlaceNodes = [];
          const outerVisited = IN_PLACE_VISITED;
          if (inPlace) {
            _neutralizePatchLinkage(dirty);
            const nn = _readNodeName(dirty);
            if (typeof nn === "string") {
              const tagName = transformCaseFunc(nn);
              if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
                _neutralizeRoot(dirty);
                throw typeErrorCreate("root node is forbidden and cannot be sanitized in-place");
              }
            }
            if (_isClobbered(dirty)) {
              _neutralizeRoot(dirty);
              throw typeErrorCreate("root node is clobbered and cannot be sanitized in-place");
            }
            inPlaceNodes = _collectLiveNodes(dirty);
            IN_PLACE_VISITED = setCreate();
          } else if (_isNode(dirty)) {
            body = _initDocument("<!---->");
            importedNode = body.ownerDocument.importNode(dirty, true);
            if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === "BODY") body = importedNode;
            else if (importedNode.nodeName === "HTML") body = importedNode;
            else body.appendChild(importedNode);
            _sanitizeAttachedShadowRoots(body);
          } else {
            if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && dirty.indexOf("<") === -1) return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(dirty) : dirty;
            body = _initDocument(dirty);
            if (!body) return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : "";
          }
          if (body && FORCE_BODY) _forceRemove(body.firstChild);
          const walkRoot = inPlace ? dirty : body;
          try {
            if (inPlace) _sanitizeAttachedShadowRoots(dirty);
            const nodeIterator = _createNodeIterator(walkRoot);
            while (currentNode = nodeIterator.nextNode()) {
              _sanitizeElements(currentNode, walkRoot);
              _sanitizeAttributes(currentNode, walkRoot);
              if (_isDocumentFragment(currentNode.content)) _sanitizeShadowDOM2(currentNode.content);
            }
            if (inPlace) _sanitizeUnvisitedNodes(dirty, inPlaceNodes);
          } catch (error) {
            if (inPlace) {
              _neutralizeRoot(dirty);
              _neutralizeDiscarded(dirty, inPlaceNodes);
            }
            throw error;
          } finally {
            IN_PLACE_VISITED = outerVisited;
          }
          if (inPlace) {
            if (_neutralizeDiscarded(dirty, inPlaceNodes)) throw typeErrorCreate("a node selected for removal could not be safely returned; refusing to sanitize in place");
            if (SAFE_FOR_TEMPLATES) _scrubTemplateExpressions2(dirty);
            return dirty;
          }
          if (RETURN_DOM) {
            if (SAFE_FOR_TEMPLATES) _scrubTemplateExpressions2(body);
            if (RETURN_DOM_FRAGMENT) {
              returnNode = createDocumentFragment.call(body.ownerDocument);
              while (body.firstChild) returnNode.appendChild(body.firstChild);
            } else returnNode = body;
            if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) returnNode = importNode.call(originalDocument, returnNode, true);
            return returnNode;
          }
          let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
          if (WHOLE_DOCUMENT && ALLOWED_TAGS["!doctype"] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) serializedHTML = "<!DOCTYPE " + body.ownerDocument.doctype.name + ">\n" + serializedHTML;
          if (SAFE_FOR_TEMPLATES) serializedHTML = _stripTemplateExpressions(serializedHTML);
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? _createTrustedHTML(serializedHTML) : serializedHTML;
        };
        DOMPurify.setConfig = function() {
          let cfg = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          _parseConfig(cfg);
          SET_CONFIG = true;
          SET_CONFIG_ALLOWED_TAGS = ALLOWED_TAGS;
          SET_CONFIG_ALLOWED_ATTR = ALLOWED_ATTR;
        };
        DOMPurify.clearConfig = function() {
          CONFIG = null;
          SET_CONFIG = false;
          SET_CONFIG_ALLOWED_TAGS = null;
          SET_CONFIG_ALLOWED_ATTR = null;
          trustedTypesPolicy = defaultTrustedTypesPolicy;
          emptyHTML = "";
        };
        DOMPurify.isValidAttribute = function(tag, attr, value) {
          if (!CONFIG) _parseConfig({});
          const lcTag = transformCaseFunc(tag);
          const lcName = transformCaseFunc(attr);
          if (typeof value === "string" && (_isUnsafeAttributeValue(attr, value) || !ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(SELF_CLOSING_TAG, value))) return false;
          return _isValidAttribute(lcTag, lcName, value);
        };
        DOMPurify.addHook = function(entryPoint, hookFunction) {
          if (typeof hookFunction !== "function") return;
          if (!objectHasOwnProperty(hooks, entryPoint)) return;
          arrayPush(hooks[entryPoint], hookFunction);
        };
        DOMPurify.removeHook = function(entryPoint, hookFunction) {
          if (!objectHasOwnProperty(hooks, entryPoint)) return;
          if (hookFunction !== void 0) {
            const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
            return index === -1 ? void 0 : arraySplice(hooks[entryPoint], index, 1)[0];
          }
          return arrayPop(hooks[entryPoint]);
        };
        DOMPurify.removeHooks = function(entryPoint) {
          if (!objectHasOwnProperty(hooks, entryPoint)) return;
          hooks[entryPoint] = [];
        };
        DOMPurify.removeAllHooks = function() {
          hooks = _createHooksMap();
        };
        return DOMPurify;
      }
      var purify_default = createDOMPurify();

      // src/client/reader.jsx
      purify_default.addHook("afterSanitizeAttributes", (node) => {
        if (node.tagName === "A" && String(node.getAttribute("href") || "").startsWith("http")) {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noreferrer");
        }
      });
      var SANITIZE = {
        USE_PROFILES: { html: true, mathMl: true, svg: true },
        FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "link", "meta"],
        FORBID_ATTR: ["style"],
        ADD_ATTR: ["target", "rel"]
      };
      function tr2(t, key, params) {
        return tFormat(t(key), params);
      }
      function Reader({ paper, t, targetLang, onBack }) {
        const [data, setData] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState("");
        const [active, setActive] = useState("");
        const [translation, setTranslation] = useState(null);
        const [translating, setTranslating] = useState(false);
        const [lightbox, setLightbox] = useState("");
        const articleRef = useRef(null);
        useEffect(() => {
          let alive = true;
          setLoading(true);
          setError("");
          setData(null);
          setTranslation(null);
          api.fulltext(paper.arxivId).then((result) => {
            if (!alive) return;
            setData(result);
            setActive(result.toc?.[0]?.id || "");
          }).catch((reason) => {
            if (alive) setError(reason.message || String(reason));
          }).finally(() => {
            if (alive) setLoading(false);
          });
          return () => {
            alive = false;
          };
        }, [paper.arxivId]);
        const sanitized = useMemo(() => {
          if (!data?.available) return "";
          return purify_default.sanitize(data.html || "", SANITIZE);
        }, [data]);
        const sectionMap = useMemo(() => new Map((data?.sections || []).map((section) => [section.id, section])), [data]);
        const scrollTo = (id) => {
          const root = articleRef.current;
          const element = document.getElementById(id);
          if (element && root?.contains(element)) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActive(id);
          }
        };
        const activeSection = (() => {
          if (!active) return null;
          const direct = sectionMap.get(active);
          if (direct) return direct;
          const parent = active.includes(".") ? active.slice(0, active.lastIndexOf(".")) : "";
          return parent ? sectionMap.get(parent) || null : null;
        })();
        const translateSection = async () => {
          if (!activeSection?.text) {
            setTranslation({ id: active, error: t("reader.noText") });
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
          const image = event.target.closest?.("img");
          if (image?.src) {
            setLightbox(image.src);
            return;
          }
          const anchor = event.target.closest?.("a");
          if (!anchor) return;
          const href = anchor.getAttribute("href") || "";
          if (href.startsWith("#")) {
            event.preventDefault();
            scrollTo(href.slice(1));
          }
        };
        const header = h(
          "div",
          { className: "musee-reader-head" },
          h("button", { type: "button", className: "musee-back", onClick: onBack }, h(IconBack), t("paper.back")),
          h("div", { className: "musee-reader-title" }, data?.title || paper.title),
          h("div", { style: { flex: 1 } }),
          data?.available ? h(
            Button,
            { size: "sm", onClick: translateSection, disabled: translating || !activeSection?.text },
            translating ? h(Spinner) : null,
            translating ? t("reader.translating") : t("reader.translate")
          ) : null,
          data?.absUrl ? h("a", { className: "musee-btn sm", href: data.absUrl, target: "_blank", rel: "noreferrer" }, "arXiv") : null,
          data?.pdfUrl ? h("a", { className: "musee-btn sm", href: data.pdfUrl, target: "_blank", rel: "noreferrer" }, h(IconExternal), "PDF") : null
        );
        if (loading) {
          return h(
            "div",
            { className: "musee-reader" },
            header,
            h("div", { className: "musee-page" }, h(Loading, { label: t("reader.loading") }))
          );
        }
        if (error) {
          return h(
            "div",
            { className: "musee-reader" },
            header,
            h("div", { className: "musee-page" }, h(ErrorBanner, { message: tr2(t, "reader.error", { message: error }) }))
          );
        }
        if (!data?.available) {
          return h(
            "div",
            { className: "musee-reader" },
            header,
            h(
              "div",
              { className: "musee-page" },
              h("div", { className: "musee-empty" }, h("strong", null, t("reader.unavailable"))),
              data?.pdfUrl ? h("div", { style: { textAlign: "center" } }, h("a", { className: "musee-btn", href: data.pdfUrl, target: "_blank", rel: "noreferrer" }, t("reader.openPdf"))) : null
            )
          );
        }
        return h(
          "div",
          { className: "musee-reader" },
          header,
          h(
            "div",
            { className: "musee-reader-body" },
            h(
              "aside",
              { className: "musee-reader-toc" },
              h("div", { className: "musee-rail-title" }, t("reader.toc")),
              (data.toc || []).map(
                (item) => h(
                  "button",
                  {
                    key: `${item.id}-${item.title}`,
                    type: "button",
                    className: `musee-reader-toc-item level-${item.level} ${active === item.id ? "active" : ""}`,
                    onClick: () => scrollTo(item.id)
                  },
                  item.title
                )
              )
            ),
            h(
              "div",
              { className: "musee-reader-scroll" },
              h(
                "div",
                { className: "musee-reader-paper" },
                data.authors ? h("div", { className: "musee-reader-authors" }, data.authors) : null,
                translation ? h(
                  "div",
                  { className: "musee-reader-translation" },
                  h(
                    "div",
                    { className: "musee-reader-translation-head" },
                    h("strong", null, `${t("reader.translation")} · ${translation.title || ""}`),
                    h("button", { type: "button", className: "musee-back", onClick: () => setTranslation(null) }, t("reader.close"))
                  ),
                  translation.error ? h("div", { className: "musee-error" }, translation.error) : h("div", { className: "musee-reader-translation-body" }, translation.text)
                ) : null,
                h("div", {
                  className: "musee-fulltext",
                  ref: articleRef,
                  onClick: onArticleClick,
                  dangerouslySetInnerHTML: { __html: sanitized }
                })
              )
            )
          ),
          lightbox ? h(
            "div",
            { className: "musee-lightbox", role: "button", tabIndex: 0, onClick: () => setLightbox(""), onKeyDown: (event) => {
              if (event.key === "Escape") setLightbox("");
            } },
            h("img", { src: lightbox, alt: "" })
          ) : null
        );
      }

      // src/client/app.jsx
      function tr3(t, key, params) {
        return tFormat(t(key), params);
      }
      function disciplineName(discipline, lang) {
        return discipline.name?.[lang] || discipline.name?.en || discipline.id;
      }
      function localizedName(venue, lang) {
        if (!venue || lang === "en") return "";
        return (lang === "zh" ? venue.nameZh : venue.nameFr) || "";
      }
      function localizedAbout(venue, lang) {
        if (!venue) return "";
        if (lang === "zh") return venue.aboutZh || venue.about || "";
        if (lang === "fr") return venue.aboutFr || venue.about || "";
        return venue.about || "";
      }
      function issueLabel(paper) {
        if (!paper) return "";
        const volume = paper.volume ? `Vol. ${paper.volume}` : "";
        const issue = paper.issue ? `No. ${paper.issue}` : "";
        return [volume, issue, paper.year].filter(Boolean).join(" ");
      }
      function App({ t, lang, setLang, targetLang, setTargetLang, translateTitles, setTranslateTitles }) {
        const [boot, setBoot] = useState(null);
        const [bootError, setBootError] = useState("");
        const [discipline, setDiscipline] = useState("urban");
        const [view, setView] = useState({ kind: "discover" });
        const [papers, setPapers] = useState([]);
        const [sourceInfo, setSourceInfo] = useState(null);
        const [listState, setListState] = useState("idle");
        const [listError, setListError] = useState("");
        const [listTitle, setListTitle] = useState("");
        const [journalYears, setJournalYears] = useState([]);
        const [journalTotal, setJournalTotal] = useState(0);
        const [journalYear, setJournalYear] = useState(null);
        const [loadingMore, setLoadingMore] = useState(false);
        const [titleTranslations, setTitleTranslations] = useState({});
        const [library, setLibrary] = useState([]);
        const [translation, setTranslation] = useState(null);
        const [translating, setTranslating] = useState(false);
        const [citation, setCitation] = useState(null);
        const [settingsOpen, setSettingsOpen] = useState(false);
        const [toast, setToast] = useState("");
        const [query, setQuery] = useState("");
        const [paperFrom, setPaperFrom] = useState({ kind: "discover" });
        const mainRef = useRef(null);
        const toastTimer = useRef(null);
        const translationsRef = useRef(/* @__PURE__ */ new Map());
        const titleCacheRef = useRef(/* @__PURE__ */ new Map());
        const titlePendingRef = useRef(/* @__PURE__ */ new Set());
        const journalOffsetRef = useRef(0);
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
        const autoTranslateTitles = (list) => {
          if (!translateTitles || lang === "en" || !boot?.llm || !Array.isArray(list)) return;
          const additions = {};
          const pending = [];
          for (const paper of list) {
            if (!paper?.title) continue;
            const key = `${targetLang}|${paper.title}`;
            const cached = titleCacheRef.current.get(key);
            if (cached) {
              additions[paper.id] = cached;
              continue;
            }
            if (titlePendingRef.current.has(key)) continue;
            titlePendingRef.current.add(key);
            pending.push({ id: paper.id, title: paper.title, key });
          }
          if (Object.keys(additions).length) {
            setTitleTranslations((prev) => ({ ...prev, ...additions }));
          }
          if (!pending.length) return;
          api.translateTitles(pending.map((entry) => entry.title), targetLang).then((data) => {
            const fresh = {};
            (data.translations || []).forEach((text2, index) => {
              const entry = pending[index];
              if (!entry || !text2) return;
              titleCacheRef.current.set(entry.key, text2);
              fresh[entry.id] = text2;
            });
            if (Object.keys(fresh).length) setTitleTranslations((prev) => ({ ...prev, ...fresh }));
          }).catch(() => {
          }).finally(() => {
            for (const entry of pending) titlePendingRef.current.delete(entry.key);
          });
        };
        useEffect(() => {
          setTitleTranslations({});
        }, [lang, targetLang, translateTitles]);
        useEffect(() => {
          if (!translateTitles || lang === "en") return;
          autoTranslateTitles(papers);
        }, [papers, lang, targetLang, translateTitles, boot?.llm]);
        const scrollTop = () => {
          if (mainRef.current) mainRef.current.scrollTop = 0;
        };
        const loadList = (loader, title, onData) => {
          setListTitle(title);
          setListState("loading");
          setListError("");
          listRetryRef.current = () => loadList(loader, title, onData);
          scrollTop();
          loader().then((data) => {
            setPapers(data.papers || []);
            if (onData) onData(data);
            setListState("ready");
          }).catch((error) => {
            setListError(errorText(error));
            setListState("error");
          });
        };
        const loadJournal = (journal, year = null, append = false) => {
          setView({ kind: "journal", journal });
          setSourceInfo(null);
          setListTitle(journal.name);
          setJournalYear(year);
          setListError("");
          listRetryRef.current = () => loadJournal(journal, year, false);
          if (!append) {
            setPapers([]);
            setListState("loading");
            scrollTop();
          } else {
            setLoadingMore(true);
          }
          const limit = 20;
          const offset = append ? journalOffsetRef.current : 0;
          api.journal(journal.id, { limit, offset, year }).then((data) => {
            journalOffsetRef.current = offset + limit;
            setPapers((prev) => append ? [...prev, ...data.papers || []] : data.papers || []);
            setSourceInfo(data.source || null);
            setJournalYears(data.years || []);
            setJournalTotal(data.total || 0);
            setListState("ready");
            autoTranslateTitles(data.papers || []);
          }).catch((error) => {
            setListError(errorText(error));
            setListState("error");
          }).finally(() => setLoadingMore(false));
        };
        const openJournal = (journal) => loadJournal(journal, null, false);
        const openConference = (conference) => {
          setView({ kind: "conference", conference });
          setSourceInfo(null);
          loadList(() => api.conference(conference.id), conference.name);
        };
        const openArxiv = (category) => {
          setView({ kind: "arxiv", category });
          setSourceInfo(null);
          loadList(() => api.arxiv(category), tr3(t, "arxiv.title", { category }));
        };
        const runSearch = (text2) => {
          const q = String(text2 || "").trim();
          if (!q) return;
          setQuery(q);
          setView({ kind: "search", q });
          setSourceInfo(null);
          loadList(() => api.search(q), tr3(t, "search.title", { q }));
        };
        const openPaper = (paper) => {
          if (view.kind !== "paper") setPaperFrom(view);
          setView({ kind: "paper", paper });
          setTranslation(translationsRef.current.get(paper.id) || null);
          scrollTop();
        };
        const openReader = (paper) => {
          setView({ kind: "reader", paper });
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
            const data = await api.translate(paper.title, paper.abstract, targetLang);
            translationsRef.current.set(paper.id, data);
            setTranslation(data);
          } catch (error) {
            showToast(tr3(t, "toast.translateFailed", { message: errorText(error) }));
          } finally {
            setTranslating(false);
          }
        };
        const exportLibrary = (format, filename) => downloadExport(format, filename);
        const renderList = () => {
          if (listState === "loading") return h(Loading, { label: t("loading") });
          if (listState === "error") return h(ErrorBanner, { message: listError, onRetry: listRetryRef.current, retryLabel: t("error.retry") });
          return h(PaperList, {
            papers,
            onOpen: openPaper,
            libraryById,
            t,
            emptyTitle: t("empty"),
            hideVenue: view.kind === "conference" || view.kind === "journal",
            showIssue: view.kind === "journal",
            titleTranslations
          });
        };
        const renderVenueHead = (venue, kind, options = {}) => {
          const local = localizedName(venue, lang);
          return h(
            "div",
            { className: "musee-venue-head" },
            h(JournalCover, { venue, kind, size: "lg", issue: options.issue || "" }),
            h(
              "div",
              { style: { minWidth: 0 } },
              h("h1", null, venue.name),
              local ? h("div", { className: "musee-venue-local" }, local) : null,
              h("p", { className: "musee-venue-about" }, localizedAbout(venue, lang)),
              h(
                "div",
                { className: "musee-venue-meta" },
                options.issn ? h("span", null, options.issn) : null,
                options.worksCount ? h("span", null, tr3(t, "journal.works", { n: options.worksCount.toLocaleString() })) : null,
                options.isOa ? h(Pill, { tone: "success" }, t("journal.oa")) : null,
                kind === "conference" ? h(Pill, { tone: "brand" }, t(venue.group === "robotics" ? "conference.group.robotics" : "conference.group.ai")) : null,
                options.homepage ? h("a", { href: options.homepage, target: "_blank", rel: "noreferrer" }, `${t("journal.officialSite")} ↗`) : null
              )
            )
          );
        };
        const renderDiscover = () => {
          const journals = currentDiscipline?.journals || [];
          const conferences = boot?.conferences || [];
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
                    disciplineName(entry, lang)
                  )
                )
              )
            ),
            h(
              "div",
              { className: "musee-section" },
              h(
                "div",
                { className: "musee-section-head" },
                h("h2", null, t("discover.journals")),
                h("span", null, currentDiscipline?.blurb?.[lang] || currentDiscipline?.blurb?.en || "")
              ),
              h(
                "div",
                { className: "musee-grid" },
                journals.map(
                  (journal) => h(
                    "button",
                    { key: journal.id, type: "button", className: "musee-journal-card", onClick: () => openJournal(journal) },
                    h(JournalCover, { venue: journal, kind: journal.discipline, size: "sm" }),
                    h(
                      "div",
                      { className: "musee-journal-body" },
                      h("div", { className: "musee-journal-name" }, journal.name),
                      localizedName(journal, lang) ? h("div", { className: "musee-journal-local" }, localizedName(journal, lang)) : null,
                      h("div", { className: "musee-journal-about" }, localizedAbout(journal, lang)),
                      h(
                        "div",
                        { className: "musee-journal-meta" },
                        h("span", null, journal.issn),
                        h("span", null, journal.short)
                      )
                    )
                  )
                )
              )
            ),
            h(
              "div",
              { className: "musee-section" },
              h(
                "div",
                { className: "musee-section-head" },
                h("h2", null, t("discover.conferences")),
                h("span", null, t("discover.conferencesHint"))
              ),
              h(
                "div",
                { className: "musee-grid" },
                conferences.map(
                  (conference) => h(
                    "button",
                    { key: conference.id, type: "button", className: "musee-journal-card", onClick: () => openConference(conference) },
                    h(JournalCover, { venue: conference, kind: "conference", size: "sm" }),
                    h(
                      "div",
                      { className: "musee-journal-body" },
                      h("div", { className: "musee-journal-name" }, conference.name),
                      localizedName(conference, lang) ? h("div", { className: "musee-journal-local" }, localizedName(conference, lang)) : null,
                      h("div", { className: "musee-journal-about" }, localizedAbout(conference, lang)),
                      h(
                        "div",
                        { className: "musee-journal-meta" },
                        h("span", null, t(conference.group === "robotics" ? "conference.group.robotics" : "conference.group.ai"))
                      )
                    )
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
        };
        const renderMain = () => {
          if (view.kind === "reader") {
            return h(Reader, {
              paper: view.paper,
              t,
              targetLang,
              onBack: () => setView({ kind: "paper", paper: view.paper })
            });
          }
          if (view.kind === "paper") {
            return h(PaperDetail, {
              paper: view.paper,
              item: libraryById.get(view.paper.id),
              t,
              lang,
              onBack: backToList,
              onSave: savePaper,
              onUpdate: updateItem,
              onTranslate: translatePaper,
              translation,
              translating,
              titleTranslation: titleTranslations[view.paper.id],
              onRead: openReader,
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
          if (view.kind === "discover") return renderDiscover();
          if (view.kind === "conference") {
            return h(
              "div",
              { className: "musee-page" },
              h("button", { type: "button", className: "musee-back", onClick: goDiscover }, h(IconBack), t("discover.conferences")),
              renderVenueHead(view.conference, "conference", { issue: papers[0]?.year ? String(papers[0].year) : "" }),
              h("p", { className: "musee-settings-hint", style: { marginTop: "12px", maxWidth: "720px" } }, t("conference.dataNote")),
              h("div", { className: "musee-section-head", style: { marginTop: "20px" } }, h("h2", null, t("conference.latest"))),
              renderList()
            );
          }
          if (view.kind === "journal") {
            return h(
              "div",
              { className: "musee-page" },
              h("button", { type: "button", className: "musee-back", onClick: goDiscover }, h(IconBack), t("journal.back")),
              renderVenueHead(view.journal, view.journal.discipline, {
                issue: issueLabel(papers[0]),
                issn: view.journal.issn,
                worksCount: sourceInfo?.worksCount,
                isOa: sourceInfo?.isOa,
                homepage: sourceInfo?.homepage
              }),
              h(
                "div",
                { className: "musee-section-head", style: { marginTop: "20px", gap: "12px", flexWrap: "wrap" } },
                h("h2", null, journalYear ? String(journalYear) : t("journal.papers")),
                journalTotal ? h("span", null, tr3(t, "journal.total", { n: journalTotal.toLocaleString() })) : null,
                h("div", { style: { flex: 1 } }),
                journalYears.length ? h(
                  "select",
                  {
                    className: "musee-select",
                    style: { width: "auto" },
                    value: journalYear ?? "",
                    "aria-label": t("journal.allYears"),
                    onChange: (event) => loadJournal(view.journal, event.target.value ? Number(event.target.value) : null, false)
                  },
                  h("option", { value: "" }, t("journal.allYears")),
                  journalYears.map(
                    (entry) => h("option", { key: entry.year, value: String(entry.year) }, `${entry.year} (${entry.count})`)
                  )
                ) : null
              ),
              renderList(),
              listState === "ready" && papers.length < journalTotal ? h(
                "div",
                { style: { display: "flex", justifyContent: "center", marginTop: "16px" } },
                h(
                  Button,
                  { onClick: () => loadJournal(view.journal, journalYear, true), disabled: loadingMore },
                  loadingMore ? h(Spinner) : null,
                  `${t("journal.loadMore")} ${papers.length}/${journalTotal}`
                )
              ) : null
            );
          }
          return h(
            "div",
            { className: "musee-page" },
            h("button", { type: "button", className: "musee-back", onClick: goDiscover }, h(IconBack), t("discover.title")),
            h("div", { className: "musee-hero", style: { marginTop: "12px" } }, h("h1", null, listTitle)),
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
              "button",
              { type: "button", className: "musee-icon-btn", onClick: () => setSettingsOpen(true), "aria-label": t("settings.title"), title: t("settings.title") },
              h(IconSettings)
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
                    disciplineName(entry, lang)
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
              h("div", { className: "musee-rail-title" }, t("discover.conferences")),
              h(
                "div",
                { className: "musee-rail-group" },
                (boot.conferences || []).map(
                  (conference) => h(
                    "button",
                    {
                      key: conference.id,
                      type: "button",
                      className: `musee-rail-item ${view.kind === "conference" && view.conference.id === conference.id ? "active" : ""}`,
                      onClick: () => openConference(conference)
                    },
                    conference.name,
                    h("span", { className: "musee-rail-sub" }, t(conference.group === "robotics" ? "conference.group.robotics" : "conference.group.ai"))
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
          settingsOpen ? h(SettingsDialog, {
            t,
            lang,
            onLang: setLang,
            targetLang,
            onTarget: setTargetLang,
            translateTitles,
            onTranslateTitles: setTranslateTitles,
            version: boot.version,
            dataDir: boot.dataDir,
            onClose: () => setSettingsOpen(false)
          }) : null,
          citation ? h(CitationDialog, { papers: citation.papers, t, onClose: () => setCitation(null), showToast }) : null,
          toast ? h("div", { className: "musee-toast", role: "status" }, toast) : null
        );
      }

      // src/client/index.jsx
      function createPanel(ctx) {
        return function MuseePanel() {
          const [lang, setLangState] = useState(() => readStoredLang(ctx));
          const [targetLang, setTargetLangState] = useState(() => readStoredTarget(readStoredLang(ctx)));
          const [translateTitles, setTranslateTitlesState] = useState(() => readStoredTitles(readStoredLang(ctx)));
          const t = useMemo(() => makeT(lang), [lang]);
          const setLang = (next) => {
            try {
              localStorage.setItem("musee.lang", next);
            } catch {
            }
            setLangState(next);
            try {
              if (!localStorage.getItem("musee.target")) setTargetLangState(next === "fr" ? "fr" : "zh");
            } catch {
            }
          };
          const setTargetLang = (next) => {
            try {
              localStorage.setItem("musee.target", next);
            } catch {
            }
            setTargetLangState(next);
          };
          const setTranslateTitles = (next) => {
            try {
              localStorage.setItem("musee.titles", next ? "1" : "0");
            } catch {
            }
            setTranslateTitlesState(next);
          };
          return h(App, { t, lang, setLang, targetLang, setTargetLang, translateTitles, setTranslateTitles });
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
        inject: ["slots"],
        apply(ctx) {
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
