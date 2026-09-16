import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';
import { permissoesApi, type RecursoPermissao } from './permissoes-api';
import { usuariosEstruturaApi, type EstruturaUsuarioDto } from './usuarios-estrutura-api';
import { usuariosVirtuaisApi } from './usuarios-virtuais-api';

export type PapelPermissaoDto = { id: number; recurso: string; acao: number; escopo: number };
export type PapelAdminDto = { id: number; nome: string; descricao: string | null; estruturaId: number; nivelHierarquico: number; cor: string | null; icone: string | null; ordem: number; ativo: boolean; criadoEm: string; atualizadoEm: string | null; permissoes: PapelPermissaoDto[] };
export type PapelPayload = { nome: string; descricao?: string | null; estruturaId: number; nivelHierarquico: number; cor?: string | null; icone?: string | null; ordem: number; ativo?: boolean; permissoes?: { recurso: string; acao: number; escopo: number }[] };

function readPapeis(value: unknown) {
  const body = toCamelCase<Record<string, any>>(value);
  const data = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : Array.isArray(body?.items) ? body.items : [];
  return data as PapelAdminDto[];
}

export const adminApi = {
  listMembros(estruturaId: number, nome = ''): Promise<EstruturaUsuarioDto[]> { return usuariosEstruturaApi.list(estruturaId, nome, { take: 100 }); },
  updateMembroPapel(vinculoId: number, papel: 'Dono' | 'Participante') { return usuariosEstruturaApi.updatePapel(vinculoId, papel); },
  updateMembroFuncao(vinculoId: number, funcao: string | null) { return usuariosEstruturaApi.updateFuncao(vinculoId, funcao); },
  removeMembro(vinculoId: number) { return usuariosEstruturaApi.remove(vinculoId); },
  reactivateMembro(vinculoId: number) { return usuariosEstruturaApi.reactivate(vinculoId); },
  listUsuariosVirtuais(estruturaId: number) { return usuariosVirtuaisApi.list(estruturaId); },
  sendInvite(usuarioVirtualId: number) { return usuariosVirtuaisApi.sendInvite(usuarioVirtualId); },
  async listPapeis(estruturaId: number, nome = '') {
    const response = await httpClient.get(apiRoute('/api/papeis'), { params: { estrutura_id: estruturaId, nome: nome.trim() || undefined, apenas_ativos: false, skip: 0, take: 100 } });
    return readPapeis(response.data);
  },
  async createPapel(payload: PapelPayload) {
    const response = await httpClient.post(apiRoute('/api/papeis'), toSnakeCase(payload));
    return toCamelCase(response.data) as PapelAdminDto;
  },
  async updatePapel(id: number, payload: Omit<PapelPayload, 'estruturaId'>) {
    const response = await httpClient.put(apiRoute(`/api/papeis/${id}`), toSnakeCase({ id, ...payload }));
    return toCamelCase(response.data) as PapelAdminDto;
  },
  async deletePapel(id: number) {
    const response = await httpClient.delete(apiRoute(`/api/papeis/${id}`));
    return toCamelCase(response.data) as PapelAdminDto;
  },
  listRecursos(): Promise<RecursoPermissao[]> { return permissoesApi.listRecursos(); },
};
