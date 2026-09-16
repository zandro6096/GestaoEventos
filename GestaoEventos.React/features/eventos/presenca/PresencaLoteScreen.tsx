import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { normalizeApiError } from '../../../services/api/api-error';
import { eventosApi, type OcorrenciaDto } from '../../../services/api/eventos-api';
import { eventoTemplatesApi } from '../../../services/api/evento-templates-api';
import { participantesEventoApi, type Participante } from '../../../services/api/participantes-evento-api';
import type { AttendanceStatus } from '../../../services/api/participacoes-evento-api';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { track } from '../../../services/analytics/analytics.service';
import { useContextStore } from '../../../stores/context.store';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { presencaService } from './presenca.service';

type Stage = 'selection' | 'matrix';
type Cell = { participant: Participante; serverStatus: AttendanceStatus | null };
type MatrixRow = { key: string; nome: string; email: string | null; cells: Record<string, Cell> };
type MatrixResponse = { occurrence: OcorrenciaDto; participants: Participante[] };
type CellEdit = AttendanceStatus | 'CLEAR';

const ALL_GROUPS = 'all';
const STATUS_OPTIONS: AttendanceStatus[] = ['PRESENTE', 'AUSENTE', 'JUSTIFICADO'];

export function PresencaLoteScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ eventoId?: string; ocorrenciaId?: string; grupoId?: string; data?: string }>();
  const { usuarioId, estruturaId, grupoId: contextGroupId } = useContextStore();
  const anchorEventoId = toPositiveInt(params.eventoId);
  const anchorGrupoId = toPositiveInt(params.grupoId);
  const anchorDate = parseDate(params.data) ?? new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(anchorDate));
  const [stage, setStage] = useState<Stage>('selection');
  const [selectedGroupId, setSelectedGroupId] = useState(() => String(anchorGrupoId ?? ALL_GROUPS));
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectionTouched, setSelectionTouched] = useState(false);
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState<Record<string, CellEdit>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const scopeEnabled = Boolean(usuarioId && estruturaId);
  const weekEnd = endOfDay(addDays(weekStart, 6));
  const occurrenceQuery = useQuery({
    queryKey: ['presenca-lote', 'ocorrencias', usuarioId, estruturaId, anchorGrupoId ?? contextGroupId, formatDay(weekStart)],
    queryFn: () => eventosApi.listOcorrencias({ usuarioId: usuarioId ?? 0, estruturaId: estruturaId ?? 0, grupoId: anchorGrupoId ?? contextGroupId, dataInicio: weekStart.toISOString(), dataFim: weekEnd.toISOString(), take: 200, skip: 0, includeCanceladas: true }),
    enabled: scopeEnabled,
  });
  const templatesQuery = useQuery({
    queryKey: ['presenca-lote', 'templates', estruturaId],
    queryFn: () => eventoTemplatesApi.list(estruturaId ?? 0),
    enabled: scopeEnabled,
    staleTime: 5 * 60 * 1000,
  });
  const anchorEventQuery = useQuery({
    queryKey: ['presenca-lote', 'anchor-event', anchorEventoId],
    queryFn: () => eventosApi.getEventoById(anchorEventoId ?? 0),
    enabled: Boolean(anchorEventoId),
    staleTime: 5 * 60 * 1000,
  });

  const anchorTemplateId = anchorEventQuery.data?.eventoTemplateId ?? occurrenceQuery.data?.data.find((item) => item.eventoId === anchorEventoId)?.eventoTemplateId ?? null;
  const anchorTemplate = useMemo(() => templatesQuery.data?.find((item) => item.id === anchorTemplateId) ?? null, [anchorTemplateId, templatesQuery.data]);
  const allowedTemplateIds = useMemo(() => {
    if (!anchorTemplate?.templatesMatrizIds?.length) return null;
    return new Set([anchorTemplate.id, ...anchorTemplate.templatesMatrizIds]);
  }, [anchorTemplate]);
  const allEligibleOccurrences = useMemo(() => (occurrenceQuery.data?.data ?? [])
    .filter((item) => item.permitirPresencaAgrupada && !item.cancelada)
    .filter((item) => !allowedTemplateIds || (item.eventoTemplateId !== null && allowedTemplateIds.has(item.eventoTemplateId)))
    .sort((left, right) => left.dataHora.localeCompare(right.dataHora)), [allowedTemplateIds, occurrenceQuery.data?.data]);
  const eligibleOccurrences = useMemo(() => allEligibleOccurrences.filter((item) => selectedGroupId === ALL_GROUPS || String(item.grupoId) === selectedGroupId), [allEligibleOccurrences, selectedGroupId]);
  const groupOptions = useMemo(() => {
    const groups = new Map<number, string>();
    allEligibleOccurrences.forEach((item) => groups.set(item.grupoId, item.grupoNome));
    return [...groups.entries()].sort((left, right) => left[1].localeCompare(right[1], 'pt-BR'));
  }, [allEligibleOccurrences]);
  const effectiveSelectedKeys = useMemo(() => {
    if (selectionTouched) return selectedKeys;
    return eligibleOccurrences.map(occurrenceKey);
  }, [eligibleOccurrences, selectedKeys, selectionTouched]);
  const selectedOccurrences = useMemo(() => eligibleOccurrences.filter((item) => effectiveSelectedKeys.includes(occurrenceKey(item))), [effectiveSelectedKeys, eligibleOccurrences]);
  const selectedSignature = selectedOccurrences.map(occurrenceKey).join('|');

  const matrixQuery = useQuery({
    queryKey: ['presenca-lote', 'matriz', usuarioId, estruturaId, selectedSignature],
    queryFn: async () => Promise.all(selectedOccurrences.map(async (occurrence) => ({ occurrence, participants: await participantesEventoApi.list(occurrence.eventoId, occurrence.id > 0 ? occurrence.id : null, occurrence.dataHora) }))),
    enabled: scopeEnabled && stage === 'matrix' && selectedOccurrences.length > 0,
  });
  const rows = useMemo(() => buildRows(matrixQuery.data ?? []), [matrixQuery.data]);
  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return normalizedSearch ? rows.filter((row) => `${row.nome} ${row.email ?? ''}`.toLocaleLowerCase().includes(normalizedSearch)) : rows;
  }, [rows, search]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!usuarioId || selectedOccurrences.length === 0) throw new Error('Selecione ao menos uma ocorrência.');
      assertOnlineForMutation('Registrar presenças em grupo');
      track('simulation', 'presenca_lote:salvar_submit', { extra: { total_eventos: selectedOccurrences.length } });
      const materialized = await Promise.all(selectedOccurrences.map(async (occurrence) => {
        if (occurrence.id > 0) return occurrence;
        const id = await eventosApi.materializar(occurrence.eventoId, occurrence.dataHora);
        if (!id) throw new Error(`Não foi possível materializar ${occurrence.eventoTitulo}.`);
        return { ...occurrence, id, isVirtual: false };
      }));
      let total = 0;
      for (const occurrence of materialized) {
        if (isReadOnlyOccurrence(occurrence.status)) continue;
        const attendance = rows.flatMap((row) => {
          const key = occurrenceKey(occurrence);
          const cell = row.cells[key];
          if (!cell || !isPersistable(cell.participant)) return [];
          const status = getCellStatus(edits, row.key, key, cell.serverStatus);
          if (!status) return [];
          return [{ participant: cell.participant, status, observacao: observationFor(status) }];
        });
        if (attendance.length === 0) continue;
        if (canStartOccurrence(occurrence.status)) await eventosApi.atualizarOcorrenciaStatus(occurrence.id, { novoStatus: 'EmAndamento', usuarioId });
        for (const block of chunks(attendance, 200)) {
          await presencaService.saveBulk({ eventoId: occurrence.eventoId, ocorrenciaId: occurrence.id, ocorridoEm: occurrence.dataEfetiva || occurrence.dataHora, registradoPor: usuarioId }, block);
          total += block.length;
        }
      }
      return total;
    },
    onSuccess: (total) => {
      setFeedback(total > 0 ? `${total} presença(s) salva(s) com sucesso.` : 'Nenhuma presença nova foi preenchida.');
      track('confirmation', 'presenca_lote:salvar_success', { extra: { total } });
      void queryClient.invalidateQueries({ queryKey: ['presenca-lote'] });
      void queryClient.invalidateQueries({ queryKey: ['jornada'] });
      void queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });

  const moveWeek = (offset: number) => { setStage('selection'); setFeedback(null); setSelectionTouched(false); setSelectedKeys([]); setEdits({}); setWeekStart((current) => startOfWeek(addDays(current, offset * 7))); };
  const toggleOccurrence = (occurrence: OcorrenciaDto) => { const key = occurrenceKey(occurrence); setSelectionTouched(true); setSelectedKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]); };
  const mountMatrix = () => { if (!selectedOccurrences.length) return; setFeedback(null); setStage('matrix'); track('entrance', 'presenca_lote:avancar_para_matriz', { extra: { total_selecionados: selectedOccurrences.length } }); };
  const setCellStatus = (row: MatrixRow, occurrence: OcorrenciaDto, status: AttendanceStatus) => {
    const key = occurrenceKey(occurrence);
    const cell = row.cells[key];
    if (!cell || !isPersistable(cell.participant) || isReadOnlyOccurrence(occurrence.status)) return;
    const cellKey = makeCellKey(row.key, key);
    setEdits((current) => ({ ...current, [cellKey]: getCellStatus(current, row.key, key, cell.serverStatus) === status ? 'CLEAR' : status }));
  };
  const applyStatusToRow = (row: MatrixRow, status: AttendanceStatus) => selectedOccurrences.forEach((occurrence) => setCellStatus(row, occurrence, status));
  const applyStatusToOccurrence = (occurrence: OcorrenciaDto, status: AttendanceStatus) => rows.forEach((row) => setCellStatus(row, occurrence, status));

  if (!scopeEnabled) return <State message="Usuário e estrutura ativa são necessários para carregar a presença." />;
  return <ScrollView style={styles.scroll} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Voltar para meus eventos" style={styles.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/eventos/meus' as Href)}><Ionicons name="arrow-back" size={21} color={colors.textHeading} /></Pressable><View style={styles.headerCopy}><Text style={styles.eyebrow}>EVENTOS</Text><Text style={styles.title}>Presença em Grupo</Text><Text style={styles.subtitle}>Preencha múltiplos eventos em uma única matriz.</Text></View></View>
    <View style={styles.contextCard}><View style={styles.contextTop}><View style={styles.contextCopy}><Text style={styles.contextLabel}>Escopo da matriz</Text><Text style={styles.contextValue}>{anchorTemplate?.titulo ?? 'Todos os elegíveis'}</Text></View><View style={styles.weekNav}><Pressable accessibilityRole="button" accessibilityLabel="Semana anterior" style={styles.roundButton} onPress={() => moveWeek(-1)}><Ionicons name="chevron-back" size={18} color={colors.textSecondary} /></Pressable><Text style={styles.weekLabel}>{formatWeek(weekStart)}</Text><Pressable accessibilityRole="button" accessibilityLabel="Próxima semana" style={styles.roundButton} onPress={() => moveWeek(1)}><Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /></Pressable></View></View>{groupOptions.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRail}><FilterChip label="Todos os grupos" active={selectedGroupId === ALL_GROUPS} onPress={() => { setStage('selection'); setSelectionTouched(false); setSelectedKeys([]); setEdits({}); setSelectedGroupId(ALL_GROUPS); }} />{groupOptions.map(([id, label]) => <FilterChip key={id} label={label} active={selectedGroupId === String(id)} onPress={() => { setStage('selection'); setSelectionTouched(false); setSelectedKeys([]); setEdits({}); setSelectedGroupId(String(id)); }} />)}</ScrollView> : null}</View>
    {occurrenceQuery.isLoading || templatesQuery.isLoading ? <State loading message="Carregando ocorrências..." /> : null}
    {occurrenceQuery.isError ? <State message={normalizeApiError(occurrenceQuery.error, 'Não foi possível carregar as ocorrências.').message} /> : null}
    {!occurrenceQuery.isLoading && !occurrenceQuery.isError && stage === 'selection' ? <SelectionStage occurrences={eligibleOccurrences} selectedKeys={effectiveSelectedKeys} onToggle={toggleOccurrence} onSelectAll={() => { setSelectionTouched(true); setSelectedKeys(effectiveSelectedKeys.length === eligibleOccurrences.length ? [] : eligibleOccurrences.map(occurrenceKey)); }} onClear={() => { setSelectionTouched(true); setSelectedKeys([]); }} onMount={mountMatrix} /> : null}
    {stage === 'matrix' ? <MatrixStage occurrences={selectedOccurrences} rows={visibleRows} allRows={rows} search={search} onSearch={setSearch} getStatus={(row, occurrence) => getCellStatus(edits, row.key, occurrenceKey(occurrence), row.cells[occurrenceKey(occurrence)]?.serverStatus ?? null)} onStatus={setCellStatus} onRowStatus={applyStatusToRow} onOccurrenceStatus={applyStatusToOccurrence} onBack={() => setStage('selection')} onSave={() => { setFeedback(null); saveMutation.mutate(); }} saving={saveMutation.isPending} error={saveMutation.isError ? normalizeApiError(saveMutation.error, 'Não foi possível salvar as presenças.').message : null} /> : null}
    {feedback ? <View style={styles.successBanner}><Ionicons name="checkmark-circle-outline" size={19} color="#047857" /><Text style={styles.successText}>{feedback}</Text></View> : null}
  </ScrollView>;
}

