const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { personAction, isDuplicatePerson } = require('../features/grupos/membros/membros.rules.ts');

test('inactive people always use reactivation action', () => {
  assert.equal(personAction({ tipo: 'usuario', ativo: false, status: 'inativo' }), 'reativar');
  assert.equal(personAction({ tipo: 'usuario_virtual', ativo: false, status: 'inativo' }), 'reativar');
});

test('pending virtual invitation uses resend action', () => {
  assert.equal(personAction({ tipo: 'usuario_virtual', ativo: true, status: 'pendente' }), 'reenviar_convite');
  assert.equal(personAction({ tipo: 'usuario_virtual', ativo: true, status: 'expirado' }), 'reenviar_convite');
});

test('active people use add and duplicate detection remains explicit', () => {
  assert.equal(personAction({ tipo: 'usuario', ativo: true, status: 'ativo' }), 'adicionar');
  assert.equal(isDuplicatePerson(8, [3, 8]), true);
  assert.equal(isDuplicatePerson(9, [3, 8]), false);
});
