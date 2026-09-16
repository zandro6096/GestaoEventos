import { eventosApi } from '../../../services/api/eventos-api';
import { eventoTemplatesApi } from '../../../services/api/evento-templates-api';
import { buildInicioPayload } from './inicio.schema';

type Payload = ReturnType<typeof buildInicioPayload>;
export type InicioResult = { eventoId: number | null; ocorrenciaId: number | null; data: string; warning?: string };

export const inicioService = {
  async carregar(estruturaId: number) {
    const [templates, grupos] = await Promise.all([
      eventoTemplatesApi.list(estruturaId), eventoTemplatesApi.grupos(estruturaId),
    ]);
    return { templates: templates.filter((item) => item.estruturaId === estruturaId), grupos };
  },

  async iniciar(payload: Payload, assertAllowed: () => void): Promise<InicioResult> {
    assertAllowed();
    const conflicts = await eventosApi.conflitos(payload.estruturaId, payload.grupoId, payload.dataInicio, payload.dataFim);
    if (conflicts.length) throw new Error(`Conflito de horario: ${conflicts.map((item) => item.titulo).join(', ')}. Altere a data ou o horario.`);
    assertAllowed();
    const eventoId = await eventosApi.criar(payload);
    const result: InicioResult = { eventoId, ocorrenciaId: null, data: payload.dataInicio.slice(0, 10) };
    // Creation already committed. Later failures must never offer another POST /eventos as a retry.
    if (!eventoId) return { ...result, warning: 'Evento criado. Consulte Meus Eventos para acompanhar.' };
    try {
      assertAllowed();
      result.ocorrenciaId = await eventosApi.materializar(eventoId, payload.dataInicio);
      if (!result.ocorrenciaId) throw new Error('Ocorrencia nao retornada.');
      assertAllowed();
      await eventosApi.atualizarOcorrenciaStatus(result.ocorrenciaId, { novoStatus: 'EmAndamento' });
      return result;
    } catch {
      return { ...result, warning: 'Evento criado, mas o inicio da ocorrencia nao foi confirmado. Consulte Meus Eventos antes de tentar novamente.' };
    }
  },
};
