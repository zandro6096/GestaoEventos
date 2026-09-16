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
  'services/session/context-selection.service.ts',
  'services/query/context-query-client.ts',
  'features/context/hooks/useContextActions.ts',
  'shared/components/ContextSwitcher.tsx',
]) {
  read(file);
}

const contextStore = read('stores/context.store.ts');
assert(contextStore.includes('selectedStructureId'), 'context store must expose selectedStructureId selector field');
assert(contextStore.includes('selectedGroupId'), 'context store must expose selectedGroupId selector field');
assert(contextStore.includes('canSwitchStructure'), 'context store must expose canSwitchStructure');
assert(contextStore.includes('restoreContextSnapshot'), 'context store must support rollback through restoreContextSnapshot');
assert(contextStore.includes('contextSelectionService.saveSelection'), 'context store must persist active context selection');

const selectionService = read('services/session/context-selection.service.ts');
assert(selectionService.includes('selected_context'), 'context selection must use a dedicated persisted key');
assert(selectionService.includes('secureStorage'), 'context selection must use the platform storage adapter');
assert(selectionService.includes('estruturaId'), 'context selection must persist estruturaId');
assert(selectionService.includes('grupoId'), 'context selection must persist grupoId');
assert(!selectionService.includes('token'), 'context selection must not persist auth token');

const queryKeys = read('services/query/query-keys.ts');
assert(queryKeys.includes('estruturaId'), 'query keys must support estruturaId scoping');
assert(queryKeys.includes('grupoId'), 'query keys must support grupoId scoping');
assert(queryKeys.includes('permissoes'), 'query keys must include permissions scope for rehydrate after context switch');

const queryClient = read('services/query/context-query-client.ts');
assert(queryClient.includes('cancelQueries'), 'context switch must cancel scoped queries');
assert(queryClient.includes('removeQueries'), 'context switch must remove stale scoped detail caches');
assert(queryClient.includes('invalidateQueries'), 'context switch must invalidate scoped query roots');
assert(queryClient.includes('permissoes'), 'context switch must include permissions query roots');

const actions = read('features/context/hooks/useContextActions.ts');
assert(actions.includes('contextoApi.getContextoInicial'), 'context switch must rehydrate contexto inicial from backend');
assert(actions.includes('restoreContextSnapshot'), 'context switch must rollback context on failure');
assert(actions.includes('resetContextScopedQueries'), 'context switch must reset context scoped caches');
assert(actions.includes("track('confirmation', 'context:estrutura_trocada'"), 'context switch must track confirmation');

const switcher = read('shared/components/ContextSwitcher.tsx');
assert(switcher.includes("track('entrance', 'context:switcher_open'"), 'context switcher must track entrance when opened');
assert(switcher.includes('Contexto atual'), 'context switcher must label current context');
assert(switcher.includes('grupoNome'), 'context switcher must show current group when available');

const selectionScreen = read('features/context/screens/StructureSelectionScreen.tsx');
assert(selectionScreen.includes('useContextActions'), 'structure selection route must use context switching action');
assert(selectionScreen.includes('switchEstrutura'), 'structure selection route must call switchEstrutura');

const appShell = read('shared/components/AppShell.tsx');
assert(appShell.includes('ContextSwitcher'), 'authenticated shell must expose ContextSwitcher');

const manifest = read('docs/parity-manifest.md');
assert(manifest.includes('context-switch-foundation'), 'parity manifest must track context switch foundation');

if (failures.length > 0) {
  console.error('[validate-context-switching] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-context-switching] OK');
