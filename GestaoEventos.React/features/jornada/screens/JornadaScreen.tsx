import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { normalizeApiError } from '../../../services/api/api-error';
import { track } from '../../../services/analytics/analytics.service';
import { assertOnlineForMutation } from '../../../services/offline/mutation-guard';
import { can } from '../../../services/permissions/permission.facade';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { layoutMetrics } from '../../../shared/theme';
import { JornadaActionPanel, type JornadaActionTarget } from '../components/JornadaActionPanel';
import { JornadaSectionTabs, type JornadaView } from '../components/JornadaSectionTabs';
import { McpAnnouncementBanner } from '../../mcp/components/McpAnnouncementBanner';
import { useJornada } from '../hooks/useJornada';
import { usePendenciasDetalhe } from '../hooks/usePendenciasDetalhe';
import type {
  JornadaEventoHoje,
  JornadaFrequencia,
  JornadaHistoricoItem,
  JornadaAniversariante,
  JornadaPendenciasDetalhe,
  JornadaPendenciasResumo,
  JornadaProximaReuniao,
} from '../services/jornada.service';

type SectionStatus = {
  kind: 'loading' | 'error' | 'success';
  message: string | null;
};

export function JornadaScreen() {
  const router = useRouter();
  const jornada = useJornada();
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const [activeView, setActiveView] = useState<JornadaView>('hoje');
  const [selectedTarget, setSelectedTarget] = useState<JornadaActionTarget | null>(null);
  const [expandedPendenciaGrupoId, setExpandedPendenciaGrupoId] = useState<number | null>(null);
  const [pendenciaDetailTake, setPendenciaDetailTake] = useState(10);
  const autoExpandedPendenciaScopes = useRef(new Set<string>());
  const [actionBlockedMessage, setActionBlockedMessage] = useState<string | null>(null);
  const pendenciaDetalheQuery = usePendenciasDetalhe(expandedPendenciaGrupoId, pendenciaDetailTake);
  const canOpenEvent = can('ler', 'eventos');

  useEffect(() => {
    const firstGrupo = jornada.pendenciasResumo?.grupos[0];
    const scopeKey = `${jornada.usuarioId ?? 0}:${jornada.estruturaId ?? 0}:${jornada.grupoId ?? 'all'}`;
    if (!compact || autoExpandedPendenciaScopes.current.has(scopeKey) || !firstGrupo || firstGrupo.total <= 0) return;

    autoExpandedPendenciaScopes.current.add(scopeKey);
    setPendenciaDetailTake(firstGrupo.total);
    setExpandedPendenciaGrupoId(firstGrupo.grupoId);
  }, [compact, jornada.estruturaId, jornada.grupoId, jornada.pendenciasResumo, jornada.usuarioId]);

  function selectTarget(target: JornadaActionTarget) {
    setActionBlockedMessage(null);
    setSelectedTarget(target);
  }

  function handleOpenEvento(target: JornadaActionTarget | null = selectedTarget) {
    if (!target) return;
    if (!can('ler', 'eventos')) {
      setActionBlockedMessage('Seu contexto atual nao permite abrir eventos.');
      return;
    }

    const extra = getEventoAnalyticsExtra(target);
    track('entrance', 'btn:abrir_evento', {
      extra: {
        ...extra,
      },
    });
    track('simulation', 'jornada:evento_abrir_submit', {
      extra: {
        ...extra,
      },
    });
    router.push('/admin/eventos' as Href);
    track('confirmation', 'jornada:evento_abrir_success', {
      extra: {
        ...extra,
      },
    });
  }

  function handleMutableAction(target: JornadaActionTarget | null = selectedTarget) {
    try {
      assertOnlineForMutation('registrar_presenca');
      if (!can('ler', 'eventos')) {
        setActionBlockedMessage('Seu contexto atual nao permite registrar presenca.');
        return;
      }

      const extra = getEventoAnalyticsExtra(target);
      track('entrance', 'btn:registrar_presenca', {
        extra: {
          ...extra,
        },
      });
      track('simulation', 'jornada:registrar_presenca_submit', {
        extra: {
          ...extra,
        },
      });
      router.push('/admin/eventos' as Href);
      track('confirmation', 'jornada:registrar_presenca_success', {
        extra: {
          ...extra,
        },
      });
    } catch (error) {
      setActionBlockedMessage(
        normalizeApiError(error, 'Esta acao precisa de conexao ativa para evitar registro inconsistente.').message,
      );
    }
  }

  function togglePendenciaGrupo(grupoId: number) {
    setActionBlockedMessage(null);
    setSelectedTarget(null);
    if (expandedPendenciaGrupoId === grupoId) {
      setExpandedPendenciaGrupoId(null);
      return;
    }

    setPendenciaDetailTake(10);
    setExpandedPendenciaGrupoId(grupoId);
  }

  function openPendenciaItem(item: JornadaPendenciasDetalhe['itens'][number]) {
    const data = item.dataHora.slice(0, 10);
    track('entrance', 'btn:abrir_pendencia', {
      extra: { evento_id: item.eventoId, ocorrencia_id: item.ocorrenciaId, grupo_id: item.grupoId },
    });
    track('simulation', 'jornada:pendencia_abrir_submit', {
      extra: { evento_id: item.eventoId, ocorrencia_id: item.ocorrenciaId, grupo_id: item.grupoId },
    });
    router.push(`/admin/eventos/acompanhar/${item.eventoId}${data ? `?data=${data}` : ''}` as Href);
    track('confirmation', 'jornada:pendencia_abrir_success', {
      extra: { evento_id: item.eventoId, ocorrencia_id: item.ocorrenciaId, grupo_id: item.grupoId },
    });
  }

  if (jornada.contextError) {
    return (
      <ScreenShell>
        <ErrorState title="Contexto obrigatorio" message={jornada.contextError} onRetry={jornada.refetchAll} />
      </ScreenShell>
    );
  }

  if (jornada.hasBlockingError) {
    return (
      <ScreenShell>
        <ErrorState
          title="Nao foi possivel carregar a jornada"
          message={jornada.partialErrors[0] ?? 'Tente novamente em instantes.'}
          onRetry={jornada.refetchAll}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <McpAnnouncementBanner />
      {compact && activeView !== 'pendencias' && jornada.pendenciasResumo && jornada.pendenciasResumo.total > 0 ? (
        <PendenciasSection
          data={jornada.pendenciasResumo}
          status={jornada.pendenciasStatus}
          onRetry={jornada.refetchAll}
          expandedGrupoId={expandedPendenciaGrupoId}
          detail={pendenciaDetalheQuery.data ?? null}
          detailsLoading={pendenciaDetalheQuery.isFetching}
          detailsError={pendenciaDetalheQuery.isError ? normalizeApiError(pendenciaDetalheQuery.error, 'Nao foi possivel carregar as pendencias.').message : null}
          onToggle={togglePendenciaGrupo}
          onOpenItem={openPendenciaItem}
          onRetryDetails={() => void pendenciaDetalheQuery.refetch()}
          onLoadMore={() => setPendenciaDetailTake((current) => current + 10)}
        />
      ) : null}

      {compact ? (
        <MobileHero jornada={jornada} />
      ) : (
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Minha Jornada</Text>
          <Text style={styles.title}>Seu dia operacional</Text>
          <Text style={styles.subtitle}>Dados pessoais do usuario autenticado no contexto ativo.</Text>
        </View>
      )}

      {!compact ? (
        <SummaryRail
          eventosHoje={jornada.eventosHoje.length}
          pendencias={jornada.pendenciasResumo?.total ?? 0}
          frequencia={jornada.frequencia?.percentualFrequencia ?? 0}
          onSelect={setActiveView}
        />
      ) : null}

      <JornadaSectionTabs
        activeView={activeView}
        compact={compact}
        isFetching={jornada.isFetching}
        onChange={setActiveView}
      />

      {jornada.partialErrors.length > 0 ? (
        <PartialErrorBanner messages={jornada.partialErrors} onRetry={jornada.refetchAll} />
      ) : null}

      {jornada.isInitialLoading && !jornada.hasAnyData ? <LoadingState /> : null}

      <View style={compact ? styles.mobileStack : styles.desktopGrid}>
        <View style={styles.column}>
          {shouldShowSection(compact, activeView, 'pendencias') ? (
            <PendenciasSection
              data={jornada.pendenciasResumo}
              status={jornada.pendenciasStatus}
              onRetry={jornada.refetchAll}
              expandedGrupoId={expandedPendenciaGrupoId}
              detail={pendenciaDetalheQuery.data ?? null}
              detailsLoading={pendenciaDetalheQuery.isFetching}
              detailsError={pendenciaDetalheQuery.isError ? normalizeApiError(pendenciaDetalheQuery.error, 'Nao foi possivel carregar as pendencias.').message : null}
              onToggle={togglePendenciaGrupo}
              onOpenItem={openPendenciaItem}
              onRetryDetails={() => void pendenciaDetalheQuery.refetch()}
              onLoadMore={() => setPendenciaDetailTake((current) => current + 10)}
            />
          ) : null}
          {shouldShowSection(compact, activeView, 'hoje') ? (
            <EventosHojeSection
              data={jornada.eventosHoje}
              status={jornada.eventosHojeStatus}
              onRetry={jornada.refetchAll}
              onSelect={selectTarget}
              onMutableAction={handleMutableAction}
            />
          ) : null}
          {shouldShowSection(compact, activeView, 'frequencia') ? (
            <FrequenciaSection
              data={jornada.frequencia}
              status={jornada.frequenciaStatus}
              onRetry={jornada.refetchAll}
              onSelect={selectTarget}
            />
          ) : null}
        </View>

        <View style={styles.column}>
          {shouldShowSection(compact, activeView, 'proximas') ? (
            <ProximasSection
              data={jornada.proximasReunioes}
              status={jornada.proximasStatus}
              onRetry={jornada.refetchAll}
              onSelect={selectTarget}
            />
          ) : null}
          {shouldShowSection(compact, activeView, 'historico') ? (
            <HistoricoSection
              data={jornada.historico}
              status={jornada.historicoStatus}
              onRetry={jornada.refetchAll}
              onSelect={selectTarget}
            />
          ) : null}
          {shouldShowSection(compact, activeView, 'aniversarios') ? (
            <AniversariosSection
              data={jornada.aniversariantes}
              status={jornada.aniversariantesStatus}
              onRetry={jornada.refetchAll}
            />
          ) : null}
        </View>

        {!compact ? (
          <JornadaActionPanel
            target={selectedTarget}
            compact={false}
            actionBlockedMessage={actionBlockedMessage}
            canOpenEvent={canOpenEvent}
            onClose={() => setSelectedTarget(null)}
            onOpenEvento={handleOpenEvento}
            onResolvePendencia={() => handleMutableAction(selectedTarget)}
          />
        ) : null}
      </View>

      {compact ? (
        <JornadaActionPanel
          target={selectedTarget}
          compact
          actionBlockedMessage={actionBlockedMessage}
          canOpenEvent={canOpenEvent}
          onClose={() => setSelectedTarget(null)}
          onOpenEvento={handleOpenEvento}
          onResolvePendencia={() => handleMutableAction(selectedTarget)}
        />
      ) : null}
    </ScreenShell>
  );
}

function ScreenShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.content, compact ? styles.mobileContent : null]}>{children}</ScrollView>
    </View>
  );
}

