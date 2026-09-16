import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { track } from '../../../services/analytics/analytics.service';
import { spacing } from '../../../shared/design/tokens';
import { AuthButton } from '../components/AuthButton';
import { AuthTextField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { AuthMessage } from '../components/AuthMessage';
import { useRecoverPasswordMutation } from '../hooks/usePublicAuth';
import { recoverPasswordSchema, type RecoverPasswordFormValues } from '../schemas/public-auth.schemas';
import { getErrorMessage } from './screen-utils';

export function RecoverPasswordScreen() {
  const router = useRouter();
  const recoverMutation = useRecoverPasswordMutation();
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPasswordFormValues>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: RecoverPasswordFormValues) {
    setMessage(null);

    try {
      await recoverMutation.mutateAsync(values.email.trim());
      setMessage({
        tone: 'success',
        text: 'Se existir uma conta com esse e-mail, voce recebera um link de recuperacao.',
      });
    } catch (error) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Nao foi possivel enviar o link agora.') });
    }
  }

  function handleRecoverPress() {
    track('click', 'btn:recuperar_senha');
    void handleSubmit(onSubmit)();
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber um link de redefinicao."
      footer={<AuthButton label="Voltar para login" variant="secondary" onPress={() => router.push('/auth/login')} />}
    >
      <View style={{ gap: spacing.md }}>
        {message ? <AuthMessage tone={message.tone}>{message.text}</AuthMessage> : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <AuthTextField
              label="E-mail"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
            />
          )}
        />

        <AuthButton label="Enviar link de recuperacao" loading={recoverMutation.isPending} onPress={handleRecoverPress} />
      </View>
    </AuthLayout>
  );
}
