import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const failures = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function read(path) {
  const fullPath = join(root, path);
  assert(existsSync(fullPath), `Missing required file: ${path}`);
  return existsSync(fullPath) ? readFileSync(fullPath, 'utf8') : '';
}

function readJson(path) {
  const content = read(path);
  if (!content) return {};

  try {
    return JSON.parse(content);
  } catch {
    fail(`Invalid JSON file: ${path}`);
    return {};
  }
}

const packageJson = JSON.parse(read('package.json'));
const api = read('services/api/eventos-api.ts');
const service = read('features/eventos/meus-eventos/services/meus-eventos.service.ts');
const hook = read('features/eventos/meus-eventos/hooks/useMeusEventos.ts');
const screen = read('features/eventos/meus-eventos/screens/MeusEventosScreen.tsx');
const ocorrenciasApi = read('services/api/ocorrencias-api.ts');
const publicRoute = read('app/(app)/eventos/meus.tsx');
const adminRoute = read('app/(app)/admin/eventos/meus.tsx');
const queryKeys = read('services/query/query-keys.ts');
const manifest = read('docs/parity-manifest.md');
const parityDoc = read('docs/meus-eventos-parity.md');
const successFixture = readJson('tests/fixtures/eventos/meus-success.json');
const emptyFixture = readJson('tests/fixtures/eventos/meus-empty.json');
const errorFixture = readJson('tests/fixtures/eventos/meus-error.json');
const contextFixture = readJson('tests/fixtures/eventos/meus-context-switch.json');
const mobileFixture = readJson('tests/fixtures/eventos/meus-mobile.json');

assert(packageJson.scripts?.['check:meus-eventos'] === 'node scripts/validate-meus-eventos.mjs', 'Missing check:meus-eventos script');
assert(packageJson.scripts?.['test:scaffold']?.includes('validate-meus-eventos.mjs'), 'test:scaffold must include meus eventos validation');

for (const endpoint of ['/api/ocorrencias', '/api/eventos/configuracoes']) {
  assert(api.includes(`apiRoute('${endpoint}')`), `eventos API must call ${endpoint}`);
}

for (const fragment of ['/api/ocorrencias/${ocorrenciaId}/confirmacao-responsavel', '/api/ocorrencias/${ocorrenciaId}/status']) {
  assert(api.includes(fragment), `eventos API must expose mutation route ${fragment}`);
}

for (const param of ['usuario_id', 'estrutura_id', 'responsavel_id', 'include_canceladas']) {
  assert(api.includes(param), `eventos API must send snake_case param ${param}`);
}

assert(api.includes('EventoConfiguracaoDto'), 'eventos API must define EventoConfiguracaoDto');
assert(api.includes('ConfirmacaoResponsavelDto'), 'eventos API must define ConfirmacaoResponsavelDto');

assert(service.includes('listarConfiguracoesPorResponsavel'), 'meus eventos service must use responsible configuration contract');
assert(service.includes('includeCanceladas: true'), 'meus eventos service must include cancelled occurrences');
assert(service.includes('aAcompanhar'), 'meus eventos service must separate follow-up section');
assert(service.includes('futuros'), 'meus eventos service must separate future section');
assert(service.includes('historico'), 'meus eventos service must separate history section');
assert(service.toLowerCase().includes('cancelad'), 'meus eventos service must preserve cancelled history state');
assert(service.includes('filterByUserRelation'), 'meus eventos service must filter user related data');
assert(service.includes('obterJanelaMes'), 'meus eventos service must expose month window loading');
assert(service.includes('obterJanelaAno'), 'meus eventos service must expose explicit year window loading');
assert(service.includes('listarTodasOcorrencias'), 'meus eventos service must consume all occurrence pages');
assert(service.includes('maxOccurrencePages'), 'meus eventos service must guard paginated occurrence loading');
assert(service.includes('mergeMeusEventos'), 'meus eventos service must merge incremental month results');

