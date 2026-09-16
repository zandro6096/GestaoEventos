import { normalizeApiError } from '../api/api-error';
import { contextoApi, type ContextoInicial } from '../api/contexto-api';
import { attachAuthToken } from '../api/http-client';
import { secureStorage } from '../platform/secure-storage/index';
import { contextSelectionService, type PersistedContextSelection } from './context-selection.service';

export type AuthSessionStatus = 'unknown' | 'authenticated' | 'unauthenticated' | 'context-required';

export type AuthenticatedUser = {
  id: number;
  nome: string;
  email: string | null;
};

export type AuthSessionResult = {
  status: AuthSessionStatus;
  user: AuthenticatedUser | null;
  contexto: ContextoInicial | null;
  errorMessage: string | null;
};

const AUTH_TOKEN_STORAGE_KEY = 'auth_token';

export const authSessionService = {
  async completeLogin(token: string): Promise<AuthSessionResult> {
    const normalizedToken = normalizeToken(token);
    const user = decodeAuthenticatedUser(normalizedToken);

    await secureStorage.setItem(AUTH_TOKEN_STORAGE_KEY, normalizedToken);
    attachAuthToken(normalizedToken);

    return hydrateContextForUser(normalizedToken, user);
  },

  async hydrateSession(): Promise<AuthSessionResult> {
    const token = await secureStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) return unauthenticatedResult();

    try {
      const normalizedToken = normalizeToken(token);
      if (isExpired(normalizedToken)) {
        await this.clearSession();
        return unauthenticatedResult();
      }

      const user = decodeAuthenticatedUser(normalizedToken);
      attachAuthToken(normalizedToken);

      return hydrateContextForUser(normalizedToken, user);
    } catch {
      await this.clearSession();
      return unauthenticatedResult();
    }
  },

  async clearSession(): Promise<void> {
    attachAuthToken(null);
    await secureStorage.deleteItem(AUTH_TOKEN_STORAGE_KEY);
  },
};

async function hydrateContextForUser(token: string, user: AuthenticatedUser): Promise<AuthSessionResult> {
  try {
    const [contextoInicial, persistedSelection] = await Promise.all([
      contextoApi.getContextoInicial(user.id),
      contextSelectionService.readSelection(),
    ]);
    const contexto = applyPersistedSelection(contextoInicial, persistedSelection);
    const status = resolveSessionStatus(contexto);

    return {
      status,
      user: {
        ...user,
        nome: contexto.usuarioNome || user.nome,
      },
      contexto,
      errorMessage: null,
    };
  } catch (error) {
    attachAuthToken(token);

    return {
      status: 'context-required',
      user,
      contexto: null,
      errorMessage: normalizeApiError(error, 'Nao foi possivel carregar seu contexto inicial.').message,
    };
  }
}

function applyPersistedSelection(
  contexto: ContextoInicial,
  selection: PersistedContextSelection | null,
): ContextoInicial {
  if (!selection?.estruturaId) return contexto;

  const selected = contexto.estruturas.find((estrutura) => estrutura.id === selection.estruturaId);
  if (!selected) return contexto;

  return {
    ...contexto,
    estruturaId: selected.id,
    estruturaNome: selected.nome,
    estruturaLogoUrl: selected.logoUrl ?? contexto.estruturaLogoUrl ?? null,
    grupoId: selection.grupoId,
    grupoNome: selection.grupoNome,
  };
}

function resolveSessionStatus(contexto: ContextoInicial): AuthSessionStatus {
  return contexto.temEstrutura && contexto.estruturaId ? 'authenticated' : 'context-required';
}

function unauthenticatedResult(): AuthSessionResult {
  return {
    status: 'unauthenticated',
    user: null,
    contexto: null,
    errorMessage: null,
  };
}

function normalizeToken(token: string): string {
  const normalized = token.trim();
  if (!normalized) throw new Error('Token de autenticacao invalido.');
  if (normalized.split('.').length < 2) throw new Error('Token JWT invalido.');

  return normalized;
}

function decodeAuthenticatedUser(token: string): AuthenticatedUser {
  const payload = decodeJwtPayload(token);
  const userId = getPositiveNumberClaim(payload, [
    'sub',
    'nameid',
    'usuario_id',
    'usuarioId',
    'id',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ]);

  if (!userId) throw new Error('Token JWT sem usuarioId.');

  return {
    id: userId,
    nome: getStringClaim(payload, ['name', 'unique_name', 'nome']) ?? 'Usuario',
    email: getStringClaim(payload, ['email']) ?? null,
  };
}

function isExpired(token: string): boolean {
  const exp = getPositiveNumberClaim(decodeJwtPayload(token), ['exp']);
  return Boolean(exp && Date.now() >= exp * 1000);
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Token JWT sem payload.');

  return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);

  if (typeof globalThis.atob !== 'function') {
    throw new Error('Decodificador JWT indisponivel neste runtime.');
  }

  const binary = globalThis.atob(padded);
  const encoded = Array.from(binary, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('');
  return decodeURIComponent(encoded);
}

function getPositiveNumberClaim(payload: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const parsed = Number(payload[key]);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }

  return null;
}

function getStringClaim(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  return null;
}
