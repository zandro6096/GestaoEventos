import { ApiError } from '../../../services/api/api-error';
import { eventosApi, type EventoDto, type OcorrenciaDto } from '../../../services/api/eventos-api';
import { participantesEventoApi, type Participante, type ParticipationScope, type PessoaDisponivel } from '../../../services/api/participantes-evento-api';
import { ocorrenciasApi, type EventoCiclo } from '../../../services/api/ocorrencias-api';
import { acompanhamentosApi, type AcompanhamentoDraft } from '../../../services/api/acompanhamentos-api';
import { painelApi } from '../../../services/api/painel-api';
import { availableActions, participantIdentity } from './acompanhamento.rules';

export type AcompanhamentoScope = { usuarioId: number; estruturaId: number; grupoId: number | null };
export type AcompanhamentoAction = { kind: 'iniciar' | 'cancelar' | 'reabrir' | 'descancelar' | 'confirmar'; motivo: string }
  | { kind: 'finalizar'; pendentes: 'ausente' | 'pendente'; observacoes: string | null; enviarResumo: boolean; enviarLembrete: boolean }
  | { kind: 'adicionar'; pessoa: PessoaDisponivel; escopo: ParticipationScope; dataReferencia?: string | null; funcao?: string | null; eventoIds?: number[]; grupoId?: number | null; acompanhamentos?: AcompanhamentoDraft[] }
  | { kind: 'adicionar_virtual'; dados: { nome: string; email?: string | null; telefone?: string | null; dataNascimento?: string | null; funcao?: string | null; cep?: string | null; logradouro?: string | null; numero?: string | null; complemento?: string | null; bairro?: string | null; cidade?: string | null; estado?: string | null }; escopo: ParticipationScope; dataReferencia?: string | null; eventoIds?: number[]; grupoId?: number | null; acompanhamentos?: AcompanhamentoDraft[] }
  | { kind: 'remover'; pessoa: Participante; escopo: ParticipationScope; motivo: string };

export const acompanhamentoService = {
  async carregar(eventoId: number, day: string | undefined, scope: AcompanhamentoScope) {
    if (!Number.isInteger(eventoId) || eventoId <= 0) throw new ApiError('Evento invalido.', { status: 404 });
    const evento = await eventosApi.getEventoById(eventoId);
    if (evento.id !== eventoId) throw new ApiError('Evento nao encontrado.', { status: 404 });
    const data = day || evento.dataInicio.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Data de ocorrencia invalida.');
    const occurrences = await eventosApi.listOcorrencias({ ...scope, eventoId, dataInicio: data, dataFim: `${data}T23:59:59`, includeCanceladas: true, take: 200 });
    const ocorrencia = occurrences.data.find((item) => item.eventoId === eventoId && item.dataHora.slice(0, 10) === data);
    if (!ocorrencia) throw new ApiError('Ocorrencia nao encontrada neste contexto e data.', { status: 404 });
    const [participantes, ciclos] = await Promise.all([
      participantesEventoApi.list(eventoId, ocorrencia.id > 0 ? ocorrencia.id : null, ocorrencia.dataHora),
      ocorrenciasApi.ciclos(eventoId),
    ]);
    return { evento, ocorrencia, participantes, ciclos, data };
  },
  async executar(data: AcompanhamentoData, action: AcompanhamentoAction, scope: AcompanhamentoScope, assertAllowed: () => void) {
    assertAllowed();
    const available = availableActions(data.ocorrencia, data.evento, true);
    const permissionKey = action.kind === 'adicionar' || action.kind === 'adicionar_virtual' || action.kind === 'remover' ? 'participantes' : action.kind;
    if (!available[permissionKey]) throw new Error('Acao indisponivel para o estado atual da ocorrencia.');
    if ('motivo' in action && action.kind !== 'iniciar' && action.kind !== 'confirmar' && !action.motivo.trim()) throw new Error('Informe o motivo.');
    if (action.kind === 'cancelar' && action.motivo.trim().length < 5) throw new Error('Informe o motivo do cancelamento com pelo menos 5 caracteres.');
    let ocorrenciaId = data.ocorrencia.id > 0 ? data.ocorrencia.id : null;
    if (!ocorrenciaId) {
      ocorrenciaId = await eventosApi.materializar(data.evento.id, data.ocorrencia.dataHora);
      if (!ocorrenciaId) throw new Error('Nao foi possivel materializar a ocorrencia.');
    }
    assertAllowed();
    const reference = { ocorrenciaId, dataReferencia: data.ocorrencia.dataHora };
    switch (action.kind) {
      case 'iniciar': case 'cancelar':
        return eventosApi.atualizarOcorrenciaStatus(ocorrenciaId, { novoStatus: action.kind === 'iniciar' ? 'EmAndamento' : 'Cancelada', motivo: action.motivo, usuarioId: scope.usuarioId });
      case 'finalizar':
        return eventosApi.atualizarOcorrenciaStatus(ocorrenciaId, { novoStatus: 'Realizada', observacoes: action.observacoes, usuarioId: scope.usuarioId });
      case 'reabrir': case 'descancelar':
        return ocorrenciasApi.recuperar(ocorrenciaId, action.kind, action.motivo, scope.usuarioId);
      case 'confirmar': return eventosApi.confirmarResponsavel(ocorrenciaId);
      case 'adicionar':
        return adicionarExistente(data, action, scope, reference);
      case 'adicionar_virtual':
        return adicionarVirtual(data, action, scope, reference);
      case 'remover': {
        const identity = participantIdentity(action.pessoa);
        return participantesEventoApi.remove(data.evento.id, identity.id, { ...reference, tipo: identity.tipo, motivo: action.motivo, escopo: action.escopo, removidoPor: scope.usuarioId });
      }
    }
  },
};

