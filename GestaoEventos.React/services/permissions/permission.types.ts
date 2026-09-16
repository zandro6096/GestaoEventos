export const permissionActions = ['criar', 'ler', 'editar', 'excluir', 'aprovar', 'gerenciar'] as const;
export type PermissionAction = (typeof permissionActions)[number];

export const permissionResources = [
  'jornada',
  'eventos',
  'grupos',
  'usuarios',
  'papeis',
  'permissoes',
  'painel',
  'relatorios',
  'configuracoes',
  'estrutura',
] as const;
export type PermissionResource = (typeof permissionResources)[number];

export const permissionScopes = ['proprio', 'grupo', 'grupo_e_filhos', 'estrutura', 'global'] as const;
export type PermissionScope = (typeof permissionScopes)[number];

export type PermissionGrant = {
  resource: PermissionResource | string;
  actions: PermissionAction[];
  scope: PermissionScope;
  grupoId?: number | null;
  estruturaId?: number | null;
};

export type PermissionCheckScope = {
  estruturaId?: number | null;
  grupoId?: number | null;
};
