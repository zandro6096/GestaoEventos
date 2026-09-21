import type { PushTapListener } from './contract';
import { configureNativeForegroundNotifications, registerNativePush, subscribeNativeNotificationTaps } from './native';

export function configureForegroundNotifications() {
  configureNativeForegroundNotifications();
}

export function registerForPushNotifications() {
  return registerNativePush('ios');
}

export function subscribeToNotificationTaps(listener: PushTapListener) {
  return subscribeNativeNotificationTaps(listener);
}
