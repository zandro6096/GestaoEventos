import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type UsuarioVirtualDto = {
  id: number;
  nome: string;
  email: string | null;
  estruturaId: number;
  grupoId: number | null;
  status: string;
  conviteEnviadoEm: string | null;
};

function readItems(value: unknown): UsuarioVirtualDto[] {
  const body = toCamelCase<Record<string, any>>(value);
  if (!body || typeof body !== 'object') return [];
  if (Array.isArray(body)) return body as UsuarioVirtualDto[];
  if (Array.isArray(body.data)) return body.data as UsuarioVirtualDto[];
  if (body.data && Array.isArray(body.data.data)) return body.data.data as UsuarioVirtualDto[];
  if (body.data && Array.isArray(body.data.items)) return body.data.items as UsuarioVirtualDto[];
  return [];
}

export const usuariosVirtuaisApi = {
  async list(estruturaId: number, grupoId?: number) {
    const response = await httpClient.get(apiRoute('/api/usuarios-virtuais'), {
      params: { estrutura_id: estruturaId, grupo_id: grupoId, apenas_pendentes: false },
    });
    return readItems(response.data);
  },
  async create(payload: { nome: string; email: string; estruturaId: number; grupoId: number; ehResponsavel: boolean; criadoPor: number }) {
    const response = await httpClient.post(apiRoute('/api/usuarios-virtuais'), toSnakeCase(payload));
    return toCamelCase<{ data?: UsuarioVirtualDto } | UsuarioVirtualDto>(response.data);
  },
  async sendInvite(id: number) {
    await httpClient.post(apiRoute(`/api/usuarios-virtuais/${id}/enviar-convite`));
  },
};
