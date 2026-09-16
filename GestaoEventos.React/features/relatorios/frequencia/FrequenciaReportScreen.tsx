import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Share,
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
import {
  frequenciaPeriodos,
  useFrequenciaRelatorio,
} from "./useFrequenciaRelatorio";
import { track } from '../../../services/analytics/analytics.service';

export function FrequenciaReportScreen() {
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const state = useFrequenciaRelatorio();
  const data = state.query.data;
  const sorted = useMemo(
    () => [...(data?.itens ?? [])].sort((a, b) => a.nome.localeCompare(b.nome)),
    [data?.itens],
  );
  const exportCsv = async () => {
    if (!sorted.length) return;
    const header = ['Pessoa', 'Grupo', 'Presencas', 'Faltas', 'Eventos', 'Percentual'];
    const rows = sorted.map((item) => [item.nome, item.grupoNome, item.presencas, item.faltas, item.totalEventos, item.percentual.toFixed(1)]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\n');
    track('simulation', 'relatorio:frequencia_exportar_csv_submit');
    if (typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
      link.download = `relatorio-frequencia-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      track('confirmation', 'relatorio:frequencia_exportar_csv_sucesso');
      return;
    }
    await Share.share({ title: 'Relatorio de frequencia', message: csv });
    track('confirmation', 'relatorio:frequencia_exportar_csv_sucesso');
  };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, compact && styles.compact]}
      >
        <View style={styles.pageHeader}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Relatorio de Frequencia</Text>
            <Text style={styles.subtitle}>
              Acompanhe presencas e faltas da estrutura ativa.
            </Text>
            <Text style={styles.scopeHint}>
              Use os filtros para gerar a leitura consolidada dos participantes.
            </Text>
          </View>
          <View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Exportar relatorio de frequencia" style={styles.exportButton} disabled={!sorted.length} onPress={() => void exportCsv()}><Ionicons name="download-outline" size={18} color={colors.brandBlue} /><Text style={styles.exportText}>Exportar CSV</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Atualizar relatorio de frequencia" style={styles.refresh} onPress={state.refetch}><Ionicons name="refresh-outline" size={20} color={colors.brandBlue} /></Pressable></View>
        </View>
        <Filters state={state} compact={compact} />
        {state.query.isLoading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.brandBlue} />
            <Text style={styles.body}>Gerando relatorio...</Text>
          </View>
        ) : null}
        {state.query.isError ? (
          <State
            title="Falha ao gerar relatorio"
            message={state.errorMessage ?? "Tente novamente em instantes."}
            onRetry={state.refetch}
          />
        ) : null}
        {!state.query.isLoading && !state.query.isError && data ? (
          <>
            <Summary data={data.resumo} />
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.titleRow}>
                  <Ionicons
                    name="people-outline"
                    size={19}
                    color={colors.brandBlue}
                  />
                  <Text style={styles.sectionTitle}>Participantes</Text>
                </View>
                <Text style={styles.meta}>{sorted.length} registro(s)</Text>
              </View>
              {sorted.length === 0 ? (
                <Text style={styles.empty}>
                  Nenhum participante encontrado para os filtros aplicados.
                </Text>
              ) : (
                <View>
                  {sorted.map((item) => (
                    <View
                      key={`${item.tipo}:${item.participanteId}`}
                      style={styles.item}
                    >
                      <View style={styles.itemTop}>
                        <Text style={styles.itemName}>{item.nome}</Text>
                        <Text
                          style={[
                            styles.percent,
                            item.percentual < 60 && styles.errorText,
                          ]}
                        >
                          {item.percentual.toFixed(1)}%
                        </Text>
                      </View>
                      <Text style={styles.body}>{item.grupoNome}</Text>
                      <Text style={styles.meta}>
                        {item.presencas} presenca(s) · {item.faltas} falta(s) ·{" "}
                        {item.totalEventos} evento(s)
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
        <Text style={styles.note}>
          Exportacao, agendamento e compartilhamento nao foram exibidos porque
          nao existe contrato backend confirmado para esta fatia.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Filters({
  state,
  compact,
}: {
  state: ReturnType<typeof useFrequenciaRelatorio>;
  compact: boolean;
}) {
  return (
    <View style={styles.filters}>
      <Text style={styles.filterLabel}>Periodo</Text>
      <View style={styles.options}>
        {frequenciaPeriodos.map((item) => (
          <Option
            key={item}
            label={item === 365 ? "Este ano" : `Ultimos ${item} dias`}
            active={state.periodo === item}
            onPress={() => state.applyPeriodo(item)}
          />
        ))}
      </View>
      <Text style={styles.filterLabel}>Grupo</Text>
      <ScrollView
        horizontal={!compact}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.options}
      >
        <Option
          label="Toda estrutura"
          active={state.grupoId === null}
          onPress={() => state.applyGrupo(null)}
        />
        {state.groups.map((group) => (
          <Option
            key={group.id}
            label={group.nome}
            active={state.grupoId === group.id}
            onPress={() => state.applyGrupo(group.id)}
          />
        ))}
      </ScrollView>
      <Text style={styles.filterLabel}>Pessoa</Text>
      <TextInput
        accessibilityLabel="Buscar pessoa no relatorio"
        value={state.busca}
        onChangeText={state.applyBusca}
        onSubmitEditing={() => state.applyBusca(state.busca)}
        placeholder="Nome da pessoa"
        style={styles.input}
      />
    </View>
  );
}
function Option({
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
      style={[styles.option, active && styles.optionActive]}
      onPress={onPress}
    >
      <Text style={[styles.optionText, active && styles.optionTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}
function Summary({
  data,
}: {
  data: {
    percentualPresenca: number;
    totalPresencas: number;
    totalAusencias: number;
    totalEventos: number;
    totalParticipantes: number;
  };
}) {
  return (
    <View style={styles.summary}>
      {[
        ["Presenca media", `${data.percentualPresenca.toFixed(1)}%`],
        ["Presencas", String(data.totalPresencas)],
        ["Faltas", String(data.totalAusencias)],
        ["Eventos", String(data.totalEventos)],
        ["Participantes", String(data.totalParticipantes)],
      ].map(([label, value]) => (
        <View key={label} style={styles.metric}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={styles.metricValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}
function State({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.state}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        style={styles.action}
        onPress={onRetry}
      >
        <Text style={styles.actionText}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}
function csvCell(value: string | number) { return `"${String(value).replace(/"/g, '""')}"`; }
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  content: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
    padding: spacing.lg,
    gap: spacing.lg,
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  exportButton: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing.xs, borderWidth: 1, borderColor: colors.brandBlue, borderRadius: radius.sm, paddingHorizontal: spacing.sm },
  exportText: { ...typography.caption, color: colors.brandBlue, fontWeight: "700" },
  headerText: { flex: 1, gap: spacing.xs },
  scopeHint: { ...typography.caption, color: colors.textMuted },
  title: { ...typography.h1, color: colors.textHeading },
  subtitle: { ...typography.body, color: colors.textSecondary },
  refresh: {
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
  filterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  option: {
    minHeight: 40,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  optionActive: { borderColor: colors.brandBlue, backgroundColor: "#EEF5FF" },
  optionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  optionTextActive: { color: colors.brandBlue },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    color: colors.textBody,
  },
  summary: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  metric: {
    flex: 1,
    minWidth: 150,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  metricValue: { ...typography.h2, color: colors.textHeading },
  section: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textHeading },
  meta: { ...typography.caption, color: colors.textMuted },
  item: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingVertical: spacing.sm,
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  itemName: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: "700",
  },
  percent: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: "700",
  },
  errorText: { color: colors.error },
  body: { ...typography.bodySmall, color: colors.textSecondary },
  empty: { ...typography.bodySmall, color: colors.textMuted },
  note: { ...typography.caption, color: colors.textMuted },
  state: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xl,
  },
  action: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: "700",
  },
});
