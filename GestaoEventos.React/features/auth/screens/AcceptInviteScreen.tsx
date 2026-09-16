import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { spacing } from '../../../shared/design/tokens';
import { AuthButton } from '../components/AuthButton';
import { AuthLayout } from '../components/AuthLayout';
import { AuthMessage } from '../components/AuthMessage';
import { useInviteDetails } from '../hooks/usePublicAuth';
import { getErrorMessage, getSingleParam } from './screen-utils';

export function AcceptInviteScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = getSingleParam(params.token);
  const router = useRouter();
  const inviteQuery = useInviteDetails(token);

  function goTo(pathname: '/auth/login' | '/auth/cadastro') {
    if (!token) return;
    router.push({ pathname, params: { convite: token } });
  }

  return (
    <AuthLayout title="Aceitar convite" subtitle="Confira o convite antes de continuar.">
      <View style={{ gap: spacing.md }}>
        {!token ? <AuthMessage tone="error">Token de convite ausente.</AuthMessage> : null}
        {token && inviteQuery.isLoading ? <AuthMessage tone="info">Validando convite...</AuthMessage> : null}
        {inviteQuery.isError ? (
          <AuthMessage tone="error">{getErrorMessage(inviteQuery.error, 'Este convite nao esta mais valido.')}</AuthMessage>
        ) : null}
        {inviteQuery.data?.valid ? (
          <>
            <AuthMessage tone="success" title="Convite valido">
              {`Estrutura: ${inviteQuery.data.estruturaNome ?? 'Nao informada'}\nGrupo: ${
                inviteQuery.data.grupoNome ?? 'Sem grupo definido'
              }\nConvidado por: ${inviteQuery.data.convidadoPorNome ?? 'Nao informado'}`}
            </AuthMessage>
            <AuthButton label="Entrar e aceitar" onPress={() => goTo('/auth/login')} />
            <AuthButton label="Criar conta com convite" variant="secondary" onPress={() => goTo('/auth/cadastro')} />
          </>
        ) : null}
      </View>
    </AuthLayout>
  );
}
