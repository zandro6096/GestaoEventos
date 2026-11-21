import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CockpitMatrixCell, CockpitObjectiveItem } from '../../../services/api/painel-api';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import {
  cellMarkerStatus,
  cellObjectiveText,
  formatDeadline,
  objectiveContext,
  objectiveProgress,
  objectiveRemaining,
  objectiveStatusFilters,
  objectiveStatusLabel,
  objectiveTone,
  sortObjectives,
  summarizeObjectives,
  type ObjectivePanelItem,
  type ObjectiveStatusFilter,
} from './objetivos';

const PAGE_SIZE = 5;

export function ObjetivosSection({ items, loading }: { items: ObjectivePanelItem[]; loading: boolean }) {
  const [filter, setFilter] = useState<ObjectiveStatusFilter>('todos');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const summary = useMemo(() => summarizeObjectives(items), [items]);
  const visible = useMemo(() => sortObjectives(items).filter((item) => filter === 'todos' || item.status === filter), [items, filter]);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Ionicons name="flag-outline" size={19} color={colors.brandBlue} />
        <View style={styles.titleText}>
          <Text style={styles.title}>Objetivos</Text>
          <Text style={styles.subtitle}>Metas do período por objetivo, evento e status</Text>
        </View>
      </View>

      {loading && !items.length ? <ActivityIndicator color={colors.brandBlue} /> : null}
      {!loading && !items.length ? <Text style={styles.empty}>Nenhum objetivo configurado neste escopo.</Text> : null}

      {items.length ? (
        <>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.bigNumber}>{summary.concluidos}/{summary.total}</Text>
              <Text style={styles.subtitle}>objetivos cumpridos</Text>
            </View>
            <Text style={styles.percent}>{summary.percentual.toFixed(1).replace('.', ',')}%</Text>
          </View>
          <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(summary.percentual, 100)}%` }]} /></View>
          <View style={styles.chips}>
            <SummaryChip count={summary.concluidos} label="cumpridos" status="concluido" />
            <SummaryChip count={summary.emAndamento} label="em andamento" status="em_andamento" />
            <SummaryChip count={summary.aVencer} label="a vencer" status="a_vencer" />
            <SummaryChip count={summary.atrasados} label="atrasados" status="atrasado" />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {objectiveStatusFilters.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === option.value }}
                style={[styles.filter, filter === option.value && styles.filterActive]}
                onPress={() => { setFilter(option.value); setLimit(PAGE_SIZE); }}
              >
                <Text style={[styles.filterText, filter === option.value && styles.filterTextActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {visible.length === 0 ? <Text style={styles.empty}>Nenhum objetivo com este status.</Text> : null}
          {visible.slice(0, limit).map((item) => <ObjectiveRow key={item.key} item={item} />)}
          {visible.length > limit ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Mostrar mais objetivos" style={styles.more} onPress={() => setLimit((current) => current + 10)}>
              <Text style={styles.moreText}>Ver mais {Math.min(visible.length - limit, 10)} de {visible.length - limit}</Text>
            </Pressable>
          ) : null}
          {limit > PAGE_SIZE && visible.length <= limit ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Mostrar menos objetivos" style={styles.more} onPress={() => setLimit(PAGE_SIZE)}>
              <Text style={styles.moreText}>Ver menos</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function SummaryChip({ count, label, status }: { count: number; label: string; status: string }) {
  const tone = objectiveTone(status);
  return <View style={[styles.chip, { backgroundColor: tone.tint }]}><Text style={[styles.chipText, { color: tone.ink }]}><Text style={styles.chipCount}>{count}</Text> {label}</Text></View>;
}

export function ObjectiveBadge({ status, label }: { status: string; label?: string }) {
  const tone = objectiveTone(status);
  return <View style={[styles.badge, { backgroundColor: tone.tint }]}><Text style={[styles.badgeText, { color: tone.ink }]}>{label ?? objectiveStatusLabel(status)}</Text></View>;
}

function ObjectiveRow({ item }: { item: ObjectivePanelItem }) {
  const deadline = formatDeadline(item.prazoEm);
  const tone = objectiveTone(item.status);
  return (
    <View style={styles.item}>
      <View style={styles.itemHead}>
        <Text style={styles.itemName}>{item.objetivoNome}</Text>
        <ObjectiveBadge status={item.status} />
      </View>
      <Text style={styles.itemContext}>{objectiveContext(item)}</Text>
      <View style={styles.progressLine}>
        <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${objectiveProgress(item) * 100}%`, backgroundColor: tone.ink }]} /></View>
        <Text style={styles.progressText}>{item.progressoAtual}/{item.metaQuantidade}</Text>
      </View>
      <Text style={styles.itemMeta}>{objectiveRemaining(item)}{deadline ? ` · prazo ${deadline}` : ''}</Text>
    </View>
  );
}

