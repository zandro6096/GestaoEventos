import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { MesRelatorio, PendenciaCelula } from '../../../services/api/relatorios-mensais-api';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import { layoutMetrics } from '../../../shared/theme';
import { salvaDireto } from './salvarPlanilha';
import { useRelatoriosMensais, type PlanilhaPronta } from './useRelatoriosMensais';

// Relatórios do mês (alternativa B): um cartão por mês com o status da planilha, pendências por célula
// e download. A planilha é o modelo que a equipe publicou para a estrutura, preenchido pelo servidor.

export function RelatoriosMensaisScreen() {
  const state = useRelatoriosMensais();
  const { width } = useWindowDimensions();
  const compact = width < layoutMetrics.desktopBreakpoint;
  const modelos = state.modelos.data ?? [];
  const dados = state.meses.data;
  const modeloAtual = modelos.find((m) => m.id === state.modeloId);
  // O mês fechado mais recente é o destaque (é o que o discipulador entrega).
  const destaque = dados?.meses.find((m) => m.status !== 'em_andamento');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.content, compact && styles.compact]}>
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Relatórios do mês</Text>
          <Text style={styles.subtitle}>
            {modeloAtual ? `${modeloAtual.nome} · ${modeloAtual.grupoNome}` : 'Planilhas mensais preparadas para a sua estrutura.'}
          </Text>
        </View>

        {modelos.length > 1 ? (
          <View style={styles.chips} accessibilityRole="tablist">
            {modelos.map((m) => {
              const ativo = m.id === state.modeloId;
              return (
                <Pressable key={m.id} accessibilityRole="tab" accessibilityState={{ selected: ativo }} style={[styles.chip, ativo && styles.chipOn]} onPress={() => state.escolherModelo(m.id)}>
                  <Text style={[styles.chipText, ativo && styles.chipTextOn]}>{m.grupoNome || m.nome}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {state.modelos.isLoading || state.meses.isLoading ? (
          <View style={styles.estado}>
            <ActivityIndicator color={colors.brandBlue} />
            <Text style={styles.muted}>Conferindo os lançamentos de cada mês…</Text>
          </View>
        ) : !modelos.length ? (
          <View style={styles.estado}>
            <Ionicons name="document-text-outline" size={28} color={colors.textMuted} />
            <Text style={styles.estadoTitulo}>Nenhum relatório mensal disponível</Text>
            <Text style={styles.muted}>Quando a equipe publicar a planilha da sua rede, ela aparece aqui.</Text>
          </View>
        ) : state.erroMeses ? (
          <View style={styles.estado}>
            <Ionicons name="cloud-offline-outline" size={28} color={colors.error} />
            <Text style={styles.estadoTitulo}>{state.erroMeses}</Text>
            <Pressable accessibilityRole="button" style={styles.btn2} onPress={() => void state.meses.refetch()}><Text style={styles.btn2Text}>Tentar de novo</Text></Pressable>
          </View>
        ) : (
          <View style={styles.lista}>
            {dados?.meses.map((mes) => (
              <CartaoMes
                key={`${mes.ano}-${mes.mes}`}
                mes={mes}
                destaque={mes === destaque}
                gerando={state.gerandoMes === mes}
                ocupado={state.gerar.isPending}
                onPendencias={() => state.verPendencias(mes)}
                onBaixar={() => state.gerar.mutate(mes)}
              />
            ))}
            {state.erroGerar && !state.pendenciasDe ? <Text style={styles.erro} accessibilityRole="alert">{state.erroGerar}</Text> : null}
          </View>
        )}
      </ScrollView>

      <PendenciasSheet
        mes={state.pendenciasDe}
        gerando={state.gerar.isPending}
        erro={state.erroGerar}
        onFechar={() => state.verPendencias(null)}
        onBaixar={(mes) => state.gerar.mutate(mes)}
      />
      <ProntaSheet arquivo={state.pronta} onFechar={state.fecharPronta} onSalvar={state.salvar} />
    </SafeAreaView>
  );
}

function CartaoMes({ mes, destaque, gerando, ocupado, onPendencias, onBaixar }: {
  mes: MesRelatorio; destaque: boolean; gerando: boolean; ocupado: boolean; onPendencias: () => void; onBaixar: () => void;
}) {
  const andamento = mes.status === 'em_andamento';
  return (
    <View style={[styles.card, destaque && styles.cardDestaque]}>
      <View style={styles.cardTopo}>
        <Text style={styles.mes}>{mes.rotulo}</Text>
        {andamento ? <Text style={styles.muted}>em andamento</Text>
          : mes.totalPendencias > 0 ? <Text style={styles.badgePend}>{mes.totalPendencias} {mes.totalPendencias === 1 ? 'pendência' : 'pendências'}</Text>
          : <Text style={styles.badgeOk}>Completo</Text>}
      </View>
      <Text style={styles.muted}>
        {andamento
          ? `Fecha em ${dataCurta(mes.fechaEm)} · ${mes.celulasComPresenca} de ${mes.celulas} ${mes.celulas === 1 ? 'célula' : 'células'} com presença lançada`
          : `${mes.celulas} ${mes.celulas === 1 ? 'célula' : 'células'} · ${mes.pessoas} pessoas · ${mes.presencasLancadas} presenças lançadas`}
      </Text>
      <View style={styles.acoes}>
        {mes.totalPendencias > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Ver pendências de ${mes.rotulo}`} style={styles.btn2} onPress={onPendencias}>
            <Text style={styles.btn2Text}>Ver pendências</Text>
          </Pressable>
        ) : null}
        {!andamento ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Baixar Excel de ${mes.rotulo}`} accessibilityState={{ busy: gerando, disabled: ocupado }}
            disabled={ocupado} style={[destaque ? styles.btn : styles.btn2, ocupado && !gerando && styles.desabilitado]} onPress={onBaixar}>
            {gerando ? <ActivityIndicator size="small" color={destaque ? '#fff' : colors.brandBlue} /> : null}
            <Text style={destaque ? styles.btnText : styles.btn2Text}>{gerando ? 'Gerando…' : 'Baixar Excel'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function PendenciasSheet({ mes, gerando, erro, onFechar, onBaixar }: {
  mes: MesRelatorio | null; gerando: boolean; erro: string | null; onFechar: () => void; onBaixar: (mes: MesRelatorio) => void;
}) {
  return (
    <Modal transparent visible={Boolean(mes)} animationType="slide" onRequestClose={onFechar}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Fechar pendências" onPress={onFechar} />
        {mes ? (
          <View style={styles.sheet} accessibilityViewIsModal>
            <View style={styles.grabber} />
            <View style={styles.sheetHeader}>
              <View style={styles.flex}>
                <Text style={styles.sheetTitle}>{mes.rotulo}</Text>
                <Text style={styles.muted}>O que falta para a planilha ficar completa</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" style={styles.fechar} onPress={onFechar}>
                <Ionicons name="close" size={20} color={colors.textHeading} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.sheetBody}>
              {mes.pendencias.map((p) => <CartaoPendencia key={p.grupoId} pendencia={p} />)}
              <Text style={styles.muted}>Quem não tem presença lançada sai como falta (F) nas semanas em que houve célula ou culto.</Text>
            </ScrollView>
            <View style={styles.sheetRodape}>
              {erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}
              {mes.status === 'em_andamento' ? (
                <Pressable accessibilityRole="button" style={[styles.btn, styles.flex]} onPress={onFechar}><Text style={styles.btnText}>Entendi</Text></Pressable>
              ) : (
                <Pressable accessibilityRole="button" accessibilityState={{ busy: gerando }} disabled={gerando} style={[styles.btn, styles.flex]} onPress={() => onBaixar(mes)}>
                  {gerando ? <ActivityIndicator size="small" color="#fff" /> : null}
                  <Text style={styles.btnText}>{gerando ? 'Gerando…' : 'Baixar mesmo assim'}</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function CartaoPendencia({ pendencia }: { pendencia: PendenciaCelula }) {
  return (
    <View style={styles.pendCard}>
      <Text style={styles.pendNome}>{pendencia.nome}</Text>
      {pendencia.itens.map((item) => (
        <View key={item.codigo} style={styles.item}>
          <Ionicons name={item.ok ? 'checkmark-circle' : 'alert-circle-outline'} size={18} color={item.ok ? '#059669' : '#B45309'} />
          <Text style={[styles.itemTexto, item.ok && styles.itemOk]}>{item.texto}</Text>
        </View>
      ))}
    </View>
  );
}

function ProntaSheet({ arquivo, onFechar, onSalvar }: {
  arquivo: PlanilhaPronta | null; onFechar: () => void; onSalvar: (arquivo: PlanilhaPronta) => Promise<void>;
}) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvoDe, setSalvoDe] = useState<PlanilhaPronta | null>(null);
  const salvo = salvoDe === arquivo && arquivo !== null;

  async function salvar() {
    if (!arquivo) return;
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar(arquivo);
      setSalvoDe(arquivo);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar o arquivo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal transparent visible={Boolean(arquivo)} animationType="slide" onRequestClose={onFechar}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Fechar" onPress={onFechar} />
        {arquivo ? (
          <View style={[styles.sheet, styles.sheetPronta]} accessibilityViewIsModal accessibilityLabel="Planilha pronta">
            <View style={styles.arquivoLinha}>
              <View style={styles.arquivoIcone}><Ionicons name="document-text" size={24} color="#059669" /></View>
              <View style={styles.flex}>
                <Text style={styles.arquivoNome} numberOfLines={2}>{arquivo.nomeArquivo}</Text>
                <Text style={styles.muted}>
                  {Math.max(1, Math.round(arquivo.tamanhoBytes / 1024))} KB{arquivo.nomeArquivo.toLowerCase().endsWith('.xlsm') ? ' · contém macros (não executadas)' : ''}
                </Text>
              </View>
            </View>
            <Text style={styles.muted}>
              {arquivo.celulas} {arquivo.celulas === 1 ? 'célula' : 'células'} · {arquivo.pessoas} pessoas · {arquivo.presencasLancadas} presenças lançadas em {arquivo.mes.rotulo.split(' ')[0].toLowerCase()}
            </Text>
            {arquivo.avisos.length ? (
              <View style={styles.aviso}>
                {arquivo.avisos.map((a) => <Text key={a} style={styles.avisoTexto}>{a}</Text>)}
              </View>
            ) : null}
            {erro ? <Text style={styles.erro} accessibilityRole="alert">{erro}</Text> : null}
            {salvo && salvaDireto ? <Text style={styles.salvo}>Baixado. Abra pela pasta de downloads.</Text> : null}
            <Pressable accessibilityRole="button" accessibilityState={{ busy: salvando }} disabled={salvando} style={styles.btnGrande} onPress={() => void salvar()}>
              {salvando ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name={salvaDireto ? 'download-outline' : 'share-outline'} size={18} color="#fff" />}
              <Text style={styles.btnText}>{salvaDireto ? (salvo ? 'Baixar de novo' : 'Baixar') : 'Compartilhar ou abrir no Excel'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.btnGrande2} onPress={onFechar}>
              <Text style={styles.btn2Text}>Fechar</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function dataCurta(iso: string) {
  const [, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfacePage },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: spacing.lg, gap: spacing.md },
  compact: { padding: spacing.md },
  pageHeader: { gap: 2, borderTopWidth: 3, borderTopColor: colors.brandBlue, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary, padding: spacing.md },
  title: { ...typography.h3, color: colors.textHeading },
  subtitle: { ...typography.caption, color: colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderDefault, backgroundColor: colors.surfacePrimary },
  chipOn: { backgroundColor: colors.brandBlue, borderColor: colors.brandBlue },
  chipText: { ...typography.bodySmall, color: colors.textBody },
  chipTextOn: { color: '#fff', fontWeight: '700' },
  estado: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary },
  estadoTitulo: { ...typography.body, fontWeight: '700', color: colors.textHeading, textAlign: 'center' },
  lista: { gap: 10 },
  card: { gap: 8, padding: 14, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md, backgroundColor: colors.surfacePrimary },
  cardDestaque: { borderColor: colors.brandBlue, boxShadow: '0 0 0 3px #BFDBFE' },
  cardTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  mes: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.textHeading },
  muted: { ...typography.caption, color: colors.textSecondary },
  badgePend: { ...typography.caption, fontWeight: '800', color: '#92400E', backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, overflow: 'hidden' },
  badgeOk: { ...typography.caption, fontWeight: '800', color: '#047857', backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, overflow: 'hidden' },
  acoes: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: spacing.sm },
  btn: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 14, borderRadius: radius.sm, backgroundColor: colors.brandBlue },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  btn2: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 14, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.borderDefault, backgroundColor: colors.surfacePrimary },
  btn2Text: { fontSize: 14, fontWeight: '700', color: colors.brandBlue },
  desabilitado: { opacity: 0.5 },
  erro: { ...typography.bodySmall, color: '#B91C1C' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  sheet: { maxHeight: '88%', width: '100%', maxWidth: 720, alignSelf: 'center', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: colors.surfacePrimary, paddingTop: 10 },
  sheetPronta: { gap: 14, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 26 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: radius.full, backgroundColor: colors.borderDefault },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingTop: 12 },
  flex: { flex: 1, minWidth: 0 },
  sheetTitle: { ...typography.h3, color: colors.textHeading },
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full },
  sheetBody: { gap: 10, padding: 20 },
  sheetRodape: { gap: 8, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingBottom: 26 },
  pendCard: { gap: 8, padding: 14, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.md },
  pendNome: { fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.textHeading },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  itemTexto: { ...typography.bodySmall, flex: 1, color: colors.textBody },
  itemOk: { color: colors.textSecondary },
  arquivoLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  arquivoIcone: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#ECFDF5' },
  arquivoNome: { fontSize: 17, lineHeight: 23, fontWeight: '700', color: colors.textHeading },
  aviso: { gap: 4, padding: 12, borderRadius: 10, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  avisoTexto: { ...typography.caption, color: '#78350F' },
  salvo: { ...typography.bodySmall, color: '#047857', fontWeight: '700' },
  btnGrande: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, backgroundColor: colors.brandBlue },
  btnGrande2: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.borderDefault },
});
