import { toCamelCase, toSnakeCase } from './case-conversion';
import { apiRoute, httpClient } from './http-client';

export const painelTipos = ['presenca-media', 'crescimento', 'eventos-realizados'] as const;
export type PainelTipo = (typeof painelTipos)[number];

export type PainelScope = {
  estruturaId: number;
  grupoId?: number | null;
  tipo: PainelTipo;
  dataInicio?: string;
  dataFim?: string;
};

export type PainelItem = {
  id: number;
  nome: string;
  valor: number;
  valorAnterior: number;
  variacao: number;
  tendencia: 'crescente' | 'estavel' | 'decrescente';
};

export type PainelResumo = {
  mediaGeral: number;
  mediaAnterior: number;
  variacaoMedia: number;
  totalGrupos: number;
  gruposAcima: number;
  gruposAbaixo: number;
};

export type PainelComparativoMes = {
  mes: string;
  valor: number;
};

export type PainelComparativo = {
  tipo: PainelTipo | string;
  items: PainelItem[];
  resumo: PainelResumo;
  comparativoMeses: PainelComparativoMes[];
};

export const painelApi = {
  async adicionarParticipanteMatriz(estruturaId: number, grupoId: number, payload: Record<string, unknown>) {
    const response = await httpClient.post(
      apiRoute(`/api/grupos/${grupoId}/participantes/matriz`),
      toSnakeCase({ ...payload, estruturaId }),
    );
    const body = toCamelCase<unknown>(response.data);
    const record = asRecord(body);
    return (record?.data ?? body) as Record<string, unknown>;
  },
  async getComparativo(scope: PainelScope): Promise<PainelComparativo> {
    assertScope(scope);
    const params: Record<string, string | number> = {};

    if (scope.grupoId) params.grupo_id = scope.grupoId;
    if (scope.dataInicio) params.dataInicio = scope.dataInicio;
    if (scope.dataFim) params.dataFim = scope.dataFim;

    const response = await httpClient.get(apiRoute(`/api/painel/${scope.estruturaId}/${scope.tipo}`), { params });
    const body = toCamelCase<unknown>(response.data);
    const envelope = asRecord(body);
    const payload = envelope?.data ?? body;
    return normalizeResponse(payload, scope.tipo);
  },
  async getCockpit(scope: CockpitScope): Promise<CockpitResponse> {
    const response = await httpClient.get(apiRoute('/api/paineis/cockpit'), { params: cockpitParams(scope) });
    return normalizeCockpit(response.data);
  },
  async getMatriz(scope: CockpitMatrizScope): Promise<CockpitMatrixResponse> {
    const params = { ...cockpitParams(scope), pagina: scope.pagina ?? 1, tamanho_pagina: scope.tamanhoPagina ?? 50 } as Record<string, string | number>;
    if (scope.risco && scope.risco !== 'todos') params.risco = scope.risco;
    if (scope.status && scope.status !== 'todos') params.status = scope.status;
    if (scope.busca?.trim()) params.busca = scope.busca.trim();
    if (scope.templateId !== undefined) params.template_id = scope.templateId === null ? 'null' : scope.templateId;
    const response = await httpClient.get(apiRoute('/api/paineis/cockpit/participantes/matriz-template'), { params });
    return normalizeMatrix(response.data);
  },
  async getFaltas(scope: CockpitFaltasScope): Promise<CockpitAbsence[]> {
    const response = await httpClient.get(apiRoute(`/api/paineis/cockpit/participantes/${scope.tipo}/${scope.participanteId}/faltas`), { params: cockpitParams(scope, scope.templateId) });
    const body = toCamelCase<unknown>(response.data);
    const data = asRecord(body)?.data ?? body;
    return Array.isArray(data) ? data.map(normalizeAbsence).filter((item): item is CockpitAbsence => item !== null) : [];
  },
  async getFila(scope: CockpitQueueScope): Promise<CockpitQueuePage> {
    const params: Record<string, string | number> = { ...cockpitParams(scope), pagina: scope.pagina ?? 1, tamanho_pagina: scope.tamanhoPagina ?? 20 };
    if (scope.risco && scope.risco !== 'todos') params.risco = scope.risco;
    if (scope.status && scope.status !== 'todos') params.status = scope.status;
    if (scope.templateId !== undefined) params.template_id = scope.templateId === null ? 'null' : scope.templateId;
    if (scope.responsavelUsuarioId !== undefined) params.responsavel_id = scope.responsavelUsuarioId === null ? 'null' : scope.responsavelUsuarioId;
    const response = await httpClient.get(apiRoute('/api/paineis/cockpit/fila-pessoas'), { params });
    const body = toCamelCase<unknown>(response.data);
    const record = asRecord(body);
    const data = record?.itens ?? record?.data ?? body;
    const items = Array.isArray(data) ? data.map(normalizeQueueItem).filter((item): item is CockpitQueueItem => item !== null) : [];
    return { items, total: integerValue(record?.total ?? items.length), pagina: integerValue(record?.pagina ?? scope.pagina ?? 1), tamanhoPagina: integerValue(record?.tamanhoPagina ?? scope.tamanhoPagina ?? 20) };
  },
  async atualizarFilaPessoa(scope: CockpitQueueUpdateScope, request: CockpitQueueUpdateRequest): Promise<CockpitQueueItem> {
    const response = await httpClient.put(apiRoute(`/api/paineis/cockpit/fila-pessoas/${scope.tipo}/${scope.participanteId}`), toSnakeCase({ ...request, estruturaId: scope.estruturaId, grupoId: scope.grupoId, tipo: scope.tipo, participanteId: scope.participanteId, dataInicio: scope.dataInicio, dataFim: scope.dataFim }));
    const body = toCamelCase<unknown>(response.data);
    return normalizeQueueItem(asRecord(body)?.data ?? body) ?? (() => { throw new Error('Resposta invalida ao atualizar a fila semanal.'); })();
  },
  async getGrupoAnalitico(scope: CockpitGroupAnalyticsScope): Promise<CockpitGroupAnalyticsResponse> {
    const response = await httpClient.get(apiRoute(`/api/paineis/cockpit/grupos/${scope.grupoId}/participantes-analitico`), { params: { ...cockpitParams(scope), participantes_pagina: 1, participantes_tamanho_pagina: 20, movimentacoes_pagina: 1, movimentacoes_tamanho_pagina: 20 } });
    const body = asRecord(toCamelCase<unknown>(response.data));
    return { resumo: asRecord(body?.resumoGrupo) ?? {}, templatesMeta: arrayValue(body?.templatesMeta).map((item) => { const record = asRecord(item); return { templateId: nullableInteger(record?.templateId), templateTitulo: stringValue(record?.templateTitulo, 'Sem template') }; }), participantes: arrayValue(body?.participantesAtuais), movimentacoes: arrayValue(body?.movimentacoes) };
  },
};

