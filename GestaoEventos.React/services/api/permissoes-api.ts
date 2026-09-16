import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type RecursoPermissao = {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string | null;
  categoria: string;
  ativo: boolean;
};

export type PermissaoAtribuida = {
  id: number;
  responsavelGrupoId: number;
  recursoId: number;
};

export type ResponsavelComPermissoes = {
  responsavelGrupoId: number;
  grupoId: number;
  permissoes: PermissaoAtribuida[];
};

export type AtualizarPermissoesRequest = {
  responsavelId: number;
  grupoId: number;
  recursosIds: number[];
};

export const permissoesApi = {
  async listRecursos(categoria?: string | null): Promise<RecursoPermissao[]> {
    const response = await httpClient.get<unknown[]>(apiRoute('/api/permissoes/recursos'), {
      params: categoria ? { categoria } : undefined,
    });

    return toCamelCase<RecursoPermissao[]>(response.data);
  },

  async getResponsavelPermissoes(responsavelId: number, grupoId: number): Promise<ResponsavelComPermissoes> {
    const response = await httpClient.get<unknown>(
      apiRoute(`/api/permissoes/responsavel/${responsavelId}/grupo/${grupoId}`),
    );

    return toCamelCase<ResponsavelComPermissoes>(response.data);
  },

  async atribuirPermissoes(request: AtualizarPermissoesRequest): Promise<ResponsavelComPermissoes> {
    const response = await httpClient.post<unknown>(apiRoute('/api/permissoes/atribuir'), toSnakeCase(request));
    return toCamelCase<ResponsavelComPermissoes>(response.data);
  },

  async revogarPermissoes(request: AtualizarPermissoesRequest): Promise<ResponsavelComPermissoes> {
    const response = await httpClient.post<unknown>(apiRoute('/api/permissoes/revogar'), toSnakeCase(request));
    return toCamelCase<ResponsavelComPermissoes>(response.data);
  },
};
