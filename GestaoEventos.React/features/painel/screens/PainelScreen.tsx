import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { normalizeApiError } from '../../../services/api/api-error';
import { track } from '../../../services/analytics/analytics.service';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { layoutMetrics } from '../../../shared/theme';
import { useContextStore } from '../../../stores/context.store';
import { usePainel } from '../hooks/usePainel';
import { type PainelItem, type PainelTipo } from '../../../services/api/painel-api';

const typeOptions: { value: PainelTipo; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'presenca-media', label: 'Presenca media', icon: 'checkmark-circle-outline' },
  { value: 'crescimento', label: 'Crescimento', icon: 'trending-up-outline' },
  { value: 'eventos-realizados', label: 'Eventos realizados', icon: 'calendar-outline' },
];

const periodOptions = [
  { value: 'mes' as const, label: 'Mes' },
  { value: 'trimestre' as const, label: 'Trimestre' },
  { value: 'ano' as const, label: 'Ano' },
];

export function PainelScreen() {
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const router = useRouter();
  const state = usePainel();
  const estruturaNome = useContextStore((store) => store.estruturaNome);
  const grupoNome = useContextStore((store) => store.grupoNome);
  const data = state.query.data;
  const error = state.query.error ? normalizeApiError(state.query.error, 'Nao foi possivel carregar o painel.') : null;

  const maxChartValue = useMemo(
    () => Math.max(...(data?.comparativoMeses.map((item) => item.valor) ?? [0]), 1),
    [data?.comparativoMeses],
  );

  function openGroup(item: PainelItem) {
    track('entrance', 'painel:grupo_abrir', { extra: { grupo_id: item.id } });
    router.push(`/admin/grupos/${item.id}` as Href);
  }

  if (state.contextError) {
    return <CenteredState title="Contexto obrigatorio" message={state.contextError} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact]}>
        <View style={styles.headerCard}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Painel Comparativo</Text>
            <Text style={styles.subtitle}>Acompanhe tendencias e comparativos.</Text>
            <Text style={styles.contextMeta}>Indicadores de {estruturaNome ?? 'estrutura ativa'}{grupoNome ? ` / ${grupoNome}` : ''}.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atualizar painel"
            accessibilityState={{ disabled: state.query.isFetching }}
            disabled={state.query.isFetching}
            style={[styles.iconAction, state.query.isFetching && styles.disabled]}
            onPress={state.refetch}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.brandBlue} />
          </Pressable>
        </View>

        <FilterPanel state={state} compact={compact} />

        {state.groupError ? <Text style={styles.filterHint}>{state.groupError}</Text> : null}

        {state.query.isLoading ? <LoadingState compact={compact} /> : null}

        {state.query.isError ? (
          <ErrorState
            forbidden={error?.status === 403}
            message={error?.status === 403 ? 'Seu contexto atual nao permite visualizar este painel.' : error?.message ?? 'Tente novamente em instantes.'}
            onRetry={state.refetch}
          />
        ) : null}

        {!state.query.isLoading && !state.query.isError && data && data.items.length === 0 ? (
          <EmptyState />
        ) : null}

        {!state.query.isLoading && !state.query.isError && data && data.items.length > 0 ? (
          <>
            <SummaryGrid data={data} tipo={state.tipo} compact={compact} />
            <TrendSection months={data.comparativoMeses} maxValue={maxChartValue} tipo={state.tipo} />
            <GroupComparison items={data.items} tipo={state.tipo} onOpen={openGroup} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterPanel({ state, compact }: { state: ReturnType<typeof usePainel>; compact: boolean }) {
  return (
    <View style={styles.filters}>
      <View style={styles.filterHeading}>
        <View style={styles.filterTitleRow}>
          <Ionicons name="options-outline" size={18} color={colors.brandBlue} />
          <Text style={styles.sectionTitle}>Filtros</Text>
        </View>
        <Text style={styles.filterHint}>Atualizacao automatica por contexto</Text>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Indicador</Text>
        <ScrollView horizontal={!compact} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
          {typeOptions.map((option) => (
            <FilterOption key={option.value} label={option.label} icon={option.icon} active={state.tipo === option.value} onPress={() => state.applyTipo(option.value)} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Periodo</Text>
        <View style={styles.optionRow}>
          {periodOptions.map((option) => (
            <FilterOption key={option.value} label={option.label} active={state.periodo === option.value} onPress={() => state.applyPeriodo(option.value)} />
          ))}
        </View>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Grupo</Text>
        {compact ? <MobileGroupPicker state={state} /> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>
          <FilterOption label="Toda estrutura" active={state.grupoId === null} onPress={() => state.applyGrupo(null)} />
          {state.groups.map((group) => <FilterOption key={group.id} label={group.nome} active={state.grupoId === group.id} onPress={() => state.applyGrupo(group.id)} />)}
        </ScrollView>}
      </View>
    </View>
  );
}

function MobileGroupPicker({ state }: { state: ReturnType<typeof usePainel> }) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const selected = state.groups.find((group) => group.id === state.grupoId)?.nome ?? 'Toda estrutura';
  const groups = state.groups.filter((group) => group.nome.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')));

  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Selecionar grupo. Atual: ${selected}`} style={mobileGroupStyles.groupPickerButton} onPress={() => setVisible(true)}>
      <View style={mobileGroupStyles.groupPickerIcon}><Ionicons name="git-network-outline" size={18} color={colors.brandBlue} /></View>
      <View style={mobileGroupStyles.groupPickerText}><Text style={mobileGroupStyles.groupPickerCaption}>Grupo selecionado</Text><Text numberOfLines={1} style={mobileGroupStyles.groupPickerValue}>{selected}</Text></View>
      <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
    </Pressable>
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <View style={mobileGroupStyles.groupModalOverlay}><View style={mobileGroupStyles.groupModal}>
        <View style={mobileGroupStyles.groupModalHeader}><View style={mobileGroupStyles.groupPickerText}><Text style={styles.sectionTitle}>Selecionar grupo</Text><Text style={styles.filterHint}>{state.groups.length} grupo(s) disponível(is)</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fechar seletor de grupo" onPress={() => setVisible(false)}><Ionicons name="close-outline" size={25} color={colors.textSecondary} /></Pressable></View>
        <View style={mobileGroupStyles.groupSearch}><Ionicons name="search-outline" size={18} color={colors.textMuted} /><TextInput accessibilityLabel="Buscar grupo" value={search} onChangeText={setSearch} placeholder="Buscar grupo por nome" placeholderTextColor={colors.textMuted} style={mobileGroupStyles.groupSearchInput} autoFocus /></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={mobileGroupStyles.groupModalList}>
          <FilterOption label="Toda estrutura" active={state.grupoId === null} onPress={() => { state.applyGrupo(null); setVisible(false); }} />
          {groups.map((group) => <FilterOption key={group.id} label={group.nome} active={state.grupoId === group.id} onPress={() => { state.applyGrupo(group.id); setVisible(false); }} />)}
          {!groups.length ? <Text style={styles.emptyInline}>Nenhum grupo encontrado.</Text> : null}
        </ScrollView>
      </View></View>
    </Modal>
  </>;
}

function FilterOption({ label, icon, active, onPress }: { label: string; icon?: keyof typeof Ionicons.glyphMap; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.filterOption, active && styles.filterOptionActive]} onPress={onPress}>
      {icon ? <Ionicons name={icon} size={16} color={active ? colors.brandBlue : colors.textSecondary} /> : null}
      <Text style={[styles.filterOptionText, active && styles.filterOptionTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SummaryGrid({ data, tipo, compact }: { data: NonNullable<ReturnType<typeof usePainel>['query']['data']>; tipo: PainelTipo; compact: boolean }) {
  return (
    <View style={[styles.summaryGrid, compact && styles.summaryGridCompact]}>
      <MetricCard compact={compact} label={valueLabel(tipo)} value={formatValue(data.resumo.mediaGeral, tipo)} variation={data.resumo.variacaoMedia} tipo={tipo} icon="analytics-outline" />
      <MetricCard compact={compact} label="Grupos analisados" value={String(data.resumo.totalGrupos)} icon="people-outline" />
      <MetricCard compact={compact} label="Acima da media" value={String(data.resumo.gruposAcima)} icon="arrow-up-circle-outline" tone="success" />
      <MetricCard compact={compact} label="Abaixo da media" value={String(data.resumo.gruposAbaixo)} icon="arrow-down-circle-outline" tone="warning" />
    </View>
  );
}

function MetricCard({ label, value, variation, tipo, icon, tone = 'brand', compact = false }: { label: string; value: string; variation?: number; tipo?: PainelTipo; icon: keyof typeof Ionicons.glyphMap; tone?: 'brand' | 'success' | 'warning'; compact?: boolean }) {
  const accent = tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.brandBlue;
  return (
    <View style={[styles.metricCard, compact && { flexBasis: '47%', minWidth: 0, padding: spacing.sm }]}>
      <View style={styles.metricTop}><Ionicons name={icon} size={20} color={accent} /><Text style={styles.metricLabel}>{label}</Text></View>
      <Text style={styles.metricValue}>{value}</Text>
      {variation !== undefined ? <Text style={[styles.metricVariation, variation < 0 && styles.negative]}>{formatVariation(variation, tipo)}</Text> : <Text style={styles.metricFootnote}>No periodo selecionado</Text>}
    </View>
  );
}

function TrendSection({ months, maxValue, tipo }: { months: { mes: string; valor: number }[]; maxValue: number; tipo: PainelTipo }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}><View style={styles.sectionTitleRow}><Ionicons name="trending-up-outline" size={19} color={colors.brandBlue} /><Text style={styles.sectionTitle}>Evolucao no periodo</Text></View><Text style={styles.sectionMeta}>{months.length} referencia(s)</Text></View>
      {months.length === 0 ? <Text style={styles.emptyInline}>Sem serie historica para os filtros atuais.</Text> : <View style={styles.chart}>{months.map((month) => <View key={month.mes} style={styles.chartRow}><Text style={styles.chartLabel}>{month.mes}</Text><View style={styles.chartTrack}><View style={[styles.chartBar, { width: `${Math.max(3, (month.valor / maxValue) * 100)}%` }]} /></View><Text style={styles.chartValue}>{formatValue(month.valor, tipo)}</Text></View>)}</View>}
    </View>
  );
}

function GroupComparison({ items, tipo, onOpen }: { items: PainelItem[]; tipo: PainelTipo; onOpen: (item: PainelItem) => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}><View style={styles.sectionTitleRow}><Ionicons name="git-network-outline" size={19} color={colors.brandBlue} /><Text style={styles.sectionTitle}>Comparacao por grupo</Text></View><Text style={styles.sectionMeta}>{items.length} grupo(s)</Text></View>
      <View style={styles.groupList}>{items.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Abrir grupo ${item.nome}`} style={styles.groupRow} onPress={() => onOpen(item)}><View style={styles.groupMain}><View style={styles.groupTitleRow}><Text style={styles.groupName}>{item.nome}</Text><TrendPill tendencia={item.tendencia} /></View><View style={styles.valueRow}><Text style={styles.groupValue}>Atual {formatValue(item.valor, tipo)}</Text><Text style={styles.groupPrevious}>Anterior {formatValue(item.valorAnterior, tipo)}</Text><Text style={[styles.groupVariation, item.variacao < 0 && styles.negative]}>{formatVariation(item.variacao, tipo)}</Text></View></View><Ionicons name="chevron-forward" size={19} color={colors.textMuted} /></Pressable>)}</View>
    </View>
  );
}

function TrendPill({ tendencia }: { tendencia: PainelItem['tendencia'] }) {
  const positive = tendencia === 'crescente';
  const negative = tendencia === 'decrescente';
  return <View style={[styles.trendPill, positive && styles.trendPositive, negative && styles.trendNegative]}><Ionicons name={positive ? 'arrow-up' : negative ? 'arrow-down' : 'remove'} size={13} color={positive ? colors.success : negative ? colors.error : colors.textMuted} /><Text style={[styles.trendText, positive && styles.successText, negative && styles.negative]}>{positive ? 'Crescente' : negative ? 'Decrescente' : 'Estavel'}</Text></View>;
}

function LoadingState({ compact }: { compact: boolean }) {
  return <View style={styles.loading}><ActivityIndicator color={colors.brandBlue} /><Text style={styles.loadingText}>Carregando indicadores do contexto atual...</Text><View style={[styles.loadingGrid, compact && styles.loadingGridCompact]}>{[1, 2, 3, 4].map((item) => <View key={item} style={styles.skeleton} />)}</View></View>;
}

function EmptyState() {
  return <View style={styles.statePanel}><Ionicons name="bar-chart-outline" size={28} color={colors.textMuted} /><Text style={styles.stateTitle}>Nenhum indicador disponivel</Text><Text style={styles.stateMessage}>Nao ha dados para o periodo, indicador e grupo selecionados.</Text></View>;
}

function ErrorState({ forbidden, message, onRetry }: { forbidden: boolean; message: string; onRetry: () => void }) {
  return <View style={styles.statePanel}><Ionicons name={forbidden ? 'lock-closed-outline' : 'cloud-offline-outline'} size={28} color={colors.error} /><Text style={styles.stateTitle}>{forbidden ? 'Acesso negado' : 'Falha ao carregar painel'}</Text><Text accessibilityRole="alert" style={styles.stateMessage}>{message}</Text>{!forbidden ? <Pressable accessibilityRole="button" style={styles.retryButton} onPress={onRetry}><Ionicons name="refresh-outline" size={17} color={colors.brandBlue} /><Text style={styles.retryText}>Tentar novamente</Text></Pressable> : null}</View>;
}

function CenteredState({ title, message }: { title: string; message: string }) {
  return <SafeAreaView style={styles.safe}><View style={styles.centered}><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateMessage}>{message}</Text></View></SafeAreaView>;
}

