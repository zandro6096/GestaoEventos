import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { can } from '../../../services/permissions/permission.facade';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { track } from '../../../services/analytics/analytics.service';
import { usuariosEstruturaApi, type EstruturaUsuarioDto } from '../../../services/api/usuarios-estrutura-api';
import { usuariosVirtuaisApi, type UsuarioVirtualDto } from '../../../services/api/usuarios-virtuais-api';
import { grupoMembrosService } from './membros.service';
import { isDuplicatePerson, personAction } from './membros.rules';

export type ManagementKind = 'membro' | 'responsavel';
export type DirectoryPerson = {
  id: number;
  vinculoId?: number;
  tipo: 'usuario' | 'usuario_virtual';
  nome: string;
  email: string | null;
  ativo: boolean;
  status: string | null;
};
export type MemberOperation = { kind: ManagementKind; action: 'adicionar' | 'reativar' | 'reenviar_convite'; person: DirectoryPerson };

function toUserPerson(item: EstruturaUsuarioDto): DirectoryPerson {
  return { id: item.usuarioId, vinculoId: item.id, tipo: 'usuario', nome: item.nomeUsuario, email: item.emailUsuario, ativo: item.ativo, status: item.ativo ? 'ativo' : 'inativo' };
}

function toVirtualPerson(item: UsuarioVirtualDto): DirectoryPerson {
  const status = item.status || 'pendente';
  return { id: item.id, tipo: 'usuario_virtual', nome: item.nome, email: item.email, ativo: !['inativo', 'inactive', 'desativado'].includes(status.toLowerCase()), status };
}

export function useGrupoMembros(grupoId: number, estruturaId: number, aberto: boolean, canManage: boolean, existing: { memberIds: number[]; responsibleIds: number[] }) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['grupo-membros-diretorio', { grupoId, estruturaId }],
    queryFn: async () => {
      const [users, virtuals] = await Promise.all([usuariosEstruturaApi.list(estruturaId), usuariosVirtuaisApi.list(estruturaId, grupoId)]);
      return [...users.map(toUserPerson), ...virtuals.map(toVirtualPerson)].filter((person) => person.id > 0 && person.nome.trim());
    },
    enabled: aberto && canManage && grupoId > 0 && estruturaId > 0,
    retry: false,
  });
  const mutation = useMutation({
    retry: false,
    mutationFn: async (operation: MemberOperation) => {
      const scope = { estruturaId, grupoId };
      if (!can('gerenciar', 'grupos', scope)) throw new Error(`${operation.kind === 'membro' ? 'Adicionar membro' : 'Adicionar responsavel'}: sem permissao para operar este grupo.`);
      assertOnlineForMutation(operation.action === 'adicionar' ? `Adicionar ${operation.kind}` : operation.action === 'reenviar_convite' ? 'Reenviar convite' : 'Reativar pessoa');
      if (operation.action === 'reativar') {
        if (operation.person.tipo !== 'usuario' || !operation.person.vinculoId) {
          throw new Error('Reativar pessoa: vínculo de estrutura não encontrado.');
        }
        await usuariosEstruturaApi.reactivate(operation.person.vinculoId);
        const existingIds = operation.kind === 'membro' ? existing.memberIds : existing.responsibleIds;
        if (!existingIds.includes(operation.person.id)) {
          if (operation.kind === 'membro') await grupoMembrosService.addMember(grupoId, operation.person.id);
          else await grupoMembrosService.addResponsible(grupoId, operation.person.id);
        }
        return;
      }
      if (operation.action === 'reenviar_convite') {
        if (operation.person.tipo !== 'usuario_virtual') throw new Error('Reenviar convite: a pessoa selecionada nao e um usuario virtual.');
        await grupoMembrosService.sendInvite(operation.person.id);
        return;
      }
      if (operation.person.tipo !== 'usuario') throw new Error(`Adicionar ${operation.kind}: usuario virtual deve ser convidado por email antes do vinculo.`);
      const existingIds = operation.kind === 'membro' ? existing.memberIds : existing.responsibleIds;
      if (isDuplicatePerson(operation.person.id, existingIds)) throw new Error(`Adicionar ${operation.kind}: esta pessoa ja esta vinculada ao grupo.`);
      if (operation.kind === 'membro') await grupoMembrosService.addMember(grupoId, operation.person.id);
      else await grupoMembrosService.addResponsible(grupoId, operation.person.id);
    },
    onSuccess: (_data, operation) => {
      void client.invalidateQueries({ queryKey: ['grupo-detalhe'] });
      void client.invalidateQueries({ queryKey: ['grupo-membros-diretorio'] });
      void client.invalidateQueries({ queryKey: ['grupos'] });
      track('confirmation', `grupos:${operation.kind}_${operation.action}_success`);
    },
  });
  const inviteMutation = useMutation({
    retry: false,
    mutationFn: async (payload: { nome: string; email: string; kind: ManagementKind; usuarioId: number }) => {
      if (!can('gerenciar', 'grupos', { estruturaId, grupoId })) throw new Error(`Criar convite de ${payload.kind}: sem permissao para operar este grupo.`);
      assertOnlineForMutation(`Criar convite de ${payload.kind}`);
      return grupoMembrosService.inviteVirtual({ nome: payload.nome, email: payload.email, estruturaId, grupoId, ehResponsavel: payload.kind === 'responsavel', criadoPor: payload.usuarioId });
    },
    onSuccess: (_data, payload) => {
      void client.invalidateQueries({ queryKey: ['grupo-detalhe'] });
      void client.invalidateQueries({ queryKey: ['grupo-membros-diretorio'] });
      track('confirmation', `grupos:${payload.kind}_convite_success`);
    },
  });
  const removeMutation = useMutation({
    retry: false,
    mutationFn: async (operation: { kind: ManagementKind; id: number }) => {
      if (!can('gerenciar', 'grupos', { estruturaId, grupoId })) throw new Error(`Remover ${operation.kind}: sem permissao para operar este grupo.`);
      assertOnlineForMutation(`Remover ${operation.kind}`);
      if (operation.kind === 'membro') await grupoMembrosService.removeMember(operation.id);
      else await grupoMembrosService.removeResponsible(operation.id);
    },
    onSuccess: (_data, operation) => {
      void client.invalidateQueries({ queryKey: ['grupo-detalhe'] });
      void client.invalidateQueries({ queryKey: ['grupo-membros-diretorio'] });
      track('confirmation', `grupos:${operation.kind}_remover_success`);
    },
  });
  return { query, mutation, inviteMutation, removeMutation, canManage };
}

export function operationFor(kind: ManagementKind, person: DirectoryPerson): MemberOperation {
  return { kind, action: personAction(person), person };
}
