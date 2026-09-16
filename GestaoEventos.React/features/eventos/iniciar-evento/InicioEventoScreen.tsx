import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { layoutMetrics } from '../../../shared/theme';
import { useContextStore } from '../../../stores/context.store';
import { normalizeApiError } from '../../../services/api/api-error';
import { toCamelCase } from '../../../services/api/case-conversion';
import { track } from '../../../services/analytics/analytics.service';
import type { EventoTemplate } from '../../../services/api/evento-templates-api';
import { inicioSchema, defaultsForTemplate, recurrenceNames, weekdayOptions, type InicioValues } from './inicio.schema';
import { useInicioEvento } from './useInicioEvento';

const emptyValues: InicioValues = {
  titulo: '', grupoId: 0, dia: '', dataInicio: '', hora: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', local: '', dataFim: '', semFim: false, exigeConfirmacao: false,
};

export function InicioEventoScreen() {
  const { usuarioId, estruturaId, grupoId } = useContextStore();
  return <InicioContent key={`${usuarioId}:${estruturaId}:${grupoId}`} />;
}

function InicioContent() {
  const state = useInicioEvento();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const [template, setTemplate] = useState<EventoTemplate | null>(null);
  const [configStep, setConfigStep] = useState(1);
  const [groupMenu, setGroupMenu] = useState(false);
  const form = useForm<InicioValues>({ resolver: zodResolver(inicioSchema), defaultValues: emptyValues });
  const submitting = useRef(false);
  const busy = state.mutation.isPending || state.mutation.isSuccess;
  const semFim = useWatch({ control: form.control, name: 'semFim' });
  const groupId = useWatch({ control: form.control, name: 'grupoId' });
  const selectedDay = useWatch({ control: form.control, name: 'dia' });

  const selectTemplate = (item: EventoTemplate) => {
    track('entrance', 'btn:iniciar_evento_template');
    state.mutation.reset();
    setTemplate(item);
    setConfigStep(1);
    setGroupMenu(false);
    const selected = state.grupos.find((g) => g.id === state.grupoId);
    form.reset(defaultsForTemplate(item, selected?.id ?? (state.grupos.length === 1 ? state.grupos[0].id : 0)));
  };

  const backToTemplates = () => {
    if (busy) return;
    setTemplate(null);
    setConfigStep(1);
    setGroupMenu(false);
    form.reset(emptyValues);
  };

  const nextStep = async () => {
    const fields: (keyof InicioValues)[] = configStep === 1 ? ['titulo', 'dia', 'hora'] : configStep === 2 ? ['grupoId'] : ['dataInicio', 'dataFim'];
    if (await form.trigger(fields)) setConfigStep((value) => Math.min(3, value + 1));
  };

  const submit = async (values: InicioValues) => {
    if (!template || busy || submitting.current) return;
    submitting.current = true;
    form.clearErrors();
    try {
      const result = await state.mutation.mutateAsync({ values, template });
      const current = useContextStore.getState();
      if (current.estruturaId !== state.estruturaId || current.grupoId !== state.grupoId || current.usuarioId !== state.usuarioId) return;
      if (!result.warning) router.replace(`/admin/eventos/acompanhar/${result.eventoId}?data=${result.data}` as Href);
    } catch (error) {
      const normalized = normalizeApiError(error, 'Nao foi possivel iniciar o evento.');
      const body = toCamelCase<{ errors?: Record<string, string[]> | { identifier?: string; errorMessage?: string }[] }>(normalized.raw);
      const aliases: Record<string, keyof InicioValues> = { grupoId: 'grupoId', titulo: 'titulo', dia: 'dia', dataInicio: 'dataInicio', dataFim: 'dataFim', dataFimRecorrencia: 'dataFim', local: 'local' };
      const errors = body?.errors;
      const entries = Array.isArray(errors) ? errors.map((e) => [e.identifier, e.errorMessage]) : Object.entries(errors ?? {}).map(([key, value]) => [key, value[0]]);
      for (const [key, message] of entries) {
        const field = key ? aliases[key[0].toLowerCase() + key.slice(1)] : undefined;
        if (field && message) form.setError(field, { message });
      }
    } finally {
      submitting.current = false;
    }
  };

  const field = (name: keyof Pick<InicioValues, 'titulo' | 'dataInicio' | 'hora' | 'local' | 'dataFim' | 'cep' | 'logradouro' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado'>, label: string, editable = true, placeholder?: string) => (
    <Controller control={form.control} name={name} render={({ field: input, fieldState }) => (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        {editable ? <TextInput accessibilityLabel={label} value={input.value} onChangeText={input.onChange} onBlur={input.onBlur} editable={!busy} placeholder={placeholder} style={styles.input} /> : <View style={styles.lockedValue}><Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} /><Text style={styles.readonly}>{input.value || 'Nao definido'}</Text></View>}
        {fieldState.error && <Text accessibilityRole="alert" style={styles.error}>{fieldState.error.message}</Text>}
      </View>
    )} />
  );

  const address = template?.permitirConfigurarLocal ? <View style={styles.addressBox}>
    <View style={styles.sectionLabel}><Ionicons name="location-outline" size={16} color={colors.brandBlue} /><Text style={styles.sectionLabelText}>Local / Endereco</Text></View>
    <View style={styles.row}>{field('cep', 'CEP', true, '00000-000')}{field('numero', 'Numero', true, '123')}</View>
    {field('logradouro', 'Logradouro', true, 'Rua, avenida ou sala')}
    <View style={styles.row}>{field('complemento', 'Complemento', true, 'Apto, sala...')}{field('bairro', 'Bairro', true, 'Bairro')}</View>
    <View style={styles.row}>{field('cidade', 'Cidade', true, 'Cidade')}{field('estado', 'UF', true, 'SP')}</View>
  </View> : <View style={styles.addressBox}><View style={styles.sectionLabel}><Ionicons name="location-outline" size={16} color={colors.textMuted} /><Text style={styles.sectionLabelText}>Local / Endereco · Bloqueado pelo administrador</Text></View>{field('local', 'Local', false)}</View>;

  return <ScrollView contentContainerStyle={[styles.page, compact && styles.pageCompact]} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><View style={styles.headerText}><Text style={styles.eyebrow}>{template ? 'Configurar evento' : 'Novo evento'}</Text><Text style={styles.title}>{template ? template.titulo : 'Iniciar Evento'}</Text><Text style={styles.subtitle}>{template ? 'Preencha apenas as configuracoes permitidas pelo administrador.' : 'Escolha um modelo e crie uma nova ocorrencia para seu grupo.'}</Text></View></View>
    {!state.allowed ? <Text style={styles.error}>Voce nao tem permissao para criar eventos neste contexto.</Text> : null}
    {state.query.isLoading ? <View style={styles.state}><ActivityIndicator accessibilityLabel="Carregando modelos" /><Text style={styles.secondary}>Carregando tipos de evento...</Text></View> : null}
    {state.query.isError ? <View style={styles.state}><Text style={styles.error}>{normalizeApiError(state.query.error, 'Erro ao carregar modelos.').message}</Text><Command label="Tentar novamente" icon="refresh" onPress={() => void state.query.refetch()} /></View> : null}
    {state.query.isSuccess && !state.query.data.templates.length ? <View style={styles.empty}><Ionicons name="file-tray-outline" size={34} color={colors.textMuted} /><Text style={styles.heading}>Nenhum tipo de evento disponivel</Text><Text style={styles.secondary}>Crie ou publique um modelo antes de iniciar uma ocorrencia.</Text></View> : null}
    {!template && state.query.data?.templates.length ? <View style={styles.selection}>
      {compact ? <View style={styles.flowIntro}><FlowStep active>1. Escolha o tipo</FlowStep><FlowStep>2. Configure</FlowStep><FlowStep>3. Inicie</FlowStep></View> : null}
      {state.query.data.templates.map((item) => <View key={item.id} style={styles.templateCard}>
        <View style={styles.templateMain}><View style={styles.cardIcon}><Ionicons name="calendar-outline" size={22} color={colors.brandBlue} /></View><View style={styles.templateCopy}><Text style={styles.heading}>{item.titulo}</Text><Text style={styles.secondary}>{item.descricao || 'Modelo pronto para uma nova ocorrencia.'}</Text><View style={styles.badges}><Badge text={recurrenceNames[item.tipoRecorrencia]} /><Badge text={item.status} /></View></View></View>
        <Text style={styles.templateSchedule}>{item.horarioPadrao?.slice(0, 5) || 'Horario a definir'}{item.localPadrao ? ` · ${item.localPadrao}` : ''}</Text>
        <Command label="Criar evento" icon="play" variant="primary" onPress={() => selectTemplate(item)} />
      </View>)}
    </View> : null}
    {template ? <View style={styles.configuration}>
      <Command label="Voltar aos modelos" icon="arrow-back" variant="quiet" disabled={busy} onPress={backToTemplates} />
      {compact ? <View style={styles.stepper}><View style={styles.stepperHead}><Text style={styles.stepperLabel}>Etapa {configStep} de 3</Text><Text style={styles.stepperPercent}>{Math.round((configStep / 3) * 100)}%</Text></View><View style={styles.stepperTrack}><View style={[styles.stepperFill, { width: `${(configStep / 3) * 100}%` }]} /></View></View> : null}
      <View style={styles.templateInfo}><Text style={styles.infoTitle}>Informacoes do tipo</Text><View style={styles.infoGrid}><Info label="Recorrencia" value={recurrenceNames[template.tipoRecorrencia]} /><Info label="Duracao" value={`${template.duracaoPadraoMinutos || 60} minutos`} /><Info label="Descricao" value={template.descricao || 'Sem descricao'} /></View></View>
      <View style={styles.formSection}><Text style={styles.sectionTitle}><Ionicons name="options-outline" size={18} color={colors.brandBlue} /> Configuracoes</Text><Text style={styles.sectionDescription}>Configure apenas o que foi permitido pelo administrador.</Text>
        {(!compact || configStep === 1) ? <View style={styles.stepSection}><Text style={styles.mobileStepTitle}>1. Dados principais</Text>{field('titulo', 'Titulo do evento', template.permitirRenomear, 'Ex.: Encontro da turma')}{!template.permitirRenomear ? <Text style={styles.help}>O administrador nao permitiu renomear este evento.</Text> : null}<View style={styles.field}><Text style={styles.label}>Dia da semana{!template.permitirConfigurarDia ? ' · Bloqueado' : ''}</Text>{template.permitirConfigurarDia ? <View style={styles.dayOptions}>{weekdayOptions.map((item) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: item.value === selectedDay }} key={item.value} style={[styles.dayOption, item.value === selectedDay && styles.dayOptionSelected]} onPress={() => form.setValue('dia', item.value, { shouldValidate: true })}><Text style={[styles.dayOptionText, item.value === selectedDay && styles.dayOptionTextSelected]}>{item.label.slice(0, 3)}</Text></Pressable>)}</View> : <View style={styles.lockedValue}><Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} /><Text style={styles.readonly}>{weekdayOptions.find((item) => item.value === selectedDay)?.label || 'Definido pelo modelo'}</Text></View>}</View>{field('hora', 'Horario', template.permitirConfigurarHora, 'HH:mm')}{!template.permitirConfigurarHora ? <Text style={styles.help}>O administrador nao permitiu configurar o horario.</Text> : null}{address}</View> : null}
        {(!compact || configStep === 2) ? <View style={styles.stepSection}><Text style={styles.mobileStepTitle}>2. Destino e confirmacao</Text><View style={styles.field}><Text style={styles.label}>Grupo de destino</Text><Command label={state.grupos.find((g) => g.id === groupId)?.nome ?? 'Selecione um grupo'} icon="chevron-down" variant="outline" disabled={busy} onPress={() => setGroupMenu((value) => !value)} />{groupMenu ? <View style={styles.groupMenu}>{state.grupos.map((g) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: g.id === groupId }} key={g.id} style={styles.option} onPress={() => { form.setValue('grupoId', g.id, { shouldValidate: true }); setGroupMenu(false); }}><Ionicons name={g.id === groupId ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.brandBlue} /><Text style={styles.optionText}>{g.nome}</Text></Pressable>)}</View> : null}{state.grupos.length === 1 ? <Text style={styles.help}>O unico grupo permitido foi preenchido automaticamente.</Text> : <Text style={styles.help}>Escolha em qual grupo esta ocorrencia sera executada.</Text>}{!state.grupos.length ? <Text style={styles.error}>Voce tem acesso ao modelo, mas nao possui grupo permitido para iniciar este evento.</Text> : null}{form.formState.errors.grupoId ? <Text style={styles.error}>{form.formState.errors.grupoId.message}</Text> : null}</View><Controller control={form.control} name="exigeConfirmacao" render={({ field: input }) => <View style={styles.toggle}><View style={styles.toggleCopy}><Text style={styles.optionText}>Exigir confirmacao do responsavel</Text><Text style={styles.help}>O responsavel do grupo devera confirmar a execucao.</Text></View><Switch accessibilityLabel="Exigir confirmacao do responsavel" value={input.value} onValueChange={input.onChange} disabled={busy} /></View>} /></View> : null}
        {(!compact || configStep === 3) ? <View style={styles.stepSection}><Text style={styles.mobileStepTitle}>3. Periodo</Text>{field('dataInicio', 'Data de inicio', true, 'AAAA-MM-DD')}{template.tipoRecorrencia !== 0 ? <><Controller control={form.control} name="semFim" render={({ field: input }) => <View style={styles.toggle}><View style={styles.toggleCopy}><Text style={styles.optionText}>Sem data de termino</Text><Text style={styles.help}>{normalizeEndOption(template.opcaoFim) === 'sem-fim' ? 'Este tipo de evento e fixo como sem fim.' : normalizeEndOption(template.opcaoFim) === 'com-fim' ? 'Este tipo de evento exige data de termino.' : 'Marque se a recorrencia nao tem termino definido.'}</Text></View><Switch accessibilityLabel="Sem data de termino" value={input.value} onValueChange={input.onChange} disabled={busy || normalizeEndOption(template.opcaoFim) !== 'flexivel'} /></View>} />{!semFim ? field('dataFim', 'Data de termino', true, 'AAAA-MM-DD') : null}</> : <Text style={styles.help}>Evento unico: a data de inicio define a ocorrencia.</Text>}</View> : null}
      </View>
      {state.mutation.isError ? <Text accessibilityRole="alert" style={styles.error}>{normalizeApiError(state.mutation.error, 'Erro ao iniciar evento.').message}</Text> : null}
      {state.mutation.data?.warning ? <View style={styles.warning}><Text style={styles.warningText}>{state.mutation.data.warning}</Text><Command label="Meus Eventos" icon="calendar-outline" onPress={() => router.replace('/admin/eventos/meus' as Href)} /></View> : null}
      {!state.mutation.data?.warning ? <View style={styles.actions}><Command label={compact && configStep > 1 ? 'Etapa anterior' : 'Cancelar'} icon={compact && configStep > 1 ? 'arrow-back' : 'close'} onPress={() => compact && configStep > 1 ? setConfigStep((value) => value - 1) : backToTemplates} disabled={busy} />{compact && configStep < 3 ? <Command label="Proxima etapa" icon="arrow-forward" variant="primary" onPress={() => void nextStep()} disabled={busy} /> : <Command label={state.mutation.isPending ? 'Iniciando...' : 'Iniciar Evento'} icon="checkmark" variant="primary" disabled={busy || !state.allowed || !state.grupos.length} onPress={() => void form.handleSubmit(submit)()} />}</View> : null}
    </View> : null}
  </ScrollView>;
}

