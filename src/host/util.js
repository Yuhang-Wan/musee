import crypto from 'node:crypto';

export function digest(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function decodeEntities(value = '') {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

export function stripTags(value = '') {
  return decodeEntities(String(value).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function cleanText(value = '') {
  return stripTags(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

export class TtlCache {
  constructor(ttlMs = 10 * 60 * 1000, maxEntries = 80) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.entries = new Map();
  }

  get(key) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expires < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value) {
    this.entries.set(key, { value, expires: Date.now() + this.ttlMs });
    if (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      this.entries.delete(oldest);
    }
    return value;
  }

  async wrap(key, load) {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    return this.set(key, await load());
  }
}

const USER_AGENT = 'Musee/0.1 (DSH reading plugin; +https://github.com/musee)';

export async function fetchText(url, { timeoutMs = 25000, headers = {} } = {}) {
  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, ...headers },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`请求失败 (HTTP ${response.status}): ${new URL(url).host}`);
  }
  return response.text();
}

export async function fetchJson(url, options = {}) {
  const text = await fetchText(url, { ...options, headers: { accept: 'application/json', ...(options.headers || {}) } });
  return JSON.parse(text);
}

export function uniqueBy(list, keyOf) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
