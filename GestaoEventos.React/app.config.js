const { existsSync } = require('node:fs');

const releaseLanes = new Set(['preview', 'prod', 'production']);
const appIdentifier = 'manager.events';
const configuredLane = (process.env.EXPO_PUBLIC_ENV || 'development').trim().toLowerCase();
const lane = configuredLane === 'production' ? 'prod' : configuredLane;

if (!['development', 'preview', 'prod'].includes(lane)) {
  throw new Error(`EXPO_PUBLIC_ENV invalido: ${configuredLane}. Use development, preview ou prod.`);
}

const apiUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();
if (releaseLanes.has(configuredLane)) assertReleaseApiUrl(apiUrl, lane);

// Push exige o plugin expo-notifications (entitlement aps-environment + capability na Apple) e Firebase no Android.
// Fica desligado ate as credenciais existirem: ligue com EXPO_PUBLIC_PUSH_ENABLED=1 no profile do EAS.
const isNotificationsPlugin = (plugin) => (Array.isArray(plugin) ? plugin[0] : plugin) === 'expo-notifications';

const suffix = lane === 'development' ? '.dev' : lane === 'preview' ? '.preview' : '';
const laneLabel = lane === 'development' ? 'Dev' : lane === 'preview' ? 'Preview' : 'Prod';

// Firebase (FCM) do Android: no EAS vem como arquivo em GOOGLE_SERVICES_JSON; local, ./google-services.json.
// Sem o arquivo o app compila normalmente, mas o Android nao recebe push.
const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || (existsSync('./google-services.json') ? './google-services.json' : undefined);

// No build Android sem google-services.json o push nao funciona: nem inclui o plugin (evita pedir permissao a toa).
const androidWithoutFirebase = process.env.EAS_BUILD_PLATFORM === 'android' && !googleServicesFile;
const pushEnabled = process.env.EXPO_PUBLIC_PUSH_ENABLED === '1' && !androidWithoutFirebase;

module.exports = ({ config }) => ({
  ...config,
  name: lane === 'prod' ? 'Gestao de Eventos' : `Gestao de Eventos ${laneLabel}`,
  ios: {
    ...config.ios,
    bundleIdentifier: `${appIdentifier}${suffix}`,
  },
  android: {
    ...config.android,
    package: `${appIdentifier}${suffix.replaceAll('.', '')}`,
    ...(googleServicesFile ? { googleServicesFile } : {}),
  },
  plugins: (config.plugins ?? [])
    .filter((plugin) => pushEnabled || !isNotificationsPlugin(plugin))
    .map((plugin) => (
      Array.isArray(plugin) && isNotificationsPlugin(plugin)
        ? [plugin[0], { ...plugin[1], mode: lane === 'development' ? 'development' : 'production' }]
        : plugin
    )),
  extra: {
    ...config.extra,
    appEnvironment: lane,
    pushEnabled,
  },
});

function assertReleaseApiUrl(value, currentLane) {
  if (!value) throw new Error(`Build ${currentLane} bloqueado: EXPO_PUBLIC_API_URL e obrigatoria.`);

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Build ${currentLane} bloqueado: EXPO_PUBLIC_API_URL deve ser uma URL absoluta.`);
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '::1' || hostname.startsWith('127.')) {
    throw new Error(`Build ${currentLane} bloqueado: EXPO_PUBLIC_API_URL nao pode apontar para localhost.`);
  }
  if (parsed.protocol !== 'https:' || parsed.search || parsed.hash || parsed.pathname !== '/') {
    throw new Error(`Build ${currentLane} bloqueado: EXPO_PUBLIC_API_URL deve ser uma base HTTPS sem caminho, query ou fragmento.`);
  }
}
