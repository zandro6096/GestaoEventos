import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { track } from '../../../services/analytics/analytics.service';
import { colors, spacing, typography } from '../../../shared/design/tokens';
import { AuthButton } from '../components/AuthButton';
import { AuthTextField, AuthPasswordField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { AuthMessage } from '../components/AuthMessage';
import { biometricAvailability, isBiometricLoginEnabled } from '../services/biometric-login.service';
import { useBiometricLoginMutation, useInviteDetails, useLoginMutation } from '../hooks/usePublicAuth';
import { loginSchema, type LoginFormValues } from '../schemas/public-auth.schemas';
import { getErrorMessage, getSingleParam } from './screen-utils';

export function LoginScreen() {
  const params = useLocalSearchParams<{ convite?: string | string[] }>();
  const inviteToken = getSingleParam(params.convite);
  const router = useRouter();
  const inviteQuery = useInviteDetails(inviteToken);
  const loginMutation = useLoginMutation();
  const biometricMutation = useBiometricLoginMutation();
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [enableBiometric, setEnableBiometric] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: '',
      senha: '',
    },
  });

  useEffect(() => {
    if (inviteQuery.data?.email) {
      setValue('login', inviteQuery.data.email);
    }
  }, [inviteQuery.data?.email, setValue]);

  useEffect(() => {
    void Promise.all([biometricAvailability(), isBiometricLoginEnabled()]).then(([available, enabled]) => {
      setBiometricAvailable(available);
      setBiometricEnabled(enabled);
    });
  }, []);

  async function onSubmit(values: LoginFormValues) {
    setMessage(null);

    try {
        await loginMutation.mutateAsync({
          username: values.login.trim(),
          password: values.senha,
          inviteToken,
          enableBiometric: enableBiometric && biometricAvailable,
        }).then((session) => {
        router.replace((session.status === 'authenticated' ? '/admin/jornada' : '/estrutura/selecionar') as Href);
      });
      setMessage({ tone: 'success', text: 'Login validado. Preparando seu acesso.' });
    } catch (error) {
      const text = getErrorMessage(error, 'Nao foi possivel entrar. Verifique suas credenciais.');
      setMessage({ tone: 'error', text });
    }
  }

  function handleBiometricPress() {
    setMessage(null);
    void biometricMutation.mutateAsync().then((session) => {
      router.replace((session.status === 'authenticated' ? '/admin/jornada' : '/estrutura/selecionar') as Href);
    }).catch((error) => {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Nao foi possivel entrar com biometria. Entre com sua senha.') });
    });
  }

  function handleLoginPress() {
    track('click', 'btn:login');
    void handleSubmit(onSubmit)();
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre com suas credenciais para continuar."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Ainda não tem uma conta?</Text>
          <Pressable accessibilityRole="link" onPress={() => router.push('/auth/cadastro')}>
            <Text style={styles.linkText}>Registre-se</Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.stack}>
        {inviteQuery.data?.valid ? (
          <AuthMessage tone="info" title="Convite encontrado">
            {`Estrutura: ${inviteQuery.data.estruturaNome ?? 'Nao informada'}\nGrupo: ${
              inviteQuery.data.grupoNome ?? 'Sem grupo definido'
            }`}
          </AuthMessage>
        ) : null}

        {inviteQuery.error ? (
          <AuthMessage tone="warning">{getErrorMessage(inviteQuery.error, 'Este convite nao esta mais valido.')}</AuthMessage>
        ) : null}

        {message ? <AuthMessage tone={message.tone}>{message.text}</AuthMessage> : null}

        <Controller
          control={control}
          name="login"
          render={({ field: { onBlur, onChange, value } }) => (
            <AuthTextField
              label="E-mail ou login"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="username"
              placeholder="seu@email.com"
              returnKeyType="next"
              error={errors.login?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="senha"
          render={({ field: { onBlur, onChange, value } }) => (
            <AuthPasswordField
              label="Senha"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoComplete="current-password"
              placeholder="Sua senha"
              returnKeyType="go"
              onSubmitEditing={handleLoginPress}
              error={errors.senha?.message}
            />
          )}
        />

        <AuthButton label="Entrar na plataforma" loading={loginMutation.isPending} onPress={handleLoginPress} />

        {biometricAvailable ? <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: enableBiometric }} style={styles.biometricOption} onPress={() => setEnableBiometric((value) => !value)}>
          <Text style={styles.biometricIndicator}>{enableBiometric ? '✓' : ''}</Text>
          <Text style={styles.biometricOptionText}>Ativar login com biometria neste dispositivo</Text>
        </Pressable> : null}

        {biometricAvailable && biometricEnabled ? <AuthButton label="Entrar com biometria" variant="secondary" loading={biometricMutation.isPending} onPress={handleBiometricPress} /> : null}

        <Pressable accessibilityRole="link" style={styles.recoverLink} onPress={() => router.push('/auth/recuperar-senha')}>
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  recoverLink: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  biometricOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  biometricIndicator: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 5,
    color: colors.brandBlue,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  biometricOptionText: {
    ...typography.caption,
    flex: 1,
    color: colors.textSecondary,
  },
});