export type CockpitScope = { estruturaId: number; grupoId?: number | null; dataInicio: string; dataFim: string };
export type CockpitQueueScope = CockpitScope & { risco?: string; status?: string; templateId?: number | null; responsavelUsuarioId?: number | null; pagina?: number; tamanhoPagina?: number };
export type CockpitQueueUpdateScope = Pick<CockpitScope, 'estruturaId' | 'dataInicio' | 'dataFim'> & { grupoId?: number | null; tipo: string; participanteId: number };
export type CockpitQueueUpdateRequest = { semanaRef?: string | null; status: string; responsavelUsuarioId?: number | null; proximaAcaoEm?: string | null; motivo?: string | null; observacao?: string | null };
export type CockpitMatrizScope = CockpitScope & { risco?: string; status?: string; busca?: string; templateId?: number | null; pagina?: number; tamanhoPagina?: number };
export type CockpitFaltasScope = CockpitScope & { tipo: string; participanteId: number; templateId?: number | null };
export type CockpitGroupAnalyticsScope = CockpitScope & { grupoId: number };
export type CockpitAniversariante = { id: number; tipo: string; nome: string; dataNascimento: string; dia: number; fazAniversarioHoje: boolean; diasParaAniversario: number };
export type CockpitObjectiveEventItem = { objetivoId: number; objetivoNome: string; eventoId: number; eventoTitulo: string; grupoId: number; grupoNome: string; templateId: number | null; templateTitulo: string; papelAlvoNome: string | null; metaQuantidade: number; progressoAtual: number; status: string; inicioEm: string | null; prazoEm: string | null; concluidoEm: string | null };
export type CockpitObjectiveSummary = { totalObjetivos: number; concluidos: number; aVencer: number; atrasados: number; emAndamento: number; naoIniciados: number; percentualConclusao: number; itens: CockpitObjectiveEventItem[] };
export type CockpitObjectiveItem = { id: number; nome: string; tipo: string; status: string; inicioEm: string | null; prazoEm: string | null; concluidoEm: string | null; progressoAtual: number; metaQuantidade: number; papelAlvoNome: string | null };
export type CockpitObjectiveStatus = { status: string; marcador: string; total: number; concluidos: number; aVencer: number; atrasados: number; itens: CockpitObjectiveItem[] };
export type CockpitCollectiveObjective = { grupoId: number; grupoNome: string; templateId: number | null; templateTitulo: string; resumo: CockpitObjectiveStatus };
export type CockpitResponse = { resumo: CockpitSummary; alertas: CockpitAlert[]; gruposFilhos: CockpitGroup[]; participantesSaude: CockpitHealth[]; aniversariantesMes: CockpitAniversariante[]; objetivosPapelEvento: CockpitObjectiveSummary };
export type CockpitSummary = { totalParticipantes: number; percentualPresenca: number; totalEventos: number; totalPresencas: number; totalAusencias: number; totalJustificados: number; totalPendentes: number; tendencia: string };
export type CockpitAlert = { severidade: string; mensagem: string };
export type CockpitGroup = { grupoId: number; nome: string; totalParticipantes: number; totalEventos: number; percentualPresenca: number; tendencia: string };
export type CockpitHealth = { tipo: string; participanteId: number; nome: string; totalPresencas: number; totalAusencias: number; totalEventosConsiderados: number; taxaParticipacao: number; faltasConsecutivas: number };
export type CockpitMatrixResponse = { templates: CockpitTemplate[]; items: CockpitMatrixRow[]; objetivosColetivos: CockpitCollectiveObjective[]; total: number };
export type CockpitTemplate = { templateId: number | null; templateTitulo: string };
export type CockpitMatrixRow = { tipo: string; participanteId: number; nome: string; grupoId: number; grupoNome: string; taxaParticipacao: number; totalPresencas: number; totalFaltas: number; totalEventosConsiderados: number; faltasConsecutivas: number; faixaRisco: string; statusAcompanhamento: string; templates: CockpitMatrixCell[] };
export type CockpitMatrixCell = { templateId: number | null; templateTitulo: string; totalPresencas: number; totalFaltas: number; totalEventosConsiderados: number; taxaParticipacao: number; faltasConsecutivas: number; objetivosTotal: number; objetivosConcluidos: number; objetivosAVencer: number; objetivosAtrasados: number; objetivoMarcador: string; objetivoStatusResumo: CockpitObjectiveStatus | null };
export type CockpitAbsence = { data: string | null; eventoTitulo: string; motivo: string | null; status: string };
export type CockpitQueuePage = { items: CockpitQueueItem[]; total: number; pagina: number; tamanhoPagina: number };
export type CockpitQueueResponsible = { usuarioId: number; nome: string };
export type CockpitQueueItem = { tipo: string; participanteId: number; nome: string; grupoId: number; grupoNome: string; eventoId: number; eventoTitulo: string; templateId: number | null; templateTitulo: string | null; totalPresencas: number; totalAusencias: number; totalJustificados: number; totalEventosConsiderados: number; taxaParticipacao: number; faltasConsecutivas: number; ultimaFalta: string | null; scoreRisco: number; faixaRisco: string; statusAcompanhamento: string; responsavelUsuarioId: number | null; responsavelNome: string | null; proximaAcaoEm: string | null; motivo: string | null; observacao: string | null; atualizadoEm: string | null; responsaveisSugestao: CockpitQueueResponsible[] };
export type CockpitGroupAnalyticsResponse = { resumo: Record<string, unknown>; templatesMeta: CockpitTemplate[]; participantes: unknown[]; movimentacoes: unknown[] };

