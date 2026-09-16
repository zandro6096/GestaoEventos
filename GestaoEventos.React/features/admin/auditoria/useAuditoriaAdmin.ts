import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { normalizeApiError } from '../../../services/api/api-error';
import { auditoriaApi, type AuditoriaDto } from '../../../services/api/auditoria-api';
import { track } from '../../../services/analytics/analytics.service';
import { funnel } from '../../../services/analytics/funnel';
import { queryKeys } from '../../../services/query/query-keys';
import { can } from '../../../services/permissions/permission.facade';
import { useContextStore } from '../../../stores/context.store';

export type AuditoriaFilterState = { entidade: string; acao: string; dataInicio: string; dataFim: string };
const emptyFilters = (): AuditoriaFilterState => ({ entidade: '', acao: '', dataInicio: '', dataFim: '' });

export function useAuditoriaAdmin() {
  const estruturaId = useContextStore((state) => state.estruturaId);
  const allowed = Boolean(estruturaId && can('ler', 'auditoria', { estruturaId }));
  const [filters, setFilters] = useState<AuditoriaFilterState>(emptyFilters);
  const [applied, setApplied] = useState<AuditoriaFilterState>(emptyFilters);
  const [skip, setSkip] = useState(0);
  const take = 50;
  const [selected, setSelected] = useState<AuditoriaDto | null>(null);
  const query = useQuery({ queryKey: queryKeys.scoped('admin-auditoria', { estruturaId }, { ...applied, skip, take }), queryFn: () => auditoriaApi.list({ estruturaId: estruturaId!, ...applied, skip, take }), enabled: allowed, retry: false });
  const records = useMemo(() => query.isSuccess ? query.data?.data ?? [] : [], [query.data, query.isSuccess]);

  function applyFilters() { setSkip(0); setApplied({ ...filters }); setSelected(null); funnel.simulation('auditoria:filtros_aplicar', { extra: { entidade: filters.entidade || 'todas', acao: filters.acao || 'todas' } }); }
  function clearFilters() { const cleared = emptyFilters(); setFilters(cleared); setApplied(cleared); setSkip(0); setSelected(null); track('simulation', 'auditoria:filtros_limpar'); }
  function openDetails(item: AuditoriaDto) { setSelected(item); funnel.entrance('auditoria:detalhe_abrir'); }
  function nextPage() { if ((query.data?.skip ?? 0) + (query.data?.take ?? take) < (query.data?.total ?? 0)) { setSkip((query.data?.skip ?? 0) + take); track('simulation', 'auditoria:pagina_avancar'); } }
  function previousPage() { if (skip > 0) { setSkip(Math.max(0, skip - take)); track('simulation', 'auditoria:pagina_voltar'); } }
  return { allowed, filters, setFilters, applied, query, records, selected, setSelected, applyFilters, clearFilters, openDetails, nextPage, previousPage, hasPrevious: skip > 0, hasNext: (query.data?.skip ?? 0) + (query.data?.take ?? take) < (query.data?.total ?? 0), errorMessage: query.isError ? normalizeApiError(query.error, 'Nao foi possivel carregar o historico de auditoria.').message : null };
}
