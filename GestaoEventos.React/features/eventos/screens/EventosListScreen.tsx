import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { track } from '../../../services/analytics/analytics.service';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { layoutMetrics } from '../../../shared/theme';
import { useEventos } from '../hooks/useEventos';
import {
  defaultEventosFilters,
  normalizeEventosFilters,
  type EventoListItem,
  type EventosFilters,
  type EventosPeriodo,
  type EventosStatus,
  type EventosTipo,
} from '../services/eventos.service';

type IconName = keyof typeof Ionicons.glyphMap;

type EventosRouteParams = {
  titulo?: string | string[];
  periodo?: string | string[];
  status?: string | string[];
  tipo?: string | string[];
  grupo?: string | string[];
  responsavel?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
};

type Option<T extends string> = {
  label: string;
  value: T;
  icon: IconName;
};

const periodoOptions: Option<EventosPeriodo>[] = [
  { label: 'Todos', value: 'todos', icon: 'calendar-outline' },
  { label: 'Hoje', value: 'hoje', icon: 'today-outline' },
  { label: 'Semana', value: 'semana', icon: 'calendar-number-outline' },
  { label: 'Mes', value: 'mes', icon: 'calendar-clear-outline' },
  { label: 'Ano', value: 'ano', icon: 'albums-outline' },
  { label: 'Historico', value: 'historico', icon: 'time-outline' },
];

const statusOptions: Option<EventosStatus>[] = [
  { label: 'Todos', value: 'todos', icon: 'layers-outline' },
  { label: 'Ativos', value: 'ativos', icon: 'radio-button-on-outline' },
  { label: 'Agendado', value: 'agendado', icon: 'calendar-outline' },
  { label: 'Em andamento', value: 'em_andamento', icon: 'play-circle-outline' },
  { label: 'Realizado', value: 'realizado', icon: 'checkmark-circle-outline' },
  { label: 'CANCELADO', value: 'cancelado', icon: 'close-circle-outline' },
];

const tipoOptions: Option<EventosTipo>[] = [
  { label: 'Todos', value: 'todos', icon: 'grid-outline' },
  { label: 'Recorrente', value: 'recorrente', icon: 'repeat-outline' },
  { label: 'Unico', value: 'unico', icon: 'ellipse-outline' },
  { label: 'Modelo', value: 'template', icon: 'bookmark-outline' },
];

