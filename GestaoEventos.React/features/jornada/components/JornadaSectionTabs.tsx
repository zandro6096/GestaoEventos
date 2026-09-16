import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

export type JornadaView = 'hoje' | 'pendencias' | 'frequencia' | 'proximas' | 'historico' | 'aniversarios';

type JornadaSectionTabsProps = {
  activeView: JornadaView;
  compact: boolean;
  isFetching: boolean;
  onChange: (view: JornadaView) => void;
};

const items: { key: JornadaView; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'hoje', label: 'Hoje', icon: 'calendar-outline' },
  { key: 'frequencia', label: 'Freq.', icon: 'pie-chart-outline' },
  { key: 'proximas', label: 'Proximas', icon: 'notifications-outline' },
  { key: 'historico', label: 'Historico', icon: 'time-outline' },
  { key: 'aniversarios', label: 'Aniver.', icon: 'gift-outline' },
];

export function JornadaSectionTabs({ activeView, compact, isFetching, onChange }: JornadaSectionTabsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal={compact} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {items.map((item) => {
          const active = item.key === activeView;

          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={item.key}
              style={({ pressed }) => [
                styles.tab,
                compact ? styles.tabCompact : null,
                active ? styles.tabActive : null,
                pressed ? styles.pressed : null,
              ]}
              onPress={() => onChange(item.key)}
            >
              <Ionicons name={item.icon} size={18} color={active ? colors.brandBlue : colors.textMuted} />
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.82}
                numberOfLines={1}
                style={[styles.tabText, active ? styles.tabTextActive : null]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {isFetching ? (
        <View style={styles.refreshPill}>
          <Ionicons name="sync-outline" size={14} color={colors.info} />
          <Text style={styles.refreshText}>Atualizando</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 12,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xs,
  },
  tabs: {
    gap: spacing.xs,
  },
  tab: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 9,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
  },
  tabCompact: {
    minWidth: 72,
    minHeight: 42,
    borderRadius: 9,
    paddingHorizontal: spacing.sm,
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    ...typography.bodySmall,
    maxWidth: 96,
    color: colors.textMuted,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.brandBlue,
  },
  refreshPill: {
    minHeight: 32,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.sm,
  },
  refreshText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
