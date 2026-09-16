import { toCamelCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

type ApiEnvelope<T> = {
  data?: T | null;
};

export type JornadaApiScope = {
  usuarioId: number;
  estruturaId: number;
  grupoId?: number | null;
};

export type JornadaOcorrenciaDto = {
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
  exigeConfirmacao: boolean;
  podeConfirmarResponsavel: boolean;
  responsavelId: number | null;
  responsavelNome: string | null;
};

export type JornadaParticipacaoDto = {
  id: number;
  eventoId: number;
  eventoTitulo: string;
  usuarioId: number;
  usuarioNome: string;
  ocorridoEm: string;
  status: string;
  observacao: string | null;
  registradoEm: string;
};

export type JornadaFrequenciaDto = {
  percentualFrequencia: number;
  totalParticipacoes: number;
  totalPresencas: number;
  totalAusencias: number;
  totalPendentes: number;
};

export type JornadaPendenciaGrupoResumoDto = {
  grupoId: number;
  grupoNome: string;
  total: number;
  noDia: number;
  naSemana: number;
  atrasadas: number;
  maiorAtrasoDias: number;
};

export type JornadaPendenciasResumoDto = {
  total: number;
  grupos: JornadaPendenciaGrupoResumoDto[];
  noDia: number;
  naSemana: number;
  atrasadas: number;
  maiorAtrasoDias: number;
};

export type JornadaPendenciaDto = {
  ocorrenciaId: number;
  eventoId: number;
  eventoTitulo: string;
  dataHora: string;
  grupoId: number;
  grupoNome: string;
  responsavelNome: string | null;
};

export type JornadaPendenciasDetalheDto = {
  itens: JornadaPendenciaDto[];
  temMais: boolean;
};

export type JornadaOcorrenciasParams = JornadaApiScope & {
  dataInicio?: 'hoje' | 'futuros' | string;
  dataFim?: string | null;
  take?: number;
  skip?: number;
  somenteParticipante?: boolean;
};

export const jornadaApi = {
  async getOcorrencias(params: JornadaOcorrenciasParams): Promise<JornadaOcorrenciaDto[]> {
    const response = await httpClient.get<unknown>(apiRoute('/api/ocorrencias'), {
      params: cleanParams({
        usuario_id: params.usuarioId,
        estrutura_id: params.estruturaId,
        grupo_id: params.grupoId,
        data_inicio: params.dataInicio ?? 'hoje',
        data_fim: params.dataFim,
        take: params.take ?? 10,
        skip: params.skip ?? 0,
        somente_participante: params.somenteParticipante,
      }),
    });

    return toArray(readData(response.data)).map(normalizeOcorrencia);
  },

  async getParticipacoes(params: JornadaApiScope & { skip?: number; take?: number }): Promise<JornadaParticipacaoDto[]> {
    const response = await httpClient.get<unknown>(apiRoute('/api/participacoes'), {
      params: cleanParams({
        usuario_id: params.usuarioId,
        estrutura_id: params.estruturaId,
        skip: params.skip ?? 0,
        take: params.take ?? 50,
      }),
    });

    return toArray(readData(response.data)).map(normalizeParticipacao);
  },

  async getFrequencia(params: JornadaApiScope & { periodoDias?: number }): Promise<JornadaFrequenciaDto> {
    const response = await httpClient.get<unknown>(apiRoute('/api/participacoes/frequencia'), {
      params: cleanParams({
        usuario_id: params.usuarioId,
        estrutura_id: params.estruturaId,
        periodo_dias: params.periodoDias ?? 30,
      }),
    });

    return normalizeFrequencia(readData(response.data));
  },

  async getPendenciasResumo(params: JornadaApiScope): Promise<JornadaPendenciasResumoDto> {
    const response = await httpClient.get<unknown>(apiRoute('/api/pendencias/minhas/resumo'), {
      params: cleanParams({
        usuario_id: params.usuarioId,
        estrutura_id: params.estruturaId,
      }),
    });

    return normalizePendenciasResumo(readData(response.data));
  },

  async getPendenciasDetalhe(
    params: JornadaApiScope & { grupoId: number; skip?: number; take?: number },
  ): Promise<JornadaPendenciasDetalheDto> {
    const response = await httpClient.get<unknown>(apiRoute('/api/pendencias/minhas'), {
      params: cleanParams({
        usuario_id: params.usuarioId,
        estrutura_id: params.estruturaId,
        grupo_id: params.grupoId,
        skip: params.skip ?? 0,
        take: params.take ?? 10,
      }),
    });

    return normalizePendenciasDetalhe(readData(response.data));
  },
};

function readData(value: unknown) {
  const body = toCamelCase<ApiEnvelope<unknown> | unknown>(value);
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as ApiEnvelope<unknown>).data;
  }

  return body;
}

