import { create } from 'zustand';

import { setUnauthorizedHandler } from '../services/api/http-client';
import {
  authSessionService,
  type AuthenticatedUser,
  type AuthSessionResult,
  type AuthSessionStatus,
} from '../services/session/auth-session.service';
import { useContextStore } from './context.store';
import { usePermissionStore } from './permission.store';

export const authSessionStatuses = ['unknown', 'authenticated', 'unauthenticated', 'context-required'] as const;

type AuthStore = {
  status: AuthSessionStatus;
  user: AuthenticatedUser | null;
  errorMessage: string | null;
  hydratedAt: string | null;
  hydrateSession: () => Promise<AuthSessionStatus>;
  completeLogin: (jwt: string) => Promise<AuthSessionResult>;
  logout: () => Promise<void>;
  markContextReady: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: 'unknown',
  user: null,
  errorMessage: null,
  hydratedAt: null,
  async hydrateSession() {
    set({ status: 'unknown', errorMessage: null });
    const result = await authSessionService.hydrateSession();
    applyAuthSessionResult(result);
    return result.status;
  },
  async completeLogin(jwt) {
    set({ status: 'unknown', errorMessage: null });
    const result = await authSessionService.completeLogin(jwt);
    applyAuthSessionResult(result);
    return result;
  },
  async logout() {
    await authSessionService.clearSession();
    useContextStore.getState().clearContext();
    usePermissionStore.getState().clearPermissions();
    set({
      status: 'unauthenticated',
      user: null,
      errorMessage: null,
      hydratedAt: new Date().toISOString(),
    });
  },
  markContextReady() {
    set({
      status: 'authenticated',
      errorMessage: null,
      hydratedAt: new Date().toISOString(),
    });
  },
}));

export function applyAuthSessionResult(result: AuthSessionResult) {
  if (result.contexto) {
    useContextStore.getState().setContextoInicial(result.contexto);
  } else {
    useContextStore.getState().clearContext();
    usePermissionStore.getState().clearPermissions();
  }

  useAuthStore.setState({
    status: result.status,
    user: result.user,
    errorMessage: result.errorMessage,
    hydratedAt: new Date().toISOString(),
  });
}

setUnauthorizedHandler(() => {
  void useAuthStore.getState().logout();
});
