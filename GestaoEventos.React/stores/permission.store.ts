import { create } from 'zustand';

import type { RecursoPermissao } from '../services/api/permissoes-api';
import type { PermissionGrant } from '../services/permissions/permission.types';

type PermissionStore = {
  grants: PermissionGrant[];
  resources: RecursoPermissao[];
  hydratedAt: string | null;
  setPermissionGrants: (grants: PermissionGrant[]) => void;
  setResources: (resources: RecursoPermissao[]) => void;
  clearPermissions: () => void;
};

export const usePermissionStore = create<PermissionStore>((set) => ({
  grants: [],
  resources: [],
  hydratedAt: null,
  setPermissionGrants(grants) {
    set({ grants, hydratedAt: new Date().toISOString() });
  },
  setResources(resources) {
    set({ resources, hydratedAt: new Date().toISOString() });
  },
  clearPermissions() {
    set({ grants: [], resources: [], hydratedAt: null });
  },
}));
