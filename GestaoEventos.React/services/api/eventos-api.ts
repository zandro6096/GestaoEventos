import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

type ApiEnvelope<T> = {
  data?: T | null;
  pageInfo?: PageInfoDto | null;
  pagedInfo?: PageInfoDto | null;
};

type PageInfoDto = {
  currentPage?: number;
  pageNumber?: number;
  pageSize?: number;
  itemsPerPage?: number;
  totalPages?: number;
  totalCount?: number;
  totalItems?: number;
  totalRecords?: number;
};

export type PageInfo = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
};

export type EventoDto = {
  id: number;
  titulo: string;
  descricao: string | null;
  dataInicio: string;
  inicioEm: string;
  dataFim: string | null;
  fimEm: string | null;
  local: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  grupoId: number;
  grupoNome: string | null;
  responsavelPrincipalId: number | null;
  responsavelPrincipalNome: string | null;
  responsavelAtualId: number | null;
  responsavelAtualNome: string | null;
  eventoTemplateId: number | null;
  tipoRecorrencia: string | null;
  intervalo: number | null;
  diasSemanais: number[];
  dataFimRecorrencia: string | null;
  maxOcorrencias: number | null;
  recorrente: boolean;
  isTemplate: boolean;
  status: string;
  podeCancelar: boolean;
  permitirReatribuicaoResponsavel: boolean;
  motivoCancelamento: string | null;
  canceladoEm: string | null;
  consolidacaoPermanente: boolean;
  permitirReabertura: boolean;
  permitirPresencaAgrupada: boolean;
  chaveAgrupamentoPresenca: string | null;
  dataLimiteAjuste: string | null;
  exigeConfirmacao: boolean;
  criadoEm: string;
};

export type OcorrenciaDto = {
  id: number;
  eventoId: number;
  eventoTitulo: string;
  dataHora: string;
  dataEfetiva: string;
  status: string;
  cancelada: boolean;
  motivoCancelamento: string | null;
  observacoes: string | null;
  criadoEm: string;
  grupoId: number;
  grupoNome: string;
  local: string | null;
  eventoTemplateId: number | null;
  permitirPresencaAgrupada: boolean;
  recorrente: boolean;
  exigeConfirmacao: boolean;
  confirmacaoResponsavel: boolean;
  confirmacaoResponsavelUsuarioId: number | null;
  confirmacaoResponsavelEm: string | null;
  confirmacaoResponsavelObservacao: string | null;
  podeConfirmarResponsavel: boolean;
  responsavelId: number | null;
  responsavelNome: string | null;
  isVirtual: boolean;
  permitirReabertura: boolean;
  finalizadaEm: string | null;
  eventoCicloId: number | null;
};

export type EventoConfiguracaoDto = {
  id: number;
  eventoTemplateId: number;
  grupoId: number;
  responsavelId: number;
  dia: string;
  hora: string;
  local: string | null;
  membrosIds: number[];
  status: string;
  criadoEm: string;
};

export type ConfirmacaoResponsavelDto = {
  ocorrenciaId: number;
  confirmacaoResponsavel: boolean;
  confirmacaoResponsavelUsuarioId: number | null;
  confirmacaoResponsavelEm: string | null;
  confirmacaoResponsavelObservacao: string | null;
};

export type ListEventosParams = {
  estruturaId: number;
  grupoId?: number | null;
  pageNumber?: number;
  pageSize?: number;
  apenasTemplates?: boolean | null;
};

export type ListOcorrenciasParams = {
  usuarioId: number;
  estruturaId: number;
  grupoId?: number | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  take?: number;
  skip?: number;
  eventoId?: number | null;
  includeCanceladas?: boolean;
};

export type ListConfiguracoesPorResponsavelParams = {
  responsavelId: number;
  estruturaId?: number | null;
};

export type UpdateOcorrenciaStatusRequest = {
  novoStatus: string;
  motivo?: string | null;
  novaDataHora?: string | null;
  observacoes?: string | null;
  usuarioId?: number | null;
};

export type UpdateEventoRequest = Record<string, unknown>;

export type PagedApiResult<T> = {
  data: T[];
  pageInfo: PageInfo;
};

