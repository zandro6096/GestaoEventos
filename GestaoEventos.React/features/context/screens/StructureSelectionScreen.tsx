import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '../../../stores/auth.store';
import { useContextStore } from '../../../stores/context.store';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { useContextActions } from '../hooks/useContextActions';
import { DeleteAccountPanel } from '../../session/components/DeleteAccountPanel';

export function StructureSelectionScreen() {
  const router = useRouter();
  const estruturas = useContextStore((state) => state.estruturas);
  const temEstrutura = useContextStore((state) => state.temEstrutura);
  const logout = useAuthStore((state) => state.logout);
  const { errorMessage, switchingStructureId, switchEstrutura } = useContextActions();

  async function handleSelect(estruturaId: number) {
    await switchEstrutura(estruturaId);
    router.replace('/admin/jornada' as Href);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.header}>
          <Text style={styles.title}>Selecione uma estrutura</Text>
          <Text style={styles.subtitle}>Escolha o contexto para continuar sem misturar dados.</Text>
        </View>

        <View style={styles.list}>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          {estruturas.map((estrutura) => (
            <Pressable
              accessibilityRole="button"
              disabled={switchingStructureId === estrutura.id}
              key={estrutura.id}
              style={styles.structureButton}
              onPress={() => void handleSelect(estrutura.id)}
            >
              <Text style={styles.structureName}>{estrutura.nome}</Text>
              <Text style={styles.structureMeta}>{estrutura.papel}</Text>
              {switchingStructureId === estrutura.id ? <ActivityIndicator color={colors.brandBlue} /> : null}
            </Pressable>
          ))}

          {!temEstrutura || estruturas.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhuma estrutura vinculada</Text>
              <Text style={styles.emptyText}>
                Sua conta esta ativa, mas voce ainda nao faz parte de nenhuma organizacao. Peca a um administrador para enviar um convite para o seu e-mail.
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={() => void logout()}>
          <Text style={styles.secondaryButtonText}>Sair</Text>
        </Pressable>

        <DeleteAccountPanel />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfacePage,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textHeading,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
  structureButton: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  structureName: {
    ...typography.h3,
    color: colors.textHeading,
  },
  structureMeta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
  },
  empty: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textHeading,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    ...typography.bodySmall,
    color: colors.textBody,
    fontWeight: '700',
  },
});
