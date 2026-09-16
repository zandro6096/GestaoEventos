import type { SecureStorageAdapter } from './contract';

const prefix = 'gestaoeventos.secure.';

function getSessionStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export const secureStorage: SecureStorageAdapter = {
  async getItem(key) {
    return getSessionStorage()?.getItem(`${prefix}${key}`) ?? null;
  },
  async setItem(key, value) {
    getSessionStorage()?.setItem(`${prefix}${key}`, value);
  },
  async deleteItem(key) {
    getSessionStorage()?.removeItem(`${prefix}${key}`);
  },
};
