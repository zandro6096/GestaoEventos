import { eventosApi, type EventoDto, type OcorrenciaDto, type PageInfo } from '../../../services/api/eventos-api';

export const eventosPeriodos = ['todos', 'hoje', 'semana', 'mes', 'ano', 'historico'] as const;
export type EventosPeriodo = (typeof eventosPeriodos)[number];

export const eventosStatus = ['todos', 'ativos', 'agendado', 'em_andamento', 'realizado', 'cancelado'] as const;
export type EventosStatus = (typeof eventosStatus)[number];

export const eventosTipos = ['todos', 'recorrente', 'unico', 'template'] as const;
export type EventosTipo = (typeof eventosTipos)[number];

export type EventosFilters = {
  titulo: string;
  periodo: EventosPeriodo;
  status: EventosStatus;
  tipo: EventosTipo;
  grupo: string;
  responsavel: string;
  pageNumber: number;
  pageSize: number;
};

export type EventosScope = {
  usuarioId: number;
  estruturaId: number;
  grupoId?: number | null;
};

export type EventoListItem = {
  key: string;
  tipo: 'evento' | 'ocorrencia';
  eventoId: number;
  ocorrenciaId: number | null;
  titulo: string;
  descricao: string | null;
  status: string;
  cancelado: boolean;
  motivoCancelamento: string | null;
  dataReferencia: string;
  fimEm: string | null;
  local: string | null;
  grupoId: number;
  grupoNome: string;
  responsavelId: number | null;
  responsavelNome: string | null;
  recorrente: boolean;
  isTemplate: boolean;
  eventoTemplateId: number | null;
};

export type EventosListagem = {
  items: EventoListItem[];
  pageInfo: PageInfo;
  totalPlanejados: number;
  totalOcorrencias: number;
  totalCancelados: number;
  filters: EventosFilters;
};

export const defaultEventosFilters: EventosFilters = {
  titulo: '',
  periodo: 'todos',
  status: 'todos',
  tipo: 'todos',
  grupo: '',
  responsavel: '',
  pageNumber: 1,
  pageSize: 20,
};

export const eventosService = {
  async getListagem(scope: EventosScope, filters: Partial<EventosFilters> = {}): Promise<EventosListagem> {
    assertScope(scope);
    const normalizedFilters = normalizeEventosFilters(filters);
    const pageNumber = normalizedFilters.pageNumber;
    const pageSize = normalizedFilters.pageSize;
    const skip = (pageNumber - 1) * pageSize;
    const window = getPeriodoWindow(normalizedFilters.periodo);

    const [eventos, ocorrencias] = await Promise.all([
      eventosApi.listEventos({
        estruturaId: scope.estruturaId,
        grupoId: scope.grupoId,
        pageNumber,
        pageSize,
      }),
      eventosApi.listOcorrencias({
        usuarioId: scope.usuarioId,
        estruturaId: scope.estruturaId,
        grupoId: scope.grupoId,
        dataInicio: window.dataInicio,
        dataFim: window.dataFim,
        take: pageSize,
        skip,
        includeCanceladas: true,
      }),
    ]);

    const planejados = eventos.data.map(toEventoItem);
    const materializados = ocorrencias.data.map(toOcorrenciaItem);
    const items = filterEventos([...planejados, ...materializados], normalizedFilters);

    return {
      items: sortEventos(items),
      pageInfo: mergePageInfo(eventos.pageInfo, ocorrencias.pageInfo, items.length),
      totalPlanejados: planejados.length,
      totalOcorrencias: materializados.length,
      totalCancelados: items.filter((item) => item.cancelado || item.status === 'CANCELADO').length,
      filters: normalizedFilters,
    };
  },
};

