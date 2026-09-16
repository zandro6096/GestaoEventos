import type { AnalyticsProviderPayload } from './contract';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function publishAnalyticsEvent(payload: AnalyticsProviderPayload) {
  if (typeof window === 'undefined') {
    return {
      delivered: false,
      queued: false,
      reason: 'window_unavailable',
    };
  }

  const { extra, ...eventPayload } = payload;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    ...eventPayload,
    ...(extra ?? {}),
  });

  return {
    delivered: true,
    queued: false,
  };
}

export function getQueuedAnalyticsEvents() {
  return [];
}

export function clearQueuedAnalyticsEvents() {
  return undefined;
}
