import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'services/api/auditoria-api.ts',
  'features/admin/auditoria/useAuditoriaAdmin.ts',
  'features/admin/auditoria/AuditoriaAdminScreen.tsx',
  'features/admin/suporte/SuporteAdminScreen.tsx',
  'app/(app)/configuracoes/auditoria.tsx',
  'app/(app)/configuracoes/suporte.tsx',
  'tests/auditoria-suporte.smoke.cjs',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);
const source = required.slice(0, 6).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['/api/auditoria', 'estrutura_id', 'can(', 'queryKeys', 'Tentar novamente', 'suporte@gestaoeventos.app']) {
  if (!source.includes(contract)) throw new Error(`Evidencia ausente: ${contract}`);
}
if (source.includes(`/api/${'v1'}`) || source.includes('window.dataLayer.push')) throw new Error('Auditoria usa contrato ou analytics indevido');
const smoke = fs.readFileSync(path.join(root, 'tests/auditoria-suporte.smoke.cjs'), 'utf8');
for (const width of ['390', '1440']) if (!smoke.includes(width)) throw new Error(`Smoke nao cobre ${width}px`);
for (const state of ['Detalhes da alteracao', 'Acesso negado', 'Suporte']) if (!smoke.includes(state)) throw new Error(`Smoke nao cobre estado: ${state}`);
const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('admin-auditoria-support')) throw new Error('Manifesto sem auditoria/suporte');
console.log('[validate-auditoria-suporte] OK');
