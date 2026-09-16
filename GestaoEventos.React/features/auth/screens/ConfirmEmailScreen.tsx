import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { track } from '../../../services/analytics/analytics.service';
import { AuthButton } from '../components/AuthButton';
import { AuthLayout } from '../components/AuthLayout';
import { AuthMessage } from '../components/AuthMessage';
import { useConfirmEmail } from '../hooks/usePublicAuth';
import { getErrorMessage, getSingleParam } from './screen-utils';

export function ConfirmEmailScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = getSingleParam(params.token);
  const router = useRouter();
  const invalidTracked = useRef(false);
  const confirmQuery = useConfirmEmail(token);

  useEffect(() => {
    if (!token && !invalidTracked.current) {
      invalidTracked.current = true;
      track('click', 'auth:confirmar_email_token_invalido');
    }
  }, [token]);

  return (
    <AuthLayout
      title="Confirmar e-mail"
      subtitle="Validando o link enviado para sua conta."
      footer={<AuthButton label="Ir para login" variant="secondary" onPress={() => router.push('/auth/login')} />}
    >
      {!token ? <AuthMessage tone="error">Link invalido ou ja utilizado.</AuthMessage> : null}
      {token && confirmQuery.isLoading ? <AuthMessage tone="info">Confirmando seu e-mail...</AuthMessage> : null}
      {confirmQuery.isSuccess ? <AuthMessage tone="success">E-mail confirmado. Sua conta esta ativa.</AuthMessage> : null}
      {confirmQuery.isError ? (
        <AuthMessage tone="error">{getErrorMessage(confirmQuery.error, 'Link invalido ou expirado.')}</AuthMessage>
      ) : null}
    </AuthLayout>
  );
}
