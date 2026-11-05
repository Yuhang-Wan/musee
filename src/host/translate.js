import { digest } from './util.js';

const SYSTEM_PROMPT = `你是一位以中文为母语的学术译者，长期翻译城市研究、物理学、人工智能与机器人学领域的论文。请把用户给出的英文标题与摘要译成规范、地道的学术中文。

要求：
1. 使用书面学术语体，术语准确且前后一致；关键术语首次出现时可在括号内保留英文，例如“具身智能（embodied intelligence）”。
2. 不增删信息，不解释、不评论、不写导语；保留数字、单位、公式、变量名、引用标记（如 [12]）、图表编号和专有名词。
3. 长句按中文逻辑重组，避免逐词直译、避免口语化表达。
4. 严格按以下格式输出，不要输出任何其他内容：

### TITLE
中文标题

### ABSTRACT
中文摘要`;

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

  async function translate({ title, abstract }) {
    const llm = ctx.get('llm');
    if (!llm) throw new Error('当前 profile 没有可用的模型服务，无法翻译。');
    const route = selection();
    if (!route) throw new Error('尚未选择翻译模型：请在插件配置里设置 llmProvider / llmModel。');

    const sourceTitle = String(title || '').trim();
    const sourceAbstract = String(abstract || '').trim();
    if (!sourceTitle && !sourceAbstract) throw new Error('这篇论文没有可翻译的标题或摘要。');

    const key = digest(`${route.provider}/${route.model}\n${sourceTitle}\n${sourceAbstract}`);
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
        system: SYSTEM_PROMPT,
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
      model: `${route.provider}/${route.model}`,
      at: Date.now(),
    };
    cache.set(key, result);
    return { ...result, cached: false };
  }

  return { available, translate, route: selection };
}
