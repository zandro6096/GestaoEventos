const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('estado desconhecido nao libera escrita', () => {
  const source = read('stores/network.store.ts');
  assert.match(source, /isInternetReachable !== true/);
  assert.match(read('services/offline/mutation-guard.ts'), /OfflineMutationBlockedError/);
});

test('React Query permite cache de leitura e rejeicao imediata de mutacao', () => {
  const source = read('app/_layout.tsx');
  assert.match(source, /networkMode: 'offlineFirst'/);
  assert.match(source, /networkMode: 'always'/);
});

test('todas as mutacoes conhecidas passam pelo guard e nao criam fila', () => {
  const files = [
    'features/auth/services/public-auth.service.ts',
    'features/eventos/iniciar-evento/useInicioEvento.ts',
    'features/eventos/acompanhamento/useAcompanhamento.ts',
    'features/eventos/presenca/usePresenca.ts',
    'features/eventos/meus-eventos/hooks/useMeusEventos.ts',
    'features/grupos/membros/useGrupoMembros.ts',
    'features/admin/membros/useAdminMembros.ts',
    'features/admin/papeis-permissoes/usePapeisAdmin.ts',
    'features/admin/tipos/useTiposAdmin.ts',
    'features/admin/assinatura/useAssinaturaAdmin.ts',
  ];
  for (const file of files) assert.match(read(file), /assertOnlineForMutation/);
  assert.doesNotMatch(read('services/offline/mutation-guard.ts'), /queue|enqueue|persist/);
});
