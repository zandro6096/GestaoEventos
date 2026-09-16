import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'services/api/participantes-evento-api.ts',
  'services/api/ocorrencias-api.ts',
  'features/eventos/acompanhamento/acompanhamento.rules.ts',
  'features/eventos/acompanhamento/acompanhamento.service.ts',
  'features/eventos/acompanhamento/useAcompanhamento.ts',
  'features/eventos/acompanhamento/AcompanhamentoScreen.tsx',
  'app/(app)/admin/eventos/acompanhar/[id].tsx',
  'app/(app)/eventos/acompanhar/[id].tsx',
  'tests/acompanhamento.test.cjs',
  'tests/acompanhamento.smoke.cjs',
  'docs/acompanhamento-parity.md',
];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);
const source = requiredFiles.slice(0, 8).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['/api/eventos/', '/api/ocorrencias', '/participantes', 'ocorrencia_id', 'data_referencia', 'somente_ocorrencia', 'futuros', 'gerenciar']) {
  if (!source.includes(contract)) throw new Error(`Contrato ausente: ${contract}`);
}
console.log('[validate-acompanhamento] OK');
