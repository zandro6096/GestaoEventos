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
  const usuarioId = useContextStore((state) => state.usuarioId);
  const estruturaId = useContextStore((state) => state.estruturaId);
  const modelos = useModelosRelatorioMensal();
  const [modeloEscolhido, setModeloEscolhido] = useState<number | null>(null);
  const modeloId = modelos.data?.find((m) => m.id === modeloEscolhido)?.id ?? modelos.data?.[0]?.id ?? null;

  // Redes de células que o usuário gerencia (o dono vê todas; o discipulador, a dele).
  const redes = useQuery({
    queryKey: queryKeys.scoped('relatorios-mensais-redes', { estruturaId }, { usuarioId, modeloId }),
    queryFn: () => relatoriosMensaisApi.listarRedes(modeloId!),
    enabled: Boolean(modeloId),
    staleTime: 5 * 60 * 1000,
  });
  const [redeEscolhida, setRedeEscolhida] = useState<number | null>(null);
  const grupoId = redes.data?.find((r) => r.grupoId === redeEscolhida)?.grupoId ?? redes.data?.[0]?.grupoId ?? null;
  const rede = redes.data?.find((r) => r.grupoId === grupoId) ?? null;

  // Filtros: ano (vazio = atual) e mês (vazio = todos os meses do ano).
  const [ano, setAno] = useState<number | null>(null);
  const [mes, setMes] = useState<number | null>(null);
  const [pendenciasDe, setPendenciasDe] = useState<MesRelatorio | null>(null);
  const [pronta, setPronta] = useState<PlanilhaPronta | null>(null);

  const meses = useQuery({
    queryKey: queryKeys.scoped('relatorios-mensais-meses', { estruturaId }, { modeloId, grupoId, ano, mes }),
    queryFn: () => relatoriosMensaisApi.listarMeses(modeloId!, grupoId!, ano, mes),
    enabled: Boolean(modeloId && grupoId),
    staleTime: 60 * 1000,
  });
  const anoAtivo = meses.data?.ano ?? ano ?? new Date().getFullYear();
  const anosDisponiveis = meses.data?.anosDisponiveis?.length ? meses.data.anosDisponiveis : [anoAtivo];

  useEffect(() => { if (modeloId) track('entrance', 'relatorio_mensal:entrada'); }, [modeloId]);

  const gerar = useMutation({
    mutationFn: async (alvo: MesRelatorio) => {
      track('simulation', 'relatorio_mensal:gerar_submit', { extra: { mes: `${alvo.ano}-${alvo.mes}`, pendencias: alvo.totalPendencias } });
      const arquivo = await relatoriosMensaisApi.gerar(modeloId!, grupoId!, alvo.ano, alvo.mes);
      return { ...arquivo, mes: alvo };
    },
    onSuccess: (arquivo) => {
      track('confirmation', 'relatorio_mensal:gerar_sucesso', { extra: { tamanho: arquivo.tamanhoBytes } });
      setPendenciasDe(null);
      setPronta(arquivo);
    },
    onError: () => track('click', 'relatorio_mensal:gerar_erro'),
  });

  function aplicarFiltro(nome: string) { track('simulation', 'relatorio_mensal:filtro_aplicar', { extra: { filtro: nome } }); }

  return {
    modelos,
    modeloId,
    escolherModelo: (id: number) => { setModeloEscolhido(id); setRedeEscolhida(null); },
    redes,
    rede,
    grupoId,
    escolherRede: (id: number) => { setRedeEscolhida(id); aplicarFiltro('rede'); },
    ano: anoAtivo,
    anosDisponiveis,
    escolherAno: (valor: number) => { setAno(valor); setMes(null); aplicarFiltro('ano'); },
    mes,
    escolherMes: (valor: number | null) => { setMes(valor); aplicarFiltro('mes'); },
    meses,
    pendenciasDe,
    verPendencias: (alvo: MesRelatorio | null) => {
      if (alvo) track('visualization', 'relatorio_mensal:pendencias_ver', { extra: { pendencias: alvo.totalPendencias } });
      setPendenciasDe(alvo);
    },
    gerar,
    gerandoMes: gerar.isPending ? gerar.variables : null,
    erroGerar: gerar.isError ? normalizeApiError(gerar.error, 'Não foi possível gerar a planilha.').message : null,
    erroMeses: meses.isError ? normalizeApiError(meses.error, 'Não foi possível carregar os meses.').message
      : redes.isError ? normalizeApiError(redes.error, 'Não foi possível carregar as redes.').message : null,
    pronta,
    fecharPronta: () => setPronta(null),
    salvar: async (arquivo: PlanilhaPronta) => {
      await salvarPlanilha(arquivo.nomeArquivo, arquivo.conteudoBase64);
      track('confirmation', 'relatorio_mensal:arquivo_salvo');
    },
  };
}
