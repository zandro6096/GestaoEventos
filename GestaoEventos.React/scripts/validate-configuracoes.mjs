import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'features/configuracoes/ConfiguracoesScreen.tsx',
  'features/configuracoes/AdminAreaPlaceholderScreen.tsx',
  'features/configuracoes/admin-route.tsx',
  'app/(app)/configuracoes/index.tsx',
  'app/(app)/configuracoes/_layout.tsx',
  'app/(app)/admin/membros.tsx',
  'tests/configuracoes.smoke.cjs',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);

const source = required.slice(0, 6).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['can(', 'RequirePermission', 'estruturaId', 'global', 'Estrutura ativa', 'configuracoes:area_abrir']) {
  if (!source.includes(contract)) throw new Error(`Evidencia ausente: ${contract}`);
}
if (source.includes('/api/')) throw new Error('Home de configuracoes inventou endpoint sem contrato');

const smoke = fs.readFileSync(path.join(root, 'tests/configuracoes.smoke.cjs'), 'utf8');
for (const width of ['390', '1440']) if (!smoke.includes(width)) throw new Error(`Smoke nao cobre ${width}px`);
if (!smoke.includes('Acesso negado')) throw new Error('Smoke nao cobre acesso direto sem permissao');

const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('admin-settings-home')) throw new Error('Manifesto sem a linha da home de configuracoes');
console.log('[validate-configuracoes] OK');
