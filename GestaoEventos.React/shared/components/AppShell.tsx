import { Slot, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { notificacoesInternasApi } from '../../services/api/notificacoes-internas-api';
import { painelApi, type CockpitAniversariante } from '../../services/api/painel-api';
import { usePushNotifications } from '../../services/notifications/usePushNotifications';
import { can } from '../../services/permissions/permission.facade';
import { AppNavigation } from './AppNavigation';
import { ContextSwitcher } from './ContextSwitcher';
import { useAuthStore } from '../../stores/auth.store';
import { useContextStore } from '../../stores/context.store';
import { colors, radius, spacing, typography } from '../design/tokens';
import { layoutMetrics, primaryNavigationItems, secondaryNavigationItems } from '../theme';

export function AppShell() {
  usePushNotifications();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const userName = useAuthStore((state) => state.user?.nome ?? '');
  const userEmail = useAuthStore((state) => state.user?.email ?? '');
  const logout = useAuthStore((state) => state.logout);
  const estruturaId = useContextStore((state) => state.estruturaId);
  const estruturaNome = useContextStore((state) => state.estruturaNome);
  const estruturaLogoUrl = useContextStore((state) => state.estruturaLogoUrl);
  const queryClient = useQueryClient();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isDesktop = width >= layoutMetrics.desktopBreakpoint;
  const { bottomNavHeight, sidebarWidth } = layoutMetrics;
  const routeLabel = getRouteLabel(pathname);
  const notifications = useQuery({
    queryKey: ['notificacoes-internas', estruturaId],
    queryFn: () => notificacoesInternasApi.listar(estruturaId!),
    enabled: !isDesktop && Boolean(estruturaId),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const birthdays = useQuery({
    queryKey: ['cockpit-header-aniversariantes', estruturaId],
    queryFn: () => painelApi.getCockpit({ estruturaId: estruturaId!, dataInicio: formatDateParam(new Date()), dataFim: formatDateParam(addDays(new Date(), 30)) }),
    enabled: !isDesktop && Boolean(estruturaId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificacoesInternasApi.marcarLida(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes-internas', estruturaId] }),
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => notificacoesInternasApi.marcarTodasLidas(estruturaId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes-internas', estruturaId] }),
  });

  if (isDesktop) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.desktopRoot, { minWidth: sidebarWidth }]}>
          <AppNavigation variant="sidebar" notificationCount={notifications.data?.naoLidas ?? 0} />
          <View style={styles.desktopMain}>
            <View style={styles.topbar}>
              <View style={styles.breadcrumb}>
                <Text style={styles.breadcrumbLabel}>Area autenticada</Text>
                <Text style={styles.breadcrumbTitle}>{routeLabel}</Text>
              </View>
              <View style={styles.contextDesktop}>
                <ContextSwitcher />
              </View>
            </View>
            <View style={styles.desktopContent}>
              <View style={styles.contentLimit}>
                <Slot />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.mobileRoot}>
        <View style={styles.mobileHeader}>
          <View accessibilityLabel="GestaoEventos" style={styles.mobileBrand}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="Gestão de Eventos"
              source={estruturaLogoUrl ? { uri: estruturaLogoUrl } : require('../../assets/gestao-eventos-logo.png')}
              resizeMode="contain"
              style={styles.mobileLogo}
            />
          </View>
          <View style={styles.mobileContext}>
            <ContextSwitcher compact />
          </View>
          <View style={styles.mobileHeaderActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Central de notificações" style={styles.mobileHeaderIcon} onPress={() => { setProfileOpen(false); setBellOpen(true); void notifications.refetch(); }}>
              <Ionicons name="notifications-outline" size={21} color={colors.textBody} />
              {notifications.data?.naoLidas ? <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>{notifications.data.naoLidas > 99 ? '99+' : notifications.data.naoLidas}</Text></View> : null}
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir menu do perfil" style={styles.mobileAvatar} onPress={() => { setBellOpen(false); setProfileOpen(true); }}>
              <Text style={styles.mobileAvatarText}>{getInitials(userName)}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.mobileContent}>
          <Slot />
        </View>
        <View style={{ minHeight: bottomNavHeight }}>
          <AppNavigation variant="bottom" notificationCount={notifications.data?.naoLidas ?? 0} />
        </View>
      </View>
      <MobileBellMenu
        visible={bellOpen}
        notifications={notifications.data?.itens ?? []}
        loading={notifications.isLoading || notifications.isFetching}
        error={notifications.isError}
        unreadCount={notifications.data?.naoLidas ?? 0}
        birthdays={birthdays.data?.aniversariantesMes ?? []}
        onClose={() => setBellOpen(false)}
        onMarkRead={(id) => markReadMutation.mutate(id)}
        onMarkAllRead={() => markAllReadMutation.mutate()}
        onOpenQueue={() => { setBellOpen(false); router.push('/admin/painel/fila-semanal'); }}
      />
      <MobileProfileMenu
        visible={profileOpen}
        name={userName}
        email={userEmail}
        structureName={estruturaNome}
        canOpenPlan={can('gerenciar', 'configuracoes')}
        onClose={() => setProfileOpen(false)}
        onProfile={() => { setProfileOpen(false); router.push('/perfil'); }}
        onPlan={() => { setProfileOpen(false); router.push('/admin/planos'); }}
        onStructures={() => { setProfileOpen(false); router.push('/estrutura/selecionar'); }}
        onLogout={() => { setProfileOpen(false); void logout(); }}
      />
    </SafeAreaView>
  );
}

function MobileBellMenu({
  visible,
  notifications,
  birthdays,
  loading,
  error,
  unreadCount,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onOpenQueue,
}: {
  visible: boolean;
  notifications: { id: number; titulo: string; mensagem: string; criadoEm: string; lida: boolean }[];
  birthdays: CockpitAniversariante[];
  loading: boolean;
  error: boolean;
  unreadCount: number;
  onClose: () => void;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onOpenQueue: () => void;
}) {
  const [tab, setTab] = useState<'atribuicoes' | 'aniversariantes'>('atribuicoes');
  const visibleBirthdays = birthdays.filter((item) => item.diasParaAniversario <= 7);

  return <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <View style={styles.popoverLayer}>
      <Pressable style={styles.popoverBackdrop} onPress={onClose} />
      <View style={styles.bellPopover} accessibilityViewIsModal>
        <View style={styles.popoverTabs}>
          <Pressable style={[styles.popoverTab, tab === 'atribuicoes' && styles.popoverTabActive]} onPress={() => setTab('atribuicoes')}><Text style={[styles.popoverTabText, tab === 'atribuicoes' && styles.popoverTabTextActive]}>Atribuições</Text>{unreadCount > 0 ? <Text style={styles.tabCount}>{unreadCount > 99 ? '99+' : unreadCount}</Text> : null}</Pressable>
          <Pressable style={[styles.popoverTab, tab === 'aniversariantes' && styles.popoverTabActive]} onPress={() => setTab('aniversariantes')}><Text style={[styles.popoverTabText, tab === 'aniversariantes' && styles.popoverTabTextActive]}>Aniversariantes</Text></Pressable>
          </View>
        {tab === 'atribuicoes' ? <>
          <View style={styles.popoverSectionHeader}><Text style={styles.popoverSectionTitle}>Fila Semanal</Text><Pressable disabled={unreadCount === 0} onPress={onMarkAllRead}><Text style={[styles.popoverAction, unreadCount === 0 && styles.disabledText]}>Marcar todas</Text></Pressable></View>
          {loading ? <PopoverState icon="sync-outline" text="Carregando atribuições..." /> : error ? <PopoverState icon="alert-circle-outline" text="Falha ao carregar notificações." /> : notifications.length === 0 ? <PopoverState icon="file-tray-outline" text="Sem atribuições pendentes" /> : <ScrollView style={styles.notificationList} contentContainerStyle={styles.notificationListContent}>{notifications.map((item) => <View key={item.id} style={[styles.notificationItem, !item.lida && styles.notificationUnread]}><View style={styles.notificationCopy}><Text style={styles.notificationTitle}>{item.titulo}</Text><Text style={styles.notificationMessage}>{item.mensagem}</Text><Text style={styles.notificationDate}>{formatNotificationDate(item.criadoEm)}</Text></View><Pressable disabled={item.lida} onPress={() => onMarkRead(item.id)}><Text style={[styles.popoverAction, item.lida && styles.disabledText]}>{item.lida ? 'Lida' : 'Marcar'}</Text></Pressable></View>)}</ScrollView>}
          <Pressable style={styles.queueLink} onPress={onOpenQueue}><Text style={styles.queueLinkText}>Abrir fila semanal</Text><Ionicons name="arrow-forward" size={15} color={colors.brandBlue} /></Pressable>
        </> : visibleBirthdays.length === 0 ? <PopoverState icon="calendar-outline" text="Nenhum aniversário nos próximos 7 dias" /> : <ScrollView style={styles.notificationList} contentContainerStyle={styles.notificationListContent}>{visibleBirthdays.map((item) => <View key={`${item.tipo}:${item.id}`} style={[styles.birthdayItem, item.fazAniversarioHoje && styles.birthdayItemToday]}><View style={[styles.birthdayAvatar, item.fazAniversarioHoje && styles.birthdayAvatarToday]}><Text style={styles.birthdayAvatarText}>{getInitials(item.nome)}</Text></View><View style={styles.notificationCopy}><Text style={styles.notificationTitle}>{item.nome}</Text><Text style={styles.notificationDate}>{formatBirthdayDate(item.dataNascimento)}</Text></View><Text style={[styles.birthdayTag, item.fazAniversarioHoje && styles.birthdayTagToday]}>{item.fazAniversarioHoje ? 'Hoje!' : item.diasParaAniversario === 1 ? 'Amanhã' : `Em ${item.diasParaAniversario} dias`}</Text></View>)}</ScrollView>}
      </View>
    </View>
  </Modal>;
}

function MobileProfileMenu({ visible, name, email, structureName, canOpenPlan, onClose, onProfile, onPlan, onStructures, onLogout }: { visible: boolean; name: string; email: string; structureName: string | null; canOpenPlan: boolean; onClose: () => void; onProfile: () => void; onPlan: () => void; onStructures: () => void; onLogout: () => void }) {
  return <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <View style={styles.popoverLayer}><Pressable style={styles.popoverBackdrop} onPress={onClose} /><View style={styles.profilePopover} accessibilityViewIsModal>
      <Text style={styles.profileMeta}>Logado como</Text><Text style={styles.profileName}>{name || 'Usuário'}</Text>{email ? <Text style={styles.profileEmail}>{email}</Text> : null}{structureName ? <Text style={styles.profileEmail}>{structureName}</Text> : null}
      <View style={styles.menuDivider} />
      <Text style={styles.menuGroupLabel}>Conta</Text><ProfileMenuItem icon="person-outline" label="Meu Perfil" onPress={onProfile} />{canOpenPlan ? <ProfileMenuItem icon="card-outline" label="Meu Plano" onPress={onPlan} /> : null}
      <View style={styles.menuDivider} /><Text style={styles.menuGroupLabel}>Organizações</Text><ProfileMenuItem icon="business-outline" label="Minhas Organizações" onPress={onStructures} /><View style={styles.menuDivider} /><ProfileMenuItem danger icon="log-out-outline" label="Sair" onPress={onLogout} />
    </View></View>
  </Modal>;
}

function ProfileMenuItem({ icon, label, onPress, danger = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; danger?: boolean }) {
  return <Pressable style={styles.profileItem} onPress={onPress}><Ionicons name={icon} size={18} color={danger ? colors.error : colors.textSecondary} /><Text style={[styles.profileItemText, danger && styles.profileItemDanger]}>{label}</Text></Pressable>;
}

function PopoverState({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return <View style={styles.popoverState}><Ionicons name={icon} size={22} color={colors.textMuted} /><Text style={styles.popoverStateText}>{text}</Text></View>;
}

function formatNotificationDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatBirthdayDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function addDays(value: Date, days: number) {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateParam(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getRouteLabel(pathname: string) {
  const items = [...primaryNavigationItems, ...secondaryNavigationItems];
  const active = items.find((item) =>
    [item.href, ...(item.aliases ?? [])].some((href) => pathname === href || pathname.startsWith(`${href}/`)),
  );
  return active?.label ?? 'Jornada';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfacePage,
  },
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surfacePage,
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
  },
  topbar: {
    minHeight: layoutMetrics.desktopHeaderHeight,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surfacePage,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  breadcrumb: {
    minWidth: 0,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  breadcrumbLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  breadcrumbTitle: {
    ...typography.h3,
    color: colors.textHeading,
  },
  contextDesktop: {
    width: 360,
    maxWidth: '42%',
  },
  desktopContent: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  contentLimit: {
    width: '100%',
    maxWidth: layoutMetrics.contentMaxWidth,
    flex: 1,
  },
  mobileRoot: {
    flex: 1,
    backgroundColor: colors.surfacePage,
  },
  mobileHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
  },
  mobileBrand: {
    width: 42,
    minWidth: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mobileLogo: {
    width: 34,
    height: 30,
  },
  mobileBrandText: {
    minWidth: 0,
    gap: 1,
  },
  mobileBrandName: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: '700',
  },
  mobileRoute: {
    ...typography.caption,
    color: colors.textMuted,
  },
  mobileContext: {
    flex: 1,
    minWidth: 0,
    maxWidth: 240,
    marginHorizontal: spacing.sm,
  },
  mobileHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mobileHeaderIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
  },
  mobileAvatar: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.brandBlue,
  },
  mobileAvatarText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: '800',
  },
  notificationBadge: { position: 'absolute', top: -4, right: -5, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surfacePrimary, borderRadius: radius.full, backgroundColor: colors.error, paddingHorizontal: 3 },
  notificationBadgeText: { fontSize: 9, lineHeight: 12, color: colors.surfacePrimary, fontWeight: '800' },
  mobileContent: {
    flex: 1,
    minHeight: 0,
  },
  popoverLayer: { flex: 1, alignItems: 'flex-end', paddingTop: 94, paddingHorizontal: 12 },
  popoverBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'transparent' },
  bellPopover: { width: 340, maxWidth: '100%', maxHeight: '72%', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, boxShadow: '0px 12px 28px rgba(15, 23, 42, 0.16)', overflow: 'hidden' },
  popoverTabs: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surfaceMuted },
  popoverTab: { flex: 1, minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.sm },
  popoverTabActive: { borderColor: colors.info, backgroundColor: '#EFF6FF' },
  popoverTabText: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  popoverTabTextActive: { color: colors.brandBlue },
  tabCount: { minWidth: 16, height: 16, textAlign: 'center', borderRadius: radius.full, backgroundColor: colors.error, color: colors.surfacePrimary, fontSize: 10, lineHeight: 16, fontWeight: '800', paddingHorizontal: 3 },
  popoverSectionHeader: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surfaceMuted, paddingHorizontal: spacing.md },
  popoverSectionTitle: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' },
  popoverAction: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' },
  disabledText: { color: colors.textDisabled },
  notificationList: { maxHeight: 360 },
  notificationListContent: { gap: spacing.sm, padding: spacing.sm },
  notificationItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, padding: spacing.sm },
  notificationUnread: { borderColor: '#BFDBFE', backgroundColor: '#F8FBFF' },
  notificationCopy: { flex: 1, minWidth: 0, gap: 2 },
  notificationTitle: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' },
  notificationMessage: { ...typography.caption, color: colors.textSecondary },
  notificationDate: { ...typography.caption, color: colors.textMuted },
  birthdayItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, padding: spacing.sm },
  birthdayItemToday: { borderColor: '#FECACA', backgroundColor: '#FFF7ED' },
  birthdayAvatar: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: '#E0E7FF' },
  birthdayAvatarToday: { backgroundColor: '#FF6B6B' },
  birthdayAvatarText: { ...typography.caption, color: '#4F46E5', fontWeight: '800' },
  birthdayTag: { ...typography.caption, color: colors.warning, fontWeight: '800' },
  birthdayTagToday: { color: colors.error },
  queueLink: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderTopWidth: 1, borderTopColor: colors.surfaceMuted },
  queueLinkText: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' },
  popoverState: { minHeight: 112, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg },
  popoverStateText: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
  profilePopover: { width: 300, maxWidth: '100%', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.md, boxShadow: '0px 12px 28px rgba(15, 23, 42, 0.16)' },
  profileMeta: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  profileName: { ...typography.body, color: colors.textHeading, fontWeight: '800' },
  profileEmail: { ...typography.caption, color: colors.textSecondary },
  menuDivider: { height: 1, backgroundColor: colors.surfaceMuted, marginVertical: spacing.sm },
  menuGroupLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '800', textTransform: 'uppercase', marginBottom: spacing.xs },
  profileItem: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.sm, paddingHorizontal: spacing.sm },
  profileItemText: { ...typography.bodySmall, color: colors.textBody, fontWeight: '700' },
  profileItemDanger: { color: colors.error },
});

function getInitials(value: string) {
  const initials = value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  return initials || 'SD';
}
