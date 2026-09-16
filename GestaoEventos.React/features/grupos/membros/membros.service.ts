import { gruposMembrosApi } from '../../../services/api/grupos-membros-api';
import { responsaveisGrupoApi } from '../../../services/api/responsaveis-grupo-api';
import { usuariosVirtuaisApi } from '../../../services/api/usuarios-virtuais-api';

export const grupoMembrosService = {
  addMember(grupoId: number, usuarioId: number) { return gruposMembrosApi.create(grupoId, usuarioId); },
  removeMember(id: number) { return gruposMembrosApi.remove(id); },
  addResponsible(grupoId: number, usuarioId: number) { return responsaveisGrupoApi.create(grupoId, usuarioId); },
  removeResponsible(id: number) { return responsaveisGrupoApi.remove(id); },
  sendInvite(id: number) { return usuariosVirtuaisApi.sendInvite(id); },
  inviteVirtual(payload: Parameters<typeof usuariosVirtuaisApi.create>[0]) { return usuariosVirtuaisApi.create(payload); },
};
