import { participacoesEventoApi, type AttendanceItem, type AttendanceStatus } from '../../../services/api/participacoes-evento-api';
import type { Participante } from '../../../services/api/participantes-evento-api';

export type AttendanceContext = { eventoId: number; ocorrenciaId: number; ocorridoEm: string; registradoPor: number };

export function buildAttendanceItem(context: AttendanceContext, participant: Pick<Participante, 'usuarioId' | 'usuarioVirtualId' | 'isVirtual'>, status: AttendanceStatus, observacao: string): AttendanceItem {
  const personId = participant.isVirtual ? participant.usuarioVirtualId : participant.usuarioId;
  if (!personId || personId <= 0) throw new Error('Participante sem cadastro valido.');
  return {
    eventoId: context.eventoId, ocorrenciaId: context.ocorrenciaId,
    ...(participant.isVirtual ? { usuarioVirtualId: personId } : { usuarioId: personId }),
    ocorridoEm: context.ocorridoEm, registradoPor: context.registradoPor, status,
    observacao: observacao.trim() || null,
  };
}

export const presencaService = {
  saveSingle(context: AttendanceContext, participant: Participante, status: AttendanceStatus, observacao: string) {
    return participacoesEventoApi.create(buildAttendanceItem(context, participant, status, observacao));
  },
  saveBulk(context: AttendanceContext, items: { participant: Participante; status: AttendanceStatus; observacao: string }[]) {
    return participacoesEventoApi.createBulk(items.map((item) => buildAttendanceItem(context, item.participant, item.status, item.observacao)));
  },
};
