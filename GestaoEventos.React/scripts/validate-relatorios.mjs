import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'services/api/relatorios-api.ts',
  'features/relatorios/frequencia/useFrequenciaRelatorio.ts',
  'features/relatorios/frequencia/FrequenciaReportScreen.tsx',
  'app/(app)/relatorios/frequencia.tsx',
  'tests/relatorios.smoke.cjs',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);

const source = [...required.slice(0, 4), 'services/api/painel-api.ts'].map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['/api/paineis/cockpit', 'matriz-template', 'estruturaId', 'grupoId', 'RequirePermission', 'relatorio:frequencia', 'Exportar CSV', 'Share.share']) {
  if (!source.includes(contract)) throw new Error(`Evidencia ausente: ${contract}`);
}
if (source.includes('/api/reports') || source.includes('Exportar agora')) throw new Error('Relatorio contem contrato/exportacao ficticia');

const smoke = fs.readFileSync(path.join(root, 'tests/relatorios.smoke.cjs'), 'utf8');
for (const width of ['390', '1440']) if (!smoke.includes(width)) throw new Error(`Smoke nao cobre ${width}px`);

const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('frequency-report')) throw new Error('Manifesto sem a linha do relatorio de frequencia');
console.log('[validate-relatorios] OK');
