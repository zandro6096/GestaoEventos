import type { AnalyticsProviderPayload } from './contract';

const queuedEvents: AnalyticsProviderPayload[] = [];

export function publishAnalyticsEvent(payload: AnalyticsProviderPayload) {
  queuedEvents.push(payload);

  return {
    delivered: false,
    queued: true,
    reason: 'native_analytics_provider_pending',
  };
}

export function getQueuedAnalyticsEvents() {
  return [...queuedEvents];
}

export function clearQueuedAnalyticsEvents() {
  queuedEvents.length = 0;
}
