import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { normalizeApiError } from "../../../services/api/api-error";
import { adminApi, type PapelAdminDto } from "../../../services/api/admin-api";
import {
  eventoObjetivosApi,
  type EventoObjetivo,
  type EventoObjetivoPayload,
  type EventoObjetivoTipo,
  type EventoObjetivoEscopo,
  type EventoObjetivoPreview,
} from "../../../services/api/evento-objetivos-api";
import {
  eventoTemplatesApi,
  type EventoTemplate,
} from "../../../services/api/evento-templates-api";
import { gruposApi, type GrupoDto } from "../../../services/api/grupos-api";
import { configuracoesApi } from "../../../services/api/configuracoes-api";
import { track } from "../../../services/analytics/analytics.service";
import { assertOnlineForMutation } from "../../../services/offline/mutation-guard";
import {
  can,
  isOwnerContext,
} from "../../../services/permissions/permission.facade";
import { useContextStore } from "../../../stores/context.store";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../shared/design/tokens";
import { layoutMetrics } from "../../../shared/theme";

const tipos: { value: EventoObjetivoTipo; label: string; hint: string }[] = [
  {
    value: "presenca_valida",
    label: "Presenca valida",
    hint: "Conclui quando houver pelo menos uma presenca valida no prazo.",
  },
  {
    value: "quantidade_presencas",
    label: "Quantidade de presencas",
    hint: "Exige uma quantidade minima de presencas validas.",
  },
  {
    value: "papel_esperado",
    label: "Papel esperado",
    hint: "Avalia se a quantidade de pessoas com o papel foi atingida.",
  },
  {
    value: "conversao_papel",
    label: "Conversao de papel",
    hint: "Avalia a chegada de participantes a um papel dentro do prazo.",
  },
];
const escopos: {
  value: EventoObjetivoEscopo;
  label: string;
  hint: string;
}[] = [
  {
    value: "individual",
    label: "Individual (por pessoa)",
    hint: "Cada participante conclui separadamente.",
  },
  {
    value: "coletivo",
    label: "Grupo (agregado)",
    hint: "Avalia o grupo como um todo.",
  },
  {
    value: "evento",
    label: "Evento (papel ativo)",
    hint: "Avalia participantes ativos de cada evento concreto.",
  },
];
const startOptions = [
  { value: "vinculo_template", label: "Entrada no ciclo/template" },
  {
    value: "primeira_participacao_valida",
    label: "Primeira participacao valida",
  },
];
const unitOptions = [
  { value: "dias", label: "dias" },
  { value: "semanas", label: "semanas" },
  { value: "meses", label: "meses" },
];

type Draft = {
  nome: string;
  descricao: string;
  eventoTemplateId: number | null;
  tipo: EventoObjetivoTipo;
  escopo: EventoObjetivoEscopo;
  dataInicioReferencia: string;
  prazoQuantidade: string;
  prazoUnidade: string;
  metaQuantidade: string;
  papelAlvoId: number | null;
  papelOrigemId: number | null;
  ativo: boolean;
  gruposIds: number[];
  tiposGrupoIds: number[];
};
const emptyDraft = (templateId: number | null = null): Draft => ({
  nome: "",
  descricao: "",
  eventoTemplateId: templateId,
  tipo: "presenca_valida",
  escopo: "individual",
  dataInicioReferencia: "vinculo_template",
  prazoQuantidade: "2",
  prazoUnidade: "meses",
  metaQuantidade: "1",
  papelAlvoId: null,
  papelOrigemId: null,
  ativo: true,
  gruposIds: [],
  tiposGrupoIds: [],
});

