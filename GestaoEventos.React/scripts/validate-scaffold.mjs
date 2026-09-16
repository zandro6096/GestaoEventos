import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve('.');
const failures = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

function listFiles(dir) {
  const absolute = join(root, dir);
  if (!existsSync(absolute)) return [];

  const result = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const child = join(absolute, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.expo' || entry.name === 'dist') continue;
    if (entry.isDirectory()) {
      result.push(...listFiles(relative(root, child)));
      continue;
    }
    if (entry.isFile()) result.push(relative(root, child).replaceAll('\\', '/'));
  }

  return result;
}

const requiredFiles = [
  'package.json',
  'app.json',
  'tsconfig.json',
  'babel.config.js',
  'eslint.config.js',
  '.env.example',
  'app/_layout.tsx',
  'app/index.tsx',
  'app/(auth)/_layout.tsx',
  'app/(app)/_layout.tsx',
  'app/(app)/jornada.tsx',
  'app/(app)/eventos/index.tsx',
  'app/(app)/eventos/meus.tsx',
  'app/(app)/admin/eventos/meus.tsx',
  'shared/design/tokens.ts',
  'shared/theme/app-theme.ts',
  'shared/theme/index.ts',
  'shared/components/ApiConfigNotice.tsx',
  'shared/components/AppNavigation.tsx',
  'shared/components/AppShell.tsx',
  'shared/components/ContextSwitcher.tsx',
  'shared/components/OfflineBanner.tsx',
  'shared/components/RouteAnalyticsTracker.tsx',
  'shared/components/ScaffoldHome.tsx',
  'services/api/api-config.ts',
  'services/api/api-error.ts',
  'services/api/auth-api.ts',
  'services/api/case-conversion.ts',
  'services/api/contexto-api.ts',
  'services/api/http-client.ts',
  'services/api/jornada-api.ts',
  'services/api/eventos-api.ts',
  'services/api/permissoes-api.ts',
  'services/analytics/analytics.service.ts',
  'services/analytics/analytics.types.ts',
  'services/network/NetworkStatusProvider.tsx',
  'services/offline/mutation-guard.ts',
  'services/platform/analytics-provider/contract.ts',
  'services/platform/analytics-provider/index.android.ts',
  'services/platform/analytics-provider/index.ios.ts',
  'services/platform/analytics-provider/index.web.ts',
  'services/platform/network/contract.ts',
  'services/platform/network/index.android.ts',
  'services/platform/network/index.ios.ts',
  'services/platform/network/index.web.ts',
  'services/platform/secure-storage/contract.ts',
  'services/platform/secure-storage/index.android.ts',
  'services/platform/secure-storage/index.ios.ts',
  'services/platform/secure-storage/index.web.ts',
  'services/query/query-keys.ts',
  'services/query/context-query-client.ts',
  'services/session/context-selection.service.ts',
  'services/session/auth-session.service.ts',
  'services/permissions/permission.facade.ts',
  'services/permissions/permission.types.ts',
  'features/jornada/hooks/useJornada.ts',
  'features/jornada/hooks/usePendenciasDetalhe.ts',
  'features/jornada/components/JornadaActionPanel.tsx',
  'features/jornada/components/JornadaSectionTabs.tsx',
  'features/jornada/screens/JornadaScreen.tsx',
  'features/jornada/services/jornada.service.ts',
  'features/eventos/hooks/useEventos.ts',
  'features/eventos/screens/EventosListScreen.tsx',
  'features/eventos/services/eventos.service.ts',
  'features/eventos/meus-eventos/hooks/useMeusEventos.ts',
  'features/eventos/meus-eventos/screens/MeusEventosScreen.tsx',
  'features/eventos/meus-eventos/services/meus-eventos.service.ts',
  'features/eventos/acompanhamento/acompanhamento.rules.ts',
  'features/eventos/acompanhamento/acompanhamento.service.ts',
  'features/eventos/acompanhamento/useAcompanhamento.ts',
  'features/eventos/acompanhamento/AcompanhamentoScreen.tsx',
  'services/api/grupos-api.ts',
  'features/grupos/grupos.rules.ts',
  'features/grupos/useGrupos.ts',
  'features/grupos/GruposScreen.tsx',
  'features/grupos/detalhe/detalhe.service.ts',
  'features/grupos/detalhe/useGrupoDetalhe.ts',
  'features/grupos/detalhe/GrupoDetalheScreen.tsx',
  'app/(app)/admin/grupos.tsx',
  'app/(app)/admin/grupos/[id].tsx',
  'app/(app)/grupos/index.tsx',
  'services/api/grupos-membros-api.ts',
  'services/api/responsaveis-grupo-api.ts',
  'services/api/usuarios-estrutura-api.ts',
  'services/api/usuarios-virtuais-api.ts',
  'features/grupos/membros/membros.rules.ts',
  'features/grupos/membros/membros.service.ts',
  'features/grupos/membros/useGrupoMembros.ts',
  'services/api/participacoes-evento-api.ts',
  'features/eventos/presenca/presenca.rules.ts',
  'features/eventos/presenca/presenca.service.ts',
  'features/eventos/presenca/usePresenca.ts',
  'stores/auth.store.ts',
  'stores/context.store.ts',
  'stores/permission.store.ts',
  'stores/network.store.ts',
  'shared/guards/RequirePermission.tsx',
  'scripts/validate-jornada-data.mjs',
  'scripts/validate-jornada-responsive.mjs',
  'scripts/validate-jornada-parity-smoke.mjs',
  'scripts/validate-eventos-list.mjs',
  'scripts/validate-meus-eventos.mjs',
  'scripts/validate-acompanhamento.mjs',
  'scripts/validate-presenca.mjs',
  'scripts/validate-finalizacao.mjs',
  'scripts/validate-grupos.mjs',
  'scripts/validate-grupo-detalhe.mjs',
  'scripts/validate-grupo-membros.mjs',
  'scripts/validate-grupos-parity.mjs',
  'scripts/validate-shell-layout.mjs',
  'scripts/check-platform-modules.mjs',
  'scripts/validate-auth-routes.mjs',
  'scripts/validate-context-switching.mjs',
  'scripts/validate-permissions.mjs',
  'scripts/validate-parity-ledger.mjs',
  'scripts/validate-session-context.mjs',
  'scripts/validate-transversal-foundation.mjs',
  'docs/parity-manifest.md',
  'docs/jornada-parity-audit.md',
  'docs/eventos-list-parity.md',
  'docs/meus-eventos-parity.md',
  'docs/acompanhamento-parity.md',
  'docs/presenca-parity.md',
  'docs/finalizacao-parity.md',
  'docs/grupos-parity.md',
  'docs/grupo-detalhe-parity.md',
  'tests/fixtures/jornada/success.json',
  'tests/fixtures/jornada/empty.json',
  'tests/fixtures/jornada/error.json',
  'tests/fixtures/jornada/forbidden.json',
  'tests/fixtures/jornada/mobile.json',
  'tests/fixtures/jornada/web.json',
  'tests/fixtures/eventos/list-success.json',
  'tests/fixtures/eventos/list-empty.json',
  'tests/fixtures/eventos/list-error.json',
  'tests/fixtures/eventos/list-mobile.json',
  'tests/fixtures/eventos/list-web.json',
  'tests/fixtures/eventos/meus-success.json',
  'tests/fixtures/eventos/meus-empty.json',
  'tests/fixtures/eventos/meus-error.json',
  'tests/fixtures/eventos/meus-context-switch.json',
  'tests/fixtures/eventos/meus-mobile.json',
];

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `Missing required file: ${file}`);
}