function valueLabel(tipo: PainelTipo) { return tipo === 'presenca-media' ? 'Media de presenca' : tipo === 'crescimento' ? 'Participantes unicos' : 'Eventos realizados'; }
function formatValue(value: number, tipo: PainelTipo) { return tipo === 'presenca-media' ? `${value.toFixed(1)}%` : String(Math.round(value)); }
function formatVariation(value: number, tipo?: PainelTipo) { const sign = value > 0 ? '+' : ''; return `${sign}${value.toFixed(tipo === 'eventos-realizados' ? 0 : 1)}${tipo === 'presenca-media' ? ' p.p.' : tipo === 'eventos-realizados' ? '' : '%'}`; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage }, content: { width: '100%', maxWidth: 1200, alignSelf: 'center', padding: spacing.lg, gap: spacing.lg }, contentCompact: { padding: spacing.md, gap: spacing.md }, centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm }, headerCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.lg }, headerText: { flex: 1, minWidth: 0, gap: spacing.xs }, title: { ...typography.h1, color: colors.textHeading }, subtitle: { ...typography.body, color: colors.textSecondary }, contextMeta: { ...typography.caption, color: colors.textMuted }, iconAction: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary }, disabled: { opacity: 0.5 }, filters: { gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.md }, filterHeading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }, filterTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, sectionTitle: { ...typography.h3, color: colors.textHeading }, filterHint: { ...typography.caption, color: colors.textMuted }, filterGroup: { gap: spacing.xs }, filterLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' }, optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, filterOption: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: spacing.sm }, filterOptionActive: { borderColor: colors.brandBlue, backgroundColor: '#EEF5FF' }, filterOptionText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', flexShrink: 1 }, filterOptionTextActive: { color: colors.brandBlue }, summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, summaryGridCompact: { display: 'flex' }, metricCard: { flex: 1, minWidth: 190, gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, padding: spacing.md }, metricTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, metricLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', flexShrink: 1 }, metricValue: { ...typography.h2, color: colors.textHeading }, metricVariation: { ...typography.bodySmall, color: colors.success, fontWeight: '700' }, metricFootnote: { ...typography.caption, color: colors.textMuted }, negative: { color: colors.error }, section: { gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, padding: spacing.md }, sectionHeader: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }, sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, sectionMeta: { ...typography.caption, color: colors.textMuted }, chart: { gap: spacing.sm }, chartRow: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, chartLabel: { width: 58, ...typography.caption, color: colors.textSecondary }, chartTrack: { flex: 1, height: 10, overflow: 'hidden', borderRadius: radius.full, backgroundColor: colors.surfaceMuted }, chartBar: { height: '100%', borderRadius: radius.full, backgroundColor: colors.brandBlue }, chartValue: { width: 72, textAlign: 'right', ...typography.caption, color: colors.textBody, fontWeight: '700' }, emptyInline: { ...typography.bodySmall, color: colors.textMuted }, groupList: { gap: spacing.xs }, groupRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingVertical: spacing.sm }, groupMain: { flex: 1, minWidth: 0, gap: spacing.xs }, groupTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm }, groupName: { ...typography.body, color: colors.textHeading, fontWeight: '700', flexShrink: 1 }, valueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, groupValue: { ...typography.caption, color: colors.textBody, fontWeight: '700' }, groupPrevious: { ...typography.caption, color: colors.textMuted }, groupVariation: { ...typography.caption, color: colors.success, fontWeight: '700' }, trendPill: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: radius.full, backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.xs }, trendPositive: { backgroundColor: '#ECFDF5' }, trendNegative: { backgroundColor: '#FEF2F2' }, trendText: { ...typography.caption, color: colors.textMuted, fontWeight: '700' }, successText: { color: colors.success }, loading: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, padding: spacing.lg }, loadingText: { ...typography.bodySmall, color: colors.textSecondary }, loadingGrid: { width: '100%', flexDirection: 'row', gap: spacing.sm }, loadingGridCompact: { flexWrap: 'wrap' }, skeleton: { flex: 1, minWidth: 130, height: 84, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted }, statePanel: { alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, padding: spacing.xl }, stateTitle: { ...typography.h3, color: colors.textHeading, textAlign: 'center' }, stateMessage: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', maxWidth: 520 }, retryButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.brandBlue, borderRadius: radius.sm, paddingHorizontal: spacing.md }, retryText: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700' },
});

const mobileGroupStyles = StyleSheet.create({
  groupPickerButton: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, paddingHorizontal: spacing.sm },
  groupPickerIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: '#EEF5FF' },
  groupPickerText: { flex: 1, minWidth: 0, gap: 2 },
  groupPickerCaption: { ...typography.caption, color: colors.textMuted },
  groupPickerValue: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' },
  groupModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.42)' },
  groupModal: { maxHeight: '86%', borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.md, gap: spacing.md },
  groupModalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupSearch: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: spacing.sm },
  groupSearchInput: { flex: 1, minWidth: 0, color: colors.textBody, ...typography.bodySmall },
  groupModalList: { gap: spacing.xs, paddingBottom: spacing.lg },
});
