import type { NetworkListener, NetworkSnapshot, NetworkUnsubscribe } from './contract';

export function readNetworkSnapshot(): Promise<NetworkSnapshot> {
  return Promise.resolve(createWebSnapshot());
}

export function subscribeNetworkStatus(listener: NetworkListener): NetworkUnsubscribe {
  if (typeof window === 'undefined') return () => undefined;

  const notify = () => listener(createWebSnapshot());

  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  notify();

  return () => {
    window.removeEventListener('online', notify);
    window.removeEventListener('offline', notify);
  };
}

function createWebSnapshot(): NetworkSnapshot {
  const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;

  return {
    isOnline,
    isInternetReachable: typeof navigator === 'undefined' ? null : isOnline,
    type: isOnline ? 'UNKNOWN' : 'NONE',
    checkedAt: new Date().toISOString(),
    source: 'web',
  };
}
