import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import type { PushPlatform, PushRegistrationResult, PushTapListener, PushUnsubscribe } from './contract';

// Mesmo id usado pelo backend no campo channelId do push (Android).
export const PUSH_CHANNEL_ID = 'pendencias';

let foregroundConfigured = false;

export function configureNativeForegroundNotifications() {
  if (foregroundConfigured) return;
  foregroundConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function registerNativePush(platform: PushPlatform): Promise<PushRegistrationResult> {
  if (!Device.isDevice) return { status: 'unsupported', reason: 'Push exige um aparelho fisico.' };

  if (platform === 'android') {
    // No Android 13+ o canal precisa existir antes de pedir a permissao.
    await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_ID, {
      name: 'Pendencias de presenca',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#0066FF',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let granted = current.granted;
  if (!granted && current.canAskAgain) granted = (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return { status: 'denied' };

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return { status: 'unsupported', reason: 'projectId do EAS ausente.' };

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return { status: 'registered', token: token.data, platform };
}

export function subscribeNativeNotificationTaps(listener: PushTapListener): PushUnsubscribe {
  const deliver = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    listener(data && typeof data === 'object' ? (data as Record<string, unknown>) : {});
  };

  const subscription = Notifications.addNotificationResponseReceivedListener(deliver);

  // Toque que abriu o app a partir do estado encerrado.
  const initial = Notifications.getLastNotificationResponse();
  if (initial) {
    deliver(initial);
    Notifications.clearLastNotificationResponse();
  }

  return () => subscription.remove();
}
