import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
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
import {
  eventoTemplatesApi,
  type EventoTemplate,
} from "../../../services/api/evento-templates-api";
import { eventosApi } from "../../../services/api/eventos-api";
import { gruposApi, type GrupoDto } from "../../../services/api/grupos-api";
import { assertOnlineForMutation } from "../../../services/offline/mutation-guard";
import { can } from "../../../services/permissions/permission.facade";
import { useContextStore } from "../../../stores/context.store";
import { track } from "../../../services/analytics/analytics.service";
import {
  colors,
  radius,
  spacing,
  typography,
} from "../../../shared/design/tokens";
import { layoutMetrics } from "../../../shared/theme";

type Recurrence = "UNICO" | "DIARIO" | "SEMANAL" | "MENSAL" | "ANUAL";
type EndOption = "flexivel" | "sem-fim" | "com-fim";
type Picker = "template" | "recurrence" | "end" | null;
type Draft = {
  templateId: number | null;
  nomeGenerico: string;
  nomePersonalizado: string;
  descricao: string;
  dataInicio: string;
  horaInicio: string;
  duracaoHoras: string;
  duracaoMinutos: string;
  local: string;
  tipoRecorrencia: Recurrence;
  intervalo: string;
  diasSemana: number[];
  opcaoFim: EndOption;
  dataFimRecorrencia: string;
  maxOcorrencias: string;
  gruposIds: number[];
  permitirAddParticipantes: boolean;
  permitirRemoverParticipantes: boolean;
  requerJustificativaRemocao: boolean;
  permitirReatribuicao: boolean;
  permiteConvidados: boolean;
  exigeConfirmacao: boolean;
  limiteParticipantes: string;
};

const recurrenceOptions: { value: Recurrence; label: string }[] = [
  { value: "UNICO", label: "Evento unico" },
  { value: "DIARIO", label: "Diario" },
  { value: "SEMANAL", label: "Semanal" },
  { value: "MENSAL", label: "Mensal" },
  { value: "ANUAL", label: "Anual" },
];
const endOptions: {
  value: EndOption;
  label: string;
  description: string;
}[] = [
  {
    value: "flexivel",
    label: "Flexivel",
    description: "Quem acompanhar o evento define o encerramento.",
  },
  {
    value: "sem-fim",
    label: "Sem fim",
    description: "A recorrencia permanece aberta.",
  },
  {
    value: "com-fim",
    label: "Com fim definido",
    description: "Defina uma data ou quantidade de ocorrencias.",
  },
];
const weekdayOptions = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sab" },
  { value: 0, label: "Dom" },
];
const weekdayNames = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

