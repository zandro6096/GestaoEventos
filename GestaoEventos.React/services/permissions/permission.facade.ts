import { getActiveContext } from '../../stores/context.store';
import { usePermissionStore } from '../../stores/permission.store';
import type { PermissionAction, PermissionCheckScope, PermissionGrant, PermissionResource } from './permission.types';

export function can(action: PermissionAction, resource: PermissionResource | string, scope: PermissionCheckScope = {}) {
  const context = getActiveContext();

  if (!context.usuarioId) return false;
  if (isOwnerContext()) return true;
  if (resource === 'jornada' && action === 'ler') return true;

  const effectiveScope = {
    estruturaId: scope.estruturaId ?? context.estruturaId,
    grupoId: scope.grupoId ?? context.grupoId,
  };

  return usePermissionStore.getState().grants.some((grant) => grantAllows(grant, action, resource, effectiveScope));
}

export function isOwnerContext() {
  const context = getActiveContext();
  const selected = context.estruturas.find((estrutura) => estrutura.id === context.estruturaId);
  const normalizedRole = normalizeRole(selected?.papel);

  return normalizedRole.includes('dono') || normalizedRole.includes('owner');
}

function grantAllows(
  grant: PermissionGrant,
  action: PermissionAction,
  resource: PermissionResource | string,
  scope: PermissionCheckScope,
) {
  if (grant.resource !== resource) return false;
  if (!grant.actions.includes(action)) return false;
  if (grant.estruturaId && scope.estruturaId && grant.estruturaId !== scope.estruturaId) return false;

  if (grant.scope === 'global' || grant.scope === 'estrutura') return true;
  if (!scope.grupoId) return grant.scope === 'proprio';
  if (grant.scope === 'grupo' || grant.scope === 'proprio') return !grant.grupoId || grant.grupoId === scope.grupoId;
  if (grant.scope === 'grupo_e_filhos') return !grant.grupoId || grant.grupoId === scope.grupoId;

  return false;
}

function normalizeRole(value: unknown) {
  return typeof value === 'string'
    ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
    : '';
}