function SelectionStage({ occurrences, selectedKeys, onToggle, onSelectAll, onClear, onMount }: { occurrences: OcorrenciaDto[]; selectedKeys: string[]; onToggle: (occurrence: OcorrenciaDto) => void; onSelectAll: () => void; onClear: () => void; onMount: () => void }) {
  const allSelected = occurrences.length > 0 && selectedKeys.length === occurrences.length;
  return <View style={styles.sectionCard}><View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Ocorrências da semana</Text><Text style={styles.sectionSubtitle}>{selectedKeys.length} selecionada(s)</Text></View><View style={styles.headerActions}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: allSelected }} accessibilityLabel="Selecionar todas as ocorrências" onPress={onSelectAll}><Ionicons name={allSelected ? 'checkbox' : 'square-outline'} size={20} color={allSelected ? colors.brandBlue : colors.textMuted} /><Text style={styles.linkText}>Selecionar todos</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Limpar seleção" onPress={onClear}><Text style={styles.mutedLink}>Limpar</Text></Pressable></View></View>{occurrences.length === 0 ? <State icon="calendar-outline" message="Nenhuma ocorrência elegível nesta semana." /> : <View style={styles.occurrenceList}>{occurrences.map((occurrence) => { const selected = selectedKeys.includes(occurrenceKey(occurrence)); return <Pressable key={occurrenceKey(occurrence)} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} style={[styles.occurrenceOption, selected && styles.occurrenceOptionSelected]} onPress={() => onToggle(occurrence)}><Ionicons name={selected ? 'checkbox' : 'square-outline'} size={23} color={selected ? colors.brandBlue : colors.textMuted} /><View style={styles.occurrenceCopy}><Text numberOfLines={2} style={styles.occurrenceTitle}>{occurrence.eventoTitulo}</Text><Text style={styles.occurrenceMeta}>{formatDateTime(occurrence.dataEfetiva || occurrence.dataHora)} · {occurrence.grupoNome}</Text><View style={styles.occurrenceTags}><StatusTag status={occurrence.status} /><Text style={styles.dateTag}>{occurrence.eventoCicloId ? 'Ciclo atual' : occurrence.recorrente ? 'Recorrente' : 'Único'}</Text></View></View></Pressable>; })}</View>}<Pressable accessibilityRole="button" disabled={selectedKeys.length === 0} style={[styles.primaryButton, selectedKeys.length === 0 && styles.disabledButton]} onPress={onMount}><Ionicons name="grid-outline" size={18} color={colors.surfacePrimary} /><Text style={styles.primaryButtonText}>Montar Matriz</Text></Pressable></View>;
}

