import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useContextActions } from '../../features/context/hooks/useContextActions';
import { track } from '../../services/analytics/analytics.service';
import { useContextStore } from '../../stores/context.store';
import { colors, radius, spacing, typography } from '../design/tokens';

export function ContextSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const estruturaId = useContextStore((state) => state.selectedStructureId);
  const grupoId = useContextStore((state) => state.selectedGroupId);
  const estruturaNome = useContextStore((state) => state.estruturaNome);
  const grupoNome = useContextStore((state) => state.grupoNome);
  const estruturas = useContextStore((state) => state.estruturas);
  const canSwitchStructure = useContextStore((state) => state.canSwitchStructure);
  const { errorMessage, switchingStructureId, switchEstrutura } = useContextActions();

  function toggleOpen() {
    if (!open) track('entrance', 'context:switcher_open');
    setOpen((current) => !current);
  }

  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" style={[styles.current, compact && styles.compactCurrent]} onPress={toggleOpen}>
        <View style={[styles.currentText, compact && styles.compactCurrentText]}>
          {!compact ? <Text style={styles.label}>Contexto atual</Text> : null}
          <Text style={[styles.title, compact ? styles.compactTitle : null]}>{estruturaNome ?? 'Estrutura nao selecionada'}</Text>
          {!compact ? <Text style={styles.meta}>{grupoId && grupoNome ? grupoNome : 'Grupo nao selecionado'}</Text> : null}
        </View>
        {!compact ? <Text style={styles.action}>{canSwitchStructure ? (open ? 'Fechar' : 'Trocar') : 'Unico'}</Text> : null}
      </Pressable>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {open && canSwitchStructure ? (
        <View style={styles.options}>
          {estruturas.map((estrutura) => {
            const active = estrutura.id === estruturaId;
            const loading = switchingStructureId === estrutura.id;

            return (
              <Pressable
                accessibilityRole="button"
                disabled={loading || active}
                key={estrutura.id}
                style={[styles.option, active ? styles.optionActive : null]}
                onPress={() => void switchEstrutura(estrutura.id).then(() => setOpen(false))}
              >
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{estrutura.nome}</Text>
                  <Text style={styles.meta}>{estrutura.papel}</Text>
                </View>
                {loading ? <ActivityIndicator color={colors.brandBlue} /> : null}
                {active ? <Text style={styles.activeText}>Atual</Text> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  current: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  compactCurrent: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  currentText: {
    flex: 1,
    gap: spacing.xs,
  },
  compactCurrentText: {
    alignItems: 'center',
    gap: 0,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: '700',
  },
  compactTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  compactMeta: {
    ...typography.caption,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  action: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  optionActive: {
    borderColor: colors.brandBlue,
    backgroundColor: colors.surfaceMuted,
  },
  optionText: {
    flex: 1,
    gap: spacing.xs,
  },
  optionTitle: {
    ...typography.bodySmall,
    color: colors.textBody,
    fontWeight: '700',
  },
  activeText: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: '700',
  },
});
