import { toCamelCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type EventoCiclo = { id: number; eventoId: number; nome: string; inicioEm: string; fimEm: string | null; ativo: boolean; motivo: string | null };

const ciclosCache = new Map<number, Promise<EventoCiclo[]>>();

export const ocorrenciasApi = {
  async recuperar(id: number, action: 'reabrir' | 'descancelar', motivo: string, usuarioId: number) {
    await httpClient.post(apiRoute(`/api/ocorrencias/${id}/${action}`), { motivo, usuario_id: usuarioId });
  },
  async ciclos(eventoId: number): Promise<EventoCiclo[]> {
    const cached = ciclosCache.get(eventoId);
    if (cached) return cached;

    const request = httpClient.get(apiRoute(`/api/eventos/${eventoId}/ciclos`))
      .then((response) => {
        const body = toCamelCase<{ data: EventoCiclo[] }>(response.data);
        if (!Array.isArray(body?.data)) throw new Error('Resposta invalida ao carregar ciclos.');
        return body.data;
      });

    ciclosCache.set(eventoId, request);
    try {
      return await request;
    } catch (error) {
      ciclosCache.delete(eventoId);
      throw error;
    }
  },
};