function FlowStep({ children, active = false }: { children: string; active?: boolean }) { return <Text style={[styles.flowStep, active && styles.flowStepActive]}>{children}</Text>; }
function Badge({ text }: { text: string }) { return <Text style={styles.badge}>{text}</Text>; }
function Info({ label, value }: { label: string; value: string }) { return <View style={styles.infoItem}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
function normalizeEndOption(value?: string | null) { const normalized = String(value ?? '').trim().toLowerCase(); return normalized === 'sem-fim' || normalized === 'com-fim' ? normalized : 'flexivel'; }
function Command({ label, icon, variant = 'outline', onPress, disabled = false }: { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; variant?: 'primary' | 'outline' | 'quiet'; onPress: () => void; disabled?: boolean }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.command, variant === 'primary' && styles.commandPrimary, variant === 'quiet' && styles.commandQuiet, disabled && styles.commandDisabled]}><Ionicons name={icon} size={18} color={variant === 'primary' ? colors.surfacePrimary : colors.brandBlue} /><Text style={[styles.commandText, variant === 'primary' && styles.commandTextPrimary]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  page: { padding: spacing.lg, gap: spacing.lg, width: '100%', maxWidth: 1100, alignSelf: 'center', backgroundColor: colors.surfacePage }, pageCompact: { padding: spacing.md, gap: spacing.md }, header: { flexDirection: 'row', gap: spacing.md }, headerText: { flex: 1, minWidth: 0, gap: spacing.xs }, eyebrow: { ...typography.caption, color: colors.brandBlue, fontWeight: '700', textTransform: 'uppercase' }, title: { ...typography.h1, color: colors.textHeading }, subtitle: { ...typography.body, color: colors.textSecondary }, heading: { ...typography.h3, color: colors.textHeading }, secondary: { ...typography.bodySmall, color: colors.textSecondary }, state: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl }, empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary }, selection: { gap: spacing.md }, flowIntro: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, flowStep: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.full, color: colors.textMuted, fontSize: 12, fontWeight: '600' }, flowStepActive: { color: colors.brandBlue, borderColor: '#93C5FD', backgroundColor: '#EFF6FF' }, templateCard: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }, templateMain: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }, cardIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: '#EFF6FF' }, templateCopy: { flex: 1, minWidth: 0, gap: spacing.xs }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.full, backgroundColor: '#EFF6FF', color: colors.brandBlue, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }, templateSchedule: { color: colors.textMuted, ...typography.bodySmall }, configuration: { gap: spacing.md, width: '100%', maxWidth: 760 }, stepper: { gap: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: '#DBEAFE', borderRadius: radius.sm, backgroundColor: '#EFF6FF' }, stepperHead: { flexDirection: 'row', justifyContent: 'space-between' }, stepperLabel: { color: '#0052CC', fontWeight: '700', fontSize: 13 }, stepperPercent: { color: colors.brandBlue, fontWeight: '700', fontSize: 12 }, stepperTrack: { height: 7, borderRadius: radius.full, backgroundColor: '#DBEAFE', overflow: 'hidden' }, stepperFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.brandBlue }, templateInfo: { gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: radius.md, backgroundColor: '#EFF6FF' }, infoTitle: { color: '#0052CC', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' }, infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, infoItem: { flexGrow: 1, flexBasis: 140, gap: 2 }, infoLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }, infoValue: { color: colors.textBody, fontSize: 14 }, formSection: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary }, sectionTitle: { color: colors.textHeading, fontSize: 17, fontWeight: '700' }, sectionDescription: { color: colors.textMuted, ...typography.bodySmall }, stepSection: { gap: spacing.md }, mobileStepTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' }, field: { flex: 1, minWidth: 0, gap: 6 }, label: { ...typography.bodySmall, fontWeight: '600', color: colors.textHeading }, input: { minHeight: 46, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, color: colors.textBody, fontSize: 16 }, lockedValue: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, backgroundColor: colors.surfaceMuted, borderRadius: radius.sm }, readonly: { ...typography.bodySmall, color: colors.textBody }, help: { ...typography.caption, color: colors.textMuted }, error: { color: colors.error, ...typography.bodySmall }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }, addressBox: { gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: '#FCFDFE' }, sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }, sectionLabelText: { color: colors.brandBlue, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }, dayOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, dayOption: { minWidth: 44, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary }, dayOptionSelected: { borderColor: colors.brandBlue, backgroundColor: '#EFF6FF' }, dayOptionText: { color: colors.textMuted, fontWeight: '600', fontSize: 12 }, dayOptionTextSelected: { color: colors.brandBlue }, groupMenu: { gap: spacing.xs, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary }, option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm }, optionText: { flex: 1, ...typography.bodySmall, color: colors.textBody }, toggle: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted }, toggleCopy: { flex: 1, gap: 2 }, warning: { gap: spacing.sm, padding: spacing.md, borderWidth: 1, borderColor: '#FCD34D', borderRadius: radius.sm, backgroundColor: '#FFFBEB' }, warningText: { color: '#92400E', ...typography.bodySmall }, actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: spacing.sm }, command: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: spacing.md }, commandPrimary: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue }, commandQuiet: { alignSelf: 'flex-start', borderColor: 'transparent', paddingHorizontal: 0 }, commandDisabled: { opacity: 0.5 }, commandText: { flexShrink: 1, color: colors.brandBlue, ...typography.bodySmall, fontWeight: '700' }, commandTextPrimary: { color: colors.surfacePrimary },
});
