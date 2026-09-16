import { painelApi, type CockpitMatrixRow, type CockpitSummary } from './painel-api';

export type FrequenciaRelatorioScope = { estruturaId: number; grupoId?: number | null; dataInicio: string; dataFim: string; busca?: string };
export type FrequenciaRelatorioItem = { tipo: string; participanteId: number; nome: string; grupoNome: string; presencas: number; faltas: number; totalEventos: number; percentual: number; faltasConsecutivas: number };
export type FrequenciaRelatorio = { resumo: CockpitSummary; itens: FrequenciaRelatorioItem[] };

export const relatoriosApi = {
  async getFrequencia(scope: FrequenciaRelatorioScope): Promise<FrequenciaRelatorio> {
    const [cockpit, matrix] = await Promise.all([
      painelApi.getCockpit(scope),
      painelApi.getMatriz({ ...scope, busca: scope.busca, tamanhoPagina: 200 }),
    ]);
    return { resumo: cockpit.resumo, itens: matrix.items.map(toReportItem) };
  },
};

function toReportItem(item: CockpitMatrixRow): FrequenciaRelatorioItem {
  return { tipo: item.tipo, participanteId: item.participanteId, nome: item.nome, grupoNome: item.grupoNome, presencas: item.totalPresencas, faltas: item.totalFaltas, totalEventos: item.totalEventosConsiderados, percentual: item.taxaParticipacao, faltasConsecutivas: item.faltasConsecutivas };
}
