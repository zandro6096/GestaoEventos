const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

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
const googleServicesFile = resolveFirebaseFile(process.env.GOOGLE_SERVICES_JSON, 'google-services.json');
const googleServiceInfoPlist = resolveFirebaseFile(process.env.GOOGLE_SERVICE_INFO_PLIST, 'GoogleService-Info.plist');

if (lane === 'prod' && process.env.EAS_BUILD === 'true') {
  const buildPlatform = (process.env.EAS_BUILD_PLATFORM || '').trim().toLowerCase();
  if (buildPlatform === 'android') {
    assertFirebaseFile(googleServicesFile, 'GOOGLE_SERVICES_JSON', 'Android');
  } else if (buildPlatform === 'ios') {
    assertFirebaseFile(googleServiceInfoPlist, 'GOOGLE_SERVICE_INFO_PLIST', 'iOS');
  } else {
    assertFirebaseFile(googleServicesFile, 'GOOGLE_SERVICES_JSON', 'Android');
    assertFirebaseFile(googleServiceInfoPlist, 'GOOGLE_SERVICE_INFO_PLIST', 'iOS');
  }
}

// Firebase (FCM) do Android: no EAS vem como arquivo em GOOGLE_SERVICES_JSON; local, ./google-services.json.
// Sem o arquivo o app compila normalmente, mas o Android nao recebe push.
// No build Android sem google-services.json o push nao funciona: nem inclui o plugin (evita pedir permissao a toa).
const androidWithoutFirebase = process.env.EAS_BUILD_PLATFORM === 'android' && !googleServicesFile;
if (androidWithoutFirebase && releaseLanes.has(configuredLane) && process.env.EXPO_PUBLIC_PUSH_ENABLED === '1') {
  throw new Error('Build Android de producao bloqueado: GOOGLE_SERVICES_JSON ausente; push nativo nao funcionaria.');
}
const pushEnabled = process.env.EXPO_PUBLIC_PUSH_ENABLED === '1' && !androidWithoutFirebase;

module.exports = ({ config }) => ({
  ...config,
  name: lane === 'prod' ? 'Gestao de Eventos' : `Gestao de Eventos ${laneLabel}`,
  ios: {
    ...config.ios,
    bundleIdentifier: `${appIdentifier}${suffix}`,
    ...(googleServiceInfoPlist ? { googleServicesFile: googleServiceInfoPlist } : {}),
  },
  android: {
    ...config.android,
    package: `${appIdentifier}${suffix.replaceAll('.', '')}`,
    ...(googleServicesFile ? { googleServicesFile } : {}),
  },
  plugins: [
    ...(config.plugins ?? [])
    .concat('@react-native-community/datetimepicker')
    .filter((plugin) => pushEnabled || !isNotificationsPlugin(plugin))
    .map((plugin) => (
      Array.isArray(plugin) && isNotificationsPlugin(plugin)
        ? [plugin[0], { ...plugin[1], mode: lane === 'development' ? 'development' : 'production' }]
        : plugin
    )),
    '@react-native-firebase/app',
    [
      '@react-native-firebase/analytics',
      {
        ios: {
          withoutAdIdSupport: true,
        },
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'dynamic',
        },
      },
    ],
  ],
  extra: {
    ...config.extra,
    appEnvironment: lane,
    pushEnabled,
  },
});

function resolveFirebaseFile(environmentValue, fallbackName) {
  const configured = (environmentValue || '').trim();
  if (configured) {
    const configuredPath = path.resolve(process.cwd(), configured);
    if (fs.existsSync(configuredPath)) return configured;

    const isJsonContent = fallbackName.endsWith('.json') && configured.startsWith('{');
    const isPlistContent = fallbackName.endsWith('.plist') && configured.startsWith('<');
    if (isJsonContent || isPlistContent) {
      const temporaryPath = path.join(os.tmpdir(), `gestaoeventos-${fallbackName}`);
      fs.writeFileSync(temporaryPath, configured, 'utf8');
      return temporaryPath;
    }

    return configured;
  }

  const fallback = path.join(process.cwd(), fallbackName);
  return fs.existsSync(fallback) ? `./${fallbackName}` : undefined;
}

function assertFirebaseFile(file, variableName, platform) {
  if (!file) {
    throw new Error(
      `Build prod bloqueado: ${variableName} deve apontar para o arquivo de configuracao Firebase da plataforma ${platform}.`,
    );
  }

  if (!fs.existsSync(path.resolve(process.cwd(), file))) {
    throw new Error(`Build prod bloqueado: arquivo Firebase nao encontrado para ${platform}: ${file}`);
  }
}

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
