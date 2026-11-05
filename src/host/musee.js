import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DISCIPLINES, JOURNALS, JOURNALS_BY_ID, VERSION, journalsFor } from './catalog.js';
import { latestByCategory } from './arxiv.js';
import { cite } from './cite.js';
import { searchWorks, worksBySource } from './openalex.js';
import { createStore } from './store.js';
import { createTranslator } from './translate.js';
import { TtlCache } from './util.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function textResponse(body, contentType, filename) {
  return new Response(body, {
    headers: {
      'content-type': `${contentType}; charset=utf-8`,
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
}

function resolveDataDir(config) {
  const configured = String(config.dataDir || '').trim();
  if (!configured) return path.join(os.homedir(), '.dsh', 'musee');
  if (configured === '~') return os.homedir();
  if (configured.startsWith('~/') || configured.startsWith('~\\')) {
    return path.join(os.homedir(), configured.slice(2));
  }
  return path.resolve(configured);
}

function disciplinePayload() {
  return DISCIPLINES.map((discipline) => ({
    ...discipline,
    journals: journalsFor(discipline.id),
  }));
}

export function createMusee(ctx, config = {}) {
  const token = crypto.randomUUID();
  const dataDir = resolveDataDir(config);
  const cache = new TtlCache(10 * 60 * 1000, 160);
  const storePromise = createStore(dataDir);

  // The translator is created synchronously while the store loads asynchronously;
  // bridge reads and writes into the durable translation cache once it is ready.
  let persistentTranslations = null;
  const pendingTranslations = new Map();
  const translationCache = {
    get(key) {
      return persistentTranslations ? persistentTranslations.get(key) : pendingTranslations.get(key);
    },
    set(key, value) {
      if (persistentTranslations) persistentTranslations.set(key, value);
      else pendingTranslations.set(key, value);
    },
  };
  storePromise
    .then((store) => {
      persistentTranslations = store.cache;
      for (const [key, value] of pendingTranslations) store.cache.set(key, value);
      pendingTranslations.clear();
    })
    .catch(() => {});

  const translator = createTranslator({ ctx, config, cache: translationCache });
  const mailto = String(config.mailto || '').trim();

  storePromise
    .then(async (store) => {
      const runtimeFile = path.join(store.dataDir, 'runtime.json');
      await fs.writeFile(
        runtimeFile,
        JSON.stringify({ version: VERSION, api: '/musee/api', token, pid: process.pid }, null, 2),
        { mode: 0o600 },
      );
    })
    .catch((error) => console.warn('[musee] cannot write runtime.json:', error?.message || error));

  async function route(request, url) {
    const store = await storePromise;
    const pathname = url.pathname.replace(/^\/musee\/api/, '') || '/';

    if (pathname === '/bootstrap') {
      return json({
        version: VERSION,
        disciplines: disciplinePayload(),
        llm: translator.available(),
        route: translator.route(),
        dataDir,
      });
    }

    if (pathname === '/status') {
      return json({ version: VERSION, llm: translator.available(), route: translator.route(), dataDir });
    }

    if (pathname === '/journal') {
      const journalId = url.searchParams.get('journalId') || '';
      const journal = JOURNALS_BY_ID.get(journalId);
      if (!journal) return json({ error: '未知的期刊。' }, 404);
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 50);
      const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);
      const papers = await cache.wrap(`journal:${journalId}:${limit}:${offset}`, () =>
        worksBySource(journal.openalex, { limit, offset, mailto }),
      );
      return json({ journal, papers });
    }

    if (pathname === '/arxiv') {
      const category = (url.searchParams.get('category') || '').trim();
      if (!/^[a-z-]+(\.[A-Za-z-]+)?$/.test(category)) return json({ error: '无效的 arXiv 分类。' }, 400);
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 50);
      const papers = await cache.wrap(`arxiv:${category}:${limit}`, () => latestByCategory(category, { limit }));
      return json({ category, papers });
    }

    if (pathname === '/search') {
      const query = (url.searchParams.get('q') || '').trim().slice(0, 200);
      if (!query) return json({ error: '请输入检索词。' }, 400);
      const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 50);
      const papers = await cache.wrap(`search:${query.toLowerCase()}:${limit}`, () => searchWorks(query, { limit, mailto }));
      return json({ query, papers });
    }

    if (pathname === '/translate' && request.method === 'POST') {
      const body = await request.json();
      const title = String(body.title || '').slice(0, 1000);
      const abstract = String(body.abstract || '').slice(0, 30000);
      if (!title && !abstract) return json({ error: '没有可翻译的内容。' }, 400);
      const result = await translator.translate({ title, abstract });
      return json(result);
    }

    if (pathname === '/library') {
      if (request.method === 'GET') return json({ items: store.list() });
      if (request.method === 'POST') {
        const body = await request.json();
        if (body.action === 'save') {
          const paper = body.paper;
          if (!paper?.id || !paper?.title) return json({ error: '文献信息不完整。' }, 400);
          const item = await store.savePaper(paper);
          return json({ item, items: store.list() });
        }
        if (body.action === 'update') {
          const item = await store.updateItem(String(body.id || ''), body.patch || {});
          return json({ item, items: store.list() });
        }
        if (body.action === 'remove') {
          const removed = await store.removeItem(String(body.id || ''));
          return json({ removed, items: store.list() });
        }
        return json({ error: '未知的库操作。' }, 400);
      }
    }

    if (pathname === '/cite' && request.method === 'POST') {
      const body = await request.json();
      const papers = Array.isArray(body.papers) ? body.papers.filter((paper) => paper?.title).slice(0, 100) : [];
      if (!papers.length) return json({ error: '没有可引用的文献。' }, 400);
      const output = cite(papers, String(body.format || 'gb'));
      return json({ text: output, format: body.format || 'gb', count: papers.length });
    }

    if (pathname === '/export') {
      const format = String(url.searchParams.get('format') || 'md');
      const items = store.list();
      if (format === 'md') return textResponse(store.exportMarkdown(), 'text/markdown', 'musee-library.md');
      if (format === 'bibtex') return textResponse(cite(items, 'bibtex'), 'application/x-bibtex', 'musee-library.bib');
      if (format === 'ris') return textResponse(cite(items, 'ris'), 'application/x-research-info-systems', 'musee-library.ris');
      return json({ error: '未知的导出格式。' }, 400);
    }

    return json({ error: '接口不存在。' }, 404);
  }

  async function handle(request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/musee/api')) return json({ error: '接口不存在。' }, 404);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
    const supplied = request.headers.get('x-musee-token') || '';
    if (supplied !== token) {
      return json({ error: '未授权的请求：请刷新页面后再试。' }, 401);
    }
    try {
      return await route(request, url);
    } catch (error) {
      const message = error?.name === 'TimeoutError' ? '数据源响应超时，请稍后重试。' : error?.message || '内部错误。';
      console.error('[musee]', error);
      return json({ error: message }, error?.name === 'TimeoutError' ? 504 : 500);
    }
  }

  function injectIndex(html) {
    if (html.includes('name="musee-token"')) return html;
    const meta = `<meta name="musee-token" content="${token}">`;
    return /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${meta}</head>`) : `${meta}${html}`;
  }

  function dispose() {
    storePromise.then((store) => store.cache.flush()).catch(() => {});
  }

  return {
    handle,
    injectIndex,
    dispose,
    token,
    dataDir,
    journals: JOURNALS,
    disciplines: DISCIPLINES,
  };
}
