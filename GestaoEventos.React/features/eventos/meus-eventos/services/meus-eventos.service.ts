import {
  eventosApi,
  type ConfirmacaoResponsavelDto,
  type EventoConfiguracaoDto,
  type OcorrenciaDto,
  type PageInfo,
} from '../../../../services/api/eventos-api';

export type MeusEventosScope = {
  usuarioId: number;
  estruturaId: number;
  grupoId?: number | null;
};

export type MeusEventoCategoria = 'aAcompanhar' | 'futuros' | 'historico';

export type MeusEventoItem = {
  key: string;
  categoria: MeusEventoCategoria;
  eventoId: number;
  ocorrenciaId: number | null;
  titulo: string;
  grupoId: number;
  grupoNome: string;
  dataReferencia: string;
  status: string;
  statusLabel: string;
  cancelada: boolean;
  motivoCancelamento: string | null;
  local: string | null;
  recorrente: boolean;
  eventoTemplateId: number | null;
  eventoCicloId: number | null;
  permitirPresencaAgrupada: boolean;
  exigeConfirmacao: boolean;
  confirmacaoResponsavel: boolean;
  podeConfirmarResponsavel: boolean;
  responsavelId: number | null;
  responsavelNome: string | null;
  isVirtual: boolean;
};

export type MeusEventosListagem = {
  aAcompanhar: MeusEventoItem[];
  futuros: MeusEventoItem[];
  historico: MeusEventoItem[];
  total: number;
  totalCancelados: number;
  configuracoesResponsavel: EventoConfiguracaoDto[];
  pageInfo: PageInfo;
};

export type MeusEventosWindow = {
  dataInicio: string;
  dataFim: string;
};

const ocorrenciasPageSize = 200;
const maxOccurrencePages = 100;
const configuracoesCache = new Map<string, Promise<EventoConfiguracaoDto[]>>();

export const meusEventosService = {
  async getMeusEventos(scope: MeusEventosScope, window: MeusEventosWindow = obterJanelaInicialOcorrencias()): Promise<MeusEventosListagem> {
    assertScope(scope);

    const [ocorrencias, configuracoesResponsavel] = await Promise.all([
      listarTodasOcorrencias(scope, window),
      listarConfiguracoesResponsavel(scope),
    ]);

    const itens = deduplicarOcorrenciasPorDia(ocorrencias.data.map(toMeusEventoItem));
    const relacionados = filterByUserRelation(itens, scope, configuracoesResponsavel);
    const ordenados = sortByDate(relacionados);

    return {
      aAcompanhar: ordenados.filter((item) => item.categoria === 'aAcompanhar'),
      futuros: ordenados.filter((item) => item.categoria === 'futuros'),
      historico: ordenados.filter((item) => item.categoria === 'historico'),
      total: ordenados.length,
      totalCancelados: ordenados.filter((item) => item.cancelada || item.status === 'CANCELADA').length,
      configuracoesResponsavel,
      pageInfo: ocorrencias.pageInfo,
    };
  },

  async confirmarVisita(ocorrenciaId: number): Promise<ConfirmacaoResponsavelDto> {
    assertOccurrence(ocorrenciaId);
    return eventosApi.confirmarResponsavel(ocorrenciaId);
  },

  async cancelarOcorrencia(ocorrenciaId: number, motivo: string): Promise<OcorrenciaDto> {
    assertOccurrence(ocorrenciaId);
    const motivoNormalizado = motivo.trim();
    if (!motivoNormalizado) {
      throw new Error('Motivo obrigatorio para cancelar ocorrencia.');
    }

    return eventosApi.atualizarOcorrenciaStatus(ocorrenciaId, {
      novoStatus: 'Cancelada',
      motivo: motivoNormalizado,
    });
  },
};

export function mergeMeusEventos(current: MeusEventosListagem, incoming: MeusEventosListagem): MeusEventosListagem {
  const itens = deduplicarOcorrenciasPorDia([
    ...current.aAcompanhar,
    ...current.futuros,
    ...current.historico,
    ...incoming.aAcompanhar,
    ...incoming.futuros,
    ...incoming.historico,
  ]);
  const ordenados = sortByDate(itens);

  return {
    aAcompanhar: ordenados.filter((item) => item.categoria === 'aAcompanhar'),
    futuros: ordenados.filter((item) => item.categoria === 'futuros'),
    historico: ordenados.filter((item) => item.categoria === 'historico'),
    total: ordenados.length,
    totalCancelados: ordenados.filter((item) => item.cancelada || item.status === 'CANCELADA').length,
    configuracoesResponsavel: incoming.configuracoesResponsavel.length > 0
      ? incoming.configuracoesResponsavel
      : current.configuracoesResponsavel,
    pageInfo: {
      ...current.pageInfo,
      totalCount: ordenados.length,
    },
  };
}

