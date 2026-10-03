const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

require('./registration-policy.test.cjs');

test('iOS limita cadastro a convite na UI e no business service (3.1.1)', () => {
  const login = read('features/auth/screens/LoginScreen.tsx');
  const signup = read('features/auth/screens/SignupScreen.tsx');
  const service = read('features/auth/services/public-auth.service.ts');
  assert.match(login, /inviteToken \|\| allowsPublicRegistration\(Platform\.OS\)/);
  assert.match(login, /params: inviteToken \? \{ convite: inviteToken \}/);
  assert.match(signup, /if \(!publicRegistrationAllowed && \(!inviteToken \|\| !validInvite\)\)/);
  assert.match(signup, /disabled=\{Boolean\(inviteToken && \(publicRegistrationAllowed \? inviteQuery\.error : !validInvite\)\)\}/);
  assert.match(signup, /!inviteQuery\.isFetching && !inviteQuery\.isError/);
  assert.match(signup, /if \(!publicRegistrationAllowed\) \{\s*if \(!validInvite\)/);
  assert.match(signup, /if \(!validInvite\) throw new Error/);
  assert.match(signup, /label="Tentar novamente".*inviteQuery\.refetch\(\)/);
  assert.match(signup, /pathname: '\/auth\/login', params: inviteToken \? \{ convite: inviteToken \}/);
  assert.match(login, /flexWrap: 'wrap'/);
  assert.match(login, /flexShrink: 1/);
  assert.match(service, /assertPublicRegistrationAllowed\(Platform\.OS\)/);
  assert.match(service, /const invite = await authApi\.validateInviteToken\(request\.token\)/);
  assert.match(service, /assertExistingOrganizationInvite\(invite\)/);
});

test('telas de autenticacao nao engolem o primeiro toque com o teclado aberto (rejeicao 2.1(a))', () => {
  const layout = read('features/auth/components/AuthLayout.tsx');
  assert.match(layout, /keyboardShouldPersistTaps="handled"/);
  assert.match(layout, /automaticallyAdjustKeyboardInsets/);
});

test('login e cadastro tambem enviam pela tecla do teclado e nao autocorrigem e-mail/senha', () => {
  assert.match(read('features/auth/screens/LoginScreen.tsx'), /onSubmitEditing=\{handleLoginPress\}/);
  assert.match(read('features/auth/screens/SignupScreen.tsx'), /onSubmitEditing=\{handleSignupPress\}/);
  const fields = read('features/auth/components/AuthField.tsx');
  assert.match(fields, /autoCorrect=\{false\}/);
  assert.match(fields, /spellCheck=\{false\}/);
});

test('exclusao de conta acessivel no perfil e na tela sem organizacao (5.1.1(v))', () => {
  assert.match(read('features/session/screens/ProfileScreen.tsx'), /<DeleteAccountPanel \/>/);
  assert.match(read('features/context/screens/StructureSelectionScreen.tsx'), /<DeleteAccountPanel \/>/);
  const panel = read('features/session/components/DeleteAccountPanel.tsx');
  assert.match(panel, /contaApi\.excluir\(senha\)/);
  assert.match(panel, /assertOnlineForMutation/);
  assert.match(read('services/api/conta-api.ts'), /\/api\/conta\/excluir/);
});

test('compra/gerenciamento de assinatura fora do app fica oculto no iOS (3.1.1)', () => {
  const source = read('features/admin/assinatura/AssinaturaAdminScreen.tsx');
  assert.match(source, /const canSellExternally = Platform\.OS !== 'ios'/);
  assert.match(source, /\{canSellExternally \? <View style=\{styles\.section\}>/);
  assert.match(source, /\{!canSellExternally \? null : status\.podeGerenciar/);
});

test('push so entra no build quando EXPO_PUBLIC_PUSH_ENABLED=1 e o profile de producao liga', () => {
  const config = read('app.config.js');
  assert.match(config, /EXPO_PUBLIC_PUSH_ENABLED === '1'/);
  assert.match(config, /pushEnabled \|\| !isNotificationsPlugin\(plugin\)/);
  assert.match(read('services/platform/push-notifications/native.ts'), /extra\?\.pushEnabled === true/);
  const eas = JSON.parse(read('eas.json'));
  assert.equal(eas.build.production.env.EXPO_PUBLIC_PUSH_ENABLED, '1');
  assert.equal(eas.build.preview.env.EXPO_PUBLIC_PUSH_ENABLED, undefined);
});
