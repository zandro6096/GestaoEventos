import { useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';

import { useAuthStore } from '../../stores/auth.store';
import { configureForegroundNotifications, subscribeToNotificationTaps } from '../platform/push-notifications/index';
import { pushRegistrationService } from './push-registration.service';
import { resolvePushRoute } from './push-routing';

export function usePushNotifications() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const userId = useAuthStore((state) => state.user?.id ?? null);

  useEffect(() => {
    configureForegroundNotifications();
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !userId) return;
    void pushRegistrationService.register();
  }, [status, userId]);

  useEffect(() => {
    if (status !== 'authenticated') return undefined;

    return subscribeToNotificationTaps((data) => {
      const route = resolvePushRoute(data);
      if (route) router.push(route as Href);
    });
  }, [router, status]);
}
