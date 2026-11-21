import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthTextField({ label, error, editable = true, style, ...props }: AuthTextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCorrect={false}
        spellCheck={false}
        {...props}
        editable={editable}
        placeholderTextColor={colors.textDisabled}
        style={[
          styles.input,
          !editable ? styles.inputDisabled : undefined,
          error ? styles.inputError : undefined,
          style,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function AuthPasswordField({ label, error, ...props }: AuthTextFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.passwordRow, error ? styles.inputError : undefined]}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          {...props}
          secureTextEntry={!visible}
          placeholderTextColor={colors.textDisabled}
          style={styles.passwordInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          onPress={() => setVisible((current) => !current)}
          style={styles.passwordToggle}
        >
          <Text style={styles.passwordToggleText}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    color: colors.textBody,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceDisabled,
    color: colors.textMuted,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
  passwordRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
  },
  passwordInput: {
    minHeight: 46,
    flex: 1,
    color: colors.textBody,
    paddingHorizontal: spacing.md,
    ...typography.bodySmall,
  },
  passwordToggle: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  passwordToggleText: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: '700',
  },
});
