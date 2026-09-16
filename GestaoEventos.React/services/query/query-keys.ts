export const queryKeys = {
  authSession: ['auth', 'session'] as const,
  contextoInicial: (usuarioId: number) => ['contexto', 'inicial', { usuarioId }] as const,
  contextoAtivo: (scope: ContextQueryScope = {}) => ['contexto', 'ativo', cleanScope(scope)] as const,
  permissoes: {
    recursos: (scope: ContextQueryScope = {}) => ['permissoes', 'recursos', cleanScope(scope)] as const,
    grupo: (scope: ContextQueryScope) => ['permissoes', 'grupo', cleanScope(scope)] as const,
  },
  jornada: {
    eventosHoje: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['jornada', 'eventos-hoje', cleanScope(scope), params] as const,
    frequencia: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['jornada', 'frequencia', cleanScope(scope), params] as const,
    historico: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['jornada', 'historico', cleanScope(scope), params] as const,
    proximas: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['jornada', 'proximas', cleanScope(scope), params] as const,
    pendenciasResumo: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['jornada', 'pendencias-resumo', cleanScope(scope), params] as const,
    pendenciasDetalhe: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['jornada', 'pendencias-detalhe', cleanScope(scope), params] as const,
  },
  eventos: {
    listagem: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['eventos', 'listagem', cleanScope(scope), params] as const,
    meus: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['eventos', 'meus', cleanScope(scope), params] as const,
    detalhe: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['eventos', 'detalhe', cleanScope(scope), params] as const,
    gruposFiltro: (estruturaId?: number | null) =>
      ['eventos', 'meus', 'grupos-filtro', { estruturaId: estruturaId ?? null }] as const,
  },
  painel: {
    comparativo: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['painel', 'comparativo', cleanScope(scope), params] as const,
    cockpit: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['painel', 'cockpit', cleanScope(scope), params] as const,
    matriz: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['painel', 'cockpit-matriz', cleanScope(scope), params] as const,
    faltas: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['painel', 'cockpit-faltas', cleanScope(scope), params] as const,
  },
  relatorios: {
    frequencia: (scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
      ['relatorios', 'frequencia', cleanScope(scope), params] as const,
  },
  scoped: (root: string, scope: ContextQueryScope = {}, params: Record<string, unknown> = {}) =>
    [root, cleanScope(scope), params] as const,
};

export type ContextQueryScope = {
  estruturaId?: number | null;
  grupoId?: number | null;
};

function cleanScope(scope: ContextQueryScope): ContextQueryScope {
  return {
    estruturaId: scope.estruturaId ?? null,
    grupoId: scope.grupoId ?? null,
  };
}
