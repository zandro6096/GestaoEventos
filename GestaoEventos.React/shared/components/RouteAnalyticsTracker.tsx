import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { trackRouteVisualization } from '../../services/analytics/analytics.service';

export function RouteAnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastTrackedPath.current === pathname) return;

    lastTrackedPath.current = pathname;
    trackRouteVisualization(pathname);
  }, [pathname]);

  return null;
}
