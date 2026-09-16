import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { normalizeApiError } from '../../../services/api/api-error';
import { adminApi } from '../../../services/api/admin-api';
import type { EstruturaUsuarioDto } from '../../../services/api/usuarios-estrutura-api';
import type { UsuarioVirtualDto } from '../../../services/api/usuarios-virtuais-api';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { can } from '../../../services/permissions/permission.facade';
import { track } from '../../../services/analytics/analytics.service';
import { queryKeys } from '../../../services/query/query-keys';
import { useContextStore } from '../../../stores/context.store';

export type AdminMember = { id: number; tipo: 'usuario' | 'usuario_virtual'; nome: string; email: string | null; papel: string | null; funcao: string | null; ativo: boolean; status: string };
export type MemberStatusFilter = 'todos' | 'ativo' | 'inativo' | 'pendente';
export type MemberMutation = { action: 'papel' | 'funcao' | 'remover' | 'reativar' | 'convite'; member: AdminMember; value?: string };

function fromUser(item: EstruturaUsuarioDto): AdminMember { return { id: item.id, tipo: 'usuario', nome: item.nomeUsuario, email: item.emailUsuario, papel: item.papel, funcao: item.funcao, ativo: item.ativo, status: item.ativo ? 'ativo' : 'inativo' }; }
function fromVirtual(item: UsuarioVirtualDto): AdminMember { const status = item.status || 'pendente'; const ativo = !['inativo', 'inactive', 'desativado'].includes(status.toLowerCase()); return { id: item.id, tipo: 'usuario_virtual', nome: item.nome, email: item.email, papel: null, funcao: null, ativo, status }; }

export function useAdminMembros() {
  const estruturaId = useContextStore((state) => state.estruturaId);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<MemberStatusFilter>('todos');
  const canManage = Boolean(estruturaId && can('gerenciar', 'usuarios', { estruturaId }));
  const client = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.scoped('admin-membros', { estruturaId }, { busca }), queryFn: async () => { const [users, virtuals] = await Promise.all([adminApi.listMembros(estruturaId!, busca), adminApi.listUsuariosVirtuais(estruturaId!)]); return [...users.map(fromUser), ...virtuals.map(fromVirtual)]; }, enabled: canManage, retry: false });
  const mutation = useMutation({ retry: false, mutationFn: async (operation: MemberMutation) => { if (!estruturaId || !can('gerenciar', 'usuarios', { estruturaId })) throw new Error('Operacao de membros: sem permissao no contexto ativo.'); assertOnlineForMutation(operation.action === 'remover' ? 'Remover membro' : operation.action === 'reativar' ? 'Reativar pessoa' : operation.action === 'convite' ? 'Reenviar convite' : 'Atualizar membro'); if (operation.action === 'papel') { if (operation.member.tipo !== 'usuario' || (operation.value !== 'Dono' && operation.value !== 'Participante')) throw new Error('Atualizar papel: dados invalidos.'); return adminApi.updateMembroPapel(operation.member.id, operation.value); } if (operation.action === 'funcao') return adminApi.updateMembroFuncao(operation.member.id, operation.value?.trim() || null); if (operation.action === 'remover') { if (operation.member.tipo !== 'usuario') throw new Error('Remover membro: usuario virtual deve ser tratado pelo fluxo de convite.'); return adminApi.removeMembro(operation.member.id); } if (operation.action === 'convite') { if (operation.member.tipo !== 'usuario_virtual') throw new Error('Reenviar convite: a pessoa selecionada nao e um usuario virtual.'); return adminApi.sendInvite(operation.member.id); } if (operation.member.tipo !== 'usuario') throw new Error('Reativar pessoa: vínculo de estrutura não encontrado.'); return adminApi.reactivateMembro(operation.member.id); }, onSuccess: (_data, operation) => { void client.invalidateQueries({ queryKey: ['admin-membros'] }); track('confirmation', `membros:${operation.action}_success`); } });
  const members = useMemo(() => (query.data ?? []).filter((member) => { const term = busca.trim().toLowerCase(); const matchesTerm = !term || member.nome.toLowerCase().includes(term) || member.email?.toLowerCase().includes(term); const matchesStatus = status === 'todos' || (status === 'ativo' && member.ativo) || (status === 'inativo' && !member.ativo) || (status === 'pendente' && member.status.toLowerCase() === 'pendente'); return Boolean(matchesTerm && matchesStatus); }), [busca, query.data, status]);
  useEffect(() => { if (canManage) track('entrance', 'membros:entrada'); }, [canManage]);
  function applyStatus(value: MemberStatusFilter) { setStatus(value); track('simulation', 'membros:filtro_aplicar', { extra: { filtro: 'status' } }); }
  function execute(operation: MemberMutation) { track('simulation', `membros:${operation.action}_submit`); mutation.mutate(operation); }
  return { query, members, busca, status, canManage, applyBusca: setBusca, applyStatus, execute, isMutating: mutation.isPending, errorMessage: mutation.isError ? normalizeApiError(mutation.error, 'Nao foi possivel concluir a operacao de membros.').message : null, clearError: () => mutation.reset() };
}