const packageJson = readJson('package.json');
assert(packageJson.main === 'expo-router/entry', 'package.json main must be expo-router/entry');

for (const script of ['start', 'android', 'ios', 'web', 'lint', 'check:platform', 'check:parity', 'check:transversal', 'check:auth', 'check:shell', 'check:jornada', 'check:jornada-responsive', 'check:jornada-parity', 'check:eventos-list', 'check:meus-eventos', 'check:acompanhamento', 'check:presenca', 'check:grupos', 'check:grupo-detalhe', 'check:grupo-membros', 'type-check']) {
  assert(packageJson.scripts?.[script], `Missing package script: ${script}`);
}

const appJson = readJson('app.json').expo;
assert(appJson.name === 'GestaoEventos', 'app.json expo.name must be GestaoEventos');
assert(appJson.slug === 'gestaoeventos-react', 'app.json expo.slug must be gestaoeventos-react');
assert(appJson.userInterfaceStyle === 'light', 'app must use light userInterfaceStyle');
assert(appJson.web?.bundler === 'metro', 'web bundler must be metro');
assert(appJson.web?.output === 'static', 'web output must be static');
assert(appJson.plugins?.includes('expo-router'), 'expo-router plugin must be configured');
assert(appJson.plugins?.includes('expo-secure-store'), 'expo-secure-store plugin must be configured');

const blockedApiVersion = '/api/' + 'v1';
const blockedTerms = ['manager' + '-person', 'stu' + 'dent', 'tre' + 'ino', 'nut' + 'rition', 'work' + 'out'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.json']);
const allowedSelf = 'scripts/validate-scaffold.mjs';

for (const file of listFiles('.')) {
  if (file === allowedSelf || file === 'package-lock.json') continue;
  if (!sourceExtensions.has(extname(file))) continue;

  const content = readFileSync(join(root, file), 'utf8').toLowerCase();
  if (content.includes(blockedApiVersion)) fail(`${file} contains forbidden API prefix`);

  for (const term of blockedTerms) {
    if (content.includes(term)) fail(`${file} contains rejected reference term: ${term}`);
  }
}

assert(!existsSync(join(root, 'App.tsx')), 'App.tsx should not exist when using Expo Router entry');
assert(!existsSync(join(root, 'index.ts')), 'index.ts should not exist when using Expo Router entry');

if (failures.length > 0) {
  console.error('[validate-scaffold] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-scaffold] OK');
