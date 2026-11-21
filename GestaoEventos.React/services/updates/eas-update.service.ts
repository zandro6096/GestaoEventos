import * as Updates from 'expo-updates';

export type EasUpdateState = {
  isUpdateReady: boolean;
  isReloading: boolean;
};

const listeners = new Set<(state: EasUpdateState) => void>();
let state: EasUpdateState = { isUpdateReady: false, isReloading: false };
let checkInFlight: Promise<void> | null = null;

export function getEasUpdateState() {
  return state;
}

export function subscribeToEasUpdateState(listener: (state: EasUpdateState) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function checkForEasUpdate() {
  if (!Updates.isEnabled || state.isUpdateReady) return Promise.resolve();
  if (checkInFlight) return checkInFlight;

  checkInFlight = (async () => {
    try {
      const check = await Updates.checkForUpdateAsync();
      if (!check.isAvailable) return;

      const downloaded = await Updates.fetchUpdateAsync();
      if (downloaded.isNew) {
        publish({ isUpdateReady: true, isReloading: false });
      }
    } catch {
      // Update checks are best effort; keep the current session running on failures.
    }
  })().finally(() => {
    checkInFlight = null;
  });

  return checkInFlight;
}

export async function reloadToEasUpdate() {
  if (!Updates.isEnabled || !state.isUpdateReady || state.isReloading) return;

  publish({ ...state, isReloading: true });
  try {
    await Updates.reloadAsync();
  } catch {
    publish({ ...state, isReloading: false });
  }
}

function publish(nextState: EasUpdateState) {
  state = nextState;
  listeners.forEach((listener) => listener(state));
}
