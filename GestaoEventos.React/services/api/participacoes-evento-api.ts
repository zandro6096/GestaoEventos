import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';
export type AttendanceItem = {
  eventoId: number; ocorrenciaId: number; usuarioId?: number; usuarioVirtualId?: number;
  ocorridoEm: string; status: AttendanceStatus; observacao: string | null; registradoPor: number;
};

export const participacoesEventoApi = {
  async create(item: AttendanceItem) {
    const response = await httpClient.post(apiRoute('/api/participacoes-evento'), toSnakeCase(item));
    return toCamelCase(response.data);
  },
  async createBulk(itens: AttendanceItem[]) {
    const response = await httpClient.post(apiRoute('/api/participacoes-evento/lote'), toSnakeCase({ itens }));
    return toCamelCase(response.data);
  },
};
