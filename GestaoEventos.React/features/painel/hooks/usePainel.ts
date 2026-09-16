import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { normalizeApiError } from '../../../services/api/api-error';
import { painelApi, painelTipos, type PainelTipo } from '../../../services/api/painel-api';
import { track } from '../../../services/analytics/analytics.service';
import { gruposApi, type GrupoDto } from '../../../services/api/grupos-api';
import { queryKeys } from '../../../services/query/query-keys';
import { can } from '../../../services/permissions/permission.facade';
import { useContextStore } from '../../../stores/context.store';

export const painelPeriodos = ['mes', 'trimestre', 'ano'] as const;
export type PainelPeriodo = (typeof painelPeriodos)[number];

export function usePainel() {
  const usuarioId = useContextStore((state) => state.usuarioId);
  const estruturaId = useContextStore((state) => state.estruturaId);
  const contextoGrupoId = useContextStore((state) => state.grupoId);
  const [tipo, setTipo] = useState<PainelTipo>('presenca-media');
  const [periodo, setPeriodo] = useState<PainelPeriodo>('mes');
  const [grupoId, setGrupoId] = useState<number | null>(contextoGrupoId);
  const enabled = Boolean(usuarioId && estruturaId && can('ler', 'painel', { estruturaId, grupoId }));
  const dates = useMemo(() => getPeriodDates(periodo), [periodo]);

  const query = useQuery({
    queryKey: queryKeys.painel.comparativo({ estruturaId, grupoId }, { tipo, periodo, ...dates }),
    queryFn: () => painelApi.getComparativo({ estruturaId: estruturaId!, grupoId, tipo, ...dates }),
    enabled,
  });

  const groupsQuery = useQuery({
    queryKey: queryKeys.scoped('painel-grupos', { estruturaId }, { usuarioId }),
    queryFn: async () => loadGroups(estruturaId!),
    enabled: Boolean(usuarioId && estruturaId && can('ler', 'grupos', { estruturaId })),
  });

  useEffect(() => {
    if (enabled) track('entrance', 'painel:entrada');
  }, [enabled]);

  useEffect(() => {
    if (!enabled || query.isLoading || query.isFetching) return;
    track(query.isError ? 'click' : 'confirmation', query.isError ? 'painel:carregar_erro' : 'painel:carregar_sucesso', {
      extra: { tipo, periodo, total_itens: query.data?.items.length ?? 0 },
    });
  }, [enabled, periodo, query.data?.items.length, query.isError, query.isFetching, query.isLoading, tipo]);

  function applyTipo(value: PainelTipo) {
    if (!painelTipos.includes(value)) return;
    setTipo(value);
    track('simulation', 'painel:filtro_aplicar', { extra: { filtro: 'tipo' } });
  }

  function applyPeriodo(value: PainelPeriodo) {
    if (!painelPeriodos.includes(value)) return;
    setPeriodo(value);
    track('simulation', 'painel:filtro_aplicar', { extra: { filtro: 'periodo' } });
  }

  function applyGrupo(value: number | null) {
    setGrupoId(value);
    track('simulation', 'painel:filtro_aplicar', { extra: { filtro: 'grupo', grupo_selecionado: Boolean(value) } });
  }

  return {
    query,
    groupsQuery,
    groups: groupsQuery.data ?? [],
    usuarioId,
    estruturaId,
    grupoId,
    tipo,
    periodo,
    dates,
    enabled,
    contextError: estruturaId ? null : 'O painel exige uma estrutura ativa.',
    applyTipo,
    applyPeriodo,
    applyGrupo,
    refetch: () => void query.refetch(),
    groupError: groupsQuery.isError ? normalizeApiError(groupsQuery.error, 'Nao foi possivel carregar os grupos para o filtro.').message : null,
  };
}

async function loadGroups(estruturaId: number) {
  const groups: GrupoDto[] = [];
  for (let skip = 0; ; skip += 100) {
    const page = await gruposApi.list(estruturaId, skip, 100);
    groups.push(...page.data);
    if (page.data.length < 100 || skip / 100 + 1 >= page.totalPages) return groups;
  }
}

function getPeriodDates(periodo: PainelPeriodo) {
  const dataFim = new Date();
  const dataInicio = new Date(dataFim);
  dataInicio.setDate(dataInicio.getDate() - (periodo === 'ano' ? 365 : periodo === 'trimestre' ? 90 : 30));
  return { dataInicio: formatLocalDateTime(dataInicio), dataFim: formatLocalDateTime(dataFim) };
}

function formatLocalDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}
