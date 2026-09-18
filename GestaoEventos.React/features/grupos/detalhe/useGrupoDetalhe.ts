import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useContextStore } from '../../../stores/context.store';
import { can } from '../../../services/permissions/permission.facade';
import { track } from '../../../services/analytics/analytics.service';
import { grupoDetalheService } from './detalhe.service';
import { acompanhamentosApi } from '../../../services/api/acompanhamentos-api';

export function useGrupoDetalhe(grupoId: number) {
  const { usuarioId, estruturaId, grupoId: activeGrupoId } = useContextStore();
  const enabled = Boolean(grupoId > 0 && usuarioId && estruturaId && can('ler', 'grupos'));
  const query = useQuery({ queryKey: ['grupo-detalhe', { usuarioId, estruturaId, grupoId, activeGrupoId }], queryFn: () => grupoDetalheService.carregar(grupoId, usuarioId!, estruturaId!), enabled, retry: false });
  const acompanhamentosQuery = useQuery({ queryKey: ['grupo-acompanhamentos', { estruturaId, grupoId, usuarioId }], queryFn: () => acompanhamentosApi.listGrupoResumo(estruturaId!, grupoId), enabled, retry: false });
  useEffect(() => { if (enabled) track('entrance', 'grupos:detalhe_entrada'); }, [enabled]);
  return { query, acompanhamentosQuery, canManage: can('gerenciar', 'grupos', { estruturaId, grupoId }) };
}
