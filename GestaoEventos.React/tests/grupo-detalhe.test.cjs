const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { groupPath } = require('../features/grupos/grupos.rules.ts');
test('detail path follows hierarchy and does not replace active context', () => {
  const groups = [{ id: 1, nome: 'Raiz', grupoSuperiorId: null }, { id: 2, nome: 'Filho', grupoSuperiorId: 1 }];
  assert.deepEqual(groupPath(groups, groups[1]).map((item) => item.nome), ['Raiz', 'Filho']);
});
