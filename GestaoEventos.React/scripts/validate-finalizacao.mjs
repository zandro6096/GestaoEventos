import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'features/eventos/acompanhamento/acompanhamento.rules.ts',
  'features/eventos/acompanhamento/acompanhamento.service.ts',
  'features/eventos/acompanhamento/useAcompanhamento.ts',
  'features/eventos/acompanhamento/AcompanhamentoScreen.tsx',
  'tests/finalizacao.smoke.cjs',
  'docs/finalizacao-parity.md',
];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);
const source = requiredFiles.slice(0, 4).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ["kind: 'finalizar'", "novoStatus: 'Realizada'", 'Finalizar ocorrencia', "['jornada']", "['frequencia']"]) {
  if (!source.includes(contract)) throw new Error(`Contrato ausente: ${contract}`);
}
const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('event-finalization')) throw new Error('Parity manifest missing event-finalization row');
if (!manifest.includes('smoke:finalizacao')) throw new Error('Parity manifest missing finalization smoke evidence');
console.log('[validate-finalizacao] OK');
