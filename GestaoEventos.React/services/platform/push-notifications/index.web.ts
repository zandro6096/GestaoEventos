import type { PushRegistrationResult, PushTapListener, PushUnsubscribe } from './contract';

export function configureForegroundNotifications() {
  // Sem push nativo na web.
}

export function registerForPushNotifications(): Promise<PushRegistrationResult> {
  return Promise.resolve({ status: 'unsupported', reason: 'Push nativo nao esta disponivel na web.' });
}

export function subscribeToNotificationTaps(_listener: PushTapListener): PushUnsubscribe {
  return () => undefined;
}
