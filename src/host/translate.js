import { digest } from './util.js';

const SYSTEM_ZH = `你是一位以中文为母语的学术译者，长期翻译城市研究、物理学、人工智能与机器人学领域的论文。请把用户给出的英文标题与摘要译成规范、地道的学术中文。

要求：
1. 使用书面学术语体，术语准确且前后一致；关键术语首次出现时可在括号内保留英文，例如“具身智能（embodied intelligence）”。
2. 不增删信息，不解释、不评论、不写导语；保留数字、单位、公式、变量名、引用标记（如 [12]）、图表编号和专有名词。
3. 长句按中文逻辑重组，避免逐词直译、避免口语化表达。
4. 严格按以下格式输出，不要输出任何其他内容：

### TITLE
中文标题

### ABSTRACT
中文摘要`;

const SYSTEM_FR = `Vous êtes un traducteur académique francophone spécialisé en études urbaines, physique, intelligence artificielle et robotique. Traduisez le titre et le résumé fournis en un français académique naturel.

Consignes :
1. Registre soutenu et terminologie précise, employée de façon cohérente ; à la première occurrence, un terme technique peut être suivi de l’anglais entre parenthèses.
2. N’ajoutez ni ne retirez aucune information ; ne commentez pas et n’ajoutez pas d’introduction. Conservez les chiffres, unités, formules, noms de variables, appels de citation (par exemple [12]), numéros de figures et noms propres.
3. Recomposez les phrases longues selon la syntaxe française ; évitez le mot-à-mot et le registre familier.
4. Respectez strictement le format suivant, sans aucun autre texte :

### TITLE
Titre en français

### ABSTRACT
Résumé en français`;

const TITLES_ZH = `Translate the following JSON array of academic paper titles into Simplified Chinese. Preserve author names, acronyms, model and dataset names, numbers, and technical terms. Do not explain, comment, or add notes. Return only a JSON array of translated strings in the same order, for example ["译文一","译文二"]. No markdown fences and no other text.`;

const TITLES_FR = `Traduisez le tableau JSON suivant de titres d’articles académiques en français. Conservez les noms d’auteurs, acronymes, noms de modèles et de jeux de données, chiffres et termes techniques. N’expliquez pas et n’ajoutez aucune note. Renvoyez uniquement un tableau JSON de chaînes traduites dans le même ordre, par exemple ["traduction 1","traduction 2"]. Sans balises Markdown ni autre texte.`;

