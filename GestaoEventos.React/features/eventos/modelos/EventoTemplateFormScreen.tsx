import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { normalizeApiError } from "../../../services/api/api-error";
import {
  eventoTemplatesApi,
  type EventoTemplate,
  type EventoTemplatePayload,
} from "../../../services/api/evento-templates-api";
import { track } from "../../../services/analytics/analytics.service";
import { assertOnlineForMutation } from "../../../services/offline/mutation-guard";
import { can } from "../../../services/permissions/permission.facade";
import { useAuthStore } from "../../../stores/auth.store";
import { useContextStore } from "../../../stores/context.store";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../shared/design/tokens";
import { layoutMetrics } from "../../../shared/theme";

type Draft = {
  titulo: string;
  descricao: string;
  tipoRecorrencia: number;
  intervalo: string;
  diasSemana: string[];
  duracaoPadraoMinutos: string;
  horarioPadrao: string;
  localPadrao: string;
  opcaoFim: string;
  dataFim: string;
  maxOcorrencias: string;
  gruposIds: number[];
  permitirConfigurarDia: boolean;
  permitirConfigurarHora: boolean;
  permitirConfigurarLocal: boolean;
  permitirRenomear: boolean;
  permitirAddResponsaveis: boolean;
  permitirRemoverResponsaveis: boolean;
  permitirAddParticipantes: boolean;
  adicionarNovosParticipantesEmTodosEventos: boolean;
  permitirRemoverParticipantes: boolean;
  requerJustificativaRemocao: boolean;
  requerJustificativaAusencia: boolean;
  permitirReatribuicaoResponsavel: boolean;
  permitirPresencaAgrupada: boolean;
  permitirReabertura: boolean;
  cobrancaPresencaAtiva: boolean;
  prazoRegistroQuantidade: string;
  prazoRegistroUnidade: "horas" | "dias";
  avisoInicialAposQuantidade: string;
  avisoInicialAposUnidade: "horas" | "dias";
  avisoVencimentoAntesQuantidade: string;
  avisoVencimentoAntesUnidade: "horas" | "dias";
  escalonamentoAposQuantidade: string;
  escalonamentoAposUnidade: "horas" | "dias";
  repetirCobrancaQuantidade: string;
  repetirCobrancaUnidade: "horas" | "dias";
};

const days = [
  ["domingo", "Dom"],
  ["segunda", "Seg"],
  ["terca", "Ter"],
  ["quarta", "Qua"],
  ["quinta", "Qui"],
  ["sexta", "Sex"],
  ["sabado", "Sab"],
] as const;
const recurrence = [
  [0, "Unico"],
  [1, "Diario"],
  [2, "Semanal"],
  [3, "Mensal"],
  [4, "Anual"],
] as const;
const emptyDraft: Draft = {
  titulo: "",
  descricao: "",
  tipoRecorrencia: 2,
  intervalo: "1",
  diasSemana: [],
  duracaoPadraoMinutos: "60",
  horarioPadrao: "",
  localPadrao: "",
  opcaoFim: "flexivel",
  dataFim: "",
  maxOcorrencias: "",
  gruposIds: [],
  permitirConfigurarDia: true,
  permitirConfigurarHora: true,
  permitirConfigurarLocal: true,
  permitirRenomear: true,
  permitirAddResponsaveis: false,
  permitirRemoverResponsaveis: false,
  permitirAddParticipantes: true,
  adicionarNovosParticipantesEmTodosEventos: false,
  permitirRemoverParticipantes: false,
  requerJustificativaRemocao: false,
  requerJustificativaAusencia: false,
  permitirReatribuicaoResponsavel: true,
  permitirPresencaAgrupada: false,
  permitirReabertura: true,
  cobrancaPresencaAtiva: true,
  prazoRegistroQuantidade: "7",
  prazoRegistroUnidade: "dias",
  avisoInicialAposQuantidade: "1",
  avisoInicialAposUnidade: "dias",
  avisoVencimentoAntesQuantidade: "1",
  avisoVencimentoAntesUnidade: "dias",
  escalonamentoAposQuantidade: "1",
  escalonamentoAposUnidade: "dias",
  repetirCobrancaQuantidade: "7",
  repetirCobrancaUnidade: "dias",
};