export const eventosApi = {
  async criar(request: Record<string, unknown>): Promise<number | null> {
    const response = await httpClient.post(apiRoute('/api/eventos'), toSnakeCase(request));
    const data = readData(response.data) as { id?: number; evento?: { id?: number } } | null;
    return toPositiveInt(data?.id ?? data?.evento?.id);
  },

  async materializar(eventoId: number, dataHora: string): Promise<number | null> {
    const response = await httpClient.post(apiRoute(`/api/eventos/${eventoId}/materializar`), { data_hora: dataHora });
    const data = readData(response.data) as { ocorrenciaId?: number } | null;
    return toPositiveInt(data?.ocorrenciaId);
  },

  async conflitos(estruturaId: number, grupoId: number, dataInicio: string, dataFim: string): Promise<EventoDto[]> {
    const response = await httpClient.get(apiRoute('/api/eventos/conflitos'), { params: {
      estrutura_id: estruturaId, grupos_ids: String(grupoId), data_inicio: dataInicio, data_fim: dataFim,
    } });
    const data = readData(response.data);
    if (!Array.isArray(data)) throw new Error('Resposta invalida ao consultar conflitos.');
    return data.map(normalizeEvento);
  },

  async listEventos(params: ListEventosParams): Promise<PagedApiResult<EventoDto>> {
    const response = await httpClient.get<unknown>(apiRoute('/api/eventos'), {
      params: cleanParams({
        page_number: params.pageNumber ?? 1,
        page_size: params.pageSize ?? 20,
        estrutura_id: params.estruturaId,
        grupo_id: params.grupoId,
        apenas_templates: params.apenasTemplates,
      }),
    });

    const envelope = readEnvelope(response.data);

    return {
      data: toArray(envelope.data).map(normalizeEvento),
      pageInfo: normalizePageInfo(envelope.pageInfo),
    };
  },

  async getEventoById(id: number): Promise<EventoDto> {
    const response = await httpClient.get<unknown>(apiRoute(`/api/eventos/${id}`));
    return normalizeEvento(readData(response.data));
  },

  async atualizar(id: number, request: UpdateEventoRequest): Promise<EventoDto> {
    const response = await httpClient.put<unknown>(apiRoute(`/api/eventos/${id}`), toSnakeCase({ id, ...request }));
    return normalizeEvento(readData(response.data));
  },

  async listOcorrencias(params: ListOcorrenciasParams): Promise<PagedApiResult<OcorrenciaDto>> {
    const response = await httpClient.get<unknown>(apiRoute('/api/ocorrencias'), {
      params: cleanParams({
        usuario_id: params.usuarioId,
        estrutura_id: params.estruturaId,
        grupo_id: params.grupoId,
        data_inicio: params.dataInicio,
        data_fim: params.dataFim,
        take: params.take ?? 20,
        skip: params.skip ?? 0,
        evento_id: params.eventoId,
        include_canceladas: params.includeCanceladas,
      }),
    });

    const envelope = readEnvelope(response.data);

    return {
      data: toArray(envelope.data).map(normalizeOcorrencia),
      pageInfo: normalizePageInfo(envelope.pageInfo),
    };
  },

  async listarConfiguracoesPorResponsavel(params: ListConfiguracoesPorResponsavelParams): Promise<EventoConfiguracaoDto[]> {
    const response = await httpClient.get<unknown>(apiRoute('/api/eventos/configuracoes'), {
      params: cleanParams({
        responsavel_id: params.responsavelId,
        estrutura_id: params.estruturaId,
      }),
    });

    return toArray(readData(response.data)).map(normalizeEventoConfiguracao);
  },

  async confirmarResponsavel(ocorrenciaId: number, observacao?: string | null): Promise<ConfirmacaoResponsavelDto> {
    const response = await httpClient.post<unknown>(
      apiRoute(`/api/ocorrencias/${ocorrenciaId}/confirmacao-responsavel`),
      toSnakeCase({ observacao }),
    );

    return normalizeConfirmacaoResponsavel(readData(response.data));
  },

  async atualizarOcorrenciaStatus(
    ocorrenciaId: number,
    request: UpdateOcorrenciaStatusRequest,
  ): Promise<OcorrenciaDto> {
    const response = await httpClient.put<unknown>(
      apiRoute(`/api/ocorrencias/${ocorrenciaId}/status`),
      toSnakeCase({ id: ocorrenciaId, ...request }),
    );

    return normalizeOcorrencia(readData(response.data));
  },
};

