import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { normalizeApiError } from '../../../services/api/api-error';
import { adminApi, type PapelAdminDto, type PapelPayload } from '../../../services/api/admin-api';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { can } from '../../../services/permissions/permission.facade';
import { track } from '../../../services/analytics/analytics.service';
import { queryKeys } from '../../../services/query/query-keys';
import { useContextStore } from '../../../stores/context.store';

export type PapelDraft = { nome: string; descricao: string; nivelHierarquico: string; ordem: string; permissoes: { recurso: string; acao: number; escopo: number }[] };
export const papelAcoes = [{ value: 1, label: 'Criar' }, { value: 2, label: 'Ler' }, { value: 3, label: 'Editar' }, { value: 4, label: 'Excluir' }, { value: 5, label: 'Aprovar' }];
export const papelEscopos = [{ value: 1, label: 'Proprio' }, { value: 2, label: 'Grupo' }, { value: 3, label: 'Grupo e filhos' }, { value: 4, label: 'Estrutura' }];

const emptyDraft = (): PapelDraft => ({ nome: '', descricao: '', nivelHierarquico: '1', ordem: '0', permissoes: [] });

export function usePapeisAdmin() {
  const estruturaId = useContextStore((state) => state.estruturaId);
  const canManage = Boolean(estruturaId && can('gerenciar', 'papeis', { estruturaId }));
  const [busca, setBusca] = useState('');
  const [draft, setDraft] = useState<PapelDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const client = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.scoped('admin-papeis', { estruturaId }, { busca }), queryFn: () => adminApi.listPapeis(estruturaId!, busca), enabled: canManage, retry: false });
  const resourcesQuery = useQuery({ queryKey: queryKeys.scoped('admin-recursos', { estruturaId }), queryFn: adminApi.listRecursos, enabled: canManage, retry: false });
  const mutation = useMutation({ retry: false, mutationFn: async (payload: PapelPayload) => { if (!estruturaId || !can('gerenciar', 'papeis', { estruturaId })) throw new Error('Papeis: sem permissao no contexto ativo.'); assertOnlineForMutation('Salvar papel'); return editingId ? adminApi.updatePapel(editingId, payload) : adminApi.createPapel(payload); }, onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-papeis'] }); setDraft(emptyDraft()); setEditingId(null); track('confirmation', `papeis:${editingId ? 'editar' : 'criar'}_success`); }, });
  const deleteMutation = useMutation({ retry: false, mutationFn: async (id: number) => { if (!estruturaId || !can('gerenciar', 'papeis', { estruturaId })) throw new Error('Desativar papel: sem permissao no contexto ativo.'); assertOnlineForMutation('Desativar papel'); return adminApi.deletePapel(id); }, onSuccess: () => { void client.invalidateQueries({ queryKey: ['admin-papeis'] }); track('confirmation', 'papeis:desativar_success'); } });
  useEffect(() => { if (canManage) track('entrance', 'papeis:entrada'); }, [canManage]);
  function edit(role: PapelAdminDto) { setEditingId(role.id); setDraft({ nome: role.nome, descricao: role.descricao ?? '', nivelHierarquico: String(role.nivelHierarquico), ordem: String(role.ordem), permissoes: role.permissoes.map((permission) => ({ recurso: permission.recurso, acao: permission.acao, escopo: permission.escopo })) }); track('entrance', 'papeis:editar_abrir'); }
  function reset() { setDraft(emptyDraft()); setEditingId(null); }
  function save() { track('simulation', `papeis:${editingId ? 'editar' : 'criar'}_submit`); mutation.mutate({ nome: draft.nome.trim(), descricao: draft.descricao.trim() || null, estruturaId: estruturaId!, nivelHierarquico: Number(draft.nivelHierarquico), ordem: Number(draft.ordem), ativo: true, permissoes: draft.permissoes }); }
  function addPermission(recurso: string) { const current = draft.permissoes.find((item) => item.recurso === recurso); setDraft({ ...draft, permissoes: current ? draft.permissoes : [...draft.permissoes, { recurso, acao: 2, escopo: 4 }] }); track('simulation', 'papeis:permissao_adicionar'); }
  function removePermission(recurso: string) { setDraft({ ...draft, permissoes: draft.permissoes.filter((item) => item.recurso !== recurso) }); track('simulation', 'papeis:permissao_remover'); }
  return { query, resources: resourcesQuery.data ?? [], busca, applyBusca: setBusca, draft, setDraft, editingId, edit, reset, save, addPermission, removePermission, deleteRole: (id: number) => { track('simulation', 'papeis:desativar_submit'); deleteMutation.mutate(id); }, isMutating: mutation.isPending || deleteMutation.isPending, errorMessage: mutation.isError ? normalizeApiError(mutation.error, 'Nao foi possivel salvar o papel.').message : deleteMutation.isError ? normalizeApiError(deleteMutation.error, 'Nao foi possivel desativar o papel.').message : null };
}
