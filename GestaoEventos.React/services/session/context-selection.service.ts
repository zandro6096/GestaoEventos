import { secureStorage } from '../platform/secure-storage/index';

export type PersistedContextSelection = {
  estruturaId: number | null;
  grupoId: number | null;
  estruturaNome: string | null;
  grupoNome: string | null;
  updatedAt: string;
};

const CONTEXT_SELECTION_KEY = 'selected_context';

export const contextSelectionService = {
  async readSelection(): Promise<PersistedContextSelection | null> {
    const raw = await secureStorage.getItem(CONTEXT_SELECTION_KEY);
    if (!raw) return null;

    try {
      return normalizeSelection(JSON.parse(raw));
    } catch {
      await secureStorage.deleteItem(CONTEXT_SELECTION_KEY);
      return null;
    }
  },

  async saveSelection(selection: Omit<PersistedContextSelection, 'updatedAt'>): Promise<void> {
    const payload: PersistedContextSelection = {
      estruturaId: toPositiveInt(selection.estruturaId),
      grupoId: toPositiveInt(selection.grupoId),
      estruturaNome: toNullableString(selection.estruturaNome),
      grupoNome: toNullableString(selection.grupoNome),
      updatedAt: new Date().toISOString(),
    };

    await secureStorage.setItem(CONTEXT_SELECTION_KEY, JSON.stringify(payload));
  },

  async clearSelection(): Promise<void> {
    await secureStorage.deleteItem(CONTEXT_SELECTION_KEY);
  },
};

function normalizeSelection(value: unknown): PersistedContextSelection | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  const estruturaId = toPositiveInt(record.estruturaId);
  if (!estruturaId) return null;

  return {
    estruturaId,
    grupoId: toPositiveInt(record.grupoId),
    estruturaNome: toNullableString(record.estruturaNome),
    grupoNome: toNullableString(record.grupoNome),
    updatedAt: toNullableString(record.updatedAt) ?? new Date(0).toISOString(),
  };
}

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}
