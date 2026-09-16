import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

type ProtectedPlaceholderScreenProps = {
  title: string;
  description: string;
};

export function ProtectedPlaceholderScreen({ title, description }: ProtectedPlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.panel}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
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
    gap: spacing.lg,
    padding: spacing.lg,
  },
  panel: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textHeading,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
