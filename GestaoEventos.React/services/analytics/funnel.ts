import { track } from './analytics.service';
import type { AnalyticsExtra, AnalyticsTrackResult } from './analytics.types';

type FunnelOptions = { extra?: AnalyticsExtra; path?: string };

export const funnel = {
  entrance(detail: string, options?: FunnelOptions): AnalyticsTrackResult { return track('entrance', detail, options); },
  simulation(detail: string, options?: FunnelOptions): AnalyticsTrackResult { return track('simulation', detail, options); },
  confirmation(detail: string, options?: FunnelOptions): AnalyticsTrackResult { return track('confirmation', detail, options); },
};