function today() {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
function emptyDraft(): Draft {
  return {
    templateId: null,
    nomeGenerico: "",
    nomePersonalizado: "",
    descricao: "",
    dataInicio: today(),
    horaInicio: "19:00",
    duracaoHoras: "1",
    duracaoMinutos: "0",
    local: "",
    tipoRecorrencia: "UNICO",
    intervalo: "1",
    diasSemana: [],
    opcaoFim: "flexivel",
    dataFimRecorrencia: "",
    maxOcorrencias: "",
    gruposIds: [],
    permitirAddParticipantes: true,
    permitirRemoverParticipantes: true,
    requerJustificativaRemocao: true,
    permitirReatribuicao: true,
    permiteConvidados: true,
    exigeConfirmacao: false,
    limiteParticipantes: "",
  };
}

export function CriarEventoScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const { usuarioId, estruturaId, estruturaNome } = useContextStore();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [picker, setPicker] = useState<Picker>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const allowed = Boolean(
    usuarioId && estruturaId && can("criar", "eventos", { estruturaId }),
  );
  const query = useQuery({
    queryKey: ["evento-criar-base", estruturaId],
    queryFn: async () => {
      const [templates, groups] = await Promise.all([
        eventoTemplatesApi.list(estruturaId!),
        gruposApi.list(estruturaId!, 0, 200),
      ]);
      return { templates, groups: groups.data };
    },
    enabled: allowed,
    retry: false,
  });
  const create = useMutation({
    mutationFn: async () => {
      if (
        !usuarioId ||
        !estruturaId ||
        !can("criar", "eventos", { estruturaId })
      )
        throw new Error("Sem permissao para criar evento neste contexto.");
      const groupIds = draft.gruposIds.filter((id) =>
        query.data?.groups.some((group) => group.id === id),
      );
      if (!groupIds.length) throw new Error("Selecione pelo menos um grupo.");
      const start = `${draft.dataInicio}T${draft.horaInicio}:00`;
      const duration =
        Number(draft.duracaoHoras || 0) * 60 +
        Number(draft.duracaoMinutos || 0);
      if (duration <= 0) throw new Error("A duracao deve ser maior que zero.");
      const end = new Date(`${start}Z`);
      end.setUTCMinutes(end.getUTCMinutes() + duration);
      const endRecurrence =
        draft.opcaoFim === "com-fim" && draft.dataFimRecorrencia
          ? `${draft.dataFimRecorrencia}T${draft.horaInicio}:00`
          : undefined;
      assertOnlineForMutation("Criar evento");
      const conflicts = await eventosApi.conflitos(
        estruturaId,
        groupIds[0],
        start,
        end.toISOString().slice(0, 19),
      );
      if (conflicts.length)
        throw new Error(
          `Conflito de horario com ${conflicts[0].titulo}. Altere a data ou horario.`,
        );
      assertOnlineForMutation("Criar evento");
      return eventosApi.criar({
        usuarioId,
        estruturaId,
        grupoId: groupIds[0],
        gruposIds: groupIds,
        titulo: `${draft.nomeGenerico.trim()}${draft.nomePersonalizado.trim() ? `: ${draft.nomePersonalizado.trim()}` : ""}`,
        descricao: draft.descricao.trim() || undefined,
        dataInicio: start,
        dataFim: end.toISOString().slice(0, 19),
        local: draft.local.trim() || undefined,
        tipoRecorrencia: draft.tipoRecorrencia,
        intervalo:
          draft.tipoRecorrencia === "UNICO"
            ? undefined
            : Number(draft.intervalo),
        diasSemana:
          draft.tipoRecorrencia === "SEMANAL" && draft.diasSemana.length
            ? draft.diasSemana.map((day) => weekdayNames[day])
            : undefined,
        opcaoFim:
          draft.tipoRecorrencia === "UNICO" ? undefined : draft.opcaoFim,
        dataFimRecorrencia: endRecurrence,
        maxOcorrencias:
          draft.opcaoFim === "com-fim" && draft.maxOcorrencias
            ? Number(draft.maxOcorrencias)
            : undefined,
        eventoTemplateId: draft.templateId ?? undefined,
        permitirAddParticipantes: draft.permitirAddParticipantes,
        permitirRemoverParticipantes: draft.permitirRemoverParticipantes,
        requerJustificativaRemocao: draft.requerJustificativaRemocao,
        permitirReatribuicaoResponsavel: draft.permitirReatribuicao,
        permiteConvidados: draft.permiteConvidados,
        exigeConfirmacao: draft.exigeConfirmacao,
        limiteParticipantes: draft.limiteParticipantes
          ? Number(draft.limiteParticipantes)
          : undefined,
      });
    },
    onSuccess: () => {
      setMessage("Evento criado com sucesso.");
      track("confirmation", "evento:criar");
      setTimeout(() => router.replace("/admin/eventos" as never), 700);
    },
    onError: (cause) =>
      setError(
        normalizeApiError(cause, "Nao foi possivel criar o evento.").message,
      ),
  });
  const update = (values: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...values }));
    setError(null);
  };
  const selectTemplate = (template: EventoTemplate | null) => {
    if (!template) {
      update({ templateId: null });
      setPicker(null);
      return;
    }
    const recurrence =
      recurrenceOptions[template.tipoRecorrencia]?.value ?? "UNICO";
    update({
      templateId: template.id,
      nomeGenerico: template.titulo,
      descricao: template.descricao ?? "",
      horaInicio: template.horarioPadrao?.slice(0, 5) ?? draft.horaInicio,
      local: template.localPadrao ?? "",
      tipoRecorrencia: recurrence,
      intervalo: String(template.intervalo || 1),
      opcaoFim: (template.opcaoFim as EndOption) || "flexivel",
      dataFimRecorrencia: template.dataFim?.slice(0, 10) ?? "",
      maxOcorrencias: template.maxOcorrencias
        ? String(template.maxOcorrencias)
        : "",
    });
    setPicker(null);
  };
  const validateStep = () => {
    if (step === 1 && draft.nomeGenerico.trim().length < 3)
      return "Informe um nome base com pelo menos 3 caracteres.";
    if (
      step === 2 &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(draft.dataInicio) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.horaInicio))
    )
      return "Informe data e horario validos.";
    if (
      step === 3 &&
      draft.tipoRecorrencia !== "UNICO" &&
      Number(draft.intervalo) < 1
    )
      return "Informe um intervalo valido.";
    if (
      step === 3 &&
      draft.opcaoFim === "com-fim" &&
      !draft.dataFimRecorrencia &&
      !draft.maxOcorrencias
    )
      return "Informe data final ou maximo de ocorrencias.";
    if (step === 4 && draft.gruposIds.length === 0)
      return "Selecione pelo menos um grupo.";
    return null;
  };
  const next = () => {
    const validation = validateStep();
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    if (step < 4) {
      setStep((value) => value + 1);
      track("simulation", `evento:criar_step_${step}_concluido`);
    } else {
      track("simulation", "evento:criar_submit");
      create.mutate();
    }
  };
  const previous = () => {
    setError(null);
    setStep((value) => Math.max(1, value - 1));
  };
  const selectedTemplate = query.data?.templates.find(
    (template) => template.id === draft.templateId,
  );
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.page, compact && styles.compact]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textBody} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Eventos</Text>
            <Text style={styles.title}>Criar Evento</Text>
            <Text style={styles.subtitle}>
              Configure um evento livre ou use um modelo da estrutura ativa.
            </Text>
            <Text style={styles.scope}>
              Estrutura ativa:{" "}
              <Text style={styles.strong}>
                {estruturaNome ?? "Nao selecionada"}
              </Text>
            </Text>
          </View>
        </View>
        <View style={styles.stepper}>
          <View style={styles.stepTrack}>
            <View style={[styles.stepFill, { width: `${step * 25}%` }]} />
          </View>
          <View style={styles.stepLabels}>
            {[
              "Sobre o evento",
              "Quando e onde",
              "Recorrencia",
              "Grupos e opcoes",
            ].map((label, index) => (
              <View key={label} style={styles.stepLabel}>
                <View
                  style={[
                    styles.stepDot,
                    step >= index + 1 && styles.stepDotActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      step >= index + 1 && styles.stepNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepText,
                    step === index + 1 && styles.stepTextActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {!allowed ? (
          <State message="Voce nao tem permissao para criar eventos neste contexto." />
        ) : null}
        {query.isLoading ? (
          <State message="Carregando grupos e modelos..." loading />
        ) : null}
        {query.isError ? (
          <State
            message={
              normalizeApiError(
                query.error,
                "Nao foi possivel carregar os dados do formulario.",
              ).message
            }
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {message ? (
          <View style={styles.success}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.success}
            />
            <Text style={styles.successText}>{message}</Text>
          </View>
        ) : null}
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        {allowed && query.isSuccess && !message ? (
          <View style={styles.form}>
            {step === 1 ? (
              <StepOne
                draft={draft}
                update={update}
                selectedTemplate={selectedTemplate}
                onTemplate={() => setPicker("template")}
              />
            ) : null}
            {step === 2 ? <StepTwo draft={draft} update={update} /> : null}
            {step === 3 ? (
              <StepThree
                draft={draft}
                update={update}
                onRecurrence={() => setPicker("recurrence")}
                onEnd={() => setPicker("end")}
              />
            ) : null}
            {step === 4 ? (
              <StepFour
                draft={draft}
                update={update}
                groups={query.data.groups}
              />
            ) : null}
            <View style={styles.actions}>
              {step > 1 ? (
                <Pressable style={styles.secondaryButton} onPress={previous}>
                  <Ionicons
                    name="chevron-back"
                    size={17}
                    color={colors.brandBlue}
                  />
                  <Text style={styles.secondaryText}>Voltar</Text>
                </Pressable>
              ) : (
                <View />
              )}
              {
                <Pressable
                  style={styles.primaryButton}
                  onPress={next}
                  disabled={create.isPending}
                >
                  <Ionicons
                    name={step === 4 ? "checkmark" : "chevron-forward"}
                    size={17}
                    color={colors.surfacePrimary}
                  />
                  <Text style={styles.primaryText}>
                    {create.isPending
                      ? "Criando..."
                      : step === 4
                        ? "Criar evento"
                        : "Continuar"}
                  </Text>
                </Pressable>
              }
            </View>
          </View>
        ) : null}
      </ScrollView>
      <OptionModal
        picker={picker}
        onClose={() => setPicker(null)}
        templates={query.data?.templates ?? []}
        draft={draft}
        update={update}
        onTemplate={selectTemplate}
      />
    </SafeAreaView>
  );
}

function StepOne({
  draft,
  update,
  selectedTemplate,
  onTemplate,
}: {
  draft: Draft;
  update: (values: Partial<Draft>) => void;
  selectedTemplate?: EventoTemplate;
  onTemplate: () => void;
}) {
  return (
    <Section
      title="Sobre o evento"
      description="Defina a identidade do evento e, se desejar, aproveite um modelo existente."
    >
      <Field label="Modelo de evento">
        <SelectButton
          label={selectedTemplate?.titulo ?? "Evento livre (sem modelo)"}
          onPress={onTemplate}
        />
      </Field>
      <Field label="Nome base *">
        <TextInput
          accessibilityLabel="Nome base"
          placeholder="Ex.: Celula"
          value={draft.nomeGenerico}
          onChangeText={(value) => update({ nomeGenerico: value })}
          style={styles.input}
        />
      </Field>
      <Field label="Apelido do evento">
        <TextInput
          accessibilityLabel="Apelido do evento"
          placeholder="Opcional"
          value={draft.nomePersonalizado}
          onChangeText={(value) => update({ nomePersonalizado: value })}
          style={styles.input}
        />
      </Field>
      <Field label="Descricao">
        <TextInput
          accessibilityLabel="Descricao do evento"
          placeholder="Proposito e contexto do evento"
          value={draft.descricao}
          onChangeText={(value) => update({ descricao: value })}
          multiline
          style={[styles.input, styles.textArea]}
        />
      </Field>
    </Section>
  );
}
function StepTwo({
  draft,
  update,
}: {
  draft: Draft;
  update: (values: Partial<Draft>) => void;
}) {
  const endTime = useMemo(() => {
    const start = new Date(`${draft.dataInicio}T${draft.horaInicio}:00Z`);
    start.setUTCMinutes(
      start.getUTCMinutes() +
        Number(draft.duracaoHoras || 0) * 60 +
        Number(draft.duracaoMinutos || 0),
    );
    return Number.isNaN(start.getTime())
      ? "--:--"
      : `${String(start.getUTCHours()).padStart(2, "0")}:${String(start.getUTCMinutes()).padStart(2, "0")}`;
  }, [
    draft.dataInicio,
    draft.horaInicio,
    draft.duracaoHoras,
    draft.duracaoMinutos,
  ]);
  return (
    <Section
      title="Quando e onde"
      description="O horario de termino e calculado a partir da duracao informada."
    >
      <View style={styles.twoColumns}>
        <Field label="Data de inicio *">
          <TextInput
            accessibilityLabel="Data de inicio"
            placeholder="AAAA-MM-DD"
            value={draft.dataInicio}
            onChangeText={(value) => update({ dataInicio: value })}
            style={styles.input}
          />
        </Field>
        <Field label="Hora de inicio *">
          <TextInput
            accessibilityLabel="Hora de inicio"
            placeholder="HH:mm"
            value={draft.horaInicio}
            onChangeText={(value) => update({ horaInicio: value })}
            style={styles.input}
          />
        </Field>
      </View>
      <View style={styles.twoColumns}>
        <Field label="Horas">
          <TextInput
            keyboardType="numeric"
            value={draft.duracaoHoras}
            onChangeText={(value) => update({ duracaoHoras: value })}
            style={styles.input}
          />
        </Field>
        <Field label="Minutos">
          <TextInput
            keyboardType="numeric"
            value={draft.duracaoMinutos}
            onChangeText={(value) => update({ duracaoMinutos: value })}
            style={styles.input}
          />
        </Field>
        <View style={styles.endTime}>
          <Text style={styles.label}>Termino</Text>
          <Text style={styles.endTimeText}>{endTime}</Text>
        </View>
      </View>
      <Field label="Local / endereco">
        <TextInput
          accessibilityLabel="Local"
          placeholder="Ex.: Sala principal"
          value={draft.local}
          onChangeText={(value) => update({ local: value })}
          style={styles.input}
        />
      </Field>
    </Section>
  );
}
function StepThree({
  draft,
  update,
  onRecurrence,
  onEnd,
}: {
  draft: Draft;
  update: (values: Partial<Draft>) => void;
  onRecurrence: () => void;
  onEnd: () => void;
}) {
  return (
    <Section
      title="Recorrencia"
      description="Defina se este evento acontece uma vez ou se deve gerar novos ciclos."
    >
      <Field label="Tipo de recorrencia">
        <SelectButton
          label={
            recurrenceOptions.find(
              (item) => item.value === draft.tipoRecorrencia,
            )?.label ?? draft.tipoRecorrencia
          }
          onPress={onRecurrence}
        />
      </Field>
      {draft.tipoRecorrencia !== "UNICO" ? (
        <>
          <Field label="Intervalo">
            <TextInput
              keyboardType="numeric"
              value={draft.intervalo}
              onChangeText={(value) => update({ intervalo: value })}
              style={styles.input}
            />
            <Text style={styles.hint}>
              A cada quantos periodos o evento se repete.
            </Text>
          </Field>
          {draft.tipoRecorrencia === "SEMANAL" ? (
            <Field label="Dias da semana">
              <View style={styles.days}>
                {weekdayOptions.map((day) => (
                  <Pressable
                    key={day.value}
                    style={[
                      styles.day,
                      draft.diasSemana.includes(day.value) && styles.dayActive,
                    ]}
                    onPress={() =>
                      update({
                        diasSemana: draft.diasSemana.includes(day.value)
                          ? draft.diasSemana.filter(
                              (value) => value !== day.value,
                            )
                          : [...draft.diasSemana, day.value],
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.dayText,
                        draft.diasSemana.includes(day.value) &&
                          styles.dayTextActive,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Field>
          ) : null}
          <Field label="Fim da recorrencia">
            <SelectButton
              label={
                endOptions.find((item) => item.value === draft.opcaoFim)
                  ?.label ?? draft.opcaoFim
              }
              onPress={onEnd}
            />
          </Field>
          {draft.opcaoFim === "com-fim" ? (
            <View style={styles.twoColumns}>
              <Field label="Data final">
                <TextInput
                  accessibilityLabel="Data final da recorrencia"
                  placeholder="AAAA-MM-DD"
                  value={draft.dataFimRecorrencia}
                  onChangeText={(value) =>
                    update({ dataFimRecorrencia: value })
                  }
                  style={styles.input}
                />
              </Field>
              <Field label="Maximo de ocorrencias">
                <TextInput
                  keyboardType="numeric"
                  value={draft.maxOcorrencias}
                  onChangeText={(value) => update({ maxOcorrencias: value })}
                  style={styles.input}
                />
              </Field>
            </View>
          ) : null}
        </>
      ) : (
        <Text style={styles.hint}>Evento unico nao gera recorrencia.</Text>
      )}
    </Section>
  );
}
function StepFour({
  draft,
  update,
  groups,
}: {
  draft: Draft;
  update: (values: Partial<Draft>) => void;
  groups: GrupoDto[];
}) {
  return (
    <Section
      title="Grupos e opcoes"
      description="Escolha onde o evento sera criado e configure as permissoes da instancia."
    >
      <Field label="Grupos *">
        <Text style={styles.hint}>
          {draft.gruposIds.length
            ? `${draft.gruposIds.length} grupo(s) selecionado(s)`
            : "Selecione pelo menos um grupo."}
        </Text>
        {groups.map((group) => (
          <CheckRow
            key={group.id}
            label={group.nome}
            checked={draft.gruposIds.includes(group.id)}
            onPress={() =>
              update({
                gruposIds: draft.gruposIds.includes(group.id)
                  ? draft.gruposIds.filter((id) => id !== group.id)
                  : [...draft.gruposIds, group.id],
              })
            }
          />
        ))}
      </Field>
      <View style={styles.optionsBlock}>
        <Text style={styles.optionsTitle}>Permissoes ao iniciar</Text>
        <Toggle
          label="Permitir adicionar participantes"
          value={draft.permitirAddParticipantes}
          onChange={(value) => update({ permitirAddParticipantes: value })}
        />
        <Toggle
          label="Permitir remover participantes"
          value={draft.permitirRemoverParticipantes}
          onChange={(value) => update({ permitirRemoverParticipantes: value })}
        />
        <Toggle
          label="Exigir justificativa para remocao"
          value={draft.requerJustificativaRemocao}
          onChange={(value) => update({ requerJustificativaRemocao: value })}
        />
        <Toggle
          label="Permitir reatribuicao de responsavel"
          value={draft.permitirReatribuicao}
          onChange={(value) => update({ permitirReatribuicao: value })}
        />
      </View>
      <View style={styles.optionsBlock}>
        <Text style={styles.optionsTitle}>Configuracoes adicionais</Text>
        <Toggle
          label="Permitir convidados"
          value={draft.permiteConvidados}
          onChange={(value) => update({ permiteConvidados: value })}
        />
        <Toggle
          label="Exigir confirmacao de presenca"
          value={draft.exigeConfirmacao}
          onChange={(value) => update({ exigeConfirmacao: value })}
        />
        <Field label="Limite de participantes">
          <TextInput
            keyboardType="numeric"
            placeholder="Sem limite"
            value={draft.limiteParticipantes}
            onChangeText={(value) => update({ limiteParticipantes: value })}
            style={styles.input}
          />
        </Field>
      </View>
    </Section>
  );
}
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
      {children}
    </View>
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
function CheckRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={onPress}>
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
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggle}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderDefault, true: "#A7C7FF" }}
        thumbColor={value ? colors.brandBlue : colors.surfacePrimary}
      />
    </View>
  );
}
function OptionModal({
  picker,
  onClose,
  templates,
  draft,
  update,
  onTemplate,
}: {
  picker: Picker;
  onClose: () => void;
  templates: EventoTemplate[];
  draft: Draft;
  update: (values: Partial<Draft>) => void;
  onTemplate: (template: EventoTemplate | null) => void;
}) {
  if (!picker) return null;
  const options =
    picker === "template"
      ? [
          { value: null, label: "Evento livre (sem modelo)" },
          ...templates.map((template) => ({
            value: template,
            label: template.titulo,
          })),
        ]
      : picker === "recurrence"
        ? recurrenceOptions.map((item) => ({
            value: item.value,
            label: item.label,
          }))
        : endOptions.map((item) => ({
            value: item.value,
            label: item.label,
            description: item.description,
          }));
  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalLayer}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modal}>
          <Text style={styles.sectionTitle}>Selecionar</Text>
          <ScrollView>
            {options.map((option) => (
              <Pressable
                key={String(option.value ?? "free")}
                style={styles.modalOption}
                onPress={() => {
                  if (picker === "template")
                    onTemplate(option.value as EventoTemplate | null);
                  else if (picker === "recurrence")
                    update({ tipoRecorrencia: option.value as Recurrence });
                  else update({ opcaoFim: option.value as EndOption });
                  onClose();
                }}
              >
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalText}>{option.label}</Text>
                  {"description" in option && option.description ? (
                    <Text style={styles.hint}>{option.description}</Text>
                  ) : null}
                </View>
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
        <Ionicons
          name="alert-circle-outline"
          size={26}
          color={colors.textMuted}
        />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  page: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  compact: { padding: spacing.md, gap: spacing.md },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingBottom: spacing.md,
  },
  back: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
  },
  headerText: { flex: 1, gap: spacing.xs },
  eyebrow: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: { ...typography.h1, color: colors.textHeading },
  subtitle: { ...typography.body, color: colors.textSecondary },
  scope: { ...typography.caption, color: colors.textMuted },
  strong: { color: colors.textHeading, fontWeight: "700" },
  stepper: { gap: spacing.sm },
  stepTrack: { height: 4, backgroundColor: colors.borderSubtle },
  stepFill: { height: 4, backgroundColor: colors.brandBlue },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  stepLabel: { flex: 1, alignItems: "center", gap: spacing.xs },
  stepDot: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
  },
  stepDotActive: {
    borderColor: colors.brandBlue,
    backgroundColor: colors.brandBlue,
  },
  stepNumber: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
  },
  stepNumberActive: { color: colors.surfacePrimary },
  stepText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  stepTextActive: { color: colors.brandBlue, fontWeight: "700" },
  form: { gap: spacing.md },
  section: {
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.lg,
  },
  sectionTitle: { ...typography.h3, color: colors.textHeading },
  sectionDescription: { ...typography.bodySmall, color: colors.textSecondary },
  field: { gap: spacing.xs },
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
    paddingHorizontal: spacing.sm,
    color: colors.textBody,
    backgroundColor: colors.surfacePrimary,
  },
  textArea: { minHeight: 88, paddingTop: spacing.sm, textAlignVertical: "top" },
  hint: { ...typography.caption, color: colors.textMuted },
  select: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  selectText: { ...typography.bodySmall, color: colors.textBody, flex: 1 },
  twoColumns: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  endTime: {
    flexGrow: 1,
    minWidth: 100,
    justifyContent: "center",
    gap: spacing.xs,
  },
  endTimeText: {
    ...typography.body,
    color: colors.brandBlue,
    fontWeight: "700",
  },
  days: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  day: {
    width: 44,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
  },
  dayActive: { borderColor: colors.brandBlue, backgroundColor: "#EAF2FF" },
  dayText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  dayTextActive: { color: colors.brandBlue },
  checkRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  checkText: { ...typography.bodySmall, color: colors.textBody },
  optionsBlock: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  optionsTitle: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: "700",
  },
  toggle: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  primaryButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.lg,
  },
  primaryText: {
    ...typography.bodySmall,
    color: colors.surfacePrimary,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
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
    backgroundColor: colors.surfacePrimary,
    padding: spacing.xl,
  },
  stateText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },
  success: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
    padding: spacing.md,
  },
  successText: { ...typography.bodySmall, color: "#047857", fontWeight: "700" },
  error: { ...typography.bodySmall, color: colors.error },
  link: { ...typography.caption, color: colors.brandBlue, fontWeight: "700" },
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
  modal: {
    width: "100%",
    maxWidth: 540,
    maxHeight: "80%",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
  },
  modalOption: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  modalOptionText: { flex: 1, gap: 2 },
  modalText: {
    ...typography.bodySmall,
    color: colors.textBody,
    fontWeight: "700",
  },
});