export function obterJanelaMes(monthKey: string): MeusEventosWindow | null {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;

  return {
    dataInicio: new Date(year, month - 1, 1).toISOString(),
    dataFim: new Date(year, month, 0, 23, 59, 59, 999).toISOString(),
  };
}

export function obterMesAtualKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function obterJanelaAno(year: number): MeusEventosWindow | null {
  if (!Number.isInteger(year) || year < 2000 || year > 2200) return null;

  return {
    dataInicio: new Date(year, 0, 1).toISOString(),
    dataFim: new Date(year, 11, 31, 23, 59, 59, 999).toISOString(),
  };
}

async function listarTodasOcorrencias(scope: MeusEventosScope, window: MeusEventosWindow) {
  const data: OcorrenciaDto[] = [];
  let skip = 0;
  let pageInfo: PageInfo | null = null;

  for (let page = 0; page < maxOccurrencePages; page += 1) {
    const result = await eventosApi.listOcorrencias({
      usuarioId: scope.usuarioId,
      estruturaId: scope.estruturaId,
      grupoId: scope.grupoId,
      dataInicio: window.dataInicio,
      dataFim: window.dataFim,
      take: ocorrenciasPageSize,
      skip,
      includeCanceladas: true,
    });

    pageInfo = result.pageInfo;
    data.push(...result.data);

    const totalCount = result.pageInfo.totalCount;
    const reachedTotal = totalCount > 0 && data.length >= totalCount;
    if (result.data.length === 0 || result.data.length < ocorrenciasPageSize || reachedTotal) break;

    skip += result.data.length;
  }

  return {
    data,
    pageInfo: pageInfo
      ? { ...pageInfo, totalCount: pageInfo.totalCount || data.length }
      : { currentPage: 1, pageSize: ocorrenciasPageSize, totalPages: 1, totalCount: data.length },
  };
}

function listarConfiguracoesResponsavel(scope: MeusEventosScope) {
  const cacheKey = `${scope.usuarioId}:${scope.estruturaId}`;
  const cached = configuracoesCache.get(cacheKey);
  if (cached) return cached;

  const request = eventosApi.listarConfiguracoesPorResponsavel({
    responsavelId: scope.usuarioId,
    estruturaId: scope.estruturaId,
  });
  configuracoesCache.set(cacheKey, request);
  request.catch(() => configuracoesCache.delete(cacheKey));
  return request;
}

export function filterByUserRelation(
  items: MeusEventoItem[],
  scope: MeusEventosScope,
  configuracoesResponsavel: EventoConfiguracaoDto[],
): MeusEventoItem[] {
  const gruposResponsavel = new Set(configuracoesResponsavel.map((item) => item.grupoId).filter((id) => id > 0));
  const templatesResponsavel = new Set(configuracoesResponsavel.map((item) => item.eventoTemplateId).filter((id) => id > 0));

  return items.filter((item) => {
    if (item.responsavelId === scope.usuarioId) return true;
    if (item.podeConfirmarResponsavel || item.confirmacaoResponsavel) return true;
    if (gruposResponsavel.has(item.grupoId)) return true;
    if (item.eventoTemplateId && templatesResponsavel.has(item.eventoTemplateId)) return true;

    return true;
  });
}

function toMeusEventoItem(ocorrencia: OcorrenciaDto): MeusEventoItem {
  const status = normalizeStatus(ocorrencia.status);
  const cancelada = ocorrencia.cancelada || status === 'CANCELADA';
  const dataReferencia = ocorrencia.dataEfetiva || ocorrencia.dataHora || ocorrencia.criadoEm;
  const categoria = resolveCategoria(status, dataReferencia, cancelada);

  return {
    key: `meus:${ocorrencia.id || ocorrencia.eventoId}:${dataReferencia}`,
    categoria,
    eventoId: ocorrencia.eventoId,
    ocorrenciaId: ocorrencia.id > 0 ? ocorrencia.id : null,
    titulo: ocorrencia.eventoTitulo,
    grupoId: ocorrencia.grupoId,
    grupoNome: ocorrencia.grupoNome,
    dataReferencia,
    status,
    statusLabel: getStatusLabel(status, dataReferencia, cancelada),
    cancelada,
    motivoCancelamento: ocorrencia.motivoCancelamento,
    local: ocorrencia.local,
    recorrente: ocorrencia.recorrente,
    eventoTemplateId: ocorrencia.eventoTemplateId,
    eventoCicloId: ocorrencia.eventoCicloId,
    permitirPresencaAgrupada: ocorrencia.permitirPresencaAgrupada,
    exigeConfirmacao: ocorrencia.exigeConfirmacao,
    confirmacaoResponsavel: ocorrencia.confirmacaoResponsavel,
    podeConfirmarResponsavel: ocorrencia.podeConfirmarResponsavel,
    responsavelId: ocorrencia.responsavelId,
    responsavelNome: ocorrencia.responsavelNome,
    isVirtual: ocorrencia.isVirtual,
  };
}

