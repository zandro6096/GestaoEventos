import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

// Relatórios do mês: planilhas que a equipe publicou para a estrutura (ex.: Discipulado do Daniel),
// preenchidas com os dados do mês. Quem gerencia a rede do modelo vê pendências e baixa.

type ApiEnvelope<T> = { data?: T | null };

export type ModeloRelatorio = {
  id: number;
  nome: string;
  descricao?: string | null;
  grupoId: number;
  grupoNome: string;
};

export type ItemPendencia = { codigo: string; texto: string; ok: boolean };

export type PendenciaCelula = { grupoId: number; nome: string; itens: ItemPendencia[]; pendentes: number };

export type StatusMes = 'em_andamento' | 'pendente' | 'completo';

export type MesRelatorio = {
  ano: number;
  mes: number;
  rotulo: string;
  status: StatusMes;
  fechaEm: string;
  celulas: number;
  pessoas: number;
  presencasLancadas: number;
  celulasComPresenca: number;
  totalPendencias: number;
  pendencias: PendenciaCelula[];
};

export type MesesRelatorio = { modelo: ModeloRelatorio; meses: MesRelatorio[] };

export type ArquivoRelatorio = {
  nomeArquivo: string;
  conteudoBase64: string;
  tamanhoBytes: number;
  celulas: number;
  pessoas: number;
  presencasLancadas: number;
  avisos: string[];
};

function unwrap<T>(body: unknown): T {
  const envelope = toCamelCase(body) as ApiEnvelope<T>;
  return (envelope.data ?? envelope) as T;
}

export const relatoriosMensaisApi = {
  async listarModelos(estruturaId: number): Promise<ModeloRelatorio[]> {
    const response = await httpClient.get(apiRoute('/api/relatorios-mensais'), { params: { estrutura_id: estruturaId } });
    return unwrap<{ itens: ModeloRelatorio[] }>(response.data).itens ?? [];
  },

  async listarMeses(modeloId: number, quantidade = 4): Promise<MesesRelatorio> {
    const response = await httpClient.get(apiRoute(`/api/relatorios-mensais/${modeloId}/meses`), { params: { quantidade } });
    return unwrap<MesesRelatorio>(response.data);
  },

  async gerar(modeloId: number, ano: number, mes: number): Promise<ArquivoRelatorio> {
    // A planilha é montada no servidor; pode levar alguns segundos.
    const response = await httpClient.post(apiRoute(`/api/relatorios-mensais/${modeloId}/gerar`), toSnakeCase({ ano, mes }), { timeout: 60000 });
    // Não converter o conteúdo base64 (só as chaves): toCamelCase só mexe em chaves.
    return unwrap<ArquivoRelatorio>(response.data);
  },
};
