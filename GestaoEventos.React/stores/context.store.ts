import { create } from 'zustand';

import type { ContextoInicial, EstruturaSumario, LimitesPlano } from '../services/api/contexto-api';
import { contextSelectionService } from '../services/session/context-selection.service';

export type ContextSnapshot = {
  usuarioId: number | null;
  usuarioNome: string | null;
  estruturaId: number | null;
  grupoId: number | null;
  estruturaNome: string | null;
  estruturaLogoUrl: string | null;
  grupoNome: string | null;
  temEstrutura: boolean;
  estruturas: EstruturaSumario[];
  plano: string | null;
  limites: LimitesPlano | null;
};

type ContextStore = {
  usuarioId: number | null;
  usuarioNome: string | null;
  estruturaId: number | null;
  selectedStructureId: number | null;
  grupoId: number | null;
  selectedGroupId: number | null;
  estruturaNome: string | null;
  estruturaLogoUrl: string | null;
  grupoNome: string | null;
  temEstrutura: boolean;
  estruturas: EstruturaSumario[];
  plano: string | null;
  limites: LimitesPlano | null;
  canSwitchStructure: boolean;
  updatedAt: string | null;
  setContextoInicial: (contexto: ContextoInicial) => void;
  selectEstrutura: (estruturaId: number) => void;
  restoreContextSnapshot: (snapshot: ContextSnapshot) => void;
  getContextSnapshot: () => ContextSnapshot;
  clearContext: () => void;
};

const emptyContext = {
  usuarioId: null,
  usuarioNome: null,
  estruturaId: null,
  selectedStructureId: null,
  grupoId: null,
  selectedGroupId: null,
  estruturaNome: null,
  estruturaLogoUrl: null,
  grupoNome: null,
  temEstrutura: false,
  estruturas: [],
  plano: null,
  limites: null,
  canSwitchStructure: false,
  updatedAt: null,
};

export const useContextStore = create<ContextStore>((set, get) => ({
  ...emptyContext,
  setContextoInicial(contexto) {
    set({
      usuarioId: contexto.usuarioId,
      usuarioNome: contexto.usuarioNome,
      estruturaId: contexto.estruturaId,
      selectedStructureId: contexto.estruturaId,
      grupoId: contexto.grupoId,
      selectedGroupId: contexto.grupoId,
      estruturaNome: contexto.estruturaNome,
      estruturaLogoUrl: contexto.estruturaLogoUrl ?? null,
      grupoNome: contexto.grupoNome,
      temEstrutura: contexto.temEstrutura,
      estruturas: contexto.estruturas,
      plano: contexto.plano,
      limites: contexto.limites,
      canSwitchStructure: contexto.estruturas.length > 1,
      updatedAt: new Date().toISOString(),
    });

    if (contexto.estruturaId) {
      void contextSelectionService.saveSelection({
        estruturaId: contexto.estruturaId,
        grupoId: contexto.grupoId,
        estruturaNome: contexto.estruturaNome,
        grupoNome: contexto.grupoNome,
      });
    }
  },
  selectEstrutura(estruturaId) {
    const selected = get().estruturas.find((estrutura) => estrutura.id === estruturaId);
    if (!selected) return;

    set({
      estruturaId: selected.id,
      selectedStructureId: selected.id,
      estruturaNome: selected.nome,
      estruturaLogoUrl: selected.logoUrl ?? null,
      grupoId: null,
      selectedGroupId: null,
      grupoNome: null,
      temEstrutura: true,
      updatedAt: new Date().toISOString(),
    });

    void contextSelectionService.saveSelection({
      estruturaId: selected.id,
      grupoId: null,
      estruturaNome: selected.nome,
      grupoNome: null,
    });
  },
  restoreContextSnapshot(snapshot) {
    set({
      ...snapshot,
      selectedStructureId: snapshot.estruturaId,
      selectedGroupId: snapshot.grupoId,
      canSwitchStructure: snapshot.estruturas.length > 1,
      updatedAt: new Date().toISOString(),
    });

    if (snapshot.estruturaId) {
      void contextSelectionService.saveSelection({
        estruturaId: snapshot.estruturaId,
        grupoId: snapshot.grupoId,
        estruturaNome: snapshot.estruturaNome,
        grupoNome: snapshot.grupoNome,
      });
    } else {
      void contextSelectionService.clearSelection();
    }
  },
  getContextSnapshot() {
    const state = get();

    return {
      usuarioId: state.usuarioId,
      usuarioNome: state.usuarioNome,
      estruturaId: state.estruturaId,
      grupoId: state.grupoId,
      estruturaNome: state.estruturaNome,
      estruturaLogoUrl: state.estruturaLogoUrl,
      grupoNome: state.grupoNome,
      temEstrutura: state.temEstrutura,
      estruturas: state.estruturas,
      plano: state.plano,
      limites: state.limites,
    };
  },
  clearContext() {
    set(emptyContext);
    void contextSelectionService.clearSelection();
  },
}));

export function getActiveContext() {
  return useContextStore.getState();
}
