import { useMutation, useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';

import { normalizeApiError } from '../../../services/api/api-error';
import { configuracoesApi } from '../../../services/api/configuracoes-api';
import { track } from '../../../services/analytics/analytics.service';
import { funnel } from '../../../services/analytics/funnel';
import { queryKeys } from '../../../services/query/query-keys';
import { can } from '../../../services/permissions/permission.facade';
import { useContextStore } from '../../../stores/context.store';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';

export function useAssinaturaAdmin() {
  const estruturaId = useContextStore((state) => state.estruturaId);
  const allowed = Boolean(can('ler', 'assinatura', { estruturaId }));
  const statusQuery = useQuery({ queryKey: queryKeys.scoped('assinatura-status', { estruturaId }), queryFn: configuracoesApi.getAssinaturaStatus, enabled: allowed, retry: false });
  const planosQuery = useQuery({ queryKey: queryKeys.scoped('planos', { estruturaId }), queryFn: configuracoesApi.listPlanos, enabled: allowed, retry: false });
  const checkout = useMutation({ mutationFn: async ({ planoId, anual }: { planoId: number; anual: boolean }) => { assertOnlineForMutation('Iniciar checkout'); return configuracoesApi.createCheckout(planoId, anual); }, onSuccess: async (result) => { track('confirmation', 'assinatura:checkout_url_recebida'); if (result.url) await Linking.openURL(result.url); } });
  const portal = useMutation({ mutationFn: async () => { assertOnlineForMutation('Abrir portal da assinatura'); return configuracoesApi.createPortal(); }, onSuccess: async (url) => { track('confirmation', 'assinatura:portal_url_recebida'); if (url) await Linking.openURL(url); } });
  function startCheckout(planoId: number, anual: boolean) { funnel.simulation('assinatura:checkout_submit', { extra: { periodo: anual ? 'anual' : 'mensal' } }); checkout.mutate({ planoId, anual }); }
  function openPortal() { track('simulation', 'assinatura:portal_submit'); portal.mutate(); }
  return { allowed, statusQuery, planosQuery, startCheckout, openPortal, busy: checkout.isPending || portal.isPending, errorMessage: checkout.isError ? normalizeApiError(checkout.error, 'Nao foi possivel iniciar o checkout.').message : portal.isError ? normalizeApiError(portal.error, 'Nao foi possivel abrir o gerenciamento da assinatura.').message : statusQuery.isError ? normalizeApiError(statusQuery.error, 'Nao foi possivel carregar a assinatura.').message : planosQuery.isError ? normalizeApiError(planosQuery.error, 'Nao foi possivel carregar os planos.').message : null };
}
