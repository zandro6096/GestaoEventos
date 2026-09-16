import { PropsWithChildren, type ReactNode } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  footer?: ReactNode;
}>;

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.scroll, wide ? styles.scrollWide : undefined]}>
        <View style={[styles.brandPanel, wide ? undefined : styles.brandPanelCompact]}>
          <Image source={require('../../../assets/android-icon-foreground.png')} style={styles.brandMark} resizeMode="contain" />
          <Text style={styles.brandName}>GestaoEventos</Text>
          <Text style={styles.brandTitle}>Estruturas, grupos e eventos em uma experiencia unica.</Text>
          <Text style={styles.brandBody}>
            Acesse sua conta para operar com contexto ativo, permissoes dinamicas e dados protegidos.
          </Text>
        </View>

        <View style={[styles.formPanel, wide ? undefined : styles.formPanelCompact]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {children}

          {footer ? <View style={styles.footer}>{footer}</View> : null}
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
  scroll: {
    flexGrow: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  scrollWide: {
    minHeight: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  brandPanel: {
    width: '100%',
    maxWidth: 420,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xl,
  },
  brandPanelCompact: {
    maxWidth: '100%',
    gap: spacing.sm,
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
  brandMark: {
    width: 56,
    height: 56,
    alignSelf: 'flex-start',
  },
  brandName: {
    ...typography.h3,
    color: colors.brandBlue,
  },
  brandTitle: {
    ...typography.h2,
    color: colors.textHeading,
  },
  brandBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  formPanel: {
    width: '100%',
    maxWidth: 460,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xl,
  },
  formPanelCompact: {
    maxWidth: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.textHeading,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footer: {
    gap: spacing.sm,
  },
});
