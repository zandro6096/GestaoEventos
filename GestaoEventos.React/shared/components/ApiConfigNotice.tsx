import { StyleSheet, Text, View } from 'react-native';

import { API_URL_ENV_VAR, apiConfigError } from '../../services/api/api-config';
import { colors, radius, spacing, typography } from '../design/tokens';

export function ApiConfigNotice() {
  if (!apiConfigError) return null;

  return (
    <View style={styles.overlay} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <View style={styles.panel}>
        <Text style={styles.title}>Configuracao de API pendente</Text>
        <Text style={styles.body}>{apiConfigError}</Text>
        <View style={styles.codeBox}>
          <Text style={styles.label}>Variavel</Text>
          <Text style={styles.code}>{API_URL_ENV_VAR}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePage,
    padding: spacing.lg,
    zIndex: 9999,
  },
  panel: {
    width: '100%',
    maxWidth: 520,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textHeading,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textBody,
  },
  codeBox: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  code: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '700',
  },
});
