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
  'services/permissions/permission.types.ts',
  'services/permissions/permission.facade.ts',
  'services/api/permissoes-api.ts',
  'stores/permission.store.ts',
  'shared/guards/RequirePermission.tsx',
  'features/session/screens/ProtectedPlaceholderScreen.tsx',
  'app/(app)/admin/eventos.tsx',
  'app/(app)/admin/grupos.tsx',
  'app/(app)/admin/painel.tsx',
  'app/(app)/admin/configuracoes.tsx',
]) {
  read(file);
}

const types = read('services/permissions/permission.types.ts');
for (const expected of ['criar', 'ler', 'editar', 'excluir', 'aprovar', 'gerenciar']) {
  assert(types.includes(`'${expected}'`), `permission action missing: ${expected}`);
}
for (const expected of ['eventos', 'grupos', 'usuarios', 'papeis', 'permissoes', 'painel', 'configuracoes']) {
  assert(types.includes(`'${expected}'`), `permission resource missing: ${expected}`);
}
assert(types.includes('PermissionScope'), 'permission types must expose PermissionScope');

const api = read('services/api/permissoes-api.ts');
for (const route of [
  '/api/permissoes/recursos',
  '/api/permissoes/responsavel/',
  '/api/permissoes/atribuir',
  '/api/permissoes/revogar',
]) {
  assert(api.includes(route), `permissoes-api missing backend route: ${route}`);
}
assert(api.includes('toCamelCase'), 'permissoes-api must normalize response to camelCase');
assert(api.includes('toSnakeCase'), 'permissoes-api must normalize mutation request to snake_case');

const facade = read('services/permissions/permission.facade.ts');
assert(facade.includes('function can('), 'permission facade must expose function can(action, resource, scope)');
assert(facade.includes('isOwnerContext'), 'owner bypass must be isolated inside permission facade');
assert(facade.includes('usePermissionStore'), 'permission facade must use normalized permission store');
assert(!/\\.papel\\s*===/.test(facade), 'facade must not use raw papel equality checks');

const store = read('stores/permission.store.ts');
assert(store.includes('setPermissionGrants'), 'permission store must set normalized grants');
assert(store.includes('clearPermissions'), 'permission store must clear permissions on context/session reset');

const guard = read('shared/guards/RequirePermission.tsx');
assert(guard.includes('can('), 'RequirePermission must call permission facade can()');
assert(guard.includes('Acesso negado'), 'RequirePermission must provide an actionable denied state');

const httpClient = read('services/api/http-client.ts');
assert(httpClient.includes('setUnauthorizedHandler'), 'http-client must expose setUnauthorizedHandler');
assert(httpClient.includes('status === 401'), 'http-client must handle 401 responses');
assert(httpClient.includes('status === 403'), 'http-client must preserve 403 responses for UI handling');

const authStore = read('stores/auth.store.ts');
assert(authStore.includes('setUnauthorizedHandler'), 'auth store must register 401 logout handler');
assert(authStore.includes('clearPermissions'), 'auth logout must clear permission store');

for (const route of [
  'app/(app)/admin/jornada.tsx',
  'app/(app)/admin/eventos.tsx',
  'app/(app)/admin/grupos.tsx',
  'app/(app)/admin/painel.tsx',
  'app/(app)/admin/configuracoes.tsx',
]) {
  assert(read(route).includes('RequirePermission'), `${route} must use RequirePermission`);
}

const manifest = read('docs/parity-manifest.md');
assert(manifest.includes('permission-facade-foundation'), 'parity manifest must track permission facade foundation');

if (failures.length > 0) {
  console.error('[validate-permissions] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-permissions] OK');
