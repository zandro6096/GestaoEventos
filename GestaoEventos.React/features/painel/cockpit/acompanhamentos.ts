import type { AcompanhamentoTipo, ParticipanteAcompanhamento } from '../../../services/api/acompanhamentos-api';
import type { CockpitMatrixRow } from '../../../services/api/painel-api';

export type PersonRef = { key: string; nome: string; grupoNome: string };
export type SituacaoStatus = 'em_andamento' | 'iniciado' | 'concluido' | 'cancelado' | 'nao_iniciado' | 'sim' | 'nao';
export type SituacaoPessoa = { pessoa: PersonRef; status: SituacaoStatus };
export type SituacaoTipo = {
  tipo: AcompanhamentoTipo;
  contagens: { status: SituacaoStatus; total: number }[];
  pessoas: SituacaoPessoa[];
  ativos: number;
};

const courseOrder: SituacaoStatus[] = ['em_andamento', 'iniciado', 'concluido', 'cancelado', 'nao_iniciado'];
const indicatorOrder: SituacaoStatus[] = ['sim', 'nao'];
const idleStatuses: SituacaoStatus[] = ['nao_iniciado', 'nao'];

export function personKey(tipo: string, id: number) {
  return `${tipo === 'usuario_virtual' ? 'usuario_virtual' : 'usuario'}:${id}`;
}

export function peopleFromMatrix(rows: CockpitMatrixRow[]): PersonRef[] {
  return rows.map((row) => ({ key: personKey(row.tipo, row.participanteId), nome: row.nome, grupoNome: row.grupoNome }));
}

function recordKey(record: ParticipanteAcompanhamento) {
  if (record.usuarioId) return personKey('usuario', record.usuarioId);
  if (record.usuarioVirtualId) return personKey('usuario_virtual', record.usuarioVirtualId);
  return null;
}

function courseStatus(record: ParticipanteAcompanhamento | undefined): SituacaoStatus {
  const status = record?.status ?? 'nao_iniciado';
  return (courseOrder as string[]).includes(status) ? (status as SituacaoStatus) : 'nao_iniciado';
}

export function isIdle(status: SituacaoStatus) {
  return idleStatuses.includes(status);
}

export function situacaoLabel(status: SituacaoStatus) {
  switch (status) {
    case 'em_andamento': return 'Em andamento';
    case 'iniciado': return 'Iniciado';
    case 'concluido': return 'Concluído';
    case 'cancelado': return 'Cancelado';
    case 'nao_iniciado': return 'Não iniciado';
    case 'sim': return 'Sim';
    default: return 'Não';
  }
}

export function situacaoTone(status: SituacaoStatus): { tint: string; ink: string } {
  switch (status) {
    case 'concluido':
    case 'sim': return { tint: '#DCFCE7', ink: '#166534' };
    case 'em_andamento': return { tint: '#DBEAFE', ink: '#1D4ED8' };
    case 'iniciado': return { tint: '#E0F2FE', ink: '#0369A1' };
    case 'cancelado': return { tint: '#FEE2E2', ink: '#991B1B' };
    default: return { tint: '#F1F5F9', ink: '#475569' };
  }
}

// Cruza os registros de acompanhamento da estrutura com as pessoas do escopo atual do painel.
// Quem nao tem registro conta como "nao iniciado" (curso) ou "nao" (indicador).
export function buildSituacao(tipos: AcompanhamentoTipo[], records: ParticipanteAcompanhamento[], people: PersonRef[]): SituacaoTipo[] {
  return tipos.map((tipo) => {
    const isCourse = tipo.natureza === 'curso';
    const order = isCourse ? courseOrder : indicatorOrder;
    const byPerson = new Map<string, ParticipanteAcompanhamento>();
    for (const record of records) {
      const key = recordKey(record);
      if (key && record.acompanhamentoTipoId === tipo.id) byPerson.set(key, record);
    }
    const pessoas = people.map((pessoa): SituacaoPessoa => {
      const record = byPerson.get(pessoa.key);
      return { pessoa, status: isCourse ? courseStatus(record) : record?.valor === true ? 'sim' : 'nao' };
    }).sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status) || a.pessoa.nome.localeCompare(b.pessoa.nome));
    const contagens = order
      .map((status) => ({ status, total: pessoas.filter((item) => item.status === status).length }))
      .filter((item) => item.total > 0);
    return { tipo, contagens, pessoas, ativos: pessoas.filter((item) => !isIdle(item.status)).length };
  });
}
