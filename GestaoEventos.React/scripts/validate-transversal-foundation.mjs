import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function read(path) {
  const absolute = join(root, path);
  assert(existsSync(absolute), `Missing required file: ${path}`);
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : '';
}

const packageJson = JSON.parse(read('package.json'));
const analyticsService = read('services/analytics/analytics.service.ts');
const analyticsTypes = read('services/analytics/analytics.types.ts');
const analyticsWebProvider = read('services/platform/analytics-provider/index.web.ts');
const analyticsNativeQueue = read('services/platform/analytics-provider/native-queue.ts');
const networkProvider = read('services/network/NetworkStatusProvider.tsx');
const nativeNetwork = read('services/platform/network/native.ts');
const webNetwork = read('services/platform/network/index.web.ts');
const mutationGuard = read('services/offline/mutation-guard.ts');

assert(packageJson.dependencies?.['expo-network'], 'expo-network dependency must be installed for native network detection');
assert(analyticsTypes.includes("'click'") && analyticsTypes.includes("'abandonment'"), 'Analytics actions must include Angular auxiliary actions');
assert(analyticsService.includes('UnsafeAnalyticsDetailError'), 'Analytics service must reject unsafe detail values');
assert(analyticsService.includes('screen_view'), 'Route visualization must use existing screen_view detail');
assert(analyticsService.includes("event: 'ge_event'"), 'Analytics service must publish ge_event');
assert(!analyticsService.includes('dataLayer'), 'Analytics service must not push to dataLayer directly');
assert(analyticsWebProvider.includes('window.dataLayer.push'), 'Web analytics provider must push to dataLayer');
assert(analyticsWebProvider.includes('extra ?? {}'), 'Web analytics provider must merge extra fields at top level');
assert(analyticsNativeQueue.includes('queuedEvents.push'), 'Native analytics provider must keep a local queue');
assert(networkProvider.includes('onlineManager.setOnline'), 'Network provider must connect offline state to React Query');
assert(nativeNetwork.includes('Network.addNetworkStateListener'), 'Native network adapter must subscribe to network state changes');
assert(webNetwork.includes("window.addEventListener('online'"), 'Web network adapter must subscribe to online events');
assert(webNetwork.includes("window.addEventListener('offline'"), 'Web network adapter must subscribe to offline events');
assert(mutationGuard.includes('OfflineMutationBlockedError'), 'Mutation guard must expose blocked-offline error');
assert(mutationGuard.includes('assertOnlineForMutation'), 'Mutation guard must expose assertOnlineForMutation');

if (failures.length > 0) {
  console.error('[validate-transversal-foundation] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-transversal-foundation] OK');
