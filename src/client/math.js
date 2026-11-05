export function splitChunks(text, max = 4000) {
  const value = String(text || '').trim();
  if (value.length <= max) return value ? [value] : [];
  const chunks = [];
  let rest = value;
  while (rest.length > max) {
    let cut = rest.lastIndexOf('\n\n', max);
    if (cut < max * 0.5) cut = rest.lastIndexOf('. ', max);
    if (cut < max * 0.5) cut = rest.lastIndexOf(' ', max);
    if (cut < 1) cut = max;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

export function maskMath(text) {
  const values = new Map();
  const tokenFor = (value) => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    let token = `⟦M${hash.toString(36)}⟧`;
    let suffix = 0;
    while (values.has(token) && values.get(token) !== value) {
      suffix += 1;
      token = `⟦M${hash.toString(36)}x${suffix}⟧`;
    }
    values.set(token, value);
    return token;
  };
  let masked = String(text || '');
  const patterns = [
    /\$\$[\s\S]*?\$\$/g,
    /\\\[[\s\S]*?\\\]/g,
    /\\\([\s\S]*?\\\)/g,
    /\$[^$\n]{1,400}\$/g,
    /\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\1\}/g,
    /\\[a-zA-Z]+(?:(?:\s*\{[^{}]*\})|(?:\s*\^\{[^{}]*\})|(?:\s*_\{[^{}]*\})|(?:\s*[()\[\]0-9A-Za-z,+\-*/=._^]))*/g,
  ];
  for (const pattern of patterns) masked = masked.replace(pattern, tokenFor);
  return {
    text: masked,
    restore: (value = '') =>
      String(value).replace(/⟦M[0-9a-z]+(?:x\d+)?⟧/g, (token) => values.get(token) ?? token),
  };
}
