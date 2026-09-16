import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'services/api/participacoes-evento-api.ts',
  'features/eventos/presenca/presenca.rules.ts',
  'features/eventos/presenca/presenca.service.ts',
  'features/eventos/presenca/usePresenca.ts',
  'features/eventos/presenca/PresencaLoteScreen.tsx',
  'features/eventos/acompanhamento/AcompanhamentoScreen.tsx',
  'tests/presenca.test.cjs',
  'tests/presenca.smoke.cjs',
  'docs/presenca-parity.md',
];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);
const source = requiredFiles.slice(0, 5).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['/api/participacoes-evento', '/api/participacoes-evento/lote', 'PRESENTE', 'AUSENTE', 'JUSTIFICADO', 'assertOnlineForMutation', 'gerenciar']) {
  if (!source.includes(contract)) throw new Error(`Contrato ausente: ${contract}`);
}
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (packageJson.scripts?.['check:presenca'] !== 'node --test tests/presenca.test.cjs') throw new Error('Missing check:presenca script');
if (packageJson.scripts?.['smoke:presenca'] !== 'node tests/presenca.smoke.cjs') throw new Error('Missing smoke:presenca script');
const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('attendance-registration')) throw new Error('Parity manifest missing attendance-registration row');
if (!manifest.includes('check:presenca')) throw new Error('Parity manifest missing attendance test evidence');
const bulkRoute = fs.readFileSync(path.join(root, 'app/(app)/admin/eventos/presenca-lote.tsx'), 'utf8');
if (!bulkRoute.includes('PresencaLoteScreen')) throw new Error('Bulk attendance route must render the operational picker');
console.log('[validate-presenca] OK');