export function EventosListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<EventosRouteParams>();
  const initialFilters = parseRouteFilters(params);
  const eventos = useEventos(initialFilters);
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const [draftFilters, setDraftFilters] = useState<EventosFilters>(() => initialFilters);

  function updateDraft<K extends keyof EventosFilters>(key: K, value: EventosFilters[K]) {
    setDraftFilters((current) => normalizeEventosFilters({ ...current, [key]: value, pageNumber: 1 }));
  }

  function handleApplyFilters() {
    const nextFilters = normalizeEventosFilters({ ...draftFilters, pageNumber: 1 });
    eventos.setFilters(nextFilters);
    router.setParams(toRouteParams(nextFilters));
  }

  function handleClearFilters() {
    const nextFilters = defaultEventosFilters;
    setDraftFilters(nextFilters);
    eventos.clearFilters();
    router.setParams(toRouteParams(nextFilters));
  }

  function handlePageChange(pageNumber: number) {
    const nextFilters = normalizeEventosFilters({ ...eventos.filters, pageNumber });
    setDraftFilters(nextFilters);
    eventos.setFilters(nextFilters);
    router.setParams(toRouteParams(nextFilters));
  }

  function handleOpenItem(item: EventoListItem) {
    track('entrance', 'btn:evento_abrir', {
      extra: {
        evento_id: item.eventoId,
        ocorrencia_id: item.ocorrenciaId,
      },
    });
    router.push(resolveItemHref(item) as Href);
  }

  if (eventos.contextError) {
    return (
      <ScreenShell>
        <ErrorState title="Contexto obrigatorio" message={eventos.contextError} onRetry={() => void eventos.refetch()} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Operacao</Text>
          <Text style={styles.title}>Eventos</Text>
          <Text style={styles.subtitle}>Lista operacional por estrutura e grupo ativo.</Text>
        </View>
        <Pressable accessibilityRole="button" style={styles.refreshButton} onPress={() => void eventos.refetch()}>
          <Ionicons name="refresh-outline" size={18} color={colors.brandBlue} />
          <Text style={styles.refreshText}>{eventos.isFetching ? 'Atualizando' : 'Atualizar'}</Text>
        </Pressable>
      </View>

      <View style={styles.summaryRail}>
        <SummaryMetric label="Itens" value={String(eventos.items.length)} icon="albums-outline" />
        <SummaryMetric label="Ocorrencias" value={String(eventos.data?.totalOcorrencias ?? 0)} icon="calendar-outline" />
        <SummaryMetric label="Cancelados" value={String(eventos.data?.totalCancelados ?? 0)} icon="close-circle-outline" />
      </View>

      <View style={compact ? styles.mobileStack : styles.desktopGrid}>
        <FilterPanel
          draftFilters={draftFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          onUpdate={updateDraft}
        />

        <View style={styles.listColumn}>
          {eventos.isInitialLoading ? <LoadingState /> : null}

          {eventos.isError ? (
            <ErrorState
              title="Nao foi possivel carregar eventos"
              message={eventos.errorMessage ?? 'Tente novamente em instantes.'}
              onRetry={() => void eventos.refetch()}
            />
          ) : null}

          {!eventos.isInitialLoading && !eventos.isError && eventos.items.length === 0 ? (
            <EmptyState onClear={handleClearFilters} />
          ) : null}

          {!eventos.isInitialLoading && !eventos.isError && eventos.items.length > 0 ? (
            <View style={styles.list}>
              {eventos.items.map((item) => (
                <EventoCard item={item} key={item.key} compact={compact} onOpen={handleOpenItem} />
              ))}
            </View>
          ) : null}

          {eventos.pageInfo ? (
            <Pagination
              currentPage={eventos.filters.pageNumber}
              totalPages={eventos.pageInfo.totalPages}
              onPageChange={handlePageChange}
            />
          ) : null}
        </View>
      </View>
    </ScreenShell>
  );
}

function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

function FilterPanel({
  draftFilters,
  onApply,
  onClear,
  onUpdate,
}: {
  draftFilters: EventosFilters;
  onApply: () => void;
  onClear: () => void;
  onUpdate: <K extends keyof EventosFilters>(key: K, value: EventosFilters[K]) => void;
}) {
  return (
    <View style={styles.filterPanel}>
      <View style={styles.sectionHeader}>
        <Ionicons name="filter-outline" size={20} color={colors.brandBlue} />
        <Text style={styles.sectionTitle}>Filtros</Text>
      </View>

      <FilterTextInput
        icon="search-outline"
        label="Titulo"
        value={draftFilters.titulo}
        onChangeText={(value) => onUpdate('titulo', value)}
      />
      <FilterTextInput
        icon="people-outline"
        label="Grupo"
        value={draftFilters.grupo}
        onChangeText={(value) => onUpdate('grupo', value)}
      />
      <FilterTextInput
        icon="person-outline"
        label="Responsavel"
        value={draftFilters.responsavel}
        onChangeText={(value) => onUpdate('responsavel', value)}
      />

      <FilterChoiceGroup label="Periodo" options={periodoOptions} value={draftFilters.periodo} onChange={(value) => onUpdate('periodo', value)} />
      <FilterChoiceGroup label="Status" options={statusOptions} value={draftFilters.status} onChange={(value) => onUpdate('status', value)} />
      <FilterChoiceGroup label="Tipo" options={tipoOptions} value={draftFilters.tipo} onChange={(value) => onUpdate('tipo', value)} />

      <View style={styles.filterActions}>
        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={onApply}>
          <Ionicons name="search-outline" size={18} color={colors.surfacePrimary} />
          <Text style={styles.primaryButtonText}>Aplicar</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onClear}>
          <Ionicons name="close-outline" size={18} color={colors.brandBlue} />
          <Text style={styles.secondaryButtonText}>Limpar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FilterTextInput({
  icon,
  label,
  value,
  onChangeText,
}: {
  icon: IconName;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.textInputFrame}>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={label}
          placeholderTextColor={colors.textDisabled}
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

function FilterChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.choiceGrid}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : undefined}
              key={option.value}
              style={[styles.choiceButton, active ? styles.choiceButtonActive : null]}
              onPress={() => onChange(option.value)}
            >
              <Ionicons name={option.icon} size={16} color={active ? colors.brandBlue : colors.textMuted} />
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.82}
                numberOfLines={1}
                style={[styles.choiceText, active ? styles.choiceTextActive : null]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function EventoCard({ item, compact, onOpen }: { item: EventoListItem; compact: boolean; onOpen: (item: EventoListItem) => void }) {
  const statusColor = getStatusColor(item);

  return (
    <Pressable accessibilityRole="button" style={styles.eventCard} onPress={() => onOpen(item)}>
      <View style={styles.cardHeader}>
        <View style={[styles.sourceIcon, { borderColor: statusColor }]}>
          <Ionicons name={item.tipo === 'ocorrencia' ? 'calendar-outline' : 'albums-outline'} size={20} color={statusColor} />
        </View>
        <View style={styles.cardTitleBlock}>
          <Text numberOfLines={2} style={styles.cardTitle}>
            {item.titulo}
          </Text>
          <Text numberOfLines={1} style={styles.cardMeta}>
            {getSourceLabel(item)} | {formatDateTime(item.dataReferencia)}
          </Text>
        </View>
        <StatusPill label={item.status} color={statusColor} />
      </View>

      <View style={compact ? styles.metaStack : styles.metaGrid}>
        <MetaItem icon="people-outline" label={item.grupoNome} />
        <MetaItem icon="person-outline" label={item.responsavelNome ?? 'Responsavel nao informado'} />
        <MetaItem icon="location-outline" label={item.local ?? 'Local nao informado'} />
        <MetaItem icon="repeat-outline" label={item.recorrente ? 'Recorrente' : 'Unico'} />
      </View>

      {item.cancelado ? (
        <View style={styles.cancelledPanel}>
          <Ionicons name="warning-outline" size={18} color={colors.error} />
          <Text style={styles.cancelledText}>{item.motivoCancelamento ?? 'Evento cancelado preservado no historico.'}</Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>{item.eventoTemplateId ? 'Modelo vinculado' : 'Sem modelo vinculado'}</Text>
        <Pressable accessibilityRole="button" style={styles.cardAction} onPress={() => onOpen(item)}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={styles.cardActionText}>
            {getActionLabel(item)}
          </Text>
          <Ionicons name="arrow-forward-outline" size={16} color={colors.surfacePrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function SummaryMetric({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <View style={styles.summaryMetric}>
      <Ionicons name={icon} size={18} color={colors.brandBlue} />
      <View style={styles.metricText}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </View>
  );
}

function MetaItem({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text numberOfLines={1} style={styles.metaText}>
        {label}
      </Text>
    </View>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.statusPill, { borderColor: color }]}>
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.statePanel}>
      <View style={styles.skeletonWide} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonShort} />
    </View>
  );
}

function ErrorState({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <View style={[styles.statePanel, styles.errorPanel]}>
      <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
      <View style={styles.stateText}>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateBody}>{message}</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onRetry}>
        <Ionicons name="refresh-outline" size={18} color={colors.brandBlue} />
        <Text style={styles.secondaryButtonText}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <View style={styles.statePanel}>
      <Ionicons name="file-tray-outline" size={26} color={colors.textMuted} />
      <View style={styles.stateText}>
        <Text style={styles.stateTitle}>Nenhum evento encontrado</Text>
        <Text style={styles.stateBody}>Os filtros atuais nao retornaram eventos neste contexto.</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onClear}>
        <Ionicons name="close-outline" size={18} color={colors.brandBlue} />
        <Text style={styles.secondaryButtonText}>Limpar filtros</Text>
      </Pressable>
    </View>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}) {
  const canGoBack = currentPage > 1;
  const canGoForward = totalPages === 0 || currentPage < totalPages;

  return (
    <View style={styles.pagination}>
      <Pressable
        accessibilityRole="button"
        disabled={!canGoBack}
        style={[styles.pageButton, !canGoBack ? styles.disabledButton : null]}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <Ionicons name="chevron-back-outline" size={18} color={canGoBack ? colors.brandBlue : colors.textDisabled} />
        <Text style={[styles.pageButtonText, !canGoBack ? styles.disabledText : null]}>Anterior</Text>
      </Pressable>
      <Text style={styles.pageInfo}>{totalPages > 0 ? `${currentPage}/${totalPages}` : String(currentPage)}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={!canGoForward}
        style={[styles.pageButton, !canGoForward ? styles.disabledButton : null]}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <Text style={[styles.pageButtonText, !canGoForward ? styles.disabledText : null]}>Proxima</Text>
        <Ionicons name="chevron-forward-outline" size={18} color={canGoForward ? colors.brandBlue : colors.textDisabled} />
      </Pressable>
    </View>
  );
}

