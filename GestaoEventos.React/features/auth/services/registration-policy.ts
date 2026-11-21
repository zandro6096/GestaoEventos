import type { InviteDetails } from '../../../services/api/auth-api';

export function allowsPublicRegistration(platform: string): boolean {
  return platform !== 'ios';
}

export function isExistingOrganizationInvite(invite?: InviteDetails | null): boolean {
  return invite?.valid === true && Number.isInteger(invite.estruturaId) && (invite.estruturaId ?? 0) > 0;
}

export function assertPublicRegistrationAllowed(platform: string): void {
  if (!allowsPublicRegistration(platform)) {
    throw new Error('No iOS, o acesso de novos participantes exige um convite para uma organização existente.');
  }
}

export function assertExistingOrganizationInvite(invite?: InviteDetails | null): void {
  if (!isExistingOrganizationInvite(invite)) {
    throw new Error('Este convite não é válido para uma organização existente. Solicite um novo convite ao administrador.');
  }
}
