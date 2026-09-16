import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { normalizeApiError } from "../../../services/api/api-error";
import {
  eventoTemplatesApi,
  type EventoTemplate,
} from "../../../services/api/evento-templates-api";
import { track } from "../../../services/analytics/analytics.service";
import { assertOnlineForMutation } from "../../../services/offline/mutation-guard";
import { can } from "../../../services/permissions/permission.facade";
import { useContextStore } from "../../../stores/context.store";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../shared/design/tokens";
import { layoutMetrics } from "../../../shared/theme";

const recurrenceNames = ["Unico", "Diario", "Semanal", "Mensal", "Anual"];

export function EventoTemplatesScreen() {
  const router = useRouter();
  const client = useQueryClient();
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const estruturaId = useContextStore((state) => state.estruturaId);
  const estruturaNome = useContextStore((state) => state.estruturaNome);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<EventoTemplate | null>(null);
  const allowed = Boolean(
    estruturaId && can("criar", "eventos", { estruturaId }),
  );
  const query = useQuery({
    queryKey: ["evento-templates", estruturaId, page],
    queryFn: () => eventoTemplatesApi.listPage(estruturaId!, page, 20),
    enabled: allowed,
    retry: false,
  });
  const remove = useMutation({
    mutationFn: async (template: EventoTemplate) => {
      assertOnlineForMutation("Excluir modelo de evento");
      return eventoTemplatesApi.remove(template.id);
    },
    onSuccess: (_data, template) => {
      track("confirmation", "modelo_evento:excluir_success", {
        extra: { template_id: template.id },
      });
      setDeleting(null);
      void client.invalidateQueries({
        queryKey: ["evento-templates", estruturaId],
      });
    },
  });
  const templates = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const totals = useMemo(
    () => ({
      active: templates.filter((item) => item.status === "ATIVO").length,
      weekly: templates.filter((item) => item.tipoRecorrencia === 2).length,
      groups: templates.reduce(
        (sum, item) => sum + (item.gruposIds?.length ?? 0),
        0,
      ),
    }),
    [templates],
  );

  function openCreate() {
    track("entrance", "btn:modelo_evento_novo");
    router.push("/admin/eventos/tipos/criar" as Href);
  }

  function openEdit(template: EventoTemplate) {
    track("entrance", "btn:modelo_evento_editar", {
      extra: { template_id: template.id },
    });
    router.push(`/admin/eventos/tipos/editar/${template.id}` as Href);
  }

  function confirmDelete(template: EventoTemplate) {
    track("simulation", "modelo_evento:excluir_abrir", {
      extra: { template_id: template.id },
    });
    setDeleting(template);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, compact && styles.compact]}
      >
        <View style={styles.pageHeader}>
          <View style={styles.headerText}>
            <View style={styles.breadcrumb}>
              <Ionicons
                name="home-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={styles.breadcrumbText}>Eventos</Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={colors.textDisabled}
              />
              <Text style={styles.breadcrumbCurrent}>Modelos de Evento</Text>
            </View>
            <Text style={styles.title}>Modelos de Evento</Text>
            <Text style={styles.subtitle}>
              Modelos definem o padrao de reunioes recorrentes para cada grupo
              usar.
            </Text>
            <Text style={styles.scopeHint}>
              Estrutura ativa:{" "}
              <Text style={styles.strong}>
                {estruturaNome ?? "Nao selecionada"}
              </Text>
              . Grupos e eventos continuam sendo entidades separadas.
            </Text>
          </View>
          {allowed ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Novo modelo"
              style={styles.primaryButton}
              onPress={openCreate}
            >
              <Ionicons name="add" size={19} color={colors.surfacePrimary} />
              <Text style={styles.primaryText}>Novo modelo</Text>
            </Pressable>
          ) : null}
        </View>

        {!allowed ? (
          <State message="Voce nao tem permissao para gerenciar modelos neste contexto." />
        ) : null}
        {allowed && !query.isLoading && !query.isError ? (
          <View style={styles.overview}>
            <OverviewCard
              label="Biblioteca ativa"
              value={String(query.data?.total ?? templates.length)}
              detail={`${totals.active} modelos ativos prontos para uso`}
              tone="blue"
            />
            <OverviewCard
              label="Recorrencia semanal"
              value={String(totals.weekly)}
              detail="Modelos com cadencia semanal"
              tone="green"
            />
            <OverviewCard
              label="Grupos cobertos"
              value={String(totals.groups)}
              detail="Vinculos diretos publicados"
              tone="amber"
            />
          </View>
        ) : null}
        {query.isLoading ? (
          <State message="Carregando modelos..." loading />
        ) : null}
        {query.isError ? (
          <State
            message={
              normalizeApiError(query.error, "Erro ao carregar modelos.")
                .message
            }
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {allowed &&
        !query.isLoading &&
        !query.isError &&
        templates.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="albums-outline"
                size={27}
                color={colors.brandBlue}
              />
            </View>
            <Text style={styles.emptyTitle}>Nenhum modelo encontrado</Text>
            <Text style={styles.emptyText}>
              Crie seu primeiro modelo para começar a organizar seus eventos.
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              onPress={openCreate}
            >
              <Ionicons name="add" size={19} color={colors.surfacePrimary} />
              <Text style={styles.primaryText}>Criar primeiro modelo</Text>
            </Pressable>
          </View>
        ) : null}
        {allowed &&
        !query.isLoading &&
        !query.isError &&
        templates.length > 0 ? (
          <View style={styles.grid}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                compact={compact}
                onEdit={() => openEdit(template)}
                onDelete={() => confirmDelete(template)}
              />
            ))}
          </View>
        ) : null}
        {allowed && query.data && query.data.total > 0 ? (
          <Pagination
            page={page}
            totalPages={query.data.totalPages}
            onChange={setPage}
          />
        ) : null}
      </ScrollView>
      <Modal
        transparent
        visible={Boolean(deleting)}
        animationType="fade"
        onRequestClose={() => setDeleting(null)}
      >
        <View style={styles.modalLayer}>
          <View style={styles.modal}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning-outline" size={24} color={colors.error} />
            </View>
            <Text style={styles.modalTitle}>Excluir modelo?</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja excluir{" "}
              <Text style={styles.strong}>{deleting?.titulo}</Text>? Esta acao
              nao pode ser desfeita.
            </Text>
            {remove.isError ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {
                  normalizeApiError(
                    remove.error,
                    "Nao foi possivel excluir o modelo.",
                  ).message
                }
              </Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={() => setDeleting(null)}
                disabled={remove.isPending}
              >
                <Text style={styles.secondaryText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.dangerButton}
                onPress={() => deleting && remove.mutate(deleting)}
                disabled={remove.isPending}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={colors.surfacePrimary}
                />
                <Text style={styles.primaryText}>
                  {remove.isPending ? "Excluindo..." : "Excluir"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function OverviewCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "green" | "amber";
}) {
  return (
    <View
      style={[
        styles.overviewCard,
        tone === "blue"
          ? styles.overviewBlue
          : tone === "green"
            ? styles.overviewGreen
            : styles.overviewAmber,
      ]}
    >
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
      <Text style={styles.overviewDetail}>{detail}</Text>
    </View>
  );
}

