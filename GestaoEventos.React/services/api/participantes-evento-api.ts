import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type Participante = {
  id: number; eventoId: number; usuarioId: number | null; usuarioVirtualId: number | null;
  nome: string; nomeExibicao?: string | null; email?: string | null; isVirtual: boolean; status: string | null; funcao?: string | null;
  telefone?: string | null; dataNascimento?: string | null; observacao?: string | null;
  papeis?: { id: number; nome: string; principal?: boolean }[];
};
export type ParticipationScope = 'somente_ocorrencia' | 'futuros' | 'todas';
export type PessoaDisponivel = {
  id: number;
  nome: string;
  tipo: 'usuario' | 'usuario_virtual';
  email?: string | null;
  telefone?: string | null;
  dataNascimento?: string | null;
};
export type MergeCandidate = { grupoId: string; motivo: string; pessoas: { id: number; nome: string; tipo: string }[]; temConflitoProvavel: boolean };

function readList<T>(value: unknown): T[] {
  const body = toCamelCase<{ data?: T[] } | T[]>(value);
  const data = Array.isArray(body) ? body : body?.data;
  if (!Array.isArray(data)) throw new Error('Resposta invalida ao carregar participantes.');
  return data;
}
export const participantesEventoApi = {
  async list(eventoId: number, ocorrenciaId: number | null, dataReferencia: string) {
    const response = await httpClient.get(apiRoute(`/api/eventos/${eventoId}/participantes`), {
      params: { ocorrencia_id: ocorrenciaId, data_referencia: dataReferencia },
    });
    return readList<Participante>(response.data);
  },
  async add(eventoId: number, payload: Record<string, unknown>) {
    const response = await httpClient.post(apiRoute(`/api/eventos/${eventoId}/participantes`), toSnakeCase(payload));
    return toCamelCase(response.data);
  },
  async remove(eventoId: number, pessoaId: number, payload: Record<string, unknown>) {
    await httpClient.delete(apiRoute(`/api/eventos/${eventoId}/participantes/${pessoaId}`), { data: toSnakeCase(payload) });
  },
  async update(eventoId: number, participant: Pick<Participante, 'usuarioId' | 'usuarioVirtualId' | 'isVirtual'>, payload: Record<string, unknown>) {
    const participantId = participant.isVirtual ? participant.usuarioVirtualId : participant.usuarioId;
    if (!participantId) throw new Error('Participante sem identificacao valida.');
    const response = await httpClient.patch(apiRoute(`/api/eventos/${eventoId}/participantes/${participantId}`), toSnakeCase(payload), {
      params: { tipo: participant.isVirtual ? 'usuario_virtual' : 'usuario' },
    });
    return toCamelCase(response.data);
  },
  async updateVirtual(participant: Pick<Participante, 'usuarioVirtualId'>, payload: Record<string, unknown>) {
    if (!participant.usuarioVirtualId) throw new Error('Participante virtual sem identificacao valida.');
    const response = await httpClient.put(apiRoute(`/api/usuarios-virtuais/${participant.usuarioVirtualId}`), toSnakeCase({ id: participant.usuarioVirtualId, ...payload }));
    return toCamelCase(response.data);
  },
  async setRoles(estruturaId: number, participant: Pick<Participante, 'usuarioId' | 'usuarioVirtualId' | 'isVirtual'>, roleIds: number[], principalRoleId: number | null, dataReferencia?: string | null) {
    const participantId = participant.isVirtual ? participant.usuarioVirtualId : participant.usuarioId;
    if (!participantId) throw new Error('Participante sem identificacao valida.');
    await httpClient.put(apiRoute(`/api/estruturas/${estruturaId}/participantes/papeis`), toSnakeCase({
      tipo: participant.isVirtual ? 'usuario_virtual' : 'usuario', participanteId: participantId, papelIds: roleIds, principalPapelId: principalRoleId, dataReferencia,
    }));
  },
  async pessoas(estruturaId: number, nome: string): Promise<PessoaDisponivel[]> {
    const [users, virtuals] = await Promise.all([
      httpClient.get(apiRoute('/api/usuarios'), { params: { id_estrutura: estruturaId, nome, skip: 0, take: 50 } }),
      httpClient.get(apiRoute('/api/usuarios-virtuais'), { params: { estrutura_id: estruturaId } }),
    ]);
    return [
      ...readList<{ id: number; nome: string }>(users.data).map((p) => ({ ...p, tipo: 'usuario' as const })),
      ...readList<{ id: number; nome: string; status: string }>(virtuals.data)
        .filter((p) => p.status?.toLowerCase() !== 'inativo' && p.nome.toLowerCase().includes(nome.toLowerCase()))
        .map((p) => ({ id: p.id, nome: p.nome, tipo: 'usuario_virtual' as const })),
    ];
  },
  async candidatos(eventoId: number, ocorrenciaId: number | null, usuarioId: number) {
    const response = await httpClient.get(apiRoute(`/api/eventos/${eventoId}/participantes/merge/candidatos`), {
      params: { solicitante_usuario_id: usuarioId, ocorrencia_ids: ocorrenciaId ? String(ocorrenciaId) : undefined, take: 20 },
    });
    return readList<MergeCandidate>(response.data);
  },
};
