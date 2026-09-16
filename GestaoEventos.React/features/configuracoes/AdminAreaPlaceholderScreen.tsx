import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../shared/design/tokens';

export function AdminAreaPlaceholderScreen({ title, description }: { title: string; description: string }) {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><View style={styles.panel}><Ionicons name="construct-outline" size={26} color={colors.brandBlue} /><Text style={styles.title}>{title}</Text><Text style={styles.description}>{description}</Text></View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.surfacePage }, content: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: spacing.lg }, panel: { gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.lg }, title: { ...typography.h1, color: colors.textHeading }, description: { ...typography.body, color: colors.textSecondary } });
