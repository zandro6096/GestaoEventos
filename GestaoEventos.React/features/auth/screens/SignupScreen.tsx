import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, View } from 'react-native';

import { track } from '../../../services/analytics/analytics.service';
import { spacing } from '../../../shared/design/tokens';
import { AuthButton } from '../components/AuthButton';
import { AuthTextField, AuthPasswordField } from '../components/AuthField';
import { AuthLayout } from '../components/AuthLayout';
import { AuthMessage } from '../components/AuthMessage';
import {
  useAcceptInviteTokenMutation,
  useInviteDetails,
  useRegisterMutation,
  useResendConfirmationMutation,
} from '../hooks/usePublicAuth';
import { signupSchema, type SignupFormValues } from '../schemas/public-auth.schemas';
import { getErrorMessage, getSingleParam } from './screen-utils';
import { allowsPublicRegistration, assertExistingOrganizationInvite, isExistingOrganizationInvite } from '../services/registration-policy';

export function SignupScreen() {
  const params = useLocalSearchParams<{ convite?: string | string[] }>();
  const inviteToken = getSingleParam(params.convite)?.trim() || null;
  const router = useRouter();
  const inviteQuery = useInviteDetails(inviteToken);
  const registerMutation = useRegisterMutation();
  const acceptInviteMutation = useAcceptInviteTokenMutation();
  const resendMutation = useResendConfirmationMutation();
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const publicRegistrationAllowed = allowsPublicRegistration(Platform.OS);
  const validInvite = isExistingOrganizationInvite(inviteQuery.data) && !inviteQuery.isFetching && !inviteQuery.isError;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      convite: inviteToken,
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  useEffect(() => {
    track('entrance', 'page:signup_view', {
      extra: { via_convite: Boolean(inviteToken) },
    });
    setValue('convite', inviteToken);
  }, [inviteToken, setValue]);

  useEffect(() => {
    if (inviteQuery.data?.email) {
      setValue('email', inviteQuery.data.email);
    }
    if (inviteQuery.data?.nome) {
      setValue('nome', inviteQuery.data.nome);
    }
  }, [inviteQuery.data?.email, inviteQuery.data?.nome, setValue]);

  async function onSubmit(values: SignupFormValues) {
    setMessage(null);

    try {
      if (inviteToken) {
        if (!publicRegistrationAllowed) {
          if (!validInvite) throw new Error('Aguarde a validação de um convite válido para uma organização existente.');
          assertExistingOrganizationInvite(inviteQuery.data);
        }
        await acceptInviteMutation.mutateAsync({
          token: inviteToken,
          senha: values.senha,
          confirmarSenha: values.confirmarSenha,
        });
        setMessage({ tone: 'success', text: 'Convite aceito. Sua conta foi criada.' });
        return;
      }

      await registerMutation.mutateAsync({
        nome: values.nome?.trim() ?? '',
        email: values.email.trim(),
        senha: values.senha,
      });
      setCreatedEmail(values.email.trim());
      setMessage({ tone: 'success', text: 'Conta criada. Confirme seu e-mail para concluir o acesso.' });
    } catch (error) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Nao foi possivel criar a conta.') });
    }
  }

  function handleSignupPress() {
    track('click', 'btn:signup');
    void handleSubmit(onSubmit)();
  }

  async function handleResendConfirmation() {
    if (!createdEmail) return;

    try {
      await resendMutation.mutateAsync(createdEmail);
      setMessage({ tone: 'success', text: 'Novo e-mail de confirmacao enviado.' });
    } catch (error) {
      setMessage({ tone: 'error', text: getErrorMessage(error, 'Nao foi possivel reenviar agora.') });
    }
  }

  function goToLogin() {
    router.push({ pathname: '/auth/login', params: inviteToken ? { convite: inviteToken } : {} });
  }

  if (!publicRegistrationAllowed && (!inviteToken || !validInvite)) {
    return (
      <AuthLayout
        title="Acesso por convite"
        subtitle="Entre na sua conta ou aceite um convite para participar de uma organização existente."
        footer={<AuthButton label="Entrar na plataforma" variant="secondary" onPress={goToLogin} />}
      >
        <View style={{ gap: spacing.md }}>
          {!inviteToken ? (
            <AuthMessage tone="info">
              Peça ao administrador da organização um convite para o seu e-mail. Abra o link recebido para ativar sua conta pessoal.
            </AuthMessage>
          ) : inviteQuery.isFetching || inviteQuery.isPending ? (
            <AuthMessage tone="info">Validando convite...</AuthMessage>
          ) : (
            <>
              <AuthMessage tone="warning">
                {inviteQuery.error
                  ? getErrorMessage(inviteQuery.error, 'Não foi possível validar este convite.')
                  : 'Este convite não é válido para uma organização existente. Solicite um novo convite ao administrador.'}
              </AuthMessage>
              <AuthButton label="Tentar novamente" onPress={() => { void inviteQuery.refetch(); }} />
            </>
          )}
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={inviteToken ? 'Aceitar convite' : 'Criar conta'}
      subtitle={inviteToken ? 'Ative sua conta pessoal na organização que enviou o convite.' : 'Preencha os dados para comecar.'}
      footer={<AuthButton label="Entrar na plataforma" variant="secondary" onPress={goToLogin} />}
    >
      <View style={{ gap: spacing.md }}>
        {(publicRegistrationAllowed ? inviteQuery.data?.valid : validInvite) ? (
          <AuthMessage tone="info" title="Convite encontrado">
            {`Estrutura: ${inviteQuery.data?.estruturaNome ?? 'Nao informada'}\nGrupo: ${
              inviteQuery.data?.grupoNome ?? 'Sem grupo definido'
            }`}
          </AuthMessage>
        ) : null}

        {inviteQuery.error ? (
          <AuthMessage tone="warning">{getErrorMessage(inviteQuery.error, 'Este convite nao esta mais valido.')}</AuthMessage>
        ) : null}

        {message ? <AuthMessage tone={message.tone}>{message.text}</AuthMessage> : null}

        <Controller
          control={control}
          name="nome"
          render={({ field: { onBlur, onChange, value } }) => (
            <AuthTextField
              label="Nome completo"
              value={value ?? ''}
              onBlur={onBlur}
              onChangeText={onChange}
              autoComplete="name"
              placeholder="Seu nome"
              error={errors.nome?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <AuthTextField
              label="E-mail"
              value={value}
              editable={!inviteToken}
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

        <Controller
          control={control}
          name="senha"
          render={({ field: { onBlur, onChange, value } }) => (
            <AuthPasswordField
              label="Senha"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              autoComplete="new-password"
              placeholder="Minimo 8 caracteres"
              error={errors.senha?.message}
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
              returnKeyType="done"
              onSubmitEditing={handleSignupPress}
              error={errors.confirmarSenha?.message}
            />
          )}
        />

        <AuthButton
          label={inviteToken ? 'Aceitar convite' : 'Criar conta gratuitamente'}
          loading={registerMutation.isPending || acceptInviteMutation.isPending}
          disabled={Boolean(inviteToken && (publicRegistrationAllowed ? inviteQuery.error : !validInvite))}
          onPress={handleSignupPress}
        />

        {createdEmail ? (
          <AuthButton
            label="Reenviar e-mail de confirmacao"
            variant="secondary"
            loading={resendMutation.isPending}
            onPress={handleResendConfirmation}
          />
        ) : null}
      </View>
    </AuthLayout>
  );
}
