import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

export type JornadaActionTarget =
  | {
      kind: 'evento';
      title: string;
      subtitle: string;
      eventoId: number;
      ocorrenciaId?: number;
      mutableActionLabel?: string;
    }
  | {
      kind: 'historico' | 'frequencia';
      title: string;
      subtitle: string;
    };

type JornadaActionPanelProps = {
  target: JornadaActionTarget | null;
  compact: boolean;
  actionBlockedMessage: string | null;
  canOpenEvent: boolean;
  onClose: () => void;
  onOpenEvento: () => void;
  onResolvePendencia: () => void;
};

export function JornadaActionPanel({
  target,
  compact,
  actionBlockedMessage,
  canOpenEvent,
  onClose,
  onOpenEvento,
  onResolvePendencia,
}: JornadaActionPanelProps) {
  if (!target) return null;

  return (
    <View style={[styles.container, compact ? styles.sheet : styles.sidePanel]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.label}>{target.kind}</Text>
          <Text style={styles.title}>{target.title}</Text>
          <Text style={styles.subtitle}>{target.subtitle}</Text>
        </View>
        <Pressable accessibilityLabel="Fechar detalhe" accessibilityRole="button" style={styles.iconButton} onPress={onClose}>
          <Ionicons name="close-outline" size={22} color={colors.textBody} />
        </Pressable>
      </View>

      {actionBlockedMessage ? (
        <View style={styles.blocked}>
          <Ionicons name="warning-outline" size={18} color={colors.warning} />
          <Text style={styles.blockedText}>{actionBlockedMessage}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {target.kind === 'evento' && canOpenEvent ? (
          <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onOpenEvento}>
            <Ionicons name="open-outline" size={18} color={colors.brandBlue} />
            <Text style={styles.secondaryText}>Abrir evento</Text>
          </Pressable>
        ) : null}

        {target.kind === 'evento' && target.mutableActionLabel ? (
          <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={onResolvePendencia}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.surfacePrimary} />
            <Text style={styles.primaryText}>{target.mutableActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  sheet: {
    borderRadius: radius.md,
  },
  sidePanel: {
    minWidth: 280,
    maxWidth: 360,
    borderRadius: radius.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
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
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  iconButton: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
  },
  blocked: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  blockedText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textBody,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.md,
  },
  primaryText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
});
