import type { CockpitCollectiveObjective, CockpitObjectiveEventItem } from '../../../services/api/painel-api';

export type ObjectivePanelItem = {
  key: string;
  origem: 'evento' | 'coletivo';
  objetivoNome: string;
  eventoTitulo: string | null;
  grupoNome: string;
  templateTitulo: string;
  papelAlvoNome: string | null;
  metaQuantidade: number;
  progressoAtual: number;
  status: string;
  prazoEm: string | null;
};

export type ObjectiveStatusFilter = 'todos' | 'atrasado' | 'a_vencer' | 'em_andamento' | 'nao_iniciado' | 'concluido';

export const objectiveStatusFilters: { value: ObjectiveStatusFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'atrasado', label: 'Atrasados' },
  { value: 'a_vencer', label: 'A vencer' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'nao_iniciado', label: 'Não iniciados' },
  { value: 'concluido', label: 'Concluídos' },
];

const statusOrder: Record<string, number> = { atrasado: 0, a_vencer: 1, em_andamento: 2, nao_iniciado: 3, concluido: 4 };

// Mesma composicao do painel web: objetivos por evento + objetivos coletivos da celula.
export function buildObjectiveItems(eventItems: CockpitObjectiveEventItem[], collectives: CockpitCollectiveObjective[]): ObjectivePanelItem[] {
  const fromEvents = eventItems.map((item): ObjectivePanelItem => ({
    key: `evento:${item.objetivoId}:${item.eventoId}`,
    origem: 'evento',
    objetivoNome: item.objetivoNome,
    eventoTitulo: item.eventoTitulo || null,
    grupoNome: item.grupoNome,
    templateTitulo: item.templateTitulo,
    papelAlvoNome: item.papelAlvoNome,
    metaQuantidade: item.metaQuantidade,
    progressoAtual: item.progressoAtual,
    status: item.status,
    prazoEm: item.prazoEm,
  }));
  const fromCollectives = collectives.flatMap((collective) => collective.resumo.itens.map((item): ObjectivePanelItem => ({
    key: `coletivo:${item.id}:${collective.grupoId}:${collective.templateId ?? 'sem_template'}`,
    origem: 'coletivo',
    objetivoNome: item.nome,
    eventoTitulo: collective.templateTitulo || null,
    grupoNome: collective.grupoNome,
    templateTitulo: collective.templateTitulo,
    papelAlvoNome: item.papelAlvoNome,
    metaQuantidade: item.metaQuantidade,
    progressoAtual: item.progressoAtual,
    status: item.status,
    prazoEm: item.prazoEm,
  })));
  return [...fromEvents, ...fromCollectives];
}

export function summarizeObjectives(items: ObjectivePanelItem[]) {
  const count = (status: string) => items.filter((item) => item.status === status).length;
  const concluidos = count('concluido');
  return {
    total: items.length,
    concluidos,
    aVencer: count('a_vencer'),
    atrasados: count('atrasado'),
    emAndamento: count('em_andamento'),
    naoIniciados: count('nao_iniciado'),
    percentual: items.length ? Math.round((concluidos / items.length) * 1000) / 10 : 0,
  };
}

export function sortObjectives(items: ObjectivePanelItem[]): ObjectivePanelItem[] {
  return [...items].sort((a, b) =>
    (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5)
    || compareDate(a.prazoEm, b.prazoEm)
    || (a.eventoTitulo ?? a.templateTitulo).localeCompare(b.eventoTitulo ?? b.templateTitulo)
    || a.objetivoNome.localeCompare(b.objetivoNome));
}

function compareDate(a: string | null, b: string | null) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

export function objectiveStatusLabel(status: string) {
  switch (status) {
    case 'atrasado': return 'Atrasado';
    case 'a_vencer': return 'A vencer';
    case 'concluido': return 'Concluído';
    case 'em_andamento': return 'Em andamento';
    case 'nao_iniciado': return 'Não iniciado';
    default: return status;
  }
}

// Mesmas cores dos selos do painel web.
export function objectiveTone(status: string): { tint: string; ink: string } {
  switch (status) {
    case 'atrasado': return { tint: '#FEE2E2', ink: '#991B1B' };
    case 'a_vencer': return { tint: '#FEF3C7', ink: '#92400E' };
    case 'concluido': return { tint: '#DCFCE7', ink: '#166534' };
    default: return { tint: '#DBEAFE', ink: '#1D4ED8' };
  }
}

export function objectiveContext(item: ObjectivePanelItem) {
  const main = item.eventoTitulo?.trim() || item.templateTitulo.trim();
  const template = item.eventoTitulo && item.templateTitulo && item.eventoTitulo !== item.templateTitulo ? item.templateTitulo : null;
  return [main, item.grupoNome, template, item.papelAlvoNome?.trim() || null].filter((part): part is string => Boolean(part && part.trim())).join(' · ');
}

export function objectiveRemaining(item: Pick<ObjectivePanelItem, 'metaQuantidade' | 'progressoAtual'>) {
  const missing = Math.max(item.metaQuantidade - item.progressoAtual, 0);
  return missing > 0 ? `faltam ${missing}` : 'meta atingida';
}

export function objectiveProgress(item: Pick<ObjectivePanelItem, 'metaQuantidade' | 'progressoAtual'>) {
  return item.metaQuantidade > 0 ? Math.min(item.progressoAtual / item.metaQuantidade, 1) : 0;
}

export function formatDeadline(value: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null;
}

// Resumo de uma celula da matriz Pessoa x Template (mesmos textos do painel web).
export function cellObjectiveText(total: number, concluidos: number, atrasados: number, aVencer: number) {
  if (total <= 0) return '';
  if (atrasados > 0) return `${atrasados}/${total} objetivo(s) atrasado(s)`;
  if (aVencer > 0) return `${aVencer}/${total} objetivo(s) a vencer`;
  return `${concluidos}/${total} objetivo(s) concluído(s)`;
}

export function cellMarkerStatus(marker: string) {
  switch (marker) {
    case 'atrasado': return 'atrasado';
    case 'a_vencer': return 'a_vencer';
    case 'concluido': return 'concluido';
    case 'andamento': return 'em_andamento';
    default: return null;
  }
}
