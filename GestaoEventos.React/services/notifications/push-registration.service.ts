import { dispositivosPushApi } from '../api/dispositivos-push-api';
import { registerForPushNotifications } from '../platform/push-notifications/index';
import { secureStorage } from '../platform/secure-storage/index';

const PUSH_TOKEN_STORAGE_KEY = 'push_token';

let unregistering = false;

// Falha de push nunca deve afetar o uso do app: todos os erros sao engolidos aqui.
export const pushRegistrationService = {
  async register(): Promise<void> {
    try {
      const result = await registerForPushNotifications();
      if (result.status !== 'registered') return;

      await dispositivosPushApi.registrar(result.token, result.platform);
      await secureStorage.setItem(PUSH_TOKEN_STORAGE_KEY, result.token);
    } catch {
      // Sem rede, sem Firebase/APNs configurado ou permissao negada: tenta de novo na proxima abertura.
    }
  },

  async unregister(): Promise<void> {
    // Um 401 durante a remocao dispara o logout de novo; a trava evita o laco.
    if (unregistering) return;
    unregistering = true;

    try {
      const token = await secureStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
      if (!token) return;

      await dispositivosPushApi.remover(token);
      await secureStorage.deleteItem(PUSH_TOKEN_STORAGE_KEY);
    } catch {
      // Se nao remover agora, o token invalido e desativado pelo servidor no proximo envio.
    } finally {
      unregistering = false;
    }
  },
};
