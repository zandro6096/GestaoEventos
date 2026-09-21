const allowedRoutes = new Set(['/admin/eventos/meus']);
const routeByType = new Map([['pendencias', '/admin/eventos/meus']]);

// O payload vem da rede: so aceita rotas conhecidas, nunca um caminho arbitrario.
export function resolvePushRoute(data: Record<string, unknown>): string | null {
  const rota = typeof data.rota === 'string' ? data.rota : null;
  if (rota && allowedRoutes.has(rota)) return rota;

  const tipo = typeof data.tipo === 'string' ? data.tipo : null;
  return tipo ? routeByType.get(tipo) ?? null : null;
}
