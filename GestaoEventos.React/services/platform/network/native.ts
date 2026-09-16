import * as Network from 'expo-network';

import type { NetworkAdapterSource, NetworkListener, NetworkSnapshot, NetworkUnsubscribe } from './contract';

export async function readNativeNetworkSnapshot(source: NetworkAdapterSource): Promise<NetworkSnapshot> {
  const state = await Network.getNetworkStateAsync();
  return toSnapshot(source, state);
}

export function subscribeNativeNetworkStatus(source: NetworkAdapterSource, listener: NetworkListener): NetworkUnsubscribe {
  const subscription = Network.addNetworkStateListener((state) => {
    listener(toSnapshot(source, state));
  });

  void readNativeNetworkSnapshot(source).then(listener);

  return () => subscription.remove();
}

function toSnapshot(source: NetworkAdapterSource, state: Network.NetworkState): NetworkSnapshot {
  const isInternetReachable = state.isInternetReachable ?? null;
  const isConnected =
    state.isConnected ??
    (state.type !== Network.NetworkStateType.NONE && state.type !== Network.NetworkStateType.UNKNOWN);

  return {
    isOnline: isConnected && isInternetReachable !== false,
    isInternetReachable,
    type: state.type ?? Network.NetworkStateType.UNKNOWN,
    checkedAt: new Date().toISOString(),
    source,
  };
}
