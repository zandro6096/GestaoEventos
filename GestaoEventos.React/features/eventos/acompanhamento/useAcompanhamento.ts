import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContextStore } from '../../../stores/context.store';
import { usePermissionStore } from '../../../stores/permission.store';
import { can } from '../../../services/permissions/permission.facade';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { track } from '../../../services/analytics/analytics.service';
import { queryKeys } from '../../../services/query/query-keys';
import { eventosApi, type UpdateEventoRequest } from '../../../services/api/eventos-api';
import { acompanhamentoService, type AcompanhamentoAction } from './acompanhamento.service';
import { availableActions } from './acompanhamento.rules';

export function useAcompanhamento(eventoId: number, day?: string) {
  const { usuarioId, estruturaId, grupoId } = useContextStore();
  usePermissionStore((state) => state.grants);
  const client = useQueryClient();
  const scope = { usuarioId: usuarioId ?? 0, estruturaId: estruturaId ?? 0, grupoId };
  const query = useQuery({
    queryKey: queryKeys.eventos.detalhe(scope, { usuarioId, eventoId, day }),
    queryFn: () => acompanhamentoService.carregar(eventoId, day, scope),
    enabled: !!usuarioId && !!estruturaId && can('ler', 'eventos'), retry: false,
  });
  const queryKey = queryKeys.eventos.detalhe(scope, { usuarioId, eventoId, day });
  const manage = can('gerenciar', 'eventos', { estruturaId, grupoId: query.data?.evento.grupoId ?? grupoId });
  const actions = query.data ? availableActions(query.data.ocorrencia, query.data.evento, manage) : null;
  const mutation = useMutation({
    retry: false,
    mutationFn: async (action: AcompanhamentoAction) => {
      const data = query.data;
      if (!data) throw new Error('Aguarde o carregamento da ocorrencia.');
      const assertAllowed = () => {
        const current = useContextStore.getState();
        if (current.usuarioId !== usuarioId || current.estruturaId !== estruturaId || current.grupoId !== grupoId) throw new Error('Contexto alterado. Reabra o evento.');
        if (!can('gerenciar', 'eventos', { estruturaId, grupoId: data.evento.grupoId })) throw new Error('Permissao insuficiente.');
        assertOnlineForMutation('Alterar evento');
      };
      assertAllowed();
      track('simulation', `acompanhar_evento:${action.kind}_submit`);
      await acompanhamentoService.executar(data, action, scope, assertAllowed);
      track('confirmation', `acompanhar_evento:${action.kind}_success`);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ['eventos'] });
      void client.invalidateQueries({ queryKey: ['meus-eventos'] });
      void client.invalidateQueries({ queryKey: ['jornada'] });
      void client.invalidateQueries({ queryKey: ['frequencia'] });
    },
  });
  const editMutation = useMutation({
    retry: false,
    mutationFn: async (request: UpdateEventoRequest) => {
      if (!query.data) throw new Error('Aguarde o carregamento do evento.');
      const current = useContextStore.getState();
      if (current.usuarioId !== usuarioId || current.estruturaId !== estruturaId || current.grupoId !== grupoId) throw new Error('Contexto alterado. Reabra o evento.');
      if (!can('gerenciar', 'eventos', { estruturaId, grupoId: query.data.evento.grupoId })) throw new Error('Permissao insuficiente.');
      assertOnlineForMutation('Editar evento');
      track('simulation', 'acompanhar_evento:editar_submit');
      const result = await eventosApi.atualizar(eventoId, request);
      track('confirmation', 'acompanhar_evento:editar_success');
      return result;
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ['eventos'] });
      void client.invalidateQueries({ queryKey: ['meus-eventos'] });
      void client.invalidateQueries({ queryKey: ['jornada'] });
      void client.invalidateQueries({ queryKey: queryKey });
    },
  });
  return { query, queryKey, mutation, editMutation, actions, manage, scope };
}
