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
const screen = read('features/jornada/screens/JornadaScreen.tsx');
const actionPanel = read('features/jornada/components/JornadaActionPanel.tsx');
const tabs = read('features/jornada/components/JornadaSectionTabs.tsx');
const hook = read('features/jornada/hooks/useJornada.ts');
const service = read('features/jornada/services/jornada.service.ts');
const queryKeys = read('services/query/query-keys.ts');
const manifest = read('docs/parity-manifest.md');

assert(
  packageJson.scripts?.['check:jornada-responsive'] === 'node scripts/validate-jornada-responsive.mjs',
  'Missing check:jornada-responsive script',
);
assert(
  packageJson.scripts?.['test:scaffold']?.includes('validate-jornada-responsive.mjs'),
  'test:scaffold must include jornada responsive validation',
);

assert(screen.includes('useWindowDimensions'), 'JornadaScreen must adapt by viewport dimensions');
assert(screen.includes('layoutMetrics.desktopBreakpoint'), 'JornadaScreen must use shared desktop breakpoint');
assert(screen.includes('JornadaSectionTabs'), 'JornadaScreen must expose section tabs');
assert(screen.includes('JornadaActionPanel'), 'JornadaScreen must expose detail/action panel');
assert(screen.includes('selectedTarget'), 'JornadaScreen must keep selected detail target');
assert(screen.includes('activeView'), 'JornadaScreen must support focused section filtering');
assert(screen.includes('isFetching'), 'JornadaScreen must show background refresh without major layout shift');
assert(screen.includes('assertOnlineForMutation'), 'JornadaScreen must block mutable actions while offline');
assert(screen.includes('can('), 'JornadaScreen actions must use permission facade');
assert(screen.includes('router.push'), 'JornadaScreen actions must navigate through Expo Router');
assert(screen.includes('handleOpenEvento'), 'JornadaScreen must implement open event action');
assert(screen.includes('handleMutableAction'), 'JornadaScreen must implement attendance action');
assert(screen.includes('expandedPendenciaGrupoId'), 'JornadaScreen must keep the expanded pendency group');
assert(screen.includes('onToggle'), 'JornadaScreen must expose the pendency accordion toggle');
assert(hook.includes('isFetching'), 'jornada hook must expose background fetching state');

assert(actionPanel.includes('sheet'), 'JornadaActionPanel must include mobile sheet styling');
assert(actionPanel.includes('sidePanel'), 'JornadaActionPanel must include desktop panel styling');
assert(actionPanel.includes('actionBlockedMessage'), 'JornadaActionPanel must explain unavailable actions');
assert(actionPanel.includes('accessibilityRole="button"'), 'JornadaActionPanel buttons must be accessible');
assert(actionPanel.includes('minHeight: 44'), 'JornadaActionPanel buttons must keep touch target floor');

assert(tabs.includes('accessibilityRole="tab"'), 'JornadaSectionTabs must expose tab semantics');
assert(tabs.includes('minHeight: 44'), 'JornadaSectionTabs must keep touch target floor');
assert(tabs.includes('adjustsFontSizeToFit'), 'JornadaSectionTabs labels must fit small screens');

assert(service.includes('getPendenciasDetalhe'), 'jornada service must expose pendency detail lookup');
assert(queryKeys.includes('pendenciasDetalhe'), 'query keys must include pendency detail scope');
assert(manifest.includes('journey-responsive-actions-foundation'), 'parity manifest must include responsive actions foundation');
assert(manifest.includes('check:jornada-responsive'), 'parity manifest must record responsive validation evidence');

if (failures.length > 0) {
  console.error('[validate-jornada-responsive] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-jornada-responsive] OK');
