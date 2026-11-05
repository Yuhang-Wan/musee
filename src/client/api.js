export function museeToken() {
  return document.querySelector('meta[name="musee-token"]')?.getAttribute('content') || '';
}

let tokenPromise = null;

/**
 * Prefer the token injected into the page head. When the page loaded before
 * the plugin was installed, ask the Host over a same-origin handshake instead
 * of forcing the reader to reload.
 */
export async function ensureToken() {
  const inline = museeToken();
  if (inline) return inline;
  if (!tokenPromise) {
    tokenPromise = fetch('/musee/api/handshake', { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('NO_TOKEN');
        const data = await response.json();
        if (!data.token) throw new Error('NO_TOKEN');
        return data.token;
      })
      .catch((error) => {
        tokenPromise = null;
        throw error;
      });
  }
  return tokenPromise;
}

export function tFormat(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (params[key] === undefined ? `{${key}}` : String(params[key])));
}

async function request(path, options = {}) {
  const token = await ensureToken();
  if (!token) throw new Error('NO_TOKEN');
  const response = await fetch(`/musee/api${path}`, {
    method: options.method || 'GET',
    headers: {
      'x-musee-token': token,
      ...(options.body ? { 'content-type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

export const api = {
  bootstrap: () => request('/bootstrap'),
  library: () => request('/library'),
  journal: (journalId, { limit = 20, offset = 0, year = null } = {}) => {
    const params = new URLSearchParams({ journalId, limit: String(limit), offset: String(offset) });
    if (year) params.set('year', String(year));
    return request(`/journal?${params.toString()}`);
  },
  conference: (conferenceId, limit = 20) => request(`/conference?conferenceId=${encodeURIComponent(conferenceId)}&limit=${limit}`),
  arxiv: (category, limit = 20) => request(`/arxiv?category=${encodeURIComponent(category)}&limit=${limit}`),
  search: (query, limit = 20) => request(`/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  translate: (title, abstract, lang) => request('/translate', { method: 'POST', body: { title, abstract, lang } }),
  translateTitles: (titles, lang) => request('/translate-titles', { method: 'POST', body: { titles, lang } }),
  translateSection: (heading, text, lang) => request('/translate-section', { method: 'POST', body: { heading, text, lang } }),
  fulltext: (paper) => {
    const params = new URLSearchParams();
    if (paper?.arxivId) params.set('arxivId', paper.arxivId);
    if (paper?.doi) params.set('doi', paper.doi);
    if (paper?.title) params.set('title', paper.title);
    return request(`/fulltext?${params.toString()}`);
  },
  preferences: () => request('/preferences'),
  follow: (journalId, follow) =>
    request('/preferences', { method: 'POST', body: { action: follow ? 'follow' : 'unfollow', journalId } }),
  home: () => request('/home'),
  pdfUrl: async (arxivId) => {
    const token = await ensureToken();
    return `/musee/api/pdf?arxivId=${encodeURIComponent(arxivId)}&token=${encodeURIComponent(token)}`;
  },
  pdfWorkerUrl: async () => {
    const token = await ensureToken();
    return `/musee/api/pdf-worker?token=${encodeURIComponent(token)}`;
  },
  pdfLibUrl: async () => {
    const token = await ensureToken();
    return `/musee/api/pdf-lib?token=${encodeURIComponent(token)}`;
  },
  save: (paper) => request('/library', { method: 'POST', body: { action: 'save', paper } }),
  update: (id, patch) => request('/library', { method: 'POST', body: { action: 'update', id, patch } }),
  remove: (id) => request('/library', { method: 'POST', body: { action: 'remove', id } }),
  cite: (papers, format) => request('/cite', { method: 'POST', body: { papers, format } }),
};

export async function downloadExport(format, filename) {
  const token = await ensureToken();
  if (!token) throw new Error('NO_TOKEN');
  const response = await fetch(`/musee/api/export?format=${encodeURIComponent(format)}`, {
    headers: { 'x-musee-token': token },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  saveBlob(blob, filename);
}

export function downloadText(filename, text, mime = 'text/plain;charset=utf-8') {
  saveBlob(new Blob([text], { type: mime }), filename);
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
