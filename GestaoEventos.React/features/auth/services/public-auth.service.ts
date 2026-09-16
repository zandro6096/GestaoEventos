import * as ExpoLinking from 'expo-linking';
import { Linking } from 'react-native';

import { track } from '../../../services/analytics/analytics.service';
import {
  authApi,
  type AcceptInviteTokenRequest,
  type LoginRequest,
  type RegisterUserRequest,
  type ResetPasswordRequest,
  type SsoProvider,
} from '../../../services/api/auth-api';
import { normalizeApiError } from '../../../services/api/api-error';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { authSessionService } from '../../../services/session/auth-session.service';
import { applyAuthSessionResult } from '../../../stores/auth.store';
import { authenticateBiometricLogin, enableBiometricLogin } from './biometric-login.service';

export type PublicLoginRequest = LoginRequest & {
  inviteToken?: string | null;
  enableBiometric?: boolean;
};

export const publicAuthService = {
  async login(request: PublicLoginRequest) {
    assertOnlineForMutation('login');
    track('simulation', 'auth:login_submit');

    try {
      const { inviteToken: _inviteToken, enableBiometric, ...credentials } = request;
      const result = await authApi.login(credentials);
      const session = await authSessionService.completeLogin(result.token);
      if (enableBiometric) await enableBiometricLogin(result.token);
      applyAuthSessionResult(session);
      track('confirmation', 'auth:login_success', {
        extra: { via_convite: Boolean(request.inviteToken) },
      });
      return session;
    } catch (error) {
      throw normalizeApiError(error, 'Nao foi possivel entrar. Verifique suas credenciais.');
    }
  },

  async loginWithBiometric() {
    assertOnlineForMutation('login biometrico');
    track('simulation', 'auth:biometric_login_submit');
    const token = await authenticateBiometricLogin();
    if (!token) throw new Error('Biometria cancelada ou indisponivel.');

    try {
      const session = await authSessionService.completeLogin(token);
      track('confirmation', 'auth:biometric_login_success');
      return session;
    } catch (error) {
      throw normalizeApiError(error, 'Nao foi possivel entrar com biometria. Entre com sua senha.');
    }
  },

  async registerUser(request: RegisterUserRequest) {
    assertOnlineForMutation('cadastro');
    track('simulation', 'auth:signup_submit', {
      extra: { via_convite: false },
    });

    try {
      const result = await authApi.registerUser(request);
      track('confirmation', 'auth:signup_success', {
        extra: { via_convite: false },
      });
      return result;
    } catch (error) {
      throw normalizeApiError(error, 'Nao foi possivel criar a conta. Revise os dados e tente novamente.');
    }
  },

  async recoverPassword(email: string) {
    assertOnlineForMutation('recuperar senha');
    track('simulation', 'auth:recuperar_senha_submit');

    try {
      await authApi.recoverPassword(email);
      track('confirmation', 'auth:recuperar_senha_email_enviado');
    } catch (error) {
      throw normalizeApiError(error, 'Nao foi possivel solicitar recuperacao agora.');
    }
  },

  async resetPassword(request: ResetPasswordRequest) {
    assertOnlineForMutation('redefinir senha');
    track('simulation', 'auth:redefinir_senha_submit');

    try {
      await authApi.resetPassword(request);
      track('confirmation', 'auth:redefinir_senha_success');
    } catch (error) {
      throw normalizeApiError(error, 'Token invalido ou expirado. Solicite um novo link.');
    }
  },

  async resendConfirmationEmail(email: string) {
    assertOnlineForMutation('reenviar confirmacao');
    track('click', 'btn:reenviar_confirmacao');

    try {
      await authApi.resendConfirmationEmail(email);
    } catch (error) {
      throw normalizeApiError(error, 'Nao foi possivel reenviar o e-mail de confirmacao agora.');
    }
  },

  async confirmEmail(token: string) {
    assertOnlineForMutation('confirmar email');
    track('simulation', 'auth:confirmar_email_process');

    try {
      const result = await authApi.confirmEmail(token);
      track('confirmation', 'auth:confirmar_email_success');
      return result;
    } catch (error) {
      throw normalizeApiError(error, 'Link invalido ou expirado.');
    }
  },

  async validateInviteToken(token: string) {
    assertOnlineForMutation('validar convite');

    try {
      return await authApi.validateInviteToken(token);
    } catch (error) {
      throw normalizeApiError(error, 'Nao foi possivel validar este convite.');
    }
  },

  async acceptInviteToken(request: AcceptInviteTokenRequest) {
    assertOnlineForMutation('aceitar convite');
    track('simulation', 'auth:signup_submit', {
      extra: { via_convite: true },
    });

    try {
      const result = await authApi.acceptInviteToken(request);
      track('confirmation', 'auth:signup_success', {
        extra: { via_convite: true },
      });
      return result;
    } catch (error) {
      throw normalizeApiError(error, 'Nao foi possivel aceitar o convite. Verifique o link.');
    }
  },

  async startSso(provider: SsoProvider) {
    assertOnlineForMutation(`login ${provider}`);
    track('entrance', `btn:login_${provider}`);

    const returnUrl = ExpoLinking.createURL('/auth/sso/callback');
    const url = authApi.buildSsoStartUrl(provider, returnUrl);
    await Linking.openURL(url);
  },

  async completeSsoCallback(token: string) {
    if (!token.trim()) {
      throw new Error('Retorno de autenticacao invalido: token ausente.');
    }

    track('simulation', 'auth:sso_callback_process');
    const session = await authSessionService.completeLogin(token);
    applyAuthSessionResult(session);
    track('confirmation', 'auth:sso_login_success');
    return session;
  },
};
