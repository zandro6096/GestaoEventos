import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const decisionFile = path.join(root, 'docs/indicadores-acompanhamento-scope.md');
const manifestFile = path.join(root, 'docs/parity-manifest.md');
if (!fs.existsSync(decisionFile) || !fs.existsSync(manifestFile)) throw new Error('Documentacao do gate de indicadores ausente');
const decision = fs.readFileSync(decisionFile, 'utf8');
for (const evidence of ['/api/evento-objetivos', 'Tracking matrix', 'Participant profile drawer', 'Implementado', 'Deferido', 'contrato backend dedicado']) {
  if (!decision.includes(evidence)) throw new Error(`Evidencia ausente no gate: ${evidence}`);
}
const manifest = fs.readFileSync(manifestFile, 'utf8');
if (!manifest.includes('tracking-indicators-scope')) throw new Error('Manifesto sem decisao de escopo dos indicadores');
console.log('[validate-indicadores-scope] OK');
