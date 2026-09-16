import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';

import { track } from '../../../services/analytics/analytics.service';
import { publicAuthService } from '../services/public-auth.service';
import { AuthButton } from '../components/AuthButton';
import { AuthLayout } from '../components/AuthLayout';
import { AuthMessage } from '../components/AuthMessage';
import { getSingleParam } from './screen-utils';

type CallbackState = {
  code: 'provider_error' | 'missing_token' | 'success';
  tone: 'info' | 'success' | 'error';
  text: string;
  token?: string;
};

export function SsoCallbackScreen() {
  const params = useLocalSearchParams<{
    token?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();
  const router = useRouter();
  const processed = useRef(false);
  const state = resolveCallbackState(params);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    if (state.code === 'provider_error') {
      track('click', 'auth:sso_callback_error');
      return;
    }

    if (state.code === 'missing_token') {
      track('click', 'auth:sso_callback_token_ausente');
      return;
    }

    void publicAuthService.completeSsoCallback(state.token ?? '').then((session) => {
      router.replace((session.status === 'authenticated' ? '/admin/jornada' : '/estrutura/selecionar') as Href);
    }).catch(() => {
      track('click', 'auth:sso_login_error');
    });
  }, [router, state]);

  return (
    <AuthLayout
      title="Login social"
      subtitle="Retorno do provedor de autenticacao."
      footer={<AuthButton label="Voltar para login" variant="secondary" onPress={() => router.push('/auth/login')} />}
    >
      <AuthMessage tone={state.tone}>{state.text}</AuthMessage>
    </AuthLayout>
  );
}

function resolveCallbackState(params: {
  token?: string | string[];
  error?: string | string[];
  error_description?: string | string[];
}): CallbackState {
  const providerError = getSingleParam(params.error);
  const providerDescription = getSingleParam(params.error_description);
  const token = getSingleParam(params.token);

  if (providerError || providerDescription) {
    return {
      code: 'provider_error',
      tone: 'error',
      text: providerDescription ?? 'Autenticacao social cancelada ou negada pelo provedor.',
    };
  }

  if (!token) {
    return {
      code: 'missing_token',
      tone: 'error',
      text: 'Retorno de autenticacao invalido: token ausente.',
    };
  }

  return {
    code: 'success',
    tone: 'success',
    text: 'Login social validado. Preparando seu acesso.',
    token,
  };
}
