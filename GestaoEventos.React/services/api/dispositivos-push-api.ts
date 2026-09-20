import { apiRoute, httpClient } from './http-client';

export const dispositivosPushApi = {
  async registrar(token: string, plataforma: 'ios' | 'android'): Promise<void> {
    await httpClient.post(apiRoute('/api/dispositivos-push'), { token, plataforma });
  },

  async remover(token: string): Promise<void> {
    await httpClient.post(apiRoute('/api/dispositivos-push/remover'), { token });
  },
};
