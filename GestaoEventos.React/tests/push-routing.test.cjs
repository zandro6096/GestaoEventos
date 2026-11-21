const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');

// Compila o modulo real em memoria; sem logica duplicada no teste.
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
const { resolvePushRoute } = require('../services/notifications/push-routing.ts');

test('push de pendencias abre Meus Eventos', () => {
  assert.equal(resolvePushRoute({ tipo: 'pendencias', rota: '/admin/eventos/meus' }), '/admin/eventos/meus');
  assert.equal(resolvePushRoute({ tipo: 'pendencias' }), '/admin/eventos/meus');
});

test('rota fora da lista permitida e ignorada', () => {
  assert.equal(resolvePushRoute({ rota: '/admin/auditoria' }), null);
  assert.equal(resolvePushRoute({ rota: 'https://exemplo.com/phishing' }), null);
  assert.equal(resolvePushRoute({ tipo: 'pendencias', rota: '/admin/auditoria' }), '/admin/eventos/meus');
});

test('payload malformado ou tipo desconhecido nao navega', () => {
  assert.equal(resolvePushRoute({}), null);
  assert.equal(resolvePushRoute({ tipo: 42, rota: { a: 1 } }), null);
  assert.equal(resolvePushRoute({ tipo: 'constructor' }), null);
  assert.equal(resolvePushRoute({ tipo: 'desconhecido' }), null);
});
