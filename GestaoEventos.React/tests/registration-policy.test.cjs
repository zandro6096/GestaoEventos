const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadTs(file, dependencies = {}) {
  const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

const policy = loadTs('features/auth/services/registration-policy.ts');

function authHarness(platform, invite) {
  const calls = [];
  const service = loadTs('features/auth/services/public-auth.service.ts', {
    'expo-linking': {},
    'react-native': { Platform: { OS: platform }, Linking: {} },
    '../../../services/analytics/analytics.service': { track() {} },
    '../../../services/api/auth-api': {
      authApi: {
        async registerUser(request) { calls.push(['register', request]); return { id: 42 }; },
        async validateInviteToken(token) { calls.push(['validate', token]); if (invite instanceof Error) throw invite; return invite; },
        async acceptInviteToken(request) { calls.push(['accept', request]); return { usuarioId: 42 }; },
      },
    },
    '../../../services/api/api-error': { normalizeApiError: (error) => error },
    '../../../services/offline/mutation-guard': { assertOnlineForMutation() {} },
    '../../../services/session/auth-session.service': {},
    '../../../stores/auth.store': {},
    './biometric-login.service': {},
    './registration-policy': policy,
  }).publicAuthService;
  return { service, calls };
}

test('cadastro publico permanece habilitado em Android/web e bloqueado no iOS', () => {
  assert.equal(policy.allowsPublicRegistration('ios'), false);
  assert.equal(policy.allowsPublicRegistration('android'), true);
  assert.equal(policy.allowsPublicRegistration('web'), true);
});

test('convite exige valid=true e ID inteiro positivo de organizacao existente', () => {
  for (const invalid of [undefined, null, {}, { valid: false, estruturaId: 1 }, { valid: true },
    { valid: true, estruturaId: 0 }, { valid: true, estruturaId: -1 },
    { valid: true, estruturaId: 1.5 }, { valid: true, estruturaId: '1' },
    { valid: true, estruturaId: NaN }, { valid: true, estruturaId: Infinity }]) {
    assert.equal(policy.isExistingOrganizationInvite(invalid), false);
  }
  assert.equal(policy.isExistingOrganizationInvite({ valid: true, estruturaId: 8 }), true);
});

test('business service bloqueia cadastro publico iOS antes de qualquer HTTP', async () => {
  const { service, calls } = authHarness('ios');
  await assert.rejects(service.registerUser({ nome: 'Ana', email: 'ana@example.com', senha: 'Password1!' }), /exige um convite/);
  assert.deepEqual(calls, []);
});

test('business service preserva payload de cadastro publico Android/web', async () => {
  for (const platform of ['android', 'web']) {
    const { service, calls } = authHarness(platform);
    const request = { nome: 'Ana', email: 'ana@example.com', senha: 'Password1!' };
    assert.equal((await service.registerUser(request)).id, 42);
    assert.deepEqual(calls, [['register', request]]);
  }
});

test('aceite iOS revalida token e rejeita convite expirado ou sem organizacao antes do POST', async () => {
  for (const invite of [{ valid: false, estruturaId: 8 }, { valid: true }, { valid: true, estruturaId: 0 }]) {
    const { service, calls } = authHarness('ios', invite);
    await assert.rejects(service.acceptInviteToken({ token: 'token', senha: 'Password1!', confirmarSenha: 'Password1!' }), /não é válido/);
    assert.deepEqual(calls, [['validate', 'token']]);
  }
});

test('aceite iOS bloqueia token vazio antes de qualquer HTTP', async () => {
  const { service, calls } = authHarness('ios', { valid: true, estruturaId: 8 });
  await assert.rejects(service.acceptInviteToken({ token: '  ', senha: 'Password1!', confirmarSenha: 'Password1!' }), /Token de convite ausente/);
  assert.deepEqual(calls, []);
});

test('falha operacional ao validar convite iOS nunca envia aceite', async () => {
  const { service, calls } = authHarness('ios', new Error('Serviço indisponível'));
  await assert.rejects(service.acceptInviteToken({ token: 'token', senha: 'Password1!', confirmarSenha: 'Password1!' }), /Serviço indisponível/);
  assert.deepEqual(calls, [['validate', 'token']]);
});

test('aceite Android/web preserva contrato original sem validacao adicional', async () => {
  for (const platform of ['android', 'web']) {
    const { service, calls } = authHarness(platform);
    const request = { token: 'token', senha: 'Password1!', confirmarSenha: 'Password1!' };
    assert.equal((await service.acceptInviteToken(request)).usuarioId, 42);
    assert.deepEqual(calls, [['accept', request]]);
  }
});

test('aceite iOS valida organizacao existente antes de enviar contrato original', async () => {
  const { service, calls } = authHarness('ios', { valid: true, estruturaId: 8 });
  const request = { token: 'token', senha: 'Password1!', confirmarSenha: 'Password1!' };
  assert.equal((await service.acceptInviteToken(request)).usuarioId, 42);
  assert.deepEqual(calls, [['validate', 'token'], ['accept', request]]);
});
