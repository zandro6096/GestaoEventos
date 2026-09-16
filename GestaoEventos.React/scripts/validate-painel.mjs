import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'services/api/painel-api.ts',
  'features/painel/hooks/usePainel.ts',
  'features/painel/screens/PainelScreen.tsx',
  'app/(app)/admin/painel.tsx',
  'tests/painel.smoke.cjs',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);

const source = required.slice(0, 4).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['/api/painel/', 'estruturaId', 'grupoId', 'presenca-media', 'crescimento', 'eventos-realizados', 'painel:filtro_aplicar', 'painel:grupo_abrir']) {
  if (!source.includes(contract)) throw new Error(`Evidencia ausente: ${contract}`);
}

const smoke = fs.readFileSync(path.join(root, 'tests/painel.smoke.cjs'), 'utf8');
for (const width of ['390', '1440']) if (!smoke.includes(width)) throw new Error(`Smoke nao cobre ${width}px`);
const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('operational-panel')) throw new Error('Manifesto sem a linha do painel operacional');
console.log('[validate-painel] OK');
