import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { track } from '../../../services/analytics/analytics.service';
import { secureStorage } from '../../../services/platform/secure-storage';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

const DISMISSED_KEY = 'mcp_announcement_dismissed_v1';
const GUIDE_PATH = '/mcp';

export function McpAnnouncementBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void readDismissed().then((value) => {
      if (!active) return;
      setVisible(value !== 'true');
      setReady(true);
      if (value !== 'true') track('visualization', 'mcp:banner_view');
    });

    return () => {
      active = false;
    };
  }, []);

  if (!ready || !visible) return null;

  function openGuide() {
    track('entrance', 'mcp:banner_open');
    track('simulation', 'mcp:guide_open_submit');
    router.push(GUIDE_PATH as Href);
    track('confirmation', 'mcp:guide_open_success');
  }

  function dismiss() {
    setVisible(false);
    void writeDismissed();
    track('confirmation', 'mcp:banner_dismiss');
  }

  return (
    <View style={styles.banner} accessibilityRole="summary">
      <View style={styles.iconWrap}>
        <Ionicons name="sparkles-outline" size={22} color={colors.brandBlue} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Nova funcionalidade</Text>
        <Text style={styles.title}>Sua gestão agora conversa com o ChatGPT</Text>
        <Text style={styles.message}>
          Consulte presença, encontre sinais de atenção e prepare operações sem sair da conversa. Toda alteração continua pedindo sua confirmação.
        </Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Aprender a conectar o ChatGPT" onPress={openGuide} style={styles.primary}>
            <Text style={styles.primaryText}>Ver como conectar</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.surfacePrimary} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Dispensar anúncio do MCP" onPress={dismiss} style={styles.dismiss}>
            <Ionicons name="checkmark-circle-outline" size={17} color={colors.textSecondary} />
            <Text style={styles.dismissText}>Entendi</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

async function readDismissed() {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(`gestaoeventos.announcement.${DISMISSED_KEY}`) ?? null;
    } catch {
      return null;
    }
  }

  return secureStorage.getItem(DISMISSED_KEY);
}

async function writeDismissed() {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(`gestaoeventos.announcement.${DISMISSED_KEY}`, 'true');
    } catch {
      // A dispensa visual não deve bloquear a navegação.
    }
    return;
  }

  await secureStorage.setItem(DISMISSED_KEY, 'true');
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: radius.md,
    backgroundColor: '#EFF6FF',
    padding: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h3,
    color: colors.textHeading,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primary: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.md,
  },
  primaryText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  dismiss: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dismissText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
