const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

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
