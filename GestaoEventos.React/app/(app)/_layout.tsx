import { Redirect, Slot, type Href, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../../stores/auth.store';
import { AppShell } from '../../shared/components/AppShell';
import { colors, radius, spacing, typography } from '../../shared/design/tokens';

export default function AppLayout() {
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (status === 'unknown') {
      void hydrateSession();
    }
  }, [hydrateSession, status]);

  if (status === 'unknown') {
    return <SessionGate message="Restaurando sessao..." />;
  }

  if (status === 'unauthenticated') {
    return <Redirect href="/auth/login" />;
  }

  if (status === 'context-required' && pathname !== '/estrutura/selecionar') {
    return <Redirect href={'/estrutura/selecionar' as Href} />;
  }

  if (status === 'context-required' && errorMessage && pathname === '/estrutura/selecionar') {
    return (
      <SessionGate
        message={errorMessage}
        actionLabel="Tentar novamente"
        onAction={() => void hydrateSession()}
        secondaryLabel="Sair"
        onSecondary={() => void logout()}
      />
    );
  }

  if (status === 'context-required' && pathname === '/estrutura/selecionar') {
    return <Slot />;
  }

  return <AppShell />;
}

type SessionGateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

function SessionGate({ message, actionLabel, onAction, secondaryLabel, onSecondary }: SessionGateProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.panel}>
        <View style={styles.brandHeader}>
          <Image
            accessibilityLabel="Gestão de Eventos"
            source={require('../../assets/gestao-eventos-logo.png')}
            resizeMode="contain"
            style={styles.brandMark}
          />
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>GestaoEventos</Text>
            <Text style={styles.brandCaption}>Acesso seguro à sua estrutura</Text>
          </View>
        </View>
        <View style={styles.statusHeader}>
          <Text style={styles.title}>{actionLabel ? 'Não foi possível restaurar' : 'Acesso'}</Text>
          {!actionLabel ? <ActivityIndicator size="small" color={colors.brandBlue} /> : null}
        </View>
        <Text style={styles.message}>{message}</Text>
        {actionLabel ? (
          <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={onAction}>
            <Text style={styles.primaryButtonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
        {secondaryLabel ? (
          <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={onSecondary}>
            <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePage,
    padding: spacing.lg,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 48,
    height: 48,
  },
  brandCopy: {
    flex: 1,
    gap: 2,
  },
  brandName: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '800',
  },
  brandCaption: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textHeading,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
  primaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: '700',
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
