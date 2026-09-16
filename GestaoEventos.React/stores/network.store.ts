import { create } from 'zustand';

import type { NetworkSnapshot } from '../services/platform/network/contract';

const initialNetworkSnapshot: NetworkSnapshot = {
  isOnline: true,
  isInternetReachable: null,
  type: 'UNKNOWN',
  checkedAt: new Date(0).toISOString(),
  source: 'web',
};

type NetworkStore = {
  snapshot: NetworkSnapshot;
  setSnapshot: (snapshot: NetworkSnapshot) => void;
};

export const useNetworkStore = create<NetworkStore>((set) => ({
  snapshot: initialNetworkSnapshot,
  setSnapshot: (snapshot) => set({ snapshot }),
}));

export function getNetworkSnapshot() {
  return useNetworkStore.getState().snapshot;
}

export function isNetworkOffline(snapshot: NetworkSnapshot) {
  // A mutacao so pode ser liberada quando a conectividade foi confirmada.
  return !snapshot.isOnline || snapshot.isInternetReachable !== true;
}

export function isNetworkStatusUnknown(snapshot: NetworkSnapshot) {
  return snapshot.isOnline && snapshot.isInternetReachable === null;
}
