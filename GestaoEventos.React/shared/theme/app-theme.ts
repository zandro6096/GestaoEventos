import type { PermissionAction, PermissionResource } from '../../services/permissions/permission.types';
import { colors, radius, spacing, typography } from '../design/tokens';

export type NavigationItem = {
  key: string;
  label: string;
  href: string;
  aliases?: string[];
  icon: string;
  activeIcon: string;
  action: PermissionAction;
  resource: PermissionResource;
};

export const layoutMetrics = {
  mobileHeaderHeight: 56,
  desktopHeaderHeight: 64,
  bottomNavHeight: 60,
  sidebarWidth: 240,
  collapsedSidebarWidth: 72,
  contentMaxWidth: 1400,
  tabletBreakpoint: 768,
  desktopBreakpoint: 1024,
};

export const appTheme = {
  colors,
  spacing,
  radius,
  typography,
  layoutMetrics,
};

export const primaryNavigationItems: NavigationItem[] = [
  {
    key: 'jornada',
    label: 'Jornada',
    href: '/jornada',
    aliases: ['/admin/jornada'],
    icon: 'map-outline',
    activeIcon: 'map',
    action: 'ler',
    resource: 'jornada',
  },
  {
    key: 'eventos',
    label: 'Eventos',
    href: '/eventos/meus',
    aliases: ['/admin/eventos/meus', '/admin/eventos', '/eventos'],
    icon: 'calendar-outline',
    activeIcon: 'calendar',
    action: 'ler',
    resource: 'eventos',
  },
  {
    key: 'grupos',
    label: 'Grupos',
    href: '/admin/grupos',
    icon: 'people-outline',
    activeIcon: 'people',
    action: 'ler',
    resource: 'grupos',
  },
  {
    key: 'painel',
    label: 'Painel',
    href: '/admin/painel',
    icon: 'grid-outline',
    activeIcon: 'grid',
    action: 'ler',
    resource: 'painel',
  },
  {
    key: 'perfil',
    label: 'Perfil',
    href: '/perfil',
    icon: 'person-circle-outline',
    activeIcon: 'person-circle',
    action: 'ler',
    resource: 'jornada',
  },
];

export const secondaryNavigationItems: NavigationItem[] = [
  {
    key: 'relatorios',
    label: 'Relatorios',
    href: '/relatorios/frequencia',
    icon: 'bar-chart-outline',
    activeIcon: 'bar-chart',
    action: 'ler',
    resource: 'relatorios',
  },
  {
    key: 'configuracoes',
    label: 'Configuracoes',
    href: '/admin/configuracoes',
    icon: 'settings-outline',
    activeIcon: 'settings',
    action: 'gerenciar',
    resource: 'configuracoes',
  },
];
