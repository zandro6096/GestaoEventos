const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('EAS possui lanes e canais explicitamente separados', () => {
  const eas = JSON.parse(read('eas.json'));
  assert.equal(eas.build.development.channel, 'dev');
  assert.equal(eas.build.preview.channel, 'preview');
  assert.equal(eas.build.production.channel, 'prod');
  assert.equal(eas.build.preview.env.EXPO_PUBLIC_ENV, 'preview');
  assert.equal(eas.build.production.env.EXPO_PUBLIC_ENV, 'prod');
});

test('OTA bloqueia mudancas incompativeis e release possui rollback', () => {
  const ota = read('docs/ota-policy.md');
  const release = read('docs/release.md');
  for (const term of ['contratos da API', 'autenticacao', 'contexto', 'permissoes']) assert.match(ota, new RegExp(term));
  assert.match(release, /rollback/);
  assert.match(release, /Angular/);
});

test('go-live permanece binario e aponta para manifesto', () => {
  const gate = read('scripts/validate-go-live-gate.mjs');
  assert.match(gate, /status !== 'verified'/);
  assert.match(gate, /process\.exit\(1\)/);
  assert.match(read('scripts/release-gate.mjs'), /quality-gate/);
});