function parseRouteFilters(params: EventosRouteParams): EventosFilters {
  return normalizeEventosFilters({
    titulo: readParam(params.titulo),
    periodo: readParam(params.periodo) as EventosPeriodo,
    status: readParam(params.status) as EventosStatus,
    tipo: readParam(params.tipo) as EventosTipo,
    grupo: readParam(params.grupo),
    responsavel: readParam(params.responsavel),
    pageNumber: Number(readParam(params.page)),
    pageSize: Number(readParam(params.pageSize)),
  });
}

function toRouteParams(filters: EventosFilters) {
  return {
    titulo: filters.titulo,
    periodo: filters.periodo,
    status: filters.status,
    tipo: filters.tipo,
    grupo: filters.grupo,
    responsavel: filters.responsavel,
    page: String(filters.pageNumber),
    pageSize: String(filters.pageSize),
  };
}

function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function resolveItemHref(item: EventoListItem) {
  if (item.isTemplate) return '/admin/eventos/modelos';
  if (item.tipo === 'ocorrencia') {
    return `/admin/eventos/acompanhar/${item.eventoId}?data=${encodeURIComponent(item.dataReferencia.slice(0, 10))}`;
  }

  return '/admin/eventos/iniciar';
}

function getSourceLabel(item: EventoListItem) {
  return item.tipo === 'ocorrencia' ? 'Ocorrencia' : 'Evento planejado';
}

