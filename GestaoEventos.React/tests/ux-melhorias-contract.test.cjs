const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('marcar presenca de uma pessoa nao trava as demais e nao sobrescreve estilos', () => {
  const screen = read('features/eventos/acompanhamento/AcompanhamentoScreen.tsx');
  assert.match(screen, /presenca\.saving\[p\.id\] !== undefined/);
  assert.doesNotMatch(screen, /disabled=\{presenca\.mutation\.isPending\}\n\s+onPress=\{\(\) => applyAttendance\(\[p\]/);
  assert.doesNotMatch(screen, /Object\.assign\(styles/);
  assert.match(screen, /searchRow: \{ minHeight: 44, flexDirection: 'row'/);
  const hook = read('features/eventos/presenca/usePresenca.ts');
  assert.match(hook, /const \[saving, setSaving\]/);
  assert.match(hook, /client\.setQueryData/);
  assert.match(hook, /return \{ mutation, save, saving,/);
});

test('cores do P/A/J seguem a versao web (fundo suave, borda colorida, texto escuro)', () => {
  const screen = read('features/eventos/acompanhamento/AcompanhamentoScreen.tsx');
  assert.match(screen, /success: \{ solid: '#10B981', tint: '#ECFDF5', ink: '#047857' \}/);
  assert.match(screen, /danger: \{ solid: '#EF4444', tint: '#FEF2F2', ink: '#B91C1C' \}/);
  assert.match(screen, /warning: \{ solid: '#F59E0B', tint: '#FFFBEB', ink: '#B45309' \}/);
});

test('inicio mostra todos os grupos pendentes sob demanda', () => {
  const screen = read('features/jornada/screens/JornadaScreen.tsx');
  assert.match(screen, /const groupLimit = compact \? 4 : 8;/);
  assert.match(screen, /showAllGroups \? data\.grupos : data\.grupos\.slice\(0, groupLimit\)/);
  assert.match(screen, /Ver mais \$\{data\.grupos\.length - groupLimit\} grupo\(s\)/);
});

test('painel de saude exibe objetivos e cursos/indicadores como no web', () => {
  const screen = read('features/painel/cockpit/CockpitScreen.tsx');
  assert.match(screen, /<ObjetivosSection items=\{state\.objectiveItems\}/);
  assert.match(screen, /<AcompanhamentosSection \{\.\.\.state\.acompanhamentos\}/);
  assert.match(screen, /<CellObjectiveBadge cell=\{cell\} \/>/);
  const api = read('services/api/painel-api.ts');
  assert.match(api, /objetivosColetivos: arrayValue\(body\?\.objetivosColetivos\)/);
  assert.match(api, /objetivoStatusResumo: normalizeObjectiveStatus/);
});

test('lider que nao e dono acessa eventos e presenca (bug do "Acesso negado" nos atrasados)', () => {
  const facade = read('services/permissions/permission.facade.ts');
  assert.match(facade, /eventos: \['ler', 'criar', 'gerenciar'\]/);
  assert.match(facade, /isStructureMember\(effectiveScope\.estruturaId\) && memberBaseline\[resource\]\?\.includes\(action\)/);
  assert.doesNotMatch(facade, /(usuarios|papeis|permissoes|configuracoes|estrutura): \[/);
});

test('modelos, objetivos e tipos de evento continuam so para quem gerencia configuracoes', () => {
  for (const route of ['modelos', 'objetivos', 'tipos/criar']) {
    assert.match(read(`app/(app)/admin/eventos/${route}.tsx`), /action="gerenciar" resource="configuracoes"/);
  }
  assert.match(read('app/(app)/admin/eventos/tipos/editar/[id].tsx'), /action="gerenciar" resource="configuracoes"/);
  assert.match(read('app/(app)/admin/tipos-evento.tsx'), /action="gerenciar" resource="configuracoes"/);
  const nav = read('shared/components/AppNavigation.tsx');
  assert.match(nav, /label: "Modelos de Evento",[\s\S]*?action: "gerenciar",\s*resource: "configuracoes"/);
  assert.match(nav, /label: "Objetivos",[\s\S]*?action: "gerenciar",\s*resource: "configuracoes"/);
});
