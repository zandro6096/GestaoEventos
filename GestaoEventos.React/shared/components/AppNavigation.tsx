import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter, type Href } from "expo-router";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { can } from "../../services/permissions/permission.facade";
import { useContextStore } from "../../stores/context.store";
import { usePermissionStore } from "../../stores/permission.store";
import {
  layoutMetrics,
  primaryNavigationItems,
  secondaryNavigationItems,
  type NavigationItem,
} from "../theme";
import { colors, radius, spacing, typography } from "../design/tokens";

type AppNavigationProps = {
  variant: "bottom" | "sidebar";
  notificationCount?: number;
};

type IconName = keyof typeof Ionicons.glyphMap;

type MoreMenuItem = NavigationItem & { visible?: boolean };
type MoreMenuSection = { label: string; icon: IconName; items: MoreMenuItem[] };

const moreMenuSections: MoreMenuSection[] = [
  {
    label: "Início",
    icon: "home-outline",
    items: [
      {
        key: "more-meu-dia",
        label: "Meu Dia",
        href: "/jornada",
        aliases: ["/admin/jornada"],
        icon: "sunny-outline",
        activeIcon: "sunny",
        action: "ler",
        resource: "jornada",
      },
      {
        key: "more-painel-saude",
        label: "Painel de Saúde",
        href: "/admin/painel/cockpit",
        icon: "pie-chart-outline",
        activeIcon: "pie-chart",
        action: "ler",
        resource: "painel",
      },
      {
        key: "more-fila-semanal",
        label: "Fila Semanal",
        href: "/admin/painel/fila-semanal",
        icon: "list-outline",
        activeIcon: "list",
        action: "ler",
        resource: "painel",
      },
    ],
  },
  {
    label: "Eventos",
    icon: "calendar-outline",
    items: [
      {
        key: "more-meus-eventos",
        label: "Meus Eventos (Gestão)",
        href: "/admin/eventos/meus",
        aliases: ["/eventos/meus"],
        icon: "list-outline",
        activeIcon: "list",
        action: "ler",
        resource: "eventos",
      },
      {
        key: "more-criar-evento",
        label: "Criar Evento",
        href: "/admin/eventos/criar",
        icon: "add-circle-outline",
        activeIcon: "add-circle",
        action: "criar",
        resource: "eventos",
      },
      {
        key: "more-modelos-evento",
        label: "Modelos de Evento",
        href: "/admin/eventos/modelos",
        icon: "copy-outline",
        activeIcon: "copy",
        action: "criar",
        resource: "eventos",
      },
      {
        key: "more-objetivos",
        label: "Objetivos",
        href: "/admin/eventos/objetivos",
        icon: "locate-outline",
        activeIcon: "locate",
        action: "criar",
        resource: "eventos",
      },
      {
        key: "more-iniciar-evento",
        label: "Iniciar Evento",
        href: "/admin/eventos/iniciar",
        aliases: ["/eventos/iniciar"],
        icon: "play-circle-outline",
        activeIcon: "play-circle",
        action: "criar",
        resource: "eventos",
      },
    ],
  },
  {
    label: "Estrutura",
    icon: "git-network-outline",
    items: [
      {
        key: "more-grupos",
        label: "Grupos e Participantes",
        href: "/admin/grupos",
        aliases: ["/grupos"],
        icon: "people-outline",
        activeIcon: "people",
        action: "ler",
        resource: "grupos",
      },
    ],
  },
  {
    label: "Frequência",
    icon: "analytics-outline",
    items: [
      {
        key: "more-relatorios",
        label: "Relatórios",
        href: "/relatorios/frequencia",
        aliases: ["/admin/relatorios/frequencia"],
        icon: "document-text-outline",
        activeIcon: "document-text",
        action: "ler",
        resource: "relatorios",
      },
    ],
  },
  {
    label: "Administração",
    icon: "settings-outline",
    items: [
      {
        key: "more-membros",
        label: "Membros",
        href: "/admin/membros",
        icon: "people-outline",
        activeIcon: "people",
        action: "gerenciar",
        resource: "configuracoes",
      },
      {
        key: "more-papeis",
        label: "Papéis",
        href: "/admin/papeis",
        icon: "shield-checkmark-outline",
        activeIcon: "shield-checkmark",
        action: "gerenciar",
        resource: "configuracoes",
      },
      {
        key: "more-configuracoes",
        label: "Configurações",
        href: "/admin/configuracoes",
        aliases: ["/configuracoes"],
        icon: "settings-outline",
        activeIcon: "settings",
        action: "gerenciar",
        resource: "configuracoes",
      },
    ],
  },
];