function readEnvelope(value: unknown): ApiEnvelope<unknown> {
  const body = toCamelCase<ApiEnvelope<unknown> | unknown>(value);
  if (body && typeof body === 'object' && 'data' in body) {
    const envelope = body as ApiEnvelope<unknown>;
    return {
      data: envelope.data,
      pageInfo: envelope.pageInfo ?? envelope.pagedInfo ?? null,
    };
  }

  return {
    data: body,
    pageInfo: null,
  };
}

function readData(value: unknown) {
  const body = toCamelCase<ApiEnvelope<unknown> | unknown>(value);
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as ApiEnvelope<unknown>).data;
  }

  return body;
}

function normalizeEvento(value: unknown): EventoDto {
  const item = toCamelCase<Partial<EventoDto>>(value);
  const dataInicio = toDateString(item.dataInicio) || toDateString(item.inicioEm);
  const inicioEm = toDateString(item.inicioEm) || dataInicio;
  const dataFim = toNullableDateString(item.dataFim) ?? toNullableDateString(item.fimEm);
  const fimEm = toNullableDateString(item.fimEm) ?? dataFim;
  const status = toStringOrFallback(item.status, item.canceladoEm ? 'CANCELADO' : 'ATIVO');

  return {
    id: toNumber(item.id),
    titulo: toStringOrFallback(item.titulo, 'Evento'),
    descricao: toNullableString(item.descricao),
    dataInicio,
    inicioEm,
    dataFim,
    fimEm,
    local: toNullableString(item.local),
    cep: toNullableString(item.cep),
    logradouro: toNullableString(item.logradouro),
    numero: toNullableString(item.numero),
    complemento: toNullableString(item.complemento),
    bairro: toNullableString(item.bairro),
    cidade: toNullableString(item.cidade),
    estado: toNullableString(item.estado),
    grupoId: toNumber(item.grupoId),
    grupoNome: toNullableString(item.grupoNome),
    responsavelPrincipalId: toPositiveInt(item.responsavelPrincipalId),
    responsavelPrincipalNome: toNullableString(item.responsavelPrincipalNome),
    responsavelAtualId: toPositiveInt(item.responsavelAtualId),
    responsavelAtualNome: toNullableString(item.responsavelAtualNome),
    eventoTemplateId: toPositiveInt(item.eventoTemplateId),
    tipoRecorrencia: toNullableString(item.tipoRecorrencia),
    intervalo: toPositiveInt(item.intervalo),
    diasSemanais: Array.isArray(item.diasSemanais) ? item.diasSemanais.map(toNumber).filter((day) => day >= 0 && day <= 6) : [],
    dataFimRecorrencia: toNullableDateString(item.dataFimRecorrencia),
    maxOcorrencias: toPositiveInt(item.maxOcorrencias),
    recorrente: Boolean(item.recorrente),
    isTemplate: Boolean(item.isTemplate),
    status,
    podeCancelar: Boolean(item.podeCancelar),
    permitirReatribuicaoResponsavel: Boolean(item.permitirReatribuicaoResponsavel),
    motivoCancelamento: toNullableString(item.motivoCancelamento),
    canceladoEm: toNullableDateString(item.canceladoEm),
    consolidacaoPermanente: Boolean(item.consolidacaoPermanente),
    permitirReabertura: item.permitirReabertura !== false,
    permitirPresencaAgrupada: Boolean(item.permitirPresencaAgrupada),
    chaveAgrupamentoPresenca: toNullableString(item.chaveAgrupamentoPresenca),
    dataLimiteAjuste: toNullableDateString(item.dataLimiteAjuste),
    exigeConfirmacao: Boolean(item.exigeConfirmacao),
    criadoEm: toDateString(item.criadoEm),
  };
}