export function EventoTemplateFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const idValue = Array.isArray(params.id) ? params.id[0] : params.id;
  const templateId = Number(idValue ?? 0);
  const editing = Number.isInteger(templateId) && templateId > 0;
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const estruturaId = useContextStore((state) => state.estruturaId);
  const usuarioId =
    useContextStore((state) => state.usuarioId) ||
    Number(useAuthStore.getState().user?.id ?? 0);
  const estruturaNome = useContextStore((state) => state.estruturaNome);
  const client = useQueryClient();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const allowed = Boolean(
    estruturaId && can("criar", "eventos", { estruturaId }),
  );
  const groupsQuery = useQuery({
    queryKey: ["evento-template-groups", estruturaId],
    queryFn: () => eventoTemplatesApi.grupos(estruturaId!),
    enabled: Boolean(estruturaId),
    retry: false,
  });
  const templateQuery = useQuery({
    queryKey: ["evento-template", templateId],
    queryFn: () => eventoTemplatesApi.getById(templateId),
    enabled: editing && allowed,
    retry: false,
  });
  const save = useMutation({
    mutationFn: async () => {
      const validation = validateDraft(draft);
      if (validation.length) throw new Error(validation.join(" "));
      if (!estruturaId || usuarioId <= 0)
        throw new Error("Contexto invalido para salvar o modelo.");
      assertOnlineForMutation(
        editing ? "Atualizar modelo de evento" : "Criar modelo de evento",
      );
      const payload: EventoTemplatePayload = {
        titulo: draft.titulo.trim(),
        descricao: draft.descricao.trim(),
        tipo: "Evento",
        estruturaId,
        criadorId: usuarioId,
        tipoRecorrencia: draft.tipoRecorrencia,
        intervalo: positiveNumber(draft.intervalo, 1),
        diasSemana: draft.diasSemana,
        duracaoPadraoMinutos: positiveNumber(draft.duracaoPadraoMinutos, 60),
        horarioPadrao: draft.horarioPadrao || null,
        localPadrao: draft.localPadrao.trim() || null,
        opcaoFim: draft.opcaoFim,
        dataFim: draft.dataFim || null,
        maxOcorrencias: draft.maxOcorrencias
          ? positiveNumber(draft.maxOcorrencias, 1)
          : null,
        gruposIds: draft.gruposIds,
        permitirConfigurarDia: draft.permitirConfigurarDia,
        permitirConfigurarHora: draft.permitirConfigurarHora,
        permitirConfigurarLocal: draft.permitirConfigurarLocal,
        permitirRenomear: draft.permitirRenomear,
        permitirAddResponsaveis: draft.permitirAddResponsaveis,
        permitirRemoverResponsaveis: draft.permitirRemoverResponsaveis,
        permitirAddParticipantes: draft.permitirAddParticipantes,
        adicionarNovosParticipantesEmTodosEventos: draft.adicionarNovosParticipantesEmTodosEventos,
        permitirRemoverParticipantes: draft.permitirRemoverParticipantes,
        requerJustificativaRemocao: draft.requerJustificativaRemocao,
        requerJustificativaAusencia: draft.requerJustificativaAusencia,
        permitirReatribuicaoResponsavel: draft.permitirReatribuicaoResponsavel,
        permitirPresencaAgrupada: draft.permitirPresencaAgrupada,
        permitirReabertura: draft.permitirReabertura,
        cobrancaPresencaAtiva: draft.cobrancaPresencaAtiva,
        prazoRegistroQuantidade: positiveNumber(draft.prazoRegistroQuantidade, 7),
        prazoRegistroUnidade: draft.prazoRegistroUnidade,
        avisoInicialAposQuantidade: nonNegativeNumber(draft.avisoInicialAposQuantidade, 1),
        avisoInicialAposUnidade: draft.avisoInicialAposUnidade,
        avisoVencimentoAntesQuantidade: nonNegativeNumber(draft.avisoVencimentoAntesQuantidade, 1),
        avisoVencimentoAntesUnidade: draft.avisoVencimentoAntesUnidade,
        escalonamentoAposQuantidade: nonNegativeNumber(draft.escalonamentoAposQuantidade, 1),
        escalonamentoAposUnidade: draft.escalonamentoAposUnidade,
        repetirCobrancaQuantidade: nonNegativeNumber(draft.repetirCobrancaQuantidade, 7),
        repetirCobrancaUnidade: draft.repetirCobrancaUnidade,
      };
      return editing
        ? eventoTemplatesApi.update(templateId, payload)
        : eventoTemplatesApi.create(payload);
    },
    onSuccess: () => {
      track(
        "confirmation",
        editing
          ? "modelo_evento:atualizar_success"
          : "modelo_evento:criar_success",
      );
      void client.invalidateQueries({
        queryKey: ["evento-templates", estruturaId],
      });
      router.replace("/admin/eventos/modelos" as Href);
    },
  });

  useEffect(() => {
    if (templateQuery.data?.data) {
      // The query resolves after the first render; hydrate the editable form once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(templateToDraft(templateQuery.data.data));
    }
  }, [templateQuery.data]);
  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors([]);
  }
  function toggleDay(day: string) {
    update(
      "diasSemana",
      draft.diasSemana.includes(day)
        ? draft.diasSemana.filter((item) => item !== day)
        : [...draft.diasSemana, day],
    );
  }
  function toggleGroup(id: number) {
    update(
      "gruposIds",
      draft.gruposIds.includes(id)
        ? draft.gruposIds.filter((item) => item !== id)
        : [...draft.gruposIds, id],
    );
  }
  function applyCobrancaPreset(preset: "agressivo" | "padrao" | "flexivel") {
    const values = {
      agressivo: { prazo: "1", prazoUnidade: "dias" as const, inicial: "0", inicialUnidade: "horas" as const, vencimento: "6", vencimentoUnidade: "horas" as const, escalonamento: "0", escalonamentoUnidade: "horas" as const, repetir: "1", repetirUnidade: "dias" as const },
      padrao: { prazo: "7", prazoUnidade: "dias" as const, inicial: "1", inicialUnidade: "dias" as const, vencimento: "1", vencimentoUnidade: "dias" as const, escalonamento: "1", escalonamentoUnidade: "dias" as const, repetir: "7", repetirUnidade: "dias" as const },
      flexivel: { prazo: "14", prazoUnidade: "dias" as const, inicial: "2", inicialUnidade: "dias" as const, vencimento: "2", vencimentoUnidade: "dias" as const, escalonamento: "2", escalonamentoUnidade: "dias" as const, repetir: "7", repetirUnidade: "dias" as const },
    }[preset];
    setDraft((current) => ({
      ...current,
      cobrancaPresencaAtiva: true,
      prazoRegistroQuantidade: values.prazo,
      prazoRegistroUnidade: values.prazoUnidade,
      avisoInicialAposQuantidade: values.inicial,
      avisoInicialAposUnidade: values.inicialUnidade,
      avisoVencimentoAntesQuantidade: values.vencimento,
      avisoVencimentoAntesUnidade: values.vencimentoUnidade,
      escalonamentoAposQuantidade: values.escalonamento,
      escalonamentoAposUnidade: values.escalonamentoUnidade,
      repetirCobrancaQuantidade: values.repetir,
      repetirCobrancaUnidade: values.repetirUnidade,
    }));
    setErrors([]);
  }
  function submit() {
    const validation = validateDraft(draft);
    if (validation.length) {
      setErrors(validation);
      return;
    }
    setErrors([]);
    save.mutate();
  }

  if (!allowed)
    return (
      <State message="Voce nao tem permissao para gerenciar modelos neste contexto." />
    );
  if (templateQuery.isLoading)
    return <State message="Carregando modelo..." loading />;
  if (templateQuery.isError)
    return (
      <State
        message={
          normalizeApiError(
            templateQuery.error,
            "Nao foi possivel carregar o modelo.",
          ).message
        }
        onRetry={() => void templateQuery.refetch()}
      />
    );

  return (
    <ScrollView
      contentContainerStyle={[styles.content, compact && styles.compact]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.pageHeader}>
        <View style={styles.headerText}>
          <View style={styles.breadcrumb}>
            <Ionicons name="home-outline" size={14} color={colors.textMuted} />
            <Text style={styles.breadcrumbText}>Eventos</Text>
            <Ionicons
              name="chevron-forward"
              size={12}
              color={colors.textDisabled}
            />
            <Text style={styles.breadcrumbCurrent}>Modelos de Evento</Text>
          </View>
          <Text style={styles.title}>
            {editing ? "Editar Modelo de Evento" : "Criar Modelo de Evento"}
          </Text>
          <Text style={styles.subtitle}>
            {editing
              ? "Atualize as configuracoes do modelo para novos eventos."
              : "Defina um modelo que pode ser usado por diferentes grupos da estrutura."}
          </Text>
          <Text style={styles.scopeHint}>
            Estrutura ativa:{" "}
            <Text style={styles.strong}>
              {estruturaNome ?? "Nao selecionada"}
            </Text>
          </Text>
        </View>
      </View>
      {editing ? (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" size={18} color={colors.warning} />
          <Text style={styles.warningText}>
            Alteracoes afetam somente eventos criados a partir de agora.
          </Text>
        </View>
      ) : null}
      {errors.length > 0 ? (
        <View style={styles.errorBox}>
          <Ionicons
            name="alert-circle-outline"
            size={19}
            color={colors.error}
          />
          <View style={styles.errorTextBlock}>
            {errors.map((error) => (
              <Text accessibilityRole="alert" key={error} style={styles.error}>
                {error}
              </Text>
            ))}
          </View>
        </View>
      ) : null}
      <Section
        icon="information-circle-outline"
        title="Informacoes basicas"
        description="Defina identidade e proposito do modelo."
      >
        <Field
          label="Titulo do modelo"
          value={draft.titulo}
          onChangeText={(value) => update("titulo", value)}
          placeholder="Ex.: Celula, reuniao ou treinamento"
        />
        <Field
          label="Descricao"
          value={draft.descricao}
          onChangeText={(value) => update("descricao", value)}
          placeholder="Descreva o proposito e as caracteristicas"
          multiline
        />
      </Section>
      <Section
        icon="calendar-outline"
        title="Recorrencia"
        description="Defina como o evento se repete."
      >
        <Text style={styles.label}>Tipo de recorrencia</Text>
        <View style={styles.choiceRow}>
          {recurrence.map(([value, label]) => (
            <Choice
              key={value}
              label={label}
              active={draft.tipoRecorrencia === value}
              onPress={() => update("tipoRecorrencia", value)}
            />
          ))}
        </View>
        <View style={styles.row}>
          <Field
            label="Intervalo"
            value={draft.intervalo}
            onChangeText={(value) => update("intervalo", value)}
            placeholder="1"
            numeric
          />
          <Field
            label="Duracao padrao (minutos)"
            value={draft.duracaoPadraoMinutos}
            onChangeText={(value) => update("duracaoPadraoMinutos", value)}
            placeholder="60"
            numeric
          />
          <Field
            label="Horario padrao"
            value={draft.horarioPadrao}
            onChangeText={(value) => update("horarioPadrao", value)}
            placeholder="HH:mm"
          />
        </View>
        {draft.tipoRecorrencia === 2 ? (
          <>
            <Text style={styles.label}>Dias da semana</Text>
            <View style={styles.choiceRow}>
              {days.map(([value, label]) => (
                <Choice
                  key={value}
                  label={label}
                  active={draft.diasSemana.includes(value)}
                  onPress={() => toggleDay(value)}
                />
              ))}
            </View>
          </>
        ) : null}
        <Text style={styles.label}>Fim do evento</Text>
        <View style={styles.choiceColumn}>
          {[
            ["flexivel", "Flexivel", "Cada grupo decide ao iniciar"],
            ["sem-fim", "Sem fim", "Evento recorrente sem data final"],
            [
              "com-fim",
              "Com fim definido",
              "Defina a data ou o numero de ocorrencias",
            ],
          ].map(([value, label, description]) => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ checked: draft.opcaoFim === value }}
              style={[
                styles.endOption,
                draft.opcaoFim === value && styles.endOptionActive,
              ]}
              onPress={() => update("opcaoFim", value)}
            >
              <Ionicons
                name={
                  draft.opcaoFim === value
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={19}
                color={colors.brandBlue}
              />
              <View style={styles.endText}>
                <Text style={styles.endTitle}>{label}</Text>
                <Text style={styles.endDescription}>{description}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        {draft.opcaoFim === "com-fim" ? (
          <View style={styles.row}>
            <Field
              label="Data de fim"
              value={draft.dataFim}
              onChangeText={(value) => update("dataFim", value)}
              placeholder="AAAA-MM-DD"
            />
            <Field
              label="Maximo de ocorrencias"
              value={draft.maxOcorrencias}
              onChangeText={(value) => update("maxOcorrencias", value)}
              placeholder="Opcional"
              numeric
            />
          </View>
        ) : null}
      </Section>
      <Section
        icon="location-outline"
        title="Local do evento"
        description="Endereco padrao usado ao iniciar um evento a partir deste modelo."
      >
        <Field
          label="Nome do local"
          value={draft.localPadrao}
          onChangeText={(value) => update("localPadrao", value)}
          placeholder="Ex.: Sala principal ou auditorio"
        />
      </Section>
      <Section
        icon="people-outline"
        title="Grupos vinculados"
        description="Deixe vazio para disponibilizar a todos os grupos permitidos."
      >
        <Text style={styles.label}>Grupos especificos</Text>
        {groupsQuery.isLoading ? (
          <ActivityIndicator color={colors.brandBlue} />
        ) : groups.length === 0 ? (
          <Text style={styles.helper}>
            Nenhum grupo disponivel neste contexto.
          </Text>
        ) : (
          <View style={styles.selectionGrid}>
            {groups.map((group) => (
              <Pressable
                key={group.id}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: draft.gruposIds.includes(group.id),
                }}
                style={[
                  styles.selection,
                  draft.gruposIds.includes(group.id) && styles.selectionActive,
                ]}
                onPress={() => toggleGroup(group.id)}
              >
                <Ionicons
                  name={
                    draft.gruposIds.includes(group.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={19}
                  color={colors.brandBlue}
                />
                <Text style={styles.selectionText}>{group.nome}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Text style={styles.helper}>
          Papéis e tipos de grupo seguem as permissões configuradas no backend e
          podem ser ampliados no próximo passe.
        </Text>
      </Section>
      <Section
        icon="settings-outline"
        title="Permissoes de configuracao"
        description="Defina o que pode ser personalizado ao usar este modelo."
      >
        <Toggle
          label="Permitir configurar dia da semana"
          value={draft.permitirConfigurarDia}
          onChange={(value) => update("permitirConfigurarDia", value)}
        />
        <Toggle
          label="Permitir configurar horario"
          value={draft.permitirConfigurarHora}
          onChange={(value) => update("permitirConfigurarHora", value)}
        />
        <Toggle
          label="Permitir configurar local"
          value={draft.permitirConfigurarLocal}
          onChange={(value) => update("permitirConfigurarLocal", value)}
        />
        <Toggle
          label="Permitir renomear evento"
          value={draft.permitirRenomear}
          onChange={(value) => update("permitirRenomear", value)}
        />
      </Section>
      <Section
        icon="shield-checkmark-outline"
        title="Permissoes de gestao"
        description="Defina o que pode ser gerenciado ao usar este modelo."
      >
        <Toggle
          label="Permitir adicionar responsaveis"
          value={draft.permitirAddResponsaveis}
          onChange={(value) => update("permitirAddResponsaveis", value)}
        />
        <Toggle
          label="Permitir remover responsaveis"
          value={draft.permitirRemoverResponsaveis}
          onChange={(value) => update("permitirRemoverResponsaveis", value)}
        />
        <Toggle
          label="Permitir adicionar participantes"
          value={draft.permitirAddParticipantes}
          onChange={(value) => update("permitirAddParticipantes", value)}
        />
        <Toggle
          label="Vincular novos participantes a todos os eventos do grupo"
          description="Quando ativo, novos cadastros ja ficam selecionados nos demais eventos deste grupo."
          value={draft.adicionarNovosParticipantesEmTodosEventos}
          onChange={(value) => update("adicionarNovosParticipantesEmTodosEventos", value)}
        />
        <Toggle
          label="Permitir remover participantes"
          value={draft.permitirRemoverParticipantes}
          onChange={(value) => update("permitirRemoverParticipantes", value)}
        />
        <Toggle
          label="Requer justificativa ao remover"
          value={draft.requerJustificativaRemocao}
          onChange={(value) => update("requerJustificativaRemocao", value)}
        />
        <Toggle
          label="Requer justificativa ao faltar"
          value={draft.requerJustificativaAusencia}
          onChange={(value) => update("requerJustificativaAusencia", value)}
        />
        <Toggle
          label="Permitir reatribuicao de responsavel"
          value={draft.permitirReatribuicaoResponsavel}
          onChange={(value) => update("permitirReatribuicaoResponsavel", value)}
        />
      </Section>
      <Section
        icon="grid-outline"
        title="Presenca em grupo"
        description="Permite preencher presenca de varios eventos juntos."
      >
        <Toggle
          label="Permitir presenca em grupo"
          value={draft.permitirPresencaAgrupada}
          onChange={(value) => update("permitirPresencaAgrupada", value)}
        />
        <Toggle
          label="Permitir reabertura"
          value={draft.permitirReabertura}
          onChange={(value) => update("permitirReabertura", value)}
        />
      </Section>
      <Section
        icon="notifications-outline"
        title="Cobranca de registros"
        description="Defina quando lembrar o responsavel e quando escalar uma pendencia."
      >
        <Toggle
          label="Ativar cobranca automatica"
          value={draft.cobrancaPresencaAtiva}
          onChange={(value) => update("cobrancaPresencaAtiva", value)}
        />
        {draft.cobrancaPresencaAtiva ? (
          <>
            <View style={styles.presetBox}>
              <Text style={styles.label}>Aplicar um perfil</Text>
              <View style={styles.choiceRow}>
                <Choice label="Agressivo" active={false} onPress={() => applyCobrancaPreset("agressivo")} />
                <Choice label="Padrao" active={false} onPress={() => applyCobrancaPreset("padrao")} />
                <Choice label="Flexivel" active={false} onPress={() => applyCobrancaPreset("flexivel")} />
              </View>
              <Text style={styles.helper}>Depois de aplicar, ajuste qualquer prazo abaixo.</Text>
            </View>
            <ScheduleField
              label="Prazo para registrar"
              quantity={draft.prazoRegistroQuantidade}
              unit={draft.prazoRegistroUnidade}
              onQuantityChange={(value) => update("prazoRegistroQuantidade", value)}
              onUnitChange={(value) => update("prazoRegistroUnidade", value)}
            />
            <ScheduleField
              label="Primeiro aviso apos o evento"
              quantity={draft.avisoInicialAposQuantidade}
              unit={draft.avisoInicialAposUnidade}
              onQuantityChange={(value) => update("avisoInicialAposQuantidade", value)}
              onUnitChange={(value) => update("avisoInicialAposUnidade", value)}
            />
            <ScheduleField
              label="Aviso antes do vencimento"
              quantity={draft.avisoVencimentoAntesQuantidade}
              unit={draft.avisoVencimentoAntesUnidade}
              onQuantityChange={(value) => update("avisoVencimentoAntesQuantidade", value)}
              onUnitChange={(value) => update("avisoVencimentoAntesUnidade", value)}
            />
            <ScheduleField
              label="Escalonar para o superior apos vencer"
              quantity={draft.escalonamentoAposQuantidade}
              unit={draft.escalonamentoAposUnidade}
              onQuantityChange={(value) => update("escalonamentoAposQuantidade", value)}
              onUnitChange={(value) => update("escalonamentoAposUnidade", value)}
            />
            <ScheduleField
              label="Repetir cobranca enquanto pendente"
              quantity={draft.repetirCobrancaQuantidade}
              unit={draft.repetirCobrancaUnidade}
              onQuantityChange={(value) => update("repetirCobrancaQuantidade", value)}
              onUnitChange={(value) => update("repetirCobrancaUnidade", value)}
            />
            <View style={styles.timelinePreview}>
              <View style={styles.timelineTitleRow}>
                <Ionicons name="time-outline" size={17} color={colors.brandBlue} />
                <Text style={styles.timelineTitle}>Linha do tempo da cobranca</Text>
              </View>
              <Text style={styles.helper}>A contagem comeca no fim de cada ocorrencia.</Text>
              <Text style={styles.timelineText}>Primeiro aviso: {formatSchedule(draft.avisoInicialAposQuantidade, draft.avisoInicialAposUnidade)} depois</Text>
              <Text style={styles.timelineText}>Vencimento: {formatSchedule(draft.prazoRegistroQuantidade, draft.prazoRegistroUnidade)} depois</Text>
              <Text style={styles.timelineText}>Superior: {formatSchedule(draft.escalonamentoAposQuantidade, draft.escalonamentoAposUnidade)} apos o vencimento</Text>
            </View>
          </>
        ) : (
          <Text style={styles.helper}>Nenhuma notificacao automatica sera criada para registros deste modelo.</Text>
        )}
      </Section>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={styles.secondaryButton}
          onPress={() => router.replace("/admin/eventos/modelos" as Href)}
          disabled={save.isPending}
        >
          <Ionicons name="close-outline" size={18} color={colors.brandBlue} />
          <Text style={styles.secondaryText}>Cancelar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={submit}
          disabled={save.isPending}
        >
          <Ionicons
            name="save-outline"
            size={18}
            color={colors.surfacePrimary}
          />
          <Text style={styles.primaryText}>
            {save.isPending
              ? editing
                ? "Atualizando..."
                : "Criando..."
              : editing
                ? "Atualizar modelo"
                : "Criar modelo"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={20} color={colors.brandBlue} />
        </View>
        <View style={styles.sectionText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionDescription}>{description}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numeric = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  numeric?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        keyboardType={numeric ? "numeric" : "default"}
        multiline={multiline}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}
function ScheduleField({
  label,
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
}: {
  label: string;
  quantity: string;
  unit: "horas" | "dias";
  onQuantityChange: (value: string) => void;
  onUnitChange: (value: "horas" | "dias") => void;
}) {
  return (
    <View style={styles.scheduleField}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.scheduleControls}>
        <TextInput
          accessibilityLabel={`${label} quantidade`}
          value={quantity}
          onChangeText={onQuantityChange}
          keyboardType="numeric"
          placeholder="1"
          placeholderTextColor={colors.textDisabled}
          style={styles.scheduleInput}
        />
        <View style={styles.unitChoices}>
          <Choice label="Horas" active={unit === "horas"} onPress={() => onUnitChange("horas")} />
          <Choice label="Dias" active={unit === "dias"} onPress={() => onUnitChange("dias")} />
        </View>
      </View>
    </View>
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
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      style={[styles.choice, active && styles.choiceActive]}
      onPress={onPress}
    >
      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}
function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggle}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHint}>{description ?? (value ? "Ativo" : "Desativado")}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderDefault, true: "#93C5FD" }}
        thumbColor={value ? colors.brandBlue : colors.surfacePrimary}
      />
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
        <Ionicons name="albums-outline" size={26} color={colors.textMuted} />
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
function templateToDraft(template: EventoTemplate): Draft {
  return {
    titulo: template.titulo ?? "",
    descricao: template.descricao ?? "",
    tipoRecorrencia: template.tipoRecorrencia ?? 2,
    intervalo: String(template.intervalo ?? 1),
    diasSemana: template.diasSemana ?? [],
    duracaoPadraoMinutos: String(template.duracaoPadraoMinutos ?? 60),
    horarioPadrao: template.horarioPadrao?.slice(0, 5) ?? "",
    localPadrao: template.localPadrao ?? "",
    opcaoFim: template.opcaoFim ?? "flexivel",
    dataFim: template.dataFim?.slice(0, 10) ?? "",
    maxOcorrencias: template.maxOcorrencias
      ? String(template.maxOcorrencias)
      : "",
    gruposIds: template.gruposIds ?? [],
    permitirConfigurarDia: template.permitirConfigurarDia ?? true,
    permitirConfigurarHora: template.permitirConfigurarHora ?? true,
    permitirConfigurarLocal: template.permitirConfigurarLocal ?? true,
    permitirRenomear: template.permitirRenomear ?? true,
    permitirAddResponsaveis: template.permitirAddResponsaveis ?? false,
    permitirRemoverResponsaveis: template.permitirRemoverResponsaveis ?? false,
    permitirAddParticipantes: template.permitirAddParticipantes ?? true,
    adicionarNovosParticipantesEmTodosEventos:
      template.adicionarNovosParticipantesEmTodosEventos ?? false,
    permitirRemoverParticipantes:
      template.permitirRemoverParticipantes ?? false,
    requerJustificativaRemocao: template.requerJustificativaRemocao ?? false,
    requerJustificativaAusencia: template.requerJustificativaAusencia ?? false,
    permitirReatribuicaoResponsavel:
      template.permitirReatribuicaoResponsavel ?? true,
    permitirPresencaAgrupada: template.permitirPresencaAgrupada ?? false,
    permitirReabertura: template.permitirReabertura ?? true,
    cobrancaPresencaAtiva: template.cobrancaPresencaAtiva ?? true,
    prazoRegistroQuantidade: String(template.prazoRegistroQuantidade ?? 7),
    prazoRegistroUnidade: template.prazoRegistroUnidade ?? "dias",
    avisoInicialAposQuantidade: String(template.avisoInicialAposQuantidade ?? 1),
    avisoInicialAposUnidade: template.avisoInicialAposUnidade ?? "dias",
    avisoVencimentoAntesQuantidade: String(template.avisoVencimentoAntesQuantidade ?? 1),
    avisoVencimentoAntesUnidade: template.avisoVencimentoAntesUnidade ?? "dias",
    escalonamentoAposQuantidade: String(template.escalonamentoAposQuantidade ?? 1),
    escalonamentoAposUnidade: template.escalonamentoAposUnidade ?? "dias",
    repetirCobrancaQuantidade: String(template.repetirCobrancaQuantidade ?? 7),
    repetirCobrancaUnidade: template.repetirCobrancaUnidade ?? "dias",
  };
}
function positiveNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}
function nonNegativeNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
}
function scheduleMinutes(quantity: string, unit: "horas" | "dias") {
  return nonNegativeNumber(quantity, 0) * (unit === "dias" ? 24 * 60 : 60);
}
function formatSchedule(quantity: string, unit: "horas" | "dias") {
  const value = nonNegativeNumber(quantity, 0);
  return `${value} ${unit === "dias" ? value === 1 ? "dia" : "dias" : value === 1 ? "hora" : "horas"}`;
}
function validateDraft(draft: Draft) {
  const errors: string[] = [];
  if (draft.titulo.trim().length < 3)
    errors.push("O titulo deve ter pelo menos 3 caracteres.");
  if (draft.descricao.trim().length < 10)
    errors.push("A descricao deve ter pelo menos 10 caracteres.");
  if (positiveNumber(draft.intervalo, 0) < 1)
    errors.push("Informe um intervalo valido.");
  if (positiveNumber(draft.duracaoPadraoMinutos, 0) < 15)
    errors.push("A duracao minima e de 15 minutos.");
  if (draft.opcaoFim === "com-fim" && !draft.dataFim && !draft.maxOcorrencias)
    errors.push("Informe a data ou o numero maximo de ocorrencias.");
  if (draft.cobrancaPresencaAtiva) {
    const prazo = scheduleMinutes(draft.prazoRegistroQuantidade, draft.prazoRegistroUnidade);
    const avisoInicial = scheduleMinutes(draft.avisoInicialAposQuantidade, draft.avisoInicialAposUnidade);
    const avisoVencimento = scheduleMinutes(draft.avisoVencimentoAntesQuantidade, draft.avisoVencimentoAntesUnidade);
    if (positiveNumber(draft.prazoRegistroQuantidade, 0) <= 0)
      errors.push("Informe um prazo de registro maior que zero.");
    if (avisoInicial > prazo)
      errors.push("O primeiro aviso deve acontecer antes do vencimento.");
    if (avisoVencimento > prazo)
      errors.push("O aviso de vencimento deve acontecer dentro do prazo.");
  }
  return errors;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  content: {
    width: "100%",
    maxWidth: 940,
    alignSelf: "center",
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  compact: { padding: spacing.md, gap: spacing.md },
  pageHeader: {
    borderTopWidth: 3,
    borderTopColor: colors.brandBlue,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  headerText: { gap: spacing.xs },
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
  strong: { color: colors.textBody, fontWeight: "700" },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: radius.sm,
    backgroundColor: "#FFFBEB",
    padding: spacing.md,
  },
  warningText: { ...typography.bodySmall, flex: 1, color: colors.textBody },
  errorBox: {
    flexDirection: "row",
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    backgroundColor: "#FEF2F2",
    padding: spacing.md,
  },
  errorTextBlock: { flex: 1, gap: spacing.xs },
  error: { ...typography.bodySmall, color: colors.error },
  section: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  sectionHeading: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: "#EEF5FF",
  },
  sectionText: { flex: 1, gap: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.textHeading },
  sectionDescription: { ...typography.bodySmall, color: colors.textSecondary },
  field: { flex: 1, minWidth: 0, gap: spacing.xs },
  label: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: "700",
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.sm,
    color: colors.textBody,
    fontSize: 16,
  },
  textarea: { minHeight: 92, paddingTop: spacing.sm, textAlignVertical: "top" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  choice: {
    minHeight: 40,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  choiceActive: { borderColor: colors.brandBlue, backgroundColor: "#EFF6FF" },
  choiceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  choiceTextActive: { color: colors.brandBlue },
  choiceColumn: { gap: spacing.xs },
  endOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  endOptionActive: { borderColor: "#93C5FD", backgroundColor: "#EFF6FF" },
  endText: { flex: 1, gap: 2 },
  endTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: "700",
  },
  endDescription: { ...typography.caption, color: colors.textSecondary },
  selectionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  selection: {
    minHeight: 42,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  selectionActive: {
    borderColor: colors.brandBlue,
    backgroundColor: "#EFF6FF",
  },
  selectionText: {
    ...typography.bodySmall,
    flexShrink: 1,
    color: colors.textBody,
  },
  helper: { ...typography.caption, color: colors.textMuted },
  presetBox: {
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: radius.sm,
    backgroundColor: "#F8FBFF",
    padding: spacing.md,
  },
  scheduleField: { gap: spacing.xs },
  scheduleControls: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm },
  scheduleInput: {
    width: 92,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.sm,
    color: colors.textBody,
    fontSize: 16,
  },
  unitChoices: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  timelinePreview: {
    gap: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.brandBlue,
    backgroundColor: "#F8FBFF",
    padding: spacing.md,
  },
  timelineTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  timelineTitle: { color: colors.textHeading, fontWeight: "700" },
  timelineText: { ...typography.bodySmall, color: colors.textBody },
  toggle: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: {
    ...typography.bodySmall,
    color: colors.textBody,
    fontWeight: "700",
  },
  toggleHint: { ...typography.caption, color: colors.textMuted },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
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
    minHeight: 44,
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
});
