import { useMutation, useQuery } from '@tanstack/react-query';

import { publicAuthService, type PublicLoginRequest } from '../services/public-auth.service';
import type {
  AcceptInviteTokenRequest,
  RegisterUserRequest,
  ResetPasswordRequest,
  SsoProvider,
} from '../../../services/api/auth-api';

export function useLoginMutation() {
  return useMutation({
    mutationFn: (request: PublicLoginRequest) => publicAuthService.login(request),
  });
}

export function useBiometricLoginMutation() {
  return useMutation({
    mutationFn: () => publicAuthService.loginWithBiometric(),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (request: RegisterUserRequest) => publicAuthService.registerUser(request),
  });
}

export function useRecoverPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => publicAuthService.recoverPassword(email),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (request: ResetPasswordRequest) => publicAuthService.resetPassword(request),
  });
}

export function useResendConfirmationMutation() {
  return useMutation({
    mutationFn: (email: string) => publicAuthService.resendConfirmationEmail(email),
  });
}

export function useAcceptInviteTokenMutation() {
  return useMutation({
    mutationFn: (request: AcceptInviteTokenRequest) => publicAuthService.acceptInviteToken(request),
  });
}

export function useSsoStartMutation() {
  return useMutation({
    mutationFn: (provider: SsoProvider) => publicAuthService.startSso(provider),
  });
}

export function useInviteDetails(token?: string | null) {
  return useQuery({
    queryKey: ['public-auth', 'invite', token],
    queryFn: () => publicAuthService.validateInviteToken(token!),
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useConfirmEmail(token?: string | null) {
  return useQuery({
    queryKey: ['public-auth', 'confirm-email', token],
    queryFn: () => publicAuthService.confirmEmail(token!),
    enabled: Boolean(token),
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
