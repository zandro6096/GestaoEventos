import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { track } from '../../../services/analytics/analytics.service';
import { spacing } from '../../../shared/design/tokens';
import { AuthButton } from '../components/AuthButton';
import { AuthPasswordField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { AuthMessage } from '../components/AuthMessage';
import { useResetPasswordMutation } from '../hooks/usePublicAuth';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/public-auth.schemas';
import { getErrorMessage, getSingleParam } from './screen-utils';

export function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = getSingleParam(params.token);
  const router = useRouter();
  const resetMutation = useResetPasswordMutation();
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { novaSenha: '', confirmarSenha: '' },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      setMessage({ tone: 'error', text: 'Link invalido ou expirado.' });
      return;
    }

    setMessage(null);

    try {
      await resetMutation.mutateAsync({
        token,
        novaSenha: values.novaSenha,
        confirmarSenha: values.confirmarSenha,
      });
      setMessage({ tone: 'success', text: 'Senha redefinida. Voce ja pode fazer login.' });
    } catch (error) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Nao foi possivel redefinir a senha.') });
    }
  }

  function handleResetPress() {
    track('click', 'btn:redefinir_senha');
    void handleSubmit(onSubmit)();
  }

  return (
    <AuthLayout
      title="Redefinir senha"
      subtitle="Defina uma nova senha para sua conta."
      footer={<AuthButton label="Voltar para login" variant="secondary" onPress={() => router.push('/auth/login')} />}
    >
      <View style={{ gap: spacing.md }}>
        {!token ? <AuthMessage tone="error">Link invalido ou expirado.</AuthMessage> : null}
        {message ? <AuthMessage tone={message.tone}>{message.text}</AuthMessage> : null}

        <Controller
          control={control}
          name="novaSenha"
          render={({ field: { onBlur, onChange, value } }) => (
            <AuthPasswordField
              label="Nova senha"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoComplete="new-password"
              placeholder="Minimo 8 caracteres"
              error={errors.novaSenha?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmarSenha"
          render={({ field: { onBlur, onChange, value } }) => (
            <AuthPasswordField
              label="Confirmar senha"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoComplete="new-password"
              placeholder="Repita a senha"
              error={errors.confirmarSenha?.message}
            />
          )}
        />

        <AuthButton label="Redefinir senha" loading={resetMutation.isPending} disabled={!token} onPress={handleResetPress} />
      </View>
    </AuthLayout>
  );
}
