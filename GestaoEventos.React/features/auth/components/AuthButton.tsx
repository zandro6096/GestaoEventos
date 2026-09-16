import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function AuthButton({ label, onPress, disabled = false, loading = false, variant = 'primary' }: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondary : styles.primary,
        isDisabled ? styles.disabled : undefined,
        pressed && !isDisabled ? styles.pressed : undefined,
      ]}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? colors.surfacePrimary : colors.brandBlue} /> : null}
      <Text style={[styles.label, variant === 'secondary' ? styles.secondaryLabel : styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  primary: {
    borderColor: colors.brandBlue,
    backgroundColor: colors.brandBlue,
  },
  secondary: {
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfacePrimary,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.86,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  primaryLabel: {
    color: colors.surfacePrimary,
  },
  secondaryLabel: {
    color: colors.brandBlue,
  },
});
