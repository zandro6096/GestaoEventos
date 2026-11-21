import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { track } from '../../../services/analytics/analytics.service';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

const MCP_ENDPOINT = 'https://sistema-eventos.seven-projetos.com/mcp';
const OPENAI_GUIDE = 'https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt';

export function McpGuideScreen() {
  const router = useRouter();

  function openOfficialGuide() {
    track('simulation', 'mcp:official_guide_open_submit');
    void Linking.openURL(OPENAI_GUIDE);
    track('confirmation', 'mcp:official_guide_open_success');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={18} color={colors.brandBlue} />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconWrap}><Ionicons name="sparkles-outline" size={26} color={colors.brandBlue} /></View>
          <Text style={styles.eyebrow}>GestãoEventos + ChatGPT</Text>
          <Text style={styles.title}>Conecte sua gestão à conversa</Text>
          <Text style={styles.subtitle}>Consulte presença e insights com a mesma autorização da sua conta. Para gravar presença ou criar participante, o ChatGPT sempre precisa mostrar a prévia e pedir sua confirmação.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Como conectar</Text>
          <Step number="1" text="Abra o ChatGPT pela web e escolha Apps ou Add custom MCP server." />
          <Step number="2" text="Informe o endpoint abaixo e selecione OAuth quando o ChatGPT solicitar autenticação." />
          <View style={styles.endpointBox}>
            <Text style={styles.endpointLabel}>Endpoint MCP</Text>
            <Text selectable style={styles.endpoint}>{MCP_ENDPOINT}</Text>
          </View>
          <Step number="3" text="Na tela GestãoEventos, entre com seu login e senha próprios. Não compartilhe seu JWT ou senha em uma conversa." />
          <Step number="4" text="Depois de conectar, experimente: Como foi a presença dos meus grupos nos últimos 30 dias?" />
        </View>

        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.success} />
          <Text style={styles.noteText}>O acesso respeita sua estrutura, seus grupos e suas permissões. O token entregue ao ChatGPT é individual e opaco.</Text>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Abrir documentação oficial do ChatGPT" onPress={openOfficialGuide} style={styles.secondary}>
          <Text style={styles.secondaryText}>Abrir documentação oficial do ChatGPT</Text>
          <Ionicons name="open-outline" size={17} color={colors.brandBlue} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.number}><Text style={styles.numberText}>{number}</Text></View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  content: { gap: spacing.lg, padding: spacing.lg },
  back: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', paddingVertical: spacing.xs },
  backText: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700' },
  header: { gap: spacing.sm },
  iconWrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: '#EFF6FF' },
  eyebrow: { ...typography.caption, color: colors.brandBlue, fontWeight: '800', textTransform: 'uppercase' },
  title: { ...typography.h1, color: colors.textHeading },
  subtitle: { ...typography.body, color: colors.textSecondary },
  card: { gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.lg },
  sectionTitle: { ...typography.h2, color: colors.textHeading },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  number: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.brandBlue },
  numberText: { ...typography.bodySmall, color: colors.surfacePrimary, fontWeight: '800' },
  stepText: { flex: 1, ...typography.bodySmall, color: colors.textBody },
  endpointBox: { gap: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, padding: spacing.md },
  endpointLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  endpoint: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderWidth: 1, borderColor: '#A7F3D0', borderRadius: radius.md, backgroundColor: '#ECFDF5', padding: spacing.md },
  noteText: { flex: 1, ...typography.bodySmall, color: '#065F46' },
  secondary: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.brandBlue, borderRadius: radius.sm, paddingHorizontal: spacing.md },
  secondaryText: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700' },
});
