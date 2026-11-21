import { eventosApi } from '../../../services/api/eventos-api';
import { gruposApi } from '../../../services/api/grupos-api';

// A API nao devolve ocorrencias sem janela de datas; cobre historico recente e o proximo periodo.
function janelaDeOcorrencias() {
  const dia = 24 * 60 * 60 * 1000;
  const agora = Date.now();
  const formatar = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  return { dataInicio: formatar(agora - 120 * dia), dataFim: formatar(agora + 60 * dia) };
}

export const grupoDetalheService = {
  async carregar(grupoId: number, usuarioId: number, estruturaId: number) {
    const [grupo, hierarquia, membros, responsaveis, eventos] = await Promise.all([
      gruposApi.getById(grupoId), gruposApi.list(estruturaId, 0, 100), gruposApi.membros(grupoId), gruposApi.responsaveis(grupoId),
      eventosApi.listOcorrencias({ usuarioId, estruturaId, grupoId, ...janelaDeOcorrencias(), includeCanceladas: true, take: 100 }),
    ]);
    if (grupo.estruturaId !== estruturaId) throw new Error('Grupo fora da estrutura ativa.');
    return { grupo, hierarquia: hierarquia.data, membros: membros.data, responsaveis: responsaveis.data, eventos: eventos.data };
  },
};
