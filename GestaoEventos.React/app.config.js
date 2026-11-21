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

module.exports = ({ config }) => ({
  ...config,
  name: lane === 'prod' ? 'Gestao de Eventos' : `Gestao de Eventos ${laneLabel}`,
  android: {
    ...config.android,
    package: `${appIdentifier}${suffix.replaceAll('.', '')}`,
    ...(googleServicesFile ? { googleServicesFile } : {}),
  },
  ios: {
    ...config.ios,
    bundleIdentifier: `${appIdentifier}${suffix}`,
    ...(googleServiceInfoPlist ? { googleServicesFile: googleServiceInfoPlist } : {}),
  },
  plugins: [
    ...(config.plugins ?? []),
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
