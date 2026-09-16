import type { AnalyticsAction, AnalyticsExtra, AnalyticsTrackResult } from '../../analytics/analytics.types';
import type { AppEnvironment } from '../../runtime/app-environment';

export type AnalyticsProviderPayload = {
  event: 'ge_event';
  custom: {
    path: string;
    action: AnalyticsAction;
    detail: string;
  };
  source: 'gestaoeventos_react';
  environment: AppEnvironment;
  timestamp: string;
  extra?: AnalyticsExtra;
};

export type AnalyticsProvider = {
  publishAnalyticsEvent: (payload: AnalyticsProviderPayload) => AnalyticsTrackResult;
  getQueuedAnalyticsEvents: () => readonly AnalyticsProviderPayload[];
  clearQueuedAnalyticsEvents: () => void;
};
