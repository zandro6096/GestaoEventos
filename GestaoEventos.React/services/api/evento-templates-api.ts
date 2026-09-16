import { toCamelCase, toSnakeCase } from "./case-conversion";
import { apiRoute, httpClient } from "./http-client";

export type EventoTemplate = {
  id: number;
  estruturaId: number;
  titulo: string;
  descricao: string;
  tipoRecorrencia: number;
  intervalo: number;
  diasSemana: string[] | null;
  duracaoPadraoMinutos: number;
  horarioPadrao: string | null;
  localPadrao: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  opcaoFim: string | null;
  dataFim: string | null;
  maxOcorrencias: number | null;
  permitirRenomear: boolean;
  permitirConfigurarDia: boolean;
  permitirConfigurarHora: boolean;
  permitirConfigurarLocal: boolean;
  permitirReabertura: boolean;
  permitirReatribuicaoResponsavel: boolean;
  permitirAddResponsaveis: boolean;
  permitirRemoverResponsaveis: boolean;
  permitirAddParticipantes: boolean;
  permitirRemoverParticipantes: boolean;
  requerJustificativaRemocao: boolean;
  requerJustificativaAusencia: boolean;
  permitirPresencaAgrupada: boolean;
  templatesMatrizIds?: number[] | null;
  cobrancaPresencaAtiva: boolean;
  prazoRegistroQuantidade: number;
  prazoRegistroUnidade: "horas" | "dias";
  avisoInicialAposQuantidade: number;
  avisoInicialAposUnidade: "horas" | "dias";
  avisoVencimentoAntesQuantidade: number;
  avisoVencimentoAntesUnidade: "horas" | "dias";
  escalonamentoAposQuantidade: number;
  escalonamentoAposUnidade: "horas" | "dias";
  repetirCobrancaQuantidade: number;
  repetirCobrancaUnidade: "horas" | "dias";
  gruposIds?: number[] | null;
  tiposGrupoIds?: number[] | null;
  papeisIds?: number[] | null;
  criadoEm?: string | null;
  status: string;
};
export type GrupoDestino = {
  id: number;
  nome: string;
  estruturaId: number;
  grupoPaiId?: number | null;
};
export type EventoTemplatePayload = Partial<
  Omit<EventoTemplate, "id" | "estruturaId" | "status" | "criadoEm">
> & {
  titulo: string;
  descricao: string;
  tipo: string;
  estruturaId?: number;
  criadorId?: number;
};
export type EventoTemplatesPage = {
  data: EventoTemplate[];
  total: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
};

async function listAll<T>(
  path: "/api/evento-templates" | "/api/grupos",
  estruturaId: number,
): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const response = await httpClient.get(path, {
      params: {
        estrutura_id: estruturaId,
        ...(path === "/api/grupos"
          ? { skip: items.length, take: 100 }
          : { page_number: page, page_size: 100, status: "ATIVO" }),
      },
    });
    const body = toCamelCase<{
      data: T[];
      pagedInfo?: { totalPages?: number };
      pageInfo?: { totalPages?: number };
    }>(response.data);
    if (!Array.isArray(body.data))
      throw new Error("Resposta invalida ao carregar modelos e grupos.");
    items.push(...body.data);
    const totalPages = body.pagedInfo?.totalPages ?? body.pageInfo?.totalPages;
    if (body.data.length < 100 || (totalPages && page >= totalPages))
      return items;
  }
}

export const eventoTemplatesApi = {
  list: (estruturaId: number) =>
    listAll<EventoTemplate>(
      apiRoute("/api/evento-templates") as "/api/evento-templates",
      estruturaId,
    ),
  async listPage(
    estruturaId: number,
    pageNumber = 1,
    pageSize = 20,
  ): Promise<EventoTemplatesPage> {
    const response = await httpClient.get(apiRoute("/api/evento-templates"), {
      params: {
        estrutura_id: estruturaId,
        page_number: pageNumber,
        page_size: pageSize,
      },
    });
    const body = toCamelCase<Record<string, any>>(response.data);
    const data = Array.isArray(body.data)
      ? (body.data as EventoTemplate[])
      : [];
    const info = body.pagedInfo ?? body.pageInfo ?? {};
    const total = Number(info.totalRecords ?? info.total ?? data.length);
    const pages = Number(
      info.totalPages ?? Math.max(1, Math.ceil(total / pageSize)),
    );
    return {
      data,
      total: Number.isFinite(total) ? total : data.length,
      totalPages: Number.isFinite(pages) ? pages : 1,
      pageNumber,
      pageSize,
    };
  },
  getById: async (id: number) => {
    const response = await httpClient.get(
      apiRoute(`/api/evento-templates/${id}`),
    );
    return toCamelCase<{ data: EventoTemplate }>(response.data);
  },
  create: async (payload: EventoTemplatePayload) => {
    const response = await httpClient.post(
      apiRoute("/api/evento-templates"),
      toSnakeCase(payload),
    );
    return toCamelCase<{ data: EventoTemplate }>(response.data);
  },
  update: async (id: number, payload: Partial<EventoTemplatePayload>) => {
    const response = await httpClient.put(
      apiRoute(`/api/evento-templates/${id}`),
      toSnakeCase({ id, ...payload }),
    );
    return toCamelCase<{ data: EventoTemplate }>(response.data);
  },
  remove: async (id: number) => {
    const response = await httpClient.delete(
      apiRoute(`/api/evento-templates/${id}`),
    );
    return toCamelCase<{ data: EventoTemplate }>(response.data);
  },
  grupos: (estruturaId: number) =>
    listAll<GrupoDestino>("/api/grupos", estruturaId),
};