export function AppNavigation({ variant, notificationCount = 0 }: AppNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  useContextStore((state) => state.updatedAt);
  usePermissionStore((state) => state.hydratedAt);

  const primaryItems = primaryNavigationItems.filter((item) =>
    can(item.action, item.resource),
  );
  const secondaryItems = secondaryNavigationItems.filter((item) =>
    can(item.action, item.resource),
  );

  if (variant === "bottom") {
    const quickItems = primaryItems.filter(
      (item) => item.key === "jornada" || item.key === "eventos",
    );
    const visibleMoreSections = moreMenuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => can(item.action, item.resource)),
      }))
      .filter((section) => section.items.length > 0);
    const navigate = (href: string) => {
      setMoreOpen(false);
      router.push(href as Href);
    };
    return (
      <>
        <View accessibilityRole="tablist" style={styles.bottomNav}>
          {quickItems.map((item) => (
            <NavigationButton
              item={item}
              key={item.key}
              active={isActiveRoute(pathname, item)}
              compact
              iconOverride={
                item.key === "jornada"
                  ? isActiveRoute(pathname, item)
                    ? "home"
                    : "home-outline"
                  : undefined
              }
              labelOverride={item.key === "jornada" ? "Início" : item.label}
              onPress={() => navigate(item.href)}
            />
          ))}
          <Pressable
            accessibilityLabel="Mais opções"
            accessibilityRole="button"
            accessibilityState={moreOpen ? { expanded: true } : undefined}
            style={({ pressed }) => [
              styles.bottomItem,
              moreOpen ? styles.bottomItemActive : null,
              pressed ? styles.pressed : null,
            ]}
            onPress={() => setMoreOpen(true)}
          >
            <View style={styles.bottomIconWrap}>
              <Ionicons
                name="grid-outline"
                size={22}
                color={moreOpen ? colors.brandBlue : colors.textMuted}
              />
              {notificationCount > 0 ? (
                <View style={styles.moreBadge}>
                  <Text style={styles.moreBadgeText}>{notificationCount > 99 ? "99+" : notificationCount}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[styles.bottomLabel, moreOpen ? styles.labelActive : null]}
            >
              Mais
            </Text>
          </Pressable>
        </View>
        <Modal
          transparent
          visible={moreOpen}
          animationType="slide"
          onRequestClose={() => setMoreOpen(false)}
        >
          <View style={styles.sheetLayer}>
            <Pressable
              accessibilityLabel="Fechar menu"
              style={styles.sheetBackdrop}
              onPress={() => setMoreOpen(false)}
            />
            <View style={styles.sheet} accessibilityViewIsModal>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Menu</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Fechar menu"
                  style={styles.sheetClose}
                  onPress={() => setMoreOpen(false)}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.sheetContent}>
                {visibleMoreSections.map((section) => (
                  <View key={section.label} style={styles.moreSection}>
                    <View style={styles.moreSectionTitleRow}>
                      <Ionicons
                        name={section.icon}
                        size={16}
                        color={colors.textMuted}
                      />
                      <Text style={styles.moreSectionTitle}>
                        {section.label}
                      </Text>
                    </View>
                    {section.items.map((item) => (
                      <NavigationButton
                        item={item}
                        key={item.key}
                        active={isActiveRoute(pathname, item)}
                        onPress={() => navigate(item.href)}
                      />
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandBlock}>
        <Image
          accessibilityLabel="Gestão de Eventos"
          source={require("../../assets/gestao-eventos-logo.png")}
          resizeMode="contain"
          style={styles.sidebarLogo}
        />
        <Text style={styles.brandMeta}>Operacao</Text>
      </View>
      <View style={styles.sidebarSection}>
        {primaryItems.map((item) => (
          <NavigationButton
            item={item}
            key={item.key}
            active={isActiveRoute(pathname, item)}
            onPress={() => router.push(item.href as Href)}
          />
        ))}
      </View>
      {secondaryItems.length > 0 ? (
        <View style={styles.sidebarFooter}>
          {secondaryItems.map((item) => (
            <NavigationButton
              item={item}
              key={item.key}
              active={isActiveRoute(pathname, item)}
              onPress={() => router.push(item.href as Href)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function NavigationButton({
  item,
  active,
  compact,
  iconOverride,
  labelOverride,
  onPress,
}: {
  item: NavigationItem;
  active: boolean;
  compact?: boolean;
  iconOverride?: IconName;
  labelOverride?: string;
  onPress: () => void;
}) {
  const iconName =
    iconOverride ?? ((active ? item.activeIcon : item.icon) as IconName);

  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole={compact ? "tab" : "button"}
      accessibilityState={active ? { selected: true } : undefined}
      style={({ pressed }) => [
        compact ? styles.bottomItem : styles.sidebarItem,
        active
          ? compact
            ? styles.bottomItemActive
            : styles.sidebarItemActive
          : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={iconName}
        size={compact ? 22 : 20}
        color={active ? colors.brandBlue : colors.textMuted}
      />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={[
          compact ? styles.bottomLabel : styles.sidebarLabel,
          active ? styles.labelActive : null,
        ]}
      >
        {labelOverride ?? item.label}
      </Text>
    </Pressable>
  );
}

function isActiveRoute(pathname: string, item: NavigationItem) {
  return [item.href, ...(item.aliases ?? [])].some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.sm,
    paddingBottom: 2,
    boxShadow: "0px -2px 8px rgba(15, 23, 42, 0.06)",
  },
  bottomItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  bottomItemActive: {
    backgroundColor: "transparent",
  },
  bottomIconWrap: {
    position: "relative",
  },
  moreBadge: {
    position: "absolute",
    top: -7,
    right: -11,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surfacePrimary,
    borderRadius: radius.full,
    backgroundColor: colors.error,
    paddingHorizontal: 2,
  },
  moreBadgeText: {
    fontSize: 8,
    lineHeight: 11,
    color: colors.surfacePrimary,
    fontWeight: "800",
  },
  bottomLabel: {
    fontSize: 10,
    lineHeight: 14,
    maxWidth: "100%",
    color: colors.textMuted,
    fontWeight: "700",
    textAlign: "center",
  },
  sidebar: {
    width: layoutMetrics.sidebarWidth,
    minWidth: layoutMetrics.sidebarWidth,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  brandBlock: {
    minHeight: layoutMetrics.desktopHeaderHeight,
    justifyContent: "center",
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    marginBottom: spacing.md,
  },
  sidebarLogo: {
    width: 136,
    height: 40,
    alignSelf: "flex-start",
  },
  brandMeta: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  sidebarSection: {
    flex: 1,
    gap: spacing.xs,
  },
  sidebarFooter: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  sidebarItem: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  sidebarItemActive: {
    backgroundColor: colors.surfaceMuted,
  },
  sidebarLabel: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textBody,
    fontWeight: "700",
  },
  labelActive: {
    color: colors.brandBlue,
  },
  pressed: {
    opacity: 0.72,
  },
  sheetLayer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
  },
  sheet: {
    maxHeight: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.surfacePrimary,
    paddingBottom: spacing.lg,
    boxShadow: "0px -6px 20px rgba(15, 23, 42, 0.14)",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    alignSelf: "center",
    marginTop: spacing.sm,
    borderRadius: 2,
    backgroundColor: colors.borderSubtle,
  },
  sheetHeader: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: spacing.lg,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.textHeading,
  },
  sheetClose: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  sheetContent: {
    gap: spacing.md,
    padding: spacing.md,
  },
  moreSection: {
    gap: spacing.xs,
  },
  moreSectionTitleRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  moreSectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "800",
  },
});
