import assert from 'node:assert/strict';
import { maskMath, splitChunks } from '../src/client/math.js';

const cases = [
  String.raw`The group \mathrm{SL}^{+}_{b}(2,\mathbb{R}) is noncompact and acts on the space.`,
  String.raw`Let $H = \begin{smallmatrix} a & b \\ c & d \end{smallmatrix}$ and $A = \frac{1}{\sqrt{2}}(H + K)$.`,
  String.raw`We use \alpha, \beta and \gamma in the proof.`,
  'Plain prose without formulas is unchanged.',
];

for (const text of cases) {
  const masked = maskMath(text);
  const translated = `${masked.text} [translated]`;
  const restored = masked.restore(translated);
  assert.equal(restored, `${text} [translated]`, `round trip failed for: ${text}`);
  assert.ok(masked.text.length <= text.length, 'masking must not grow the prompt');
  console.log('ok', masked.text);
}

const chunks = splitChunks('a'.repeat(9000), 4000);
assert.deepEqual(chunks.map((chunk) => chunk.length), [4000, 4000, 1000]);
console.log('math mask tests passed');
