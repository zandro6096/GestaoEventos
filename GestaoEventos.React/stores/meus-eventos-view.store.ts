import { create } from 'zustand';

type GroupSelection = { contextKey: string; groupId: number | null };

type PeriodFilters = {
  contextKey: string;
  year: number | null;
  month: string | null | undefined;
  eventGroup: string | null;
};

type MeusEventosViewStore = {
  groupSelection: GroupSelection;
  filters: PeriodFilters;
  setGroupSelection: (selection: GroupSelection) => void;
  patchFilters: (contextKey: string, patch: Partial<Omit<PeriodFilters, 'contextKey'>>) => void;
};

function emptyFilters(contextKey: string): PeriodFilters {
  return { contextKey, year: null, month: undefined, eventGroup: null };
}

// A tela usa <Slot />: ao abrir um evento ela desmonta. Manter a selecao aqui evita
// voltar para o passo "Escolha um grupo" e perder o periodo/filtro ao retornar.
export const useMeusEventosViewStore = create<MeusEventosViewStore>((set) => ({
  groupSelection: { contextKey: '', groupId: null },
  filters: emptyFilters(''),
  setGroupSelection: (groupSelection) => set({ groupSelection }),
  patchFilters: (contextKey, patch) => set((state) => ({
    filters: { ...(state.filters.contextKey === contextKey ? state.filters : emptyFilters(contextKey)), ...patch },
  })),
}));

export function readFilters(filters: PeriodFilters, contextKey: string): PeriodFilters {
  return filters.contextKey === contextKey ? filters : emptyFilters(contextKey);
}
