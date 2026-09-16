import { z } from 'zod';
import { RRule } from 'rrule';
import type { EventoTemplate } from '../../../services/api/evento-templates-api';

export const recurrenceNames = ['Unico', 'Diario', 'Semanal', 'Mensal', 'Anual'];
const weekdays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const dateSchema = z.string().refine(isCalendarDate, 'Informe uma data valida (AAAA-MM-DD).');
export const inicioSchema = z.object({
  titulo: z.string().trim().min(3, 'Informe ao menos 3 caracteres.').max(255),
  grupoId: z.number().int().positive('Selecione um grupo.'),
  dia: z.string().default(''),
  dataInicio: dateSchema,
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe o horario HH:mm.'),
  cep: z.string().max(20).default(''), logradouro: z.string().max(255).default(''), numero: z.string().max(30).default(''),
  complemento: z.string().max(255).default(''), bairro: z.string().max(120).default(''), cidade: z.string().max(120).default(''), estado: z.string().max(2).default(''),
  local: z.string().max(500),
  dataFim: z.string(), semFim: z.boolean(), exigeConfirmacao: z.boolean(),
}).superRefine((value, ctx) => {
  if (!value.semFim && (!isCalendarDate(value.dataFim) || value.dataFim < value.dataInicio)) {
    ctx.addIssue({ code: 'custom', path: ['dataFim'], message: 'Informe um termino igual ou posterior ao inicio.' });
  }
});
export type InicioValues = z.infer<typeof inicioSchema>;
export type InicioScope = { usuarioId: number; estruturaId: number };

export const weekdayOptions = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terca-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sabado' },
  { value: 'domingo', label: 'Domingo' },
];

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function defaultsForTemplate(template: EventoTemplate, grupoId: number): InicioValues {
  const now = new Date();
  const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const date = new Date(`${localToday}T00:00:00Z`);
  const configuredDay = normalizeWeekday(template.diasSemana?.[0]);
  const day = weekdays.indexOf(configuredDay ?? '');
  if (day >= 0) date.setUTCDate(date.getUTCDate() + (day - date.getUTCDay() + 7) % 7);
  const selectedDay = weekdays[date.getUTCDay()];
  return {
    titulo: template.permitirRenomear ? '' : template.titulo, grupoId, dia: configuredDay ?? selectedDay, dataInicio: date.toISOString().slice(0, 10),
    hora: template.horarioPadrao?.slice(0, 5) ?? '00:00', local: template.localPadrao ?? '',
    cep: template.cep ?? '', logradouro: template.logradouro ?? '', numero: template.numero ?? '',
    complemento: template.complemento ?? '', bairro: template.bairro ?? '', cidade: template.cidade ?? '', estado: template.estado ?? '',
    dataFim: template.dataFim?.slice(0, 10) ?? '',
    semFim: template.tipoRecorrencia === 0 || normalizeEndOption(template.opcaoFim) === 'sem-fim', exigeConfirmacao: false,
  };
}

export function buildInicioPayload(input: InicioValues, template: EventoTemplate, scope: InicioScope) {
  if (scope.estruturaId !== template.estruturaId || scope.usuarioId <= 0) throw new Error('Contexto do modelo invalido.');
  const values = inicioSchema.parse({ ...input,
    titulo: template.permitirRenomear ? input.titulo : template.titulo,
    hora: template.permitirConfigurarHora ? input.hora : template.horarioPadrao?.slice(0, 5) ?? '00:00',
    local: template.permitirConfigurarLocal ? composeAddress(input) : template.localPadrao ?? '',
    semFim: template.tipoRecorrencia === 0 || normalizeEndOption(template.opcaoFim) === 'sem-fim' ? true : normalizeEndOption(template.opcaoFim) === 'com-fim' ? false : input.semFim,
  });
  // UTC arithmetic is only a calendar container: payload strings keep wall-clock time, without a zone.
  const start = new Date(`${values.dataInicio}T${values.hora}:00Z`);
  const end = new Date(start.getTime() + (template.duracaoPadraoMinutos || 60) * 60000);
  const day = template.permitirConfigurarDia ? values.dia : normalizeWeekday(template.diasSemana?.[0]) ?? weekdays[start.getUTCDay()];
  if (!template.permitirConfigurarDia && template.diasSemana?.length && !template.diasSemana.includes(day)) {
    throw new Error('A data deve respeitar o dia definido pelo modelo.');
  }
  const until = values.semFim ? undefined : new Date(`${values.dataFim}T${values.hora}:00Z`);
  const frequencies = [RRule.DAILY, RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];
  const rrule = template.tipoRecorrencia === 0 ? undefined : new RRule({
    freq: frequencies[template.tipoRecorrencia], interval: template.intervalo || 1,
    dtstart: start, until, count: template.maxOcorrencias || undefined,
  }).toString();
  return {
    ...scope, grupoId: values.grupoId, eventoTemplateId: template.id,
    titulo: values.titulo, descricao: template.descricao, local: values.local,
    dataInicio: `${values.dataInicio}T${values.hora}:00`, dataFim: end.toISOString().slice(0, 19),
    tipoRecorrencia: recurrenceNames[template.tipoRecorrencia]?.toUpperCase() ?? 'UNICO',
    intervalo: template.intervalo || 1, diasSemana: [day], rrule,
    dataFimRecorrencia: until?.toISOString().slice(0, 19) ?? null,
    exigeConfirmacao: values.exigeConfirmacao, permitirReabertura: template.permitirReabertura,
    permitirPresencaAgrupada: template.permitirPresencaAgrupada,
    permitirReatribuicaoResponsavel: template.permitirReatribuicaoResponsavel,
  };
}

function normalizeWeekday(value?: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized.replace('á', 'a').replace('ç', 'c') || null;
}

function normalizeEndOption(value?: string | null) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === 'sem-fim' || normalized === 'com-fim' ? normalized : 'flexivel';
}

function composeAddress(input: InicioValues) {
  const parts = [
    input.logradouro,
    input.numero ? `n ${input.numero}` : '',
    input.complemento,
    input.bairro,
    input.cidade,
    input.estado,
    input.cep ? `CEP ${input.cep}` : '',
  ].filter(Boolean);
  return parts.join(', ') || input.local;
}
