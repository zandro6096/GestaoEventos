import type { QueryClient, QueryKey } from '@tanstack/react-query';

const contextScopedRoots = new Set([
  'contexto',
  'jornada',
  'eventos',
  'grupos',
  'painel',
  'relatorios',
  'configuracoes',
  'permissoes',
]);

export async function resetContextScopedQueries(queryClient: QueryClient) {
  const predicate = ({ queryKey }: { queryKey: QueryKey }) => isContextScopedQueryKey(queryKey);

  await queryClient.cancelQueries({ predicate });
  queryClient.removeQueries({ predicate });
  await queryClient.invalidateQueries({ predicate });
}

export function isContextScopedQueryKey(queryKey: QueryKey) {
  const root = queryKey[0];
  if (typeof root === 'string' && contextScopedRoots.has(root)) return true;

  return queryKey.some((entry) => hasContextScope(entry));
}

function hasContextScope(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  return 'estruturaId' in record || 'grupoId' in record || 'permissoes' in record;
}