function cockpitParams(scope: CockpitScope, templateId?: number | null) {
  const params: Record<string, string | number> = { estrutura_id: scope.estruturaId, data_inicio: scope.dataInicio, data_fim: scope.dataFim };
  if (scope.grupoId) params.grupo_id = scope.grupoId;
  if (templateId !== undefined) params.template_id = templateId === null ? 'null' : templateId;
  return params;
}

function normalizeCockpit(value: unknown): CockpitResponse {
  const body = asRecord(toCamelCase<unknown>(value));
  const summary = asRecord(body?.resumo);
  return {
    resumo: { totalParticipantes: integerValue(summary?.totalParticipantes), percentualPresenca: numberValue(summary?.percentualPresenca), totalEventos: integerValue(summary?.totalEventos), totalPresencas: integerValue(summary?.totalPresencas), totalAusencias: integerValue(summary?.totalAusencias), totalJustificados: integerValue(summary?.totalJustificados), totalPendentes: integerValue(summary?.totalPendentes), tendencia: stringValue(summary?.tendencia, 'estavel') },
    alertas: arrayValue(body?.alertas).map((item) => { const record = asRecord(item); return { severidade: stringValue(record?.severidade, 'info'), mensagem: stringValue(record?.mensagem, 'Alerta operacional') }; }),
    gruposFilhos: arrayValue(body?.gruposFilhos).map((item) => { const record = asRecord(item); return { grupoId: integerValue(record?.grupoId), nome: stringValue(record?.nome, 'Grupo'), totalParticipantes: integerValue(record?.totalParticipantes), totalEventos: integerValue(record?.totalEventos), percentualPresenca: numberValue(record?.percentualPresenca), tendencia: stringValue(record?.tendencia, 'estavel') }; }).filter((item) => item.grupoId > 0),
    participantesSaude: arrayValue(body?.participantesSaude).map((item) => { const record = asRecord(item); return { tipo: stringValue(record?.tipo, 'usuario'), participanteId: integerValue(record?.participanteId), nome: stringValue(record?.nome, 'Participante'), totalPresencas: integerValue(record?.totalPresencas), totalAusencias: integerValue(record?.totalAusencias), totalEventosConsiderados: integerValue(record?.totalEventosConsiderados), taxaParticipacao: numberValue(record?.taxaParticipacao), faltasConsecutivas: integerValue(record?.faltasConsecutivas) }; }).filter((item) => item.participanteId > 0),
    aniversariantesMes: arrayValue(body?.aniversariantesMes).map((item) => { const record = asRecord(item); return { id: integerValue(record?.id), tipo: stringValue(record?.tipo, 'usuario'), nome: stringValue(record?.nome, 'Participante'), dataNascimento: stringValue(record?.dataNascimento, ''), dia: integerValue(record?.dia), fazAniversarioHoje: Boolean(record?.fazAniversarioHoje), diasParaAniversario: integerValue(record?.diasParaAniversario) }; }).filter((item) => item.id > 0),
    objetivosPapelEvento: normalizeObjectiveSummary(body?.objetivosPapelEvento),
  };
}

