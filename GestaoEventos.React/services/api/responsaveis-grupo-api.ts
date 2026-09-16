import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';
import type { ResponsavelGrupoDto } from './grupos-api';

function readList<T>(value: unknown): T[] {
  const body = toCamelCase<{ data?: T[] } | T[]>(value);
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

export const responsaveisGrupoApi = {
  async list(grupoId: number, skip = 0, take = 100) {
    const response = await httpClient.get(apiRoute('/api/responsaveis-grupo'), { params: { grupo_id: grupoId, skip, take } });
    return readList<ResponsavelGrupoDto>(response.data);
  },
  async create(grupoId: number, usuarioId: number) {
    await httpClient.post(apiRoute('/api/responsaveis-grupo'), toSnakeCase({ grupoId, usuarioId }));
  },
  async remove(id: number) {
    await httpClient.delete(apiRoute(`/api/responsaveis-grupo/${id}`));
  },
};