function TemplateCard({
  template,
  compact,
  onEdit,
  onDelete,
}: {
  template: EventoTemplate;
  compact: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const recurrence = recurrenceNames[template.tipoRecorrencia] ?? "Recorrencia";
  const permissions = [
    ["Configurar dia", template.permitirConfigurarDia],
    ["Configurar hora", template.permitirConfigurarHora],
    ["Configurar local", template.permitirConfigurarLocal],
    ["Renomear", template.permitirRenomear],
    ["Add responsaveis", template.permitirAddResponsaveis],
    ["Remover responsaveis", template.permitirRemoverResponsaveis],
    ["Add participantes", template.permitirAddParticipantes],
    ["Remover participantes", template.permitirRemoverParticipantes],
  ] as const;
  return (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons
            name={
              template.tipoRecorrencia === 2 ? "calendar" : "calendar-outline"
            }
            size={22}
            color={colors.brandBlue}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{template.titulo}</Text>
          <Text style={styles.cardRecurrence}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />{" "}
            {recurrence}
            {template.intervalo > 1 ? ` (a cada ${template.intervalo})` : ""}
          </Text>
        </View>
        <View
          style={[
            styles.status,
            template.status === "ATIVO"
              ? styles.activeStatus
              : styles.inactiveStatus,
          ]}
        >
          <Text style={styles.statusText}>{template.status}</Text>
        </View>
      </View>
      <View style={[styles.highlights, compact && styles.highlightsCompact]}>
        <Highlight icon="calendar-outline" text={scheduleLabel(template)} />
        <Highlight
          icon="flash-outline"
          text={`${permissions.filter((item) => item[1]).length} permissoes ativas`}
        />
        {template.gruposIds?.length ? (
          <Highlight
            icon="git-network-outline"
            text={`${template.gruposIds.length} grupos`}
          />
        ) : null}
      </View>
      {template.descricao ? (
        <Text style={styles.description}>{template.descricao}</Text>
      ) : null}
      <View style={styles.permissionSection}>
        <View style={styles.permissionHeader}>
          <Text style={styles.permissionTitle}>Configuracao e gestao</Text>
          <Text style={styles.permissionCount}>{permissions.length} itens</Text>
        </View>
        <View style={styles.permissionGrid}>
          {permissions.map(([label, active]) => (
            <View key={label} style={styles.permissionItem}>
              <Ionicons
                name={active ? "checkmark-circle" : "close-circle"}
                size={16}
                color={active ? colors.success : colors.textDisabled}
              />
              <Text
                style={[styles.permissionText, !active && styles.disabledText]}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />{" "}
          {template.duracaoPadraoMinutos || 60} min
        </Text>
        <Text style={styles.meta}>
          {template.horarioPadrao?.slice(0, 5) || "Horario flexivel"}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${template.titulo}`}
          style={styles.secondaryButton}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={17} color={colors.brandBlue} />
          <Text style={styles.secondaryText}>Editar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${template.titulo}`}
          style={styles.dangerOutline}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={17} color={colors.error} />
          <Text style={styles.dangerText}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Highlight({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.highlight}>
      <Ionicons name={icon} size={15} color={colors.brandBlue} />
      <Text style={styles.highlightText}>{text}</Text>
    </View>
  );
}
function scheduleLabel(template: EventoTemplate) {
  if (template.tipoRecorrencia === 2 && template.diasSemana?.length)
    return template.diasSemana
      .slice(0, 2)
      .map((day) => day.slice(0, 3))
      .join(" · ");
  return template.horarioPadrao?.slice(0, 5) || "Agenda flexivel";
}
function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <View style={styles.pagination}>
      <Pressable
        accessibilityRole="button"
        disabled={page <= 1}
        style={[styles.pageButton, page <= 1 && styles.disabledButton]}
        onPress={() => onChange(page - 1)}
      >
        <Ionicons
          name="chevron-back"
          size={17}
          color={page <= 1 ? colors.textDisabled : colors.brandBlue}
        />
        <Text style={[styles.pageText, page <= 1 && styles.disabledText]}>
          Anterior
        </Text>
      </Pressable>
      <Text style={styles.pageInfo}>
        Pagina {page} de {Math.max(1, totalPages)}
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={page >= totalPages}
        style={[styles.pageButton, page >= totalPages && styles.disabledButton]}
        onPress={() => onChange(page + 1)}
      >
        <Text
          style={[styles.pageText, page >= totalPages && styles.disabledText]}
        >
          Proxima
        </Text>
        <Ionicons
          name="chevron-forward"
          size={17}
          color={page >= totalPages ? colors.textDisabled : colors.brandBlue}
        />
      </Pressable>
    </View>
  );
}
function State({
  message,
  loading = false,
  onRetry,
}: {
  message: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.state}>
      {loading ? (
        <ActivityIndicator color={colors.brandBlue} />
      ) : (
        <Ionicons name="albums-outline" size={27} color={colors.textMuted} />
      )}
      <Text style={styles.stateText}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={onRetry}
        >
          <Ionicons name="refresh-outline" size={17} color={colors.brandBlue} />
          <Text style={styles.secondaryText}>Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  content: {
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  compact: { padding: spacing.md, gap: spacing.md },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    borderTopWidth: 3,
    borderTopColor: colors.brandBlue,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  headerText: { flex: 1, minWidth: 0, gap: spacing.xs },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  breadcrumbText: { ...typography.caption, color: colors.textMuted },
  breadcrumbCurrent: {
    ...typography.caption,
    color: colors.textBody,
    fontWeight: "700",
  },
  title: { ...typography.h1, color: colors.textHeading },
  subtitle: { ...typography.body, color: colors.textSecondary },
  scopeHint: { ...typography.caption, color: colors.textMuted },
  strong: { fontWeight: "700", color: colors.textBody },
  primaryButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.md,
  },
  primaryText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: "700",
  },
  overview: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  overviewCard: {
    minWidth: 190,
    flex: 1,
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  overviewBlue: { borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" },
  overviewGreen: { borderColor: "#A7F3D0", backgroundColor: "#ECFDF5" },
  overviewAmber: { borderColor: "#FDE68A", backgroundColor: "#FFFBEB" },
  overviewLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  overviewValue: { ...typography.h2, color: colors.textHeading },
  overviewDetail: { ...typography.caption, color: colors.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    position: "relative",
    flexGrow: 1,
    flexBasis: 340,
    minWidth: 0,
    gap: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.brandBlue,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  cardIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: "#EEF5FF",
  },
  cardInfo: { flex: 1, minWidth: 0, gap: spacing.xs },
  cardTitle: { ...typography.h3, color: colors.textHeading },
  cardRecurrence: { ...typography.caption, color: colors.textMuted },
  status: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeStatus: { backgroundColor: "#ECFDF5" },
  inactiveStatus: { backgroundColor: "#FEF2F2" },
  statusText: {
    ...typography.caption,
    color: colors.textBody,
    fontWeight: "700",
  },
  highlights: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  highlightsCompact: { flexDirection: "column" },
  highlight: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
  },
  highlightText: { ...typography.caption, color: colors.textSecondary },
  description: { ...typography.bodySmall, color: colors.textSecondary },
  permissionSection: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  permissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  permissionTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: "700",
  },
  permissionCount: { ...typography.caption, color: colors.textMuted },
  permissionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  permissionItem: {
    width: "48%",
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  permissionText: {
    ...typography.caption,
    flexShrink: 1,
    color: colors.textBody,
  },
  disabledText: { color: colors.textDisabled },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  meta: { ...typography.caption, color: colors.textMuted },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  secondaryButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  dangerOutline: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  dangerText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: "700",
  },
  dangerButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xxl,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: "#EEF5FF",
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textHeading,
    textAlign: "center",
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  state: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xxl,
  },
  stateText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  pageButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  pageInfo: { ...typography.caption, color: colors.textSecondary },
  pageText: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  disabledButton: { opacity: 0.55 },
  modalLayer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.38)",
    padding: spacing.lg,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  modalIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: "#FEF2F2",
  },
  modalTitle: { ...typography.h2, color: colors.textHeading },
  modalText: { ...typography.body, color: colors.textSecondary },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  error: { ...typography.bodySmall, color: colors.error },
});