function MatrixStage({ occurrences, rows, allRows, search, onSearch, getStatus, onStatus, onRowStatus, onOccurrenceStatus, onBack, onSave, saving, error }: { occurrences: OcorrenciaDto[]; rows: MatrixRow[]; allRows: MatrixRow[]; search: string; onSearch: (value: string) => void; getStatus: (row: MatrixRow, occurrence: OcorrenciaDto) => AttendanceStatus | null; onStatus: (row: MatrixRow, occurrence: OcorrenciaDto, status: AttendanceStatus) => void; onRowStatus: (row: MatrixRow, status: AttendanceStatus) => void; onOccurrenceStatus: (occurrence: OcorrenciaDto, status: AttendanceStatus) => void; onBack: () => void; onSave: () => void; saving: boolean; error: string | null }) {
  return <View style={styles.sectionCard}><View style={styles.matrixToolbar}><Pressable accessibilityRole="button" accessibilityLabel="Alterar seleção" style={styles.secondaryButton} onPress={onBack}><Ionicons name="arrow-back" size={17} color={colors.brandBlue} /><Text style={styles.secondaryButtonText}>Alterar seleção</Text></Pressable><Text style={styles.counter}>{allRows.length} participante(s)</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matrixOccurrenceRail}>{occurrences.map((occurrence) => <View key={occurrenceKey(occurrence)} style={styles.matrixOccurrence}><Text numberOfLines={2} style={styles.matrixOccurrenceTitle}>{occurrence.eventoTitulo}</Text><Text style={styles.matrixOccurrenceDate}>{formatShortDate(occurrence.dataEfetiva || occurrence.dataHora)}</Text><StatusTag status={occurrence.status} /><View style={styles.columnActions}>{STATUS_OPTIONS.map((status) => <Pressable key={status} accessibilityRole="button" accessibilityLabel={`Aplicar ${statusLabel(status)} para todos em ${occurrence.eventoTitulo}`} style={styles.miniAction} onPress={() => onOccurrenceStatus(occurrence, status)}><Text style={statusTextStyle(status)}>{shortStatus(status)}</Text></Pressable>)}</View></View>)}</ScrollView><Text style={styles.matrixSummary}>{allRows.length} participante(s) · {occurrences.length} evento(s) selecionado(s)</Text><View style={styles.searchRow}><Ionicons name="search-outline" size={18} color={colors.textMuted} /><TextInput accessibilityLabel="Buscar participante na matriz" placeholder="Buscar participante" placeholderTextColor={colors.textMuted} value={search} onChangeText={onSearch} style={styles.searchInput} /></View>{rows.length === 0 && !error ? <State loading={occurrences.length > 0} message={occurrences.length > 0 ? 'Carregando participantes...' : 'Nenhuma ocorrência selecionada.'} /> : null}{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<View style={styles.matrixRows}>{rows.map((row) => <View key={row.key} style={styles.matrixRow}><View style={styles.personHeader}><View style={styles.avatar}><Text style={styles.avatarText}>{initials(row.nome)}</Text></View><View style={styles.personCopy}><Text numberOfLines={2} style={styles.personName}>{row.nome}</Text>{row.email ? <Text numberOfLines={1} style={styles.personEmail}>{row.email}</Text> : null}</View><View style={styles.rowActions}>{STATUS_OPTIONS.map((status) => <Pressable key={status} accessibilityRole="button" accessibilityLabel={`Aplicar ${statusLabel(status)} para ${row.nome}`} style={[styles.miniAction, quickStatusStyle(status)]} onPress={() => onRowStatus(row, status)}><Text style={statusTextStyle(status)}>{shortStatus(status)}</Text></Pressable>)}</View></View><View style={styles.cells}>{occurrences.map((occurrence) => { const cell = row.cells[occurrenceKey(occurrence)]; return <View key={occurrenceKey(occurrence)} style={styles.cell}><View style={styles.cellHeading}><Text style={styles.cellEventTitle} numberOfLines={1}>{occurrence.eventoTitulo}</Text><Text style={styles.cellDate}>{formatShortDate(occurrence.dataEfetiva || occurrence.dataHora)}</Text></View>{cell ? <View style={styles.statusButtons}>{STATUS_OPTIONS.map((status) => <StatusButton key={status} status={status} active={getStatus(row, occurrence) === status} disabled={!isPersistable(cell.participant) || isReadOnlyOccurrence(occurrence.status)} onPress={() => onStatus(row, occurrence, status)} />)}</View> : <Text style={styles.notMember}>Não participa</Text>}</View>; })}</View></View>)}</View>{saving ? <View style={styles.savingBar}><ActivityIndicator color={colors.brandBlue} /><Text style={styles.savingText}>Salvando presenças...</Text></View> : <Pressable accessibilityRole="button" disabled={occurrences.length === 0} style={[styles.primaryButton, occurrences.length === 0 && styles.disabledButton]} onPress={onSave}><Ionicons name="checkmark-circle-outline" size={19} color={colors.surfacePrimary} /><Text style={styles.primaryButtonText}>Salvar Presenças em Grupo</Text></Pressable>}</View>;
}

