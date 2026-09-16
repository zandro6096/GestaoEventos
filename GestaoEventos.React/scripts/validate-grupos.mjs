import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const files = ['services/api/grupos-api.ts', 'features/grupos/grupos.rules.ts', 'features/grupos/useGrupos.ts', 'features/grupos/GruposScreen.tsx', 'app/(app)/admin/grupos.tsx', 'app/(app)/grupos/index.tsx', 'tests/grupos.test.cjs', 'tests/grupos.smoke.cjs', 'docs/grupos-parity.md'];
const missing = files.filter((file) => !fs.existsSync(path.join(root, file))); if (missing.length) throw new Error(`Arquivos ausentes: ${missing.join(', ')}`);
const source = files.slice(0, 6).map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
for (const contract of ['/api/grupos', 'estrutura_id', 'grupoSuperiorId', 'buildGroupTree', 'ler', 'grupos']) if (!source.includes(contract)) throw new Error(`Contrato ausente: ${contract}`);
const manifest = fs.readFileSync(path.join(root, 'docs/parity-manifest.md'), 'utf8'); if (!manifest.includes('groups-hierarchy') || !manifest.includes('check:grupos')) throw new Error('Manifesto sem evidencia de grupos');
console.log('[validate-grupos] OK');
