import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { normalizeApiError } from '../../../services/api/api-error';
import { track } from '../../../services/analytics/analytics.service';
import { queryKeys } from '../../../services/query/query-keys';
import { useAuthStore } from '../../../stores/auth.store';
import { useContextStore } from '../../../stores/context.store';
import { jornadaService, type JornadaScope } from '../services/jornada.service';

export function useJornada() {
  const authUserId = useAuthStore((state) => state.user?.id ?? null);
  const usuarioId = useContextStore((state) => state.usuarioId) ?? authUserId;
  const estruturaId = useContextStore((state) => state.estruturaId);
  const grupoId = useContextStore((state) => state.grupoId);
  const enabled = Boolean(usuarioId && estruturaId);
  const scope: JornadaScope = {
    usuarioId: usuarioId ?? 0,
    estruturaId: estruturaId ?? 0,
    grupoId,
  };
  const queryScope = { estruturaId, grupoId };
  const contextError = enabled ? null : 'A jornada exige usuario autenticado e estrutura ativa.';

  const eventosHojeQuery = useQuery({
    queryKey: queryKeys.jornada.eventosHoje(queryScope, { usuarioId: usuarioId ?? 0 }),
    queryFn: () => jornadaService.getEventosHoje(scope),
    enabled,
  });

  const frequenciaQuery = useQuery({
    queryKey: queryKeys.jornada.frequencia(queryScope, { usuarioId: usuarioId ?? 0, periodoDias: 30 }),
    queryFn: () => jornadaService.getFrequencia(scope, 30),
    enabled,
  });

  const historicoQuery = useQuery({
    queryKey: queryKeys.jornada.historico(queryScope, { usuarioId: usuarioId ?? 0, skip: 0, take: 20 }),
    queryFn: () => jornadaService.getHistorico(scope, 0, 20),
    enabled,
  });

  const proximasQuery = useQuery({
    queryKey: queryKeys.jornada.proximas(queryScope, { usuarioId: usuarioId ?? 0, take: 10 }),
    queryFn: () => jornadaService.getProximasReunioes(scope, 10),
    enabled,
  });

  const pendenciasQuery = useQuery({
    queryKey: queryKeys.jornada.pendenciasResumo(queryScope, { usuarioId: usuarioId ?? 0 }),
    queryFn: () => jornadaService.getPendenciasResumo(scope),
    enabled,
  });

  const aniversariantesQuery = useQuery({
    queryKey: queryKeys.scoped('jornada-aniversariantes', queryScope, { usuarioId: usuarioId ?? 0 }),
    queryFn: () => jornadaService.getAniversariantes(scope),
    enabled,
  });

  const queries = [eventosHojeQuery, frequenciaQuery, historicoQuery, proximasQuery, pendenciasQuery, aniversariantesQuery];
  const isInitialLoading = enabled && queries.some((query) => query.isLoading);
  const isFetching = enabled && queries.some((query) => query.isFetching && !query.isLoading);
  const hasAnyData = queries.some((query) => hasQueryData(query.data));
  const hasBlockingError = enabled && !hasAnyData && queries.some((query) => query.isError);
  const partialErrors = [
    getPartialError(eventosHojeQuery.error, 'Eventos de hoje'),
    getPartialError(frequenciaQuery.error, 'Minha frequencia'),
    getPartialError(historicoQuery.error, 'Historico'),
    getPartialError(proximasQuery.error, 'Proximas reunioes'),
    getPartialError(pendenciasQuery.error, 'Precisa de voce'),
    getPartialError(aniversariantesQuery.error, 'Aniversariantes'),
  ].filter((message): message is string => Boolean(message));
  const allSettled = enabled && queries.every((query) => !query.isLoading && !query.isFetching);
  const eventosHojeCount = eventosHojeQuery.data?.length ?? 0;
  const historicoCount = historicoQuery.data?.length ?? 0;
  const proximasCount = proximasQuery.data?.length ?? 0;
  const pendenciasTotal = pendenciasQuery.data?.total ?? 0;
  const frequenciaTotal = frequenciaQuery.data?.totalParticipacoes ?? 0;
  const scopeKey = `${usuarioId ?? 0}:${estruturaId ?? 0}:${grupoId ?? 'all'}`;
  const loadTrackedKey = useRef<string | null>(null);
  const resultTrackedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || loadTrackedKey.current === scopeKey) return;

    loadTrackedKey.current = scopeKey;
    track('simulation', 'jornada:carregar_dados', {
      extra: {
        estrutura_id: estruturaId ?? null,
        grupo_id: grupoId ?? null,
        has_grupo: Boolean(grupoId),
      },
    });
  }, [enabled, estruturaId, grupoId, scopeKey]);

  useEffect(() => {
    if (!enabled || !allSettled) return;

    const status = hasBlockingError || partialErrors.length > 0 ? 'error' : 'success';
    const resultKey = `${scopeKey}:${status}`;
    if (resultTrackedKey.current === resultKey) return;

    resultTrackedKey.current = resultKey;

    if (status === 'error') {
      track('click', 'jornada:carregar_erro', {
        extra: {
          estrutura_id: estruturaId ?? null,
          grupo_id: grupoId ?? null,
          secoes_com_erro: partialErrors.length || 1,
        },
      });
      return;
    }

    track('confirmation', 'jornada:carregar_sucesso', {
      extra: {
        estrutura_id: estruturaId ?? null,
        grupo_id: grupoId ?? null,
        eventos_hoje: eventosHojeCount,
        historico: historicoCount,
        proximas: proximasCount,
        pendencias: pendenciasTotal,
        frequencia_total: frequenciaTotal,
      },
    });
  }, [
    allSettled,
    enabled,
    estruturaId,
    eventosHojeCount,
    frequenciaTotal,
    grupoId,
    hasBlockingError,
    historicoCount,
    partialErrors.length,
    pendenciasTotal,
    proximasCount,
    scopeKey,
  ]);

  function refetchAll() {
    void Promise.all(queries.map((query) => query.refetch()));
  }

  return {
    contextError,
    usuarioId,
    estruturaId,
    grupoId,
    isInitialLoading,
    isFetching,
    hasAnyData,
    hasBlockingError,
    partialErrors,
    refetchAll,
    eventosHoje: eventosHojeQuery.data ?? [],
    eventosHojeStatus: getQueryStatus(eventosHojeQuery),
    frequencia: frequenciaQuery.data ?? null,
    frequenciaStatus: getQueryStatus(frequenciaQuery),
    historico: historicoQuery.data ?? [],
    historicoStatus: getQueryStatus(historicoQuery),
    proximasReunioes: proximasQuery.data ?? [],
    proximasStatus: getQueryStatus(proximasQuery),
    pendenciasResumo: pendenciasQuery.data ?? null,
    pendenciasStatus: getQueryStatus(pendenciasQuery),
    aniversariantes: aniversariantesQuery.data ?? [],
    aniversariantesStatus: getQueryStatus(aniversariantesQuery),
  };
}

function getQueryStatus(query: { isLoading: boolean; isError: boolean; error: Error | null }) {
  if (query.isLoading) return { kind: 'loading' as const, message: null };
  if (query.isError) {
    return {
      kind: 'error' as const,
      message: normalizeApiError(query.error, 'Nao foi possivel carregar esta secao.').message,
    };
  }

  return { kind: 'success' as const, message: null };
}

function getPartialError(error: Error | null, section: string) {
  if (!error) return null;
  return `${section}: ${normalizeApiError(error, 'falha ao carregar').message}`;
}

function hasQueryData(data: unknown) {
  if (Array.isArray(data)) return data.length > 0;
  return Boolean(data);
}
