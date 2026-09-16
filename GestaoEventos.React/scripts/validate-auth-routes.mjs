import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(path) {
  const absolute = join(root, path);
  assert(existsSync(absolute), `Missing required file: ${path}`);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

const routeFiles = [
  'app/(auth)/auth/login.tsx',
  'app/(auth)/auth/cadastro.tsx',
  'app/(auth)/auth/recuperar-senha.tsx',
  'app/(auth)/auth/redefinir-senha.tsx',
  'app/(auth)/auth/sso/callback.tsx',
  'app/(auth)/confirmar-email.tsx',
  'app/(auth)/aceitar-convite.tsx',
];

for (const route of routeFiles) {
  read(route);
}

const authApi = read('services/api/auth-api.ts');
for (const apiPath of [
  '/api/auth/token',
  '/api/usuarios',
  '/api/auth/recuperar-senha',
  '/api/auth/redefinir-senha',
  '/api/auth/reenviar-confirmacao-email',
  '/api/auth/confirmar-email',
  '/api/convites/validar/',
  '/api/convites/aceitar-token',
  '/api/auth/sso/${provider}/iniciar',
]) {
  assert(authApi.includes(apiPath), `auth-api missing backend path: ${apiPath}`);
}

const appLayout = read('app/(app)/_layout.tsx');
assert(appLayout.includes('Redirect'), 'Authenticated app layout must redirect while session hydrate is pending');
assert(appLayout.includes('/auth/login'), 'Authenticated app layout must redirect to /auth/login');

for (const screen of [
  'features/auth/screens/LoginScreen.tsx',
  'features/auth/screens/SignupScreen.tsx',
  'features/auth/screens/RecoverPasswordScreen.tsx',
  'features/auth/screens/ResetPasswordScreen.tsx',
  'features/auth/screens/ConfirmEmailScreen.tsx',
  'features/auth/screens/AcceptInviteScreen.tsx',
  'features/auth/screens/SsoCallbackScreen.tsx',
]) {
  const content = read(screen);
  assert(!content.includes('httpClient'), `${screen} must not import httpClient directly`);
  assert(!content.includes('authApi'), `${screen} must not import authApi directly`);
}

const publicAuthService = read('features/auth/services/public-auth.service.ts');
const authScreensContent = [
  'features/auth/screens/LoginScreen.tsx',
  'features/auth/screens/SignupScreen.tsx',
  'features/auth/screens/RecoverPasswordScreen.tsx',
  'features/auth/screens/ResetPasswordScreen.tsx',
  'features/auth/screens/ConfirmEmailScreen.tsx',
  'features/auth/screens/AcceptInviteScreen.tsx',
  'features/auth/screens/SsoCallbackScreen.tsx',
].map((screen) => read(screen)).join('\n');

for (const detail of [
  'btn:login',
  'auth:login_submit',
  'auth:login_success',
  'page:signup_view',
  'auth:signup_submit',
  'auth:signup_success',
  'btn:recuperar_senha',
  'auth:recuperar_senha_submit',
  'auth:recuperar_senha_email_enviado',
  'btn:redefinir_senha',
  'auth:redefinir_senha_submit',
  'auth:redefinir_senha_success',
  'auth:sso_callback_process',
  'auth:sso_login_success',
]) {
  assert(publicAuthService.includes(detail) || authScreensContent.includes(detail), `Missing analytics detail: ${detail}`);
}

const manifest = read('docs/parity-manifest.md');
for (const route of [
  '`/auth/login`',
  '`/auth/cadastro`',
  '`/auth/recuperar-senha`',
  '`/auth/redefinir-senha`',
  '`/confirmar-email`',
  '`/aceitar-convite`',
  '`/auth/sso/callback`',
  '`app/(app) unauthenticated redirect`',
]) {
  assert(manifest.includes(route), `Parity manifest missing auth route row: ${route}`);
}

if (failures.length > 0) {
  console.error('[validate-auth-routes] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-auth-routes] OK');