function getActionLabel(item: EventoListItem) {
  if (item.isTemplate) return 'Ver modelo';
  if (item.status === 'EM_ANDAMENTO') return 'Acompanhar';
  if (item.cancelado) return 'Ver historico';
  if (item.tipo === 'evento') return 'Iniciar';
  return 'Abrir';
}

function getStatusColor(item: EventoListItem) {
  if (item.cancelado || item.status === 'CANCELADO') return colors.error;
  if (item.status === 'REALIZADA' || item.status === 'CONCLUIDO') return colors.success;
  if (item.status === 'EM_ANDAMENTO') return colors.warning;
  if (item.status === 'AGENDADA' || item.status === 'PUBLICADO') return colors.info;
  return colors.brandBlue;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Data nao informada';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  refreshButton: {
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
  refreshText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  summaryRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryMetric: {
    minWidth: 148,
    minHeight: 64,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
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
  mobileStack: {
    gap: spacing.lg,
  },
  desktopGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  filterPanel: {
    minWidth: 280,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  listColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
  },
  sectionHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textHeading,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: '700',
  },
  textInputFrame: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.md,
  },
  textInput: {
    ...typography.bodySmall,
    minHeight: 44,
    flex: 1,
    color: colors.textBody,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  choiceButton: {
    minHeight: 44,
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  choiceButtonActive: {
    borderColor: colors.brandBlue,
    backgroundColor: colors.surfaceMuted,
  },
  choiceText: {
    ...typography.caption,
    maxWidth: 120,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  choiceTextActive: {
    color: colors.brandBlue,
  },
  filterActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  primaryButton: {
    minHeight: 44,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
  list: {
    gap: spacing.md,
  },
  eventCard: {
    minHeight: 156,
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
  sourceIcon: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
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
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaStack: {
    gap: spacing.sm,
  },
  metaItem: {
    minHeight: 32,
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
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardFooterText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardAction: {
    minHeight: 44,
    minWidth: 132,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.md,
  },
  cardActionText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  statePanel: {
    minHeight: 120,
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
  skeletonWide: {
    width: '76%',
    height: 18,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  skeletonLine: {
    width: '56%',
    height: 14,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  skeletonShort: {
    width: '36%',
    height: 14,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  pagination: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pageButton: {
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
  disabledButton: {
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceDisabled,
  },
  pageButtonText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  disabledText: {
    color: colors.textDisabled,
  },
  pageInfo: {
    ...typography.bodySmall,
    minWidth: 60,
    color: colors.textBody,
    fontWeight: '700',
    textAlign: 'center',
  },
});
