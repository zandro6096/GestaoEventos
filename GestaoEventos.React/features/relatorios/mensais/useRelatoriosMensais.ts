import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { track } from '../../../services/analytics/analytics.service';
import { normalizeApiError } from '../../../services/api/api-error';
import { relatoriosMensaisApi, type ArquivoRelatorio, type MesRelatorio } from '../../../services/api/relatorios-mensais-api';
import { queryKeys } from '../../../services/query/query-keys';
import { useContextStore } from '../../../stores/context.store';
import { salvarPlanilha } from './salvarPlanilha';

/** Modelos de relatório mensal que o usuário pode exportar na estrutura ativa (vazio = item some do menu). */
export function useModelosRelatorioMensal() {
  const usuarioId = useContextStore((state) => state.usuarioId);
  const estruturaId = useContextStore((state) => state.estruturaId);
  return useQuery({
    queryKey: queryKeys.scoped('relatorios-mensais-modelos', { estruturaId }, { usuarioId }),
    queryFn: () => relatoriosMensaisApi.listarModelos(estruturaId!),
    enabled: Boolean(usuarioId && estruturaId),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export type PlanilhaPronta = ArquivoRelatorio & { mes: MesRelatorio };

export function useRelatoriosMensais() {
  const estruturaId = useContextStore((state) => state.estruturaId);
  const modelos = useModelosRelatorioMensal();
  const [modeloEscolhido, setModeloEscolhido] = useState<number | null>(null);
  const modeloId = modelos.data?.find((m) => m.id === modeloEscolhido)?.id ?? modelos.data?.[0]?.id ?? null;
  const [pendenciasDe, setPendenciasDe] = useState<MesRelatorio | null>(null);
  const [pronta, setPronta] = useState<PlanilhaPronta | null>(null);

  const meses = useQuery({
    queryKey: queryKeys.scoped('relatorios-mensais-meses', { estruturaId }, { modeloId }),
    queryFn: () => relatoriosMensaisApi.listarMeses(modeloId!),
    enabled: Boolean(modeloId),
    staleTime: 60 * 1000,
  });

  useEffect(() => { if (modeloId) track('entrance', 'relatorio_mensal:entrada'); }, [modeloId]);

  const gerar = useMutation({
    mutationFn: async (mes: MesRelatorio) => {
      track('simulation', 'relatorio_mensal:gerar_submit', { extra: { mes: `${mes.ano}-${mes.mes}`, pendencias: mes.totalPendencias } });
      const arquivo = await relatoriosMensaisApi.gerar(modeloId!, mes.ano, mes.mes);
      return { ...arquivo, mes };
    },
    onSuccess: async (arquivo) => {
      track('confirmation', 'relatorio_mensal:gerar_sucesso', { extra: { tamanho: arquivo.tamanhoBytes } });
      setPendenciasDe(null);
      setPronta(arquivo);
    },
    onError: () => track('click', 'relatorio_mensal:gerar_erro'),
  });

  return {
    modelos,
    modeloId,
    escolherModelo: setModeloEscolhido,
    meses,
    pendenciasDe,
    verPendencias: (mes: MesRelatorio | null) => {
      if (mes) track('visualization', 'relatorio_mensal:pendencias_ver', { extra: { pendencias: mes.totalPendencias } });
      setPendenciasDe(mes);
    },
    gerar,
    gerandoMes: gerar.isPending ? gerar.variables : null,
    erroGerar: gerar.isError ? normalizeApiError(gerar.error, 'Não foi possível gerar a planilha.').message : null,
    erroMeses: meses.isError ? normalizeApiError(meses.error, 'Não foi possível carregar os meses.').message : null,
    pronta,
    fecharPronta: () => setPronta(null),
    salvar: async (arquivo: PlanilhaPronta) => {
      await salvarPlanilha(arquivo.nomeArquivo, arquivo.conteudoBase64);
      track('confirmation', 'relatorio_mensal:arquivo_salvo');
    },
  };
}
