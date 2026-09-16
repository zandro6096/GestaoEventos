import { type PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { can } from '../../services/permissions/permission.facade';
import type { PermissionAction, PermissionCheckScope, PermissionResource } from '../../services/permissions/permission.types';
import { colors, radius, spacing, typography } from '../design/tokens';

type RequirePermissionProps = PropsWithChildren<{
  action: PermissionAction;
  resource: PermissionResource | string;
  scope?: PermissionCheckScope;
  fallback?: React.ReactNode;
}>;

export function RequirePermission({ action, resource, scope, fallback, children }: RequirePermissionProps) {
  if (can(action, resource, scope)) return children;

  return fallback ?? <AccessDeniedState action={action} resource={resource} />;
}

function AccessDeniedState({ action, resource }: { action: PermissionAction; resource: PermissionResource | string }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Acesso negado</Text>
      <Text style={styles.body}>
        {`Seu contexto atual nao permite ${action} em ${resource}. Se precisar deste acesso, solicite ajuste de permissao.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textHeading,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
