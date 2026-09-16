import {
  jornadaApi,
  type JornadaApiScope,
  type JornadaFrequenciaDto,
  type JornadaOcorrenciaDto,
  type JornadaParticipacaoDto,
  type JornadaPendenciasResumoDto,
  type JornadaPendenciasDetalheDto,
} from '../../../services/api/jornada-api';
import { painelApi, type CockpitAniversariante } from '../../../services/api/painel-api';

export type JornadaScope = JornadaApiScope;

export type JornadaEventoHoje = {
  id: number;
  ocorrenciaId: number;
  eventoId: number;
  titulo: string;
  grupoNome: string;
  inicioEm: string;
  fimEm: string;
  local: string | null;
  descricao: string | null;
  status: string;
  jaFezCheckin: boolean;
  podeFazerCheckin: boolean;
  mensagemCheckin: string;
};

export type JornadaFrequencia = {
  percentualFrequencia: number;
  totalParticipacoes: number;
  totalPresencas: number;
  totalAusencias: number;
  totalPendentes: number;
};

export type JornadaHistoricoItem = {
  id: number;
  eventoId: number;
  eventoTitulo: string;
  ocorridoEm: string;
  status: string;
  observacao: string | null;
};

export type JornadaProximaReuniao = {
  id: number;
  eventoId: number;
  eventoTitulo: string;
  grupoNome: string;
  inicioEm: string;
  local: string | null;
  exigeConfirmacao: boolean;
  diasRestantes: number;
};

export type JornadaPendenciasResumo = JornadaPendenciasResumoDto;
export type JornadaPendenciasDetalhe = JornadaPendenciasDetalheDto;
export type JornadaAniversariante = CockpitAniversariante;

const CHECKIN_DONE_STATUSES = new Set(['PRESENTE', 'CONFIRMADO', 'JUSTIFICADO']);

export const jornadaService = {
  async getEventosHoje(scope: JornadaScope): Promise<JornadaEventoHoje[]> {
    assertValidScope(scope);

    const [ocorrencias, participacoes] = await Promise.all([
      jornadaApi.getOcorrencias({
        ...scope,
        dataInicio: 'hoje',
        take: 50,
        somenteParticipante: true,
      }),
      jornadaApi.getParticipacoes({
        ...scope,
        skip: 0,
        take: 200,
      }),
    ]);

    return ocorrencias
      .filter((ocorrencia) => isSameLocalDay(ocorrencia.dataEfetiva || ocorrencia.dataHora, new Date().toISOString()))
      .map((ocorrencia) => mapEventoHoje(ocorrencia, participacoes))
      .sort((a, b) => toTime(a.inicioEm) - toTime(b.inicioEm));
  },

  async getFrequencia(scope: JornadaScope, periodoDias = 30): Promise<JornadaFrequencia> {
    assertValidScope(scope);
    return mapFrequencia(await jornadaApi.getFrequencia({ ...scope, periodoDias }));
  },

  async getHistorico(scope: JornadaScope, skip = 0, take = 20): Promise<JornadaHistoricoItem[]> {
    assertValidScope(scope);
    const participacoes = await jornadaApi.getParticipacoes({ ...scope, skip, take });
    return participacoes.map(mapHistoricoItem);
  },

  async getProximasReunioes(scope: JornadaScope, take = 10): Promise<JornadaProximaReuniao[]> {
    assertValidScope(scope);
    const ocorrencias = await jornadaApi.getOcorrencias({
      ...scope,
      dataInicio: 'futuros',
      take,
      somenteParticipante: true,
    });

    const agora = Date.now();
    return ocorrencias
      .map(mapProximaReuniao)
      .filter((item) => toTime(item.inicioEm) > agora)
      .sort((a, b) => toTime(a.inicioEm) - toTime(b.inicioEm));
  },

  async getPendenciasResumo(scope: JornadaScope): Promise<JornadaPendenciasResumo> {
    assertValidScope(scope);
    return jornadaApi.getPendenciasResumo(scope);
  },

  async getAniversariantes(scope: JornadaScope): Promise<JornadaAniversariante[]> {
    assertValidScope(scope);
    const dataInicio = formatLocalDate(new Date());
    const dataFimDate = new Date();
    dataFimDate.setDate(dataFimDate.getDate() + 30);
    const response = await painelApi.getCockpit({
      estruturaId: scope.estruturaId,
      grupoId: scope.grupoId,
      dataInicio,
      dataFim: formatLocalDate(dataFimDate),
    });
    return response.aniversariantesMes;
  },

  async getPendenciasDetalhe(
    scope: JornadaScope,
    grupoId: number,
    skip = 0,
    take = 10,
  ): Promise<JornadaPendenciasDetalhe> {
    assertValidScope(scope);
    if (!grupoId) throw new Error('Grupo e obrigatorio para carregar pendencias.');
    return jornadaApi.getPendenciasDetalhe({ ...scope, grupoId, skip, take });
  },
};