function stripFences(text = '') {
  return String(text)
    .replace(/^\s*```[a-zA-Z]*\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
}

function parseSections(text) {
  const body = stripFences(text);
  const titleMatch = /###\s*TITLE\s*\n([\s\S]*?)(?=\n###\s*ABSTRACT|$)/i.exec(body);
  const abstractMatch = /###\s*ABSTRACT\s*\n([\s\S]*)$/i.exec(body);
  return {
    title: (titleMatch?.[1] || '').trim(),
    abstract: (abstractMatch?.[1] || '').trim(),
  };
}

function parseTitleTranslations(text, count) {
  const body = stripFences(text);
  try {
    const parsed = JSON.parse(body);
    if (Array.isArray(parsed)) return parsed.map((value) => String(value ?? '').trim());
  } catch {
    /* fall through to line parsing */
  }
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const numbered = new Map();
  for (const line of lines) {
    const match = /^(?:\*\*)?(\d+)[.、):：](?:\*\*)?\s*(?:\*\*)?(.+?)\s*$/.exec(line);
    if (match) numbered.set(Number(match[1]) - 1, match[2].replace(/\*\*/g, '').trim());
  }
  if (numbered.size) {
    return Array.from({ length: count }, (_, index) => numbered.get(index) || '');
  }
  if (lines.length === count) {
    return lines.map((line) => line.replace(/^[-*]\s*/, '').replace(/\*\*/g, '').trim());
  }
  return [];
}

export function createTranslator({ ctx, config, cache }) {
  const provider = String(config.llmProvider || '').trim();
  const model = String(config.llmModel || '').trim();

  function selection() {
    if (provider && model) return { provider, model };
    const fallback = ctx.get('agentDefaultModel')?.currentSelection?.();
    if (fallback?.provider && fallback?.model) return { provider: fallback.provider, model: fallback.model };
    return null;
  }

  function available() {
    return Boolean(ctx.get('llm')) && Boolean(selection());
  }

  async function translate({ title, abstract, lang = 'zh' }) {
    const llm = ctx.get('llm');
    if (!llm) throw new Error('当前 profile 没有可用的模型服务，无法翻译。');
    const route = selection();
    if (!route) throw new Error('尚未选择翻译模型：请在插件配置里设置 llmProvider / llmModel。');

    const target = lang === 'fr' ? 'fr' : 'zh';
    const sourceTitle = String(title || '').trim();
    const sourceAbstract = String(abstract || '').trim();
    if (!sourceTitle && !sourceAbstract) throw new Error('这篇论文没有可翻译的标题或摘要。');

    const key = digest(`${target}\n${route.provider}/${route.model}\n${sourceTitle}\n${sourceAbstract}`);
    const cached = cache.get(key);
    if (cached) return { ...cached, cached: true };

    const userText = [
      sourceTitle ? `TITLE:\n${sourceTitle}` : '',
      sourceAbstract ? `ABSTRACT:\n${sourceAbstract}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    let output = '';
    try {
      const messages = [{ role: 'user', content: [{ type: 'text', text: userText }] }];
      let callConfig = { provider: route.provider, model: route.model, maxTokens: 4000 };
      let streamCall;
      if (typeof llm.prepareCall === 'function') {
        const prepared = await llm.prepareCall({ provider: route.provider, model: route.model, maxTokens: 4000 }, controller.signal);
        callConfig = prepared.config;
        streamCall = (options) => prepared.stream(options);
      } else {
        streamCall = (options) => llm.stream(options);
      }
      const chunks = streamCall({
        ...callConfig,
        messages,
        system: target === 'fr' ? SYSTEM_FR : SYSTEM_ZH,
        signal: controller.signal,
      });
      for await (const chunk of chunks) {
        if (chunk.type === 'text-delta') output += chunk.text;
        if (chunk.type === 'finish') {
          if (chunk.reason?.kind === 'error') {
            throw new Error(chunk.reason.failure?.message || '模型调用失败。');
          }
          if (chunk.reason?.kind === 'aborted') throw new Error('翻译已取消。');
        }
      }
    } finally {
      clearTimeout(timer);
    }

    const parsed = parseSections(output);
    if (!parsed.title && !parsed.abstract) throw new Error('模型没有返回可解析的译文，请稍后重试。');
    const result = {
      title: parsed.title || sourceTitle,
      abstract: parsed.abstract || '',
      lang: target,
      model: `${route.provider}/${route.model}`,
      at: Date.now(),
    };
    cache.set(key, result);
    return { ...result, cached: false };
  }

  async function translateTitles(titles = [], lang = 'zh') {
    const llm = ctx.get('llm');
    if (!llm) throw new Error('当前 profile 没有可用的模型服务，无法翻译。');
    const route = selection();
    if (!route) throw new Error('尚未选择翻译模型：请在插件配置里设置 llmProvider / llmModel。');

    const target = lang === 'fr' ? 'fr' : 'zh';
    const clean = titles.map((title) => String(title || '').replace(/\s+/g, ' ').trim().slice(0, 500));
    const translations = new Array(clean.length).fill('');
    const pending = [];

    clean.forEach((title, index) => {
      if (!title) return;
      const key = digest(`titles\n${target}\n${route.provider}/${route.model}\n${title}`);
      const hit = cache.get(key);
      if (hit?.title) translations[index] = hit.title;
      else pending.push({ index, title, key });
    });

    if (!pending.length) return { translations, cached: true, model: `${route.provider}/${route.model}` };

    const titleList = JSON.stringify(pending.map((entry) => entry.title));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    let output = '';
    try {
      const messages = [{ role: 'user', content: [{ type: 'text', text: titleList }] }];
      let callConfig = { provider: route.provider, model: route.model, maxTokens: Math.min(4000, 200 + pending.length * 90) };
      let streamCall;
      if (typeof llm.prepareCall === 'function') {
        const prepared = await llm.prepareCall(
          { provider: route.provider, model: route.model, maxTokens: callConfig.maxTokens },
          controller.signal,
        );
        callConfig = prepared.config;
        streamCall = (options) => prepared.stream(options);
      } else {
        streamCall = (options) => llm.stream(options);
      }
      const chunks = streamCall({
        ...callConfig,
        messages,
        system: target === 'fr' ? TITLES_FR : TITLES_ZH,
        signal: controller.signal,
      });
      for await (const chunk of chunks) {
        if (chunk.type === 'text-delta') output += chunk.text;
        if (chunk.type === 'finish') {
          if (chunk.reason?.kind === 'error') throw new Error(chunk.reason.failure?.message || '模型调用失败。');
          if (chunk.reason?.kind === 'aborted') throw new Error('翻译已取消。');
        }
      }
    } finally {
      clearTimeout(timer);
    }

    const parsed = parseTitleTranslations(output, pending.length);
    pending.forEach((entry, index) => {
      const text = parsed[index];
      if (!text) return;
      translations[entry.index] = text;
      cache.set(entry.key, { title: text, lang: target, at: Date.now() });
    });
    if (!translations.some(Boolean)) {
      throw new Error(`模型没有返回可解析的标题译文：${JSON.stringify(output.slice(0, 160))}`);
    }
    return { translations, cached: false, model: `${route.provider}/${route.model}` };
  }

  return { available, translate, translateTitles, route: selection };
}