function normalizeMatrix(value: unknown): CockpitMatrixResponse {
  const body = asRecord(toCamelCase<unknown>(value));
  return { templates: arrayValue(body?.templates).map((item) => { const record = asRecord(item); return { templateId: nullableInteger(record?.templateId), templateTitulo: stringValue(record?.templateTitulo, 'Sem template') }; }), items: arrayValue(body?.itens).map(normalizeMatrixRow).filter((item): item is CockpitMatrixRow => item !== null), objetivosColetivos: arrayValue(body?.objetivosColetivos).map((item) => { const record = asRecord(item); const resumo = normalizeObjectiveStatus(record?.resumo); return record && resumo ? { grupoId: integerValue(record.grupoId), grupoNome: stringValue(record.grupoNome, 'Grupo'), templateId: nullableInteger(record.templateId), templateTitulo: stringValue(record.templateTitulo, 'Sem template'), resumo } : null; }).filter((item): item is CockpitCollectiveObjective => item !== null), total: integerValue(body?.total) };
}

function optionalString(value: unknown) { return typeof value === 'string' && value.trim() ? value : null; }
function normalizeObjectiveSummary(value: unknown): CockpitObjectiveSummary { const item = asRecord(value); return { totalObjetivos: integerValue(item?.totalObjetivos), concluidos: integerValue(item?.concluidos), aVencer: integerValue(item?.aVencer), atrasados: integerValue(item?.atrasados), emAndamento: integerValue(item?.emAndamento), naoIniciados: integerValue(item?.naoIniciados), percentualConclusao: numberValue(item?.percentualConclusao), itens: arrayValue(item?.itens).map((entry) => { const record = asRecord(entry); if (!record) return null; return { objetivoId: integerValue(record.objetivoId), objetivoNome: stringValue(record.objetivoNome, 'Objetivo'), eventoId: integerValue(record.eventoId), eventoTitulo: stringValue(record.eventoTitulo, ''), grupoId: integerValue(record.grupoId), grupoNome: stringValue(record.grupoNome, ''), templateId: nullableInteger(record.templateId), templateTitulo: stringValue(record.templateTitulo, ''), papelAlvoNome: optionalString(record.papelAlvoNome), metaQuantidade: integerValue(record.metaQuantidade), progressoAtual: integerValue(record.progressoAtual), status: stringValue(record.status, 'nao_iniciado'), inicioEm: optionalString(record.inicioEm), prazoEm: optionalString(record.prazoEm), concluidoEm: optionalString(record.concluidoEm) }; }).filter((entry): entry is CockpitObjectiveEventItem => entry !== null) }; }
function normalizeObjectiveStatus(value: unknown): CockpitObjectiveStatus | null { const item = asRecord(value); if (!item) return null; return { status: stringValue(item.status, 'sem_objetivo'), marcador: stringValue(item.marcador, 'nenhum'), total: integerValue(item.total), concluidos: integerValue(item.concluidos), aVencer: integerValue(item.aVencer), atrasados: integerValue(item.atrasados), itens: arrayValue(item.itens).map((entry) => { const record = asRecord(entry); if (!record) return null; return { id: integerValue(record.id), nome: stringValue(record.nome, 'Objetivo'), tipo: stringValue(record.tipo, ''), status: stringValue(record.status, 'nao_iniciado'), inicioEm: optionalString(record.inicioEm), prazoEm: optionalString(record.prazoEm), concluidoEm: optionalString(record.concluidoEm), progressoAtual: integerValue(record.progressoAtual), metaQuantidade: integerValue(record.metaQuantidade), papelAlvoNome: optionalString(record.papelAlvoNome) }; }).filter((entry): entry is CockpitObjectiveItem => entry !== null) }; }

