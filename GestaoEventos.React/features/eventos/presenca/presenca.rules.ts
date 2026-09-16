import type { AttendanceStatus } from '../../../services/api/participacoes-evento-api';

export function validateAttendance(status: AttendanceStatus, observacao: string, requerJustificativaAusencia: boolean) {
  const requiresReason = status === 'JUSTIFICADO' || status === 'AUSENTE';
  return {
    valid: !requiresReason || observacao.trim().length > 0,
    message: requiresReason ? 'Informe o motivo antes de salvar.' : null,
  };
}

export function statusLabel(status: string | null | undefined) {
  const normalized = (status ?? '').toUpperCase();
  return ({ PRESENTE: 'Presente', AUSENTE: 'Ausente', JUSTIFICADO: 'Justificado', NAO_RESPONDEU: 'Pendente', PENDENTE: 'Pendente' } as Record<string, string>)[normalized] ?? 'Pendente';
}
