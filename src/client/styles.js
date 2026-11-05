export const CSS = `
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