function normalizeMatrixRow(value: unknown): CockpitMatrixRow | null {
  const item = asRecord(value);
  if (!item || integerValue(item.participanteId) <= 0) return null;
  return { tipo: stringValue(item.tipo, 'usuario'), participanteId: integerValue(item.participanteId), nome: stringValue(item.nome, 'Participante'), grupoId: integerValue(item.grupoId), grupoNome: stringValue(item.grupoNome, 'Grupo'), taxaParticipacao: numberValue(item.taxaParticipacao), totalPresencas: integerValue(item.totalPresencas), totalFaltas: integerValue(item.totalFaltas), totalEventosConsiderados: integerValue(item.totalEventosConsiderados), faltasConsecutivas: integerValue(item.faltasConsecutivas), faixaRisco: stringValue(item.faixaRisco, 'baixo'), statusAcompanhamento: stringValue(item.statusAcompanhamento, 'pendente'), templates: arrayValue(item.templates).map((cell) => { const record = asRecord(cell); return { templateId: nullableInteger(record?.templateId), templateTitulo: stringValue(record?.templateTitulo, 'Sem template'), totalPresencas: integerValue(record?.totalPresencas), totalFaltas: integerValue(record?.totalFaltas), totalEventosConsiderados: integerValue(record?.totalEventosConsiderados), taxaParticipacao: numberValue(record?.taxaParticipacao), faltasConsecutivas: integerValue(record?.faltasConsecutivas), objetivosTotal: integerValue(record?.objetivosTotal), objetivosConcluidos: integerValue(record?.objetivosConcluidos), objetivosAVencer: integerValue(record?.objetivosAVencer), objetivosAtrasados: integerValue(record?.objetivosAtrasados), objetivoMarcador: stringValue(record?.objetivoMarcador, 'nenhum'), objetivoStatusResumo: normalizeObjectiveStatus(record?.objetivoStatusResumo) }; }) };
}

