import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type AcompanhamentoTipo = {
  id: number;
  codigo: string;
  nome: string;
  natureza: 'curso' | 'indicador' | string;
};

export type ParticipanteAcompanhamento = {
  id: number;
  estruturaId: number;
  usuarioId: number | null;
  usuarioVirtualId: number | null;
  acompanhamentoTipoId: number;
  codigo: string;
  nome: string;
  natureza: 'curso' | 'indicador' | string;
  status: string | null;
  valor: boolean | null;
  dataInicio: string | null;
  observacao: string | null;
  historico: { statusNovo?: string | null; valorNovo?: boolean | null; alteradoEm: string }[];
};

export type AcompanhamentoDraft = {
  acompanhamentoTipoId: number;
  status?: string | null;
  valor?: boolean | null;
  dataInicio?: string | null;
  observacao?: string | null;
};

function readList<T>(value: unknown): T[] {
  const body = toCamelCase<{ data?: T[]; items?: T[] } | T[]>(value);
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
}

export const acompanhamentosApi = {
  async listTipos(estruturaId: number): Promise<AcompanhamentoTipo[]> {
    const response = await httpClient.get(apiRoute(`/api/estruturas/${estruturaId}/acompanhamentos/tipos`));
    return readList<AcompanhamentoTipo>(response.data);
  },

  async listParticipante(estruturaId: number, identity: { tipo: 'usuario' | 'usuario_virtual'; id: number }): Promise<ParticipanteAcompanhamento[]> {
    const response = await httpClient.get(apiRoute(`/api/estruturas/${estruturaId}/participantes/acompanhamentos`), {
      params: identity.tipo === 'usuario' ? { usuario_id: identity.id } : { usuario_virtual_id: identity.id },
    });
    return readList<ParticipanteAcompanhamento>(response.data);
  },

  async save(estruturaId: number, identity: { tipo: 'usuario' | 'usuario_virtual'; id: number }, draft: AcompanhamentoDraft) {
    const payload = {
      estruturaId,
      usuarioId: identity.tipo === 'usuario' ? identity.id : null,
      usuarioVirtualId: identity.tipo === 'usuario_virtual' ? identity.id : null,
      acompanhamentoTipoId: draft.acompanhamentoTipoId,
      status: draft.status ?? null,
      valor: draft.valor ?? null,
      dataInicio: draft.dataInicio ?? null,
      observacao: draft.observacao ?? null,
    };
    const response = await httpClient.put(apiRoute(`/api/estruturas/${estruturaId}/participantes/acompanhamentos`), toSnakeCase(payload));
    return toCamelCase(response.data);
  },
};
