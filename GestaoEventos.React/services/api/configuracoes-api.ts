import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

type ApiEnvelope<T> = { data?: T | null };

export type TipoGrupoDto = {
  id: number;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  estruturaId: number;
  permiteSubgrupos: boolean;
  nivelHierarquicoPadrao: number | null;
  ordem: number;
  ativo: boolean;
};

export type TipoEventoDto = {
  id: number;
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  estruturaId: number;
  permiteRecorrencia: boolean;
  requerConfirmacao: boolean;
  duracaoPadraoMinutos: number | null;
  ordem: number;
  ativo: boolean;
};

export type TipoKind = 'grupo' | 'evento';
export type TipoDto = TipoGrupoDto | TipoEventoDto;

export type TipoPayload = {
  nome: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  estruturaId: number;
  ordem: number;
  ativo?: boolean;
  permiteSubgrupos?: boolean;
  nivelHierarquicoPadrao?: number | null;
  permiteRecorrencia?: boolean;
  requerConfirmacao?: boolean;
  duracaoPadraoMinutos?: number | null;
};

export type PlanoDto = {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  duracaoDias: number;
  ativo: boolean;
  maxEstruturas: number;
  maxEventosAtivos: number;
  maxParticipantes: number;
  historicoMeses: number;
  permiteTemplatesCustomizados: boolean;
  stripePriceIdMensal: string | null;
  stripePriceIdAnual: string | null;
};

export type AssinaturaStatusDto = {
  ativo: boolean;
  planoId: number | null;
  planoNome: string | null;
  expiraEm: string | null;
  podeGerenciar: boolean;
  maxEstruturas: number;
  maxEventosAtivos: number;
  maxParticipantes: number;
  permiteTemplatesCustomizados: boolean;
};

export type CheckoutResponse = { url: string; sessionId: string };

export const configuracoesApi = {
  async listTipos(kind: TipoKind, estruturaId: number, apenasAtivos = false): Promise<TipoDto[]> {
    const path = kind === 'grupo' ? '/api/tipos-grupo' : '/api/tipos-evento';
    const response = await httpClient.get(apiRoute(path), {
      params: { estrutura_id: estruturaId, apenas_ativos: apenasAtivos, skip: 0, take: 100 },
    });
    return readList<TipoDto>(response.data);
  },

  async createTipo(kind: TipoKind, payload: TipoPayload): Promise<TipoDto> {
    const path = kind === 'grupo' ? '/api/tipos-grupo' : '/api/tipos-evento';
    const response = await httpClient.post<ApiEnvelope<TipoDto>>(apiRoute(path as `/api/${string}`), toSnakeCase(payload));
    return readValue<TipoDto>(response.data);
  },

  async updateTipo(kind: TipoKind, id: number, payload: Omit<TipoPayload, 'estruturaId'>): Promise<TipoDto> {
    const path = kind === 'grupo' ? `/api/tipos-grupo/${id}` : `/api/tipos-evento/${id}`;
    const response = await httpClient.put<ApiEnvelope<TipoDto>>(apiRoute(path as `/api/${string}`), toSnakeCase({ id, ...payload }));
    return readValue<TipoDto>(response.data);
  },

  async deleteTipo(kind: TipoKind, id: number): Promise<TipoDto> {
    const path = kind === 'grupo' ? `/api/tipos-grupo/${id}` : `/api/tipos-evento/${id}`;
    const response = await httpClient.delete<ApiEnvelope<TipoDto>>(apiRoute(path as `/api/${string}`));
    return readValue<TipoDto>(response.data);
  },

  async listPlanos(): Promise<PlanoDto[]> {
    const response = await httpClient.get(apiRoute('/api/planos'), { params: { skip: 0, take: 100 } });
    return readList<PlanoDto>(response.data);
  },

  async getAssinaturaStatus(): Promise<AssinaturaStatusDto> {
    const response = await httpClient.get<AssinaturaStatusDto>(apiRoute('/api/assinaturas/status'));
    return toCamelCase<AssinaturaStatusDto>(response.data);
  },

  async createCheckout(planoId: number, anual: boolean): Promise<CheckoutResponse> {
    const response = await httpClient.post<CheckoutResponse>(apiRoute('/api/assinaturas/checkout'), { plano_id: planoId, anual });
    const value = toCamelCase<CheckoutResponse>(response.data);
    return { url: value.url, sessionId: value.sessionId };
  },

  async createPortal(): Promise<string> {
    const response = await httpClient.post<{ url: string }>(apiRoute('/api/assinaturas/portal'), {});
    return toCamelCase<{ url: string }>(response.data).url;
  },
};

function readValue<T>(value: unknown): T {
  const camel = toCamelCase<Record<string, unknown> | unknown>(value);
  if (camel && typeof camel === 'object' && 'data' in camel) return (camel as { data: T }).data;
  return camel as T;
}

function readList<T>(value: unknown): T[] {
  const camel = toCamelCase<unknown>(value);
  if (Array.isArray(camel)) return camel as T[];
  if (!camel || typeof camel !== 'object') return [];
  const record = camel as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as T[];
  if (record.data && typeof record.data === 'object') return readList<T>(record.data);
  if (Array.isArray(record.items)) return record.items as T[];
  return [];
}
