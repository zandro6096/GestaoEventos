import { API_BASE_URL } from './api-config';
import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

type ApiEnvelope<T> = {
  data?: T | null;
};

export type AuthTokenResponse = {
  token: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterUserRequest = {
  nome: string;
  email: string;
  senha: string;
  dataNascimento?: string | null;
};

export type RegisterUserResponse = {
  id: number;
  nome: string;
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  novaSenha: string;
  confirmarSenha: string;
};

export type InviteDetails = {
  valid: boolean;
  usuarioVirtualId?: number;
  nome?: string;
  email?: string;
  telefone?: string;
  estruturaId?: number;
  estruturaNome?: string;
  grupoId?: number | null;
  grupoNome?: string | null;
  convidadoPorId?: number | null;
  convidadoPorNome?: string | null;
  donoEstruturaId?: number | null;
  donoEstruturaNome?: string | null;
  message?: string;
};

export type AcceptInviteTokenRequest = {
  token: string;
  senha: string;
  confirmarSenha: string;
};

export type AcceptInviteTokenResponse = {
  usuarioId: number;
  nome: string;
  email: string;
  estruturaId?: number;
};

export type SsoProvider = 'google' | 'facebook' | 'microsoft';

export const authApi = {
  async login(request: LoginRequest): Promise<AuthTokenResponse> {
    const response = await httpClient.post<ApiEnvelope<AuthTokenResponse>>(apiRoute('/api/auth/token'), request);
    return unwrapEnvelope<AuthTokenResponse>(response.data);
  },

  async registerUser(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const response = await httpClient.post<ApiEnvelope<RegisterUserResponse>>(
      apiRoute('/api/usuarios'),
      toSnakeCase(request),
    );
    return unwrapEnvelope<RegisterUserResponse>(toCamelCase(response.data));
  },

  async recoverPassword(email: string): Promise<void> {
    await httpClient.post(apiRoute('/api/auth/recuperar-senha'), { email });
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await httpClient.post(apiRoute('/api/auth/redefinir-senha'), request);
  },

  async resendConfirmationEmail(email: string): Promise<void> {
    await httpClient.post(apiRoute('/api/auth/reenviar-confirmacao-email'), { email });
  },

  async confirmEmail(token: string): Promise<string> {
    const response = await httpClient.get<ApiEnvelope<string>>(apiRoute('/api/auth/confirmar-email'), {
      params: { token },
    });
    return unwrapEnvelope<string>(response.data) ?? 'E-mail confirmado com sucesso.';
  },

  async validateInviteToken(token: string): Promise<InviteDetails> {
    const response = await httpClient.get<InviteDetails>(apiRoute(`/api/convites/validar/${encodeURIComponent(token)}`));
    return toCamelCase<InviteDetails>(response.data);
  },

  async acceptInviteToken(request: AcceptInviteTokenRequest): Promise<AcceptInviteTokenResponse> {
    const response = await httpClient.post<AcceptInviteTokenResponse>(
      apiRoute('/api/convites/aceitar-token'),
      toSnakeCase(request),
    );
    return toCamelCase<AcceptInviteTokenResponse>(response.data);
  },

  buildSsoStartUrl(provider: SsoProvider, returnUrl: string): string {
    const url = new URL(`/api/auth/sso/${provider}/iniciar`, API_BASE_URL);
    url.searchParams.set('return_url', returnUrl);
    return url.toString();
  },
};

function unwrapEnvelope<T>(body: unknown): T {
  const camelBody = toCamelCase<ApiEnvelope<T> | T>(body);
  if (camelBody && typeof camelBody === 'object' && 'data' in camelBody) {
    return (camelBody as ApiEnvelope<T>).data as T;
  }

  return camelBody as T;
}
