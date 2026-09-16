const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
// Compile the actual feature modules in memory; no duplicated business logic.
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
const { inicioSchema, buildInicioPayload } = require('../features/eventos/iniciar-evento/inicio.schema.ts');
const template = { id: 7, estruturaId: 2, titulo: 'Encontro', descricao: '', tipoRecorrencia: 0,
  intervalo: 1, duracaoPadraoMinutos: 90, horarioPadrao: '23:30', diasSemana: [],
  permitirRenomear: false, permitirConfigurarHora: false, permitirConfigurarLocal: false,
  permitirConfigurarDia: true, localPadrao: 'Sala 1', opcaoFim: 'sem-fim' };
const values = { titulo: 'Outro', grupoId: 5, dataInicio: '2026-12-31', hora: '12:00',
  local: 'Outro local', dataFim: '', semFim: true, exigeConfirmacao: false };
test('rejects zero group and impossible calendar dates', () => {
  assert.equal(inicioSchema.safeParse({ ...values, grupoId: 0 }).success, false);
  assert.equal(inicioSchema.safeParse({ ...values, dataInicio: '2026-02-30' }).success, false);
});
test('preserves local time across midnight and template restrictions', () => {
  const result = buildInicioPayload(values, template, { usuarioId: 3, estruturaId: 2 });
  assert.equal(result.dataInicio, '2026-12-31T23:30:00');
  assert.equal(result.dataFim, '2027-01-01T01:00:00');
  assert.equal(result.titulo, 'Encontro');
  assert.equal(result.local, 'Sala 1');
  assert.equal(result.grupoId, 5);
});
test('rejects cross-structure template and reversed recurrence end', () => {
  assert.throws(() => buildInicioPayload(values, template, { usuarioId: 3, estruturaId: 9 }));
  assert.equal(inicioSchema.safeParse({ ...values, semFim: false, dataFim: '2025-01-01' }).success, false);
});

const { eventosApi } = require('../services/api/eventos-api.ts');
const { httpClient } = require('../services/api/http-client.ts');
const { inicioService } = require('../features/eventos/iniciar-evento/inicio.service.ts');
test('sends snake_case and local wall-clock strings through the real HTTP adapter', async () => {
  const previous = httpClient.defaults.adapter;
  let request;
  httpClient.defaults.adapter = async (config) => {
    request = config;
    return { data: { data: { id: 42 } }, status: 201, statusText: 'Created', headers: {}, config };
  };
  try {
    assert.equal(await eventosApi.criar(buildInicioPayload(values, template, { usuarioId: 3, estruturaId: 2 })), 42);
    const body = JSON.parse(request.data);
    assert.equal(body.grupo_id, 5);
    assert.equal(body.data_inicio, '2026-12-31T23:30:00');
    assert.equal(body.estrutura_id, 2);
    assert.equal(body.grupoId, undefined);
  } finally { httpClient.defaults.adapter = previous; }
});
test('materialization failure reports committed creation without a second creation', async () => {
  const originals = { ...eventosApi };
  let creates = 0;
  eventosApi.conflitos = async () => [];
  eventosApi.criar = async () => { creates++; return 42; };
  eventosApi.materializar = async () => { throw new Error('Network'); };
  try {
    const result = await inicioService.iniciar(buildInicioPayload(values, template, { usuarioId: 3, estruturaId: 2 }), () => {});
    assert.equal(creates, 1);
    assert.equal(result.eventoId, 42);
    assert.ok(result.warning);
  } finally { Object.assign(eventosApi, originals); }
});
test('permission loss after conflict query prevents creation', async () => {
  const originals = { ...eventosApi };
  let checks = 0;
  let creates = 0;
  eventosApi.conflitos = async () => [];
  eventosApi.criar = async () => { creates++; return 42; };
  try {
    await assert.rejects(inicioService.iniciar(buildInicioPayload(values, template, { usuarioId: 3, estruturaId: 2 }), () => {
      if (++checks === 2) throw new Error('Context changed');
    }), /Context changed/);
    assert.equal(creates, 0);
  } finally { Object.assign(eventosApi, originals); }
});
test('conflicts block creation and successful start changes occurrence status', async () => {
  const originals = { ...eventosApi };
  const calls = [];
  eventosApi.conflitos = async () => [{ titulo: 'Conflitante' }];
  eventosApi.criar = async () => { calls.push('create'); return 42; };
  eventosApi.materializar = async () => { calls.push('materialize'); return 91; };
  eventosApi.atualizarOcorrenciaStatus = async (id, body) => { calls.push([id, body.novoStatus]); };
  try {
    const payload = buildInicioPayload(values, template, { usuarioId: 3, estruturaId: 2 });
    await assert.rejects(inicioService.iniciar(payload, () => {}), /Conflitante/);
    assert.equal(calls.length, 0);
    eventosApi.conflitos = async () => [];
    const result = await inicioService.iniciar(payload, () => {});
    assert.deepEqual(calls, ['create', 'materialize', [91, 'EmAndamento']]);
    assert.equal(result.warning, undefined);
  } finally { Object.assign(eventosApi, originals); }
});
