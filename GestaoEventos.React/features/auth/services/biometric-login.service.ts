import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const tokenKey = 'biometric_login_token';
const enabledKey = 'biometric_login_enabled';
const secureOptions: SecureStore.SecureStoreOptions = {
  keychainService: 'gestaoeventos.biometric',
  requireAuthentication: true,
};

export async function biometricAvailability(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!(await LocalAuthentication.hasHardwareAsync())) return false;
  return LocalAuthentication.isEnrolledAsync();
}

export async function isBiometricLoginEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return (await SecureStore.getItemAsync(enabledKey)) === 'true';
}

export async function enableBiometricLogin(token: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirme para ativar o login biométrico',
    cancelLabel: 'Agora não',
    disableDeviceFallback: false,
  });
  if (!result.success) return false;

  await SecureStore.setItemAsync(tokenKey, token, secureOptions);
  await SecureStore.setItemAsync(enabledKey, 'true');
  return true;
}

export async function authenticateBiometricLogin(): Promise<string | null> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirme sua identidade para entrar',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  });
  if (!result.success) return null;

  return SecureStore.getItemAsync(tokenKey, secureOptions);
}
