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
const service = read('features/eventos/services/eventos.service.ts');
const hook = read('features/eventos/hooks/useEventos.ts');
const screen = read('features/eventos/screens/EventosListScreen.tsx');
const publicRoute = read('app/(app)/eventos/index.tsx');
const adminRoute = read('app/(app)/admin/eventos.tsx');
const queryKeys = read('services/query/query-keys.ts');
const manifest = read('docs/parity-manifest.md');
const parityDoc = read('docs/eventos-list-parity.md');
const successFixture = readJson('tests/fixtures/eventos/list-success.json');
const emptyFixture = readJson('tests/fixtures/eventos/list-empty.json');
const errorFixture = readJson('tests/fixtures/eventos/list-error.json');
const mobileFixture = readJson('tests/fixtures/eventos/list-mobile.json');
const webFixture = readJson('tests/fixtures/eventos/list-web.json');

assert(packageJson.scripts?.['check:eventos-list'] === 'node scripts/validate-eventos-list.mjs', 'Missing check:eventos-list script');
assert(packageJson.scripts?.['test:scaffold']?.includes('validate-eventos-list.mjs'), 'test:scaffold must include eventos list validation');

for (const endpoint of ['/api/eventos', '/api/ocorrencias']) {
  assert(api.includes(`apiRoute('${endpoint}')`), `eventos API must call ${endpoint}`);
}

for (const param of ['page_number', 'page_size', 'estrutura_id', 'grupo_id', 'include_canceladas', 'data_inicio', 'data_fim']) {
  assert(api.includes(param), `eventos API must send snake_case param ${param}`);
}

assert(api.includes('httpClient'), 'eventos API must reuse httpClient');
assert(api.includes('toCamelCase'), 'eventos API must normalize backend response case');
assert(api.includes('EventoDto'), 'eventos API must define EventoDto');
assert(api.includes('OcorrenciaDto'), 'eventos API must define OcorrenciaDto');

assert(service.includes("tipo: 'evento'"), 'eventos service must expose planned event items');
assert(service.includes("tipo: 'ocorrencia'"), 'eventos service must expose occurrence items');
assert(service.includes('includeCanceladas: true'), 'occurrence history must include cancelled occurrences');
assert(service.includes('filterEventos'), 'eventos service must apply supported client filters');
assert(service.toLowerCase().includes('cancelad'), 'eventos service must preserve cancelled history state');

assert(queryKeys.includes('eventos'), 'query keys must include eventos scope');
assert(hook.includes('useQuery'), 'eventos hook must use React Query');
assert(hook.includes('queryKeys.eventos'), 'eventos hook must use eventos query keys');
assert(hook.includes('estruturaId'), 'eventos hook must read active estrutura scope');
assert(hook.includes('grupoId'), 'eventos hook must include active group scope when available');
assert(hook.includes('filters'), 'eventos hook must keep filters in query key');
assert(hook.includes("track('entrance', 'eventos:listar_entrada'"), 'event list load must emit entrance');
assert(hook.includes("track('simulation', 'eventos:filtro_aplicar'"), 'event filters must emit simulation');
assert(hook.includes("track('confirmation', 'eventos:listar_sucesso'"), 'successful list load must emit confirmation');

assert(screen.includes('useWindowDimensions'), 'EventosListScreen must adapt by viewport dimensions');
assert(screen.includes('layoutMetrics.desktopBreakpoint'), 'EventosListScreen must use shared desktop breakpoint');
assert(screen.includes('Eventos'), 'EventosListScreen must render event list title');
assert(screen.includes('Periodo'), 'EventosListScreen must render period filter');
assert(screen.includes('Status'), 'EventosListScreen must render status filter');
assert(screen.includes('Tipo'), 'EventosListScreen must render type filter');
assert(screen.includes('Responsavel'), 'EventosListScreen must render responsible filter');
assert(screen.includes('Grupo'), 'EventosListScreen must render group filter');
assert(screen.includes('handleApplyFilters'), 'EventosListScreen must expose filter apply flow');
assert(screen.includes('handleClearFilters'), 'EventosListScreen must expose filter clear flow');
assert(screen.includes('minHeight: 44'), 'EventosListScreen buttons must keep touch target floor');
assert(screen.includes('CANCELADO'), 'EventosListScreen must display cancelled state');
assert(screen.includes('router.push'), 'EventosListScreen must navigate to next event flows');
assert(!screen.includes('horizontal={true}'), 'EventosListScreen must not rely on wide horizontal table scrolling');

assert(publicRoute.includes('EventosListScreen'), 'public eventos route must render EventosListScreen');
assert(adminRoute.includes('EventosListScreen'), 'admin eventos route must render EventosListScreen');
assert(adminRoute.includes('RequirePermission'), 'admin eventos route must keep permission guard');

for (const section of ['Angular baseline', 'React coverage', 'Endpoint coverage', 'Known gaps', 'Smoke evidence']) {
  assert(parityDoc.includes(section), `eventos parity doc missing section: ${section}`);
}

assert(successFixture.route === '/admin/eventos', 'success fixture must target /admin/eventos');
assert(successFixture.context?.estruturaId > 0, 'success fixture must include active estrutura context');
assert(successFixture.data?.eventos?.length > 0, 'success fixture must include event data');
assert(successFixture.data?.ocorrencias?.some((item) => item.cancelada === true), 'success fixture must preserve cancelled occurrence');
assert(emptyFixture.data?.eventos?.length === 0, 'empty fixture must cover empty event list');
assert(errorFixture.error?.status === 500, 'error fixture must cover backend failure');
assert(mobileFixture.viewport?.width < 768, 'mobile fixture must cover mobile width');
assert(webFixture.viewport?.width >= 1024, 'web fixture must cover desktop width');

assert(manifest.includes('events-list-filter-foundation'), 'parity manifest must include event list foundation row');
assert(manifest.includes('check:eventos-list'), 'parity manifest must record event list validation evidence');

const trackDetailPattern = /track\('[^']+',\s*'([^']+)'/g;
for (const file of [hook, screen]) {
  for (const match of file.matchAll(trackDetailPattern)) {
    const detail = match[1];
    assert(!/:\d/.test(detail), `analytics detail must not embed IDs: ${detail}`);
    assert(!/@/.test(detail), `analytics detail must not embed email-like values: ${detail}`);
  }
}

if (failures.length > 0) {
  console.error('[validate-eventos-list] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-eventos-list] OK');