function normalizeAbsence(value: unknown): CockpitAbsence | null { const item = asRecord(value); if (!item) return null; return { data: typeof item.data === 'string' ? item.data : null, eventoTitulo: stringValue(item.eventoTitulo, 'Evento'), motivo: typeof item.motivo === 'string' ? item.motivo : null, status: stringValue(item.status, 'Ausente') }; }
function normalizeQueueItem(value: unknown): CockpitQueueItem | null { const item = asRecord(value); if (!item || integerValue(item.participanteId) <= 0) return null; return { tipo: stringValue(item.tipo, 'usuario'), participanteId: integerValue(item.participanteId), nome: stringValue(item.nome, 'Participante'), grupoId: integerValue(item.grupoId), grupoNome: stringValue(item.grupoNome, 'Grupo'), eventoId: integerValue(item.eventoId), eventoTitulo: stringValue(item.eventoTitulo, 'Evento'), templateId: nullableInteger(item.templateId), templateTitulo: typeof item.templateTitulo === 'string' ? item.templateTitulo : null, totalPresencas: integerValue(item.totalPresencas), totalAusencias: integerValue(item.totalAusencias), totalJustificados: integerValue(item.totalJustificados), totalEventosConsiderados: integerValue(item.totalEventosConsiderados), taxaParticipacao: numberValue(item.taxaParticipacao), faltasConsecutivas: integerValue(item.faltasConsecutivas), ultimaFalta: typeof item.ultimaFalta === 'string' ? item.ultimaFalta : null, scoreRisco: numberValue(item.scoreRisco), faixaRisco: stringValue(item.faixaRisco, 'baixo'), statusAcompanhamento: stringValue(item.statusAcompanhamento, 'pendente'), responsavelUsuarioId: nullableInteger(item.responsavelUsuarioId), responsavelNome: typeof item.responsavelNome === 'string' ? item.responsavelNome : null, proximaAcaoEm: typeof item.proximaAcaoEm === 'string' ? item.proximaAcaoEm : null, motivo: typeof item.motivo === 'string' ? item.motivo : null, observacao: typeof item.observacao === 'string' ? item.observacao : null, atualizadoEm: typeof item.atualizadoEm === 'string' ? item.atualizadoEm : null, responsaveisSugestao: arrayValue(item.responsaveisSugestao).map((value) => { const responsible = asRecord(value); return { usuarioId: integerValue(responsible?.usuarioId), nome: stringValue(responsible?.nome, 'Responsavel') }; }).filter((value) => value.usuarioId > 0) }; }
function arrayValue(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function nullableInteger(value: unknown) { return value === null || value === undefined ? null : integerValue(value); }
function stringValue(value: unknown, fallback: string) { return typeof value === 'string' && value.trim() ? value : fallback; }

function normalizeResponse(value: unknown, fallbackTipo: PainelTipo): PainelComparativo {
  const body = asRecord(toCamelCase<unknown>(value));
  const resumo = asRecord(body?.resumo);
  const items = Array.isArray(body?.items) ? body.items : [];
  const meses = Array.isArray(body?.comparativoMeses) ? body.comparativoMeses : [];

  return {
    tipo: typeof body?.tipo === 'string' ? body.tipo : fallbackTipo,
    items: items.map(normalizeItem).filter((item): item is PainelItem => item !== null),
    resumo: {
      mediaGeral: numberValue(resumo?.mediaGeral),
      mediaAnterior: numberValue(resumo?.mediaAnterior),
      variacaoMedia: numberValue(resumo?.variacaoMedia),
      totalGrupos: integerValue(resumo?.totalGrupos),
      gruposAcima: integerValue(resumo?.gruposAcima),
      gruposAbaixo: integerValue(resumo?.gruposAbaixo),
    },
    comparativoMeses: meses.map(normalizeMonth).filter((item): item is PainelComparativoMes => item !== null),
  };
}

function normalizeItem(value: unknown): PainelItem | null {
  const item = asRecord(value);
  if (!item || !Number.isInteger(Number(item.id)) || Number(item.id) <= 0 || typeof item.nome !== 'string') return null;

  return {
    id: Number(item.id),
    nome: item.nome,
    valor: numberValue(item.valor),
    valorAnterior: numberValue(item.valorAnterior),
    variacao: numberValue(item.variacao),
    tendencia: item.tendencia === 'crescente' || item.tendencia === 'decrescente' ? item.tendencia : 'estavel',
  };
}

function normalizeMonth(value: unknown): PainelComparativoMes | null {
  const month = asRecord(value);
  if (!month || typeof month.mes !== 'string') return null;
  return { mes: month.mes, valor: numberValue(month.valor) };
}

function assertScope(scope: PainelScope) {
  if (!Number.isInteger(scope.estruturaId) || scope.estruturaId <= 0) throw new Error('Estrutura ativa obrigatoria para carregar o painel.');
  if (!painelTipos.includes(scope.tipo)) throw new Error('Tipo de painel invalido.');
}

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' ? (value as Record<string, any>) : null;
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function integerValue(value: unknown) {
  return Math.max(0, Math.round(numberValue(value)));
}
