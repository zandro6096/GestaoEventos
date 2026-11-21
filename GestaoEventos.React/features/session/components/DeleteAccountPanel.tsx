import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { contaApi } from '../../../services/api/conta-api';
import { normalizeApiError } from '../../../services/api/api-error';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { useAuthStore } from '../../../stores/auth.store';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

export function DeleteAccountPanel() {
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      assertOnlineForMutation('excluir conta');
      await contaApi.excluir(senha);
    },
  });

  function close() {
    if (deleteMutation.isPending) return;
    setOpen(false);
    setSenha('');
    setError(null);
  }

  async function confirm() {
    if (!senha || deleteMutation.isPending) return;
    setError(null);

    try {
      await deleteMutation.mutateAsync();
      await logout();
    } catch (failure) {
      setError(normalizeApiError(failure, 'Nao foi possivel excluir a conta agora.').message);
    }
  }

  if (!open) {
    return (
      <Pressable accessibilityRole="button" style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText}>Excluir minha conta</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Excluir conta</Text>
      <Text style={styles.body}>
        Esta acao e permanente. Seus dados pessoais serao apagados e voce perdera o acesso as suas organizacoes.
        Registros de presenca e eventos das organizacoes sao mantidos, sem identificar voce.
      </Text>
      <Text style={styles.label}>Confirme com sua senha</Text>
      <TextInput
        accessibilityLabel="Senha para confirmar a exclusao da conta"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Sua senha"
        placeholderTextColor={colors.textDisabled}
        returnKeyType="done"
        onSubmitEditing={() => void confirm()}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" disabled={deleteMutation.isPending} style={styles.cancel} onPress={close}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !senha || deleteMutation.isPending, busy: deleteMutation.isPending }}
          disabled={!senha || deleteMutation.isPending}
          style={[styles.confirm, !senha || deleteMutation.isPending ? styles.confirmDisabled : null]}
          onPress={() => void confirm()}
        >
          {deleteMutation.isPending ? <ActivityIndicator color={colors.surfacePrimary} /> : null}
          <Text style={styles.confirmText}>Excluir definitivamente</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  triggerText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  panel: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.error,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  label: {
    ...typography.caption,
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
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancel: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
  },
  cancelText: {
    ...typography.bodySmall,
    color: colors.textBody,
    fontWeight: '700',
  },
  confirm: {
    minHeight: 44,
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
  },
  confirmDisabled: {
    opacity: 0.55,
  },
  confirmText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
});
