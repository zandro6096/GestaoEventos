export const API_URL_ENV_VAR = 'EXPO_PUBLIC_API_URL';

const DEV_FALLBACK_URL = 'https://localhost:57678';
const UNCONFIGURED_URL = 'https://api-url-nao-configurada.invalid';

type ApiConfig = {
  baseUrl: string;
  error: string | null;
};

function isDevRuntime(): boolean {
  if (process.env.EXPO_PUBLIC_ENV === 'development') return true;
  if (typeof __DEV__ === 'undefined') return process.env.NODE_ENV !== 'production';

  return __DEV__;
}

function isReleaseRuntime(): boolean {
  const env = process.env.EXPO_PUBLIC_ENV?.trim().toLowerCase();
  if (env === 'preview' || env === 'prod' || env === 'production') return true;

  return !isDevRuntime();
}

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '');

  return (
    normalized === 'localhost' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized.startsWith('127.')
  );
}

function normalizeConfiguredUrl(value: string): { url: string | null; error: string | null } {
  const trimmed = value.trim().replace(/\/+$/, '');

  try {
    const parsed = new URL(trimmed);
    const pathWithoutTrailingSlash = parsed.pathname.replace(/\/+$/, '');

    if (parsed.search || parsed.hash) {
      return {
        url: null,
        error:
          `A variavel ${API_URL_ENV_VAR} deve conter somente a URL base do backend, ` +
          'sem query string ou fragmento.',
      };
    }

    if (pathWithoutTrailingSlash) {
      const pathHint =
        pathWithoutTrailingSlash.toLowerCase() === '/api'
          ? 'sem o sufixo /api.'
          : 'sem caminhos adicionais.';

      return {
        url: null,
        error:
          `A variavel ${API_URL_ENV_VAR} deve conter somente a URL base do backend, ` +
          pathHint,
      };
    }

    return { url: trimmed, error: null };
  } catch {
    return {
      url: null,
      error:
        `A variavel ${API_URL_ENV_VAR} precisa ser uma URL absoluta, por exemplo ` +
        'https://api.exemplo.com.',
    };
  }
}

function resolveApiConfig(): ApiConfig {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  const releaseRuntime = isReleaseRuntime();

  if (!configured?.trim()) {
    if (!releaseRuntime) return { baseUrl: DEV_FALLBACK_URL, error: null };

    return {
      baseUrl: UNCONFIGURED_URL,
      error:
        `Este build foi publicado sem ${API_URL_ENV_VAR}. ` +
        'Defina a URL publica da API antes de liberar preview ou producao.',
    };
  }

  const normalized = normalizeConfiguredUrl(configured);
  if (normalized.error || !normalized.url) {
    return { baseUrl: UNCONFIGURED_URL, error: normalized.error };
  }

  const parsed = new URL(normalized.url);
  if (releaseRuntime && isLocalHostname(parsed.hostname)) {
    return {
      baseUrl: UNCONFIGURED_URL,
      error:
        `${API_URL_ENV_VAR} aponta para ${parsed.hostname}, que nao e valido em preview ` +
        'ou producao.',
    };
  }

  return { baseUrl: normalized.url, error: null };
}

const config = resolveApiConfig();

export const API_BASE_URL = config.baseUrl;
export const apiConfigError = config.error;

export function isApiConfigured(): boolean {
  return apiConfigError === null;
}

if (apiConfigError) {
  console.error(`[api-config] ${apiConfigError}`);
}
