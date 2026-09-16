import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'services/api/configuracoes-api.ts',
  'features/admin/tipos/useTiposAdmin.ts',
  'features/admin/tipos/TiposAdminScreen.tsx',
  'features/admin/assinatura/useAssinaturaAdmin.ts',
  'features/admin/assinatura/AssinaturaAdminScreen.tsx',
  'app/(app)/configuracoes/tipos.tsx',
  'app/(app)/configuracoes/assinatura.tsx',
  'app/(app)/configuracoes/planos.tsx',
  'tests/configuracoes-comerciais.smoke.cjs',
];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);

const source = required.slice(0, 8).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['/api/tipos-grupo', '/api/tipos-evento', '/api/planos', '/api/assinaturas/status', '/api/assinaturas/checkout', '/api/assinaturas/portal', 'toSnakeCase', 'estruturaId', 'can(']) {
  if (!source.includes(contract)) throw new Error(`Evidencia ausente: ${contract}`);
}
if (source.includes(`/api/${'v1'}`) || source.includes('stripe_price_id_mensal:') || source.includes('window.location')) throw new Error('Configuracao comercial usa contrato ou dado sensivel indevido');

const smoke = fs.readFileSync(path.join(root, 'tests/configuracoes-comerciais.smoke.cjs'), 'utf8');
for (const width of ['390', '1440']) if (!smoke.includes(width)) throw new Error(`Smoke nao cobre ${width}px`);
for (const state of ['Tipos de grupo', 'Minha assinatura', 'Acesso negado']) if (!smoke.includes(state)) throw new Error(`Smoke nao cobre estado: ${state}`);
const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('admin-types-subscription-limits')) throw new Error('Manifesto sem a linha de tipos/assinatura/limites');
console.log('[validate-configuracoes-comerciais] OK');
