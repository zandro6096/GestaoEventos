import { apiRoute, httpClient } from './http-client';

export const contaApi = {
  async excluir(senha: string): Promise<void> {
    await httpClient.post(apiRoute('/api/conta/excluir'), { senha });
  },
};
