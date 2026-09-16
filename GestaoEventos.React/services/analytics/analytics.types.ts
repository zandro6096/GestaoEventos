export type AnalyticsAction =
  | 'visualization'
  | 'entrance'
  | 'click'
  | 'scroll'
  | 'simulation'
  | 'confirmation'
  | 'abandonment';

export type AnalyticsExtraValue = string | number | boolean | null;

export type AnalyticsExtra = Record<string, AnalyticsExtraValue>;

export type AnalyticsTrackOptions = {
  extra?: AnalyticsExtra;
  path?: string;
  now?: () => Date;
};

export type AnalyticsTrackResult = {
  delivered: boolean;
  queued: boolean;
  reason?: string;
};

export const analyticsActions: readonly AnalyticsAction[] = [
  'visualization',
  'entrance',
  'click',
  'scroll',
  'simulation',
  'confirmation',
  'abandonment',
];

export function normalizeRouteForAnalytics(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0]?.trim() || '/';
  const normalized = path.startsWith('/') ? path : `/${path}`;

  return normalized
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?=\/|$)/gi,
      '/:id',
    )
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}
