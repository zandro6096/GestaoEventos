import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { can } from '../../../../services/permissions/permission.facade';
import { track } from '../../../../services/analytics/analytics.service';
import { colors, radius, spacing, typography } from '../../../../shared/design/tokens';
import { layoutMetrics } from '../../../../shared/theme';
import { useMeusEventos } from '../hooks/useMeusEventos';
import type { MeusEventoItem } from '../services/meus-eventos.service';

type IconName = keyof typeof Ionicons.glyphMap;

type SectionConfig = {
  key: 'aAcompanhar' | 'futuros' | 'historico';
  title: string;
  description: string;
  icon: IconName;
  items: MeusEventoItem[];
};

type EventoGrupo = {
  key: string;
  eventoId: number;
  titulo: string;
  grupoNome: string;
  eventos: MeusEventoItem[];
};

export function MeusEventosScreen() {
  const router = useRouter();
  const meusEventos = useMeusEventos();
  const { isInitialLoading, loadMonth, loadYear } = meusEventos;
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const [cancelTarget, setCancelTarget] = useState<MeusEventoItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null | undefined>(undefined);
  const [groupSearch, setGroupSearch] = useState('');
  const [showCancelled, setShowCancelled] = useState(true);
  const canCreateEvents = can('criar', 'eventos');
  const canManageEvents = can('gerenciar', 'eventos', {
    estruturaId: meusEventos.estruturaId,
    grupoId: meusEventos.grupoId,
  });

  const sections: SectionConfig[] = [
    {
      key: 'aAcompanhar',
      title: 'Acompanhar',
      description: 'Pendentes, atrasados ou em andamento no contexto atual.',
      icon: 'play-circle-outline',
      items: meusEventos.aAcompanhar,
    },
    {
      key: 'futuros',
      title: 'Futuros',
      description: 'Proximas ocorrencias relacionadas ao usuario.',
      icon: 'calendar-outline',
      items: meusEventos.futuros,
    },
    {
      key: 'historico',
      title: 'Historico',
      description: 'Realizados e cancelados preservados para consulta.',
      icon: 'time-outline',
      items: meusEventos.historico,
    },
  ];
  const allItems = sections.flatMap((section) => section.items);
  const currentYear = new Date().getFullYear();
  const activeYear = selectedYear ?? currentYear;
  const currentMonthKey = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const activeMonth = selectedMonth === undefined
    ? currentMonthKey
    : selectedMonth;
  const periodItems = allItems.filter((item) => {
    const year = getYear(item.dataReferencia);
    return year === activeYear && (!activeMonth || getMonthKey(item.dataReferencia) === activeMonth);
  });
  const visiblePeriodItems = showCancelled ? periodItems : periodItems.filter((item) => !item.cancelada);
  const groupOptions = Array.from(new Set(visiblePeriodItems.map((item) => item.grupoNome).filter(Boolean))).sort((left, right) => left.localeCompare(right, 'pt-BR'));
  const filteredAvailableGroups = useMemo(() => {
    const query = groupSearch.trim().toLocaleLowerCase('pt-BR');
    const matches = query
      ? meusEventos.availableGroups.filter((group) => group.nome.toLocaleLowerCase('pt-BR').includes(query))
      : meusEventos.availableGroups;
    return query ? matches : matches.slice(0, 12);
  }, [groupSearch, meusEventos.availableGroups]);
  const activeSelectedGroup = selectedGroup && groupOptions.includes(selectedGroup) ? selectedGroup : null;
  const filteredItems = activeSelectedGroup ? visiblePeriodItems.filter((item) => item.grupoNome === activeSelectedGroup) : visiblePeriodItems;
  const eventGroups = groupEventItems(filteredItems);
  const monthOptions = getMonthOptions(activeYear, currentYear);
  const requestedMonthRef = useRef<string | null>(null);

  useEffect(() => {
    if (isInitialLoading || meusEventos.isLoadingGroups || meusEventos.requiresGroupSelection || !activeMonth || allItems.some((item) => getMonthKey(item.dataReferencia) === activeMonth)) return;
    if (requestedMonthRef.current === activeMonth) return;

    requestedMonthRef.current = activeMonth;
    void loadMonth(activeMonth).catch(() => {
      if (requestedMonthRef.current === activeMonth) requestedMonthRef.current = null;
    });
  }, [activeMonth, allItems, isInitialLoading, loadMonth, meusEventos.isLoadingGroups, meusEventos.requiresGroupSelection]);

  function handleStartEvent() {
    router.push('/admin/eventos/iniciar' as Href);
  }

  function handleOpenEvent(item: MeusEventoItem) {
    meusEventos.trackOpenEvent(item);
    router.push(resolveOpenHref(item) as Href);
  }

  function handleOpenPresence(item: MeusEventoItem) {
    meusEventos.trackOpenEvent(item);
    router.push(resolvePresenceHref(item) as Href);
  }

  async function handleConfirmVisit(item: MeusEventoItem) {
    try {
      await meusEventos.confirmVisit(item);
    } catch {
      // Mutation error is exposed by the hook and rendered below the header.
    }
  }

  async function handleCancelOccurrence() {
    if (!cancelTarget || !cancelReason.trim()) return;

    try {
      await meusEventos.cancelOccurrence({ item: cancelTarget, motivo: cancelReason });
      setCancelTarget(null);
      setCancelReason('');
    } catch {
      // Mutation error is exposed by the hook and rendered below the header.
    }
  }

  if (meusEventos.contextError) {
    return (
      <ScreenShell>
        <StatePanel
          kind="error"
          icon="alert-circle-outline"
          title="Contexto obrigatorio"
          message={meusEventos.contextError}
          actionLabel="Tentar novamente"
          onAction={() => void meusEventos.refetch()}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={[styles.pageHeaderCard, compact ? styles.pageHeaderCardMobile : null]}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Meus Eventos</Text>
          <Text style={styles.subtitle}>Gerencie e acompanhe seus eventos por ciclo</Text>
        </View>
        {canCreateEvents ? (
          <Pressable accessibilityRole="button" style={[styles.primaryButton, styles.headerPrimaryButton]} onPress={handleStartEvent}>
            <Ionicons name="add-outline" size={22} color={colors.surfacePrimary} />
            <Text style={styles.primaryButtonText}>Iniciar Evento</Text>
          </Pressable>
        ) : null}
      </View>

      {meusEventos.mutationError ? (
        <View style={styles.inlineError}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
          <Text style={styles.inlineErrorText}>{meusEventos.mutationError}</Text>
        </View>
      ) : null}

      {meusEventos.isLoadingGroups ? (
        <StatePanel kind="loading" icon="people-outline" title="Preparando grupos" message="Carregando somente a lista necessaria para voce escolher o grupo." />
      ) : null}

      {meusEventos.groupSelectionError ? (
        <StatePanel
          kind="error"
          icon="alert-circle-outline"
          title="Nao foi possivel preparar os grupos"
          message={meusEventos.groupSelectionError}
          actionLabel="Tentar novamente"
          onAction={() => void meusEventos.refetch()}
        />
      ) : null}

      {meusEventos.requiresGroupSelection ? (
        <View style={styles.groupSelectionPanel}>
          <View style={styles.groupSelectionHeading}>
            <View style={styles.groupSelectionIcon}><Ionicons name="filter-outline" size={20} color={colors.brandBlue} /></View>
            <View style={styles.groupSelectionCopy}>
              <Text style={styles.groupSelectionTitle}>Escolha um grupo para continuar</Text>
              <Text style={styles.groupSelectionText}>Ha muitos grupos neste contexto. Os eventos serao carregados apenas depois da sua escolha.</Text>
            </View>
          </View>
          <View style={styles.groupSearchRow}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              accessibilityLabel="Buscar grupo"
              value={groupSearch}
              onChangeText={setGroupSearch}
              placeholder="Buscar grupo por nome"
              placeholderTextColor={colors.textMuted}
              style={styles.groupSearchInput}
              autoCorrect={false}
            />
          </View>
          {!groupSearch.trim() && meusEventos.availableGroups.length > 12 ? (
            <Text style={styles.groupSelectionHint}>Mostrando 12 de {meusEventos.availableGroups.length}. Digite para localizar outro grupo.</Text>
          ) : null}
          {groupSearch.trim() && !filteredAvailableGroups.length ? (
            <Text style={styles.groupSelectionHint}>Nenhum grupo encontrado.</Text>
          ) : null}
          <ScrollView style={styles.groupResults} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          <View style={styles.groupSelectionGrid}>
            {filteredAvailableGroups.map((group) => (
              <Pressable
                key={group.id}
                accessibilityRole="button"
                accessibilityLabel={`Carregar eventos do grupo ${group.nome}`}
                style={styles.groupSelectionButton}
                onPress={() => {
                  setSelectedGroup(null);
                  setGroupSearch('');
                  meusEventos.selectGroup(group.id);
                  track('simulation', 'meus_eventos:grupo_selecionar', { extra: { grupo_id: group.id, grupo_nome: group.nome } });
                }}
              >
                <Ionicons name="people-outline" size={18} color={colors.brandBlue} />
                <Text numberOfLines={2} style={styles.groupSelectionButtonText}>{group.nome}</Text>
              </Pressable>
            ))}
          </View>
          </ScrollView>
        </View>
      ) : null}

      {meusEventos.isInitialLoading ? (
        <StatePanel kind="loading" icon="sync-outline" title="Carregando seus eventos" message="Buscando dados do backend." />
      ) : null}

      {meusEventos.isError ? (
        <StatePanel
          kind="error"
          icon="alert-circle-outline"
          title="Falha ao carregar"
          message={meusEventos.errorMessage ?? 'Nao foi possivel carregar seus eventos.'}
          actionLabel="Tentar novamente"
          onAction={() => void meusEventos.refetch()}
        />
      ) : null}

      {!meusEventos.isInitialLoading && !meusEventos.isError && !meusEventos.requiresGroupSelection && meusEventos.data ? (
        <>
          <View style={styles.monthFilter}>
            <View style={styles.monthToolbar}>
              <Pressable accessibilityRole="button" accessibilityLabel="Ano anterior" disabled={activeYear <= currentYear - 3} style={[styles.monthYearButton, activeYear <= currentYear - 3 ? styles.disabledButton : null]} onPress={() => { const year = activeYear - 1; setSelectedYear(year); setSelectedMonth(null); setSelectedGroup(null); void loadYear(year).catch(() => undefined); }}>
                <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
              </Pressable>
              <Text style={styles.monthYearLabel}>{activeYear}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Proximo ano" disabled={activeYear >= currentYear + 1} style={[styles.monthYearButton, activeYear >= currentYear + 1 ? styles.disabledButton : null]} onPress={() => { const year = activeYear + 1; setSelectedYear(year); setSelectedMonth(null); setSelectedGroup(null); void loadYear(year).catch(() => undefined); }}>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.monthGrid}>
              <Pressable accessibilityRole="button" style={[styles.monthButton, compact ? styles.monthButtonMobile : null, activeMonth === null ? styles.monthButtonActive : null]} onPress={() => { setSelectedMonth(null); setSelectedGroup(null); void loadYear(activeYear).catch(() => undefined); }}>
                <Text style={[styles.monthButtonText, activeMonth === null ? styles.monthButtonTextActive : null]}>Todos do ano</Text>
              </Pressable>
              {monthOptions.map((month) => (
                <Pressable key={month.key} accessibilityRole="button" accessibilityLabel={`Filtrar ${month.label}`} style={[styles.monthButton, compact ? styles.monthButtonMobile : null, activeMonth === month.key ? styles.monthButtonActive : null]} onPress={() => { setSelectedMonth(month.key); setSelectedGroup(null); void loadMonth(month.key).catch(() => undefined); }}>
                  <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={[styles.monthButtonText, styles.monthButtonTextMobile, activeMonth === month.key ? styles.monthButtonTextActive : null]}>{month.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterExtras}>
            <View style={styles.filterPanel}>
              <View style={styles.filterPanelCopy}>
                <Text style={styles.filterPanelTitle}>Ciclos dentro do mesmo evento</Text>
                <Text style={styles.filterPanelText}>Use o selo de ciclo para distinguir historico encerrado e ciclo atual.</Text>
              </View>
            </View>
            <View style={styles.filterPanel}>
              <View style={styles.filterPanelCopy}>
                <Text style={styles.filterPanelTitle}>Mostrar cancelados</Text>
                <Text style={styles.filterPanelText}>Ocorrencias canceladas seguem visiveis com motivo registrado.</Text>
              </View>
              <Switch
                accessibilityLabel="Mostrar eventos cancelados"
                value={showCancelled}
                onValueChange={(value) => { setShowCancelled(value); setSelectedGroup(null); }}
                trackColor={{ false: colors.borderDefault, true: '#BFD5FF' }}
                thumbColor={showCancelled ? colors.brandBlue : colors.surfacePrimary}
              />
            </View>
          </View>

          {groupOptions.length > 0 ? (
            <View style={styles.groupFilter}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupTabs}>
                <Pressable accessibilityRole="tab" accessibilityLabel="Todos os grupos" accessibilityState={{ selected: activeSelectedGroup === null }} style={[styles.groupTab, activeSelectedGroup === null ? styles.groupTabActive : null]} onPress={() => { setSelectedGroup(null); track('simulation', 'meus_eventos:filtro_grupo_aplicar', { extra: { grupo_nome: 'todos' } }); }}>
                  <Text style={[styles.groupTabText, activeSelectedGroup === null ? styles.groupTabTextActive : null]}>Todos</Text><Text style={[styles.groupTabCount, activeSelectedGroup === null ? styles.groupTabCountActive : null]}>{visiblePeriodItems.length}</Text>
                </Pressable>
                {groupOptions.map((groupName) => <Pressable key={groupName} accessibilityRole="tab" accessibilityLabel={`Filtrar grupo ${groupName}`} accessibilityState={{ selected: activeSelectedGroup === groupName }} style={[styles.groupTab, activeSelectedGroup === groupName ? styles.groupTabActive : null]} onPress={() => { setSelectedGroup(groupName); track('simulation', 'meus_eventos:filtro_grupo_aplicar', { extra: { grupo_nome: groupName } }); }}>
                  <Text numberOfLines={1} style={[styles.groupTabText, activeSelectedGroup === groupName ? styles.groupTabTextActive : null]}>{groupName}</Text><Text style={[styles.groupTabCount, activeSelectedGroup === groupName ? styles.groupTabCountActive : null]}>{visiblePeriodItems.filter((item) => item.grupoNome === groupName).length}</Text>
                </Pressable>)}
              </ScrollView>
            </View>
          ) : null}

          {filteredItems.length === 0 ? (
            <StatePanel
              kind="empty"
              icon="filter-outline"
              title={meusEventos.data.total === 0 ? 'Nenhum evento neste periodo' : 'Nenhum evento visivel com os filtros atuais'}
              message={meusEventos.data.total === 0 ? 'Escolha outro mes para carregar seus eventos. Cada mes e consultado somente quando selecionado.' : 'Ajuste o ano/mes selecionado ou habilite Mostrar cancelados.'}
              actionLabel={canCreateEvents ? 'Iniciar Evento' : undefined}
              onAction={canCreateEvents ? handleStartEvent : undefined}
            />
          ) : (
            <View style={styles.eventGroups}>
              {eventGroups.map((group) => group.eventos.length > 1 || group.eventos[0]?.recorrente ? (
                <RecurringEventCard
                  canManageEvents={canManageEvents}
                  compact={compact}
                  group={group}
                  isCancelling={meusEventos.isCancellingOccurrence}
                  isConfirming={meusEventos.isConfirmingVisit}
                  key={group.key}
                  onCancel={(item) => { setCancelTarget(item); setCancelReason(''); }}
                  onConfirmVisit={(item) => void handleConfirmVisit(item)}
                  onOpen={handleOpenEvent}
                  onPresence={handleOpenPresence}
                />
              ) : (
                <SingleEventCard
                  canManageEvents={canManageEvents}
                  compact={compact}
                  isCancelling={meusEventos.isCancellingOccurrence}
                  isConfirming={meusEventos.isConfirmingVisit}
                  item={group.eventos[0]}
                  key={group.key}
                  onCancel={(item) => { setCancelTarget(item); setCancelReason(''); }}
                  onConfirmVisit={(item) => void handleConfirmVisit(item)}
                  onOpen={handleOpenEvent}
                  onPresence={handleOpenPresence}
                />
              ))}
            </View>
          )}
        </>
      ) : null}

      {cancelTarget ? (
        <View style={styles.cancelPanel}>
          <View style={styles.cancelHeader}>
            <Ionicons name="ban-outline" size={20} color={colors.error} />
            <View style={styles.cancelTitleBlock}>
              <Text style={styles.cancelTitle}>Cancelar ocorrencia</Text>
              <Text numberOfLines={1} style={styles.cancelSubtitle}>
                {cancelTarget.titulo}
              </Text>
            </View>
          </View>
          <TextInput
            accessibilityLabel="Motivo do cancelamento"
            multiline
            placeholder="Motivo do cancelamento"
            placeholderTextColor={colors.textDisabled}
            style={styles.reasonInput}
            value={cancelReason}
            onChangeText={setCancelReason}
          />
          <Text style={styles.cancelNotice}>Cancelar nao remove o item: ele continua visivel no Historico.</Text>
          <View style={styles.cancelActions}>
            <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => setCancelTarget(null)}>
              <Ionicons name="close-outline" size={18} color={colors.brandBlue} />
              <Text style={styles.secondaryButtonText}>Voltar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!cancelReason.trim() || meusEventos.isCancellingOccurrence}
              style={[styles.dangerButton, !cancelReason.trim() || meusEventos.isCancellingOccurrence ? styles.disabledButton : null]}
              onPress={() => void handleCancelOccurrence()}
            >
              <Ionicons name="ban-outline" size={18} color={colors.surfacePrimary} />
              <Text style={styles.dangerButtonText}>{meusEventos.isCancellingOccurrence ? 'Cancelando' : 'Cancelar'}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </ScreenShell>
  );
}

type EventActionProps = {
  compact: boolean;
  canManageEvents: boolean;
  isConfirming: boolean;
  isCancelling: boolean;
  onOpen: (item: MeusEventoItem) => void;
  onPresence: (item: MeusEventoItem) => void;
  onConfirmVisit: (item: MeusEventoItem) => void;
  onCancel: (item: MeusEventoItem) => void;
};

function SingleEventCard({ item, ...actions }: { item: MeusEventoItem } & EventActionProps) {
  const statusColor = getStatusColor(item);
  return (
    <View style={[styles.eventCard, item.status === 'EM_ANDAMENTO' ? styles.eventCardLive : null]}>
      <View style={[styles.cardStripe, { backgroundColor: statusColor }]} />
      <View style={styles.cardDateColumn}>
        <Text style={[styles.cardDateDay, { color: statusColor }]}>{formatDay(item.dataReferencia)}</Text>
        <Text style={styles.cardDateMonth}>{formatMonth(item.dataReferencia)}</Text>
        <Text style={styles.cardDateYear}>{getYear(item.dataReferencia)}</Text>
      </View>
      <View style={styles.eventCardContent}>
        <View style={styles.eventCardTop}>
          <View style={styles.eventTitleRow}>
            <Text numberOfLines={2} style={styles.eventTitle}>{item.titulo}</Text>
            <StatusBadge item={item} />
          </View>
          <View style={styles.eventMetaRow}>
            <MetaLine icon="location-outline" label={item.local} />
            <MetaLine icon="people-outline" label={item.grupoNome} />
            {item.eventoCicloId ? <MetaLine icon="git-branch-outline" label="Ciclo atual" tone="success" /> : null}
            <MetaLine icon="repeat-outline" label={item.recorrente ? 'Recorrente' : 'Unico'} />
            {item.cancelada && item.motivoCancelamento ? <MetaLine icon="chatbubble-outline" label={item.motivoCancelamento} tone="danger" /> : null}
          </View>
        </View>
        <OccurrenceActions item={item} {...actions} />
      </View>
    </View>
  );
}

function RecurringEventCard({ group, ...actions }: { group: EventoGrupo } & EventActionProps) {
  const presenceItem = group.eventos.find((item) => item.permitirPresencaAgrupada);
  const firstFutureIndex = getFirstFutureIndex(group.eventos);
  return (
    <View style={styles.recurringCard}>
      <View style={styles.recurringHeader}>
        <View style={styles.recurringIconBox}><Ionicons name="sync-outline" size={22} color={colors.brandBlue} /></View>
        <View style={styles.recurringHeaderInfo}>
          <Text numberOfLines={2} style={styles.recurringTitle}>{group.titulo}</Text>
          <Text style={styles.recurringMeta}>{group.eventos.length} ocorrencias · recorrente</Text>
          {group.eventos.some((item) => item.eventoCicloId) ? <Text style={styles.recurringGroup}><Ionicons name="git-branch-outline" size={13} color={colors.success} /> Ciclo atual</Text> : null}
        </View>
        <Text style={styles.recurringTag}>Recorrente</Text>
      </View>
      {presenceItem ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir presenca em grupo" style={styles.groupPresenceButton} onPress={() => actions.onPresence(presenceItem)}>
          <Ionicons name="grid-outline" size={18} color={colors.brandBlue} />
          <Text style={styles.groupPresenceText}>Presenca em Grupo</Text>
        </Pressable>
      ) : null}
        <View style={styles.timeline}>
        {group.eventos.map((item, index) => <TimelineRow firstFutureIndex={firstFutureIndex} index={index} item={item} key={item.key} {...actions} />)}
        </View>
    </View>
  );
}

function TimelineRow({ item, index, firstFutureIndex, compact, canManageEvents, isConfirming, isCancelling, onOpen, onPresence, onConfirmVisit, onCancel }: { item: MeusEventoItem; index: number; firstFutureIndex: number } & EventActionProps) {
  const statusColor = getStatusColor(item);
  const isPast = isTimelinePast(item);
  const isNext = !isPast && index === firstFutureIndex;
  const callHighlighted = isCallHighlighted(item);
  const callMuted = isCallMuted(item);
  return (
    <View style={[styles.timelineRow, isNext ? styles.timelineRowNext : null, isPast ? styles.timelineRowPast : null, item.cancelada ? styles.timelineRowCancelled : null]}>
      <View style={[styles.timelineStripe, isNext ? styles.timelineStripeNext : null, isPast ? styles.timelineStripePast : null]} />
      <View style={styles.timelineDate}>
        <Text style={[styles.timelineDay, { color: isPast ? colors.textDisabled : statusColor }]}>{formatDay(item.dataReferencia)}</Text>
        <Text style={styles.timelineMonth}>{formatMonth(item.dataReferencia)}</Text>
      </View>
      {!compact ? (
        <View style={styles.timelineDetails}>
          <Text style={styles.timelineWeekday}>{formatWeekday(item.dataReferencia)}</Text>
          {item.eventoCicloId ? <Text style={styles.timelineCycle}>Ciclo atual</Text> : null}
          {item.cancelada && item.motivoCancelamento ? <Text numberOfLines={1} style={styles.timelineCancelReason}>{item.motivoCancelamento}</Text> : null}
        </View>
      ) : null}
      <StatusBadge item={item} compact={compact} />
      <View style={[styles.timelineActions, compact ? styles.timelineActionsCompact : null]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Registrar chamada ${item.titulo}`} style={[styles.timelineCallButton, callHighlighted ? styles.timelineCallButtonActive : null, callMuted ? styles.timelineCallButtonMuted : null]} onPress={() => onOpen(item)}>
          <Ionicons name={callHighlighted ? 'people' : 'people-outline'} size={18} color={callHighlighted ? colors.surfacePrimary : callMuted ? colors.textMuted : colors.brandBlue} />
          {!compact ? <Text style={[styles.timelineActionText, callHighlighted ? styles.timelineActionTextActive : null, callMuted ? styles.timelineActionTextMuted : null]}>Chamada</Text> : null}
        </Pressable>
        {item.permitirPresencaAgrupada ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir presenca em grupo" style={styles.timelineIconButton} onPress={() => onPresence(item)}>
            <Ionicons name="grid-outline" size={18} color={colors.brandBlue} />
          </Pressable>
        ) : null}
        {canManageEvents && !item.isVirtual && !item.cancelada && item.podeConfirmarResponsavel ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Confirmar visita" disabled={isConfirming} style={[styles.timelineIconButton, isConfirming ? styles.disabledButton : null]} onPress={() => onConfirmVisit(item)}>
            <Ionicons name="checkmark-outline" size={18} color={colors.success} />
          </Pressable>
        ) : null}
        {canManageEvents && !item.isVirtual && !item.cancelada ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Cancelar ocorrencia" disabled={isCancelling} style={[styles.timelineIconButtonDanger, isCancelling ? styles.disabledButton : null]} onPress={() => onCancel(item)}>
            <Ionicons name="trash-outline" size={17} color={colors.error} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function OccurrenceActions({ item, compact, canManageEvents, isConfirming, isCancelling, onOpen, onPresence, onConfirmVisit, onCancel }: { item: MeusEventoItem } & EventActionProps) {
  const canMutate = canManageEvents && !item.isVirtual && !item.cancelada;
  const callHighlighted = isCallHighlighted(item);
  const callMuted = isCallMuted(item);
  const callColor = callHighlighted ? colors.surfacePrimary : callMuted ? colors.textMuted : colors.brandBlue;
  return (
    <View style={styles.cardActions}>
      <Pressable accessibilityRole="button" accessibilityLabel={item.status === 'EM_ANDAMENTO' ? 'Acompanhar evento' : 'Registrar chamada'} style={[styles.callButton, callHighlighted ? styles.callButtonActive : null, callMuted ? styles.callButtonMuted : null]} onPress={() => onOpen(item)}>
        <Ionicons name={callHighlighted ? 'people' : 'people-outline'} size={18} color={callColor} />
        {!compact ? <Text style={[styles.callButtonText, callHighlighted ? styles.callButtonTextActive : null, callMuted ? styles.callButtonTextMuted : null]}>{item.status === 'EM_ANDAMENTO' ? 'Acompanhar' : 'Registrar Chamada'}</Text> : null}
        {!compact ? <Ionicons name="arrow-forward-outline" size={16} color={callColor} /> : null}
      </Pressable>
      {item.permitirPresencaAgrupada ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir presenca em grupo" style={compact ? styles.mobileIconButton : styles.groupActionButton} onPress={() => onPresence(item)}>
          <Ionicons name="grid-outline" size={18} color={colors.brandBlue} />
          {!compact ? <Text style={styles.groupActionText}>Em Grupo</Text> : null}
        </Pressable>
      ) : null}
      {canMutate && item.podeConfirmarResponsavel ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Confirmar visita" disabled={isConfirming} style={[compact ? styles.mobileIconButton : styles.confirmActionButton, isConfirming ? styles.disabledButton : null]} onPress={() => onConfirmVisit(item)}>
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
          {!compact ? <Text style={styles.confirmActionText}>Confirmar visita</Text> : null}
        </Pressable>
      ) : null}
      {canMutate ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Cancelar ocorrencia" disabled={isCancelling} style={[compact ? styles.mobileIconButtonDanger : styles.mobileIconButton, isCancelling ? styles.disabledButton : null]} onPress={() => onCancel(item)}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          {!compact ? <Text style={styles.cancelActionText}>Cancelar</Text> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

function StatusBadge({ item, compact = false }: { item: MeusEventoItem; compact?: boolean }) {
  const statusColor = getStatusColor(item);
  return <View style={[styles.eventStatusBadge, { borderColor: statusColor, backgroundColor: item.status === 'EM_ANDAMENTO' ? '#ECFDF5' : colors.surfacePrimary }]}><View style={[styles.statusDot, { backgroundColor: statusColor }]} /><Text style={[styles.eventStatusText, { color: statusColor }]}>{compact ? shortStatus(item.statusLabel) : item.statusLabel}</Text></View>;
}

function MetaLine({ icon, label, tone = 'default' }: { icon: IconName; label: string | null; tone?: 'default' | 'success' | 'danger' }) {
  if (!label) return null;
  return <View style={styles.metaLine}><Ionicons name={icon} size={14} color={tone === 'success' ? colors.success : tone === 'danger' ? colors.error : colors.textMuted} /><Text numberOfLines={1} style={[styles.metaLineText, tone === 'success' ? styles.metaLineSuccess : null, tone === 'danger' ? styles.metaLineDanger : null]}>{label}</Text></View>;
}

function ScreenShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.content, compact ? styles.mobileContent : null]}>{children}</ScrollView>
    </View>
  );
}

function StatePanel({
  kind,
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  kind: 'loading' | 'empty' | 'error';
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={[styles.statePanel, kind === 'error' ? styles.errorPanel : null]}>
      <Ionicons name={icon} size={26} color={kind === 'error' ? colors.error : colors.brandBlue} />
      <View style={styles.stateText}>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateBody}>{message}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onAction}>
          <Ionicons name="arrow-forward-outline" size={18} color={colors.brandBlue} />
          <Text style={styles.secondaryButtonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function groupEventItems(items: MeusEventoItem[]): EventoGrupo[] {
  const groups = new Map<string, EventoGrupo>();
  for (const item of items) {
    const key = `${item.eventoId}:${item.grupoId}`;
    const group = groups.get(key);
    if (group) {
      group.eventos.push(item);
      continue;
    }
    groups.set(key, { key, eventoId: item.eventoId, titulo: item.titulo, grupoNome: item.grupoNome, eventos: [item] });
  }

  return [...groups.values()]
    .map((group) => ({ ...group, eventos: [...group.eventos].sort((left, right) => toTimestamp(left.dataReferencia) - toTimestamp(right.dataReferencia)) }))
    .sort((left, right) => toTimestamp(right.eventos.at(-1)?.dataReferencia ?? '') - toTimestamp(left.eventos.at(-1)?.dataReferencia ?? ''));
}

function getFirstFutureIndex(items: MeusEventoItem[]) {
  return items.findIndex((item) => !isTimelinePast(item));
}

function getMonthOptions(year: number, currentYear: number) {
  const limit = year === currentYear ? Math.min(12, new Date().getMonth() + 2) : 12;
  return Array.from({ length: limit }, (_, index) => {
    const month = index + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const label = new Date(year, index, 1).toLocaleDateString('pt-BR', { month: 'short' });
    return { key, label: `${label} de ${year}` };
  });
}

function getYear(value: string) {
  const date = parseDate(value);
  return date ? date.getFullYear() : null;
}

function getMonthKey(value: string) {
  const date = parseDate(value);
  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : null;
}

function formatWeekday(value: string) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString('pt-BR', { weekday: 'long' }) : 'Data nao informada';
}

function shortStatus(value: string) {
  if (value === 'Realizado') return 'Concluído';
  if (value === 'Em andamento') return 'Andamento';
  return value;
}

function toTimestamp(value: string) {
  return parseDate(value)?.getTime() ?? Number.MAX_SAFE_INTEGER;
}

function resolveOpenHref(item: MeusEventoItem) {
  const day = toDayParam(item.dataReferencia);
  return `/admin/eventos/acompanhar/${item.eventoId}${day ? `?data=${day}` : ''}`;
}

function resolvePresenceHref(item: MeusEventoItem) {
  const params = new URLSearchParams({
    eventoId: String(item.eventoId),
    data: item.dataReferencia,
  });

  if (item.ocorrenciaId) params.set('ocorrenciaId', String(item.ocorrenciaId));
  if (item.grupoId > 0) params.set('grupoId', String(item.grupoId));

  return `/admin/eventos/presenca-lote?${params.toString()}`;
}

function getStatusColor(item: MeusEventoItem) {
  if (item.cancelada || item.status === 'CANCELADA') return colors.error;
  if (item.status === 'REALIZADA' || item.status === 'CONCLUIDO') return colors.success;
  if (item.status === 'EM_ANDAMENTO' || item.statusLabel === 'Pendente') return colors.warning;
  return colors.brandBlue;
}

function isTimelinePast(item: MeusEventoItem) {
  return !item.cancelada && toTimestamp(item.dataReferencia) < Date.now();
}

function isCallHighlighted(item: MeusEventoItem) {
  return !isCallMuted(item) && (item.status === 'EM_ANDAMENTO' || item.statusLabel === 'Pendente' || isTimelinePast(item));
}

function isCallMuted(item: MeusEventoItem) {
  return item.cancelada || item.status === 'CANCELADA' || item.status === 'REALIZADA' || item.status === 'CONCLUIDO';
}

function formatDay(value: string) {
  const date = parseDate(value);
  if (!date) return '--';

  return String(date.getDate()).padStart(2, '0');
}

function formatMonth(value: string) {
  const date = parseDate(value);
  if (!date) return '---';

  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function toDayParam(value: string) {
  const date = parseDate(value);
  if (!date) return '';

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfacePage,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mobileContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  pageHeaderCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xl,
    boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.06)',
  },
  pageHeaderCardMobile: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 240,
    gap: spacing.sm,
  },
  mobileHeader: {
    gap: spacing.sm,
  },
  mobileHeaderText: {
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    ...typography.caption,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    color: colors.brandBlue,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h1,
    color: colors.textHeading,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerPrimaryButton: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    boxShadow: '0px 5px 10px rgba(0, 102, 255, 0.2)',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mobileHeaderActions: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  primaryButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  mobileIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
  },
  inlineError: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  inlineErrorText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textBody,
  },
  groupSelectionPanel: {
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  groupSelectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  groupSelectionIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  groupSelectionCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  groupSelectionTitle: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: '800',
  },
  groupSelectionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  groupSearchRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePage,
    paddingHorizontal: spacing.md,
  },
  groupSearchInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    color: colors.textBody,
    fontSize: 15,
  },
  groupSelectionHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  groupSelectionGrid: {
    gap: 0,
  },
  groupResults: {
    maxHeight: 340,
  },
  groupSelectionButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  groupSelectionButtonText: {
    ...typography.bodySmall,
    flex: 1,
    maxWidth: '100%',
    color: colors.textHeading,
    fontWeight: '700',
  },
  groupFilter: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    paddingVertical: spacing.sm,
  },
  groupFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  groupFilterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  groupFilterTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: '800',
  },
  groupFilterHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  groupTabs: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  groupTab: {
    minHeight: 42,
    maxWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.md,
  },
  groupTabActive: {
    borderColor: colors.brandBlue,
    backgroundColor: colors.brandBlue,
  },
  groupTabText: {
    ...typography.bodySmall,
    flexShrink: 1,
    color: colors.textBody,
    fontWeight: '700',
  },
  groupTabTextActive: {
    color: colors.surfacePrimary,
  },
  groupTabCount: {
    ...typography.caption,
    minWidth: 18,
    color: colors.textMuted,
    fontWeight: '800',
    textAlign: 'center',
  },
  groupTabCountActive: {
    color: colors.surfacePrimary,
  },
  monthFilter: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  monthToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.lg,
  },
  monthYearButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
  },
  monthYearLabel: {
    ...typography.body,
    minWidth: 50,
    color: colors.textHeading,
    fontWeight: '800',
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  monthButton: {
    minHeight: 48,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.md,
  },
  monthButtonMobile: {
    width: '31.5%',
    minWidth: 0,
    paddingHorizontal: spacing.xs,
  },
  monthButtonActive: {
    borderColor: colors.brandBlue,
    backgroundColor: colors.brandBlue,
  },
  monthButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  monthButtonTextMobile: {
    width: '100%',
    flexShrink: 1,
  },
  monthButtonTextActive: {
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  filterExtras: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  filterPanel: {
    flex: 1,
    minWidth: 260,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
    boxShadow: '0px 1px 2px rgba(15, 23, 42, 0.06)',
  },
  filterPanelCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  filterPanelTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: '800',
  },
  filterPanelText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  eventGroups: {
    gap: spacing.md,
  },
  eventCard: {
    minHeight: 150,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.05)',
  },
  eventCardLive: {
    borderColor: '#86EFAC',
  },
  cardStripe: {
    width: 4,
  },
  cardDateColumn: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
    backgroundColor: colors.surfacePage,
    padding: spacing.sm,
  },
  cardDateDay: {
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 30,
  },
  cardDateMonth: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardDateYear: {
    ...typography.caption,
    color: colors.textDisabled,
  },
  eventCardContent: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
    padding: spacing.md,
  },
  eventCardTop: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  eventTitle: {
    flex: 1,
    minWidth: 160,
    ...typography.h3,
    color: colors.textHeading,
    fontWeight: '700',
  },
  eventStatusBadge: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  eventStatusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  eventMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaLine: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaLineText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  metaLineSuccess: {
    color: colors.success,
  },
  metaLineDanger: {
    color: colors.error,
  },
  callButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.md,
  },
  callButtonActive: {
    borderColor: colors.brandBlue,
    backgroundColor: colors.brandBlue,
    boxShadow: '0px 5px 9px rgba(0, 102, 255, 0.18)',
  },
  callButtonMuted: {
    borderColor: colors.borderSubtle,
    backgroundColor: '#F8FAFC',
  },
  callButtonText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  callButtonTextActive: {
    color: colors.surfacePrimary,
  },
  callButtonTextMuted: {
    color: colors.textMuted,
  },
  groupActionButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.md,
  },
  groupActionText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  confirmActionButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.md,
  },
  confirmActionText: {
    ...typography.bodySmall,
    color: '#166534',
    fontWeight: '700',
  },
  cancelActionText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '700',
  },
  recurringCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.06)',
  },
  recurringHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: '#F8FBFF',
    padding: spacing.md,
  },
  recurringIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: '#EFF6FF',
  },
  recurringHeaderInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  recurringTitle: {
    ...typography.h3,
    color: colors.textHeading,
    fontWeight: '700',
  },
  recurringMeta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  recurringGroup: {
    ...typography.caption,
    color: colors.textMuted,
  },
  recurringTag: {
    ...typography.caption,
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: radius.full,
    color: '#059669',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  groupPresenceButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radius.sm,
    backgroundColor: '#EFF6FF',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  groupPresenceText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  timeline: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  timelineRow: {
    minHeight: 74,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    padding: spacing.sm,
  },
  timelineRowNext: {
    backgroundColor: '#EEF6FF',
  },
  timelineRowPast: {
    backgroundColor: '#FBFCFD',
  },
  timelineRowCancelled: {
    backgroundColor: '#FFF7F7',
  },
  timelineStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.borderSubtle,
  },
  timelineStripeNext: {
    backgroundColor: colors.brandBlue,
  },
  timelineStripePast: {
    backgroundColor: colors.textDisabled,
  },
  timelineDate: {
    width: 44,
    alignItems: 'center',
  },
  timelineDay: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 23,
  },
  timelineMonth: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timelineDetails: {
    flex: 1,
    minWidth: 80,
    gap: 1,
  },
  timelineWeekday: {
    ...typography.bodySmall,
    color: colors.textBody,
    textTransform: 'capitalize',
  },
  timelineCycle: {
    ...typography.caption,
    color: colors.success,
  },
  timelineCancelReason: {
    ...typography.caption,
    color: colors.error,
  },
  timelineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  timelineActionsCompact: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-end',
  },
  timelineCallButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radius.sm,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
  },
  timelineCallButtonActive: {
    borderColor: colors.brandBlue,
    backgroundColor: colors.brandBlue,
  },
  timelineActionText: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  timelineActionTextActive: {
    color: colors.surfacePrimary,
  },
  timelineActionTextMuted: {
    color: colors.textMuted,
  },
  timelineCallButtonMuted: {
    borderColor: colors.borderSubtle,
    backgroundColor: 'transparent',
  },
  timelineIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radius.sm,
    backgroundColor: '#EFF6FF',
  },
  timelineIconButtonDanger: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.sm,
    backgroundColor: '#FEF2F2',
  },
  mobileStack: {
    gap: spacing.lg,
  },
  desktopGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  summaryPanel: {
    minWidth: 240,
    gap: spacing.sm,
  },
  mobileSummaryPanel: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
  },
  metric: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  mobileMetric: {
    flex: 1,
    minHeight: 72,
    padding: spacing.sm,
  },
  metricText: {
    flex: 1,
    minWidth: 0,
  },
  metricValue: {
    ...typography.h2,
    color: colors.textHeading,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mobileMetricLabel: {
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'none',
  },
  sectionStack: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textHeading,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  sectionCount: {
    ...typography.body,
    minWidth: 44,
    color: colors.brandBlue,
    fontWeight: '700',
    textAlign: 'right',
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    minHeight: 170,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dateBox: {
    width: 54,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  dateDay: {
    ...typography.h2,
    fontWeight: '800',
  },
  dateMonth: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: '700',
  },
  cardMeta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  statusPill: {
    minHeight: 30,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaStack: {
    gap: spacing.sm,
  },
  metaItem: {
    minHeight: 30,
    minWidth: 180,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textSecondary,
  },
  cancelledPanel: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  cancelledText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textBody,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dangerOutlineButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  dangerOutlineText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '700',
  },
  mobileIconButtonDanger: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.sm,
    backgroundColor: '#FEF2F2',
  },
  dangerButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
  },
  dangerButtonText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.56,
  },
  emptySection: {
    minHeight: 78,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  emptySectionText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  statePanel: {
    minHeight: 128,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  errorPanel: {
    borderColor: colors.error,
  },
  stateText: {
    gap: spacing.xs,
  },
  stateTitle: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: '700',
  },
  stateBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cancelPanel: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  cancelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cancelTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  cancelTitle: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: '700',
  },
  cancelSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reasonInput: {
    ...typography.bodySmall,
    minHeight: 90,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    color: colors.textBody,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  cancelNotice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cancelActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
