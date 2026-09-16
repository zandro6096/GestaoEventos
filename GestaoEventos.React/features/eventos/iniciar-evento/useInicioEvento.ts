import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContextStore } from '../../../stores/context.store';
import { usePermissionStore } from '../../../stores/permission.store';
import { can } from '../../../services/permissions/permission.facade';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { track } from '../../../services/analytics/analytics.service';
import { queryKeys } from '../../../services/query/query-keys';
import type { EventoTemplate } from '../../../services/api/evento-templates-api';
import { buildInicioPayload, type InicioValues } from './inicio.schema';
import { inicioService } from './inicio.service';

export function useInicioEvento() {
  const { usuarioId, estruturaId, grupoId } = useContextStore();
  usePermissionStore((state) => state.grants);
  const client = useQueryClient();
  const allowed = can('criar', 'eventos');
  const query = useQuery({
    queryKey: queryKeys.scoped('evento-inicio', { estruturaId, grupoId }, { usuarioId }),
    queryFn: () => inicioService.carregar(estruturaId!), enabled: !!usuarioId && !!estruturaId && allowed,
  });
  const grupos = (query.data?.grupos ?? []).filter((item) => can('criar', 'eventos', { estruturaId, grupoId: item.id }));
  const mutation = useMutation({
    retry: false,
    mutationFn: async ({ values, template }: { values: InicioValues; template: EventoTemplate }) => {
      const assertAllowed = () => {
        const current = useContextStore.getState();
        if (current.usuarioId !== usuarioId || current.estruturaId !== estruturaId || current.grupoId !== grupoId) {
          throw new Error('O contexto mudou. Reabra o formulario.');
        }
        if (!can('criar', 'eventos', { estruturaId, grupoId: values.grupoId }) || !grupos.some((g) => g.id === values.grupoId)) {
          throw new Error('Sem permissao para criar evento neste grupo.');
        }
        assertOnlineForMutation('Iniciar evento');
      };
      assertAllowed();
      const payload = buildInicioPayload(values, template, { usuarioId: usuarioId!, estruturaId: estruturaId! });
      track('simulation', 'evento:iniciar_submit');
      const result = await inicioService.iniciar(payload, assertAllowed);
      track('confirmation', 'evento:criar');
      if (!result.warning) track('confirmation', 'evento:iniciar');
      await client.invalidateQueries({ queryKey: ['eventos'] });
      return result;
    },
  });
  return { query, mutation, grupos, allowed, estruturaId, grupoId, usuarioId };
}