function MobileHero({ jornada }: { jornada: ReturnType<typeof useJornada> }) {
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const resumo = {
    total: jornada.eventosHoje.length,
    confirmados: jornada.eventosHoje.filter((item) => item.jaFezCheckin).length,
    pendentes: jornada.eventosHoje.filter((item) => !item.jaFezCheckin && item.status !== 'REALIZADA' && item.status !== 'CANCELADA').length,
  };

  return (
    <View style={styles.mobileHero}>
      <View style={styles.mobileHeroDate}>
        <Ionicons name="calendar-outline" size={16} color={colors.brandBlue} />
        <Text style={styles.mobileHeroDateText}>{today}</Text>
      </View>
      <View style={styles.heroChips}>
        <View style={styles.heroChipNeutral}><Ionicons name="calendar-outline" size={13} color={colors.textMuted} /><Text style={styles.heroChipTextNeutral}>{resumo.total} {resumo.total === 1 ? 'evento' : 'eventos'}</Text></View>
        <View style={styles.heroChipSuccess}><Ionicons name="checkmark-circle-outline" size={13} color={colors.success} /><Text style={styles.heroChipTextSuccess}>{resumo.confirmados} confirmados</Text></View>
        <View style={styles.heroChipWarning}><Ionicons name="time-outline" size={13} color={colors.warning} /><Text style={styles.heroChipTextWarning}>{resumo.pendentes} a confirmar</Text></View>
      </View>
    </View>
  );
}

