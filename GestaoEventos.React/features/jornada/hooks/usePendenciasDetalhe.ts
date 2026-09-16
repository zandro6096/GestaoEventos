import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../services/query/query-keys';
import { useAuthStore } from '../../../stores/auth.store';
import { useContextStore } from '../../../stores/context.store';
import { jornadaService, type JornadaScope } from '../services/jornada.service';

export function usePendenciasDetalhe(grupoId: number | null, take = 10) {
  const authUserId = useAuthStore((state) => state.user?.id ?? null);
  const usuarioId = useContextStore((state) => state.usuarioId) ?? authUserId;
  const estruturaId = useContextStore((state) => state.estruturaId);
  const activeGrupoId = useContextStore((state) => state.grupoId);
  const enabled = Boolean(usuarioId && estruturaId && grupoId);
  const scope: JornadaScope = {
    usuarioId: usuarioId ?? 0,
    estruturaId: estruturaId ?? 0,
    grupoId: activeGrupoId,
  };

  return useQuery({
    queryKey: queryKeys.jornada.pendenciasDetalhe(
      { estruturaId, grupoId: activeGrupoId },
      { usuarioId: usuarioId ?? 0, grupoId, skip: 0, take },
    ),
    queryFn: () => jornadaService.getPendenciasDetalhe(scope, grupoId ?? 0, 0, take),
    enabled,
  });
}
