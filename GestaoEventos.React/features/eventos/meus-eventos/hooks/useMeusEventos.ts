import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { normalizeApiError } from '../../../../services/api/api-error';
import { track } from '../../../../services/analytics/analytics.service';
import { assertOnlineForMutation } from '../../../../services/offline/mutation-guard';
import { queryKeys } from '../../../../services/query/query-keys';
import { gruposApi, type GrupoDto } from '../../../../services/api/grupos-api';
import { useAuthStore } from '../../../../stores/auth.store';
import { useContextStore } from '../../../../stores/context.store';
import { useMeusEventosViewStore } from '../../../../stores/meus-eventos-view.store';
import {
  meusEventosService,
  mergeMeusEventos,
  obterJanelaAno,
  obterMesAtualKey,
  obterJanelaMes,
  type MeusEventoItem,
  type MeusEventosListagem,
  type MeusEventosScope,
} from '../services/meus-eventos.service';

const groupSelectionThreshold = 6;

export function useMeusEventos() {
  const queryClient = useQueryClient();
  const authUserId = useAuthStore((state) => state.user?.id ?? null);
  const usuarioId = useContextStore((state) => state.usuarioId) ?? authUserId;
  const estruturaId = useContextStore((state) => state.estruturaId);
  const grupoId = useContextStore((state) => state.grupoId);
  const enabled = Boolean(usuarioId && estruturaId);
  const contextError = enabled ? null : 'Meus Eventos exige usuario autenticado e estrutura ativa.';
  const contextSelectionKey = `${usuarioId ?? 0}:${estruturaId ?? 0}:${grupoId ?? 'all'}`;
  const groupSelection = useMeusEventosViewStore((state) => state.groupSelection);
  const setGroupSelection = useMeusEventosViewStore((state) => state.setGroupSelection);
  const selectedGroupId = groupSelection.contextKey === contextSelectionKey ? groupSelection.groupId : null;
  const selectGroup = useCallback((groupId: number) => {
    setGroupSelection({ contextKey: contextSelectionKey, groupId });
  }, [contextSelectionKey, setGroupSelection]);
  const groupQueryEnabled = Boolean(enabled && !grupoId);
  const gruposQuery = useQuery({
    queryKey: queryKeys.eventos.gruposFiltro(estruturaId),
    queryFn: async () => {
      const result = await gruposApi.list(estruturaId!, 0, 200);
      return result.data.filter((group) => group.id > 0);
    },
    enabled: groupQueryEnabled,
    staleTime: 5 * 60 * 1000,
  });
  const availableGroups = useMemo<GrupoDto[]>(() => {
    if (grupoId) return [];
    return [...(gruposQuery.data ?? [])].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR'));
  }, [grupoId, gruposQuery.data]);
  const requiresGroupSelection = groupQueryEnabled
    && gruposQuery.isSuccess
    && availableGroups.length > groupSelectionThreshold
    && selectedGroupId === null;
  const effectiveGrupoId = grupoId ?? selectedGroupId;
  const occurrenceQueryEnabled = enabled
    && (!groupQueryEnabled || gruposQuery.isSuccess)
    && !requiresGroupSelection;
  const scope = useMemo<MeusEventosScope>(() => ({
    usuarioId: usuarioId ?? 0,
    estruturaId: estruturaId ?? 0,
    grupoId: effectiveGrupoId,
  }), [effectiveGrupoId, estruturaId, usuarioId]);
  const queryKey = useMemo(() => queryKeys.eventos.meus({ estruturaId, grupoId: effectiveGrupoId }, { usuarioId: usuarioId ?? 0 }), [effectiveGrupoId, estruturaId, usuarioId]);
  const loadTrackedKey = useRef<string | null>(null);
  const successTrackedKey = useRef<string | null>(null);
  const loadedMonthKeys = useRef(new Set<string>());
  const loadedYearKeys = useRef(new Set<number>());
  const [loadingMonth, setLoadingMonth] = useState<string | null>(null);
  const scopeKey = `${usuarioId ?? 0}:${estruturaId ?? 0}:${effectiveGrupoId ?? 'all'}`;

  const meusEventosQuery = useQuery({
    queryKey,
    queryFn: () => meusEventosService.getMeusEventos(scope),
    enabled: occurrenceQueryEnabled,
  });

  useEffect(() => {
    loadedMonthKeys.current.clear();
    loadedYearKeys.current.clear();
  }, [scopeKey]);

  useEffect(() => {
    if (occurrenceQueryEnabled && meusEventosQuery.isSuccess) {
      loadedMonthKeys.current.add(obterMesAtualKey());
    }
  }, [meusEventosQuery.isSuccess, occurrenceQueryEnabled]);

  const loadMonth = useCallback(async (monthKey: string) => {
    if (!occurrenceQueryEnabled || loadedMonthKeys.current.has(monthKey)) return;

    const window = obterJanelaMes(monthKey);
    if (!window) return;

    loadedMonthKeys.current.add(monthKey);
    setLoadingMonth(monthKey);
    try {
      const incoming = await meusEventosService.getMeusEventos(scope, window);
      queryClient.setQueryData<MeusEventosListagem>(queryKey, (current) => current ? mergeMeusEventos(current, incoming) : incoming);
    } catch (error) {
      loadedMonthKeys.current.delete(monthKey);
      throw error;
    } finally {
      setLoadingMonth((current) => current === monthKey ? null : current);
    }
  }, [occurrenceQueryEnabled, queryClient, queryKey, scope]);

  const loadYear = useCallback(async (year: number) => {
    if (!occurrenceQueryEnabled || loadedYearKeys.current.has(year)) return;

    const window = obterJanelaAno(year);
    if (!window) return;

    loadedYearKeys.current.add(year);
    setLoadingMonth(`ano:${year}`);
    try {
      const incoming = await meusEventosService.getMeusEventos(scope, window);
      queryClient.setQueryData<MeusEventosListagem>(queryKey, (current) => current ? mergeMeusEventos(current, incoming) : incoming);
    } catch (error) {
      loadedYearKeys.current.delete(year);
      throw error;
    } finally {
      setLoadingMonth((current) => current === `ano:${year}` ? null : current);
    }
  }, [occurrenceQueryEnabled, queryClient, queryKey, scope]);

  useEffect(() => {
    if (!occurrenceQueryEnabled || loadTrackedKey.current === scopeKey) return;

    loadTrackedKey.current = scopeKey;
    track('entrance', 'meus_eventos:entrada', {
      extra: {
        estrutura_id: estruturaId ?? null,
        grupo_id: grupoId ?? null,
      },
    });
  }, [effectiveGrupoId, estruturaId, grupoId, occurrenceQueryEnabled, scopeKey]);

  useEffect(() => {
    if (!occurrenceQueryEnabled || !meusEventosQuery.isSuccess) return;

    const successKey = `${scopeKey}:${meusEventosQuery.data.total}:${meusEventosQuery.data.totalCancelados}`;
    if (successTrackedKey.current === successKey) return;

    successTrackedKey.current = successKey;
    track('confirmation', 'meus_eventos:carregar_sucesso', {
      extra: {
        estrutura_id: estruturaId ?? null,
        grupo_id: effectiveGrupoId ?? null,
        total_itens: meusEventosQuery.data.total,
        total_cancelados: meusEventosQuery.data.totalCancelados,
      },
    });
  }, [effectiveGrupoId, estruturaId, occurrenceQueryEnabled, meusEventosQuery.data, meusEventosQuery.isSuccess, scopeKey]);

  const confirmVisitMutation = useMutation({
    mutationFn: async (item: MeusEventoItem) => {
      assertOnlineForMutation('confirmar visita');
      if (!item.ocorrenciaId) throw new Error('Confirmacao exige ocorrencia materializada.');

      track('simulation', 'meus_eventos:confirmar_visita_submit', {
        extra: {
          evento_id: item.eventoId,
          ocorrencia_id: item.ocorrenciaId,
        },
      });

      return meusEventosService.confirmarVisita(item.ocorrenciaId);
    },
    onSuccess: (_data, item) => {
      track('confirmation', 'meus_eventos:confirmar_visita_sucesso', {
        extra: {
          evento_id: item.eventoId,
          ocorrencia_id: item.ocorrenciaId,
        },
      });
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  function trackOpenEvent(item: MeusEventoItem) {
    track('entrance', 'btn:meus_eventos_abrir', {
      extra: {
        categoria: item.categoria,
        evento_id: item.eventoId,
        ocorrencia_id: item.ocorrenciaId,
      },
    });
  }

  return {
    contextKey: contextSelectionKey,
    contextError,
    usuarioId,
    estruturaId,
    grupoId: effectiveGrupoId,
    availableGroups,
    selectedGroupId,
    selectGroup,
    requiresGroupSelection,
    isLoadingGroups: groupQueryEnabled && gruposQuery.isLoading,
    groupSelectionError: gruposQuery.isError
      ? normalizeApiError(gruposQuery.error, 'Nao foi possivel carregar os grupos para selecao.').message
      : null,
    data: meusEventosQuery.data ?? null,
    aAcompanhar: meusEventosQuery.data?.aAcompanhar ?? [],
    futuros: meusEventosQuery.data?.futuros ?? [],
    historico: meusEventosQuery.data?.historico ?? [],
    isInitialLoading: meusEventosQuery.isLoading,
    isFetching: meusEventosQuery.isFetching && !meusEventosQuery.isLoading,
    isError: meusEventosQuery.isError,
    errorMessage: meusEventosQuery.isError
      ? normalizeApiError(meusEventosQuery.error, 'Nao foi possivel carregar seus eventos.').message
      : null,
    mutationError:
      confirmVisitMutation.isError
        ? normalizeApiError(confirmVisitMutation.error, 'Nao foi possivel concluir a acao.').message
        : null,
    isConfirmingVisit: confirmVisitMutation.isPending,
    refetch: occurrenceQueryEnabled ? meusEventosQuery.refetch : gruposQuery.refetch,
    loadMonth,
    loadYear,
    loadingMonth,
    confirmVisit: confirmVisitMutation.mutateAsync,
    trackOpenEvent,
  };
}