function normalizeOcorrencia(value: unknown): JornadaOcorrenciaDto {
  const item = toCamelCase<Partial<JornadaOcorrenciaDto>>(value);
  const dataHora = toDateString(item.dataHora);
  const dataEfetiva = toDateString(item.dataEfetiva) || dataHora;

  return {
    id: toNumber(item.id),
    eventoId: toNumber(item.eventoId),
    eventoTitulo: toStringOrFallback(item.eventoTitulo, 'Evento'),
    dataHora,
    dataEfetiva,
    status: toStringOrFallback(item.status, 'AGENDADA'),
    cancelada: Boolean(item.cancelada),
    motivoCancelamento: toNullableString(item.motivoCancelamento),
    observacoes: toNullableString(item.observacoes),
    criadoEm: toDateString(item.criadoEm),
    grupoId: toNumber(item.grupoId),
    grupoNome: toStringOrFallback(item.grupoNome, 'Grupo'),
    local: toNullableString(item.local),
    exigeConfirmacao: Boolean(item.exigeConfirmacao),
    podeConfirmarResponsavel: Boolean(item.podeConfirmarResponsavel),
    responsavelId: toPositiveInt(item.responsavelId),
    responsavelNome: toNullableString(item.responsavelNome),
  };
}

function normalizeParticipacao(value: unknown): JornadaParticipacaoDto {
  const item = toCamelCase<Partial<JornadaParticipacaoDto>>(value);

  return {
    id: toNumber(item.id),
    eventoId: toNumber(item.eventoId),
    eventoTitulo: toStringOrFallback(item.eventoTitulo, 'Evento'),
    usuarioId: toNumber(item.usuarioId),
    usuarioNome: toStringOrFallback(item.usuarioNome, 'Usuario'),
    ocorridoEm: toDateString(item.ocorridoEm),
    status: toStringOrFallback(item.status, 'PENDENTE'),
    observacao: toNullableString(item.observacao),
    registradoEm: toDateString(item.registradoEm),
  };
}

function normalizeFrequencia(value: unknown): JornadaFrequenciaDto {
  const item = toCamelCase<Partial<JornadaFrequenciaDto>>(value);

  return {
    percentualFrequencia: toNumber(item.percentualFrequencia),
    totalParticipacoes: toNumber(item.totalParticipacoes),
    totalPresencas: toNumber(item.totalPresencas),
    totalAusencias: toNumber(item.totalAusencias),
    totalPendentes: toNumber(item.totalPendentes),
  };
}

function normalizePendenciasResumo(value: unknown): JornadaPendenciasResumoDto {
  const item = toCamelCase<Partial<JornadaPendenciasResumoDto>>(value);

  return {
    total: toNumber(item.total),
    grupos: toArray(item.grupos).map(normalizePendenciaGrupoResumo),
    noDia: toNumber(item.noDia),
    naSemana: toNumber(item.naSemana),
    atrasadas: toNumber(item.atrasadas),
    maiorAtrasoDias: toNumber(item.maiorAtrasoDias),
  };
}

function normalizePendenciaGrupoResumo(value: unknown): JornadaPendenciaGrupoResumoDto {
  const item = toCamelCase<Partial<JornadaPendenciaGrupoResumoDto>>(value);

  return {
    grupoId: toNumber(item.grupoId),
    grupoNome: toStringOrFallback(item.grupoNome, 'Grupo'),
    total: toNumber(item.total),
    noDia: toNumber(item.noDia),
    naSemana: toNumber(item.naSemana),
    atrasadas: toNumber(item.atrasadas),
    maiorAtrasoDias: toNumber(item.maiorAtrasoDias),
  };
}

function normalizePendenciasDetalhe(value: unknown): JornadaPendenciasDetalheDto {
  const item = toCamelCase<Partial<JornadaPendenciasDetalheDto>>(value);

  return {
    itens: toArray(item.itens).map(normalizePendencia),
    temMais: Boolean(item.temMais),
  };
}

function normalizePendencia(value: unknown): JornadaPendenciaDto {
  const item = toCamelCase<Partial<JornadaPendenciaDto>>(value);

  return {
    ocorrenciaId: toNumber(item.ocorrenciaId),
    eventoId: toNumber(item.eventoId),
    eventoTitulo: toStringOrFallback(item.eventoTitulo, 'Evento'),
    dataHora: toDateString(item.dataHora),
    grupoId: toNumber(item.grupoId),
    grupoNome: toStringOrFallback(item.grupoNome, 'Grupo'),
    responsavelNome: toNullableString(item.responsavelNome),
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

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