function resolveCategoria(status: string, dataReferencia: string, cancelada: boolean): MeusEventoCategoria {
  if (cancelada || status === 'REALIZADA' || status === 'CONCLUIDO') return 'historico';
  if (status === 'EM_ANDAMENTO' || status === 'EMAJUSTE') return 'aAcompanhar';

  const data = parseDate(dataReferencia);
  if (!data) return 'aAcompanhar';
  if (sameDay(data, new Date()) || data.getTime() < Date.now()) return 'aAcompanhar';

  return 'futuros';
}

function getStatusLabel(status: string, dataReferencia: string, cancelada: boolean) {
  if (cancelada || status === 'CANCELADA' || status === 'CANCELADO') return 'Cancelado';
  if (status === 'REALIZADA' || status === 'CONCLUIDO') return 'Realizado';
  if (status === 'EM_ANDAMENTO' || status === 'EMAJUSTE') return 'Em andamento';

  const data = parseDate(dataReferencia);
  if (data && data.getTime() < Date.now()) return 'Pendente';

  return 'Futuro';
}

function deduplicarOcorrenciasPorDia(items: MeusEventoItem[]) {
  const byDay = new Map<string, MeusEventoItem>();

  for (const item of items) {
    const key = `${item.eventoId}:${toDayKey(item.dataReferencia)}`;
    const current = byDay.get(key);
    if (!current || scoreItem(item) > scoreItem(current)) {
      byDay.set(key, item);
    }
  }

  return [...byDay.values()];
}

function scoreItem(item: MeusEventoItem) {
  let score = 0;
  if (!item.isVirtual) score += 1000;
  if (!item.cancelada) score += 100;
  if (item.status === 'EM_ANDAMENTO') score += 50;
  if (item.status === 'REALIZADA') score += 25;
  if (item.confirmacaoResponsavel) score += 10;
  score += Math.max(0, item.ocorrenciaId ?? 0) / 1_000_000;
  return score;
}

function sortByDate(items: MeusEventoItem[]) {
  return [...items].sort((a, b) => {
    const aTime = parseDate(a.dataReferencia)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bTime = parseDate(b.dataReferencia)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

function obterJanelaInicialOcorrencias() {
  return obterJanelaMes(obterMesAtualKey())!;
}

function assertScope(scope: MeusEventosScope) {
  if (!Number.isInteger(scope.usuarioId) || scope.usuarioId <= 0) {
    throw new Error('Usuario autenticado obrigatorio para listar meus eventos.');
  }

  if (!Number.isInteger(scope.estruturaId) || scope.estruturaId <= 0) {
    throw new Error('Estrutura ativa obrigatoria para listar meus eventos.');
  }
}

function assertOccurrence(ocorrenciaId: number) {
  if (!Number.isInteger(ocorrenciaId) || ocorrenciaId <= 0) {
    throw new Error('Ocorrencia real obrigatoria para esta acao.');
  }
}

function normalizeStatus(value: string | null) {
  const normalized = normalizeSearch(value ?? 'AGENDADA').replaceAll(' ', '_');
  const compact = normalized.replaceAll('_', '');
  const aliases: Record<string, string> = {
    agendada: 'AGENDADA',
    agendado: 'AGENDADA',
    emandamento: 'EM_ANDAMENTO',
    emajuste: 'EMAJUSTE',
    realizada: 'REALIZADA',
    realizado: 'REALIZADA',
    concluida: 'CONCLUIDO',
    concluido: 'CONCLUIDO',
    cancelada: 'CANCELADA',
    cancelado: 'CANCELADA',
    reagendada: 'REAGENDADA',
    reagendado: 'REAGENDADA',
  };

  return aliases[compact] ?? normalized.toUpperCase();
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function toDayKey(value: string) {
  const date = parseDate(value);
  if (!date) return value;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
