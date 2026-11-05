export function museeToken() {
  return document.querySelector('meta[name="musee-token"]')?.getAttribute('content') || '';
}

export function tFormat(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => (params[key] === undefined ? `{${key}}` : String(params[key])));
}

async function request(path, options = {}) {
  const token = museeToken();
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
  journal: (journalId, limit = 20) => request(`/journal?journalId=${encodeURIComponent(journalId)}&limit=${limit}`),
  arxiv: (category, limit = 20) => request(`/arxiv?category=${encodeURIComponent(category)}&limit=${limit}`),
  search: (query, limit = 20) => request(`/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  translate: (title, abstract) => request('/translate', { method: 'POST', body: { title, abstract } }),
  save: (paper) => request('/library', { method: 'POST', body: { action: 'save', paper } }),
  update: (id, patch) => request('/library', { method: 'POST', body: { action: 'update', id, patch } }),
  remove: (id) => request('/library', { method: 'POST', body: { action: 'remove', id } }),
  cite: (papers, format) => request('/cite', { method: 'POST', body: { papers, format } }),
};

export async function downloadExport(format, filename) {
  const token = museeToken();
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
