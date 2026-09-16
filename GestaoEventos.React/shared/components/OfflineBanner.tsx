import { StyleSheet, Text, View } from 'react-native';

import { isNetworkOffline, isNetworkStatusUnknown, useNetworkStore } from '../../stores/network.store';
import { colors, radius, spacing, typography } from '../design/tokens';

export function OfflineBanner() {
  const snapshot = useNetworkStore((state) => state.snapshot);
  const statusUnknown = isNetworkStatusUnknown(snapshot);

  if (!isNetworkOffline(snapshot)) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.title}>{statusUnknown ? 'Verificando conexao' : 'Sem conexao'}</Text>
      <Text style={styles.body}>
        {statusUnknown
          ? 'Aguarde a confirmacao da rede. Alteracoes ficam bloqueadas neste momento.'
          : 'Dados podem estar desatualizados. Alteracoes ficam bloqueadas ate reconectar.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
    zIndex: 9000,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: '700',
  },
  body: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
