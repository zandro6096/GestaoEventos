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
const appTheme = read('shared/theme/app-theme.ts');
const appThemeIndex = read('shared/theme/index.ts');
const appShell = read('shared/components/AppShell.tsx');
const appNavigation = read('shared/components/AppNavigation.tsx');
const appLayout = read('app/(app)/_layout.tsx');
const indexRoute = read('app/index.tsx');
const profileRoute = read('app/(app)/perfil.tsx');
const manifest = read('docs/parity-manifest.md');

assert(packageJson.scripts?.['check:shell'] === 'node scripts/validate-shell-layout.mjs', 'Missing check:shell script');
assert(packageJson.scripts?.['test:scaffold']?.includes('validate-shell-layout.mjs'), 'test:scaffold must include shell validation');

for (const exportName of ['appTheme', 'layoutMetrics', 'primaryNavigationItems', 'secondaryNavigationItems']) {
  assert(appTheme.includes(exportName), `app theme must export ${exportName}`);
}

assert(appThemeIndex.includes("from './app-theme'"), 'shared/theme/index.ts must re-export app-theme');

for (const metric of ['sidebarWidth', 'bottomNavHeight', 'mobileHeaderHeight', 'contentMaxWidth', 'desktopBreakpoint']) {
  assert(appTheme.includes(metric), `layout metric missing: ${metric}`);
}

for (const label of ['Jornada', 'Eventos', 'Grupos', 'Painel', 'Perfil', 'Configuracoes']) {
  assert(appTheme.includes(label) || appNavigation.includes(label), `navigation label missing: ${label}`);
}

assert(appShell.includes('useWindowDimensions'), 'AppShell must adapt by viewport dimensions');
assert(appShell.includes('AppNavigation'), 'AppShell must render AppNavigation');
assert(appShell.includes('ContextSwitcher'), 'AppShell must expose active context');
assert(appShell.includes('Slot'), 'AppShell must render the route Slot');
assert(appShell.includes('bottomNavHeight'), 'AppShell must reserve mobile bottom navigation space');
assert(appShell.includes('sidebarWidth'), 'AppShell must reserve desktop sidebar space');

assert(appNavigation.includes('Ionicons'), 'AppNavigation must render recognizable icons');
assert(appNavigation.includes('can('), 'AppNavigation must filter protected entries through permission facade');
assert(appNavigation.includes('usePathname'), 'AppNavigation must reflect the active route');
assert(appNavigation.includes('router.push'), 'AppNavigation must navigate through Expo Router');
assert(appTheme.includes("href: '/eventos/meus'"), 'mobile Eventos navigation must open Meus Eventos');

assert(appLayout.includes('AppShell'), 'authenticated app layout must render AppShell');
assert(appLayout.includes('context-required'), 'authenticated app layout must preserve context-required flow');
assert(indexRoute.includes('Redirect'), 'root route must redirect into the functional app flow');
assert(!indexRoute.includes('ScaffoldHome'), 'root route must not render the scaffold visual screen');
assert(profileRoute.includes('RequirePermission'), 'profile route must be protected by permission facade');

assert(manifest.includes('responsive-shell-foundation'), 'parity manifest must include responsive-shell-foundation');
assert(manifest.includes('check:shell'), 'parity manifest must record shell validation evidence');

if (failures.length > 0) {
  console.error('[validate-shell-layout] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-shell-layout] OK');