function normalizeOcorrencia(value: unknown): OcorrenciaDto {
  const item = toCamelCase<Partial<OcorrenciaDto>>(value);
  const dataHora = toDateString(item.dataHora);
  const dataEfetiva = toDateString(item.dataEfetiva) || dataHora;

  return {
    id: toNumber(item.id),
    eventoId: toNumber(item.eventoId),
    eventoTitulo: toStringOrFallback(item.eventoTitulo, 'Evento'),
    dataHora,
    dataEfetiva,
    status: typeof item.status === 'number'
      ? (['Agendada', 'EmAndamento', 'Realizada', 'Cancelada', 'Reagendada', 'EmAjuste'][item.status] ?? 'Desconhecida')
      : toStringOrFallback(item.status, item.cancelada ? 'CANCELADO' : 'AGENDADA'),
    cancelada: Boolean(item.cancelada),
    motivoCancelamento: toNullableString(item.motivoCancelamento),
    observacoes: toNullableString(item.observacoes),
    criadoEm: toDateString(item.criadoEm),
    grupoId: toNumber(item.grupoId),
    grupoNome: toStringOrFallback(item.grupoNome, 'Grupo'),
    local: toNullableString(item.local),
    eventoTemplateId: toPositiveInt(item.eventoTemplateId),
    permitirPresencaAgrupada: Boolean(item.permitirPresencaAgrupada),
    recorrente: Boolean(item.recorrente),
    exigeConfirmacao: Boolean(item.exigeConfirmacao),
    confirmacaoResponsavel: Boolean(item.confirmacaoResponsavel),
    confirmacaoResponsavelUsuarioId: toPositiveInt(item.confirmacaoResponsavelUsuarioId),
    confirmacaoResponsavelEm: toNullableDateString(item.confirmacaoResponsavelEm),
    confirmacaoResponsavelObservacao: toNullableString(item.confirmacaoResponsavelObservacao),
    podeConfirmarResponsavel: Boolean(item.podeConfirmarResponsavel),
    responsavelId: toPositiveInt(item.responsavelId),
    responsavelNome: toNullableString(item.responsavelNome),
    isVirtual: Boolean(item.isVirtual),
    permitirReabertura: Boolean(item.permitirReabertura),
    finalizadaEm: toNullableDateString(item.finalizadaEm),
    eventoCicloId: toPositiveInt(item.eventoCicloId),
  };
}

function normalizeEventoConfiguracao(value: unknown): EventoConfiguracaoDto {
  const item = toCamelCase<Partial<EventoConfiguracaoDto>>(value);

  return {
    id: toNumber(item.id),
    eventoTemplateId: toNumber(item.eventoTemplateId),
    grupoId: toNumber(item.grupoId),
    responsavelId: toNumber(item.responsavelId),
    dia: toStringOrFallback(item.dia, ''),
    hora: toStringOrFallback(item.hora, ''),
    local: toNullableString(item.local),
    membrosIds: Array.isArray(item.membrosIds)
      ? item.membrosIds.map(toNumber).filter((id) => id > 0)
      : [],
    status: toStringOrFallback(item.status, 'ATIVO'),
    criadoEm: toDateString(item.criadoEm),
  };
}

function normalizeConfirmacaoResponsavel(value: unknown): ConfirmacaoResponsavelDto {
  const item = toCamelCase<Partial<ConfirmacaoResponsavelDto>>(value);

  return {
    ocorrenciaId: toNumber(item.ocorrenciaId),
    confirmacaoResponsavel: Boolean(item.confirmacaoResponsavel),
    confirmacaoResponsavelUsuarioId: toPositiveInt(item.confirmacaoResponsavelUsuarioId),
    confirmacaoResponsavelEm: toNullableDateString(item.confirmacaoResponsavelEm),
    confirmacaoResponsavelObservacao: toNullableString(item.confirmacaoResponsavelObservacao),
  };
}

function normalizePageInfo(value: PageInfoDto | null | undefined): PageInfo {
  return {
    currentPage: toNumber(value?.currentPage ?? value?.pageNumber, 1),
    pageSize: toNumber(value?.pageSize ?? value?.itemsPerPage, 20),
    totalPages: toNumber(value?.totalPages, 0),
    totalCount: toNumber(value?.totalCount ?? value?.totalItems ?? value?.totalRecords, 0),
  };
}

function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined && value !== ''),
  );
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function toStringOrFallback(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function toDateString(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString();

  return '';
}

function toNullableDateString(value: unknown): string | null {
  const normalized = toDateString(value);
  return normalized || null;
}
