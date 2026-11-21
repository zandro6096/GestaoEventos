import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getEasUpdateState,
  reloadToEasUpdate,
  subscribeToEasUpdateState,
} from '../../services/updates/eas-update.service';
import { colors, radius, spacing, typography } from '../design/tokens';

export function EasUpdateNotice() {
  const [updateState, setUpdateState] = useState(getEasUpdateState);

  useEffect(() => subscribeToEasUpdateState(setUpdateState), []);

  if (!updateState.isUpdateReady) return null;

  return (
    <View style={styles.notice} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Text style={styles.message}>Uma atualizacao esta pronta para instalar.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: updateState.isReloading }}
        disabled={updateState.isReloading}
        onPress={() => void reloadToEasUpdate()}
        style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
      >
        <Text style={styles.buttonText}>{updateState.isReloading ? 'Atualizando...' : 'Atualizar agora'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
    zIndex: 9001,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    elevation: 5,
  },
  message: {
    ...typography.caption,
    flex: 1,
    color: colors.textHeading,
  },
  button: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: radius.xs,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    ...typography.caption,
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
});
