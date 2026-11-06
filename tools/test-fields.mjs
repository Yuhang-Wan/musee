import assert from 'node:assert/strict';
import { FIELDS, FIELDS_BY_ID } from '../src/host/fields.js';

assert.equal(FIELDS.length, 26);
assert.equal(FIELDS_BY_ID.size, 26);

for (const field of FIELDS) {
  assert.ok(/^\d+$/.test(field.id), `invalid OpenAlex field id: ${field.id}`);
  assert.ok(field.name?.en && field.name?.zh && field.name?.fr, `missing localized name for ${field.id}`);
  assert.ok(field.blurb?.en && field.blurb?.zh && field.blurb?.fr, `missing localized blurb for ${field.id}`);
}

console.log('field catalog tests passed');
