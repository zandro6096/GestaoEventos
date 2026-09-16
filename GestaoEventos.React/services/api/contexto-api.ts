import { toCamelCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

type ApiEnvelope<T> = {
  data?: T | null;
};

export type EstruturaSumario = {
  id: number;
  nome: string;
  papel: string;
  criadoPor: string;
  dataCriacao: string;
  logoUrl?: string | null;
};

export type LimitesPlano = {
  maxEventos: number;
  maxUsuarios: number;
  maxGrupos: number;
};

export type ContextoInicial = {
  usuarioId: number;
  usuarioNome: string;
  estruturaId: number | null;
  grupoId: number | null;
  estruturaNome: string | null;
  estruturaLogoUrl?: string | null;
  grupoNome: string | null;
  temEstrutura: boolean;
  estruturas: EstruturaSumario[];
  plano: string | null;
  limites: LimitesPlano | null;
};

type ContextoInicialCompat = Partial<ContextoInicial> & {
  estrutuaId?: unknown;
};

export const contextoApi = {
  async getContextoInicial(usuarioId: number): Promise<ContextoInicial> {
    const response = await httpClient.get<ApiEnvelope<unknown>>(apiRoute('/api/contexto/inicial'), {
      params: { usuario_id: usuarioId },
    });

    const body = toCamelCase<ApiEnvelope<unknown> | unknown>(response.data);
    const data = isEnvelope(body) ? body.data : body;

    return normalizeContextoInicial(data);
  },
};

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return Boolean(value && typeof value === 'object' && 'data' in value);
}

function normalizeContextoInicial(value: unknown): ContextoInicial {
  const contexto = toCamelCase<ContextoInicialCompat>(value);
  const estruturas = Array.isArray(contexto.estruturas) ? contexto.estruturas.map(normalizeEstrutura) : [];
  const estruturaId = toPositiveInt(contexto.estruturaId ?? contexto.estrutuaId);

  return {
    usuarioId: toPositiveInt(contexto.usuarioId) ?? 0,
    usuarioNome: toStringOrFallback(contexto.usuarioNome, 'Usuario'),
    estruturaId,
    grupoId: toPositiveInt(contexto.grupoId),
    estruturaNome: toNullableString(contexto.estruturaNome),
    estruturaLogoUrl: toNullableString(contexto.estruturaLogoUrl),
    grupoNome: toNullableString(contexto.grupoNome),
    temEstrutura: Boolean(contexto.temEstrutura ?? estruturas.length > 0),
    estruturas,
    plano: toNullableString(contexto.plano),
    limites: normalizeLimites(contexto.limites),
  };
}

function normalizeEstrutura(value: unknown): EstruturaSumario {
  const estrutura = toCamelCase<Partial<EstruturaSumario>>(value);

  return {
    id: toPositiveInt(estrutura.id) ?? 0,
    nome: toStringOrFallback(estrutura.nome, 'Estrutura'),
    papel: toStringOrFallback(estrutura.papel, 'Membro'),
    criadoPor: toStringOrFallback(estrutura.criadoPor, 'Sistema'),
    dataCriacao: toStringOrFallback(estrutura.dataCriacao, ''),
    logoUrl: toNullableString(estrutura.logoUrl),
  };
}

function normalizeLimites(value: unknown): LimitesPlano | null {
  if (!value || typeof value !== 'object') return null;

  const limites = toCamelCase<Partial<LimitesPlano>>(value);

  return {
    maxEventos: toNonNegativeInt(limites.maxEventos),
    maxUsuarios: toNonNegativeInt(limites.maxUsuarios),
    maxGrupos: toNonNegativeInt(limites.maxGrupos),
  };
}

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toNonNegativeInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function toStringOrFallback(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}