export function normalizeEventosFilters(filters: Partial<EventosFilters> = {}): EventosFilters {
  return {
    titulo: normalizeFreeText(filters.titulo),
    periodo: eventosPeriodos.includes(filters.periodo as EventosPeriodo) ? (filters.periodo as EventosPeriodo) : 'todos',
    status: eventosStatus.includes(filters.status as EventosStatus) ? (filters.status as EventosStatus) : 'todos',
    tipo: eventosTipos.includes(filters.tipo as EventosTipo) ? (filters.tipo as EventosTipo) : 'todos',
    grupo: normalizeFreeText(filters.grupo),
    responsavel: normalizeFreeText(filters.responsavel),
    pageNumber: clampPositiveInteger(filters.pageNumber, 1, 500, 1),
    pageSize: clampPositiveInteger(filters.pageSize, 1, 50, 20),
  };
}

export function filterEventos(items: EventoListItem[], filters: EventosFilters): EventoListItem[] {
  return items.filter((item) => {
    const tituloOk = matchesText([item.titulo, item.descricao], filters.titulo);
    const grupoOk = matchesText([item.grupoNome], filters.grupo);
    const responsavelOk = matchesText([item.responsavelNome], filters.responsavel);
    const statusOk = matchesStatus(item, filters.status);
    const tipoOk = matchesTipo(item, filters.tipo);
    const periodoOk = matchesPeriodo(item, filters.periodo);

    return tituloOk && grupoOk && responsavelOk && statusOk && tipoOk && periodoOk;
  });
}

function toEventoItem(evento: EventoDto): EventoListItem {
  const cancelado = Boolean(evento.canceladoEm) || normalizeStatus(evento.status) === 'CANCELADO';

  return {
    key: `evento:${evento.id}`,
    tipo: 'evento',
    eventoId: evento.id,
    ocorrenciaId: null,
    titulo: evento.titulo,
    descricao: evento.descricao,
    status: cancelado ? 'CANCELADO' : normalizeStatus(evento.status),
    cancelado,
    motivoCancelamento: evento.motivoCancelamento,
    dataReferencia: evento.inicioEm || evento.dataInicio || evento.criadoEm,
    fimEm: evento.fimEm ?? evento.dataFim,
    local: evento.local,
    grupoId: evento.grupoId,
    grupoNome: evento.grupoNome ?? 'Grupo',
    responsavelId: evento.responsavelAtualId ?? evento.responsavelPrincipalId,
    responsavelNome: evento.responsavelAtualNome ?? evento.responsavelPrincipalNome,
    recorrente: evento.recorrente,
    isTemplate: evento.isTemplate,
    eventoTemplateId: evento.eventoTemplateId,
  };
}

function toOcorrenciaItem(ocorrencia: OcorrenciaDto): EventoListItem {
  const status = ocorrencia.cancelada ? 'CANCELADO' : normalizeStatus(ocorrencia.status);

  return {
    key: `ocorrencia:${ocorrencia.id || ocorrencia.eventoId}:${ocorrencia.dataEfetiva}`,
    tipo: 'ocorrencia',
    eventoId: ocorrencia.eventoId,
    ocorrenciaId: ocorrencia.id > 0 ? ocorrencia.id : null,
    titulo: ocorrencia.eventoTitulo,
    descricao: ocorrencia.observacoes,
    status,
    cancelado: ocorrencia.cancelada || status === 'CANCELADO',
    motivoCancelamento: ocorrencia.motivoCancelamento,
    dataReferencia: ocorrencia.dataEfetiva || ocorrencia.dataHora,
    fimEm: null,
    local: ocorrencia.local,
    grupoId: ocorrencia.grupoId,
    grupoNome: ocorrencia.grupoNome,
    responsavelId: ocorrencia.responsavelId,
    responsavelNome: ocorrencia.responsavelNome,
    recorrente: ocorrencia.recorrente,
    isTemplate: false,
    eventoTemplateId: ocorrencia.eventoTemplateId,
  };
}

function matchesText(values: (string | null)[], filter: string) {
  if (!filter) return true;
  const normalizedFilter = normalizeSearch(filter);
  return values.some((value) => normalizeSearch(value ?? '').includes(normalizedFilter));
}

