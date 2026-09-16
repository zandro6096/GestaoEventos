import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

type AuthMessageProps = {
  tone: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
};

const toneColor = {
  info: colors.info,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

export function AuthMessage({ tone, title, children }: AuthMessageProps) {
  return (
    <View style={[styles.box, { borderColor: toneColor[tone] }]} accessibilityRole={tone === 'error' ? 'alert' : 'text'}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
  },
  title: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: '700',
  },
  body: {
    ...typography.bodySmall,
    color: colors.textBody,
  },
});
