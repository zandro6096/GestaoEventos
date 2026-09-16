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
const audit = read('docs/jornada-parity-audit.md');
const manifest = read('docs/parity-manifest.md');
const routeAnalytics = read('shared/components/RouteAnalyticsTracker.tsx');
const analyticsService = read('services/analytics/analytics.service.ts');
const hook = read('features/jornada/hooks/useJornada.ts');
const screen = read('features/jornada/screens/JornadaScreen.tsx');
const permissionGuard = read('shared/guards/RequirePermission.tsx');
const successFixture = readJson('tests/fixtures/jornada/success.json');
const emptyFixture = readJson('tests/fixtures/jornada/empty.json');
const errorFixture = readJson('tests/fixtures/jornada/error.json');
const forbiddenFixture = readJson('tests/fixtures/jornada/forbidden.json');
const mobileFixture = readJson('tests/fixtures/jornada/mobile.json');
const webFixture = readJson('tests/fixtures/jornada/web.json');

assert(
  packageJson.scripts?.['check:jornada-parity'] === 'node scripts/validate-jornada-parity-smoke.mjs',
  'Missing check:jornada-parity script',
);
assert(
  packageJson.scripts?.['test:scaffold']?.includes('validate-jornada-parity-smoke.mjs'),
  'test:scaffold must include jornada parity smoke validation',
);

for (const term of [
  'Angular baseline',
  'React coverage',
  'Endpoint coverage',
  'Known gaps',
  'Smoke evidence',
  'Analytics evidence',
]) {
  assert(audit.includes(term), `audit doc missing section: ${term}`);
}

assert(routeAnalytics.includes('trackRouteVisualization'), 'route visualization must stay automatic');
assert(analyticsService.includes('UnsafeAnalyticsDetailError'), 'analytics service must keep unsafe detail guard');
assert(hook.includes("track('simulation', 'jornada:carregar_dados'"), 'jornada load must emit simulation');
assert(hook.includes("track('confirmation', 'jornada:carregar_sucesso'"), 'jornada load must emit confirmation');
assert(hook.includes("track('click', 'jornada:carregar_erro'"), 'jornada load errors must be instrumented');
assert(screen.includes("track('entrance', 'btn:abrir_evento'"), 'open event action must emit entrance');
assert(screen.includes("track('simulation', 'jornada:evento_abrir_submit'"), 'open event action must emit simulation');
assert(screen.includes("track('confirmation', 'jornada:evento_abrir_success'"), 'open event action must emit confirmation');
assert(screen.includes("track('entrance', 'btn:abrir_pendencia'"), 'open pendency action must emit entrance');
assert(screen.includes("track('simulation', 'jornada:pendencia_abrir_submit'"), 'open pendency action must emit simulation');
assert(screen.includes("track('confirmation', 'jornada:pendencia_abrir_success'"), 'open pendency action must emit confirmation');
assert(screen.includes('extra: {'), 'analytics IDs/counts must be sent through extra when needed');
assert(!screen.includes('window.dataLayer'), 'screen must not push dataLayer directly');
assert(permissionGuard.includes('RequirePermission'), 'permission insufficient state must be covered through permission guard');

assert(successFixture.route === '/jornada', 'success fixture must target /jornada');
assert(successFixture.context?.estruturaId > 0, 'success fixture must include active estrutura context');
assert(successFixture.data?.ocorrencias?.length > 0, 'success fixture must include occurrence data');
assert(successFixture.data?.participacoes?.length > 0, 'success fixture must include participation data');
assert(successFixture.data?.frequencia?.totalParticipacoes > 0, 'success fixture must include frequency data');
assert(successFixture.data?.pendencias?.total >= 0, 'success fixture must include pendency summary');
assert(emptyFixture.data?.ocorrencias?.length === 0, 'empty fixture must cover empty occurrences');
assert(emptyFixture.data?.participacoes?.length === 0, 'empty fixture must cover empty participation history');
assert(errorFixture.error?.status === 500, 'error fixture must cover backend failure');
assert(forbiddenFixture.error?.status === 403, 'forbidden fixture must cover permission insufficient state');
assert(mobileFixture.viewport?.width < 768, 'mobile fixture must cover mobile width');
assert(webFixture.viewport?.width >= 1024, 'web fixture must cover desktop width');

assert(manifest.includes('journey-parity-go-live-evidence'), 'parity manifest must include go-live evidence row');
assert(manifest.includes('check:jornada-parity'), 'parity manifest must record parity smoke evidence');

const trackDetailPattern = /track\('[^']+',\s*'([^']+)'/g;
for (const file of [hook, screen]) {
  for (const match of file.matchAll(trackDetailPattern)) {
    const detail = match[1];
    assert(!/:\d/.test(detail), `analytics detail must not embed IDs: ${detail}`);
    assert(!/@/.test(detail), `analytics detail must not embed email-like values: ${detail}`);
  }
}

if (failures.length > 0) {
  console.error('[validate-jornada-parity-smoke] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-jornada-parity-smoke] OK');
