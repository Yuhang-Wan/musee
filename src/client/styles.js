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
.musee-venue-title-row { display: flex; align-items: flex-start; gap: 10px; }
.musee-venue-title-row h1 { margin: 0 0 4px; }
.musee-follow-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; flex: 0 0 auto;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.musee-follow-btn:hover { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.musee-follow-btn.active {
  color: var(--dsw-alias-brand-primary);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);
}
.musee-journal-title-row { display: flex; align-items: flex-start; gap: 8px; }
.musee-journal-title-row .musee-journal-name { flex: 1; }
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

.musee-home-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 12px; margin-top: 22px; }
.musee-home-card {
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1); padding: 14px;
  display: flex; flex-direction: column; min-width: 0;
}
.musee-home-head { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; }
.musee-home-info { flex: 1; min-width: 0; }
.musee-home-name { font-weight: 650; line-height: 1.35; }
.musee-home-local { font-size: 12px; color: var(--dsw-alias-label-secondary); margin-top: 2px; }
.musee-home-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.musee-home-papers { margin-top: 12px; border-top: 1px solid var(--dsw-alias-border-l1); padding-top: 6px; display: flex; flex-direction: column; }
.musee-home-paper {
  display: flex; align-items: baseline; gap: 10px; width: 100%;
  border: 0; background: transparent; color: var(--dsw-alias-label-primary);
  text-align: left; padding: 7px 4px; border-radius: 6px; cursor: pointer;
}
.musee-home-paper:hover { background: var(--dsw-alias-bg-layer-2); }
.musee-home-paper-title {
  flex: 1; font-size: 12.5px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.musee-home-paper-date { font-size: 11px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.musee-home-nopapers { color: var(--dsw-alias-label-secondary); font-size: 12px; padding: 10px 4px; }
.musee-home-more { align-self: flex-start; margin-top: 8px; border: 0; background: transparent; color: var(--dsw-alias-brand-primary); font-size: 12px; padding: 4px; cursor: pointer; }
.musee-home-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; }

.musee-pdf-view { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--dsw-alias-bg-base); }
.musee-pdf-frame { flex: 1 1 auto; width: 100%; border: 0; background: var(--dsw-alias-bg-layer-1); }

/* Editorial direction: serif headlines, hairline rules, a dark lead visual. */
.musee-root {
  --musee-serif: Georgia, "Times New Roman", "Songti SC", "Noto Serif SC", SimSun, serif;
  --musee-accent: #b42318;
}
.musee-brand-name { font-family: var(--musee-serif); font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
.musee-tagline { text-transform: uppercase; letter-spacing: .12em; font-size: 10px; }
.musee-nav-btn { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; }
.musee-header { border-bottom: 1px solid var(--dsw-alias-label-primary); }
.musee-hero h1, .musee-display, .musee-venue-head h1, .musee-article h1, .musee-home-name, .musee-journal-name, .musee-paper-title, .musee-feed-title, .musee-rec-name { font-family: var(--musee-serif); }
.musee-hero h1 { font-size: 34px; letter-spacing: -0.01em; }
.musee-paper, .musee-journal-card, .musee-feed-card, .musee-rec-card { border-radius: 2px; }

.musee-editorial-hero {
  display: grid; grid-template-columns: 1.05fr 0.95fr; min-height: 380px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
}
.musee-hero-visual { position: relative; min-height: 380px; overflow: hidden; }
.musee-hero-art { position: absolute; inset: 0; width: 100%; height: 100%; }
.musee-hero-copy { padding: 38px 42px; display: flex; flex-direction: column; justify-content: center; gap: 14px; }
.musee-kicker { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--musee-accent); font-weight: 600; }
.musee-display { font-size: clamp(28px, 3vw, 42px); line-height: 1.18; letter-spacing: -.015em; margin: 0; font-weight: 600; }
.musee-display-link { border: 0; background: transparent; padding: 0; text-align: left; color: inherit; font: inherit; cursor: pointer; }
.musee-display-link:hover { color: var(--musee-accent); }
.musee-lead-venue { border: 0; background: transparent; padding: 0; text-align: left; color: var(--dsw-alias-label-secondary); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; }
.musee-lead-authors { color: var(--dsw-alias-label-secondary); font-size: 13px; margin: 0; }
.musee-lead-summary { color: var(--dsw-alias-label-secondary); font-size: 14px; line-height: 1.7; margin: 0 0 6px; max-width: 520px; }
.musee-hero-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }

.musee-editorial-section { margin-top: 34px; }
.musee-section-rule { display: flex; align-items: baseline; gap: 12px; border-top: 1px solid var(--dsw-alias-label-primary); padding-top: 8px; margin-bottom: 16px; }
.musee-section-rule h2 { margin: 0; font-family: var(--musee-serif); font-size: 22px; font-weight: 600; }
.musee-section-rule span { color: var(--dsw-alias-label-secondary); font-size: 11px; letter-spacing: .04em; }

.musee-feed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); border-left: 1px solid var(--dsw-alias-border-l1); }
.musee-feed-card {
  border-right: 1px solid var(--dsw-alias-border-l1); border-bottom: 1px solid var(--dsw-alias-border-l1);
  padding: 16px; background: var(--dsw-alias-bg-base); display: flex; flex-direction: column; min-width: 0;
}
.musee-feed-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.musee-feed-venue { flex: 1; text-align: left; border: 0; background: transparent; padding: 0; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--musee-accent); font-weight: 600; cursor: pointer; }
.musee-feed-papers { display: flex; flex-direction: column; gap: 2px; }
.musee-feed-paper { display: flex; gap: 10px; align-items: baseline; text-align: left; border: 0; background: transparent; padding: 6px 0; border-bottom: 1px solid var(--dsw-alias-border-l1); cursor: pointer; color: var(--dsw-alias-label-primary); }
.musee-feed-paper:last-child { border-bottom: 0; }
.musee-feed-paper.lead .musee-feed-title { font-family: var(--musee-serif); font-size: 18px; line-height: 1.35; font-weight: 600; }
.musee-feed-title { flex: 1; font-size: 12.5px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.musee-feed-date { font-size: 10.5px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.musee-feed-more { align-self: flex-start; margin-top: 10px; border: 0; background: transparent; padding: 0; color: var(--musee-accent); font-size: 11px; cursor: pointer; }

.musee-rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.musee-rec-card { display: flex; align-items: flex-start; gap: 10px; padding: 10px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-base); }
.musee-rec-main { display: flex; gap: 10px; align-items: flex-start; flex: 1; min-width: 0; border: 0; background: transparent; padding: 0; text-align: left; cursor: pointer; }
.musee-rec-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.musee-rec-name { font-size: 15px; font-weight: 600; line-height: 1.3; }
.musee-rec-local { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.musee-rec-about { font-size: 11px; color: var(--dsw-alias-label-secondary); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

@media (max-width: 980px) {
  .musee-editorial-hero { grid-template-columns: 1fr; }
  .musee-hero-visual { min-height: 240px; }
  .musee-hero-copy { padding: 24px 22px 30px; }
  .musee-feed-grid { border-left: 0; }
}

/* Red is the editorial accent: brand text, small kickers, and primary actions only. */
.musee-brand-name { color: var(--musee-accent); }
.musee-btn.primary { border-color: var(--musee-accent); color: var(--musee-accent); }
.musee-btn.primary.active { background: color-mix(in srgb, var(--musee-accent) 10%, transparent); }
.musee-nav-btn.active { color: var(--musee-accent); }
.musee-follow-btn.active {
  color: var(--musee-accent);
  border-color: color-mix(in srgb, var(--musee-accent) 55%, transparent);
  background: color-mix(in srgb, var(--musee-accent) 10%, transparent);
}
.musee-cover-mark { color: #f87171; opacity: 1; font-weight: 600; }


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
