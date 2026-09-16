const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const { availableActions, participantIdentity } = require('../features/eventos/acompanhamento/acompanhamento.rules.ts');
test('cancelled occurrence only allows recovery, never participant mutations', () => {
  const actions = availableActions({ id: 8, status: 'Cancelada', cancelada: true }, { permitirReabertura: true }, true);
  assert.equal(actions.descancelar, true);
  assert.equal(actions.participantes, false);
  assert.equal(actions.cancelar, false);
});
test('consolidated occurrence cannot reopen and permission denial removes all actions', () => {
  assert.equal(availableActions({ id: 8, status: 'Realizada' }, { consolidacaoPermanente: true }, true).reabrir, false);
  assert.equal(Object.values(availableActions({ id: 8, status: 'EmAndamento' }, {}, false)).some(Boolean), false);
});
test('participant relation ID is never used as person ID for removal', () => {
  assert.deepEqual(participantIdentity({ id: 99, usuarioId: 3, isVirtual: false }), { id: 3, tipo: 'usuario' });
  assert.deepEqual(participantIdentity({ id: 99, usuarioVirtualId: 4, isVirtual: true }), { id: 4, tipo: 'usuario_virtual' });
  assert.throws(() => participantIdentity({ id: 99, isVirtual: true }));
});
const { acompanhamentoService } = require('../features/eventos/acompanhamento/acompanhamento.service.ts');
const { eventosApi } = require('../services/api/eventos-api.ts');
const { participantesEventoApi } = require('../services/api/participantes-evento-api.ts');
test('virtual occurrence is materialized before a scoped participant removal', async () => {
  const originalMaterialize = eventosApi.materializar;
  const originalRemove = participantesEventoApi.remove;
  const calls = [];
  eventosApi.materializar = async (...args) => { calls.push(['materialize', ...args]); return 80; };
  participantesEventoApi.remove = async (...args) => { calls.push(['remove', ...args]); };
  try {
    await acompanhamentoService.executar({ evento: { id: 42 }, ocorrencia: { id: 0, isVirtual: true, status: 'Agendada', dataHora: '2026-09-07T19:00:00' } },
      { kind: 'remover', pessoa: { id: 900, usuarioId: 3, isVirtual: false }, motivo: 'Mudanca', escopo: 'somente_ocorrencia' },
      { usuarioId: 5, estruturaId: 2, grupoId: 8 }, () => {});
    assert.equal(calls[0][0], 'materialize');
    assert.deepEqual(calls[1], ['remove', 42, 3, { ocorrenciaId: 80, dataReferencia: '2026-09-07T19:00:00', tipo: 'usuario', motivo: 'Mudanca', escopo: 'somente_ocorrencia', removidoPor: 5 }]);
  } finally { eventosApi.materializar = originalMaterialize; participantesEventoApi.remove = originalRemove; }
});
test('cancelled occurrence and empty reason never invoke HTTP mutations', async () => {
  const original = eventosApi.atualizarOcorrenciaStatus;
  let writes = 0;
  eventosApi.atualizarOcorrenciaStatus = async () => { writes++; };
  try {
    const data = { evento: { id: 42 }, ocorrencia: { id: 8, status: 'Cancelada', cancelada: true } };
    const scope = { usuarioId: 5, estruturaId: 2, grupoId: 8 };
    await assert.rejects(acompanhamentoService.executar(data, { kind: 'cancelar', motivo: 'Motivo' }, scope, () => {}));
    await assert.rejects(acompanhamentoService.executar({ ...data, ocorrencia: { id: 8, status: 'EmAndamento' } }, { kind: 'cancelar', motivo: ' ' }, scope, () => {}));
    assert.equal(writes, 0);
  } finally { eventosApi.atualizarOcorrenciaStatus = original; }
});
test('finalization uses the real occurrence status endpoint and preserves notes', async () => {
  const original = eventosApi.atualizarOcorrenciaStatus;
  let request;
  eventosApi.atualizarOcorrenciaStatus = async (...args) => { request = args; };
  try {
    const result = await acompanhamentoService.executar(
      { evento: { id: 42 }, ocorrencia: { id: 8, status: 'EmAndamento', cancelada: false } },
      { kind: 'finalizar', pendentes: 'pendente', observacoes: 'Encerramento normal', enviarResumo: true, enviarLembrete: false },
      { usuarioId: 5, estruturaId: 2, grupoId: 8 }, () => {},
    );
    assert.equal(result, undefined);
    assert.deepEqual(request, [8, { novoStatus: 'Realizada', observacoes: 'Encerramento normal', usuarioId: 5 }]);
  } finally { eventosApi.atualizarOcorrenciaStatus = original; }
});
