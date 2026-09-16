import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';

import { useGrupos } from './useGrupos';
import type { GrupoNode } from './grupos.rules';
import { colors, radius, spacing, typography } from '../../shared/design/tokens';
import { layoutMetrics } from '../../shared/theme';
import { normalizeApiError } from '../../services/api/api-error';
import { track } from '../../services/analytics/analytics.service';
import { useContextStore } from '../../stores/context.store';

export function GruposScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const state = useGrupos();
  const estruturaNome = useContextStore((store) => store.estruturaNome);
  const [expanded, setExpanded] = useState<number[]>([]);
  const levels = [...new Set(state.groups.map((group) => group.nivelHierarquico))].sort((a, b) => a - b);
  const totalGroups = state.groups.length;
  const totalLevels = levels.length;
  const toggle = (id: number) => setExpanded((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const open = (group: GrupoNode) => { track('entrance', 'grupos:detalhe_abrir', { extra: { nivel: group.nivelHierarquico } }); router.push(`/admin/grupos/${group.id}` as Href); };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact]}>
    <View style={styles.heroCard}>
      <View style={styles.heroCopy}>
        <Text style={styles.eyebrow}>Estrutura ativa</Text>
        <Text style={styles.title}>Hierarquia de Grupos</Text>
        <Text style={styles.subtitle}>{estruturaNome ?? 'Estrutura ativa'} · {totalGroups} grupo(s) · {totalLevels} nivel(is)</Text>
        <Text style={styles.distinction}><Ionicons name="information-circle-outline" size={15} color={colors.textMuted} /> Grupos organizam <Text style={styles.distinctionStrong}>membros e subgrupos</Text>. Registro de presenca acontece no fluxo de evento.</Text>
      </View>
      <View style={[styles.heroActions, compact && styles.heroActionsCompact]}>
        <TextInput accessibilityLabel="Buscar grupo" value={state.term} onChangeText={state.applyTerm} placeholder="Ir direto para um grupo" style={styles.quickSearch} />
        <Action label="Atualizar grupos" icon="refresh-outline" disabled={state.query.isFetching} onPress={() => void state.query.refetch()} />
      </View>
    </View>

    <View style={styles.breadcrumb}><Ionicons name="location-outline" size={16} color={colors.textMuted} /><Text style={styles.breadcrumbText}>Raiz</Text></View>

    <View style={styles.filterBar}>
      <Text style={styles.filterLabel}>Filtrar por nivel</Text>
      <View style={styles.levelChoices}><LevelOption label="Todos os niveis" active={state.level === null} onPress={() => state.setLevel(null)} />{levels.map((item) => <LevelOption key={item} label={`Nivel ${item}`} active={state.level === item} onPress={() => state.setLevel(item)} />)}</View>
    </View>

    <View style={styles.list}>
      {state.query.isLoading && <View style={styles.state}><ActivityIndicator accessibilityLabel="Carregando grupos" color={colors.brandBlue} /><Text style={styles.secondary}>Carregando grupos...</Text></View>}
      {state.query.isError && <View style={styles.feedback}><Text accessibilityRole="alert" style={styles.error}>{normalizeApiError(state.query.error, 'Nao foi possivel carregar grupos.').message}</Text><Action label="Tentar novamente" icon="refresh-outline" onPress={() => void state.query.refetch()} /></View>}
      {!state.query.isLoading && !state.query.isError && !state.filtered.length && <View style={styles.state}><Ionicons name="file-tray-outline" size={28} color={colors.textDisabled} /><Text style={styles.emptyTitle}>Nenhum grupo encontrado</Text><Text style={styles.secondary}>Nao ha grupos cadastrados para os filtros atuais.</Text></View>}
      {state.tree.map((group) => <GroupNodeView key={group.id} group={group} expanded={expanded} onToggle={toggle} onOpen={open} depth={0} />)}
    </View>
  </ScrollView></SafeAreaView>;
}

