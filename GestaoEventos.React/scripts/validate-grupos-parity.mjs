import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const required = ['features/grupos/GruposScreen.tsx', 'features/grupos/useGrupos.ts', 'features/grupos/detalhe/GrupoDetalheScreen.tsx', 'features/grupos/detalhe/useGrupoDetalhe.ts', 'features/grupos/membros/useGrupoMembros.ts', 'tests/grupos.smoke.cjs', 'tests/grupo-detalhe.smoke.cjs', 'tests/grupo-membros.smoke.cjs', 'docs/grupos-epic-parity.md'];
const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);
const source = required.slice(0, 5).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['estruturaId', 'grupoId', "can('ler', 'grupos')", "can('gerenciar', 'grupos'", 'grupo-detalhe', 'Reativar']) if (!source.includes(contract)) throw new Error(`Evidencia ausente: ${contract}`);
for (const smoke of ['tests/grupos.smoke.cjs', 'tests/grupo-detalhe.smoke.cjs', 'tests/grupo-membros.smoke.cjs']) {
  const content = fs.readFileSync(path.join(root, smoke), 'utf8');
  for (const width of ['390', '1440']) if (!content.includes(width)) throw new Error(`${smoke} nao cobre ${width}px`);
}
const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8');
if (!manifest.includes('groups-hierarchy') || !manifest.includes('group-detail') || !manifest.includes('group-members-management')) throw new Error('Manifesto sem as linhas da Epic 4');
console.log('[validate-grupos-parity] OK');
