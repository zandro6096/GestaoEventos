import { toCamelCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type GrupoDto = {
  id: number;
  nome: string;
  estruturaId: number;
  nivelHierarquico: number;
  grupoSuperiorId: number | null;
  tipoGrupoId: number | null;
  criadoEm: string;
  descricao?: string | null;
  usuariosCount?: number;
  metadados?: {
    totalMembros?: number;
    totalMembrosAtivos?: number;
    totalSubgrupos?: number;
    frequenciaMedia?: number;
  } | null;
};
export type GrupoMembroDto = { id: number; usuarioId: number; grupoId: number; associadoEm: string; usuario: { id: number; nome: string; email: string | null } | null };
export type ResponsavelGrupoDto = { id: number; grupoId: number; usuarioId: number; dataAssociacao: string; usuario: { id: number; nome: string; email: string | null } | null };

type GrupoEnvelope<T> = { data?: T[] | T; pageInfo?: Record<string, unknown>; pagedInfo?: Record<string, unknown> };

function readPage<T>(value: unknown) {
  const body = toCamelCase<GrupoEnvelope<T>>(value);
  const data = Array.isArray(body?.data) ? body.data : [];
  const info = body?.pageInfo ?? body?.pagedInfo ?? {};
  const totalPages = Number(info.totalPages ?? 1);
  const totalCount = Number(info.totalCount ?? info.totalItems ?? data.length);
  return { data, totalPages: Number.isFinite(totalPages) ? totalPages : 1, totalCount: Number.isFinite(totalCount) ? totalCount : data.length };
}

export const gruposApi = {
  async list(estruturaId: number, skip = 0, take = 100) {
    const response = await httpClient.get(apiRoute('/api/grupos'), { params: { estrutura_id: estruturaId, skip, take } });
    return readPage<GrupoDto>(response.data);
  },
  async getById(id: number) {
    const response = await httpClient.get(apiRoute(`/api/grupos/${id}`));
    const body = toCamelCase<{ data?: GrupoDto } | GrupoDto>(response.data);
    return 'data' in body && body.data ? body.data : body as GrupoDto;
  },
  async membros(grupoId: number, skip = 0, take = 100) {
    const response = await httpClient.get(apiRoute('/api/grupos-membros'), { params: { grupo_id: grupoId, skip, take } });
    return readPage<GrupoMembroDto>(response.data);
  },
  async responsaveis(grupoId: number, skip = 0, take = 100) {
    const response = await httpClient.get(apiRoute('/api/responsaveis-grupo'), { params: { grupo_id: grupoId, skip, take } });
    return readPage<ResponsavelGrupoDto>(response.data);
  },
};
