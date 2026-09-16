import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'docs/epic5-parity-audit.md',
  'scripts/validate-painel.mjs',
  'scripts/validate-cockpit.mjs',
  'scripts/validate-relatorios.mjs',
  'tests/epic5.smoke.cjs',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);

const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
for (const flow of ['operational-panel', 'operational-cockpit', 'frequency-report']) {
  const line = manifest.split('\n').find((entry) => entry.includes(`| \`${flow}\``));
  if (!line || !line.includes('| verified |')) throw new Error(`Fluxo sem evidencia verificada: ${flow}`);
}

const sources = [
  'features/painel/hooks/usePainel.ts',
  'features/painel/cockpit/useCockpit.ts',
  'features/painel/cockpit/FilaSemanalScreen.tsx',
  'features/relatorios/frequencia/useFrequenciaRelatorio.ts',
  'services/analytics/analytics.service.ts',
].map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const action of ["'entrance'", "'simulation'", "'confirmation'"]) {
  if (!sources.includes(action)) throw new Error(`Analytics sem acao: ${action}`);
}
if (sources.includes('window.dataLayer.push')) throw new Error('Analytics usa dataLayer diretamente');
if (!fs.readFileSync(path.join(root, 'docs/epic5-parity-audit.md'), 'utf8').includes('Expo Universal')) throw new Error('Auditoria sem decisao Expo Universal');
console.log('[validate-epic5] OK');
