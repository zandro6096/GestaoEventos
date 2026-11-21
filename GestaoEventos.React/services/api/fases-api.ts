import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

// Fase do evento (ex.: Evangelismo, Comunhão, Edificação, Multiplicação na célula).
// Opções no modelo de evento; histórico por evento.

type ApiEnvelope<T> = { data?: T | null };

export type FaseHistorico = {
  id: number;
  fase: string;
  vigenteDesde: string;
  registradoPorId?: number | null;
  registradoPorNome?: string | null;
  registradoEm: string;
  observacao?: string | null;
};

export type FaseEvento = {
  eventoId: number;
  eventoTemplateId?: number | null;
  /** Opções do modelo, na ordem em que o grupo avança. */
  opcoes: string[];
  /** Fase vigente hoje. */
  atual?: FaseHistorico | null;
  /** Do mais recente para o mais antigo. */
  historico: FaseHistorico[];
  /** Quem está logado pode registrar mudança de fase. */
  podeAlterar: boolean;
  /** Data prevista para multiplicar (AAAA-MM-DD...), se definida. */
  multiplicacaoPrevista?: string | null;
};

export type FaseUso = { nome: string; eventosEmUso: number };

export type FasesDoModelo = { fases: string[]; uso: FaseUso[] };

export type RegistrarFaseRequest = {
  fase: string;
  /** AAAA-MM-DD; vazio = hoje. */
  vigenteDesde?: string | null;
  observacao?: string | null;
};

function unwrap<T>(body: unknown): T {
  const envelope = toCamelCase(body) as ApiEnvelope<T>;
  return (envelope.data ?? envelope) as T;
}

/** Garante listas e flags mesmo se a resposta vier incompleta (a tela de acompanhamento não pode quebrar por isso). */
function normalizar(body: unknown, eventoId: number): FaseEvento {
  const data = unwrap<Partial<FaseEvento> | null>(body);
  const f = data && !Array.isArray(data) ? data : {};
  return {
    eventoId: f.eventoId ?? eventoId,
    eventoTemplateId: f.eventoTemplateId ?? null,
    opcoes: Array.isArray(f.opcoes) ? f.opcoes : [],
    atual: f.atual ?? null,
    historico: Array.isArray(f.historico) ? f.historico : [],
    podeAlterar: Boolean(f.podeAlterar),
    multiplicacaoPrevista: f.multiplicacaoPrevista ?? null,
  };
}

export const fasesApi = {
  async obterDoEvento(eventoId: number): Promise<FaseEvento> {
    const response = await httpClient.get(apiRoute(`/api/eventos/${eventoId}/fase`));
    return normalizar(response.data, eventoId);
  },

  async registrar(eventoId: number, request: RegistrarFaseRequest): Promise<FaseEvento> {
    const response = await httpClient.post(apiRoute(`/api/eventos/${eventoId}/fase`), toSnakeCase(request));
    return normalizar(response.data, eventoId);
  },

  /** `data` em AAAA-MM-DD; nulo limpa a data prevista. */
  async definirMultiplicacao(eventoId: number, data: string | null): Promise<FaseEvento> {
    const response = await httpClient.put(apiRoute(`/api/eventos/${eventoId}/multiplicacao`), { data });
    return normalizar(response.data, eventoId);
  },

  async listarDoModelo(templateId: number): Promise<FasesDoModelo> {
    const response = await httpClient.get(apiRoute(`/api/evento-templates/${templateId}/fases`));
    const data = unwrap<Partial<FasesDoModelo> | null>(response.data);
    return { fases: Array.isArray(data?.fases) ? data.fases : [], uso: Array.isArray(data?.uso) ? data.uso : [] };
  },

  async definirDoModelo(templateId: number, fases: string[]): Promise<string[]> {
    const response = await httpClient.put(apiRoute(`/api/evento-templates/${templateId}/fases`), { fases });
    return unwrap<{ fases: string[] }>(response.data).fases ?? [];
  },
};

/** Fase vigente numa data (AAAA-MM-DD...): o registro mais recente com "vigente desde" até ela. */
export function faseNaData(historico: FaseHistorico[], dataIso: string): FaseHistorico | null {
  const dia = dataIso.slice(0, 10);
  return historico.find((h) => h.vigenteDesde.slice(0, 10) <= dia) ?? null;
}

/** Próxima fase na ordem do modelo (a primeira, se não houver atual; a última se já estiver no fim). */
export function proximaFase(opcoes: string[], atual?: string | null): string | null {
  if (!opcoes.length) return null;
  const i = atual ? opcoes.findIndex((o) => o.toLowerCase() === atual.toLowerCase()) : -1;
  return opcoes[Math.min(i + 1, opcoes.length - 1)] ?? null;
}
