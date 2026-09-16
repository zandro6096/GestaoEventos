import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { can } from '../../services/permissions/permission.facade';
import type { PermissionAction } from '../../services/permissions/permission.types';
import { track } from '../../services/analytics/analytics.service';
import { useContextStore } from '../../stores/context.store';
import { colors, radius, spacing, typography } from '../../shared/design/tokens';

type AdminArea = {
  key: string;
  title: string;
  description: string;
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  action: PermissionAction;
  resource: string;
  scope: 'estrutura' | 'global';
};

const adminAreas: AdminArea[] = [
  { key: 'membros', title: 'Membros', description: 'Gerencie pessoas vinculadas a estrutura ativa.', href: '/admin/membros', icon: 'people-outline', action: 'gerenciar', resource: 'usuarios', scope: 'estrutura' },
  { key: 'papeis', title: 'Papeis e funcoes', description: 'Consulte e organize papeis administrativos.', href: '/admin/papeis', icon: 'shield-checkmark-outline', action: 'gerenciar', resource: 'papeis', scope: 'estrutura' },
  { key: 'permissoes', title: 'Permissoes', description: 'Ajuste acessos conforme o contexto ativo.', href: '/admin/permissoes', icon: 'key-outline', action: 'gerenciar', resource: 'permissoes', scope: 'estrutura' },
  { key: 'tipos-grupo', title: 'Tipos de grupo', description: 'Configure classificacoes de grupos da estrutura.', href: '/admin/tipos-grupo', icon: 'layers-outline', action: 'gerenciar', resource: 'grupos', scope: 'estrutura' },
  { key: 'tipos-evento', title: 'Tipos de evento', description: 'Configure classificacoes usadas nos eventos.', href: '/admin/tipos-evento', icon: 'pricetags-outline', action: 'gerenciar', resource: 'eventos', scope: 'estrutura' },
  { key: 'planos', title: 'Planos e limites', description: 'Consulte a configuracao comercial disponivel.', href: '/admin/planos', icon: 'options-outline', action: 'ler', resource: 'planos', scope: 'global' },
  { key: 'assinatura', title: 'Assinatura', description: 'Consulte o estado da assinatura da conta.', href: '/admin/assinatura', icon: 'card-outline', action: 'ler', resource: 'assinatura', scope: 'global' },
  { key: 'auditoria', title: 'Auditoria', description: 'Acesse registros administrativos autorizados.', href: '/admin/auditoria', icon: 'document-text-outline', action: 'ler', resource: 'auditoria', scope: 'estrutura' },
  { key: 'suporte', title: 'Suporte', description: 'Abra o ponto de entrada para suporte administrativo.', href: '/admin/suporte', icon: 'help-circle-outline', action: 'ler', resource: 'configuracoes', scope: 'global' },
];

export function ConfiguracoesScreen() {
  const router = useRouter();
  const estruturaNome = useContextStore((state) => state.estruturaNome);
  const estruturaId = useContextStore((state) => state.estruturaId);
  const visibleAreas = adminAreas.filter((area) => can(area.action, area.resource, { estruturaId }));

  function openArea(area: AdminArea) {
    track('entrance', 'configuracoes:area_abrir', { extra: { area: area.key, escopo: area.scope } });
    router.push(area.href);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <View style={styles.headerContent}>
            <View style={styles.breadcrumb}><Ionicons name="home-outline" size={14} color={colors.textMuted} /><Text style={styles.breadcrumbText}>Dashboard</Text><Ionicons name="chevron-forward" size={12} color={colors.textDisabled} /><Text style={styles.breadcrumbText}>Administracao</Text><Ionicons name="chevron-forward" size={12} color={colors.textDisabled} /><Text style={styles.breadcrumbCurrent}>Configuracoes</Text></View>
            <Text style={styles.title}>Configuracoes da estrutura</Text>
            <Text style={styles.subtitle}>Gerencie papeis, tipos, pessoas e auditoria da sua organizacao.</Text>
          </View>
          <View style={styles.activeChip}><Ionicons name="settings-outline" size={16} color={colors.brandBlue} /><Text style={styles.activeChipText}>Estrutura ativa</Text></View>
        </View>
        <View style={styles.context}><Ionicons name="business-outline" size={17} color={colors.brandBlue} /><Text style={styles.contextText}>{estruturaNome ?? 'Estrutura ativa'}</Text></View>
        {visibleAreas.length === 0 ? <View style={styles.empty}><Ionicons name="lock-closed-outline" size={26} color={colors.textMuted} /><Text style={styles.emptyTitle}>Nenhuma area disponivel</Text><Text style={styles.emptyText}>Seu contexto atual nao possui permissoes administrativas.</Text></View> : <View style={styles.list}>{visibleAreas.map((area) => <Pressable key={area.key} accessibilityRole="button" accessibilityLabel={`Abrir ${area.title}`} style={({ pressed }) => [styles.item, pressed && styles.itemPressed]} onPress={() => openArea(area)}><View style={styles.icon}><Ionicons name={area.icon} size={22} color={colors.brandBlue} /></View><View style={styles.itemText}><Text style={styles.itemTitle}>{area.title}</Text><Text style={styles.itemDescription}>{area.description}</Text><Text style={styles.scope}>{area.scope === 'global' ? 'Conta' : 'Estrutura ativa'}</Text></View><Ionicons name="chevron-forward" size={19} color={colors.textMuted} /></Pressable>)}</View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', gap: spacing.md, padding: spacing.lg },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, borderTopWidth: 3, borderTopColor: colors.brandBlue, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.lg },
  headerContent: { flex: 1, minWidth: 0, gap: spacing.xs },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  breadcrumbText: { ...typography.caption, color: colors.textMuted },
  breadcrumbCurrent: { ...typography.caption, color: colors.textBody, fontWeight: '700' },
  title: { ...typography.h1, color: colors.textHeading },
  subtitle: { ...typography.body, color: colors.textSecondary },
  activeChip: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.full, backgroundColor: '#EFF6FF', paddingHorizontal: spacing.sm },
  activeChipText: { ...typography.caption, color: colors.brandBlue, fontWeight: '700' },
  context: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xs },
  contextText: { ...typography.bodySmall, color: colors.textBody, fontWeight: '700' },
  list: { gap: spacing.sm },
  item: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.md },
  itemPressed: { opacity: 0.72 },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: '#EEF5FF' },
  itemText: { flex: 1, minWidth: 0, gap: spacing.xs },
  itemTitle: { ...typography.body, color: colors.textHeading, fontWeight: '700' },
  itemDescription: { ...typography.bodySmall, color: colors.textSecondary },
  scope: { ...typography.caption, color: colors.textMuted },
  empty: { alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.textHeading, textAlign: 'center' },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
});
