import { useQuery } from '@tanstack/react-query';
import { useContextStore } from '../../stores/context.store';
import { can } from '../../services/permissions/permission.facade';
import { track } from '../../services/analytics/analytics.service';
import { gruposApi } from '../../services/api/grupos-api';
import { buildGroupTree, filterGroups } from './grupos.rules';
import { useEffect, useMemo, useState } from 'react';

export function useGrupos() {
  const estruturaId = useContextStore((state) => state.estruturaId);
  const grupoId = useContextStore((state) => state.grupoId);
  const usuarioId = useContextStore((state) => state.usuarioId);
  const [term, setTerm] = useState('');
  const [level, setLevel] = useState<number | null>(null);
  const enabled = Boolean(usuarioId && estruturaId && can('ler', 'grupos'));
  const query = useQuery({
    queryKey: ['grupos', { usuarioId, estruturaId, grupoId }],
    queryFn: async () => {
      const pages = [] as Awaited<ReturnType<typeof gruposApi.list>>['data'];
      for (let skip = 0; ; skip += 100) {
        const page = await gruposApi.list(estruturaId!, skip, 100);
        pages.push(...page.data);
        if (page.data.length < 100 || skip / 100 + 1 >= page.totalPages) return { data: pages, totalCount: page.totalCount };
      }
    },
    enabled,
  });
  const groups = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const filtered = useMemo(() => filterGroups(groups, term, level), [groups, level, term]);
  const tree = useMemo(() => buildGroupTree(filtered), [filtered]);
  useEffect(() => { if (enabled) track('entrance', 'grupos:listar_entrada'); }, [enabled]);
  function applyTerm(value: string) { setTerm(value); track('simulation', 'grupos:filtro_aplicar', { extra: { termo_preenchido: value.trim().length > 0 } }); }
  return { query, groups, filtered, tree, term, level, applyTerm, setLevel, estruturaId, canManage: can('gerenciar', 'grupos', { estruturaId, grupoId }) };
}