function matchesStatus(item: EventoListItem, status: EventosStatus) {
  if (status === 'todos') return true;
  if (status === 'cancelado') return item.cancelado || item.status === 'CANCELADO';
  if (status === 'ativos') return !item.cancelado && ['ATIVO', 'PUBLICADO', 'AGENDADA'].includes(item.status);
  if (status === 'agendado') return item.status === 'AGENDADA' || item.status === 'PUBLICADO';
  if (status === 'em_andamento') return item.status === 'EM_ANDAMENTO' || item.status === 'EMANDAMENTO';
  if (status === 'realizado') return item.status === 'REALIZADA' || item.status === 'CONCLUIDO';
  return true;
}

function matchesTipo(item: EventoListItem, tipo: EventosTipo) {
  if (tipo === 'todos') return true;
  if (tipo === 'recorrente') return item.recorrente;
  if (tipo === 'unico') return !item.recorrente && !item.isTemplate;
  if (tipo === 'template') return item.isTemplate || Boolean(item.eventoTemplateId);
  return true;
}

function matchesPeriodo(item: EventoListItem, periodo: EventosPeriodo) {
  if (periodo === 'todos') return true;
  const date = parseDate(item.dataReferencia);
  if (!date) return true;

  const now = new Date();
  if (periodo === 'hoje') return sameDay(date, now);
  if (periodo === 'historico') return date.getTime() < startOfDay(now).getTime();
  if (periodo === 'semana') return isBetween(date, startOfDay(now), addDays(startOfDay(now), 7));
  if (periodo === 'mes') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  if (periodo === 'ano') return date.getFullYear() === now.getFullYear();

  return true;
}

function getPeriodoWindow(periodo: EventosPeriodo) {
  const now = new Date();
  if (periodo === 'hoje') return { dataInicio: 'hoje', dataFim: null };
  if (periodo === 'historico') return { dataInicio: toIsoDate(addDays(now, -180)), dataFim: toIsoDate(now) };
  if (periodo === 'semana') return { dataInicio: toIsoDate(now), dataFim: toIsoDate(addDays(now, 7)) };
  if (periodo === 'mes') return { dataInicio: toIsoDate(startOfMonth(now)), dataFim: toIsoDate(endOfMonth(now)) };
  if (periodo === 'ano') return { dataInicio: toIsoDate(startOfYear(now)), dataFim: toIsoDate(endOfYear(now)) };

  return { dataInicio: toIsoDate(addDays(now, -30)), dataFim: toIsoDate(addDays(now, 90)) };
}

function mergePageInfo(eventos: PageInfo, ocorrencias: PageInfo, fallbackCount: number): PageInfo {
  const pageSize = Math.max(eventos.pageSize || 0, ocorrencias.pageSize || 0, 20);
  const totalCount = Math.max(eventos.totalCount || 0, ocorrencias.totalCount || 0, fallbackCount);

  return {
    currentPage: Math.max(eventos.currentPage || 0, ocorrencias.currentPage || 0, 1),
    pageSize,
    totalPages: Math.max(eventos.totalPages || 0, ocorrencias.totalPages || 0, Math.ceil(totalCount / pageSize)),
    totalCount,
  };
}

function sortEventos(items: EventoListItem[]) {
  return [...items].sort((a, b) => {
    const aDate = parseDate(a.dataReferencia)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDate = parseDate(b.dataReferencia)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  });
}

function assertScope(scope: EventosScope) {
  if (!Number.isInteger(scope.usuarioId) || scope.usuarioId <= 0) {
    throw new Error('Usuario autenticado obrigatorio para listar eventos.');
  }

  if (!Number.isInteger(scope.estruturaId) || scope.estruturaId <= 0) {
    throw new Error('Estrutura ativa obrigatoria para listar eventos.');
  }
}

function normalizeStatus(value: string | null) {
  return normalizeSearch(value ?? 'ATIVO').replaceAll(' ', '_').toUpperCase();
}

function normalizeFreeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function clampPositiveInteger(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(value: Date, start: Date, end: Date) {
  const time = value.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(value: Date) {
  return new Date(value.getFullYear(), 0, 1);
}

function endOfYear(value: Date) {
  return new Date(value.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}
