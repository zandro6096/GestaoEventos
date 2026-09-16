import { toCamelCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type EstruturaUsuarioDto = {
  id: number;
  estruturaId: number;
  usuarioId: number;
  nomeUsuario: string;
  emailUsuario: string | null;
  papel: string | null;
  funcao: string | null;
  ativo: boolean;
  associadoEm: string | null;
  aceitoEm: string | null;
};

function readItems(value: unknown): EstruturaUsuarioDto[] {
  const body = toCamelCase<Record<string, any>>(value);
  if (!body || typeof body !== 'object') return [];
  if (Array.isArray(body)) return body as EstruturaUsuarioDto[];
  if (Array.isArray(body.items)) return body.items as EstruturaUsuarioDto[];
  if (Array.isArray(body.data)) return body.data as EstruturaUsuarioDto[];
  if (body.data && Array.isArray(body.data.data)) return body.data.data as EstruturaUsuarioDto[];
  if (body.data && Array.isArray(body.data.items)) return body.data.items as EstruturaUsuarioDto[];
  return [];
}

export const usuariosEstruturaApi = {
  async list(estruturaId: number, nome = '', options: { ativo?: boolean; status?: string; skip?: number; take?: number } = {}) {
    const response = await httpClient.get(apiRoute('/api/usuarios-estrutura'), {
      params: { estrutura_id: estruturaId, nome: nome.trim() || undefined, ativo: options.ativo, status: options.status, skip: options.skip ?? 0, take: options.take ?? 100 },
    });
    return readItems(response.data);
  },
  async updatePapel(vinculoId: number, papel: 'Dono' | 'Participante') {
    const response = await httpClient.put(apiRoute(`/api/usuarios-estrutura/${vinculoId}/papel`), { id: vinculoId, papel });
    return toCamelCase(response.data);
  },
  async updateFuncao(vinculoId: number, funcao: string | null) {
    const response = await httpClient.patch(apiRoute(`/api/usuarios-estrutura/${vinculoId}/funcao`), { id: vinculoId, funcao });
    return toCamelCase(response.data);
  },
  async remove(vinculoId: number) {
    const response = await httpClient.delete(apiRoute(`/api/usuarios-estrutura/${vinculoId}`));
    return toCamelCase(response.data);
  },
  async reactivate(vinculoId: number) {
    const response = await httpClient.post(apiRoute(`/api/usuarios-estrutura/${vinculoId}/reativar`));
    return toCamelCase(response.data);
  },
};
