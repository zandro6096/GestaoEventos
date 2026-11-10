import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';

import { NetworkStatusProvider } from '../services/network/NetworkStatusProvider';
import { checkForEasUpdate } from '../services/updates/eas-update.service';
import { ApiConfigNotice } from '../shared/components/ApiConfigNotice';
import { EasUpdateNotice } from '../shared/components/EasUpdateNotice';
import { GestureRoot } from '../shared/components/GestureRoot';
import { OfflineBanner } from '../shared/components/OfflineBanner';
import { RouteAnalyticsTracker } from '../shared/components/RouteAnalyticsTracker';
import { colors } from '../shared/design/tokens';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Executa o mutationFn mesmo offline para o guard rejeitar sem pausar/filar.
      networkMode: 'always',
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    let currentState = AppState.currentState;
    focusManager.setFocused(currentState === 'active');
    if (currentState === 'active') void checkForEasUpdate();

    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
      if (state === 'active' && currentState !== 'active') void checkForEasUpdate();
      currentState = state;
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureRoot>
        <QueryClientProvider client={queryClient}>
          <NetworkStatusProvider>
            <StatusBar style="dark" />
            <RouteAnalyticsTracker />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.surfacePage },
              }}
            />
            <OfflineBanner />
            <EasUpdateNotice />
            <ApiConfigNotice />
          </NetworkStatusProvider>
        </QueryClientProvider>
      </GestureRoot>
    </SafeAreaProvider>
  );
}
