import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { can } from '../../../services/permissions/permission.facade';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { track } from '../../../services/analytics/analytics.service';
import { eventoTemplatesApi, type EventoTemplate } from '../../../services/api/evento-templates-api';
import type { Participante } from '../../../services/api/participantes-evento-api';
import type { AttendanceStatus } from '../../../services/api/participacoes-evento-api';
import { presencaService, type AttendanceContext } from './presenca.service';
import { validateAttendance } from './presenca.rules';

type AttendanceData = { evento: { id: number; grupoId: number; eventoTemplateId: number | null }; ocorrencia: { id: number; dataHora: string }; participantes: Participante[] };
type AttendanceOperation = { mode: 'single'; participant: Participante; status: AttendanceStatus; observacao: string } | { mode: 'bulk'; items: { participant: Participante; status: AttendanceStatus; observacao: string }[] };

// Cada pessoa tem o proprio estado de gravacao: marcar uma nao trava as demais.
export function usePresenca(data: AttendanceData | undefined, queryKey: readonly unknown[], usuarioId: number, estruturaId: number) {
  const client = useQueryClient();
  const templateQuery = useQuery({
    queryKey: ['evento-template-presenca', estruturaId, data?.evento.eventoTemplateId],
    queryFn: async () => {
      const templates = await eventoTemplatesApi.list(estruturaId);
      return templates.find((item) => item.id === data?.evento.eventoTemplateId) ?? null;
    },
    enabled: !!data?.evento.eventoTemplateId && estruturaId > 0,
  });
  const template = templateQuery.data as EventoTemplate | null | undefined;
  const requerJustificativaAusencia = template?.requerJustificativaAusencia ?? false;
  const [saving, setSaving] = useState<Record<number, AttendanceStatus>>({});
  const mutation = useMutation({
    retry: false,
    mutationFn: async (operation: AttendanceOperation) => {
      if (!data || data.ocorrencia.id <= 0) throw new Error('A ocorrencia precisa estar materializada para registrar presenca.');
      if (!can('gerenciar', 'eventos', { estruturaId, grupoId: data.evento.grupoId })) throw new Error('Sem permissao para registrar presenca.');
      assertOnlineForMutation('Registrar presenca');
      const items = operation.mode === 'single' ? [operation] : operation.items;
      for (const item of items) {
        const validation = validateAttendance(item.status, item.observacao, requerJustificativaAusencia);
        if (!validation.valid) throw new Error(validation.message ?? 'Presenca invalida.');
      }
      const context: AttendanceContext = { eventoId: data.evento.id, ocorrenciaId: data.ocorrencia.id, ocorridoEm: data.ocorrencia.dataHora, registradoPor: usuarioId };
      track('simulation', 'acompanhar_evento:salvar_presencas_submit', { extra: { total: items.length } });
      if (operation.mode === 'single') await presencaService.saveSingle(context, operation.participant, operation.status, operation.observacao);
      else await presencaService.saveBulk(context, operation.items);
      track('confirmation', 'acompanhar_evento:salvar_presencas_success', { extra: { total: items.length } });
      return items;
    },
    // A lista reflete o novo status assim que a API confirma; o refetch em segundo plano so reconcilia.
    onSuccess: (items) => {
      client.setQueryData<{ participantes: Participante[] } | undefined>(queryKey, (current) => current && {
        ...current,
        participantes: current.participantes.map((participant) => {
          const done = items.find((item) => item.participant.id === participant.id && item.participant.isVirtual === participant.isVirtual);
          return done ? { ...participant, status: done.status, observacao: done.observacao } : participant;
        }),
      });
      void client.invalidateQueries({ queryKey: ['jornada'] });
      void client.invalidateQueries({ queryKey });
    },
  });
  const save = async (operation: AttendanceOperation) => {
    const targets = operation.mode === 'single' ? [operation] : operation.items;
    setSaving((current) => ({ ...current, ...Object.fromEntries(targets.map((item) => [item.participant.id, item.status])) }));
    try {
      return await mutation.mutateAsync(operation);
    } finally {
      setSaving((current) => {
        const next = { ...current };
        for (const item of targets) delete next[item.participant.id];
        return next;
      });
    }
  };
  return { mutation, save, saving, templateQuery, requerJustificativaAusencia };
}
