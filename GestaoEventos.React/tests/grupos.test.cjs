const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { buildGroupTree, filterGroups, groupPath } = require('../features/grupos/grupos.rules.ts');
const groups = [
  { id: 2, nome: 'Filhos', estruturaId: 9, nivelHierarquico: 2, grupoSuperiorId: 1, tipoGrupoId: null, criadoEm: '' },
  { id: 1, nome: 'Raiz', estruturaId: 9, nivelHierarquico: 1, grupoSuperiorId: null, tipoGrupoId: null, criadoEm: '' },
  { id: 3, nome: 'Outro', estruturaId: 9, nivelHierarquico: 1, grupoSuperiorId: null, tipoGrupoId: null, criadoEm: '' },
];
test('builds hierarchy from group containers without confusing events', () => { const tree = buildGroupTree(groups); assert.deepEqual(tree.map((item) => item.nome), ['Outro', 'Raiz']); assert.equal(tree[1].children[0].nome, 'Filhos'); });
test('filters by name and hierarchy level and resolves breadcrumb', () => { assert.deepEqual(filterGroups(groups, 'fil', null).map((item) => item.id), [2]); assert.deepEqual(filterGroups(groups, '', 1).map((item) => item.id), [1, 3]); assert.deepEqual(groupPath(groups, groups[0]).map((item) => item.nome), ['Raiz', 'Filhos']); });
