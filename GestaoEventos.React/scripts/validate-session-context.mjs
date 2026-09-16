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

for (const file of [
  'services/platform/secure-storage/contract.ts',
  'services/platform/secure-storage/index.android.ts',
  'services/platform/secure-storage/index.ios.ts',
  'services/platform/secure-storage/index.web.ts',
  'services/session/auth-session.service.ts',
  'stores/auth.store.ts',
  'stores/context.store.ts',
  'services/api/contexto-api.ts',
  'services/query/query-keys.ts',
]) {
  read(file);
}

const secureNative = read('services/platform/secure-storage/index.ios.ts')
  + '\n'
  + read('services/platform/secure-storage/index.android.ts');
assert(secureNative.includes('expo-secure-store'), 'native secure storage adapters must use expo-secure-store');
assert(secureNative.includes('SecureStore.setItemAsync'), 'native adapter must save with SecureStore.setItemAsync');
assert(secureNative.includes('SecureStore.getItemAsync'), 'native adapter must read with SecureStore.getItemAsync');
assert(secureNative.includes('SecureStore.deleteItemAsync'), 'native adapter must delete with SecureStore.deleteItemAsync');

const secureWeb = read('services/platform/secure-storage/index.web.ts');
assert(secureWeb.includes('sessionStorage'), 'web secure storage fallback must use sessionStorage');
assert(!secureWeb.includes('localStorage'), 'web fallback must not persist tokens in localStorage');

const authStore = read('stores/auth.store.ts');
for (const expected of ['unknown', 'authenticated', 'unauthenticated', 'context-required']) {
  assert(authStore.includes(`'${expected}'`), `auth store missing session status: ${expected}`);
}
assert(!/^\s*token\??:/m.test(authStore), 'auth store must not keep token as Zustand state');
assert(authStore.includes('hydrateSession'), 'auth store must expose hydrateSession');
assert(authStore.includes('completeLogin'), 'auth store must expose completeLogin');
assert(authStore.includes('logout'), 'auth store must expose logout');

const contextStore = read('stores/context.store.ts');
assert(contextStore.includes('estruturaId'), 'context store must expose estruturaId spelling');
assert(!contextStore.includes('estrutuaId'), 'context store must not expose typo estruturua/estrutuaId');

const contextoApi = read('services/api/contexto-api.ts');
assert(contextoApi.includes('/api/contexto/inicial'), 'contexto api must call GET /api/contexto/inicial');
assert(contextoApi.includes('usuario_id'), 'contexto api must send usuario_id query parameter');
assert(contextoApi.includes('toCamelCase'), 'contexto api must normalize response to camelCase');

const httpClient = read('services/api/http-client.ts');
assert(httpClient.includes('attachAuthToken'), 'http-client must expose attachAuthToken');
assert(httpClient.includes('Authorization'), 'http-client must set Authorization header from secure token');

const publicAuth = read('features/auth/services/public-auth.service.ts');
assert(publicAuth.includes('authSessionService.completeLogin'), 'login flow must persist token through auth session service');

const appLayout = read('app/(app)/_layout.tsx');
assert(appLayout.includes('hydrateSession'), 'authenticated layout must hydrate session before rendering private content');
assert(appLayout.includes('context-required'), 'authenticated layout must handle missing active context');
assert(appLayout.includes('/auth/login'), 'authenticated layout must redirect unauthenticated users to /auth/login');

const manifest = read('docs/parity-manifest.md');
assert(manifest.includes('session-context-foundation'), 'parity manifest must track session/context foundation');
assert(manifest.includes('GET /api/contexto/inicial'), 'parity manifest must cite contexto inicial endpoint');

if (failures.length > 0) {
  console.error('[validate-session-context] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-session-context] OK');
