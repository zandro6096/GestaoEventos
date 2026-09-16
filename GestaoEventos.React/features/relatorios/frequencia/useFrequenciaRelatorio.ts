import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { can } from '../../../services/permissions/permission.facade';
import { normalizeApiError } from '../../../services/api/api-error';
import { relatoriosApi } from '../../../services/api/relatorios-api';
import { gruposApi } from '../../../services/api/grupos-api';
import { track } from '../../../services/analytics/analytics.service';
import { queryKeys } from '../../../services/query/query-keys';
import { useContextStore } from '../../../stores/context.store';

export const frequenciaPeriodos = [30, 90, 365] as const;
export type FrequenciaPeriodo = (typeof frequenciaPeriodos)[number];

export function useFrequenciaRelatorio() {
  const usuarioId = useContextStore((state) => state.usuarioId);
  const estruturaId = useContextStore((state) => state.estruturaId);
  const contextoGrupoId = useContextStore((state) => state.grupoId);
  const [periodo, setPeriodo] = useState<FrequenciaPeriodo>(30);
  const [grupoId, setGrupoId] = useState<number | null>(contextoGrupoId);
  const [busca, setBusca] = useState('');
  const dates = useMemo(() => getDates(periodo), [periodo]);
  const enabled = Boolean(usuarioId && estruturaId && can('ler', 'relatorios', { estruturaId, grupoId }));
  const query = useQuery({ queryKey: queryKeys.relatorios.frequencia({ estruturaId, grupoId }, { periodo, busca }), queryFn: () => relatoriosApi.getFrequencia({ estruturaId: estruturaId!, grupoId, busca, ...dates }), enabled });
  const groupsQuery = useQuery({ queryKey: queryKeys.scoped('relatorio-grupos', { estruturaId }, { usuarioId }), queryFn: () => loadGroups(estruturaId!), enabled: Boolean(usuarioId && estruturaId) });

  useEffect(() => { if (enabled) track('entrance', 'relatorio:frequencia_entrada'); }, [enabled]);
  useEffect(() => { if (!enabled || query.isLoading || query.isFetching) return; track(query.isError ? 'click' : 'confirmation', query.isError ? 'relatorio:frequencia_carregar_erro' : 'relatorio:frequencia_carregar_sucesso', { extra: { periodo, total_itens: query.data?.itens.length ?? 0 } }); }, [enabled, periodo, query.data?.itens.length, query.isError, query.isFetching, query.isLoading]);

  function applyFilter(name: string) { track('simulation', 'relatorio:frequencia_filtro_aplicar', { extra: { filtro: name } }); }
  return { query, groups: groupsQuery.data ?? [], periodo, grupoId, busca, enabled, applyPeriodo: (value: FrequenciaPeriodo) => { setPeriodo(value); applyFilter('periodo'); }, applyGrupo: (value: number | null) => { setGrupoId(value); applyFilter('grupo'); }, applyBusca: (value: string) => setBusca(value), refetch: () => void query.refetch(), errorMessage: query.isError ? normalizeApiError(query.error, 'Nao foi possivel carregar o relatorio.').message : null };
}

async function loadGroups(estruturaId: number) { const groups = []; for (let skip = 0; ; skip += 100) { const page = await gruposApi.list(estruturaId, skip, 100); groups.push(...page.data); if (page.data.length < 100 || skip / 100 + 1 >= page.totalPages) return groups; } }
function getDates(periodo: FrequenciaPeriodo) { const end = new Date(); const start = new Date(end); start.setDate(start.getDate() - periodo); return { dataInicio: localDate(start), dataFim: localDate(end) }; }
function localDate(value: Date) { const p = (part: number) => String(part).padStart(2, '0'); return `${value.getFullYear()}-${p(value.getMonth() + 1)}-${p(value.getDate())}T${p(value.getHours())}:${p(value.getMinutes())}:${p(value.getSeconds())}`; }
