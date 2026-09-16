import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Map(process.argv.slice(2).map((value) => {
  const [key, ...rest] = value.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));
const fileEnvironment = loadDotEnv('.env');
Object.assign(fileEnvironment, loadDotEnv('.env.local'));

const lane = normalizeLane(args.get('lane') ?? process.env.EXPO_PUBLIC_ENV ?? fileEnvironment.EXPO_PUBLIC_ENV ?? 'development');
const apiUrl = args.has('api-url')
  ? args.get('api-url')
  : process.env.EXPO_PUBLIC_API_URL ?? fileEnvironment.EXPO_PUBLIC_API_URL ?? '';

if (!['development', 'preview', 'prod'].includes(lane)) fail(`EXPO_PUBLIC_ENV invalido: ${lane}. Use development, preview ou prod.`);

if (lane !== 'development') {
  if (!apiUrl?.trim()) fail(`lane ${lane} exige EXPO_PUBLIC_API_URL.`);
  validateBaseUrl(apiUrl, lane, true);
} else if (apiUrl?.trim()) {
  validateBaseUrl(apiUrl, lane, false);
}

console.log(`[validate-environment] OK lane=${lane} api=${describeApi(apiUrl)}`);

function normalizeLane(value) {
  const normalized = value.trim().toLowerCase();
  return normalized === 'production' ? 'prod' : normalized;
}

function validateBaseUrl(value, currentLane, requireHttps) {
  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    fail(`EXPO_PUBLIC_API_URL invalida na lane ${currentLane}: use uma URL absoluta.`);
    return;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (parsed.search || parsed.hash || parsed.pathname.replace(/\/+$/, '')) fail(`EXPO_PUBLIC_API_URL invalida na lane ${currentLane}: informe somente a URL base, sem /api, caminho, query ou fragmento.`);
  if (currentLane !== 'development' && isLocalHostname(hostname)) fail(`EXPO_PUBLIC_API_URL da lane ${currentLane} nao pode apontar para localhost.`);
  if (requireHttps && parsed.protocol !== 'https:') fail(`EXPO_PUBLIC_API_URL da lane ${currentLane} deve usar HTTPS.`);
}

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '::1' || hostname.startsWith('127.');
}

function describeApi(value) {
  if (!value?.trim()) return 'nao-configurada';
  try {
    return new URL(value).hostname;
  } catch {
    return 'invalida';
  }
}

function loadDotEnv(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return {};
  return Object.fromEntries(fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    return match ? [[match[1], match[2].replace(/^['"]|['"]$/g, '')]] : [];
  }));
}

function fail(message) {
  console.error(`[validate-environment] BLOCKED: ${message}`);
  process.exit(1);
}
