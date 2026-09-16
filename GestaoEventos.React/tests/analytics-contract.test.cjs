const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('analytics sanitiza detalhes e normaliza rotas', () => {
  const source = read('services/analytics/analytics.service.ts');
  assert.match(source, /safeDetailPattern/);
  assert.match(source, /unsafeDetailPatterns/);
  assert.match(source, /@/);
  assert.match(source, /\\d\+/);
  assert.match(source, /normalizeRouteForAnalytics/);
  assert.doesNotMatch(source, /window\.dataLayer\.push/);
});

test('helper de funil delega os quatro contratos ao tracker', () => {
  const source = read('services/analytics/funnel.ts');
  assert.match(source, /track\('entrance'/);
  assert.match(source, /track\('simulation'/);
  assert.match(source, /track\('confirmation'/);
});

test('dataLayer fica restrito ao provider web', () => {
  const provider = read('services/platform/analytics-provider/index.web.ts');
  assert.match(provider, /window\.dataLayer\.push/);
  const files = fs.readdirSync(path.join(root, 'services/analytics')).filter((file) => file.endsWith('.ts'));
  for (const file of files) assert.doesNotMatch(read(`services/analytics/${file}`), /dataLayer\.push/);
});
