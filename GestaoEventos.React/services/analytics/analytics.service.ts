import { analyticsActions, normalizeRouteForAnalytics, type AnalyticsAction, type AnalyticsTrackOptions } from './analytics.types';
import { publishAnalyticsEvent } from '../platform/analytics-provider/index';
import { ANALYTICS_ENABLED, APP_ENVIRONMENT } from '../runtime/app-environment';

const safeDetailPattern = /^[a-z][a-z0-9_]*(?::[a-z0-9_]+){0,3}$/;
const unsafeDetailPatterns = [
  /@/,
  /\//,
  /\\/,
  /[?&#=]/,
  /(^|:)\d+($|:)/,
  /\d{4,}/,
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
];

export class UnsafeAnalyticsDetailError extends Error {
  readonly code = 'unsafe_analytics_detail';

  constructor(detail: string) {
    super(`Unsafe analytics detail: ${detail}`);
    this.name = 'UnsafeAnalyticsDetailError';
  }
}

export function track(action: AnalyticsAction, detail: string, options: AnalyticsTrackOptions = {}) {
  assertKnownAction(action);
  assertSafeDetail(detail);
  if (!ANALYTICS_ENABLED) return { delivered: false, queued: false, reason: 'analytics_disabled' };

  const timestamp = (options.now?.() ?? new Date()).toISOString();
  const path = normalizeRouteForAnalytics(options.path ?? '/');

  return publishAnalyticsEvent({
    event: 'ge_event',
    custom: {
      path,
      action,
      detail,
    },
    source: 'gestaoeventos_react',
    environment: APP_ENVIRONMENT,
    timestamp,
    extra: options.extra,
  });
}

export function trackRouteVisualization(pathname: string) {
  return track('visualization', 'screen_view', {
    path: pathname,
  });
}

function assertKnownAction(action: AnalyticsAction) {
  if (!analyticsActions.includes(action)) {
    throw new Error(`Unsupported analytics action: ${action}`);
  }
}

function assertSafeDetail(detail: string) {
  if (!safeDetailPattern.test(detail) || unsafeDetailPatterns.some((pattern) => pattern.test(detail))) {
    throw new UnsafeAnalyticsDetailError(detail);
  }
}
