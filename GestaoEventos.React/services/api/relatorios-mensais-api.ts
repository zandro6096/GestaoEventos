import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

// Relatórios do mês: planilhas que a equipe publicou para a estrutura (ex.: Discipulado do Daniel),
// preenchidas com os dados do mês. Quem gerencia a rede do modelo vê pendências e baixa.

type ApiEnvelope<T> = { data?: T | null };

export type ModeloRelatorio = {
  id: number;
  nome: string;
  descricao?: string | null;
};

/** Rede de células (grupo cujos filhos são células): cada célula vira uma aba da planilha. */
export type RedeRelatorio = {
  grupoId: number;
  nome: string;
  responsavel?: string | null;
  celulas: number;
  /** Primeiro dia do mês do primeiro evento de célula (AAAA-MM-DD); antes disso não há relatório. */
  inicio: string;
  anoInicio: number;
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

export type MesesRelatorio = {
  modelo: ModeloRelatorio;
  rede?: RedeRelatorio | null;
  /** Do mais recente para o mais antigo. */
  anosDisponiveis: number[];
  ano: number;
  meses: MesRelatorio[];
};

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

  async listarRedes(modeloId: number): Promise<RedeRelatorio[]> {
    const response = await httpClient.get(apiRoute(`/api/relatorios-mensais/${modeloId}/redes`));
    return unwrap<{ itens: RedeRelatorio[] }>(response.data).itens ?? [];
  },

  /** `mes` vazio = todos os meses do ano (até o atual). */
  async listarMeses(modeloId: number, grupoId: number, ano: number | null, mes: number | null): Promise<MesesRelatorio> {
    const params: Record<string, number> = { grupo_id: grupoId };
    if (ano) params.ano = ano;
    if (mes) params.mes = mes;
    const response = await httpClient.get(apiRoute(`/api/relatorios-mensais/${modeloId}/meses`), { params, timeout: 60000 });
    const data = unwrap<MesesRelatorio>(response.data);
    return { ...data, anosDisponiveis: data.anosDisponiveis ?? [], meses: data.meses ?? [] };
  },

  async gerar(modeloId: number, grupoId: number, ano: number, mes: number): Promise<ArquivoRelatorio> {
    // A planilha é montada no servidor; pode levar alguns segundos.
    const response = await httpClient.post(apiRoute(`/api/relatorios-mensais/${modeloId}/gerar`), toSnakeCase({ grupoId, ano, mes }), { timeout: 60000 });
    // Não converter o conteúdo base64 (só as chaves): toCamelCase só mexe em chaves.
    return unwrap<ArquivoRelatorio>(response.data);
  },
};
