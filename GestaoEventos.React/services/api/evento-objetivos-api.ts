import { toCamelCase, toSnakeCase } from "./case-conversion";
import { apiRoute, httpClient } from "./http-client";

export type EventoObjetivoTipo =
  | "presenca_valida"
  | "quantidade_presencas"
  | "papel_esperado"
  | "conversao_papel";
export type EventoObjetivoEscopo = "individual" | "coletivo" | "evento";
export type EventoObjetivoInicioReferencia =
  "vinculo_template" | "primeira_participacao_valida";
export type EventoObjetivoPrazoUnidade = "dias" | "semanas" | "meses";

export type EventoObjetivo = {
  id: number;
  nome: string;
  descricao: string | null;
  estruturaId: number;
  eventoTemplateId: number;
  eventoTemplateTitulo: string;
  tipo: EventoObjetivoTipo | string;
  escopo: EventoObjetivoEscopo | string;
  dataInicioReferencia: EventoObjetivoInicioReferencia | string;
  prazoQuantidade: number;
  prazoUnidade: EventoObjetivoPrazoUnidade | string;
  metaQuantidade: number;
  papelAlvoId: number | null;
  papelAlvoNome: string | null;
  papelOrigemId: number | null;
  papelOrigemNome: string | null;
  ativo: boolean;
  gruposIds: number[];
  tiposGrupoIds: number[];
  criadoEm: string;
};

export type EventoObjetivoPayload = Omit<
  EventoObjetivo,
  "id" | "eventoTemplateTitulo" | "criadoEm"
>;
export type EventoObjetivoPreview = {
  estruturaId: number;
  eventoTemplateId: number;
  eventoTemplateTitulo: string;
  gruposIds: number[];
  tiposGrupoIds: number[];
  gruposAfetados: number;
  participantesAlvoEstimados: number;
};

function readValue<T>(value: unknown): T {
  const body = toCamelCase<Record<string, unknown>>(value);
  return (body?.data ?? body) as T;
}

export const eventoObjetivosApi = {
  async list(
    estruturaId: number,
    options: { templateId?: number | null; ativo?: boolean | null } = {},
  ) {
    const response = await httpClient.get(apiRoute("/api/evento-objetivos"), {
      params: {
        estrutura_id: estruturaId,
        template_id: options.templateId ?? undefined,
        ativo: options.ativo ?? undefined,
      },
    });
    const value = readValue<EventoObjetivo[]>(response.data);
    return Array.isArray(value) ? value : [];
  },
  async create(payload: EventoObjetivoPayload) {
    const response = await httpClient.post(
      apiRoute("/api/evento-objetivos"),
      toSnakeCase(payload),
    );
    return readValue<EventoObjetivo>(response.data);
  },
  async update(id: number, payload: EventoObjetivoPayload) {
    const response = await httpClient.put(
      apiRoute(`/api/evento-objetivos/${id}`),
      toSnakeCase({ id, ...payload }),
    );
    return readValue<EventoObjetivo>(response.data);
  },
  async updateStatus(id: number, ativo: boolean) {
    const response = await httpClient.patch(
      apiRoute(`/api/evento-objetivos/${id}/status`),
      toSnakeCase({ ativo }),
    );
    return readValue<EventoObjetivo>(response.data);
  },
  async preview(
    payload: Pick<
      EventoObjetivoPayload,
      "estruturaId" | "eventoTemplateId" | "gruposIds" | "tiposGrupoIds"
    >,
  ) {
    const response = await httpClient.post(
      apiRoute("/api/evento-objetivos/preview"),
      toSnakeCase(payload),
    );
    return readValue<EventoObjetivoPreview>(response.data);
  },
};