function SummaryRail({
  eventosHoje,
  pendencias,
  frequencia,
  onSelect,
}: {
  eventosHoje: number;
  pendencias: number;
  frequencia: number;
  onSelect: (view: JornadaView) => void;
}) {
  return (
    <View style={styles.summaryRail}>
      <SummaryButton label="Hoje" value={String(eventosHoje)} icon="calendar-outline" onPress={() => onSelect('hoje')} />
      <SummaryButton label="Pendencias" value={String(pendencias)} icon="alert-circle-outline" onPress={() => onSelect('pendencias')} />
      <SummaryButton label="Frequencia" value={`${Math.round(frequencia)}%`} icon="pie-chart-outline" onPress={() => onSelect('frequencia')} />
    </View>
  );
}

function SummaryButton({
  label,
  value,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" style={styles.summaryButton} onPress={onPress}>
      <Ionicons name={icon} size={18} color={colors.brandBlue} />
      <View style={styles.rowText}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

function PendenciasSection({
  data,
  status,
  onRetry,
  expandedGrupoId,
  detail,
  detailsLoading,
  detailsError,
  onToggle,
  onOpenItem,
  onRetryDetails,
  onLoadMore,
}: {
  data: JornadaPendenciasResumo | null;
  status: SectionStatus;
  onRetry: () => void;
  expandedGrupoId: number | null;
  detail: JornadaPendenciasDetalhe | null;
  detailsLoading: boolean;
  detailsError: string | null;
  onToggle: (grupoId: number) => void;
  onOpenItem: (item: JornadaPendenciasDetalhe['itens'][number]) => void;
  onRetryDetails: () => void;
  onLoadMore: () => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const groupLimit = compact ? 4 : 8;
  const [showAllGroups, setShowAllGroups] = useState(false);

  const state = (
    <SectionState status={status} empty={!data || data.total === 0} emptyMessage="Nenhuma pendencia aberta." onRetry={onRetry}>
      {data ? (
        <View style={compact ? styles.mobilePendencySummary : styles.pendencySummary}>
          {!compact ? (
            <View style={[styles.metricCard, getPendencySeverityStyle(data.maiorAtrasoDias)]}>
              <Text style={styles.metricValue}>{data.total}</Text>
              <Text style={styles.metricLabel}>sem registro</Text>
            </View>
          ) : null}
          {compact ? (
            <View style={styles.pendingChips}>
              {data.atrasadas > 0 ? <Text style={styles.pendingChipDanger}>{data.atrasadas} atrasadas</Text> : null}
              {data.naSemana > 0 ? <Text style={data.atrasadas > 0 ? styles.pendingChipDanger : styles.pendingChipWarning}>{data.naSemana} na semana</Text> : null}
              {data.noDia > 0 ? <Text style={data.atrasadas > 0 ? styles.pendingChipDanger : styles.pendingChipInfo}>{data.noDia} hoje</Text> : null}
            </View>
          ) : null}
          <View style={styles.pendencyGroups}>
            {(showAllGroups ? data.grupos : data.grupos.slice(0, groupLimit)).map((grupo) => {
              const isExpanded = expandedGrupoId === grupo.grupoId;
              const grupoDetail = isExpanded ? detail : null;
              const grupoTemAtrasadas = grupo.atrasadas > 0;
              return (
                <View key={grupo.grupoId} style={compact ? styles.mobilePendencyGroupWrap : null}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${isExpanded ? 'Recolher' : 'Abrir'} pendencias de ${grupo.grupoNome}`}
                    accessibilityState={{ expanded: isExpanded }}
                    style={[styles.rowItem, compact ? styles.mobilePendencyGroup : null, compact ? getMobilePendencyToneStyle(grupoTemAtrasadas ? 'atrasado' : 'semana') : null]}
                    onPress={() => onToggle(grupo.grupoId)}
                  >
                    <Ionicons name={isExpanded ? 'chevron-down-outline' : 'chevron-forward-outline'} size={16} color={compact && grupoTemAtrasadas ? colors.error : colors.textMuted} />
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{grupo.grupoNome}</Text>
                      {compact ? (
                        <View style={styles.pendencyMetaChips}>
                          {grupo.atrasadas > 0 ? <Text style={styles.groupMetaDanger}>{grupo.atrasadas} atrasadas</Text> : null}
                          {grupo.naSemana > 0 ? <Text style={styles.groupMetaWarning}>{grupo.naSemana} na semana</Text> : null}
                          {grupo.noDia > 0 ? <Text style={styles.groupMetaInfo}>{grupo.noDia} hoje</Text> : null}
                        </View>
                      ) : <Text style={styles.rowMeta}>{formatPendencySummary(grupo)}</Text>}
                    </View>
                    <Text style={[styles.countBadge, compact && grupoTemAtrasadas ? styles.countBadgeDanger : null]}>{grupo.total}</Text>
                  </Pressable>

                  {isExpanded ? (
                    <View style={compact ? styles.mobilePendencyDetails : styles.pendencyDetails}>
                      {detailsLoading ? <Text style={styles.detailMeta}>Carregando...</Text> : null}
                      {!detailsLoading && detailsError ? (
                        <View>
                          <Text style={styles.detailMeta}>{detailsError}</Text>
                          <Pressable accessibilityRole="button" style={styles.pendencyMoreButton} onPress={onRetryDetails}>
                            <Text style={styles.pendencyMoreText}>Tentar novamente</Text>
                          </Pressable>
                        </View>
                      ) : null}
                      {!detailsLoading && !detailsError && !grupoDetail?.itens.length ? <Text style={styles.detailMeta}>Nenhuma pendencia encontrada.</Text> : null}
                      {grupoDetail?.itens.map((item, index) => {
                        const tone = getPendingItemTone(item.dataHora);
                        return (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Abrir ${item.eventoTitulo}`}
                            key={`${item.ocorrenciaId}:${item.eventoId}:${item.dataHora}:${index}`}
                            style={[styles.pendencyDetailItem, getMobilePendencyToneStyle(tone)]}
                            onPress={() => onOpenItem(item)}
                          >
                            <View style={styles.rowText}>
                              <Text numberOfLines={1} style={styles.detailTitle}>{item.eventoTitulo}</Text>
                              <View style={styles.detailDate}>
                                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                                <Text style={styles.detailMeta}>{formatShortDate(item.dataHora)}</Text>
                              </View>
                            </View>
                            <View style={[styles.pendingItemBadge, tone === 'atrasado' ? styles.pendingItemBadgeDanger : styles.pendingItemBadgeWarning]}>
                              <View style={styles.pendingItemBadgeTitleRow}>
                                <Ionicons name={tone === 'atrasado' ? 'warning-outline' : 'time-outline'} size={12} color={tone === 'atrasado' ? colors.error : colors.warning} />
                                <Text style={styles.pendingItemBadgeTitle}>{getPendingItemLabel(item.dataHora)}</Text>
                              </View>
                              <Text style={styles.pendingItemBadgeMeta}>{getPendingItemDaysLabel(item.dataHora)}</Text>
                            </View>
                            <Ionicons name="arrow-forward-outline" size={17} color={tone === 'atrasado' ? colors.error : colors.warning} />
                          </Pressable>
                        );
                      })}
                      {grupoDetail?.temMais && !detailsLoading ? (
                        <Pressable accessibilityRole="button" style={styles.pendencyMoreButton} onPress={onLoadMore}>
                          <Text style={styles.pendencyMoreText}>Ver mais</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
            {data.grupos.length > groupLimit ? (
              <Pressable accessibilityRole="button" accessibilityLabel={showAllGroups ? 'Mostrar menos grupos' : 'Mostrar todos os grupos com pendencia'} style={styles.pendencyMoreButton} onPress={() => setShowAllGroups((value) => !value)}>
                <Text style={styles.pendencyMoreText}>{showAllGroups ? 'Ver menos' : `Ver mais ${data.grupos.length - groupLimit} grupo(s)`}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </SectionState>
  );

  if (!compact) return <Section title="Precisa de voce" icon="alert-circle-outline">{state}</Section>;

  return (
    <View style={[styles.mobilePendencyCard, data ? getPendencySeverityStyle(data.maiorAtrasoDias) : null]}>
      <View style={styles.mobilePendencyHeader}>
        <View style={styles.mobilePendencyIcon}><Ionicons name="alert-circle-outline" size={16} color={colors.error} /></View>
        <View style={styles.rowText}>
          <Text style={styles.mobilePendencyTitle}>Precisa de voce</Text>
          {data ? <Text style={styles.mobilePendencySubtitle}>{data.total} {data.total === 1 ? 'presenca pendente' : 'presencas pendentes'}</Text> : null}
        </View>
      </View>
      {state}
    </View>
  );
}

function EventosHojeSection({
  data,
  status,
  onRetry,
  onSelect,
  onMutableAction,
}: {
  data: JornadaEventoHoje[];
  status: SectionStatus;
  onRetry: () => void;
  onSelect: (target: JornadaActionTarget) => void;
  onMutableAction: (target: JornadaActionTarget) => void;
}) {
  return (
    <Section title="Eventos de hoje" icon="calendar-outline">
      <SectionState status={status} empty={data.length === 0} emptyMessage="Nenhum evento para hoje." onRetry={onRetry}>
        <View style={styles.list}>
          {data.map((evento) => (
            <Pressable
              accessibilityRole="button"
              key={`${evento.ocorrenciaId}:${evento.eventoId}`}
              style={styles.eventCard}
              onPress={() => onSelect(toEventoTarget(evento))}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{evento.titulo}</Text>
                <Text style={styles.rowMeta}>
                  {formatTime(evento.inicioEm)} | {evento.grupoNome}
                </Text>
                {evento.local ? <Text style={styles.rowMeta}>{evento.local}</Text> : null}
              </View>
              <View style={styles.statusLine}>
                <StatusPill status={evento.status} />
                <Text style={styles.statusMessage}>{evento.mensagemCheckin}</Text>
              </View>
              {evento.podeFazerCheckin ? (
                <Pressable
                  accessibilityRole="button"
                  style={styles.primaryAction}
                  onPress={() => {
                    const target = toEventoTarget(evento);
                    onSelect(target);
                    onMutableAction(target);
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.surfacePrimary} />
                  <Text adjustsFontSizeToFit numberOfLines={1} style={styles.primaryActionText}>
                    Registrar presenca
                  </Text>
                </Pressable>
              ) : null}
            </Pressable>
          ))}
        </View>
      </SectionState>
    </Section>
  );
}

function FrequenciaSection({
  data,
  status,
  onRetry,
  onSelect,
}: {
  data: JornadaFrequencia | null;
  status: SectionStatus;
  onRetry: () => void;
  onSelect: (target: JornadaActionTarget) => void;
}) {
  return (
    <Section title="Minha frequencia" icon="pie-chart-outline">
      <SectionState
        status={status}
        empty={!data || data.totalParticipacoes === 0}
        emptyMessage="Sem participacoes registradas no periodo."
        onRetry={onRetry}
      >
        {data ? (
          <Pressable
            accessibilityRole="button"
            style={styles.metricsGrid}
            onPress={() =>
              onSelect({
                kind: 'frequencia',
                title: 'Minha frequencia',
                subtitle: `${Math.round(data.percentualFrequencia)}% nos ultimos 30 dias`,
              })
            }
          >
            <MetricCard label="Frequencia" value={`${Math.round(data.percentualFrequencia)}%`} accent={colors.brandBlue} />
            <MetricCard label="Presencas" value={String(data.totalPresencas)} accent={colors.success} />
            <MetricCard label="Ausencias" value={String(data.totalAusencias)} accent={colors.error} />
            <MetricCard label="Pendentes" value={String(data.totalPendentes)} accent={colors.warning} />
          </Pressable>
        ) : null}
      </SectionState>
    </Section>
  );
}

function ProximasSection({
  data,
  status,
  onRetry,
  onSelect,
}: {
  data: JornadaProximaReuniao[];
  status: SectionStatus;
  onRetry: () => void;
  onSelect: (target: JornadaActionTarget) => void;
}) {
  return (
    <Section title="Proximas reunioes" icon="notifications-outline">
      <SectionState status={status} empty={data.length === 0} emptyMessage="Nenhuma reuniao futura encontrada." onRetry={onRetry}>
        <View style={styles.list}>
          {data.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              style={styles.rowItem}
              onPress={() =>
                onSelect({
                  kind: 'evento',
                  title: item.eventoTitulo,
                  subtitle: `${formatDateTime(item.inicioEm)} | ${item.grupoNome}`,
                  eventoId: item.eventoId,
                  ocorrenciaId: item.id,
                })
              }
            >
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{formatDay(item.inicioEm)}</Text>
                <Text style={styles.dateMonth}>{formatMonth(item.inicioEm)}</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.eventoTitulo}</Text>
                <Text style={styles.rowMeta}>
                  {formatDateTime(item.inicioEm)} | {item.grupoNome}
                </Text>
                {item.local ? <Text style={styles.rowMeta}>{item.local}</Text> : null}
              </View>
              <Text style={styles.countBadge}>{item.diasRestantes}d</Text>
            </Pressable>
          ))}
        </View>
      </SectionState>
    </Section>
  );
}

function HistoricoSection({
  data,
  status,
  onRetry,
  onSelect,
}: {
  data: JornadaHistoricoItem[];
  status: SectionStatus;
  onRetry: () => void;
  onSelect: (target: JornadaActionTarget) => void;
}) {
  return (
    <Section title="Historico" icon="time-outline">
      <SectionState status={status} empty={data.length === 0} emptyMessage="Nenhum historico disponivel." onRetry={onRetry}>
        <View style={styles.list}>
          {data.slice(0, 12).map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              style={styles.rowItem}
              onPress={() =>
                onSelect({
                  kind: 'historico',
                  title: item.eventoTitulo,
                  subtitle: `${formatDate(item.ocorridoEm)} | ${item.status}`,
                })
              }
            >
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.eventoTitulo}</Text>
                <Text style={styles.rowMeta}>{formatDate(item.ocorridoEm)}</Text>
              </View>
              <StatusPill status={item.status} />
            </Pressable>
          ))}
        </View>
      </SectionState>
    </Section>
  );
}

function AniversariosSection({
  data,
  status,
  onRetry,
}: {
  data: JornadaAniversariante[];
  status: SectionStatus;
  onRetry: () => void;
}) {
  return (
    <Section title="Aniversariantes" icon="gift-outline">
      <SectionState status={status} empty={data.length === 0} emptyMessage="Nenhum aniversario nos proximos 30 dias." onRetry={onRetry}>
        <View style={styles.birthdayList}>
          {data.map((item) => (
            <View key={`${item.tipo}:${item.id}`} style={[styles.birthdayItem, item.fazAniversarioHoje ? styles.birthdayToday : null]}>
              <View style={styles.birthdayAvatar}><Text style={styles.birthdayAvatarText}>{item.nome.charAt(0).toUpperCase()}</Text></View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.nome}</Text>
                <Text style={styles.rowMeta}>{formatBirthday(item.dataNascimento)}</Text>
              </View>
              <Text style={[styles.birthdayTag, item.fazAniversarioHoje ? styles.birthdayTagToday : null]}>
                {item.fazAniversarioHoje ? 'Hoje!' : item.diasParaAniversario === 1 ? 'Amanha' : `Em ${item.diasParaAniversario} dias`}
              </Text>
            </View>
          ))}
        </View>
      </SectionState>
    </Section>
  );
}

function Section({ title, icon, children }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={colors.brandBlue} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function SectionState({
  status,
  empty,
  emptyMessage,
  children,
  onRetry,
}: {
  status: SectionStatus;
  empty: boolean;
  emptyMessage: string;
  children: ReactNode;
  onRetry: () => void;
}) {
  if (status.kind === 'loading') return <LoadingState compact />;
  if (status.kind === 'error') {
    return <ErrorState title="Falha ao carregar" message={status.message ?? 'Tente novamente.'} onRetry={onRetry} compact />;
  }
  if (empty) return <EmptyState message={emptyMessage} />;

  return children;
}

function PartialErrorBanner({ messages, onRetry }: { messages: string[]; onRetry: () => void }) {
  return (
    <View style={styles.partialError}>
      <Ionicons name="warning-outline" size={20} color={colors.warning} />
      <View style={styles.rowText}>
        <Text style={styles.partialTitle}>Algumas secoes nao carregaram</Text>
        <Text style={styles.partialText}>{messages.slice(0, 2).join(' | ')}</Text>
      </View>
      <RetryButton onRetry={onRetry} compact />
    </View>
  );
}

function LoadingState({ compact }: { compact?: boolean }) {
  return (
    <View style={[styles.statePanel, compact ? styles.statePanelCompact : null]}>
      <View style={styles.skeletonLineWide} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineShort} />
    </View>
  );
}

function ErrorState({
  title,
  message,
  compact,
  onRetry,
}: {
  title: string;
  message: string;
  compact?: boolean;
  onRetry: () => void;
}) {
  return (
    <View style={[styles.statePanel, styles.errorPanel, compact ? styles.statePanelCompact : null]}>
      <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
      <View style={styles.rowText}>
        <Text style={styles.errorTitle}>{title}</Text>
        <Text style={styles.errorMessage}>{message}</Text>
      </View>
      <RetryButton onRetry={onRetry} />
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyPanel}>
      <Ionicons name="file-tray-outline" size={22} color={colors.textMuted} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function RetryButton({ compact, onRetry }: { compact?: boolean; onRetry: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={[styles.retryButton, compact ? styles.retryButtonCompact : null]} onPress={onRetry}>
      <Ionicons name="refresh-outline" size={16} color={colors.brandBlue} />
      <Text style={styles.retryText}>Tentar novamente</Text>
    </Pressable>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: accent }]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const color = normalized.includes('PRESENTE') || normalized.includes('CONFIRMADO')
    ? colors.success
    : normalized.includes('AUSENTE') || normalized.includes('CANCELADA')
      ? colors.error
      : normalized.includes('PENDENTE')
        ? colors.warning
        : colors.info;

  return (
    <View style={[styles.statusPill, { borderColor: color }]}>
      <Text style={[styles.statusPillText, { color }]}>{normalized}</Text>
    </View>
  );
}

function toEventoTarget(evento: JornadaEventoHoje): JornadaActionTarget {
  return {
    kind: 'evento',
    title: evento.titulo,
    subtitle: `${formatTime(evento.inicioEm)} | ${evento.grupoNome}`,
    eventoId: evento.eventoId,
    ocorrenciaId: evento.ocorrenciaId,
    mutableActionLabel: evento.podeFazerCheckin ? 'Registrar presenca' : undefined,
  };
}

function getEventoAnalyticsExtra(target: JornadaActionTarget | null) {
  if (!target || target.kind !== 'evento') {
    return {
      evento_id: null,
      ocorrencia_id: null,
    };
  }

  return {
    evento_id: target.eventoId,
    ocorrencia_id: target.ocorrenciaId ?? null,
  };
}

function shouldShowSection(compact: boolean, activeView: JornadaView, section: JornadaView | 'pendencias') {
  return !compact || activeView === section;
}

function formatPendencySummary(grupo: { atrasadas: number; naSemana: number; noDia: number; total: number }) {
  const parts = [];
  if (grupo.atrasadas > 0) parts.push(`${grupo.atrasadas} atrasadas`);
  if (grupo.naSemana > 0) parts.push(`${grupo.naSemana} na semana`);
  if (grupo.noDia > 0) parts.push(`${grupo.noDia} hoje`);
  return parts.length > 0 ? parts.join(' | ') : `${grupo.total} sem presenca`;
}

function getPendencySeverityStyle(dias: number) {
  if (dias > 7) return { borderLeftColor: colors.error };
  if (dias > 0) return { borderLeftColor: colors.warning };
  return { borderLeftColor: colors.info };
}

type PendingItemTone = 'atrasado' | 'semana';

function getPendingItemTone(value: string): PendingItemTone {
  return getPendingItemDays(value) > 7 ? 'atrasado' : 'semana';
}

function getPendingItemDays(value: string) {
  const date = getLocalDateStart(value);
  const today = getLocalDateStart(new Date().toISOString());
  if (!date || !today) return 0;
  return Math.floor((today.getTime() - date.getTime()) / 86400000);
}

function getPendingItemLabel(value: string) {
  const days = getPendingItemDays(value);
  if (days > 7) return 'Atrasado';
  if (days === 0) return 'Hoje';
  if (days < 0) return 'Futuro';
  return 'Na semana';
}

function getPendingItemDaysLabel(value: string) {
  const days = getPendingItemDays(value);
  if (days < 0) return days === -1 ? 'amanha' : `em ${Math.abs(days)} dias`;
  if (days === 0) return 'pendente';
  return days === 1 ? '1 dia' : `${days} dias`;
}

function getLocalDateStart(value: string) {
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(date.getTime()) ? date : null;
}

function getMobilePendencyToneStyle(tone: PendingItemTone) {
  return tone === 'atrasado'
    ? { borderColor: '#FCA5A5', borderLeftColor: colors.error, backgroundColor: '#FEF2F2' }
    : { borderColor: '#FCD34D', borderLeftColor: colors.warning, backgroundColor: '#FFFBEB' };
}

function formatDate(value: string) {
  return formatDatePart(value, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatShortDate(value: string) {
  const date = getLocalDateStart(value);
  if (!date) return '--/--/--';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Data nao informada';
  return `${formatDate(value)} ${formatTime(value)}`;
}

function formatTime(value: string) {
  return formatDatePart(value, { hour: '2-digit', minute: '2-digit' });
}

function formatBirthday(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'Data nao informada';
}

function formatDay(value: string) {
  return formatDatePart(value, { day: '2-digit' });
}

function formatMonth(value: string) {
  return formatDatePart(value, { month: 'short' }).replace('.', '');
}

function formatDatePart(value: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '--';
  return date.toLocaleDateString('pt-BR', options);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfacePage,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mobileContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.caption,
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    color: colors.brandBlue,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h1,
    color: colors.textHeading,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  mobileHero: {
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  mobileHeroDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mobileHeroDateText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  heroChipNeutral: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.sm,
  },
  heroChipSuccess: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.sm,
  },
  heroChipWarning: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.full,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: spacing.sm,
  },
  heroChipTextNeutral: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  heroChipTextSuccess: { ...typography.caption, color: colors.success, fontWeight: '700' },
  heroChipTextWarning: { ...typography.caption, color: colors.warning, fontWeight: '700' },
  summaryRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryButton: {
    minWidth: 140,
    minHeight: 64,
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  mobileStack: {
    gap: spacing.lg,
  },
  desktopGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  column: {
    flex: 1,
    minWidth: 0,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textHeading,
  },
  list: {
    gap: spacing.sm,
  },
  eventCard: {
    minHeight: 88,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  rowItem: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  rowTitle: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: '700',
  },
  rowMeta: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  statusLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusMessage: {
    ...typography.bodySmall,
    flexShrink: 1,
    color: colors.textSecondary,
  },
  statusPill: {
    minHeight: 28,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
  },
  statusPillText: {
    ...typography.caption,
    fontWeight: '700',
  },
  primaryAction: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.brandBlue,
    paddingHorizontal: spacing.md,
  },
  primaryActionText: {
    ...typography.bodySmall,
    maxWidth: '100%',
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  metricsGrid: {
    minHeight: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    minWidth: 132,
    flexGrow: 1,
    gap: spacing.xs,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: colors.borderSubtle,
    borderLeftColor: colors.brandBlue,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  metricValue: {
    ...typography.h2,
    color: colors.textHeading,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pendencySummary: {
    gap: spacing.sm,
  },
  mobilePendencyCard: {
    gap: spacing.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#FCA5A5',
    borderRadius: radius.md,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.sm,
  },
  mobilePendencyHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  mobilePendencyIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radius.full,
    backgroundColor: '#FEF2F2',
  },
  mobilePendencyTitle: {
    ...typography.bodySmall,
    color: '#991B1B',
    fontWeight: '800',
  },
  mobilePendencySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mobilePendencySummary: {
    gap: spacing.sm,
  },
  mobilePendencyMetric: {
    minHeight: 96,
    borderLeftWidth: 4,
    borderRadius: radius.md,
  },
  pendingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pendingChipDanger: {
    ...typography.caption,
    borderRadius: radius.full,
    backgroundColor: '#FEF2F2',
    color: colors.error,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pendingChipWarning: {
    ...typography.caption,
    borderRadius: radius.full,
    backgroundColor: '#FFFBEB',
    color: colors.warning,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pendingChipInfo: {
    ...typography.caption,
    borderRadius: radius.full,
    backgroundColor: '#EFF6FF',
    color: colors.brandBlue,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pendencyGroups: {
    gap: spacing.sm,
  },
  mobilePendencyGroup: {
    minHeight: 54,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  mobilePendencyGroupWrap: {
    gap: spacing.xs,
  },
  pendencyDetails: {
    gap: spacing.xs,
    paddingLeft: spacing.md,
  },
  mobilePendencyDetails: {
    gap: spacing.xs,
    paddingLeft: spacing.md,
  },
  pendencyDetailItem: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pendencyMetaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  groupMetaDanger: {
    ...typography.caption,
    borderRadius: radius.full,
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  groupMetaWarning: {
    ...typography.caption,
    borderRadius: radius.full,
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  groupMetaInfo: {
    ...typography.caption,
    borderRadius: radius.full,
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeDanger: {
    backgroundColor: colors.error,
    color: colors.surfacePrimary,
  },
  detailDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pendingItemBadge: {
    minWidth: 84,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  pendingItemBadgeDanger: {
    borderColor: '#FCA5A5',
    backgroundColor: colors.surfacePrimary,
  },
  pendingItemBadgeWarning: {
    borderColor: '#FCD34D',
    backgroundColor: colors.surfacePrimary,
  },
  pendingItemBadgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pendingItemBadgeTitle: {
    ...typography.caption,
    color: colors.textHeading,
    fontWeight: '800',
  },
  pendingItemBadgeMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailTitle: {
    ...typography.bodySmall,
    color: colors.textBody,
    fontWeight: '700',
  },
  detailMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pendencyMoreButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
  },
  pendencyMoreText: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: '800',
  },
  countBadge: {
    ...typography.caption,
    minWidth: 34,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    color: colors.textBody,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  dateBox: {
    width: 48,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
  },
  dateDay: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: '700',
  },
  dateMonth: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  birthdayList: {
    gap: spacing.sm,
  },
  birthdayItem: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.sm,
  },
  birthdayToday: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  birthdayAvatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: '#EEF5FF',
  },
  birthdayAvatarText: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '800' },
  birthdayTag: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: '700',
  },
  birthdayTagToday: { color: colors.success },
  partialError: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  partialTitle: {
    ...typography.bodySmall,
    color: colors.textHeading,
    fontWeight: '700',
  },
  partialText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statePanel: {
    minHeight: 120,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  statePanelCompact: {
    minHeight: 82,
  },
  errorPanel: {
    borderColor: colors.error,
  },
  errorTitle: {
    ...typography.body,
    color: colors.textHeading,
    fontWeight: '700',
  },
  errorMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyPanel: {
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePrimary,
    padding: spacing.md,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  skeletonLineWide: {
    width: '76%',
    height: 18,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  skeletonLine: {
    width: '56%',
    height: 14,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  skeletonLineShort: {
    width: '36%',
    height: 14,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
  },
  retryButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  retryButtonCompact: {
    minWidth: 44,
  },
  retryText: {
    ...typography.bodySmall,
    color: colors.brandBlue,
    fontWeight: '700',
  },
});