// Selo da celula da matriz Pessoa x Template.
export function CellObjectiveBadge({ cell }: { cell: CockpitMatrixCell }) {
  const total = cell.objetivoStatusResumo?.total ?? cell.objetivosTotal;
  if (total <= 0) return null;
  const status = cellMarkerStatus(cell.objetivoStatusResumo?.marcador ?? cell.objetivoMarcador) ?? 'em_andamento';
  const text = cellObjectiveText(
    total,
    cell.objetivoStatusResumo?.concluidos ?? cell.objetivosConcluidos,
    cell.objetivoStatusResumo?.atrasados ?? cell.objetivosAtrasados,
    cell.objetivoStatusResumo?.aVencer ?? cell.objetivosAVencer,
  );
  return <ObjectiveBadge status={status} label={text} />;
}

// Lista de objetivos de uma celula (detalhe aberto ao tocar na celula).
export function CellObjectiveDetails({ items }: { items: CockpitObjectiveItem[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.detailBlock}>
      <Text style={styles.detailTitle}>Objetivos</Text>
      {items.map((item) => {
        const deadline = formatDeadline(item.prazoEm);
        return (
          <View key={item.id} style={styles.detailItem}>
            <View style={styles.itemHead}>
              <Text style={styles.itemName}>{item.nome}</Text>
              <ObjectiveBadge status={item.status} />
            </View>
            <Text style={styles.itemMeta}>{item.progressoAtual}/{item.metaQuantidade} · {objectiveRemaining(item)}{deadline ? ` · prazo ${deadline}` : ''}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, padding: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  titleText: { flex: 1, minWidth: 0 },
  title: { ...typography.h3, color: colors.textHeading },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  empty: { ...typography.bodySmall, color: colors.textMuted },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  bigNumber: { ...typography.h2, fontSize: 26, color: colors.textHeading },
  percent: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '800' },
  track: { height: 8, overflow: 'hidden', borderRadius: radius.full, backgroundColor: colors.surfaceMuted },
  fill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.success },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { ...typography.caption, fontWeight: '600' },
  chipCount: { fontWeight: '800' },
  filters: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  filter: { minHeight: 34, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full, paddingHorizontal: 12, backgroundColor: colors.surfacePrimary },
  filterActive: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue },
  filterText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  filterTextActive: { color: colors.surfacePrimary },
  item: { gap: 5, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.sm },
  itemHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  itemName: { ...typography.bodySmall, flex: 1, minWidth: 0, color: colors.textHeading, fontWeight: '800' },
  itemContext: { ...typography.caption, color: colors.textSecondary },
  itemMeta: { ...typography.caption, color: colors.textMuted },
  progressLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  miniTrack: { flex: 1, height: 6, overflow: 'hidden', borderRadius: radius.full, backgroundColor: colors.surfaceMuted },
  miniFill: { height: '100%', borderRadius: radius.full },
  progressText: { ...typography.caption, color: colors.textBody, fontWeight: '800' },
  badge: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { ...typography.caption, fontWeight: '800' },
  more: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.brandBlue, borderRadius: radius.sm },
  moreText: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700' },
  detailBlock: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.sm },
  detailTitle: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' },
  detailItem: { gap: 3 },
});
