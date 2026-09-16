import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { normalizeApiError } from '../../../services/api/api-error';
import { painelApi, type CockpitMatrixCell, type CockpitMatrixRow } from '../../../services/api/painel-api';
import { track } from '../../../services/analytics/analytics.service';
import { can } from '../../../services/permissions/permission.facade';
import { queryKeys } from '../../../services/query/query-keys';
import { useContextStore } from '../../../stores/context.store';

export const cockpitPeriodos = [7, 30, 90, 180, 365] as const;
export type CockpitPeriodo = (typeof cockpitPeriodos)[number];
export type CockpitRisco = 'todos' | 'alto' | 'medio' | 'baixo';
export type CockpitStatus = 'todos' | 'pendente' | 'em_andamento' | 'resolvido' | 'dispensado';
export type SelectedCell = { row: CockpitMatrixRow; cell: CockpitMatrixCell } | null;

export function useCockpit() {
  const usuarioId = useContextStore((state) => state.usuarioId);
  const estruturaId = useContextStore((state) => state.estruturaId);
  const contextoGrupoId = useContextStore((state) => state.grupoId);
  const [periodo, setPeriodo] = useState<CockpitPeriodo>(90);
  const [grupoId, setGrupoId] = useState<number | null>(contextoGrupoId);
  const [risco, setRisco] = useState<CockpitRisco>('todos');
  const [status, setStatus] = useState<CockpitStatus>('todos');
  const [busca, setBusca] = useState('');
  const [templateId, setTemplateId] = useState<number | null | undefined>(undefined);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const enabled = Boolean(usuarioId && estruturaId && can('ler', 'painel', { estruturaId, grupoId }));
  const dates = useMemo(() => getPeriodDates(periodo), [periodo]);
  const scope = { estruturaId: estruturaId ?? 0, grupoId, ...dates };

  const query = useQuery({ queryKey: queryKeys.painel.cockpit({ estruturaId, grupoId }, { periodo }), queryFn: () => painelApi.getCockpit(scope), enabled });
  const matrixQuery = useQuery({ queryKey: queryKeys.painel.matriz({ estruturaId, grupoId }, { periodo, risco, status, busca, templateId }), queryFn: () => painelApi.getMatriz({ ...scope, risco, status, busca, templateId }), enabled });
  const absenceQuery = useQuery({
    queryKey: queryKeys.painel.faltas({ estruturaId, grupoId }, { participanteId: selectedCell?.row.participanteId, templateId: selectedCell?.cell.templateId, periodo }),
    queryFn: () => painelApi.getFaltas({ ...scope, tipo: selectedCell!.row.tipo, participanteId: selectedCell!.row.participanteId, templateId: selectedCell!.cell.templateId }),
    enabled: Boolean(enabled && selectedCell),
  });
  const groupsQuery = useQuery({
    queryKey: queryKeys.scoped('cockpit-grupos', { estruturaId }, { usuarioId }),
    queryFn: () => loadGroups(estruturaId!),
    enabled: Boolean(enabled),
  });

  useEffect(() => { if (enabled) track('entrance', 'cockpit:entrada'); }, [enabled]);
  useEffect(() => {
    if (!enabled || query.isLoading || query.isFetching) return;
    track(query.isError ? 'click' : 'confirmation', query.isError ? 'cockpit:carregar_erro' : 'cockpit:carregar_sucesso', {
      extra: { periodo_dias: periodo, total_eventos: query.data?.resumo.totalEventos ?? 0 },
    });
  }, [enabled, periodo, query.data?.resumo.totalEventos, query.isError, query.isFetching, query.isLoading]);

  function applyFilter(detail: string) { track('simulation', 'cockpit:filtro_aplicar', { extra: { filtro: detail } }); }
  function selectCell(row: CockpitMatrixRow, cell: CockpitMatrixCell) {
    if (!can('ler', 'painel', { estruturaId, grupoId: row.grupoId })) return;
    setSelectedCell({ row, cell });
    track('entrance', 'cockpit:detalhe_faltas_abrir', { extra: { participante_id: row.participanteId, template_id: cell.templateId } });
  }
  function clearCell() { setSelectedCell(null); }

  return {
    query, matrixQuery, absenceQuery, groups: groupsQuery.data ?? [], selectedCell, setSelectedCell: selectCell, clearCell,
    estruturaId, grupoId, periodo, risco, status, busca, templateId, enabled, dates,
    applyPeriodo: (value: CockpitPeriodo) => { setPeriodo(value); applyFilter('periodo'); },
    applyGrupo: (value: number | null) => { setGrupoId(value); applyFilter('grupo'); },
    applyRisco: (value: CockpitRisco) => { setRisco(value); applyFilter('risco'); },
    applyStatus: (value: CockpitStatus) => { setStatus(value); applyFilter('status'); },
    applyBusca: (value: string) => setBusca(value),
    applyTemplate: (value: number | null | undefined) => { setTemplateId(value); applyFilter('template'); },
    refetch: () => { void Promise.all([query.refetch(), matrixQuery.refetch()]); },
    errorMessage: query.isError ? normalizeApiError(query.error, 'Nao foi possivel carregar o cockpit.').message : null,
    matrixErrorMessage: matrixQuery.isError ? normalizeApiError(matrixQuery.error, 'Nao foi possivel carregar a matriz.').message : null,
  };
}

async function loadGroups(estruturaId: number) {
  const result = await import('../../../services/api/grupos-api');
  const groups = [] as Awaited<ReturnType<typeof result.gruposApi.list>>['data'];
  for (let skip = 0; ; skip += 100) {
    const page = await result.gruposApi.list(estruturaId, skip, 100);
    groups.push(...page.data);
    if (page.data.length < 100 || skip / 100 + 1 >= page.totalPages) return groups;
  }
}

function getPeriodDates(periodo: CockpitPeriodo) {
  const dataFim = new Date();
  const dataInicio = new Date(dataFim);
  dataInicio.setDate(dataInicio.getDate() - periodo);
  return { dataInicio: formatLocalDateTime(dataInicio), dataFim: formatLocalDateTime(dataFim) };
}

function formatLocalDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
}
