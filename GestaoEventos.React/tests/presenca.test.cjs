const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const { validateAttendance, statusLabel } = require('../features/eventos/presenca/presenca.rules.ts');
test('justified and absence always require a reason', () => {
  assert.equal(validateAttendance('JUSTIFICADO', '', false).valid, false);
  assert.equal(validateAttendance('AUSENTE', '', false).valid, false);
  assert.equal(validateAttendance('AUSENTE', '', true).valid, false);
  assert.equal(validateAttendance('PRESENTE', '', true).valid, true);
  assert.equal(statusLabel('NAO_RESPONDEU'), 'Pendente');
});
test('batch payload contains real participant identity and occurrence date', () => {
  const payload = require('../features/eventos/presenca/presenca.service.ts').buildAttendanceItem({
    eventoId: 42, ocorrenciaId: 91, ocorridoEm: '2026-09-07T19:00:00', registradoPor: 3,
  }, { usuarioId: 8, usuarioVirtualId: null, isVirtual: false }, 'PRESENTE', '');
  assert.deepEqual(payload, { eventoId: 42, ocorrenciaId: 91, usuarioId: 8, ocorridoEm: '2026-09-07T19:00:00', registradoPor: 3, status: 'PRESENTE', observacao: null });
});
