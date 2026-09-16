import type { NetworkSnapshot } from '../platform/network/contract';
import { getNetworkSnapshot, isNetworkOffline } from '../../stores/network.store';

export class OfflineMutationBlockedError extends Error {
  readonly code = 'offline_mutation_blocked';

  constructor(actionLabel = 'mutacao') {
    super(`Acao bloqueada sem conexao: ${actionLabel}. Reconecte-se para continuar.`);
    this.name = 'OfflineMutationBlockedError';
  }
}

export function canRunMutation(snapshot: NetworkSnapshot = getNetworkSnapshot()) {
  return !isNetworkOffline(snapshot);
}

export function assertOnlineForMutation(actionLabel?: string, snapshot: NetworkSnapshot = getNetworkSnapshot()) {
  if (!canRunMutation(snapshot)) {
    throw new OfflineMutationBlockedError(actionLabel);
  }
}
