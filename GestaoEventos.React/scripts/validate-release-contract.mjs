import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const eas = JSON.parse(read('eas.json'));
const ota = read('docs/ota-policy.md');
const release = read('docs/release.md');
const environments = read('docs/release-environments.md');
const packageJson = JSON.parse(read('package.json'));
const analytics = read('services/analytics/analytics.service.ts');

for (const profile of ['development', 'preview', 'production']) {
  if (!eas.build?.[profile]?.channel || !eas.build?.[profile]?.environment) throw new Error(`EAS profile incompleto: ${profile}`);
}
for (const phrase of ['UI, copy', 'contratos da API', 'autenticacao', 'permissoes', 'quality-gate']) {
  if (!ota.includes(phrase)) throw new Error(`Politica OTA sem regra: ${phrase}`);
}
for (const phrase of ['rollback', 'artefato', 'build anterior', 'Angular']) {
  if (!release.includes(phrase)) throw new Error(`Release sem rollback/fallback: ${phrase}`);
}
if (!environments.includes('Cors:AllowedOrigins') || !environments.includes('App:Url')) throw new Error('Release sem contrato CORS do backend');
if (!analytics.includes('APP_ENVIRONMENT') || !analytics.includes('ANALYTICS_ENABLED')) throw new Error('Analytics nao usa configuracao da lane');
if (packageJson.scripts?.['release:gate'] !== 'node scripts/release-gate.mjs') throw new Error('release:gate nao esta configurado');

console.log('[validate-release-contract] OK');