export function EventoObjetivosScreen() {
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const estruturaId = useContextStore((state) => state.estruturaId);
  const estruturaNome = useContextStore((state) => state.estruturaNome);
  const client = useQueryClient();
  const [status, setStatus] = useState<"ativos" | "inativos" | "todos">(
    "ativos",
  );
  const [templateFilter, setTemplateFilter] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventoObjetivo | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [picker, setPicker] = useState<
    | "template"
    | "tipo"
    | "escopo"
    | "inicio"
    | "unidade"
    | "papelAlvo"
    | "papelOrigem"
    | null
  >(null);
  const allowed = Boolean(
    estruturaId && can("criar", "eventos", { estruturaId }) && isOwnerContext(),
  );
  const baseQuery = useQuery({
    queryKey: ["evento-objetivos-base", estruturaId, status, templateFilter],
    queryFn: async () => {
      const [objetivos, templates, grupos, tiposGrupo, papeis] =
        await Promise.all([
          eventoObjetivosApi.list(estruturaId!, {
            templateId: templateFilter,
            ativo: status === "todos" ? null : status === "ativos",
          }),
          eventoTemplatesApi.list(estruturaId!),
          gruposApi.list(estruturaId!, 0, 200),
          configuracoesApi.listTipos("grupo", estruturaId!, true),
          adminApi.listPapeis(estruturaId!),
        ]);
      return {
        objetivos,
        templates,
        grupos: grupos.data,
        tiposGrupo: tiposGrupo.map((item) => ({
          id: item.id,
          nome: item.nome,
        })),
        papeis,
      };
    },
    enabled: allowed,
    retry: false,
  });
  const save = useMutation({
    mutationFn: async (payload: EventoObjetivoPayload) => {
      assertOnlineForMutation(editing ? "Editar objetivo" : "Criar objetivo");
      return editing
        ? eventoObjetivosApi.update(editing.id, payload)
        : eventoObjetivosApi.create(payload);
    },
    onSuccess: () => {
      setFormOpen(false);
      setEditing(null);
      track(
        "confirmation",
        `evento_objetivo:${editing ? "editar" : "criar"}_success`,
      );
      void client.invalidateQueries({
        queryKey: ["evento-objetivos-base", estruturaId],
      });
    },
  });
  const statusMutation = useMutation({
    mutationFn: async (item: EventoObjetivo) => {
      assertOnlineForMutation(
        item.ativo ? "Pausar objetivo" : "Ativar objetivo",
      );
      return eventoObjetivosApi.updateStatus(item.id, !item.ativo);
    },
    onSuccess: () => {
      track("confirmation", "evento_objetivo:alterar_status_success");
      void client.invalidateQueries({
        queryKey: ["evento-objetivos-base", estruturaId],
      });
    },
  });
  const preview = useMutation({
    mutationFn: () => {
      if (!estruturaId || !draft.eventoTemplateId)
        throw new Error("Escolha um modelo de evento para estimar o alcance.");
      return eventoObjetivosApi.preview({
        estruturaId,
        eventoTemplateId: draft.eventoTemplateId,
        gruposIds: draft.gruposIds,
        tiposGrupoIds: draft.tiposGrupoIds,
      });
    },
  });
  const data = baseQuery.data;
  const metrics = useMemo(
    () => ({
      total: data?.objetivos.length ?? 0,
      active: data?.objetivos.filter((item) => item.ativo).length ?? 0,
      roles:
        data?.objetivos.filter((item) => item.tipo === "papel_esperado")
          .length ?? 0,
      conversions:
        data?.objetivos.filter((item) => item.tipo === "conversao_papel")
          .length ?? 0,
    }),
    [data?.objetivos],
  );

  function openNew(preset = false) {
    setEditing(null);
    setDraft({
      ...emptyDraft(templateFilter),
      ...(preset ? { tipo: "papel_esperado", escopo: "evento" } : {}),
    });
    setFormOpen(true);
    track(
      "entrance",
      `evento_objetivo:${preset ? "novo_papel_evento" : "novo"}`,
    );
  }
  function openEdit(item: EventoObjetivo) {
    setEditing(item);
    setDraft({
      nome: item.nome,
      descricao: item.descricao ?? "",
      eventoTemplateId: item.eventoTemplateId,
      tipo: normalizeTipo(item.tipo),
      escopo: normalizeEscopo(item.escopo),
      dataInicioReferencia: item.dataInicioReferencia,
      prazoQuantidade: String(item.prazoQuantidade),
      prazoUnidade: item.prazoUnidade,
      metaQuantidade: String(item.metaQuantidade),
      papelAlvoId: item.papelAlvoId,
      papelOrigemId: item.papelOrigemId,
      ativo: item.ativo,
      gruposIds: item.gruposIds ?? [],
      tiposGrupoIds: item.tiposGrupoIds ?? [],
    });
    setFormOpen(true);
    track("entrance", "evento_objetivo:editar");
  }
  function submit() {
    if (
      !estruturaId ||
      !draft.nome.trim() ||
      !draft.eventoTemplateId ||
      Number(draft.prazoQuantidade) < 1 ||
      Number(draft.metaQuantidade) < 1
    )
      return;
    if (
      draft.escopo === "evento" &&
      draft.tipo !== "papel_esperado" &&
      draft.tipo !== "conversao_papel"
    )
      return;
    if (
      (draft.tipo === "papel_esperado" || draft.tipo === "conversao_papel") &&
      !draft.papelAlvoId
    )
      return;
    track(
      "simulation",
      `evento_objetivo:${editing ? "editar" : "criar"}_submit`,
    );
    save.mutate({
      nome: draft.nome.trim(),
      descricao: draft.descricao.trim() || null,
      estruturaId,
      eventoTemplateId: draft.eventoTemplateId,
      tipo: draft.tipo,
      escopo: draft.escopo,
      dataInicioReferencia: draft.dataInicioReferencia,
      prazoQuantidade: Number(draft.prazoQuantidade),
      prazoUnidade: draft.prazoUnidade,
      metaQuantidade: Number(draft.metaQuantidade),
      papelAlvoId: draft.papelAlvoId,
      papelAlvoNome: findRole(data?.papeis, draft.papelAlvoId)?.nome ?? null,
      papelOrigemId: draft.papelOrigemId,
      papelOrigemNome:
        findRole(data?.papeis, draft.papelOrigemId)?.nome ?? null,
      ativo: draft.ativo,
      gruposIds: draft.gruposIds,
      tiposGrupoIds: draft.tiposGrupoIds,
    });
  }
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, compact && styles.compact]}
      >
        <View style={styles.header}>
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
              <Text style={styles.breadcrumbCurrent}>Objetivos</Text>
            </View>
            <Text style={styles.eyebrow}>Saude por template</Text>
            <Text style={styles.title}>Objetivos</Text>
            <Text style={styles.subtitle}>
              Configure metas esperadas por modelo de evento para acompanhar
              presenca, evolucao e papeis.
            </Text>
            <Text style={styles.scopeHint}>
              Estrutura ativa:{" "}
              <Text style={styles.strong}>
                {estruturaNome ?? "Nao selecionada"}
              </Text>
              .
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Papel no evento"
              style={styles.secondaryButton}
              onPress={() => openNew(true)}
            >
              <Ionicons
                name="people-outline"
                size={17}
                color={colors.brandBlue}
              />
              <Text style={styles.secondaryText}>Papel no evento</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Novo objetivo"
              style={styles.primaryButton}
              onPress={() => openNew()}
            >
              <Ionicons name="add" size={18} color={colors.surfacePrimary} />
              <Text style={styles.primaryText}>Novo objetivo</Text>
            </Pressable>
          </View>
        </View>
        {!allowed ? (
          <State message="Voce nao tem permissao para configurar objetivos neste contexto." />
        ) : null}
        {allowed && !baseQuery.isLoading && !baseQuery.isError ? (
          <View style={styles.metrics}>
            <Metric label="Total filtrado" value={metrics.total} tone="blue" />
            <Metric label="Ativos" value={metrics.active} tone="green" />
            <Metric label="Papel esperado" value={metrics.roles} tone="amber" />
            <Metric
              label="Conversoes"
              value={metrics.conversions}
              tone="purple"
            />
          </View>
        ) : null}
        {allowed ? (
          <View style={styles.filters}>
            <View style={styles.filterBlock}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.options}>
                {(["ativos", "inativos", "todos"] as const).map((value) => (
                  <Choice
                    key={value}
                    label={
                      value === "ativos"
                        ? "Ativos"
                        : value === "inativos"
                          ? "Inativos"
                          : "Todos"
                    }
                    active={status === value}
                    onPress={() => setStatus(value)}
                  />
                ))}
              </View>
            </View>
            <View style={styles.filterBlock}>
              <Text style={styles.label}>Modelo</Text>
              <SelectButton
                label={
                  data?.templates.find((item) => item.id === templateFilter)
                    ?.titulo ?? "Todos os modelos"
                }
                onPress={() => setPicker("template")}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              style={styles.refresh}
              onPress={() => void baseQuery.refetch()}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={colors.brandBlue}
              />
              <Text style={styles.secondaryText}>Atualizar</Text>
            </Pressable>
          </View>
        ) : null}
        {baseQuery.isLoading ? (
          <State message="Carregando objetivos..." loading />
        ) : null}
        {baseQuery.isError ? (
          <State
            message={
              normalizeApiError(
                baseQuery.error,
                "Nao foi possivel carregar os objetivos.",
              ).message
            }
            onRetry={() => void baseQuery.refetch()}
          />
        ) : null}
        {save.isError || statusMutation.isError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {
              normalizeApiError(
                save.error ?? statusMutation.error,
                "Nao foi possivel salvar o objetivo.",
              ).message
            }
          </Text>
        ) : null}
        {allowed &&
        !baseQuery.isLoading &&
        !baseQuery.isError &&
        !formOpen &&
        (data?.objetivos.length ?? 0) === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="locate-outline"
              size={30}
              color={colors.brandBlue}
            />
            <Text style={styles.emptyTitle}>Nenhum objetivo encontrado</Text>
            <Text style={styles.emptyText}>
              Crie objetivos para medir evolucao alem da presenca simples.
            </Text>
            <View style={styles.emptyActions}>
              <Pressable style={styles.primaryButton} onPress={() => openNew()}>
                <Ionicons name="add" size={18} color={colors.surfacePrimary} />
                <Text style={styles.primaryText}>Criar objetivo</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => openNew(true)}
              >
                <Ionicons
                  name="people-outline"
                  size={17}
                  color={colors.brandBlue}
                />
                <Text style={styles.secondaryText}>Por papel no evento</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        {allowed && !formOpen && (data?.objetivos.length ?? 0) > 0 ? (
          <View style={styles.list}>
            {data?.objetivos.map((item) => (
              <ObjectiveCard
                key={item.id}
                item={item}
                templates={data.templates}
                onEdit={() => openEdit(item)}
                onToggle={() => statusMutation.mutate(item)}
              />
            ))}
          </View>
        ) : null}
        {formOpen ? (
          <ObjectiveForm
            draft={draft}
            setDraft={setDraft}
            data={data}
            picker={picker}
            setPicker={setPicker}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onSubmit={submit}
            editing={Boolean(editing)}
            saving={save.isPending}
            preview={preview}
          />
        ) : null}
      </ScrollView>
      <PickerModal
        picker={picker}
        setPicker={setPicker}
        draft={draft}
        setDraft={setDraft}
        data={data}
        templateFilter={templateFilter}
        setTemplateFilter={setTemplateFilter}
      />
    </SafeAreaView>
  );
}

