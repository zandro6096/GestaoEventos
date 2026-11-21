import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { isIdle, situacaoLabel, situacaoTone, type SituacaoStatus, type SituacaoTipo } from './acompanhamentos';

const PAGE_SIZE = 15;

type Props = {
  open: boolean;
  onToggle: () => void;
  loading: boolean;
  error: string | null;
  situacao: SituacaoTipo[];
  analisadas: number;
  total: number;
};

export function AcompanhamentosSection({ open, onToggle, loading, error, situacao, analisadas, total }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showIdle, setShowIdle] = useState<Record<number, boolean>>({});
  const [limits, setLimits] = useState<Record<number, number>>({});

  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel="Cursos e indicadores dos participantes" style={styles.header} onPress={onToggle}>
        <Ionicons name="ribbon-outline" size={19} color={colors.brandBlue} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Cursos e indicadores</Text>
          <Text style={styles.subtitle}>Batismo, dízimo, cursos… onde cada pessoa está</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </Pressable>

      {open ? (
        <View style={styles.body}>
          {loading ? <View style={styles.loading}><ActivityIndicator color={colors.brandBlue} /><Text style={styles.subtitle}>Carregando situação dos participantes...</Text></View> : null}
          {!loading && error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {!loading && !error && !situacao.length ? <Text style={styles.empty}>Nenhum acompanhamento configurado nesta estrutura.</Text> : null}

          {!loading && !error ? situacao.map((item) => {
            const expanded = expandedId === item.tipo.id;
            const idleVisible = showIdle[item.tipo.id] === true;
            const list = item.pessoas.filter((entry) => idleVisible || !isIdle(entry.status));
            const idleCount = item.pessoas.length - item.ativos;
            const limit = limits[item.tipo.id] ?? PAGE_SIZE;
            return (
              <View key={item.tipo.id} style={styles.tipo}>
                <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={`Ver pessoas de ${item.tipo.nome}`} style={styles.tipoHead} onPress={() => setExpandedId(expanded ? null : item.tipo.id)}>
                  <View style={styles.tipoText}>
                    <Text style={styles.tipoName}>{item.tipo.nome}</Text>
                    <View style={styles.chips}>
                      {item.contagens.map((count) => <StatusChip key={count.status} status={count.status} count={count.total} />)}
                    </View>
                  </View>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
                </Pressable>

                {expanded ? (
                  <View style={styles.people}>
                    {!list.length ? <Text style={styles.empty}>Ninguém com registro neste acompanhamento ainda.</Text> : null}
                    {list.slice(0, limit).map((entry) => (
                      <View key={entry.pessoa.key} style={styles.person}>
                        <View style={styles.personText}>
                          <Text numberOfLines={1} style={styles.personName}>{entry.pessoa.nome}</Text>
                          <Text numberOfLines={1} style={styles.personMeta}>{entry.pessoa.grupoNome}</Text>
                        </View>
                        <StatusBadge status={entry.status} />
                      </View>
                    ))}
                    {list.length > limit ? (
                      <Pressable accessibilityRole="button" style={styles.more} onPress={() => setLimits((current) => ({ ...current, [item.tipo.id]: limit + PAGE_SIZE }))}>
                        <Text style={styles.moreText}>Ver mais {list.length - limit}</Text>
                      </Pressable>
                    ) : null}
                    {idleCount > 0 ? (
                      <Pressable accessibilityRole="button" style={styles.more} onPress={() => setShowIdle((current) => ({ ...current, [item.tipo.id]: !idleVisible }))}>
                        <Text style={styles.moreText}>{idleVisible ? 'Ocultar quem ainda não iniciou' : `Mostrar quem ainda não iniciou (${idleCount})`}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          }) : null}

          {!loading && !error && situacao.length ? (
            <Text style={styles.note}>{analisadas} pessoa(s) analisadas{total > analisadas ? ` de ${total} — selecione um grupo para ver todas` : ''}.</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function StatusChip({ status, count }: { status: SituacaoStatus; count: number }) {
  const tone = situacaoTone(status);
  return <View style={[styles.chip, { backgroundColor: tone.tint }]}><Text style={[styles.chipText, { color: tone.ink }]}><Text style={styles.chipCount}>{count}</Text> {situacaoLabel(status).toLowerCase()}</Text></View>;
}

function StatusBadge({ status }: { status: SituacaoStatus }) {
  const tone = situacaoTone(status);
  return <View style={[styles.badge, { backgroundColor: tone.tint }]}><Text style={[styles.badgeText, { color: tone.ink }]}>{situacaoLabel(status)}</Text></View>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  headerText: { flex: 1, minWidth: 0 },
  title: { ...typography.h3, color: colors.textHeading },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  body: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  loading: { minHeight: 90, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  error: { ...typography.bodySmall, color: colors.error },
  empty: { ...typography.bodySmall, color: colors.textMuted },
  note: { ...typography.caption, color: colors.textMuted },
  tipo: { gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: spacing.sm },
  tipoHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
  tipoText: { flex: 1, minWidth: 0, gap: 6 },
  tipoName: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  chipText: { ...typography.caption, fontWeight: '600' },
  chipCount: { fontWeight: '800' },
  people: { gap: 2 },
  person: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.surfaceMuted, paddingVertical: 6 },
  personText: { flex: 1, minWidth: 0 },
  personName: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '700' },
  personMeta: { ...typography.caption, color: colors.textMuted },
  badge: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { ...typography.caption, fontWeight: '800' },
  more: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, marginTop: 4 },
  moreText: { ...typography.caption, color: colors.brandBlue, fontWeight: '700' },
});
