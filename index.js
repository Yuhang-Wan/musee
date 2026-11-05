import { createMusee } from './src/host/musee.js';

/**
 * Host half of the Musee bundle.
 *
 * It owns the data sources, the academic translator, the citation formatter,
 * the local library, and the same-origin JSON API the Client half calls.
 * The only Client-visible secret is the per-activation token injected into the
 * page head as a meta tag.
 */
export function apply(ctx, config = {}) {
  const webServer = ctx.get('webServer');
  if (!webServer) {
    console.warn('[musee] webServer is unavailable; the reading desk will not start.');
    return;
  }

  const app = createMusee(ctx, config);

  ctx.effect(
    () =>
      webServer.register({
        kind: 'prefix',
        path: '/musee/api',
        handler: createNodeHandler(app),
      }),
    'musee: api routes',
  );

  ctx.effect(() => webServer.tapIndex((html) => app.injectIndex(html)), 'musee: page token');

  ctx.effect(() => () => app.dispose(), 'musee: dispose');
}

/**
 * Adapt the Fetch-style app handler to the web server's Node handler route.
 * Resource routes only answer GET/HEAD, while Musee needs POST for translation,
 * citations, and library writes.
 */
function createNodeHandler(app) {
  return async function handleNode(request, response) {
    try {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;

      const headers = {};
      for (const [key, value] of Object.entries(request.headers)) {
        if (['connection', 'content-length', 'transfer-encoding', 'host'].includes(key)) continue;
        if (typeof value === 'string') headers[key] = value;
      }

      const url = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);
      const fetchRequest = new Request(url, {
        method: request.method,
        headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : body,
      });

      const result = await app.handle(fetchRequest);
      response.statusCode = result.status;
      for (const [key, value] of result.headers) response.setHeader(key, value);
      if (request.method === 'HEAD' || result.status === 204) {
        response.end();
        return;
      }
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch (error) {
      console.error('[musee] request failed:', error);
      response.statusCode = 500;
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ error: 'Musee 内部错误，请查看 Harness 日志。' }));
    }
  };
}