function ObjectiveCard({
  item,
  templates,
  onEdit,
  onToggle,
}: {
  item: EventoObjetivo;
  templates: EventoTemplate[];
  onEdit: () => void;
  onToggle: () => void;
}) {
  const roleText =
    item.tipo === "conversao_papel"
      ? `De ${item.papelOrigemNome ?? "qualquer papel"} para ${item.papelAlvoNome ?? "papel esperado"}`
      : item.tipo === "papel_esperado"
        ? `Papel esperado: ${item.papelAlvoNome ?? "nao informado"}`
        : null;
  return (
    <View style={[styles.objectiveCard, !item.ativo && styles.objectivePaused]}>
      <View style={styles.objectiveTop}>
        <View style={styles.objectiveIcon}>
          <Ionicons
            name={
              item.tipo.includes("papel") ? "people-outline" : "locate-outline"
            }
            size={20}
            color={colors.brandBlue}
          />
        </View>
        <View style={styles.objectiveText}>
          <Text style={styles.objectiveName}>{item.nome}</Text>
          {item.descricao ? (
            <Text style={styles.objectiveDescription}>{item.descricao}</Text>
          ) : null}
          <Text style={styles.objectiveTemplate}>
            {item.eventoTemplateTitulo ||
              templates.find(
                (template) => template.id === item.eventoTemplateId,
              )?.titulo ||
              `Modelo ${item.eventoTemplateId}`}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.ativo ? styles.activeBadge : styles.pausedBadge,
          ]}
        >
          <Text style={item.ativo ? styles.activeText : styles.pausedText}>
            {item.ativo ? "Ativo" : "Pausado"}
          </Text>
        </View>
      </View>
      <View style={styles.rule}>
        <Text style={styles.ruleTitle}>{typeLabel(item.tipo)}</Text>
        <Text style={styles.meta}>
          Meta {item.metaQuantidade} em {item.prazoQuantidade}{" "}
          {item.prazoUnidade} · {scopeLabel(item.escopo)}
        </Text>
        <Text style={styles.meta}>
          {startLabel(item.dataInicioReferencia)} · {scopeDetail(item)}
        </Text>
        {roleText ? <Text style={styles.meta}>{roleText}</Text> : null}
      </View>
      <View style={styles.cardActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${item.nome}`}
          style={styles.iconButton}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={18} color={colors.brandBlue} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            item.ativo ? `Pausar ${item.nome}` : `Ativar ${item.nome}`
          }
          style={styles.iconButton}
          onPress={onToggle}
        >
          <Ionicons
            name={item.ativo ? "pause-outline" : "play-outline"}
            size={18}
            color={colors.brandBlue}
          />
        </Pressable>
      </View>
    </View>
  );
}

function ObjectiveForm({
  draft,
  setDraft,
  data,
  picker,
  setPicker,
  onCancel,
  onSubmit,
  editing,
  saving,
  preview,
}: {
  draft: Draft;
  setDraft: (value: Draft) => void;
  data?: {
    templates: EventoTemplate[];
    grupos: GrupoDto[];
    tiposGrupo: { id: number; nome: string }[];
    papeis: PapelAdminDto[];
  };
  picker: string | null;
  setPicker: (value: any) => void;
  onCancel: () => void;
  onSubmit: () => void;
  editing: boolean;
  saving: boolean;
  preview: {
    mutate: () => void;
    isPending: boolean;
    data?: EventoObjetivoPreview;
    isError: boolean;
    error: unknown;
  };
}) {
  const update = (values: Partial<Draft>) => setDraft({ ...draft, ...values });
  const selectedTemplate =
    data?.templates.find((item) => item.id === draft.eventoTemplateId)
      ?.titulo ?? "Selecione um modelo";
  const selectedTarget =
    findRole(data?.papeis, draft.papelAlvoId)?.nome ??
    "Selecione o papel esperado";
  const selectedOrigin =
    findRole(data?.papeis, draft.papelOrigemId)?.nome ?? "Qualquer papel";
  const toggle = (
    key: "gruposIds" | "tiposGrupoIds",
    id: number,
    checked: boolean,
  ) =>
    update({
      [key]: checked
        ? [...draft[key], id]
        : draft[key].filter((value) => value !== id),
    });
  return (
    <View style={styles.editor}>
      <View style={styles.editorHeader}>
        <View>
          <Text style={styles.eyebrow}>{editing ? "Editar" : "Novo"}</Text>
          <Text style={styles.sectionTitle}>
            {editing ? "Editar objetivo" : "Novo objetivo"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar formulario"
          onPress={onCancel}
        >
          <Ionicons name="close-outline" size={22} color={colors.textMuted} />
        </Pressable>
      </View>
      <Field label="Nome">
        <TextInput
          accessibilityLabel="Nome do objetivo"
          value={draft.nome}
          onChangeText={(value) => update({ nome: value })}
          placeholder="Ex.: Presenca minima no ciclo"
          style={styles.input}
        />
      </Field>
      <Field label="Descricao">
        <TextInput
          accessibilityLabel="Descricao do objetivo"
          value={draft.descricao}
          onChangeText={(value) => update({ descricao: value })}
          placeholder="Explique o que a meta mede"
          multiline
          style={[styles.input, styles.textArea]}
        />
      </Field>
      <Field label="Modelo de evento">
        <SelectButton
          label={selectedTemplate}
          onPress={() => setPicker("template")}
        />
      </Field>
      <View style={styles.fieldset}>
        <Text style={styles.legend}>Regra</Text>
        <Field label="Tipo">
          <SelectButton
            label={typeLabel(draft.tipo)}
            onPress={() => setPicker("tipo")}
          />
          <Text style={styles.hint}>
            {tipos.find((item) => item.value === draft.tipo)?.hint}
          </Text>
        </Field>
        {draft.tipo !== "papel_esperado" || draft.escopo !== "evento" ? (
          <View style={styles.callout}>
            <View style={styles.calloutText}>
              <Text style={styles.calloutTitle}>Papel no evento</Text>
              <Text style={styles.hint}>
                Use papel esperado com unidade por evento para medir
                participantes ativos.
              </Text>
            </View>
            <Pressable
              style={styles.smallButton}
              onPress={() =>
                update({ tipo: "papel_esperado", escopo: "evento" })
              }
            >
              <Text style={styles.smallButtonText}>Usar</Text>
            </Pressable>
          </View>
        ) : null}
        <Field label="Unidade de cumprimento">
          <SelectButton
            label={scopeLabel(draft.escopo)}
            onPress={() => setPicker("escopo")}
          />
          <Text style={styles.hint}>
            {escopos.find((item) => item.value === draft.escopo)?.hint}
          </Text>
        </Field>
        {draft.tipo === "conversao_papel" ? (
          <>
            <Field label="Papel atual (de)">
              <SelectButton
                label={selectedOrigin}
                onPress={() => setPicker("papelOrigem")}
              />
            </Field>
            <Field label="Papel esperado (para)">
              <SelectButton
                label={selectedTarget}
                onPress={() => setPicker("papelAlvo")}
              />
            </Field>
          </>
        ) : null}
        {draft.tipo === "papel_esperado" ? (
          <Field
            label={
              draft.escopo === "evento"
                ? "Papel a atingir no evento"
                : "Papel esperado"
            }
          >
            <SelectButton
              label={selectedTarget}
              onPress={() => setPicker("papelAlvo")}
            />
          </Field>
        ) : null}
        <View style={styles.twoColumns}>
          <Field label="Inicio da contagem">
            <SelectButton
              label={startLabel(draft.dataInicioReferencia)}
              onPress={() => setPicker("inicio")}
            />
          </Field>
          <Field label="Prazo">
            <View style={styles.inline}>
              <TextInput
                keyboardType="numeric"
                value={draft.prazoQuantidade}
                onChangeText={(value) => update({ prazoQuantidade: value })}
                style={[styles.input, styles.numberInput]}
              />
              <SelectButton
                label={draft.prazoUnidade}
                onPress={() => setPicker("unidade")}
              />
            </View>
          </Field>
        </View>
        <Field
          label={draft.escopo === "evento" ? "Quantidade no evento" : "Meta"}
        >
          <TextInput
            keyboardType="numeric"
            value={draft.metaQuantidade}
            onChangeText={(value) => update({ metaQuantidade: value })}
            style={styles.input}
          />
          <Text style={styles.hint}>
            Quantidade minima para considerar o objetivo cumprido.
          </Text>
        </Field>
        <Toggle
          label="Objetivo ativo"
          value={draft.ativo}
          onValueChange={(value) => update({ ativo: value })}
        />
      </View>
      <View style={styles.fieldset}>
        <Text style={styles.legend}>Escopo</Text>
        <Text style={styles.scopeSummary}>
          <Text style={styles.strong}>Grupos: </Text>
          {draft.gruposIds.length
            ? `${draft.gruposIds.length} selecionado(s)`
            : "Todos atuais e futuros"}
        </Text>
        <Text style={styles.scopeSummary}>
          <Text style={styles.strong}>Tipos: </Text>
          {draft.tiposGrupoIds.length
            ? `${draft.tiposGrupoIds.length} selecionado(s)`
            : "Todos os tipos permitidos"}
        </Text>
        <Text style={styles.selectionTitle}>Grupos especificos</Text>
        <View style={styles.selectionActions}>
          <Pressable onPress={() => update({ gruposIds: [] })}>
            <Text style={styles.link}>Todos atuais e futuros</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              update({ gruposIds: data?.grupos.map((item) => item.id) ?? [] })
            }
          >
            <Text style={styles.link}>Selecionar lista</Text>
          </Pressable>
        </View>
        {data?.grupos.map((item) => (
          <CheckRow
            key={item.id}
            label={item.nome}
            checked={draft.gruposIds.includes(item.id)}
            onChange={(checked) => toggle("gruposIds", item.id, checked)}
          />
        ))}
        {data?.tiposGrupo.length ? (
          <>
            <Text style={styles.selectionTitle}>Tipos de grupo</Text>
            <View style={styles.selectionActions}>
              <Pressable onPress={() => update({ tiposGrupoIds: [] })}>
                <Text style={styles.link}>Todos atuais e futuros</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  update({
                    tiposGrupoIds:
                      data?.tiposGrupo.map((item) => item.id) ?? [],
                  })
                }
              >
                <Text style={styles.link}>Selecionar lista</Text>
              </Pressable>
            </View>
            {data.tiposGrupo.map((item) => (
              <CheckRow
                key={item.id}
                label={item.nome}
                checked={draft.tiposGrupoIds.includes(item.id)}
                onChange={(checked) =>
                  toggle("tiposGrupoIds", item.id, checked)
                }
              />
            ))}
          </>
        ) : null}
      </View>
      <View style={styles.previewBox}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => preview.mutate()}
          disabled={preview.isPending}
        >
          <Ionicons name="eye-outline" size={17} color={colors.brandBlue} />
          <Text style={styles.secondaryText}>
            {preview.isPending ? "Calculando..." : "Atualizar estimativa"}
          </Text>
        </Pressable>
        {preview.data ? (
          <Text style={styles.previewText}>
            {preview.data.gruposAfetados} grupos afetados ·{" "}
            {preview.data.participantesAlvoEstimados} participantes estimados
          </Text>
        ) : null}
        {preview.isError ? (
          <Text style={styles.error}>
            {
              normalizeApiError(
                preview.error,
                "Nao foi possivel calcular a estimativa.",
              ).message
            }
          </Text>
        ) : null}
      </View>
      <View style={styles.formActions}>
        <Pressable style={styles.secondaryButton} onPress={onCancel}>
          <Text style={styles.secondaryText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[
            styles.primaryButton,
            (!draft.nome.trim() || !draft.eventoTemplateId || saving) &&
              styles.disabled,
          ]}
          disabled={!draft.nome.trim() || !draft.eventoTemplateId || saving}
          onPress={onSubmit}
        >
          <Text style={styles.primaryText}>
            {saving
              ? "Salvando..."
              : editing
                ? "Atualizar objetivo"
                : "Criar objetivo"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function PickerModal({
  picker,
  setPicker,
  draft,
  setDraft,
  data,
  templateFilter,
  setTemplateFilter,
}: {
  picker: string | null;
  setPicker: (value: any) => void;
  draft: Draft;
  setDraft: (value: Draft) => void;
  data?: { templates: EventoTemplate[]; papeis: PapelAdminDto[] };
  templateFilter: number | null;
  setTemplateFilter: (value: number | null) => void;
}) {
  if (!picker) return null;
  const options =
    picker === "template"
      ? [
          { value: null, label: "Todos os modelos" },
          ...(data?.templates ?? []).map((item) => ({
            value: item.id,
            label: item.titulo,
          })),
        ]
      : picker === "tipo"
        ? tipos
        : picker === "escopo"
          ? escopos
          : picker === "inicio"
            ? startOptions
            : picker === "unidade"
              ? unitOptions
              : [
                  {
                    value: null,
                    label:
                      picker === "papelOrigem"
                        ? "Qualquer papel"
                        : "Selecione o papel esperado",
                  },
                  ...(data?.papeis ?? []).map((item) => ({
                    value: item.id,
                    label: item.nome,
                  })),
                ];
  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={() => setPicker(null)}
    >
      <View style={styles.modalLayer}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPicker(null)}
        />
        <View style={styles.picker}>
          <Text style={styles.sectionTitle}>Selecionar</Text>
          <ScrollView>
            {options.map((option) => (
              <Pressable
                key={String(option.value)}
                style={styles.pickerOption}
                onPress={() => {
                  if (picker === "template") {
                    setTemplateFilter(option.value as number | null);
                    setDraft({
                      ...draft,
                      eventoTemplateId: option.value as number | null,
                    });
                  } else
                    setDraft({
                      ...draft,
                      [picker === "papelAlvo"
                        ? "papelAlvoId"
                        : picker === "papelOrigem"
                          ? "papelOrigemId"
                          : picker]: option.value,
                    });
                  setPicker(null);
                }}
              >
                <Text style={styles.pickerText}>{option.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textMuted}
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}
function SelectButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.select} onPress={onPress}>
      <Text style={styles.selectText} numberOfLines={2}>
        {label}
      </Text>
      <Ionicons name="chevron-down" size={17} color={colors.textMuted} />
    </Pressable>
  );
}
function Choice({
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
      style={[styles.choice, active && styles.choiceActive]}
      onPress={onPress}
    >
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}
function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={() => onChange(!checked)}>
      <Ionicons
        name={checked ? "checkbox" : "square-outline"}
        size={20}
        color={checked ? colors.brandBlue : colors.textMuted}
      />
      <Text style={styles.checkText}>{label}</Text>
    </Pressable>
  );
}
function Toggle({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggle}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderDefault, true: "#A7C7FF" }}
        thumbColor={value ? colors.brandBlue : colors.surfacePrimary}
      />
    </View>
  );
}
function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "blue" | "green" | "amber" | "purple";
}) {
  return (
    <View
      style={[
        styles.metric,
        tone === "green"
          ? styles.metricGreen
          : tone === "amber"
            ? styles.metricAmber
            : tone === "purple"
              ? styles.metricPurple
              : styles.metricBlue,
      ]}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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
        <Ionicons name="locate-outline" size={28} color={colors.textMuted} />
      )}
      <Text style={styles.stateText}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry}>
          <Text style={styles.link}>Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
function findRole(roles: PapelAdminDto[] | undefined, id: number | null) {
  return roles?.find((role) => role.id === id);
}
function typeLabel(value: string) {
  return tipos.find((item) => item.value === value)?.label ?? value;
}
function scopeLabel(value: string) {
  return escopos.find((item) => item.value === value)?.label ?? value;
}
function startLabel(value: string) {
  return startOptions.find((item) => item.value === value)?.label ?? value;
}
function scopeDetail(item: EventoObjetivo) {
  const groups = item.gruposIds?.length ?? 0;
  const types = item.tiposGrupoIds?.length ?? 0;
  return groups || types
    ? `${groups} grupo(s) + ${types} tipo(s)`
    : "Todos os grupos permitidos";
}
function normalizeTipo(value: string): EventoObjetivoTipo {
  return tipos.some((item) => item.value === value)
    ? (value as EventoObjetivoTipo)
    : "presenca_valida";
}
function normalizeEscopo(value: string): EventoObjetivoEscopo {
  return escopos.some((item) => item.value === value)
    ? (value as EventoObjetivoEscopo)
    : "individual";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  content: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  compact: { padding: spacing.md, gap: spacing.md },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  headerText: { flex: 1, minWidth: 0, gap: spacing.xs },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  breadcrumbText: { ...typography.caption, color: colors.textMuted },
  breadcrumbCurrent: {
    ...typography.caption,
    color: colors.textBody,
    fontWeight: "700",
  },
  eyebrow: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: { ...typography.h1, color: colors.textHeading },
  subtitle: { ...typography.body, color: colors.textSecondary },
  scopeHint: { ...typography.caption, color: colors.textMuted },
  strong: { color: colors.textHeading, fontWeight: "700" },
  headerActions: { gap: spacing.sm },
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
  secondaryButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfacePrimary,
  },
  secondaryText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  metric: {
    flexGrow: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricBlue: { borderColor: "#BFDBFE", backgroundColor: "#EFF6FF" },
  metricGreen: { borderColor: "#A7F3D0", backgroundColor: "#ECFDF5" },
  metricAmber: { borderColor: "#FDE68A", backgroundColor: "#FFFBEB" },
  metricPurple: { borderColor: "#DDD6FE", backgroundColor: "#F5F3FF" },
  metricLabel: { ...typography.caption, color: colors.textSecondary },
  metricValue: {
    ...typography.h2,
    color: colors.textHeading,
    fontWeight: "700",
  },
  filters: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  filterBlock: { flexGrow: 1, minWidth: 190, gap: spacing.xs },
  label: { ...typography.caption, color: colors.textBody, fontWeight: "700" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  choice: {
    minHeight: 38,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
  },
  choiceActive: { borderColor: colors.brandBlue, backgroundColor: "#EAF2FF" },
  choiceText: { ...typography.caption, color: colors.textSecondary },
  choiceTextActive: { color: colors.brandBlue, fontWeight: "700" },
  select: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfacePrimary,
  },
  selectText: { ...typography.bodySmall, color: colors.textBody, flex: 1 },
  refresh: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  list: { gap: spacing.sm },
  objectiveCard: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderLeftWidth: 4,
    borderLeftColor: colors.brandBlue,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
    gap: spacing.sm,
  },
  objectivePaused: { borderLeftColor: colors.textDisabled },
  objectiveTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  objectiveIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: "#EFF6FF",
  },
  objectiveText: { flex: 1, minWidth: 0, gap: 2 },
  objectiveName: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: "700",
  },
  objectiveDescription: { ...typography.caption, color: colors.textSecondary },
  objectiveTemplate: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  statusBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeBadge: { backgroundColor: "#ECFDF5" },
  pausedBadge: { backgroundColor: colors.surfaceMuted },
  activeText: { ...typography.caption, color: "#047857", fontWeight: "700" },
  pausedText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },
  rule: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.sm,
    gap: 2,
  },
  ruleTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: "700",
  },
  meta: { ...typography.caption, color: colors.textSecondary },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  iconButton: {
    width: 42,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xl,
  },
  emptyTitle: { ...typography.h3, color: colors.textHeading },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  state: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xl,
  },
  stateText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },
  error: { ...typography.bodySmall, color: colors.error },
  link: { ...typography.caption, color: colors.brandBlue, fontWeight: "700" },
  editor: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  editorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionTitle: { ...typography.h3, color: colors.textHeading },
  fieldset: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
  },
  legend: { ...typography.body, color: colors.textHeading, fontWeight: "700" },
  field: { gap: spacing.xs },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    color: colors.textBody,
    backgroundColor: colors.surfacePrimary,
  },
  textArea: { minHeight: 82, paddingTop: spacing.sm, textAlignVertical: "top" },
  hint: { ...typography.caption, color: colors.textMuted },
  callout: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    padding: spacing.sm,
  },
  calloutText: { flex: 1, gap: 2 },
  calloutTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: "700",
  },
  smallButton: {
    minHeight: 36,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  smallButtonText: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  twoColumns: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  inline: { flexDirection: "row", gap: spacing.sm },
  numberInput: { width: 90 },
  toggle: {
    minHeight: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scopeSummary: { ...typography.caption, color: colors.textSecondary },
  selectionTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  selectionActions: { flexDirection: "row", gap: spacing.md },
  checkRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  checkText: { ...typography.bodySmall, color: colors.textBody },
  previewBox: {
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#F8FBFF",
    padding: spacing.md,
  },
  previewText: {
    ...typography.bodySmall,
    color: colors.textBody,
    fontWeight: "700",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  disabled: { opacity: 0.5 },
  modalLayer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  picker: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "80%",
    gap: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  pickerOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  pickerText: { ...typography.bodySmall, color: colors.textBody },
});