function StatusButton({ status, active, disabled, onPress }: { status: AttendanceStatus; active: boolean; disabled: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityLabel={statusLabel(status)} accessibilityState={{ selected: active, disabled }} disabled={disabled} style={[styles.statusButton, statusButtonStyle(status), active && statusButtonActiveStyle(status), disabled && styles.statusButtonDisabled]} onPress={onPress}><Text style={[styles.statusButtonText, active && styles.statusButtonTextActive]}>{shortStatus(status)}</Text></Pressable>; }
function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}><Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text></Pressable>; }
function StatusTag({ status }: { status: string }) { const normalized = normalizeOccurrenceStatus(status); const tone = normalized === 'REALIZADA' ? 'green' : normalized === 'CANCELADA' ? 'red' : normalized === 'EM_ANDAMENTO' ? 'blue' : 'amber'; return <View style={[styles.statusTag, tone === 'green' ? styles.statusTagGreen : tone === 'red' ? styles.statusTagRed : tone === 'blue' ? styles.statusTagBlue : styles.statusTagAmber]}><View style={[styles.statusDot, tone === 'green' ? styles.dotGreen : tone === 'red' ? styles.dotRed : tone === 'blue' ? styles.dotBlue : styles.dotAmber]} /><Text style={styles.statusTagText}>{occurrenceStatusLabel(normalized)}</Text></View>; }
function State({ message, loading = false, icon = 'cloud-offline-outline' }: { message: string; loading?: boolean; icon?: keyof typeof Ionicons.glyphMap }) { return <View style={styles.state}>{loading ? <ActivityIndicator color={colors.brandBlue} /> : <Ionicons name={icon} size={26} color={colors.textMuted} />}<Text style={styles.stateText}>{message}</Text></View>; }

