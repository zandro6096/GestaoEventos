import type { EventoDto, OcorrenciaDto } from '../../../services/api/eventos-api';
import type { Participante } from '../../../services/api/participantes-evento-api';

export function availableActions(occurrence: Partial<OcorrenciaDto>, event: Partial<EventoDto>, allowed: boolean) {
  const status = occurrence.status?.replace(/_/g, '').toLowerCase();
  const cancelled = occurrence.cancelada || status === 'cancelada' || status === 'cancelado';
  const done = status === 'realizada' || status === 'realizado';
  const real = !!occurrence.id && occurrence.id > 0 && !occurrence.isVirtual;
  return {
    iniciar: allowed && !cancelled && !done && status === 'agendada',
    cancelar: allowed && !cancelled && !done && event.podeCancelar !== false,
    finalizar: allowed && real && !cancelled && (status === 'emandamento' || status === 'emajuste'),
    descancelar: allowed && real && !!cancelled,
    reabrir: allowed && real && done && event.permitirReabertura !== false && occurrence.permitirReabertura !== false && !event.consolidacaoPermanente
      && (!occurrence.dataHora || occurrence.dataHora.slice(0, 10) <= localToday()),
    confirmar: allowed && real && !!occurrence.podeConfirmarResponsavel && !occurrence.confirmacaoResponsavel && !cancelled,
    participantes: allowed && !cancelled && !done,
  };
}
export function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function participantIdentity(participant: Pick<Participante, 'usuarioId' | 'usuarioVirtualId' | 'isVirtual'>) {
  const id = participant.isVirtual ? participant.usuarioVirtualId : participant.usuarioId;
  if (!id || id <= 0) throw new Error('Participante sem identificador de cadastro.');
  return { id, tipo: participant.isVirtual ? 'usuario_virtual' : 'usuario' };
}
