import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { normalizeApiError } from '../../../services/api/api-error';
import { track } from '../../../services/analytics/analytics.service';
import { queryKeys } from '../../../services/query/query-keys';
import { useAuthStore } from '../../../stores/auth.store';
import { useContextStore } from '../../../stores/context.store';
import {
  defaultEventosFilters,
  eventosService,
  normalizeEventosFilters,
  type EventosFilters,
  type EventosScope,
} from '../services/eventos.service';

export function useEventos(initialFilters: Partial<EventosFilters> = defaultEventosFilters) {
  const authUserId = useAuthStore((state) => state.user?.id ?? null);
  const usuarioId = useContextStore((state) => state.usuarioId) ?? authUserId;
  const estruturaId = useContextStore((state) => state.estruturaId);
  const grupoId = useContextStore((state) => state.grupoId);
  const [filters, setFilters] = useState<EventosFilters>(() => normalizeEventosFilters(initialFilters));
  const enabled = Boolean(usuarioId && estruturaId);
  const contextError = enabled ? null : 'A listagem de eventos exige usuario autenticado e estrutura ativa.';
  const scope: EventosScope = {
    usuarioId: usuarioId ?? 0,
    estruturaId: estruturaId ?? 0,
    grupoId,
  };
  const queryScope = { estruturaId, grupoId };
  const loadTrackedKey = useRef<string | null>(null);
  const successTrackedKey = useRef<string | null>(null);
  const scopeKey = `${usuarioId ?? 0}:${estruturaId ?? 0}:${grupoId ?? 'all'}`;

  const eventosQuery = useQuery({
    queryKey: queryKeys.eventos.listagem(queryScope, { usuarioId: usuarioId ?? 0, filters }),
    queryFn: () => eventosService.getListagem(scope, filters),
    enabled,
  });

  useEffect(() => {
    if (!enabled || loadTrackedKey.current === scopeKey) return;

    loadTrackedKey.current = scopeKey;
    track('entrance', 'eventos:listar_entrada', {
      extra: {
        estrutura_id: estruturaId ?? null,
        grupo_id: grupoId ?? null,
      },
    });
  }, [enabled, estruturaId, grupoId, scopeKey]);

  useEffect(() => {
    if (!enabled || !eventosQuery.isSuccess) return;

    const successKey = `${scopeKey}:${filters.pageNumber}:${filters.pageSize}:${eventosQuery.data.items.length}`;
    if (successTrackedKey.current === successKey) return;

    successTrackedKey.current = successKey;
    track('confirmation', 'eventos:listar_sucesso', {
      extra: {
        estrutura_id: estruturaId ?? null,
        grupo_id: grupoId ?? null,
        total_itens: eventosQuery.data.items.length,
        total_cancelados: eventosQuery.data.totalCancelados,
      },
    });
  }, [
    enabled,
    estruturaId,
    eventosQuery.data,
    eventosQuery.isSuccess,
    filters.pageNumber,
    filters.pageSize,
    grupoId,
    scopeKey,
  ]);

  function applyFilters(nextFilters: Partial<EventosFilters>) {
    const normalized = normalizeEventosFilters({
      ...filters,
      ...nextFilters,
      pageNumber: nextFilters.pageNumber ?? 1,
    });

    track('simulation', 'eventos:filtro_aplicar', {
      extra: {
        periodo: normalized.periodo,
        status: normalized.status,
        tipo: normalized.tipo,
        titulo_preenchido: normalized.titulo.length > 0,
        grupo_preenchido: normalized.grupo.length > 0,
        responsavel_preenchido: normalized.responsavel.length > 0,
      },
    });
    setFilters(normalized);
  }

  function clearFilters() {
    applyFilters(defaultEventosFilters);
  }

  return {
    contextError,
    filters,
    setFilters: applyFilters,
    clearFilters,
    usuarioId,
    estruturaId,
    grupoId,
    data: eventosQuery.data ?? null,
    items: eventosQuery.data?.items ?? [],
    pageInfo: eventosQuery.data?.pageInfo ?? null,
    isInitialLoading: eventosQuery.isLoading,
    isFetching: eventosQuery.isFetching && !eventosQuery.isLoading,
    isError: eventosQuery.isError,
    errorMessage: eventosQuery.isError
      ? normalizeApiError(eventosQuery.error, 'Nao foi possivel carregar eventos.').message
      : null,
    refetch: eventosQuery.refetch,
  };
}