function assertValidScope(scope: JornadaScope) {
  if (!scope.usuarioId || !scope.estruturaId) {
    throw new Error('Contexto de usuario e estrutura e obrigatorio para carregar a jornada.');
  }
}

function mapEventoHoje(
  ocorrencia: JornadaOcorrenciaDto,
  participacoes: JornadaParticipacaoDto[],
): JornadaEventoHoje {
  const inicioEm = ocorrencia.dataEfetiva || ocorrencia.dataHora;
  const status = normalizeStatus(ocorrencia.status);
  const jaFezCheckin = participacoes.some(
    (participacao) =>
      participacao.eventoId === ocorrencia.eventoId &&
      isSameLocalDay(participacao.ocorridoEm, inicioEm) &&
      CHECKIN_DONE_STATUSES.has(normalizeStatus(participacao.status)),
  );

  return {
    id: ocorrencia.eventoId,
    ocorrenciaId: ocorrencia.id,
    eventoId: ocorrencia.eventoId,
    titulo: ocorrencia.eventoTitulo,
    grupoNome: ocorrencia.grupoNome,
    inicioEm,
    fimEm: inicioEm,
    local: ocorrencia.local,
    descricao: ocorrencia.observacoes,
    status,
    jaFezCheckin,
    podeFazerCheckin: status === 'EM_ANDAMENTO' && !jaFezCheckin,
    mensagemCheckin: getMensagemCheckin(status, jaFezCheckin),
  };
}

function mapFrequencia(value: JornadaFrequenciaDto): JornadaFrequencia {
  return {
    percentualFrequencia: value.percentualFrequencia,
    totalParticipacoes: value.totalParticipacoes,
    totalPresencas: value.totalPresencas,
    totalAusencias: value.totalAusencias,
    totalPendentes: value.totalPendentes,
  };
}

function mapHistoricoItem(value: JornadaParticipacaoDto): JornadaHistoricoItem {
  return {
    id: value.id,
    eventoId: value.eventoId,
    eventoTitulo: value.eventoTitulo,
    ocorridoEm: value.ocorridoEm,
    status: normalizeStatus(value.status),
    observacao: value.observacao,
  };
}

function mapProximaReuniao(value: JornadaOcorrenciaDto): JornadaProximaReuniao {
  const inicioEm = value.dataEfetiva || value.dataHora;

  return {
    id: value.id,
    eventoId: value.eventoId,
    eventoTitulo: value.eventoTitulo,
    grupoNome: value.grupoNome,
    inicioEm,
    local: value.local,
    exigeConfirmacao: value.exigeConfirmacao,
    diasRestantes: Math.max(0, Math.ceil((toTime(inicioEm) - Date.now()) / 86_400_000)),
  };
}

function getMensagemCheckin(status: string, jaFezCheckin: boolean) {
  if (jaFezCheckin) return 'Sua presenca ja foi registrada.';
  if (status === 'EM_ANDAMENTO') return 'Registro de presenca aberto.';
  if (status === 'AGENDADA' || status === 'REAGENDADA') return 'Aguardando inicio do evento.';
  if (status === 'REALIZADA') return 'Evento ja finalizado.';
  if (status === 'CANCELADA') return 'Evento cancelado.';

  return 'Status em acompanhamento.';
}

function normalizeStatus(value: string) {
  return value.trim().toUpperCase();
}

function isSameLocalDay(left: string, right: string) {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  if (!Number.isFinite(leftDate.getTime()) || !Number.isFinite(rightDate.getTime())) return false;

  return leftDate.toDateString() === rightDate.toDateString();
}

function toTime(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function formatLocalDate(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
