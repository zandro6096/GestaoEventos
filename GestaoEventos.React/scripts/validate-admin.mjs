import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'services/api/admin-api.ts',
  'services/api/usuarios-estrutura-api.ts',
  'features/admin/membros/useAdminMembros.ts',
  'features/admin/membros/MembrosAdminScreen.tsx',
  'features/admin/papeis-permissoes/usePapeisAdmin.ts',
  'features/admin/papeis-permissoes/PapeisAdminScreen.tsx',
  'app/(app)/configuracoes/membros.tsx',
  'app/(app)/configuracoes/papeis.tsx',
  'app/(app)/configuracoes/permissoes.tsx',
  'tests/admin.smoke.cjs',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);

const source = [...required.slice(0, 9), 'services/api/permissoes-api.ts'].map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['/api/usuarios-estrutura', '/papel', '/funcao', '/api/papeis', '/api/permissoes/recursos', 'reativar', 'Reenviar convite', 'can(', 'estruturaId']) {
  if (!source.includes(contract)) throw new Error(`Evidencia ausente: ${contract}`);
}
if (source.includes(`/api/${'v1'}`) || source.includes('role ===')) throw new Error('Admin usa contrato indevido ou permissao por role fixo');

const smoke = fs.readFileSync(path.join(root, 'tests/admin.smoke.cjs'), 'utf8');
for (const width of ['390', '1440']) if (!smoke.includes(width)) throw new Error(`Smoke nao cobre ${width}px`);
for (const state of ['Reativar', 'Reenviar convite', 'Acesso negado']) if (!smoke.includes(state)) throw new Error(`Smoke nao cobre estado: ${state}`);

const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('admin-members-roles-permissions')) throw new Error('Manifesto sem a linha de membros/papeis/permissoes');
console.log('[validate-admin] OK');
