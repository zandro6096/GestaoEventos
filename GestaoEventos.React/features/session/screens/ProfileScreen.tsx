import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { can } from '../../../services/permissions/permission.facade';
import { useAuthStore } from '../../../stores/auth.store';
import { useContextStore } from '../../../stores/context.store';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { DeleteAccountPanel } from '../components/DeleteAccountPanel';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const usuarioNome = useContextStore((state) => state.usuarioNome);
  const estruturaNome = useContextStore((state) => state.estruturaNome);
  const grupoNome = useContextStore((state) => state.grupoNome);
  const canManageSettings = can('gerenciar', 'configuracoes');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Perfil</Text>
          <Text style={styles.title}>{user?.nome ?? usuarioNome ?? 'Usuario autenticado'}</Text>
          <Text style={styles.subtitle}>Sessao e contexto ativos neste dispositivo.</Text>
        </View>

        <View style={styles.panel}>
          <InfoRow label="Email" value={user?.email ?? 'Nao informado'} />
          <InfoRow label="Estrutura" value={estruturaNome ?? 'Nao selecionada'} />
          <InfoRow label="Grupo" value={grupoNome ?? 'Nao selecionado'} />
          <InfoRow label="Configuracoes" value={canManageSettings ? 'Disponivel' : 'Sem acesso neste contexto'} />
        </View>

        <Pressable accessibilityRole="button" style={styles.logoutButton} onPress={() => void logout()}>
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>

        <DeleteAccountPanel />
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
  logoutButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  logoutText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '700',
  },
});
