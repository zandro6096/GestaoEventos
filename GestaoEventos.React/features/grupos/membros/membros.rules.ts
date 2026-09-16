export type PersonAction = 'adicionar' | 'reativar' | 'reenviar_convite';

export function normalizePersonStatus(value: string | null | undefined) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

export function personAction(person: { tipo: 'usuario' | 'usuario_virtual'; ativo: boolean; status?: string | null }): PersonAction {
  const status = normalizePersonStatus(person.status);
  if (!person.ativo || ['inativo', 'inactive', 'desativado'].includes(status)) return 'reativar';
  if (person.tipo === 'usuario_virtual' && ['pendente', 'convite', 'expirado'].includes(status)) return 'reenviar_convite';
  return 'adicionar';
}

export function isDuplicatePerson(personId: number, existingIds: number[]) {
  return existingIds.includes(personId);
}