function GroupNodeView({ group, expanded, onToggle, onOpen, depth }: { group: GrupoNode; expanded: number[]; onToggle: (id: number) => void; onOpen: (group: GrupoNode) => void; depth: number }) {
  const isExpanded = expanded.includes(group.id);
  const members = group.metadados?.totalMembros ?? group.usuariosCount ?? 0;
  const frequency = Math.max(0, Math.min(100, Number(group.metadados?.frequenciaMedia ?? 0)));
  const frequencyTone = frequency >= 75 ? styles.frequencyGood : frequency >= 50 ? styles.frequencyMedium : styles.frequencyLow;
  return <View style={[styles.node, { marginLeft: Math.min(depth * 18, 54) }]}>
    <View style={styles.groupCard}>
      <View style={styles.cardHead}>
        <View style={styles.cardTitleWrap}>{group.children.length ? <Pressable accessibilityRole="button" accessibilityLabel={`${isExpanded ? 'Recolher' : 'Expandir'} ${group.nome}`} style={styles.expandButton} onPress={() => onToggle(group.id)}><Ionicons name={isExpanded ? 'chevron-down' : 'chevron-forward'} size={18} color={colors.brandBlue} /></Pressable> : <View style={styles.expandButton} />}<Ionicons name="folder-outline" size={21} color={colors.brandBlue} /><Text numberOfLines={2} style={styles.cardTitle}>{group.nome}</Text></View>
        <Text style={styles.levelBadge}>Nivel {group.nivelHierarquico}</Text>
      </View>
      <View style={styles.kpis}>
        <Kpi label="Membros" value={String(members)} />
        <Kpi label="Subgrupos" value={String(group.children.length)} />
        <View style={[styles.kpi, frequencyTone]}><Text style={styles.kpiLabel}>Frequencia</Text><Text style={styles.kpiValue}>{frequency}%</Text></View>
      </View>
      <View style={styles.cardActions}><Action label={`Abrir ${group.nome}`} icon="arrow-forward-outline" onPress={() => onOpen(group)} /></View>
    </View>
    {isExpanded && group.children.map((child) => <GroupNodeView key={child.id} group={child} expanded={expanded} onToggle={onToggle} onOpen={onOpen} depth={depth + 1} />)}
  </View>;
}

function Kpi({ label, value }: { label: string; value: string }) { return <View style={styles.kpi}><Text style={styles.kpiLabel}>{label}</Text><Text style={styles.kpiValue}>{value}</Text></View>; }
function LevelOption({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.levelOption, active && styles.levelOptionActive]} onPress={onPress}><Ionicons name="layers-outline" size={16} color={active ? colors.surfacePrimary : colors.brandBlue} /><Text style={[styles.levelOptionText, active && styles.levelOptionTextActive]}>{label}</Text></Pressable>; }
function Action({ label, icon, onPress, disabled = false }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; disabled?: boolean }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.action, disabled && styles.disabled]}><Ionicons name={icon} size={17} color={colors.brandBlue} /><Text style={styles.actionText}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage }, content: { width: '100%', maxWidth: 1200, alignSelf: 'center', padding: spacing.lg, gap: spacing.md }, contentCompact: { padding: spacing.md, gap: spacing.sm },
  heroCard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.lg, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.lg }, heroCopy: { flex: 1, minWidth: 260, gap: spacing.xs }, eyebrow: { ...typography.caption, color: colors.brandBlue, fontWeight: '700', textTransform: 'uppercase' }, title: { ...typography.h1, color: colors.textHeading }, subtitle: { ...typography.bodySmall, color: colors.textSecondary }, distinction: { ...typography.caption, color: colors.textMuted, lineHeight: 19, marginTop: spacing.xs }, distinctionStrong: { color: colors.textBody, fontWeight: '700' }, heroActions: { width: 330, maxWidth: '100%', justifyContent: 'center', gap: spacing.sm }, heroActionsCompact: { width: '100%' }, quickSearch: { minHeight: 46, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: spacing.md, color: colors.textBody, backgroundColor: colors.surfacePrimary }, action: { minHeight: 44, minWidth: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: spacing.md }, actionText: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700', flexShrink: 1 }, disabled: { opacity: 0.5 }, breadcrumb: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, paddingHorizontal: spacing.md }, breadcrumbText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '700' }, filterBar: { gap: spacing.sm }, filterLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' }, levelChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, levelOption: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full, paddingHorizontal: spacing.md, backgroundColor: colors.surfacePrimary }, levelOptionActive: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue }, levelOptionText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' }, levelOptionTextActive: { color: colors.surfacePrimary }, list: { gap: spacing.sm }, node: { gap: spacing.sm }, groupCard: { gap: spacing.md, borderTopWidth: 3, borderTopColor: colors.brandBlue, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.md }, cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, cardTitleWrap: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, expandButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }, cardTitle: { flex: 1, ...typography.body, color: colors.textHeading, fontWeight: '700' }, levelBadge: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', borderRadius: radius.full, backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }, kpis: { flexDirection: 'row', gap: spacing.sm }, kpi: { flex: 1, minWidth: 0, gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, padding: spacing.sm }, kpiLabel: { ...typography.caption, color: colors.textSecondary }, kpiValue: { ...typography.body, color: colors.textHeading, fontWeight: '700' }, frequencyGood: { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }, frequencyMedium: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }, frequencyLow: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }, cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.sm }, state: { alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.xl }, emptyTitle: { ...typography.h3, color: colors.textHeading }, secondary: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' }, feedback: { gap: spacing.md, borderWidth: 1, borderColor: colors.error, borderRadius: radius.sm, padding: spacing.md }, error: { ...typography.bodySmall, color: colors.error },
});
