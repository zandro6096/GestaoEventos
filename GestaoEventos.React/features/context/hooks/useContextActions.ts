import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { track } from '../../../services/analytics/analytics.service';
import { normalizeApiError } from '../../../services/api/api-error';
import { contextoApi, type ContextoInicial } from '../../../services/api/contexto-api';
import { resetContextScopedQueries } from '../../../services/query/context-query-client';
import { useAuthStore } from '../../../stores/auth.store';
import { useContextStore } from '../../../stores/context.store';

export function useContextActions() {
  const queryClient = useQueryClient();
  const [switchingStructureId, setSwitchingStructureId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function switchEstrutura(estruturaId: number) {
    const contextStore = useContextStore.getState();
    const previousContext = contextStore.getContextSnapshot();
    const selected = previousContext.estruturas.find((estrutura) => estrutura.id === estruturaId);
    const usuarioId = previousContext.usuarioId ?? useAuthStore.getState().user?.id ?? null;

    if (!selected || !usuarioId) {
      const message = 'Nao foi possivel trocar a estrutura com o contexto atual.';
      setErrorMessage(message);
      throw new Error(message);
    }

    setSwitchingStructureId(estruturaId);
    setErrorMessage(null);
    track('simulation', 'context:estrutura_troca');

    try {
      await resetContextScopedQueries(queryClient);
      contextStore.selectEstrutura(estruturaId);

      const hydrated = await contextoApi.getContextoInicial(usuarioId);
      useContextStore.getState().setContextoInicial(applySelectedStructure(hydrated, estruturaId));
      useAuthStore.getState().markContextReady();
      await resetContextScopedQueries(queryClient);
      track('confirmation', 'context:estrutura_trocada');
    } catch (error) {
      useContextStore.getState().restoreContextSnapshot(previousContext);
      const normalized = normalizeApiError(error, 'Nao foi possivel trocar a estrutura agora.');
      setErrorMessage(normalized.message);
      throw normalized;
    } finally {
      setSwitchingStructureId(null);
    }
  }

  return {
    switchingStructureId,
    errorMessage,
    switchEstrutura,
  };
}

function applySelectedStructure(contexto: ContextoInicial, estruturaId: number): ContextoInicial {
  const selected = contexto.estruturas.find((estrutura) => estrutura.id === estruturaId);
  if (!selected) {
    throw new Error('A estrutura selecionada nao esta disponivel para este usuario.');
  }

  return {
    ...contexto,
    estruturaId: selected.id,
    estruturaNome: selected.nome,
    estruturaLogoUrl: selected.logoUrl ?? null,
    grupoId: null,
    grupoNome: null,
  };
}
