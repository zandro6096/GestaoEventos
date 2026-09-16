import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const store = read('stores/network.store.ts');
const guard = read('services/offline/mutation-guard.ts');
const provider = read('services/network/NetworkStatusProvider.tsx');
const layout = read('app/_layout.tsx');
const banner = read('shared/components/OfflineBanner.tsx');
const docs = read('docs/offline-policy.md');
const smoke = read('tests/offline-policy.smoke.cjs');

if (!store.includes('isInternetReachable !== true')) throw new Error('estado desconhecido deve bloquear mutacoes');
if (!guard.includes('OfflineMutationBlockedError') || !guard.includes('getNetworkSnapshot')) throw new Error('guard offline incompleto');
if (!provider.includes('onlineManager.setOnline')) throw new Error('provider nao sincroniza onlineManager');
if (!layout.includes("networkMode: 'offlineFirst'") || !layout.includes("networkMode: 'always'")) throw new Error('QueryClient sem politica offline explicita');
if (!banner.includes('Dados podem estar desatualizados')) throw new Error('banner nao comunica cache potencialmente desatualizado');
if (!docs.includes('Nao existe fila local de escrita')) throw new Error('politica offline nao documenta ausencia de fila');
if (!smoke.includes('setOffline(true)') || !smoke.includes('setOffline(false)')) throw new Error('smoke offline nao cobre retorno da rede');
if (!smoke.includes('writes, 0')) throw new Error('smoke offline nao verifica ausencia de chamada de escrita');

const mutationFiles = [
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
for (const file of mutationFiles) {
  if (!read(file).includes('assertOnlineForMutation')) throw new Error(`mutacao sem guard: ${file}`);
}

console.log('[validate-offline-policy] OK');
