import { Fragment, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { colors, radius, typography } from '../../../shared/design/tokens';
import { useContextStore } from '../../../stores/context.store';
import { normalizeApiError } from '../../../services/api/api-error';
import { participantesEventoApi, type Participante, type ParticipationScope } from '../../../services/api/participantes-evento-api';
import { track } from '../../../services/analytics/analytics.service';
import { secureStorage } from '../../../services/platform/secure-storage';
import { useAcompanhamento } from './useAcompanhamento';
import type { AcompanhamentoAction } from './acompanhamento.service';
import { usePresenca } from '../presenca/usePresenca';
import { statusLabel } from '../presenca/presenca.rules';
import type { AttendanceStatus } from '../../../services/api/participacoes-evento-api';
import { gruposApi } from '../../../services/api/grupos-api';
import { EventoEditModal, type EventoEditValues } from './EventoEditModal';
import { AdicionarParticipantePanel } from './AdicionarParticipantePanel';
import { EditarParticipantePanel } from './EditarParticipantePanel';

type PanelAction = AcompanhamentoAction['kind'] | 'attendance';
const actionLabels: Record<PanelAction, string> = { iniciar: 'Iniciar ocorrencia', cancelar: 'Cancelar ocorrencia', reabrir: 'Reabrir ocorrencia', descancelar: 'Restaurar ocorrencia', confirmar: 'Confirmar responsavel', finalizar: 'Finalizar ocorrencia', adicionar: 'Adicionar participante', adicionar_virtual: 'Adicionar participante', remover: 'Remover participante', attendance: 'Salvar presenca' };

export function AcompanhamentoScreen() {
  const params = useLocalSearchParams<{ id: string; data?: string }>();
  const { usuarioId, estruturaId, grupoId } = useContextStore();
  return <AcompanhamentoContent key={`${usuarioId}:${estruturaId}:${grupoId}:${params.id}:${params.data}`} eventoId={Number(params.id)} day={params.data} />;
}

function AcompanhamentoContent({ eventoId, day }: { eventoId: number; day?: string }) {
  const state = useAcompanhamento(eventoId, day);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compactParticipantRows = width < 768 || Platform.OS !== 'web';
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState<PanelAction | null>(null);
  const [target, setTarget] = useState<Participante | null>(null);
  const [scope, setScope] = useState<ParticipationScope>('somente_ocorrencia');
  const [motivo, setMotivo] = useState('');
  const [showCandidates, setShowCandidates] = useState(false);
  const submitLock = useRef(false);
  const data = state.query.data;
  const presenca = usePresenca(data, state.queryKey, state.scope.usuarioId, state.scope.estruturaId);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [attendanceTargets, setAttendanceTargets] = useState<Participante[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>('PRESENTE');
  const [attendanceError, setAttendanceError] = useState('');
  const [pendingPolicy, setPendingPolicy] = useState<'ausente' | 'pendente'>('pendente');
  const [finalizationNotes, setFinalizationNotes] = useState('');
  const [sendSummary, setSendSummary] = useState(true);
  const [sendReminder, setSendReminder] = useState(false);
  const [editingEvento, setEditingEvento] = useState(false);
  const [openParticipantMenuId, setOpenParticipantMenuId] = useState<number | null>(null);
  const [openObservationId, setOpenObservationId] = useState<number | null>(null);
  const [observationDrafts, setObservationDrafts] = useState<Record<number, string>>({});
  const [savingObservationId, setSavingObservationId] = useState<number | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participante | null>(null);
  const [participantEditPending, setParticipantEditPending] = useState(false);
  const [participantEditError, setParticipantEditError] = useState<string | null>(null);
  const absenceReasonStorageKey = `attendance.absence-reasons:${state.scope.usuarioId}:${state.scope.estruturaId}`;
  const [storedAbsenceReasons, setStoredAbsenceReasons] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    void secureStorage.getItem(absenceReasonStorageKey).then((value) => {
      if (!active || !value) return;
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) setStoredAbsenceReasons(parsed.filter((reason): reason is string => typeof reason === 'string'));
      } catch { /* Ignore invalid local history. */ }
    });
    return () => { active = false; };
  }, [absenceReasonStorageKey]);
  const candidates = useQuery({
    queryKey: ['participantes-merge-candidatos', state.scope, eventoId, data?.ocorrencia.id],
    queryFn: () => participantesEventoApi.candidatos(eventoId, data!.ocorrencia.id > 0 ? data!.ocorrencia.id : null, state.scope.usuarioId),
    enabled: showCandidates && state.manage && !!data,
  });
  const grupos = useQuery({
    queryKey: ['evento-edicao-grupos', state.scope.estruturaId],
    queryFn: async () => (await gruposApi.list(state.scope.estruturaId, 0, 200)).data,
    enabled: Boolean(state.manage && data),
  });
  const openPanel = (action: PanelAction, participante?: Participante) => {
    state.mutation.reset(); presenca.mutation.reset(); setPanel(action); setTarget(participante ?? null); setMotivo(''); setFinalizationNotes(''); setPendingPolicy('pendente'); setSendSummary(true); setSendReminder(false); setScope('somente_ocorrencia');
    track('entrance', `acompanhar_evento:${action}_abrir`);
  };
  const needsReason = panel === 'cancelar' || panel === 'remover' || panel === 'reabrir' || panel === 'descancelar'
    || (panel === 'attendance' && (attendanceStatus === 'JUSTIFICADO' || attendanceStatus === 'AUSENTE'));
  const recentAbsenceReasons = Array.from(new Set([
    ...storedAbsenceReasons,
    ...(data?.participantes ?? []).map((participant) => participant.observacao?.trim()).filter((reason): reason is string => Boolean(reason)),
  ])).slice(0, 8);
  const selected = data?.participantes.filter((participant) => selectedParticipants.includes(participant.id)) ?? [];
  const toggleParticipantSelection = (id: number) => setSelectedParticipants((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const participantObservation = (participant: Participante) => observationDrafts[participant.id] ?? participant.observacao ?? '';
  const openObservation = (participant: Participante) => {
    setOpenParticipantMenuId(null);
    setObservationDrafts((current) => ({ ...current, [participant.id]: participantObservation(participant) }));
    setOpenObservationId((current) => current === participant.id ? null : participant.id);
    track('entrance', 'acompanhar_evento:abrir_observacao_participante');
  };
  const saveObservation = async (participant: Participante) => {
    const observation = participantObservation(participant).trim();
    const currentStatus = participant.status?.toUpperCase();
    setOpenObservationId(null);
    if (!['PRESENTE', 'AUSENTE', 'JUSTIFICADO'].includes(currentStatus ?? '')) return;
    setSavingObservationId(participant.id);
    try {
      await presenca.mutation.mutateAsync({ mode: 'single', participant, status: currentStatus as AttendanceStatus, observacao: observation });
    } catch {
      setAttendanceError('Nao foi possivel salvar a observacao do participante.');
    } finally {
      setSavingObservationId(null);
    }
  };
  const openAttendance = (targets: Participante[], status: AttendanceStatus) => {
    setAttendanceTargets(targets); setAttendanceStatus(status); setAttendanceError(''); setMotivo(targets.length === 1 ? participantObservation(targets[0]) : ''); setPanel('attendance');
    track('entrance', 'acompanhar_evento:justificativa_modal');
  };
  const runAttendance = async (targets: Participante[], status: AttendanceStatus, observacao = '') => {
    setAttendanceError('');
    try {
      const normalizedReason = observacao.trim();
      if (normalizedReason && (status === 'AUSENTE' || status === 'JUSTIFICADO')) {
        const nextReasons = [normalizedReason, ...storedAbsenceReasons.filter((reason) => reason !== normalizedReason)].slice(0, 8);
        setStoredAbsenceReasons(nextReasons);
        void secureStorage.setItem(absenceReasonStorageKey, JSON.stringify(nextReasons));
      }
      if (targets.length === 1) await presenca.mutation.mutateAsync({ mode: 'single', participant: targets[0], status, observacao });
      else await presenca.mutation.mutateAsync({ mode: 'bulk', items: targets.map((participant) => ({ participant, status, observacao })) });
      setSelectedParticipants([]); setSelectionMode(false); setPanel(null);
    } catch (error) {
      setAttendanceError(error instanceof Error && error.name === 'OfflineMutationBlockedError'
        ? 'Sem conexao. O registro de presenca fica bloqueado enquanto estiver offline.'
        : normalizeApiError(error, 'Nao foi possivel salvar presencas.').message);
    }
  };
  const startForRegistration = async () => {
    if (submitLock.current) return;
    submitLock.current = true;
    try { await state.mutation.mutateAsync({ kind: 'iniciar', motivo: '' }); }
    catch { /* Hook exposes the operational error. */ }
    finally { submitLock.current = false; }
  };
  const applyAttendance = (targets: Participante[], status: AttendanceStatus) => {
    if (!targets.length) { setAttendanceError('Selecione ao menos um participante.'); return; }
    const requiresReason = status === 'JUSTIFICADO' || status === 'AUSENTE';
    if (requiresReason) openAttendance(targets, status);
    else void runAttendance(targets, status, targets.length === 1 ? participantObservation(targets[0]) : '');
  };
  const saveParticipant = async (participant: Participante, values: { nome: string; email: string | null; telefone: string | null; dataNascimento: string | null; papelIds: number[]; papelPrincipalId: number | null }) => {
    setParticipantEditPending(true);
    setParticipantEditError(null);
    try {
      if (participant.isVirtual) await participantesEventoApi.updateVirtual(participant, values);
      else await participantesEventoApi.update(eventoId, participant, { nome: values.nome, dataNascimento: values.dataNascimento });
      await participantesEventoApi.setRoles(state.scope.estruturaId, participant, values.papelIds, values.papelPrincipalId, data?.ocorrencia.dataHora);
      await state.query.refetch();
      setEditingParticipant(null);
    } catch (error) {
      setParticipantEditError(normalizeApiError(error, 'Nao foi possivel editar o participante.').message);
    } finally {
      setParticipantEditPending(false);
    }
  };
  const save = async () => {
    if (!panel || submitLock.current || (needsReason && !motivo.trim())) return;
    if (panel === 'attendance') {
      submitLock.current = true;
      try { await runAttendance(attendanceTargets, attendanceStatus, motivo); }
      finally { submitLock.current = false; }
      return;
    }
    let action: AcompanhamentoAction;
    if (panel === 'adicionar') return;
    if (panel === 'remover') { if (!target) return; action = { kind: panel, pessoa: target, escopo: scope, motivo }; }
    else if (panel === 'finalizar') {
      const pending = data?.participantes.filter((participant) => !participant.status || ['PENDENTE', 'NAO_RESPONDEU'].includes(participant.status.toUpperCase())) ?? [];
      submitLock.current = true;
      try {
        if (pendingPolicy === 'ausente' && pending.length) {
          await presenca.mutation.mutateAsync({ mode: 'bulk', items: pending.map((participant) => ({ participant, status: 'AUSENTE' as const, observacao: 'Marcado como ausente na finalizacao.' })) });
        }
        action = { kind: panel, pendentes: pendingPolicy, observacoes: finalizationNotes.trim() || null, enviarResumo: sendSummary, enviarLembrete: sendReminder };
        await state.mutation.mutateAsync(action);
        setPanel(null);
      } catch { /* Hooks expose the operational error inside the dialog. */ }
      finally { submitLock.current = false; }
      return;
    }
    else if (panel === 'iniciar' || panel === 'cancelar' || panel === 'reabrir' || panel === 'descancelar' || panel === 'confirmar') action = { kind: panel, motivo };
    else return;
    submitLock.current = true;
    try { await state.mutation.mutateAsync(action); setPanel(null); }
    catch { /* Hook exposes the API error inside the dialog. */ }
    finally { submitLock.current = false; }
  };

  const currentStatus = data?.ocorrencia.status ?? 'Agendada';
  const counts = data ? countAttendance(data.participantes) : { total: 0, presentes: 0, ausentes: 0, pendentes: 0, justificados: 0 };
  const progress = counts.total ? Math.round(((counts.presentes + counts.ausentes + counts.justificados) / counts.total) * 100) : 0;
  const visibleParticipants = data?.participantes.filter((participant) => (participant.nomeExibicao || participant.nome).toLowerCase().includes(search.toLowerCase())).sort((a, b) => (a.funcao || 'Participante').localeCompare(b.funcao || 'Participante', 'pt-BR')) ?? [];
  const dateLabel = data ? formatDateLabel(data.ocorrencia.dataHora) : '';
  const saveEvento = (values: EventoEditValues) => {
    if (!data) return;
    const start = `${values.dataInicio.trim()}T${values.horaInicio.trim()}:00`;
    const request = {
      titulo: values.titulo.trim(), descricao: values.descricao.trim(), grupoId: values.grupoId,
      dataInicio: start, dataFim: values.dataFim.trim() || null, local: values.local.trim() || null,
      cep: values.cep.trim() || null, logradouro: values.logradouro.trim() || null, numero: values.numero.trim() || null,
      complemento: values.complemento.trim() || null, bairro: values.bairro.trim() || null, cidade: values.cidade.trim() || null,
      estado: values.estado.trim().toUpperCase() || null, recorrente: data.evento.recorrente,
      diasSemanais: data.evento.recorrente ? data.evento.diasSemanais : null,
      consolidacaoPermanente: values.consolidacaoPermanente, dataLimiteAjuste: values.dataLimiteAjuste.trim() ? `${values.dataLimiteAjuste.trim()}T00:00:00` : null,
      permitirReabertura: values.permitirReabertura, permitirPresencaAgrupada: values.permitirPresencaAgrupada,
      chaveAgrupamentoPresenca: values.permitirPresencaAgrupada ? data.evento.chaveAgrupamentoPresenca : null,
    };
    state.editMutation.mutate(request, { onSuccess: () => setEditingEvento(false) });
  };
  const openGroupAttendance = () => {
    if (!data) return;
    track('entrance', 'acompanhar_evento:presenca_em_grupo');
    const params = new URLSearchParams({ eventoId: String(data.evento.id), data: data.ocorrencia.dataHora, grupoId: String(data.evento.grupoId) });
    if (data.ocorrencia.id > 0) params.set('ocorrenciaId', String(data.ocorrencia.id));
    router.push(`/admin/eventos/presenca-lote?${params.toString()}` as Href);
  };

  return <ScrollView style={styles.scroll} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.eventToolbar}>
      <Action label="Voltar para meus eventos" icon="arrow-back-outline" iconOnly variant="icon" onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/admin/eventos/meus' as Href); }} />
      <Text numberOfLines={1} style={styles.eventToolbarTitle}>{data?.evento.titulo ?? 'Acompanhamento'}</Text>
      <View style={styles.eventToolbarActions}>
        {state.manage && <Action label="Editar evento" icon="create-outline" iconOnly variant="icon" onPress={() => { setEditingEvento(true); track('entrance', 'acompanhar_evento:editar_abrir'); }} />}
        {state.actions?.confirmar && <Action label="Confirmar responsavel" icon="people-outline" iconOnly variant="icon" onPress={() => openPanel('confirmar')} />}
        {state.actions?.cancelar && <Action label="Cancelar ocorrencia" icon="trash-outline" iconOnly variant="danger" onPress={() => openPanel('cancelar')} />}
      </View>
    </View>
    {state.query.isLoading && <View style={styles.loading}><ActivityIndicator color={colors.brandBlue} accessibilityLabel="Carregando acompanhamento" /></View>}
    {state.query.isError && <View style={styles.stateSection}>
      <Text accessibilityRole="alert" style={styles.error}>{normalizeApiError(state.query.error, 'Nao foi possivel carregar o evento.').message}</Text>
      <Action label="Tentar novamente" icon="refresh-outline" variant="secondary" onPress={() => void state.query.refetch()} />
    </View>}
    {data && <>
      <View style={styles.eventHero}>
        <Text style={styles.eyebrow}>{data.evento.recorrente ? 'EVENTO RECORRENTE' : 'EVENTO'}</Text>
        <Text style={styles.title}>{data.evento.titulo}</Text>
        <View style={styles.chipRail}>
          <InfoChip icon="time-outline" label={formatTime(data.ocorrencia.dataHora)} tone="blue" />
          <InfoChip icon="calendar-outline" label={dateLabel} tone="neutral" />
          <InfoChip icon="location-outline" label={data.evento.local || data.ocorrencia.local || 'Local nao informado'} tone="green" />
          {data.evento.recorrente && <InfoChip icon="repeat-outline" label="Recorrente" tone="blue" />}
        </View>
        <Text style={styles.responsible}>Responsavel: {data.ocorrencia.responsavelNome || data.evento.responsavelAtualNome || data.evento.responsavelPrincipalNome || 'Nao informado'}</Text>
        {!!data.ocorrencia.motivoCancelamento && <Text style={styles.cancelReason}>Motivo: {data.ocorrencia.motivoCancelamento}</Text>}
      </View>

      <View style={styles.occurrenceRail}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dia anterior" style={styles.roundControl} onPress={() => navigateDate(router, eventoId, data.data, -1)}><Ionicons name="chevron-back" size={18} color={colors.textSecondary} /></Pressable>
        <View style={styles.occurrenceHeading}><Text style={styles.monthLabel}>{formatMonthLabel(data.ocorrencia.dataHora)}</Text><Text style={styles.occurrenceDate}>{dateLabel}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Proximo dia" style={styles.roundControl} onPress={() => navigateDate(router, eventoId, data.data, 1)}><Ionicons name="chevron-forward" size={18} color={colors.textSecondary} /></Pressable>
      </View>

      <View style={styles.statusRail}>
        <StatusBadge status={currentStatus} virtual={data.ocorrencia.isVirtual} />
        <View style={[styles.statusActions, compactParticipantRows ? styles.statusActionsCompact : null]}>
          {data.evento.permitirPresencaAgrupada && <Action label="Preencher em Grupo" icon="grid-outline" iconOnly={compactParticipantRows} variant="secondary" onPress={openGroupAttendance} />}
          {state.actions?.iniciar && <Action label={data.ocorrencia.isVirtual ? 'Abrir para Registro' : 'Iniciar evento'} icon="play-outline" iconOnly={compactParticipantRows} variant="primary" onPress={() => data.ocorrencia.isVirtual ? void startForRegistration() : openPanel('iniciar')} />}
          {state.actions?.finalizar && <Action label="Finalizar" icon="checkmark-circle-outline" iconOnly={compactParticipantRows} variant="primary" onPress={() => openPanel('finalizar')} />}
          {state.actions?.reabrir && <Action label="Reabrir" icon="refresh-outline" iconOnly={compactParticipantRows} variant="primary" onPress={() => openPanel('reabrir')} />}
          {state.actions?.descancelar && <Action label="Restaurar ocorrencia" icon="refresh-outline" iconOnly={compactParticipantRows} variant="primary" onPress={() => openPanel('descancelar')} />}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Total" value={counts.total} icon="people-outline" tone="blue" />
        <StatCard label="Presentes" value={counts.presentes} icon="checkmark-outline" tone="green" />
        <StatCard label="Ausentes" value={counts.ausentes} icon="close-outline" tone="red" />
        <StatCard label="Pendentes" value={counts.pendentes} icon="time-outline" tone="amber" />
      </View>

      <View style={styles.participantSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}><Text style={styles.heading}>Participantes</Text><View style={styles.countBadge}><Text style={styles.countBadgeText}>{counts.total}</Text></View></View>
          <View style={styles.sectionActions}>
            {state.actions?.participantes && <Action label="Adicionar participante" icon="add-outline" iconOnly variant="icon" onPress={() => openPanel('adicionar')} />}
          </View>
        </View>
        <View style={styles.filterRail}>
          <FilterChip label="Todos" count={counts.total} active />
          <FilterChip label="Pendentes" count={counts.pendentes} />
          <FilterChip label="Presentes" count={counts.presentes} tone="green" />
          <FilterChip label="Ausentes" count={counts.ausentes} tone="red" />
          <FilterChip label="Justif." count={counts.justificados} />
        </View>
        <View style={styles.searchRow}><Ionicons name="search-outline" size={18} color={colors.textMuted} /><TextInput accessibilityLabel="Buscar participante" value={search} onChangeText={setSearch} placeholder="Buscar participante" placeholderTextColor={colors.textMuted} style={styles.searchInput} /></View>
        {state.actions?.participantes && selectionMode && <View style={[styles.bulkBar, compactParticipantRows && styles.bulkBarCompact]}>
          <Text style={styles.secondary}>{selected.length ? `${selected.length} selecionado(s)` : 'Selecione pessoas para registrar em lote'}</Text>
          <View style={[styles.bulkActions, compactParticipantRows && styles.bulkActionsCompact]}>
            <Action label="Marcar selecionados como presentes" icon="checkmark-outline" iconOnly variant="success" disabled={!selected.length || presenca.mutation.isPending} onPress={() => applyAttendance(selected, 'PRESENTE')} />
            <Action label="Marcar selecionados como ausentes" icon="close-outline" iconOnly variant="danger" disabled={!selected.length || presenca.mutation.isPending} onPress={() => applyAttendance(selected, 'AUSENTE')} />
            <Action label="Marcar selecionados como justificados" icon="document-text-outline" iconOnly variant="secondary" disabled={!selected.length || presenca.mutation.isPending} onPress={() => applyAttendance(selected, 'JUSTIFICADO')} />
          </View>
        </View>}
        {!!attendanceError && <Text accessibilityRole="alert" style={styles.error}>{attendanceError}</Text>}
        {!data.participantes.length && <View style={styles.emptyState}><Ionicons name="people-outline" size={28} color={colors.textMuted} /><Text style={styles.label}>Nenhum participante nesta ocorrencia.</Text></View>}
        {openParticipantMenuId !== null && <Pressable accessibilityLabel="Fechar menu de acoes" style={styles.participantMenuOverlay} onPress={() => setOpenParticipantMenuId(null)} />}
        <View style={styles.participantList}>{visibleParticipants.map((p, index) => <Fragment key={`${p.isVirtual}:${p.usuarioId ?? p.usuarioVirtualId}:${p.id}`}>
          {(index === 0 || (visibleParticipants[index - 1].funcao || 'Participante') !== (p.funcao || 'Participante')) ? <View style={{ backgroundColor: colors.surfaceMuted, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSubtle, paddingHorizontal: 16, paddingVertical: 7 }}><Text style={{ ...typography.caption, color: colors.textSecondary, fontWeight: '800' }}>{p.funcao || 'Participante'}</Text></View> : null}
          <View key={`${p.isVirtual}:${p.usuarioId ?? p.usuarioVirtualId}:${p.id}`} style={[styles.participantRow, compactParticipantRows && styles.participantRowCompact, selectedParticipants.includes(p.id) ? { backgroundColor: '#F8FBFF' } : null]}>
            <Pressable accessibilityRole={selectionMode ? 'checkbox' : 'button'} accessibilityLabel={selectionMode ? `Selecionar ${p.nomeExibicao || p.nome}` : `Segure para selecionar ${p.nomeExibicao || p.nome}`} accessibilityState={selectionMode ? { checked: selectedParticipants.includes(p.id) } : undefined} onPress={() => selectionMode && toggleParticipantSelection(p.id)} onLongPress={() => { if (state.actions?.participantes) { setSelectionMode(true); toggleParticipantSelection(p.id); } }} delayLongPress={350} style={[styles.participantIdentity, compactParticipantRows && styles.participantIdentityCompact]}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{(p.nomeExibicao || p.nome).charAt(0).toUpperCase()}</Text></View>
              <View style={styles.personInfo}><Text numberOfLines={1} ellipsizeMode="tail" style={styles.personName}>{p.nomeExibicao || p.nome}</Text><View style={styles.personMeta}><Text numberOfLines={1} ellipsizeMode="tail" style={styles.roleText}>{p.funcao || 'Participante'}</Text><Text style={styles.dot}>·</Text><Text numberOfLines={1} ellipsizeMode="tail" style={statusToneStyle(p.status)}>{statusLabel(p.status)}</Text></View>{p.email ? <Text numberOfLines={1} ellipsizeMode="tail" style={styles.email}>{p.email}</Text> : null}</View>
            </Pressable>
            {state.actions?.participantes && compactParticipantRows ? <View style={[styles.participantActions, styles.participantActionsCompact]}>
              <View style={styles.participantMenuWrap}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Mais acoes de ${p.nomeExibicao || p.nome}`} accessibilityState={{ expanded: openParticipantMenuId === p.id }} disabled={savingObservationId === p.id} style={[styles.mobileIconButton, openParticipantMenuId === p.id && styles.mobileIconButtonActive]} onPress={() => { setOpenObservationId(null); setOpenParticipantMenuId((current) => current === p.id ? null : p.id); }}>
                  <Ionicons name="add-outline" size={21} color={colors.brandBlue} />
                </Pressable>
                {openParticipantMenuId === p.id ? <View style={styles.participantMenu}>
                  <Pressable style={styles.participantMenuItem} disabled={savingObservationId === p.id} onPress={() => openObservation(p)}><Ionicons name="chatbubble-outline" size={16} color={colors.brandBlue} /><Text style={styles.participantMenuText}>Observacao</Text></Pressable>
                  <Pressable style={styles.participantMenuItem} onPress={() => { setOpenParticipantMenuId(null); setEditingParticipant(p); }}><Ionicons name="create-outline" size={16} color={colors.brandBlue} /><Text style={styles.participantMenuText}>Editar</Text></Pressable>
                  <Pressable style={[styles.participantMenuItem, styles.participantMenuItemDanger]} onPress={() => { setOpenParticipantMenuId(null); openPanel('remover', p); }}><Ionicons name="person-remove-outline" size={16} color={colors.error} /><Text style={styles.participantMenuDangerText}>Remover participante</Text></Pressable>
                </View> : null}
              </View>
              <Action shortLabel="P" active={p.status?.toUpperCase() === 'PRESENTE'} label={`Marcar ${p.nomeExibicao || p.nome} como presente`} icon="checkmark-outline" iconOnly variant="success" disabled={presenca.mutation.isPending} onPress={() => applyAttendance([p], 'PRESENTE')} />
              <Action shortLabel="A" active={p.status?.toUpperCase() === 'AUSENTE'} label={`Marcar ${p.nomeExibicao || p.nome} como ausente`} icon="close-outline" iconOnly variant="danger" disabled={presenca.mutation.isPending} onPress={() => applyAttendance([p], 'AUSENTE')} />
              <Action shortLabel="J" active={p.status?.toUpperCase() === 'JUSTIFICADO'} label={`Marcar ${p.nomeExibicao || p.nome} como justificado`} icon="document-text-outline" iconOnly variant="secondary" disabled={presenca.mutation.isPending} onPress={() => applyAttendance([p], 'JUSTIFICADO')} />
            </View> : state.actions?.participantes ? <View style={styles.participantActions}>
              <Action shortLabel="P" active={p.status?.toUpperCase() === 'PRESENTE'} label={`Marcar ${p.nomeExibicao || p.nome} como presente`} icon="checkmark-outline" iconOnly variant="success" disabled={presenca.mutation.isPending} onPress={() => applyAttendance([p], 'PRESENTE')} />
              <Action shortLabel="A" active={p.status?.toUpperCase() === 'AUSENTE'} label={`Marcar ${p.nomeExibicao || p.nome} como ausente`} icon="close-outline" iconOnly variant="danger" disabled={presenca.mutation.isPending} onPress={() => applyAttendance([p], 'AUSENTE')} />
              <Action shortLabel="J" active={p.status?.toUpperCase() === 'JUSTIFICADO'} label={`Marcar ${p.nomeExibicao || p.nome} como justificado`} icon="document-text-outline" iconOnly variant="secondary" disabled={presenca.mutation.isPending} onPress={() => applyAttendance([p], 'JUSTIFICADO')} />
            </View> : null}
          </View>
          {openObservationId === p.id ? <View style={styles.observationPanel}><View style={styles.observationHeading}><Ionicons name="chatbubble-outline" size={16} color={colors.brandBlue} /><Text style={styles.label}>Observacao</Text><Text style={styles.observationHint}>{['PRESENTE', 'AUSENTE', 'JUSTIFICADO'].includes(p.status?.toUpperCase() ?? '') ? 'Atualiza o registro atual.' : 'Sera enviada ao marcar presenca.'}</Text></View><TextInput accessibilityLabel={`Observacao de ${p.nomeExibicao || p.nome}`} multiline maxLength={500} value={participantObservation(p)} onChangeText={(value) => setObservationDrafts((current) => ({ ...current, [p.id]: value }))} placeholder="Adicionar observacao opcional" placeholderTextColor={colors.textMuted} style={styles.observationInput} /><View style={styles.observationActions}><Text style={styles.observationCount}>{participantObservation(p).length}/500</Text><Pressable style={styles.secondaryButton} onPress={() => setOpenObservationId(null)}><Text style={styles.secondaryButtonText}>Fechar</Text></Pressable><Pressable disabled={savingObservationId === p.id} style={[styles.primaryButton, savingObservationId === p.id && styles.actionDisabled]} onPress={() => void saveObservation(p)}><Ionicons name="save-outline" size={17} color={colors.surfacePrimary} /><Text style={styles.primaryButtonText}>{savingObservationId === p.id ? 'Salvando...' : 'Salvar'}</Text></Pressable></View></View> : null}
        </Fragment>)}</View>
      </View>
      <View style={styles.progressSection}><View style={styles.progressHeader}><Text style={styles.secondary}>Preenchimento</Text><Text style={styles.progressValue}>{progress}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View></View>
      {!!data.ciclos.length && <View style={styles.secondarySection}><Text style={styles.heading}>Ciclos</Text>{data.ciclos.map((cycle) => <View key={cycle.id} style={styles.cycle}><Text style={styles.label}>{cycle.nome}{cycle.id === data.ocorrencia.eventoCicloId ? ' · Atual' : ''}</Text><Text style={styles.secondary}>{cycle.inicioEm.slice(0, 10)} - {cycle.fimEm?.slice(0, 10) || 'Em aberto'}</Text>{!!cycle.motivo && <Text>{cycle.motivo}</Text>}</View>)}</View>}
      {state.manage && <View style={styles.secondarySection}><Action label="Possiveis duplicidades" icon="people-outline" variant="secondary" onPress={() => { setShowCandidates(!showCandidates); track('entrance', 'acompanhar_evento:duplicidades_abrir'); }} />{showCandidates && <>{candidates.isLoading && <ActivityIndicator />}{candidates.isError && <Text style={styles.error}>{normalizeApiError(candidates.error, 'Erro ao consultar duplicidades.').message}</Text>}{candidates.isSuccess && !candidates.data.length && <Text>Nenhuma duplicidade encontrada.</Text>}{candidates.data?.map((candidate) => <View style={styles.cycle} key={candidate.grupoId}><Text style={styles.label}>{candidate.pessoas.map((p) => p.nome).join(' / ')}</Text><Text>{candidate.motivo}</Text>{candidate.temConflitoProvavel && <Text style={styles.error}>Historicos divergentes</Text>}</View>)}</>}</View>}
    </>}
    <Modal visible={!!panel} transparent animationType="slide" onRequestClose={() => { if (!state.mutation.isPending && !presenca.mutation.isPending) setPanel(null); }}>
      <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0} style={styles.keyboardAvoiding}>
      <View style={[styles.overlay, width < 768 && styles.mobileOverlay]}><View style={[styles.dialog, width < 768 && styles.mobileDialog]} accessibilityViewIsModal>
        <ScrollView contentContainerStyle={styles.dialogContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <View style={styles.toolbar}><Text style={[styles.heading, { flex: 1 }]}>{panel ? actionLabels[panel] : ''}</Text>
            <Action label="Fechar" icon="close" iconOnly disabled={state.mutation.isPending || presenca.mutation.isPending} onPress={() => setPanel(null)} /></View>
          {!!target && <Text style={styles.label}>{target.nomeExibicao || target.nome}</Text>}
          {panel === 'attendance' && <View style={styles.section}>
            <Text style={styles.label}>Status: {statusLabel(attendanceStatus)}</Text>
            <Text style={styles.secondary}>{attendanceTargets.length} participante(s) selecionado(s)</Text>
          </View>}
          {panel === 'finalizar' && <View style={styles.section}>
            <Text style={styles.label}>Resumo da finalizacao</Text>
            <Text style={styles.secondary}>Presentes: {data?.participantes.filter((p) => p.status?.toUpperCase() === 'PRESENTE').length ?? 0} · Ausentes: {data?.participantes.filter((p) => p.status?.toUpperCase() === 'AUSENTE').length ?? 0} · Pendentes: {data?.participantes.filter((p) => !p.status || ['PENDENTE', 'NAO_RESPONDEU'].includes(p.status.toUpperCase())).length ?? 0}</Text>
            <Text style={styles.label}>Participantes pendentes</Text>
            {(['pendente', 'ausente'] as const).map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: pendingPolicy === item }} style={styles.radio} onPress={() => setPendingPolicy(item)}>
              <Ionicons name={pendingPolicy === item ? 'radio-button-on' : 'radio-button-off'} size={22} color={colors.brandBlue} />
              <Text style={styles.personInfo}>{item === 'pendente' ? 'Deixar como pendente' : 'Marcar como ausente'}</Text>
            </Pressable>)}
            <Text style={styles.label}>Observacoes gerais</Text>
            <TextInput accessibilityLabel="Observacoes gerais" multiline value={finalizationNotes} onChangeText={setFinalizationNotes} style={[styles.input, { minHeight: 90 }]} />
            <Pressable accessibilityRole="checkbox" accessibilityLabel="Enviar resumo aos participantes" accessibilityState={{ checked: sendSummary }} style={styles.radio} onPress={() => setSendSummary((value) => !value)}>
              <Ionicons name={sendSummary ? 'checkbox' : 'square-outline'} size={22} color={colors.brandBlue} /><Text style={styles.personInfo}>Enviar resumo aos participantes</Text>
            </Pressable>
            <Pressable accessibilityRole="checkbox" accessibilityLabel="Enviar lembrete aos faltantes" accessibilityState={{ checked: sendReminder }} style={styles.radio} onPress={() => setSendReminder((value) => !value)}>
              <Ionicons name={sendReminder ? 'checkbox' : 'square-outline'} size={22} color={colors.brandBlue} /><Text style={styles.personInfo}>Enviar lembrete aos faltantes</Text>
            </Pressable>
          </View>}
          {panel === 'remover' && <View style={styles.section}>
            <Text style={styles.label}>Aplicar a</Text>
            {(['somente_ocorrencia', 'futuros'] as const).map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: scope === item }}
              style={styles.radio} onPress={() => setScope(item)}><Ionicons name={scope === item ? 'radio-button-on' : 'radio-button-off'} size={22} color={colors.brandBlue} />
              <Text style={styles.personInfo}>{item === 'somente_ocorrencia' ? 'Somente esta ocorrencia' : 'Esta e as proximas ocorrencias'}</Text></Pressable>)}
          </View>}
          {panel === 'adicionar' && data && <AdicionarParticipantePanel
            estruturaId={state.scope.estruturaId}
            grupoId={data.evento.grupoId}
            eventoId={data.evento.id}
            dataReferencia={data.ocorrencia.dataHora}
            participantes={data.participantes}
            pending={state.mutation.isPending}
            error={state.mutation.isError ? normalizeApiError(state.mutation.error, 'Nao foi possivel adicionar participante.').message : null}
            onSubmit={async (action) => state.mutation.mutateAsync(action)}
            onClose={() => { if (!state.mutation.isPending) setPanel(null); }}
          />}
          {needsReason && <View style={styles.section}><Text style={styles.label}>Motivo da ausência</Text>{recentAbsenceReasons.length > 0 && <View style={styles.reasonChips}>{recentAbsenceReasons.map((reason) => <Pressable key={reason} accessibilityRole="button" accessibilityLabel={`Usar motivo ${reason}`} style={styles.reasonChip} onPress={() => setMotivo(reason)}><Text numberOfLines={1} style={styles.reasonChipText}>{reason}</Text></Pressable>)}</View>}<TextInput accessibilityLabel="Motivo" multiline value={motivo} onChangeText={setMotivo} placeholder="Descreva o motivo da ausência" placeholderTextColor={colors.textMuted} style={[styles.input, styles.reasonInput]} /></View>}
          {state.mutation.isError && <Text accessibilityRole="alert" style={styles.error}>{normalizeApiError(state.mutation.error, 'Nao foi possivel concluir a acao.').message}</Text>}
          {presenca.mutation.isError && <Text accessibilityRole="alert" style={styles.error}>{normalizeApiError(presenca.mutation.error, 'Nao foi possivel salvar presencas.').message}</Text>}
          {panel !== 'adicionar' && <Action label={state.mutation.isPending || presenca.mutation.isPending ? 'Salvando...' : 'Confirmar'} icon="checkmark" variant="primary" disabled={state.mutation.isPending || presenca.mutation.isPending || (needsReason && !motivo.trim()) || (panel === 'attendance' && !attendanceTargets.length)} onPress={() => void save()} />}
        </ScrollView>
      </View></View>
      </KeyboardAvoidingView>
    </Modal>
    <EventoEditModal key={editingEvento ? `evento:${data?.evento.id}:${data?.evento.inicioEm}` : 'evento-closed'} evento={editingEvento ? data?.evento ?? null : null} grupos={grupos.data ?? []} pending={state.editMutation.isPending} error={state.editMutation.isError ? normalizeApiError(state.editMutation.error, 'Nao foi possivel editar o evento.').message : null} onClose={() => { if (!state.editMutation.isPending) setEditingEvento(false); }} onSave={saveEvento} />
    <EditarParticipantePanel key={editingParticipant ? `participante:${editingParticipant.id}:${editingParticipant.nomeExibicao || editingParticipant.nome}` : 'participante-closed'} participante={editingParticipant} estruturaId={state.scope.estruturaId} pending={participantEditPending} error={participantEditError} onClose={() => { if (!participantEditPending) { setEditingParticipant(null); setParticipantEditError(null); } }} onSave={(values) => { if (editingParticipant) void saveParticipant(editingParticipant, values); }} />
  </ScrollView>;
}

function Action({ label, icon, shortLabel, onPress, disabled = false, iconOnly = false, active = true, variant = 'secondary' }: { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; shortLabel?: string; onPress: () => void; disabled?: boolean; iconOnly?: boolean; active?: boolean; variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'icon' }) {
  const iconColor = variant === 'primary' ? colors.surfacePrimary : variant === 'success' ? '#059669' : variant === 'danger' ? colors.error : colors.brandBlue;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled, selected: active }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, iconOnly ? styles.actionIcon : null, shortLabel ? styles.action_icon : styles[`action_${variant}`], iconOnly && !active ? styles.actionInactive : null, pressed ? styles.actionPressed : null, disabled && styles.actionDisabled]}>
    {shortLabel ? <View style={styles.actionMark}><Ionicons name={icon} size={14} color={colors.textSecondary} /><Text style={styles.actionLetter}>{shortLabel}</Text></View> : <Ionicons name={icon} size={iconOnly ? 20 : 18} color={iconColor} />}{!iconOnly && <Text style={[styles.actionText, variant === 'primary' ? styles.actionTextPrimary : null]}>{label}</Text>}
  </Pressable>;
}

function InfoChip({ icon, label, tone }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; tone: 'blue' | 'neutral' | 'green' }) {
  return <View style={[styles.infoChip, styles[`infoChip_${tone}`]]}><Ionicons name={icon} size={14} color={tone === 'green' ? '#047857' : tone === 'blue' ? colors.brandBlue : colors.textSecondary} /><Text numberOfLines={1} style={styles.infoChipText}>{label}</Text></View>;
}

function StatusBadge({ status, virtual }: { status: string; virtual: boolean }) {
  const normalized = status.toLowerCase().replace(/[_ ]/g, '');
  const tone = normalized === 'emandamento' ? 'green' : normalized === 'realizada' ? 'green' : normalized === 'cancelada' ? 'red' : normalized === 'agendada' || virtual ? 'amber' : 'neutral';
  const label = virtual ? 'Nao iniciada' : ({ agendada: 'Agendada', emandamento: 'Em andamento', realizada: 'Realizada', cancelada: 'Cancelada', emajuste: 'Em ajuste' }[normalized] ?? statusLabel(status));
  return <View style={[styles.statusBadge, styles[`statusBadge_${tone}`]]}><View style={[styles.statusDot, styles[`statusDot_${tone}`]]} /><Text style={styles.statusBadgeText}>{label}</Text></View>;
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ComponentProps<typeof Ionicons>['name']; tone: 'blue' | 'green' | 'red' | 'amber' }) {
  return <View style={styles.statCard}><View style={[styles.statIcon, styles[`statIcon_${tone}`]]}><Ionicons name={icon} size={19} color={tone === 'blue' ? colors.brandBlue : tone === 'green' ? '#059669' : tone === 'red' ? colors.error : '#D97706'} /></View><View><Text style={[styles.statValue, styles[`statValue_${tone}`]]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View></View>;
}

function FilterChip({ label, count, active = false, tone = 'neutral' }: { label: string; count: number; active?: boolean; tone?: 'neutral' | 'green' | 'red' }) {
  return <View style={[styles.filterChip, active ? styles.filterChipActive : null, tone === 'green' ? styles.filterChipGreen : null, tone === 'red' ? styles.filterChipRed : null]}><Text style={[styles.filterChipText, active ? styles.filterChipTextActive : null]}>{label}</Text><Text style={[styles.filterCount, active ? styles.filterCountActive : null]}>{count}</Text></View>;
}

function countAttendance(participants: Participante[]) {
  return participants.reduce((counts, participant) => {
    const status = participant.status?.toUpperCase();
    counts.total += 1;
    if (status === 'PRESENTE') counts.presentes += 1;
    else if (status === 'AUSENTE') counts.ausentes += 1;
    else if (status === 'JUSTIFICADO') counts.justificados += 1;
    else counts.pendentes += 1;
    return counts;
  }, { total: 0, presentes: 0, ausentes: 0, pendentes: 0, justificados: 0 });
}

function statusToneStyle(status: string | null | undefined) {
  const normalized = status?.toUpperCase();
  if (normalized === 'PRESENTE') return styles.statusPresent;
  if (normalized === 'AUSENTE') return styles.statusAbsent;
  if (normalized === 'JUSTIFICADO') return styles.statusJustified;
  return styles.statusPending;
}

function formatTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '--:--' : parsed.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Data nao informada' : parsed.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function formatMonthLabel(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Ocorrencia' : parsed.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function navigateDate(router: ReturnType<typeof useRouter>, eventoId: number, currentDay: string, offset: number) {
  const parsed = new Date(`${currentDay.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return;
  parsed.setDate(parsed.getDate() + offset);
  const nextDay = parsed.toISOString().slice(0, 10);
  router.replace(`/admin/eventos/acompanhar/${eventoId}?data=${nextDay}` as Href);
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.surfacePage },
  page: { gap: 0, paddingBottom: 48, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  eventToolbar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary, paddingHorizontal: 16 },
  eventToolbarTitle: { flex: 1, ...typography.h3, fontSize: 18, color: colors.textHeading },
  eventToolbarActions: { flexDirection: 'row', gap: 8 },
  eventHero: { gap: 7, backgroundColor: '#EFF6FF', borderBottomWidth: 2, borderBottomColor: '#BFDBFE', paddingHorizontal: 16, paddingVertical: 14 },
  eyebrow: { ...typography.caption, color: colors.brandBlue, fontWeight: '800', letterSpacing: 1 },
  title: { ...typography.h1, fontSize: 22, lineHeight: 28, color: colors.textHeading },
  chipRail: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  infoChip: { maxWidth: '100%', minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 4 },
  infoChip_blue: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }, infoChip_neutral: { backgroundColor: colors.surfacePrimary, borderColor: colors.borderDefault }, infoChip_green: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  infoChipText: { ...typography.caption, flexShrink: 1, color: colors.textBody },
  responsible: { ...typography.caption, color: colors.textSecondary }, cancelReason: { ...typography.caption, color: colors.error },
  occurrenceRail: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, borderBottomWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary, paddingHorizontal: 16 },
  occurrenceHeading: { minWidth: 160, alignItems: 'center', gap: 2 }, monthLabel: { ...typography.bodySmall, fontWeight: '800', color: colors.textHeading, textTransform: 'capitalize' }, occurrenceDate: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
  roundControl: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full, backgroundColor: colors.surfacePrimary },
  statusRail: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary, paddingHorizontal: 16, paddingVertical: 10 },
  statusActions: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }, statusActionsCompact: { flex: 0, gap: 6 },
  statusBadge: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: radius.full, paddingHorizontal: 11 }, statusBadge_green: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }, statusBadge_red: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }, statusBadge_amber: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }, statusBadge_neutral: { backgroundColor: colors.surfaceMuted, borderColor: colors.borderSubtle }, statusDot: { width: 7, height: 7, borderRadius: radius.full }, statusDot_green: { backgroundColor: '#059669' }, statusDot_red: { backgroundColor: colors.error }, statusDot_amber: { backgroundColor: '#D97706' }, statusDot_neutral: { backgroundColor: colors.textMuted }, statusBadgeText: { ...typography.caption, fontWeight: '800', color: colors.textBody },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: colors.surfacePage, padding: 12 }, statCard: { flex: 1, minWidth: 130, minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, padding: 10 }, statIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 9 }, statIcon_blue: { backgroundColor: '#EFF6FF' }, statIcon_green: { backgroundColor: '#ECFDF5' }, statIcon_red: { backgroundColor: '#FEF2F2' }, statIcon_amber: { backgroundColor: '#FFFBEB' }, statValue: { ...typography.h2, fontSize: 22, lineHeight: 24, fontWeight: '800' }, statValue_blue: { color: colors.textHeading }, statValue_green: { color: '#059669' }, statValue_red: { color: colors.error }, statValue_amber: { color: '#D97706' }, statLabel: { ...typography.caption, color: colors.textSecondary },
  participantSection: { position: 'relative', borderTopWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary }, sectionHeader: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16 }, sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, heading: { ...typography.h3, fontSize: 18, color: colors.textHeading }, countBadge: { minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: '#EFF6FF' }, countBadgeText: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' }, sectionActions: { flexDirection: 'row', gap: 8 },
  filterRail: { flexDirection: 'row', gap: 7, overflow: 'hidden', paddingHorizontal: 16, paddingBottom: 10 }, filterChip: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full, backgroundColor: colors.surfacePrimary, paddingHorizontal: 11 }, filterChipActive: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue }, filterChipGreen: { borderColor: '#D1FAE5' }, filterChipRed: { borderColor: '#FECACA' }, filterChipText: { ...typography.caption, color: colors.textBody, fontWeight: '700' }, filterChipTextActive: { color: colors.surfacePrimary }, filterCount: { ...typography.caption, minWidth: 18, textAlign: 'center', color: colors.textMuted, fontWeight: '800' }, filterCountActive: { color: colors.surfacePrimary },
  searchRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, marginHorizontal: 16, paddingHorizontal: 12, backgroundColor: colors.surfacePage }, searchInput: { flex: 1, minWidth: 0, height: 42, color: colors.textBody, fontSize: 15 }, bulkBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 16, paddingVertical: 10 }, bulkBarCompact: { flexDirection: 'column', alignItems: 'stretch', gap: 8 }, bulkActions: { flexDirection: 'row', gap: 5 }, bulkActionsCompact: { justifyContent: 'flex-end' },
  participantList: { marginTop: 8 }, participantRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingHorizontal: 16, paddingVertical: 10 }, participantRowCompact: { flexDirection: 'column', alignItems: 'stretch', gap: 8, paddingVertical: 12 }, participantIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9 }, participantIdentityCompact: { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', width: '100%' }, checkbox: { width: 24, height: 36, alignItems: 'center', justifyContent: 'center' }, avatar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: '#3B82F6' }, avatarText: { ...typography.body, color: colors.surfacePrimary, fontWeight: '800' }, personInfo: { flex: 1, minWidth: 0, gap: 2 }, personName: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' }, personMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }, roleText: { ...typography.caption, color: colors.textSecondary, flexShrink: 1 }, dot: { ...typography.caption, color: colors.textMuted }, statusPresent: { ...typography.caption, color: '#059669', fontWeight: '700' }, statusAbsent: { ...typography.caption, color: colors.error, fontWeight: '700' }, statusJustified: { ...typography.caption, color: '#D97706', fontWeight: '700' }, statusPending: { ...typography.caption, color: colors.textMuted, fontWeight: '700' }, email: { ...typography.caption, color: colors.textMuted }, participantActions: { flexDirection: 'row', gap: 4 }, participantActionsCompact: { width: '100%', flexGrow: 0, flexShrink: 0, justifyContent: 'flex-end', paddingLeft: 0, paddingTop: 4 }, mobileIconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary }, mobileIconButtonActive: { borderColor: colors.brandBlue, backgroundColor: '#EFF6FF' }, participantMenuOverlay: { ...StyleSheet.absoluteFill, zIndex: 10 }, participantMenuWrap: { position: 'relative', zIndex: 30 }, participantMenu: { position: 'absolute', top: 48, right: 0, minWidth: 146, zIndex: 40, elevation: 8, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, padding: 5, boxShadow: '0px 10px 24px rgba(15, 23, 42, 0.18)' }, participantMenuItem: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radius.sm, paddingHorizontal: 9 }, participantMenuItemDanger: { borderTopWidth: 1, borderColor: colors.borderSubtle, marginTop: 3, paddingTop: 6 }, participantMenuText: { ...typography.caption, color: colors.textBody, fontWeight: '700' }, participantMenuDangerText: { ...typography.caption, color: colors.error, fontWeight: '700' }, observationPanel: { gap: 8, marginHorizontal: 12, marginBottom: 10, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.sm, backgroundColor: '#F8FBFF', padding: 10 }, observationHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 }, observationHint: { ...typography.caption, flex: 1, color: colors.textMuted }, observationInput: { minHeight: 78, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, padding: 9, color: colors.textBody, backgroundColor: colors.surfacePrimary, textAlignVertical: 'top' }, observationActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 7 }, observationCount: { ...typography.caption, marginRight: 'auto', color: colors.textMuted }, secondaryButton: { minHeight: 40, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: 11 }, secondaryButtonText: { ...typography.caption, color: colors.textBody, fontWeight: '700' }, primaryButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.sm, backgroundColor: colors.brandBlue, paddingHorizontal: 12 }, primaryButtonText: { ...typography.caption, color: colors.surfacePrimary, fontWeight: '800' },
  progressSection: { gap: 7, borderTopWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary, padding: 16 }, progressHeader: { flexDirection: 'row', justifyContent: 'space-between' }, progressValue: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' }, progressTrack: { height: 7, overflow: 'hidden', borderRadius: radius.full, backgroundColor: colors.surfaceMuted }, progressFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.brandBlue }, secondarySection: { gap: 12, borderTopWidth: 1, borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary, padding: 16 }, emptyState: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  loading: { minHeight: 160, alignItems: 'center', justifyContent: 'center' }, stateSection: { gap: 12, padding: 24 },
  titleOld: { ...typography.h1, color: colors.textHeading }, label: { ...typography.bodySmall, fontWeight: '600', color: colors.textHeading }, secondary: { ...typography.bodySmall, color: colors.textSecondary }, section: { gap: 12 }, toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, padding: 12, fontSize: 16, color: colors.textBody, backgroundColor: colors.surfacePrimary },
  action: { minHeight: 42, minWidth: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, flexShrink: 1 }, actionIcon: { width: 42, minWidth: 42, paddingHorizontal: 0 }, action_primary: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue }, action_secondary: { borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary }, action_success: { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }, action_danger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }, action_icon: { borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary }, actionInactive: { borderColor: colors.borderSubtle, backgroundColor: colors.surfacePrimary }, actionMark: { alignItems: 'center', justifyContent: 'center', gap: 1 }, actionLetter: { fontSize: 15, lineHeight: 18, fontWeight: '800' }, reasonChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, reasonChip: { maxWidth: '100%', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full, backgroundColor: colors.surfaceMuted, paddingHorizontal: 10, paddingVertical: 7 }, reasonChipText: { ...typography.caption, color: colors.textBody, fontWeight: '700' }, reasonInput: { minHeight: 90, textAlignVertical: 'top' }, actionText: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700', flexShrink: 1 }, actionTextPrimary: { color: colors.surfacePrimary }, actionPressed: { opacity: 0.72 }, actionDisabled: { opacity: 0.5 },
  cycle: { borderLeftWidth: 3, borderColor: colors.success, paddingLeft: 12, gap: 4 },
  error: { ...typography.bodySmall, color: colors.error },
  keyboardAvoiding: { flex: 1, width: '100%' }, overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  dialog: { backgroundColor: colors.surfacePrimary, borderRadius: 8, width: '90%', maxWidth: 560, maxHeight: '90%' },
  mobileOverlay: { justifyContent: 'flex-end', alignItems: 'stretch' },
  mobileDialog: { width: '100%', maxHeight: '88%', borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  dialogContent: { padding: 20, gap: 20 }, radio: { minHeight: 48, flexDirection: 'row', gap: 12, alignItems: 'center' },
});

// Mantem o mesmo encaixe compacto do web no telefone: identidade e P/A/J
// permanecem na mesma linha, com o nome podendo ser truncado.
Object.assign(styles, {
  participantRowCompact: { flexDirection: 'column', alignItems: 'stretch', gap: 8, paddingVertical: 12 },
  participantIdentityCompact: { flexGrow: 0, flexShrink: 1, flexBasis: 'auto', width: '100%' },
  participantActionsCompact: { width: '100%', flexGrow: 0, flexShrink: 0, justifyContent: 'flex-end', gap: 6, paddingLeft: 0, paddingTop: 0 },
  actionIcon: { width: 42, minWidth: 42, paddingHorizontal: 0 },
  mobileIconButton: { width: 42, height: 42 },
  participantMenuOverlay: { ...StyleSheet.absoluteFill, zIndex: 10, elevation: 1 },
  participantMenuWrap: { position: 'relative', zIndex: 100, elevation: 20 },
  participantMenu: { position: 'absolute', top: 46, right: 0, minWidth: 160, zIndex: 110, elevation: 24, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, padding: 5 },
  searchRow: { minHeight: 42, backgroundColor: colors.surfacePrimary, borderColor: colors.borderSubtle },
});