function buildRows(results: MatrixResponse[]): MatrixRow[] { const map = new Map<string, MatrixRow>(); results.forEach(({ occurrence, participants }) => participants.forEach((participant) => { const key = participantIdentity(participant); const current = map.get(key) ?? { key, nome: participant.nomeExibicao || participant.nome, email: participant.email ?? null, cells: {} }; current.email = current.email || participant.email || null; current.cells[occurrenceKey(occurrence)] = { participant, serverStatus: normalizeAttendanceStatus(participant.status) }; map.set(key, current); })); return [...map.values()].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR')); }
function participantIdentity(participant: Participante) { if (participant.usuarioId) return `usuario:${participant.usuarioId}`; if (participant.usuarioVirtualId) return `virtual:${participant.usuarioVirtualId}`; if (participant.email) return `email:${participant.email.trim().toLowerCase()}`; return `participant:${participant.id}`; }
function getCellStatus(edits: Record<string, CellEdit>, rowKey: string, occurrenceKeyValue: string, fallback: AttendanceStatus | null): AttendanceStatus | null { const key = makeCellKey(rowKey, occurrenceKeyValue); if (!Object.prototype.hasOwnProperty.call(edits, key)) return fallback; return edits[key] === 'CLEAR' ? null : edits[key]; }
function isPersistable(participant: Participante) { return Boolean(participant.isVirtual ? participant.usuarioVirtualId : participant.usuarioId); }
function normalizeAttendanceStatus(value: string | null | undefined): AttendanceStatus | null { const normalized = (value ?? '').toUpperCase().replaceAll(' ', '_'); return STATUS_OPTIONS.includes(normalized as AttendanceStatus) ? normalized as AttendanceStatus : null; }
function normalizeOccurrenceStatus(value: string | null | undefined) { return (value ?? '').toUpperCase().replaceAll(' ', '_').replaceAll('Á', 'A'); }
function isReadOnlyOccurrence(status: string) { return ['REALIZADA', 'CONCLUIDO', 'CANCELADA', 'CANCELADO'].includes(normalizeOccurrenceStatus(status)); }
function canStartOccurrence(status: string) { return ['AGENDADA', 'REAGENDADA'].includes(normalizeOccurrenceStatus(status)); }
function observationFor(status: AttendanceStatus) { if (status === 'JUSTIFICADO') return 'Ausência justificada em preenchimento em grupo'; if (status === 'AUSENTE') return 'Ausência registrada em preenchimento em grupo'; return 'Presença registrada em preenchimento em grupo'; }
function occurrenceKey(occurrence: OcorrenciaDto) { return `${occurrence.eventoId}:${(occurrence.dataEfetiva || occurrence.dataHora).slice(0, 19)}`; }
function makeCellKey(rowKey: string, occurrenceKeyValue: string) { return `${rowKey}::${occurrenceKeyValue}`; }
function chunks<T>(items: T[], size: number) { const result: T[][] = []; for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size)); return result; }
function statusLabel(status: AttendanceStatus) { return status === 'PRESENTE' ? 'Presente' : status === 'AUSENTE' ? 'Ausente' : 'Justificado'; }
function shortStatus(status: AttendanceStatus) { return status === 'PRESENTE' ? 'P' : status === 'AUSENTE' ? 'A' : 'J'; }
function statusTextStyle(status: AttendanceStatus) { return status === 'PRESENTE' ? styles.statusPresent : status === 'AUSENTE' ? styles.statusAbsent : styles.statusJustified; }
function statusButtonStyle(status: AttendanceStatus) { return status === 'PRESENTE' ? styles.statusButtonPresent : status === 'AUSENTE' ? styles.statusButtonAbsent : styles.statusButtonJustified; }
function statusButtonActiveStyle(status: AttendanceStatus) { return status === 'PRESENTE' ? styles.statusButtonPresentActive : status === 'AUSENTE' ? styles.statusButtonAbsentActive : styles.statusButtonJustifiedActive; }
function quickStatusStyle(status: AttendanceStatus) { return status === 'PRESENTE' ? styles.quickPresent : status === 'AUSENTE' ? styles.quickAbsent : styles.quickJustified; }
function occurrenceStatusLabel(status: string) { return ({ AGENDADA: 'Agendada', REAGENDADA: 'Reagendada', EM_ANDAMENTO: 'Em andamento', REALIZADA: 'Realizada', CANCELADA: 'Cancelada', CONCLUIDO: 'Concluída' } as Record<string, string>)[status] ?? 'Disponível'; }
function parseDate(value: string | string[] | undefined) { const raw = Array.isArray(value) ? value[0] : value; if (!raw) return null; const date = new Date(raw.length === 10 ? `${raw}T12:00:00` : raw); return Number.isNaN(date.getTime()) ? null : date; }
function toPositiveInt(value: string | string[] | undefined) { const raw = Array.isArray(value) ? value[0] : value; const number = Number(raw); return Number.isInteger(number) && number > 0 ? number : null; }
function startOfWeek(value: Date) { const date = new Date(value); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); return date; }
function endOfDay(value: Date) { const date = new Date(value); date.setHours(23, 59, 59, 999); return date; }
function addDays(value: Date, days: number) { const date = new Date(value); date.setDate(date.getDate() + days); return date; }
function formatDay(value: Date) { return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`; }
function formatWeek(value: Date) { return `${value.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} até ${addDays(value, 6).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`; }
function formatDateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Data não informada' : date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
function formatShortDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '--/--' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); }
function initials(value: string) { const parts = value.trim().split(/\s+/).filter(Boolean); return (parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2) ?? '?').toUpperCase(); }

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surfacePage }, page: { width: '100%', maxWidth: 1100, alignSelf: 'center', gap: spacing.md, padding: spacing.md, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.xs }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary }, headerCopy: { flex: 1, minWidth: 0, gap: 3 }, eyebrow: { ...typography.caption, color: colors.brandBlue, fontWeight: '800', letterSpacing: 1 }, title: { ...typography.h1, fontSize: 25, lineHeight: 31, color: colors.textHeading }, subtitle: { ...typography.bodySmall, color: colors.textSecondary },
  contextCard: { gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.md }, contextTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }, contextCopy: { flex: 1, minWidth: 180, gap: 3 }, contextLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }, contextValue: { ...typography.body, color: colors.textHeading, fontWeight: '800' }, weekNav: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, roundButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full, backgroundColor: colors.surfacePrimary }, weekLabel: { ...typography.bodySmall, minWidth: 140, textAlign: 'center', color: colors.textHeading, fontWeight: '800' }, chipRail: { gap: spacing.sm, paddingVertical: 1 }, filterChip: { minHeight: 36, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full, paddingHorizontal: 13, backgroundColor: colors.surfacePrimary }, filterChipActive: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue }, filterChipText: { ...typography.caption, color: colors.textBody, fontWeight: '700' }, filterChipTextActive: { color: colors.surfacePrimary },
  sectionCard: { gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.md }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }, sectionTitle: { ...typography.h3, fontSize: 19, lineHeight: 25, color: colors.textHeading }, sectionSubtitle: { ...typography.caption, color: colors.textSecondary }, headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, linkText: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '800' }, mutedLink: { ...typography.bodySmall, color: colors.textMuted, fontWeight: '700' }, occurrenceList: { gap: spacing.sm }, occurrenceOption: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, padding: spacing.md, backgroundColor: colors.surfacePrimary }, occurrenceOptionSelected: { borderColor: '#93C5FD', backgroundColor: '#EFF6FF' }, occurrenceCopy: { flex: 1, minWidth: 0, gap: 4 }, occurrenceTitle: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' }, occurrenceMeta: { ...typography.caption, color: colors.textSecondary }, occurrenceTags: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, dateTag: { ...typography.caption, color: colors.textMuted }, primaryButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.brandBlue, paddingHorizontal: spacing.md }, primaryButtonText: { ...typography.bodySmall, color: colors.surfacePrimary, fontWeight: '800' }, disabledButton: { opacity: 0.45 },
  matrixToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, secondaryButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.sm, paddingHorizontal: 11, backgroundColor: '#EFF6FF' }, secondaryButtonText: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' }, counter: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '700' }, matrixOccurrenceRail: { gap: spacing.sm, paddingVertical: 2 }, matrixOccurrence: { width: 172, gap: 5, borderLeftWidth: 3, borderLeftColor: colors.brandBlue, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, padding: spacing.sm, backgroundColor: '#F8FBFF' }, matrixOccurrenceTitle: { ...typography.caption, color: colors.textHeading, fontWeight: '800' }, matrixOccurrenceDate: { ...typography.caption, color: colors.textSecondary }, columnActions: { flexDirection: 'row', gap: 4, marginTop: 2 }, miniAction: { minWidth: 26, height: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: 6, backgroundColor: colors.surfacePrimary }, quickPresent: { borderColor: '#86EFAC', backgroundColor: '#F0FDF4' }, quickAbsent: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }, quickJustified: { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' }, matrixHint: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: radius.sm, backgroundColor: '#EFF6FF', padding: spacing.sm }, matrixHintText: { flex: 1, ...typography.caption, color: colors.textSecondary }, matrixSummary: { ...typography.caption, color: colors.textMuted, paddingVertical: spacing.xs }, searchRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: 12, backgroundColor: colors.surfacePage }, searchInput: { flex: 1, minWidth: 0, height: 42, color: colors.textBody, fontSize: 15 }, matrixRows: { gap: spacing.sm }, matrixRow: { overflow: 'hidden', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary }, personHeader: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm }, avatar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.brandBlue }, avatarText: { ...typography.bodySmall, color: colors.surfacePrimary, fontWeight: '800' }, personCopy: { flex: 1, minWidth: 0, gap: 2 }, personName: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' }, personEmail: { ...typography.caption, color: colors.textMuted }, rowActions: { flexDirection: 'row', gap: 4 }, cells: { gap: spacing.sm, borderTopWidth: 1, borderColor: colors.borderSubtle, backgroundColor: '#FBFDFF', padding: spacing.sm }, cell: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, padding: spacing.sm, backgroundColor: colors.surfacePrimary }, cellHeading: { flex: 1, minWidth: 0, gap: 2 }, cellEventTitle: { ...typography.caption, color: colors.textHeading, fontWeight: '800' }, cellDate: { ...typography.caption, color: colors.textSecondary }, statusButtons: { flexDirection: 'row', gap: 5 }, statusButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary }, statusButtonPresent: { borderColor: '#A7F3D0' }, statusButtonAbsent: { borderColor: '#FECACA' }, statusButtonJustified: { borderColor: '#FDE68A' }, statusButtonPresentActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' }, statusButtonAbsentActive: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' }, statusButtonJustifiedActive: { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' }, statusButtonActive: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue }, statusButtonDisabled: { opacity: 0.4 }, statusButtonText: { ...typography.caption, fontWeight: '800' }, statusButtonTextActive: { color: colors.textHeading }, statusPresent: { color: '#047857', fontWeight: '800' }, statusAbsent: { color: colors.error, fontWeight: '800' }, statusJustified: { color: '#B45309', fontWeight: '800' }, notMember: { ...typography.caption, color: colors.textMuted, fontStyle: 'italic' },
  statusTag: { minHeight: 22, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 7 }, statusTagGreen: { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }, statusTagRed: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }, statusTagBlue: { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }, statusTagAmber: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }, statusDot: { width: 6, height: 6, borderRadius: radius.full }, dotGreen: { backgroundColor: '#059669' }, dotRed: { backgroundColor: colors.error }, dotBlue: { backgroundColor: colors.brandBlue }, dotAmber: { backgroundColor: '#D97706' }, statusTagText: { ...typography.caption, color: colors.textBody, fontWeight: '700' }, state: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg }, stateText: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' }, error: { ...typography.bodySmall, color: colors.error, paddingHorizontal: spacing.sm }, savingBar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, savingText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '700' }, successBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: '#A7F3D0', borderRadius: radius.sm, backgroundColor: '#ECFDF5', padding: spacing.md }, successText: { flex: 1, ...typography.bodySmall, color: '#047857', fontWeight: '700' },
});