assert(queryKeys.includes('meus'), 'query keys must include eventos.meus scope');
assert(queryKeys.includes('gruposFiltro'), 'query keys must include the lightweight group selector scope');
assert(hook.includes('useQuery'), 'meus eventos hook must use React Query');
assert(hook.includes('useMutation'), 'meus eventos hook must use React Query mutations');
assert(hook.includes('queryKeys.eventos.meus'), 'meus eventos hook must use scoped meus query key');
assert(hook.includes('estruturaId'), 'meus eventos hook must read active estrutura scope');
assert(hook.includes('grupoId'), 'meus eventos hook must include active group scope when available');
assert(hook.includes('assertOnlineForMutation'), 'meus eventos mutations must be blocked offline');
assert(hook.includes("track('entrance', 'meus_eventos:entrada'"), 'meus eventos load must emit entrance');
assert(hook.includes("track('confirmation', 'meus_eventos:carregar_sucesso'"), 'meus eventos successful load must emit confirmation');
assert(hook.includes("track('entrance', 'btn:meus_eventos_abrir'"), 'meus eventos open action must emit entrance');
assert(hook.includes('loadedMonthKeys'), 'meus eventos hook must deduplicate month requests');
assert(hook.includes('loadMonth'), 'meus eventos hook must load months on demand');
assert(hook.includes('loadYear'), 'meus eventos hook must load the year only after explicit selection');
assert(hook.includes('requiresGroupSelection'), 'meus eventos hook must gate broad loads when there are many groups');
assert(hook.includes('gruposApi.list'), 'meus eventos hook must load group options separately from occurrences');

assert(ocorrenciasApi.includes('ciclosCache'), 'event cycles API must keep an in-memory request cache');
assert(ocorrenciasApi.includes('ciclosCache.get(eventoId)'), 'event cycles API must reuse requests by event');

for (const label of ['Meus Eventos', 'Acompanhar', 'Futuros', 'Historico', 'Cancelar', 'Confirmar visita']) {
  assert(screen.includes(label), `MeusEventosScreen must render label: ${label}`);
}

assert(screen.includes('useWindowDimensions'), 'MeusEventosScreen must adapt by viewport dimensions');
assert(screen.includes('layoutMetrics.desktopBreakpoint'), 'MeusEventosScreen must use shared desktop breakpoint');
assert(screen.includes('loading'), 'MeusEventosScreen must represent loading state');
assert(screen.includes('empty'), 'MeusEventosScreen must represent empty state');
assert(screen.includes('error'), 'MeusEventosScreen must represent error state');
assert(screen.includes('router.push'), 'MeusEventosScreen must navigate to event flows');
assert(screen.includes('handleConfirmVisit'), 'MeusEventosScreen must expose confirm visit action');
assert(screen.includes('handleCancelOccurrence'), 'MeusEventosScreen must expose cancel action');
assert(screen.includes('Escolha um grupo para continuar'), 'MeusEventosScreen must request group selection for broad contexts');
assert(screen.includes('minHeight: 44'), 'MeusEventosScreen buttons must keep touch target floor');
assert(!screen.includes('horizontal={true}'), 'MeusEventosScreen must not rely on wide horizontal table scrolling');

assert(publicRoute.includes('MeusEventosScreen'), 'public meus eventos route must render MeusEventosScreen');
assert(adminRoute.includes('MeusEventosScreen'), 'admin meus eventos route must render MeusEventosScreen');
assert(adminRoute.includes('RequirePermission'), 'admin meus eventos route must keep permission guard');

for (const section of ['Angular baseline', 'React coverage', 'Endpoint coverage', 'Known gaps', 'Smoke evidence']) {
  assert(parityDoc.includes(section), `meus eventos parity doc missing section: ${section}`);
}

assert(successFixture.route === '/admin/eventos/meus', 'success fixture must target /admin/eventos/meus');
assert(successFixture.context?.estruturaId > 0, 'success fixture must include active estrutura context');
assert(successFixture.sections?.aAcompanhar?.length > 0, 'success fixture must include follow-up section');
assert(successFixture.sections?.futuros?.length > 0, 'success fixture must include future section');
assert(successFixture.sections?.historico?.some((item) => item.cancelada === true), 'success fixture must preserve cancelled history item');
assert(emptyFixture.sections?.aAcompanhar?.length === 0, 'empty fixture must cover empty follow-up section');
assert(errorFixture.error?.status === 500, 'error fixture must cover backend failure');
assert(contextFixture.previousContext?.estruturaId !== contextFixture.nextContext?.estruturaId, 'context fixture must cover structure switch');
assert(contextFixture.expected?.staleDataVisible === false, 'context fixture must assert stale data stays hidden');
assert(mobileFixture.viewport?.width < 768, 'mobile fixture must cover mobile width');

assert(manifest.includes('my-events-foundation'), 'parity manifest must include my events foundation row');
assert(manifest.includes('check:meus-eventos'), 'parity manifest must record meus eventos validation evidence');

const trackDetailPattern = /track\('[^']+',\s*'([^']+)'/g;
for (const file of [hook, screen]) {
  for (const match of file.matchAll(trackDetailPattern)) {
    const detail = match[1];
    assert(!/:\d/.test(detail), `analytics detail must not embed IDs: ${detail}`);
    assert(!/@/.test(detail), `analytics detail must not embed email-like values: ${detail}`);
  }
}

if (failures.length > 0) {
  console.error('[validate-meus-eventos] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-meus-eventos] OK');
