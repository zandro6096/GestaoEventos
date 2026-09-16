import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../shared/design/tokens";
import { layoutMetrics } from "../../../shared/theme";
import { useContextStore } from "../../../stores/context.store";
import {
  useAdminMembros,
  type AdminMember,
  type MemberStatusFilter,
} from "./useAdminMembros";

const filters: { value: MemberStatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativos" },
  { value: "inativo", label: "Inativos" },
  { value: "pendente", label: "Convites pendentes" },
];

export function MembrosAdminScreen() {
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const state = useAdminMembros();
  const estruturaNome = useContextStore((store) => store.estruturaNome);
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
              <Text style={styles.breadcrumbText}>Dashboard</Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={colors.textDisabled}
              />
              <Text style={styles.breadcrumbText}>Administracao</Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={colors.textDisabled}
              />
              <Text style={styles.breadcrumbCurrent}>Membros</Text>
            </View>
            <Text style={styles.title}>Usuarios da Estrutura</Text>
            <Text style={styles.subtitle}>
              Gerencie vinculos, papeis e status dos usuarios da estrutura{" "}
              <Text style={styles.strong}>{estruturaNome ?? "ativa"}</Text>.
            </Text>
            <Text style={styles.scopeHint}>
              As alteracoes respeitam o contexto e as permissoes da estrutura
              ativa.
            </Text>
          </View>
          <View style={styles.headerAside}>
            <View style={styles.totalPill}>
              <Text style={styles.totalValue}>{state.members.length}</Text>
              <Text style={styles.totalLabel}>usuarios</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Atualizar membros"
              style={styles.iconButton}
              onPress={() => void state.query.refetch()}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={colors.brandBlue}
              />
            </Pressable>
          </View>
        </View>
        <View style={styles.filters}>
          <Text style={styles.filtersTitle}>Filtrar usuarios</Text>
          <TextInput
            accessibilityLabel="Buscar membro"
            placeholder="Buscar por nome ou email"
            value={state.busca}
            onChangeText={state.applyBusca}
            style={styles.input}
          />
          <ScrollView
            horizontal={!compact}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.options}
          >
            {filters.map((filter) => (
              <Filter
                key={filter.value}
                label={filter.label}
                active={state.status === filter.value}
                onPress={() => state.applyStatus(filter.value)}
              />
            ))}
          </ScrollView>
        </View>
        {state.query.isLoading ? (
          <State message="Carregando membros..." loading />
        ) : null}
        {state.query.isError ? (
          <State message="Nao foi possivel carregar os membros." />
        ) : null}
        {state.errorMessage ? (
          <View style={styles.errorBox}>
            <Text accessibilityRole="alert" style={styles.error}>
              {state.errorMessage}
            </Text>
            <Pressable accessibilityRole="button" onPress={state.clearError}>
              <Text style={styles.link}>Fechar</Text>
            </Pressable>
          </View>
        ) : null}
        {!state.query.isLoading &&
        !state.query.isError &&
        state.members.length === 0 ? (
          <State message="Nenhum membro encontrado para os filtros atuais." />
        ) : null}
        <View style={styles.list}>
          {state.members.map((member) => (
            <MemberRow
              key={`${member.tipo}:${member.id}`}
              member={member}
              onAction={state.execute}
              disabled={state.isMutating}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Filter({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.filter, active && styles.filterActive]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}
function MemberRow({
  member,
  onAction,
  disabled,
}: {
  member: AdminMember;
  onAction: ReturnType<typeof useAdminMembros>["execute"];
  disabled: boolean;
}) {
  const [funcao, setFuncao] = useState(member.funcao ?? "");
  return (
    <View style={styles.member}>
      <View style={styles.memberTop}>
        <View style={styles.memberIdentity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {member.nome.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberText}>
            <Text style={styles.memberName}>{member.nome}</Text>
            <Text style={styles.meta}>
              {member.email ?? "Email nao informado"}
            </Text>
            <Text style={styles.meta}>
              {member.tipo === "usuario_virtual"
                ? `Convite ${member.status}`
                : `${member.papel ?? "Sem papel"} · ${member.ativo ? "Ativo" : "Inativo"}`}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.status,
            member.ativo ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <Text style={styles.statusText}>
            {member.ativo
              ? member.status === "pendente"
                ? "Pendente"
                : "Ativo"
              : "Inativo"}
          </Text>
        </View>
      </View>
      {member.tipo === "usuario" && member.ativo ? (
        <>
          <View style={styles.actions}>
            <Pressable
              disabled={disabled}
              accessibilityRole="button"
              onPress={() =>
                onAction({
                  action: "papel",
                  member,
                  value: member.papel === "Dono" ? "Participante" : "Dono",
                })
              }
              style={styles.action}
            >
              <Text style={styles.actionText}>
                {member.papel === "Dono"
                  ? "Tornar participante"
                  : "Tornar dono"}
              </Text>
            </Pressable>
            <Pressable
              disabled={disabled}
              accessibilityRole="button"
              onPress={() => onAction({ action: "remover", member })}
              style={styles.action}
            >
              <Text style={styles.dangerText}>Desvincular</Text>
            </Pressable>
          </View>
          <View style={styles.functionRow}>
            <TextInput
              accessibilityLabel={`Funcao de ${member.nome}`}
              value={funcao}
              onChangeText={setFuncao}
              placeholder="Funcao"
              style={styles.functionInput}
            />
            <Pressable
              disabled={disabled}
              accessibilityRole="button"
              onPress={() =>
                onAction({ action: "funcao", member, value: funcao })
              }
              style={styles.action}
            >
              <Text style={styles.actionText}>Salvar funcao</Text>
            </Pressable>
          </View>
        </>
      ) : null}
      {!member.ativo ? (
        <Pressable
          disabled={disabled}
          accessibilityRole="button"
          onPress={() => onAction({ action: "reativar", member })}
          style={styles.action}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.brandBlue} />
          <Text style={styles.actionText}>Reativar</Text>
        </Pressable>
      ) : null}
      {member.tipo === "usuario_virtual" &&
      member.ativo &&
      member.status.toLowerCase() === "pendente" ? (
        <Pressable
          disabled={disabled}
          accessibilityRole="button"
          onPress={() => onAction({ action: "convite", member })}
          style={styles.action}
        >
          <Ionicons name="mail-outline" size={16} color={colors.brandBlue} />
          <Text style={styles.actionText}>Reenviar convite</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function State({
  message,
  loading = false,
}: {
  message: string;
  loading?: boolean;
}) {
  return (
    <View style={styles.state}>
      {loading ? (
        <ActivityIndicator color={colors.brandBlue} />
      ) : (
        <Ionicons name="people-outline" size={24} color={colors.textMuted} />
      )}
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  content: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    gap: spacing.lg,
    padding: spacing.lg,
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
  strong: { fontWeight: "700", color: colors.textBody },
  scopeHint: { ...typography.caption, color: colors.textMuted },
  headerAside: { alignItems: "flex-end", gap: spacing.sm },
  totalPill: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: radius.full,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: spacing.sm,
  },
  totalValue: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  totalLabel: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  filtersTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: "700",
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
  },
  filters: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    color: colors.textBody,
  },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  filter: {
    minHeight: 38,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  filterActive: { borderColor: colors.brandBlue, backgroundColor: "#EEF5FF" },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  filterTextActive: { color: colors.brandBlue },
  list: { gap: spacing.sm },
  member: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  memberTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  memberIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: "#EEF5FF",
  },
  avatarText: {
    ...typography.body,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  memberText: { flex: 1, minWidth: 0, gap: 2 },
  memberName: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: "700",
  },
  meta: { ...typography.caption, color: colors.textSecondary },
  status: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusActive: { backgroundColor: "#ECFDF5" },
  statusInactive: { backgroundColor: "#FEF2F2" },
  statusText: {
    ...typography.caption,
    color: colors.textBody,
    fontWeight: "700",
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  functionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  functionInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    color: colors.textBody,
  },
  action: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  dangerText: { ...typography.caption, color: colors.error, fontWeight: "700" },
  errorBox: {
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    backgroundColor: "#FEF2F2",
    padding: spacing.md,
  },
  error: { ...typography.bodySmall, color: colors.error },
  link: { ...typography.caption, color: colors.brandBlue, fontWeight: "700" },
  state: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xl,
  },
  stateText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },
});
