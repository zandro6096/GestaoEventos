import { Ionicons } from "@expo/vector-icons";
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
import { useAuditoriaAdmin } from "./useAuditoriaAdmin";

const entidades = [
  { value: "", label: "Todas as entidades" },
  { value: "Evento", label: "Evento" },
  { value: "Grupo", label: "Grupo" },
  { value: "Usuario", label: "Usuario" },
  { value: "Papel", label: "Papel" },
  { value: "Participacao", label: "Participacao" },
  { value: "Estrutura", label: "Estrutura" },
];
const acoes = [
  { value: "", label: "Todas as acoes" },
  { value: "CREATE", label: "Criar" },
  { value: "UPDATE", label: "Atualizar" },
  { value: "DELETE", label: "Excluir" },
];

export function AuditoriaAdminScreen() {
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const state = useAuditoriaAdmin();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, compact && styles.compact]}
      >
        <View style={styles.pageHeader}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Auditoria</Text>
            <Text style={styles.subtitle}>
              Historico de alteracoes do sistema no contexto permitido.
            </Text>
            <Text style={styles.scopeHint}>
              Consulte as operacoes da estrutura ativa sem alterar os registros.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atualizar auditoria"
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
        <View style={styles.filters}>
          <Text style={styles.label}>Entidade</Text>
          <View style={styles.options}>
            {entidades.map((item) => (
              <Filter
                key={item.value || "all-entity"}
                label={item.label}
                active={state.filters.entidade === item.value}
                onPress={() =>
                  state.setFilters({ ...state.filters, entidade: item.value })
                }
              />
            ))}
          </View>
          <Text style={styles.label}>Acao</Text>
          <View style={styles.options}>
            {acoes.map((item) => (
              <Filter
                key={item.value || "all-action"}
                label={item.label}
                active={state.filters.acao === item.value}
                onPress={() =>
                  state.setFilters({ ...state.filters, acao: item.value })
                }
              />
            ))}
          </View>
          <View style={styles.dateRow}>
            <TextInput
              accessibilityLabel="Data inicial"
              placeholder="Data inicial"
              value={state.filters.dataInicio}
              onChangeText={(value) =>
                state.setFilters({ ...state.filters, dataInicio: value })
              }
              style={[styles.input, styles.dateInput]}
            />
            <TextInput
              accessibilityLabel="Data final"
              placeholder="Data final"
              value={state.filters.dataFim}
              onChangeText={(value) =>
                state.setFilters({ ...state.filters, dataFim: value })
              }
              style={[styles.input, styles.dateInput]}
            />
          </View>
          <View style={styles.filterActions}>
            <Pressable
              accessibilityRole="button"
              style={styles.primary}
              onPress={state.applyFilters}
            >
              <Ionicons
                name="search-outline"
                size={17}
                color={colors.surfacePrimary}
              />
              <Text style={styles.primaryText}>Filtrar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.secondary}
              onPress={state.clearFilters}
            >
              <Text style={styles.secondaryText}>Limpar</Text>
            </Pressable>
          </View>
        </View>
        {!state.allowed ? (
          <State message="Acesso negado para consultar auditoria." />
        ) : null}
        {state.query.isLoading ? (
          <State message="Carregando auditoria..." loading />
        ) : null}
        {state.errorMessage ? (
          <View style={styles.errorBox}>
            <Text accessibilityRole="alert" style={styles.error}>
              {state.errorMessage}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void state.query.refetch()}
            >
              <Text style={styles.link}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}
        {state.allowed &&
        !state.query.isLoading &&
        !state.query.isError &&
        state.records.length === 0 ? (
          <State message="Nenhum registro de auditoria encontrado." />
        ) : null}
        <View style={styles.list}>
          {state.records.map((item) => (
            <AuditRow
              key={item.id}
              item={item}
              onOpen={() => state.openDetails(item)}
            />
          ))}
        </View>
        {state.query.isSuccess && state.query.data ? (
          <View style={styles.pagination}>
            <Pressable
              accessibilityRole="button"
              disabled={!state.hasPrevious}
              onPress={state.previousPage}
              style={styles.pageButton}
            >
              <Ionicons
                name="chevron-back"
                size={17}
                color={
                  state.hasPrevious ? colors.brandBlue : colors.textDisabled
                }
              />
              <Text style={styles.pageText}>Anterior</Text>
            </Pressable>
            <Text style={styles.pageMeta}>
              {state.query.data.total
                ? `${state.query.data.skip + 1}-${Math.min(state.query.data.skip + state.query.data.take, state.query.data.total)} de ${state.query.data.total}`
                : "0 registros"}
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={!state.hasNext}
              onPress={state.nextPage}
              style={styles.pageButton}
            >
              <Text style={styles.pageText}>Proxima</Text>
              <Ionicons
                name="chevron-forward"
                size={17}
                color={state.hasNext ? colors.brandBlue : colors.textDisabled}
              />
            </Pressable>
          </View>
        ) : null}
        {state.selected ? (
          <AuditDetails
            item={state.selected}
            onClose={() => state.setSelected(null)}
          />
        ) : null}
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
function AuditRow({
  item,
  onOpen,
}: {
  item: {
    nomeUsuario: string;
    acao: string;
    entidade: string;
    descricao: string;
    criadoEm: string;
  };
  onOpen: () => void;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.itemText}>
        <Text style={styles.itemTitle}>{item.descricao || item.entidade}</Text>
        <Text style={styles.meta}>
          {item.nomeUsuario} · {actionLabel(item.acao)} · {item.entidade}
        </Text>
        <Text style={styles.meta}>{formatDate(item.criadoEm)}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver detalhes da auditoria"
        style={styles.iconButton}
        onPress={onOpen}
      >
        <Ionicons name="eye-outline" size={19} color={colors.brandBlue} />
      </Pressable>
    </View>
  );
}
function AuditDetails({
  item,
  onClose,
}: {
  item: {
    nomeUsuario: string;
    acao: string;
    entidade: string;
    entidadeId: number;
    descricao: string;
    criadoEm: string;
    dadosAntigos?: string | null;
    dadosNovos?: string | null;
  };
  onClose: () => void;
}) {
  return (
    <View style={styles.details}>
      <View style={styles.detailsHeader}>
        <Text style={styles.sectionTitle}>Detalhes da alteracao</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar detalhes da auditoria"
          onPress={onClose}
        >
          <Ionicons name="close-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.detailLabel}>Usuario</Text>
      <Text style={styles.detailValue}>{item.nomeUsuario}</Text>
      <Text style={styles.detailLabel}>Acao e entidade</Text>
      <Text style={styles.detailValue}>
        {actionLabel(item.acao)} · {item.entidade} ({item.entidadeId})
      </Text>
      <Text style={styles.detailLabel}>Data</Text>
      <Text style={styles.detailValue}>{formatDate(item.criadoEm)}</Text>
      <Text style={styles.detailLabel}>Descricao</Text>
      <Text style={styles.detailValue}>{item.descricao}</Text>
      {item.dadosAntigos ? (
        <DataBlock title="Dados anteriores" value={item.dadosAntigos} />
      ) : null}
      {item.dadosNovos ? (
        <DataBlock title="Dados novos" value={item.dadosNovos} />
      ) : null}
    </View>
  );
}
function DataBlock({ title, value }: { title: string; value: string }) {
  let display = value;
  try {
    display = JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    /* backend may return plain text */
  }
  return (
    <View style={styles.dataBlock}>
      <Text style={styles.detailLabel}>{title}</Text>
      <Text style={styles.dataText}>{display}</Text>
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
        <Ionicons
          name="document-text-outline"
          size={25}
          color={colors.textMuted}
        />
      )}
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}
function actionLabel(value: string) {
  const normalized = value.toUpperCase();
  return normalized === "CREATE"
    ? "Criado"
    : normalized === "UPDATE"
      ? "Atualizado"
      : normalized === "DELETE"
        ? "Excluido"
        : value;
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
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
  scopeHint: { ...typography.caption, color: colors.textMuted },
  title: { ...typography.h1, color: colors.textHeading },
  subtitle: { ...typography.body, color: colors.textSecondary },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  filters: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  filter: {
    minHeight: 36,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  filterActive: { borderColor: colors.brandBlue, backgroundColor: "#EEF5FF" },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.brandBlue, fontWeight: "700" },
  dateRow: { flexDirection: "row", gap: spacing.sm },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    color: colors.textBody,
  },
  dateInput: { flex: 1 },
  filterActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  primary: {
    minHeight: 42,
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
  secondary: {
    minHeight: 42,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryText: {
    ...typography.bodySmall,
    color: colors.textBody,
    fontWeight: "700",
  },
  list: { gap: spacing.sm },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  itemText: { flex: 1, minWidth: 0, gap: spacing.xs },
  itemTitle: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: "700",
  },
  meta: { ...typography.caption, color: colors.textSecondary },
  errorBox: {
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    backgroundColor: "#FEF2F2",
    padding: spacing.md,
  },
  error: { ...typography.bodySmall, color: colors.error },
  link: { ...typography.caption, color: colors.brandBlue, fontWeight: "700" },
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
  pageText: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  pageMeta: { ...typography.caption, color: colors.textSecondary },
  details: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h3, color: colors.textHeading },
  detailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },
  detailValue: { ...typography.bodySmall, color: colors.textBody },
  dataBlock: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.sm,
  },
  dataText: {
    ...typography.caption,
    color: colors.textBody,
    fontFamily: "monospace",
  },
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
