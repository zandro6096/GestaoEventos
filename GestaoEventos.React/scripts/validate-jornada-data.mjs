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

const packageJson = JSON.parse(read('package.json'));
const api = read('services/api/jornada-api.ts');
const service = read('features/jornada/services/jornada.service.ts');
const hook = read('features/jornada/hooks/useJornada.ts');
const screen = read('features/jornada/screens/JornadaScreen.tsx');
const jornadaRoute = read('app/(app)/jornada.tsx');
const adminRoute = read('app/(app)/admin/jornada.tsx');
const queryKeys = read('services/query/query-keys.ts');
const manifest = read('docs/parity-manifest.md');

assert(packageJson.scripts?.['check:jornada'] === 'node scripts/validate-jornada-data.mjs', 'Missing check:jornada script');
assert(packageJson.scripts?.['test:scaffold']?.includes('validate-jornada-data.mjs'), 'test:scaffold must include jornada validation');

for (const endpoint of [
  "/api/participacoes",
  "/api/participacoes/frequencia",
  "/api/pendencias/minhas/resumo",
  "/api/pendencias/minhas",
  "/api/ocorrencias",
]) {
  assert(api.includes(`apiRoute('${endpoint}')`), `jornada API must call ${endpoint}`);
}

for (const param of ['usuario_id', 'estrutura_id', 'grupo_id', 'data_inicio', 'periodo_dias', 'somente_participante']) {
  assert(api.includes(param), `jornada API must send snake_case param ${param}`);
}

assert(api.includes('httpClient'), 'jornada API must reuse httpClient');
assert(api.includes('toCamelCase'), 'jornada API must normalize backend response case');

for (const mapper of ['getEventosHoje', 'getFrequencia', 'getHistorico', 'getProximasReunioes', 'getPendenciasResumo']) {
  assert(service.includes(mapper), `jornada service missing ${mapper}`);
}

assert(service.includes('jaFezCheckin'), 'jornada service must map personal check-in state');
assert(service.includes('somenteParticipante: true'), 'jornada service must request only user participation occurrences');
assert(service.includes('throw'), 'jornada service must not mask operational failures as empty success');

assert(queryKeys.includes('jornada'), 'query keys must include jornada scope');
assert(hook.includes('useQuery'), 'jornada hook must use React Query');
assert(hook.includes('queryKeys.jornada'), 'jornada hook must use jornada query keys');
assert(hook.includes('estruturaId'), 'jornada hook must read active estrutura scope');
assert(hook.includes('grupoId'), 'jornada hook must include active group scope when available');
assert(hook.includes('contextError'), 'jornada hook must expose missing context error state');
assert(hook.includes('refetchAll'), 'jornada hook must expose actionable retry');

for (const state of ['LoadingState', 'ErrorState', 'EmptyState', 'PartialErrorBanner']) {
  assert(screen.includes(state), `jornada screen missing ${state}`);
}

for (const label of ['Minha Jornada', 'Precisa de voce', 'Eventos de hoje', 'Minha frequencia', 'Proximas reunioes', 'Historico']) {
  assert(screen.includes(label), `jornada screen missing section label: ${label}`);
}

assert(jornadaRoute.includes('JornadaScreen'), 'public jornada app route must render JornadaScreen');
assert(adminRoute.includes('JornadaScreen'), 'admin jornada alias must render JornadaScreen');
assert(manifest.includes('journey-real-data-foundation'), 'parity manifest must include journey-real-data-foundation');
assert(manifest.includes('check:jornada'), 'parity manifest must record jornada validation evidence');

if (failures.length > 0) {
  console.error('[validate-jornada-data] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-jornada-data] OK');
