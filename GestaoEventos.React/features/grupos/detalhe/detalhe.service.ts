import { eventosApi } from '../../../services/api/eventos-api';
import { gruposApi } from '../../../services/api/grupos-api';

export const grupoDetalheService = {
  async carregar(grupoId: number, usuarioId: number, estruturaId: number) {
    const [grupo, hierarquia, membros, responsaveis, eventos] = await Promise.all([
      gruposApi.getById(grupoId), gruposApi.list(estruturaId, 0, 100), gruposApi.membros(grupoId), gruposApi.responsaveis(grupoId),
      eventosApi.listOcorrencias({ usuarioId, estruturaId, grupoId, includeCanceladas: true, take: 100 }),
    ]);
    if (grupo.estruturaId !== estruturaId) throw new Error('Grupo fora da estrutura ativa.');
    return { grupo, hierarquia: hierarquia.data, membros: membros.data, responsaveis: responsaveis.data, eventos: eventos.data };
  },
};
