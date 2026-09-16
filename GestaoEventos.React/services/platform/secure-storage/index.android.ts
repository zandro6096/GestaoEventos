import * as SecureStore from 'expo-secure-store';

import type { SecureStorageAdapter } from './contract';

const options: SecureStore.SecureStoreOptions = {
  keychainService: 'gestaoeventos.auth',
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureStorage: SecureStorageAdapter = {
  getItem(key) {
    return SecureStore.getItemAsync(key, options);
  },
  setItem(key, value) {
    return SecureStore.setItemAsync(key, value, options);
  },
  deleteItem(key) {
    return SecureStore.deleteItemAsync(key, options);
  },
};
