import { toCamelCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export type NotificacaoInterna = {
  id: number;
  modulo: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  referenciaTipo: string | null;
  referenciaChave: string | null;
  lida: boolean;
  lidaEm: string | null;
  criadoEm: string;
  payloadJson: string | null;
};

export type NotificacoesInternasResponse = {
  itens: NotificacaoInterna[];
  total: number;
  naoLidas: number;
  pagina: number;
  tamanhoPagina: number;
};

export const notificacoesInternasApi = {
  async listar(estruturaId: number, options: { modulo?: string; somenteNaoLidas?: boolean; pagina?: number; tamanhoPagina?: number } = {}): Promise<NotificacoesInternasResponse> {
    const response = await httpClient.get(apiRoute('/api/notificacoes/internas'), {
      params: {
        estrutura_id: estruturaId,
        modulo: options.modulo ?? 'fila_semanal',
        somente_nao_lidas: options.somenteNaoLidas ?? false,
        pagina: options.pagina ?? 1,
        tamanho_pagina: options.tamanhoPagina ?? 20,
      },
    });
    return normalizeResponse(response.data);
  },
  async marcarLida(id: number): Promise<void> {
    await httpClient.patch(apiRoute(`/api/notificacoes/internas/${id}/marcar-lida`), {});
  },
  async marcarTodasLidas(estruturaId: number, modulo = 'fila_semanal'): Promise<void> {
    await httpClient.patch(apiRoute('/api/notificacoes/internas/marcar-todas-lidas'), {}, { params: { estrutura_id: estruturaId, modulo } });
  },
};

function normalizeResponse(value: unknown): NotificacoesInternasResponse {
  const record = toCamelCase<Record<string, unknown>>(value);
  const itens = Array.isArray(record.itens) ? record.itens.map((item) => normalizeItem(item)).filter((item): item is NotificacaoInterna => item !== null) : [];
  return {
    itens,
    total: numberValue(record.total, itens.length),
    naoLidas: numberValue(record.naoLidas, itens.filter((item) => !item.lida).length),
    pagina: numberValue(record.pagina, 1),
    tamanhoPagina: numberValue(record.tamanhoPagina, 20),
  };
}

function normalizeItem(value: unknown): NotificacaoInterna | null {
  const record = toCamelCase<Record<string, unknown>>(value);
  const id = numberValue(record.id, 0);
  if (id <= 0) return null;
  return {
    id,
    modulo: stringValue(record.modulo),
    tipo: stringValue(record.tipo),
    titulo: stringValue(record.titulo, 'Atribuicao pendente'),
    mensagem: stringValue(record.mensagem),
    referenciaTipo: nullableString(record.referenciaTipo),
    referenciaChave: nullableString(record.referenciaChave),
    lida: Boolean(record.lida),
    lidaEm: nullableString(record.lidaEm),
    criadoEm: stringValue(record.criadoEm),
    payloadJson: nullableString(record.payloadJson),
  };
}

function numberValue(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function nullableString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
