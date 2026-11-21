import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

// Anjo da guarda (consolidador): quem acompanha cada pessoa da estrutura. Um vigente por pessoa;
// trocar ou retirar encerra o vínculo e mantém o histórico.

type ApiEnvelope<T> = { data?: T | null };

export type PessoaRef = { usuarioId?: number | null; usuarioVirtualId?: number | null };

export type AnjoVinculo = {
  id: number;
  anjoUsuarioId?: number | null;
  anjoUsuarioVirtualId?: number | null;
  anjoNome?: string | null;
  inicio: string;
  fim?: string | null;
  registradoPorNome?: string | null;
  registradoEm: string;
  observacao?: string | null;
};

export type AnjoDoParticipante = { atual?: AnjoVinculo | null; historico: AnjoVinculo[]; podeAlterar: boolean };

function unwrap<T>(body: unknown): T {
  const envelope = toCamelCase(body) as ApiEnvelope<T>;
  return (envelope.data ?? envelope) as T;
}

function pessoaParams(pessoa: PessoaRef) {
  return pessoa.usuarioId ? { usuario_id: pessoa.usuarioId } : { usuario_virtual_id: pessoa.usuarioVirtualId };
}

export const anjoApi = {
  async obter(estruturaId: number, pessoa: PessoaRef): Promise<AnjoDoParticipante> {
    const response = await httpClient.get(apiRoute(`/api/estruturas/${estruturaId}/participantes/anjo`), { params: pessoaParams(pessoa) });
    const data = unwrap<AnjoDoParticipante>(response.data);
    return { ...data, historico: data.historico ?? [] };
  },

  /** `anjo` nulo = retirar o anjo atual. */
  async definir(estruturaId: number, pessoa: PessoaRef, anjo: PessoaRef | null, observacao?: string | null): Promise<AnjoDoParticipante> {
    const body = {
      ...pessoaParams(pessoa),
      anjoUsuarioId: anjo?.usuarioId ?? null,
      anjoUsuarioVirtualId: anjo?.usuarioId ? null : anjo?.usuarioVirtualId ?? null,
      observacao: observacao ?? null,
    };
    const response = await httpClient.put(apiRoute(`/api/estruturas/${estruturaId}/participantes/anjo`), toSnakeCase(body));
    const data = unwrap<AnjoDoParticipante>(response.data);
    return { ...data, historico: data.historico ?? [] };
  },
};

export function mesmaPessoa(a: PessoaRef, b: PessoaRef) {
  return (!!a.usuarioId && a.usuarioId === b.usuarioId) || (!a.usuarioId && !b.usuarioId && !!a.usuarioVirtualId && a.usuarioVirtualId === b.usuarioVirtualId);
}
