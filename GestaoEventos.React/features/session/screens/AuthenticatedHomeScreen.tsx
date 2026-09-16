import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '../../../stores/auth.store';
import { useContextStore } from '../../../stores/context.store';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

export function AuthenticatedHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const estruturaNome = useContextStore((state) => state.estruturaNome);
  const grupoNome = useContextStore((state) => state.grupoNome);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Sessao ativa</Text>
          <Text style={styles.title}>Jornada</Text>
          <Text style={styles.subtitle}>Contexto carregado para continuar a migracao por fatias.</Text>
        </View>

        <View style={styles.panel}>
          <InfoRow label="Usuario" value={user?.nome ?? 'Usuario autenticado'} />
          <InfoRow label="Estrutura" value={estruturaNome ?? 'Nao selecionada'} />
          <InfoRow label="Grupo" value={grupoNome ?? 'Nao selecionado'} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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
  eyebrow: {
    ...typography.caption,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    color: colors.brandBlue,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h1,
    color: colors.textHeading,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  panel: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    ...typography.body,
    color: colors.textBody,
  },
});
