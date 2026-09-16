import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = ['services/analytics/analytics.service.ts', 'services/analytics/funnel.ts', 'shared/components/RouteAnalyticsTracker.tsx', 'services/platform/analytics-provider/index.web.ts', 'docs/analytics/react-events-map.md', 'tests/analytics-contract.test.cjs'];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos de analytics ausentes: ${missing.join(', ')}`);
const service = fs.readFileSync(path.join(root, required[0]), 'utf8');
const funnel = fs.readFileSync(path.join(root, required[1]), 'utf8');
const tracker = fs.readFileSync(path.join(root, required[2]), 'utf8');
const provider = fs.readFileSync(path.join(root, required[3]), 'utf8');
const docs = fs.readFileSync(path.join(root, required[4]), 'utf8');
for (const evidence of ['UnsafeAnalyticsDetailError', 'normalizeRouteForAnalytics', 'safeDetailPattern', 'visualization']) if (!service.includes(evidence)) throw new Error(`Contrato de analytics ausente: ${evidence}`);
for (const point of ["track('entrance'", "track('simulation'", "track('confirmation'"]) if (!funnel.includes(point)) throw new Error(`Helper de funil sem ponto: ${point}`);
if (!tracker.includes('lastTrackedPath') || !tracker.includes('trackRouteVisualization')) throw new Error('Tracker de rota sem deduplicacao/visualizacao');
if (!provider.includes('window.dataLayer.push')) throw new Error('Provider web sem destino dataLayer');
if (service.includes('window.dataLayer.push')) throw new Error('Servico analytics acessa dataLayer diretamente');
for (const section of ['Auth', 'Contexto', 'Jornada', 'Admin', 'Privacidade']) if (!docs.includes(section)) throw new Error(`Mapa de analytics sem area: ${section}`);
console.log('[validate-analytics-routes] OK');