async function adicionarExistente(data: AcompanhamentoData, action: Extract<AcompanhamentoAction, { kind: 'adicionar' }>, scope: AcompanhamentoScope, reference: { ocorrenciaId: number; dataReferencia: string }) {
  if ((action.eventoIds?.length ?? 0) > 1 && action.grupoId) {
    const response = await painelApi.adicionarParticipanteMatriz(scope.estruturaId, action.grupoId, {
      eventoIds: action.eventoIds, usuarioId: action.pessoa.tipo === 'usuario' ? action.pessoa.id : null,
      usuarioVirtualId: action.pessoa.tipo === 'usuario_virtual' ? action.pessoa.id : null,
      escopo: action.escopo, dataReferencia: action.dataReferencia ?? reference.dataReferencia, funcao: action.funcao ?? null,
    });
    await salvarAcompanhamentos(scope.estruturaId, { tipo: action.pessoa.tipo, id: action.pessoa.id }, action.acompanhamentos);
    return response;
  }
  const response = await participantesEventoApi.add(data.evento.id, { ...reference, dataReferencia: action.dataReferencia ?? reference.dataReferencia, escopo: action.escopo, funcao: action.funcao ?? null, adicionadoPor: scope.usuarioId,
          ...(action.pessoa.tipo === 'usuario' ? { usuarioId: action.pessoa.id } : { usuarioVirtualId: action.pessoa.id }),
  });
  await salvarAcompanhamentos(scope.estruturaId, { tipo: action.pessoa.tipo, id: action.pessoa.id }, action.acompanhamentos);
  return response;
}

async function adicionarVirtual(data: AcompanhamentoData, action: Extract<AcompanhamentoAction, { kind: 'adicionar_virtual' }>, scope: AcompanhamentoScope, reference: { ocorrenciaId: number; dataReferencia: string }) {
  if ((action.eventoIds?.length ?? 0) > 1 && action.grupoId) {
    const response = await painelApi.adicionarParticipanteMatriz(scope.estruturaId, action.grupoId, {
      eventoIds: action.eventoIds, escopo: action.escopo, dataReferencia: action.dataReferencia ?? reference.dataReferencia, ...action.dados,
    });
    const record = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>;
    const id = Number(record.usuarioVirtualId ?? 0);
    if (id > 0) await salvarAcompanhamentos(scope.estruturaId, { tipo: 'usuario_virtual', id }, action.acompanhamentos);
    return response;
  }
  const response = await participantesEventoApi.add(data.evento.id, { ...reference, dataReferencia: action.dataReferencia ?? reference.dataReferencia, escopo: action.escopo, adicionadoPor: scope.usuarioId, ...action.dados });
  const record = (response && typeof response === 'object' ? response : {}) as Record<string, unknown>;
  const body = (record.data && typeof record.data === 'object' ? record.data : record) as Record<string, unknown>;
  const virtual = body.usuarioVirtual && typeof body.usuarioVirtual === 'object' ? body.usuarioVirtual as Record<string, unknown> : null;
  const id = Number(body.usuarioVirtualId ?? virtual?.id ?? 0);
  if (id > 0) await salvarAcompanhamentos(scope.estruturaId, { tipo: 'usuario_virtual', id }, action.acompanhamentos);
  return response;
}

async function salvarAcompanhamentos(estruturaId: number, identity: { tipo: 'usuario' | 'usuario_virtual'; id: number }, drafts: AcompanhamentoDraft[] | undefined) {
  for (const draft of drafts ?? []) await acompanhamentosApi.save(estruturaId, identity, draft);
}
export type AcompanhamentoData = { evento: EventoDto; ocorrencia: OcorrenciaDto; participantes: Participante[]; ciclos: EventoCiclo[]; data: string };
