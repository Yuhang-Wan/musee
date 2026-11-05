import fs from 'node:fs/promises';
import path from 'node:path';

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    return fallback;
  }
}

async function writeAtomic(file, text) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, text, 'utf8');
  await fs.rename(tmp, file);
}

function nowIso() {
  return new Date().toISOString();
}

export async function createStore(dataDir) {
  const cacheDir = path.join(dataDir, 'cache');
  await fs.mkdir(cacheDir, { recursive: true });

  const libraryPath = path.join(dataDir, 'library.json');
  const cachePath = path.join(cacheDir, 'translations.json');
  const preferencesPath = path.join(dataDir, 'preferences.json');
  const impactPath = path.join(dataDir, 'impact-factors.json');

  let library = await readJson(libraryPath, { version: 1, items: [] });
  if (!Array.isArray(library.items)) library = { version: 1, items: [] };
  library.items = library.items.filter((item) => item && item.id && item.title);

  let preferences = await readJson(preferencesPath, { version: 1, followedJournals: [] });
  if (!Array.isArray(preferences.followedJournals)) preferences.followedJournals = [];
  preferences.followedJournals = [...new Set(preferences.followedJournals.filter((id) => typeof id === 'string'))];

  const impactFactors = {};
  for (const [issn, value] of Object.entries(await readJson(impactPath, {}))) {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) impactFactors[String(issn)] = numeric;
  }

  const translations = new Map(Object.entries(await readJson(cachePath, {})));
  let cacheTimer = null;

  function persistCache() {
    cacheTimer = null;
    const plain = Object.fromEntries(translations.entries());
    writeAtomic(cachePath, JSON.stringify(plain, null, 2)).catch(() => {});
  }

  async function persistLibrary() {
    await writeAtomic(libraryPath, JSON.stringify(library, null, 2));
  }

  async function persistPreferences() {
    await writeAtomic(preferencesPath, JSON.stringify(preferences, null, 2));
  }

  function list() {
    return library.items;
  }

  function followedJournals() {
    return [...preferences.followedJournals];
  }

  async function followJournal(id) {
    if (id && !preferences.followedJournals.includes(id)) {
      preferences.followedJournals.push(id);
      await persistPreferences();
    }
    return followedJournals();
  }

  async function unfollowJournal(id) {
    const before = preferences.followedJournals.length;
    preferences.followedJournals = preferences.followedJournals.filter((entry) => entry !== id);
    if (preferences.followedJournals.length !== before) await persistPreferences();
    return followedJournals();
  }

  function impactFactor(issn) {
    return impactFactors[String(issn || '')] ?? null;
  }

  async function savePaper(paper) {
    const stamp = nowIso();
    const index = library.items.findIndex((item) => item.id === paper.id);
    if (index >= 0) {
      const existing = library.items[index];
      library.items[index] = {
        ...existing,
        ...paper,
        status: existing.status || 'unread',
        note: existing.note || '',
        tags: existing.tags || [],
        savedAt: existing.savedAt || stamp,
        updatedAt: stamp,
      };
    } else {
      library.items.unshift({
        ...paper,
        status: 'unread',
        note: '',
        tags: [],
        savedAt: stamp,
        updatedAt: stamp,
      });
    }
    await persistLibrary();
    return library.items.find((item) => item.id === paper.id);
  }

  async function updateItem(id, patch) {
    const item = library.items.find((entry) => entry.id === id);
    if (!item) throw new Error('这条文献还没有收藏。');
    if (typeof patch.status === 'string' && ['unread', 'reading', 'read'].includes(patch.status)) {
      item.status = patch.status;
    }
    if (typeof patch.note === 'string') item.note = patch.note.slice(0, 200000);
    if (Array.isArray(patch.tags)) {
      item.tags = [...new Set(patch.tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 24);
    }
    item.updatedAt = nowIso();
    await persistLibrary();
    return item;
  }

  async function removeItem(id) {
    const before = library.items.length;
    library.items = library.items.filter((item) => item.id !== id);
    if (library.items.length !== before) await persistLibrary();
    return library.items.length !== before;
  }

  function exportMarkdown() {
    const lines = ['# Musee 阅读库', '', `> 导出时间：${nowIso()}`, ''];
    for (const item of library.items) {
      lines.push(`## ${item.title}`, '');
      if (item.authors?.length) lines.push(`**作者**：${item.authors.join(', ')}  `);
      if (item.journal?.name) lines.push(`**期刊**：${item.journal.name}  `);
      if (item.year) lines.push(`**年份**：${item.year}  `);
      if (item.doi) lines.push(`**DOI**：${item.doi}  `);
      lines.push(`**状态**：${item.status || 'unread'}  `);
      if (item.tags?.length) lines.push(`**标签**：${item.tags.join(', ')}  `);
      lines.push('');
      if (item.note) lines.push(item.note, '');
      lines.push('---', '');
    }
    return lines.join('\n');
  }

  const cache = {
    get(key) {
      return translations.get(key);
    },
    set(key, value) {
      translations.set(key, value);
      if (translations.size > 500) {
        const oldest = translations.keys().next().value;
        translations.delete(oldest);
      }
      if (!cacheTimer) cacheTimer = setTimeout(persistCache, 600);
    },
    flush() {
      if (cacheTimer) {
        clearTimeout(cacheTimer);
        persistCache();
      }
    },
  };

  return {
    dataDir,
    libraryPath,
    list,
    savePaper,
    updateItem,
    removeItem,
    exportMarkdown,
    cache,
    followedJournals,
    followJournal,
    unfollowJournal,
    impactFactor,
  };
}
