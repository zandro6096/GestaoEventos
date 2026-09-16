import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
const requiredRows = ['admin-settings-home', 'admin-members-roles-permissions', 'admin-types-subscription-limits', 'admin-auditoria-support', 'tracking-indicators-scope'];
const missingRows = requiredRows.filter((row) => !manifest.includes(`\`${row}\``));
if (missingRows.length) throw new Error(`Manifesto sem linhas do Epic 6: ${missingRows.join(', ')}`);
for (const row of requiredRows) {
  const line = manifest.split('\n').find((item) => item.includes(`\`${row}\``));
  if (!line?.includes('| verified |')) throw new Error(`Paridade nao verificada: ${row}`);
}

const routes = [
  'configuracoes/index.tsx', 'configuracoes/membros.tsx', 'configuracoes/papeis.tsx', 'configuracoes/permissoes.tsx',
  'configuracoes/tipos.tsx', 'configuracoes/planos.tsx', 'configuracoes/assinatura.tsx', 'configuracoes/auditoria.tsx', 'configuracoes/suporte.tsx',
];
for (const route of routes) {
  const file = path.join(root, 'app/(app)', route);
  if (!fs.existsSync(file)) throw new Error(`Rota administrativa ausente: ${route}`);
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('RequirePermission')) throw new Error(`Rota sem guard de permissao: ${route}`);
}

const sourceFiles = ['features/configuracoes/ConfiguracoesScreen.tsx', 'features/admin/membros/useAdminMembros.ts', 'features/admin/papeis-permissoes/usePapeisAdmin.ts', 'features/admin/tipos/useTiposAdmin.ts', 'features/admin/assinatura/useAssinaturaAdmin.ts', 'features/admin/auditoria/useAuditoriaAdmin.ts'];
const source = sourceFiles.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const evidence of ['can(', 'estruturaId', 'track(', 'queryKeys']) if (!source.includes(evidence)) throw new Error(`Fundacao administrativa sem evidencia: ${evidence}`);
if (source.includes('role ===')) throw new Error('Autorizacao administrativa baseada em role fixo');
console.log('[validate-epic6-parity] OK');
