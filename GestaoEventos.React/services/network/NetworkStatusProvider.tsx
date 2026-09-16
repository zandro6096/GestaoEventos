import { onlineManager } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';

import { isNetworkOffline, useNetworkStore } from '../../stores/network.store';
import { readNetworkSnapshot, subscribeNetworkStatus } from '../platform/network/index';
import type { NetworkSnapshot } from '../platform/network/contract';

export function NetworkStatusProvider({ children }: PropsWithChildren) {
  const setSnapshot = useNetworkStore((state) => state.setSnapshot);

  useEffect(() => {
    let mounted = true;

    const applySnapshot = (snapshot: NetworkSnapshot) => {
      if (!mounted) return;

      setSnapshot(snapshot);
      onlineManager.setOnline(!isNetworkOffline(snapshot));
    };

    void readNetworkSnapshot().then(applySnapshot).catch(() => onlineManager.setOnline(true));
    const unsubscribe = subscribeNetworkStatus(applySnapshot);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setSnapshot]);

  return children;
}
