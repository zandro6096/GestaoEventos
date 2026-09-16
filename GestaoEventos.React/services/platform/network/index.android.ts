import { readNativeNetworkSnapshot, subscribeNativeNetworkStatus } from './native';

import type { NetworkListener } from './contract';

export function readNetworkSnapshot() {
  return readNativeNetworkSnapshot('android');
}

export function subscribeNetworkStatus(listener: NetworkListener) {
  return subscribeNativeNetworkStatus('android', listener);
}
