import { getAnalytics } from '@react-native-firebase/analytics';

import type { AnalyticsProviderPayload } from './contract';

const queuedEvents: AnalyticsProviderPayload[] = [];
const maxQueuedEvents = 100;

export function publishAnalyticsEvent(payload: AnalyticsProviderPayload) {
  try {
    const params: Record<string, string | number | boolean> = {
      custom_path: payload.custom.path,
      custom_action: payload.custom.action,
      custom_detail: payload.custom.detail,
      source: payload.source,
      environment: payload.environment,
      event_timestamp: payload.timestamp,
    };

    for (const [key, value] of Object.entries(payload.extra ?? {})) {
      if (value !== null) params[key] = value;
    }

    void getAnalytics().logEvent(payload.event, params).catch(() => {
      enqueue(payload);
    });

    return {
      delivered: true,
      queued: false,
    };
  } catch {
    enqueue(payload);

    return {
      delivered: false,
      queued: true,
      reason: 'native_analytics_unavailable',
    };
  }
}

export function getQueuedAnalyticsEvents() {
  return [...queuedEvents];
}

export function clearQueuedAnalyticsEvents() {
  queuedEvents.length = 0;
}

function enqueue(payload: AnalyticsProviderPayload) {
  if (queuedEvents.length >= maxQueuedEvents) queuedEvents.shift();
  queuedEvents.push(payload);
}
