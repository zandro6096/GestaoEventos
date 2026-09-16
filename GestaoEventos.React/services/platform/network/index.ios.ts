import { readNativeNetworkSnapshot, subscribeNativeNetworkStatus } from './native';

import type { NetworkListener } from './contract';

export function readNetworkSnapshot() {
  return readNativeNetworkSnapshot('ios');
}

export function subscribeNetworkStatus(listener: NetworkListener) {
  return subscribeNativeNetworkStatus('ios', listener);
}
