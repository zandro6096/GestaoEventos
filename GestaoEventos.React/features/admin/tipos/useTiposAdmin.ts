import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { configuracoesApi, type TipoDto, type TipoKind, type TipoPayload } from '../../../services/api/configuracoes-api';
import { normalizeApiError } from '../../../services/api/api-error';
import { track } from '../../../services/analytics/analytics.service';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { queryKeys } from '../../../services/query/query-keys';
import { can } from '../../../services/permissions/permission.facade';
import { useContextStore } from '../../../stores/context.store';

export type TipoDraft = {
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  ordem: string;
  ativo: boolean;
  permiteSubgrupos: boolean;
  nivelHierarquicoPadrao: string;
  permiteRecorrencia: boolean;
  requerConfirmacao: boolean;
  duracaoPadraoMinutos: string;
};

const emptyDraft = (): TipoDraft => ({ nome: '', descricao: '', cor: '', icone: '', ordem: '0', ativo: true, permiteSubgrupos: true, nivelHierarquicoPadrao: '', permiteRecorrencia: true, requerConfirmacao: false, duracaoPadraoMinutos: '' });

export function useTiposAdmin(kind: TipoKind) {
  const estruturaId = useContextStore((state) => state.estruturaId);
  const client = useQueryClient();
  const [draft, setDraft] = useState<TipoDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const resource = kind === 'grupo' ? 'grupos' : 'eventos';
  const allowed = Boolean(estruturaId && can('gerenciar', resource, { estruturaId }));
  const query = useQuery({ queryKey: queryKeys.scoped(`admin-tipos-${kind}`, { estruturaId }), queryFn: () => configuracoesApi.listTipos(kind, estruturaId!, false), enabled: allowed, retry: false });
  const mutation = useMutation({
    mutationFn: async (payload: TipoPayload) => {
      assertOnlineForMutation(editingId ? `Editar tipo de ${kind}` : `Criar tipo de ${kind}`);
      return editingId ? configuracoesApi.updateTipo(kind, editingId, payload) : configuracoesApi.createTipo(kind, payload);
    },
    onSuccess: () => { void client.invalidateQueries({ queryKey: [`admin-tipos-${kind}`] }); track('confirmation', `admin_tipos:${kind}_salvar_sucesso`); setEditingId(null); setDraft(emptyDraft()); },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { assertOnlineForMutation(`Desativar tipo de ${kind}`); return configuracoesApi.deleteTipo(kind, id); },
    onSuccess: () => { void client.invalidateQueries({ queryKey: [`admin-tipos-${kind}`] }); track('confirmation', `admin_tipos:${kind}_desativar_sucesso`); },
  });

  const tipos = useMemo(() => (query.data ?? []).filter((item) => item.nome.toLocaleLowerCase().includes(draft.nome.trim().toLocaleLowerCase()) || !draft.nome.trim()), [draft.nome, query.data]);

  function edit(item: TipoDto) {
    const value = item as Record<string, unknown>;
    setEditingId(item.id);
    setDraft({ ...emptyDraft(), nome: item.nome, descricao: item.descricao ?? '', cor: item.cor ?? '', icone: item.icone ?? '', ordem: String(item.ordem ?? 0), ativo: item.ativo, permiteSubgrupos: Boolean(value.permiteSubgrupos ?? true), nivelHierarquicoPadrao: value.nivelHierarquicoPadrao == null ? '' : String(value.nivelHierarquicoPadrao), permiteRecorrencia: Boolean(value.permiteRecorrencia ?? true), requerConfirmacao: Boolean(value.requerConfirmacao ?? false), duracaoPadraoMinutos: value.duracaoPadraoMinutos == null ? '' : String(value.duracaoPadraoMinutos) });
    track('entrance', `admin_tipos:${kind}_editar_abrir`);
  }

  function reset() { setEditingId(null); setDraft(emptyDraft()); }
  function save() {
    const ordem = Number(draft.ordem);
    if (!draft.nome.trim() || !Number.isInteger(ordem) || ordem < 0 || !estruturaId) return;
    track('simulation', `admin_tipos:${kind}_salvar_submit`);
    mutation.mutate({ nome: draft.nome.trim(), descricao: draft.descricao.trim() || null, cor: draft.cor.trim() || null, icone: draft.icone.trim() || null, estruturaId, ordem, ativo: draft.ativo, permiteSubgrupos: draft.permiteSubgrupos, nivelHierarquicoPadrao: draft.nivelHierarquicoPadrao ? Number(draft.nivelHierarquicoPadrao) : null, permiteRecorrencia: draft.permiteRecorrencia, requerConfirmacao: draft.requerConfirmacao, duracaoPadraoMinutos: draft.duracaoPadraoMinutos ? Number(draft.duracaoPadraoMinutos) : null });
  }

  return { query, tipos, allowed, draft, setDraft, editingId, edit, reset, save, deleteTipo: (id: number) => { track('simulation', `admin_tipos:${kind}_desativar_submit`); deleteMutation.mutate(id); }, isMutating: mutation.isPending || deleteMutation.isPending, errorMessage: mutation.isError ? normalizeApiError(mutation.error, `Nao foi possivel salvar o tipo de ${kind}.`).message : deleteMutation.isError ? normalizeApiError(deleteMutation.error, `Nao foi possivel desativar o tipo de ${kind}.`).message : null };
}
