import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL, isApiConfigured } from '../../services/api/api-config';
import { colors, radius, spacing, typography } from '../design/tokens';

const checks = [
  'Expo SDK 57',
  'Android, iOS e web',
  'GestaoEventos.React paralelo',
  'Sem runtime Angular',
];

export function ScaffoldHome() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Bootstrap</Text>
          <Text style={styles.title}>GestaoEventos React</Text>
          <Text style={styles.subtitle}>Base universal pronta para a proxima story.</Text>
        </View>

        <View style={styles.panel}>
          {checks.map((item) => (
            <View key={item} style={styles.row}>
              <View style={styles.dot} />
              <Text style={styles.rowText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>API</Text>
          <Text style={styles.body}>{isApiConfigured() ? API_BASE_URL : 'Configuracao bloqueada'}</Text>
        </View>
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
    width: '100%',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
  rowText: {
    ...typography.bodySmall,
    color: colors.textBody,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textHeading,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
