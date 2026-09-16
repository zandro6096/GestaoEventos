import { toCamelCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type AuditoriaDto = {
  id: number;
  usuarioId: number;
  nomeUsuario: string;
  acao: string;
  entidade: string;
  entidadeId: number;
  descricao: string;
  dadosAntigos?: string | null;
  dadosNovos?: string | null;
  criadoEm: string;
};

export type AuditoriaFilters = {
  estruturaId: number;
  entidade?: string;
  acao?: string;
  dataInicio?: string;
  dataFim?: string;
  skip?: number;
  take?: number;
};

export type AuditoriaResponse = { data: AuditoriaDto[]; total: number; skip: number; take: number };

export const auditoriaApi = {
  async list(filters: AuditoriaFilters): Promise<AuditoriaResponse> {
    const response = await httpClient.get(apiRoute('/api/auditoria'), { params: { estrutura_id: filters.estruturaId, entidade: filters.entidade || undefined, acao: filters.acao || undefined, data_inicio: filters.dataInicio || undefined, data_fim: filters.dataFim || undefined, skip: filters.skip ?? 0, take: filters.take ?? 50 } });
    return normalizeResponse(response.data, filters);
  },
};

function normalizeResponse(value: unknown, filters: AuditoriaFilters): AuditoriaResponse {
  const camel = toCamelCase<unknown>(value);
  const root = asRecord(camel);
  const nested = root?.data && typeof root.data === 'object' && !Array.isArray(root.data) ? asRecord(root.data) : root;
  const data = nested?.data;
  return {
    data: Array.isArray(data) ? data as AuditoriaDto[] : [],
    total: toNumber(nested?.total),
    skip: toNumber(nested?.skip) || filters.skip || 0,
    take: toNumber(nested?.take) || filters.take || 50,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null { return value && typeof value === 'object' ? value as Record<string, unknown> : null; }
function toNumber(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
