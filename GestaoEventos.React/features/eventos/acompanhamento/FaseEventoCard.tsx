import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, radius, typography } from '../../../shared/design/tokens';
import { faseNaData, fasesApi, proximaFase, type FaseEvento } from '../../../services/api/fases-api';
import { normalizeApiError } from '../../../services/api/api-error';
import { track } from '../../../services/analytics/analytics.service';

// Fase do evento (alternativa A aprovada): selo no cabeçalho com a fase da DATA da ocorrência;
// toque abre uma folha inferior com as fases em ordem, a próxima sugerida, data e histórico.
// Só aparece quando o modelo do evento tem fases. Sem permissão, a folha mostra só o histórico.

export function useFaseEvento(eventoId: number) {
  return useQuery({ queryKey: ['evento-fase', eventoId], queryFn: () => fasesApi.obterDoEvento(eventoId), enabled: eventoId > 0, retry: false });
}

type Props = { eventoId: number; dataReferencia: string };

/** Selo da fase para a linha de selos do cabeçalho do evento. */
export function FaseChip({ eventoId, dataReferencia }: Props) {
  const query = useFaseEvento(eventoId);
  const [aberto, setAberto] = useState(false);
  const [aberturas, setAberturas] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!aviso) return undefined;
    const timer = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(timer);
  }, [aviso]);

  const info = query.data;
  if (!info || !info.opcoes.length) return null; // sem modelo com fases (ou carregando): não ocupa espaço
  const naData = faseNaData(info.historico, dataReferencia);
  if (!naData && !info.podeAlterar) return null;

  const rotulo = naData?.fase ?? 'Definir fase';
  const abrir = () => { track('entrance', 'acompanhar_evento:fase_abrir'); setAberturas((n) => n + 1); setAberto(true); };

  return <>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={naData ? `Fase em ${isoParaBr(dataReferencia)}: ${naData.fase}. Ver ${info.podeAlterar ? 'ou alterar ' : ''}fase` : 'Definir fase'}
      onPress={abrir}
      style={[styles.chip, !naData && styles.chipVazio]}
    >
      <Ionicons name="flag-outline" size={14} color={colors.brandBlue} />
      <Text numberOfLines={1} style={styles.chipText}>{rotulo}</Text>
      <Ionicons name="chevron-down" size={13} color={colors.brandBlue} />
    </Pressable>
    {aviso ? <View accessibilityLiveRegion="polite" style={styles.aviso}><Ionicons name="checkmark-circle" size={14} color="#047857" /><Text style={styles.avisoText}>{aviso}</Text></View> : null}
    <FaseSheet key={aberturas} visivel={aberto} info={info} eventoId={eventoId} onFechar={() => setAberto(false)} onSalvo={(fase) => { setAberto(false); setAviso(`Fase alterada para ${fase}`); }} />
  </>;
}

/** Linha "Fase atual" para quando a data exibida é de outra fase (ex.: navegando em datas passadas). */
export function FaseAtualNota({ eventoId, dataReferencia }: Props) {
  const info = useFaseEvento(eventoId).data;
  if (!info?.atual || !info.opcoes.length) return null;
  const naData = faseNaData(info.historico, dataReferencia);
  if (naData && naData.id === info.atual.id) return null;
  return <Text style={styles.nota}>Fase atual: <Text style={styles.notaForte}>{info.atual.fase}</Text> · desde {isoParaBr(info.atual.vigenteDesde)}</Text>;
}

function FaseSheet({ visivel, info, eventoId, onFechar, onSalvo }: { visivel: boolean; info: FaseEvento; eventoId: number; onFechar: () => void; onSalvo: (fase: string) => void }) {
  const queryClient = useQueryClient();
  const atual = info.atual?.fase ?? null;
  const [fase, setFase] = useState<string | null>(() => proximaFase(info.opcoes, atual));
  const [data, setData] = useState(hojeBr());
  const [comObservacao, setComObservacao] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [erroData, setErroData] = useState<string | null>(null);


  const mutation = useMutation({
    mutationFn: (vigenteDesde: string) => fasesApi.registrar(eventoId, { fase: fase ?? '', vigenteDesde, observacao: observacao.trim() || null }),
    onSuccess: (resultado) => {
      queryClient.setQueryData(['evento-fase', eventoId], resultado);
      track('confirmation', 'acompanhar_evento:fase_registrada');
      onSalvo(fase ?? '');
    },
  });

  const idxAtual = atual ? info.opcoes.findIndex((o) => o.toLowerCase() === atual.toLowerCase()) : -1;
  const mesmaFase = !!fase && !!atual && fase.toLowerCase() === atual.toLowerCase();
  const salvar = () => {
    const iso = brParaIso(data);
    if (!iso) { setErroData('Informe a data no formato dd/mm/aaaa.'); return; }
    setErroData(null);
    track('simulation', 'acompanhar_evento:fase_salvar');
    mutation.mutate(iso);
  };

  return <Modal transparent visible={visivel} animationType="slide" onRequestClose={onFechar}>
    <View style={styles.backdrop}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar fase" style={StyleSheet.absoluteFill} onPress={onFechar} />
      <View style={styles.sheet} accessibilityViewIsModal>
        <View style={styles.grabber} />
        <View style={styles.sheetHeader}>
          <View style={styles.flex}>
            <Text style={styles.sheetTitle}>Fase</Text>
            <Text style={styles.sheetSub}>{info.atual ? <>Atual: <Text style={styles.notaForte}>{info.atual.fase}</Text> · desde {isoParaBr(info.atual.vigenteDesde)}</> : 'Ainda sem fase registrada'}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" style={styles.fechar} onPress={onFechar}><Ionicons name="close" size={18} color={colors.textSecondary} /></Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.sheetBody} keyboardShouldPersistTaps="handled">
          {info.podeAlterar ? <>
            <View style={styles.lista}>
              {info.opcoes.map((opcao, i) => {
                const concluida = idxAtual >= 0 && i < idxAtual;
                const ehAtual = i === idxAtual;
                const selecionada = fase === opcao;
                return <Pressable key={opcao} accessibilityRole="radio" accessibilityState={{ checked: selecionada }} aria-checked={selecionada} accessibilityLabel={`${opcao}${ehAtual ? ', fase atual' : ''}${i === idxAtual + 1 ? ', próxima fase' : ''}`} onPress={() => setFase(opcao)} style={[styles.linha, i > 0 && styles.linhaBorda, selecionada && styles.linhaSelecionada]}>
                  {concluida
                    ? <View style={styles.marcaFeita}><Ionicons name="checkmark" size={14} color="#059669" /></View>
                    : selecionada ? <View style={styles.radioOn} /> : <View style={styles.radioOff} />}
                  <Text style={[styles.linhaTexto, concluida && styles.linhaTextoFeita, (ehAtual || selecionada) && styles.linhaTextoForte]}>{opcao}</Text>
                  {ehAtual ? <Text style={styles.badgeAtual}>ATUAL</Text> : i === idxAtual + 1 ? <Text style={styles.badgeProxima}>PRÓXIMA</Text> : null}
                </Pressable>;
              })}
            </View>

            <View style={styles.campo}>
              <Text style={styles.rotulo}>Começou em</Text>
              <CampoData valor={data} onChange={(v) => { setData(v); setErroData(null); }} />
              {erroData ? <Text accessibilityRole="alert" style={styles.erro}>{erroData}</Text> : null}
            </View>

            {comObservacao
              ? <TextInput accessibilityLabel="Observação da mudança de fase" value={observacao} onChangeText={setObservacao} placeholder="Observação (opcional)" placeholderTextColor={colors.textMuted} maxLength={500} multiline style={[styles.input, styles.inputMulti]} />
              : <Pressable accessibilityRole="button" style={styles.linkLinha} onPress={() => setComObservacao(true)}><Ionicons name="add" size={16} color={colors.brandBlue} /><Text style={styles.link}>Adicionar observação</Text></Pressable>}

            {mutation.isError ? <Text accessibilityRole="alert" style={styles.erro}>{normalizeApiError(mutation.error, 'Não foi possível registrar a fase.').message}</Text> : null}
            {mesmaFase ? <Text style={styles.dica}>Esta já é a fase atual. Escolha outra para mudar.</Text> : null}
            <Pressable accessibilityRole="button" disabled={!fase || mesmaFase || mutation.isPending} onPress={salvar} style={[styles.botao, (!fase || mesmaFase || mutation.isPending) && styles.botaoOff]}>
              <Text style={styles.botaoTexto}>{mutation.isPending ? 'Salvando...' : fase ? `Mudar para ${fase}` : 'Escolha uma fase'}</Text>
            </Pressable>
          </> : <Text style={styles.dica}>Apenas quem gerencia este evento pode mudar a fase.</Text>}

          <MultiplicacaoPrevista info={info} eventoId={eventoId} />

          {info.historico.length ? <View style={styles.historico}>
            <Text style={styles.historicoTitulo}>HISTÓRICO</Text>
            {info.historico.map((h) => <View key={h.id} style={styles.historicoLinha}>
              <Text style={styles.historicoFase}>{h.fase}</Text>
              <Text style={styles.historicoInfo}>desde {isoParaBr(h.vigenteDesde)}{h.registradoPorNome ? ` · ${h.registradoPorNome}` : ''}</Text>
            </View>)}
          </View> : null}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

/** Data prevista de multiplicação: um campo, sem histórico (vale a última data informada). */
function MultiplicacaoPrevista({ info, eventoId }: { info: FaseEvento; eventoId: number }) {
  const queryClient = useQueryClient();
  const atual = info.multiplicacaoPrevista ? isoParaBr(info.multiplicacaoPrevista) : '';
  const [data, setData] = useState(atual);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [atualVisto, setAtualVisto] = useState(atual);
  if (atual !== atualVisto) { setAtualVisto(atual); setData(atual); }

  const mutation = useMutation({
    mutationFn: (iso: string | null) => fasesApi.definirMultiplicacao(eventoId, iso),
    onSuccess: (resultado) => {
      queryClient.setQueryData(['evento-fase', eventoId], resultado);
      track('confirmation', 'acompanhar_evento:multiplicacao_salva');
      setSalvo(true);
    },
  });

  const salvar = (limpar = false) => {
    if (limpar) { mutation.mutate(null); return; }
    const iso = brParaIso(data);
    if (!iso) { setErro('Informe a data no formato dd/mm/aaaa.'); return; }
    setErro(null);
    mutation.mutate(iso);
  };

  return <View style={styles.multiplicacao}>
    <Text style={styles.historicoTitulo}>MULTIPLICAÇÃO PREVISTA</Text>
    {info.podeAlterar ? <>
      <CampoData valor={data} rotulo="Data prevista de multiplicação" ateHoje={false} onChange={(v) => { setData(v); setErro(null); setSalvo(false); }} />
      {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}
      {mutation.isError ? <Text accessibilityRole="alert" style={styles.erro}>{normalizeApiError(mutation.error, 'Não foi possível salvar a data.').message}</Text> : null}
      {salvo && !mutation.isPending ? <Text style={styles.ok}>{info.multiplicacaoPrevista ? 'Data prevista salva.' : 'Data prevista removida.'}</Text> : null}
      <View style={styles.multiplicacaoAcoes}>
        {info.multiplicacaoPrevista ? <Pressable accessibilityRole="button" disabled={mutation.isPending} onPress={() => salvar(true)} style={styles.secundario}><Text style={styles.secundarioTexto}>Remover</Text></Pressable> : null}
        <Pressable accessibilityRole="button" disabled={mutation.isPending || !data || data === atual} onPress={() => salvar()} style={[styles.botaoPequeno, (mutation.isPending || !data || data === atual) && styles.botaoOff]}>
          <Text style={styles.botaoTexto}>{mutation.isPending ? 'Salvando...' : 'Salvar data'}</Text>
        </Pressable>
      </View>
    </> : <Text style={styles.historicoFase}>{atual || 'Não definida'}</Text>}
  </View>;
}

/** Data com calendário nativo (Android/iOS); no navegador, campo dd/mm/aaaa validado ao salvar. */
function CampoData({ valor, onChange, rotulo = 'Data em que a fase começou', ateHoje = true }: { valor: string; onChange: (valor: string) => void; rotulo?: string; ateHoje?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState(() => brParaDate(valor) ?? new Date());
  if (Platform.OS === 'web') {
    return <TextInput accessibilityLabel={rotulo} value={valor} onChangeText={onChange} placeholder="dd/mm/aaaa" placeholderTextColor={colors.textMuted} maxLength={10} style={styles.input} />;
  }
  const mudar = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') { setAberto(false); return; }
    if (!date) return;
    if (Platform.OS === 'android') { onChange(dateParaBr(date)); setAberto(false); } else setRascunho(date);
  };
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`${rotulo}: ${valor || 'não definida'}`} style={styles.dataCampo} onPress={() => { setRascunho(brParaDate(valor) ?? new Date()); setAberto(true); }}>
      <Text style={valor ? styles.dataTexto : styles.dataVazia}>{valor ? `${valor}${valor === hojeBr() ? ' (hoje)' : ''}` : 'dd/mm/aaaa'}</Text>
      <Ionicons name="calendar-outline" size={19} color={colors.brandBlue} />
    </Pressable>
    {aberto && Platform.OS === 'android' ? <DateTimePicker value={rascunho} mode="date" display="calendar" maximumDate={ateHoje ? new Date() : undefined} onChange={mudar} /> : null}
    {Platform.OS === 'ios' && aberto ? <View style={styles.iosPicker}>
      <DateTimePicker value={rascunho} mode="date" display="inline" locale="pt-BR" maximumDate={ateHoje ? new Date() : undefined} onChange={mudar} />
      <View style={styles.iosAcoes}>
        <Pressable accessibilityRole="button" style={styles.secundario} onPress={() => setAberto(false)}><Text style={styles.secundarioTexto}>Cancelar</Text></Pressable>
        <Pressable accessibilityRole="button" style={styles.botaoPequeno} onPress={() => { onChange(dateParaBr(rascunho)); setAberto(false); }}><Text style={styles.botaoTexto}>Confirmar</Text></Pressable>
      </View>
    </View> : null}
  </>;
}

function dateParaBr(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function hojeBr() { return dateParaBr(new Date()); }

function brParaDate(valor: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12);
  return d.getDate() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 ? d : null;
}

export function brParaIso(valor: string): string | null {
  const d = brParaDate(valor);
  return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;
}

export function isoParaBr(valor: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}

const styles = StyleSheet.create({
  chip: { minHeight: 32, maxWidth: 220, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderColor: colors.brandBlue, borderRadius: radius.full, backgroundColor: colors.surfacePrimary, paddingHorizontal: 10 },
  chipVazio: { borderStyle: 'dashed' },
  chipText: { ...typography.caption, flexShrink: 1, color: colors.brandBlue, fontWeight: '800' },
  aviso: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, backgroundColor: '#ECFDF5', paddingHorizontal: 10 },
  avisoText: { ...typography.caption, color: '#047857', fontWeight: '700' },
  nota: { ...typography.caption, color: colors.textSecondary },
  notaForte: { color: colors.textHeading, fontWeight: '800' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: colors.surfacePrimary, paddingTop: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: radius.full, backgroundColor: colors.borderDefault },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingTop: 12 },
  flex: { flex: 1, minWidth: 0 },
  sheetTitle: { ...typography.h3, color: colors.textHeading },
  sheetSub: { ...typography.caption, color: colors.textSecondary },
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full },
  sheetBody: { gap: 14, padding: 20, paddingBottom: 32 },
  lista: { overflow: 'hidden', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: 12 },
  linha: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 },
  linhaBorda: { borderTopWidth: 1, borderColor: colors.borderSubtle },
  linhaSelecionada: { backgroundColor: '#F0F6FF', borderColor: colors.brandBlue },
  marcaFeita: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: '#ECFDF5' },
  radioOn: { width: 24, height: 24, borderWidth: 7, borderColor: colors.brandBlue, borderRadius: radius.full },
  radioOff: { width: 24, height: 24, borderWidth: 2, borderColor: colors.borderDefault, borderRadius: radius.full },
  linhaTexto: { ...typography.bodySmall, flex: 1, fontSize: 15, color: colors.textBody },
  linhaTextoFeita: { color: colors.textSecondary },
  linhaTextoForte: { color: colors.textHeading, fontWeight: '700' },
  badgeAtual: { ...typography.caption, fontSize: 11, fontWeight: '800', color: colors.brandBlue, backgroundColor: '#E6F0FF', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  badgeProxima: { ...typography.caption, fontSize: 11, fontWeight: '800', color: colors.textSecondary },
  campo: { gap: 6 },
  rotulo: { ...typography.caption, color: colors.textSecondary, fontWeight: '800' },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 12, color: colors.textBody, backgroundColor: colors.surfacePrimary, fontSize: 15 },
  inputMulti: { minHeight: 72, paddingTop: 10, textAlignVertical: 'top' },
  dataCampo: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 12 },
  dataTexto: { ...typography.bodySmall, fontSize: 15, color: colors.textHeading },
  dataVazia: { ...typography.bodySmall, fontSize: 15, color: colors.textMuted },
  multiplicacao: { gap: 8, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 12 },
  multiplicacaoAcoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  ok: { ...typography.caption, color: '#047857', fontWeight: '700' },
  iosPicker: { gap: 8 },
  iosAcoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  linkLinha: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  link: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700' },
  erro: { ...typography.caption, color: colors.error, fontWeight: '700' },
  dica: { ...typography.caption, color: colors.textSecondary },
  botao: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.brandBlue },
  botaoOff: { opacity: 0.5 },
  botaoTexto: { ...typography.bodySmall, fontSize: 16, color: colors.surfacePrimary, fontWeight: '800' },
  botaoPequeno: { minHeight: 44, justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.brandBlue, paddingHorizontal: 16 },
  secundario: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 14 },
  secundarioTexto: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700' },
  historico: { gap: 8, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 12 },
  historicoTitulo: { ...typography.caption, color: colors.textSecondary, fontWeight: '800', letterSpacing: 0.5 },
  historicoLinha: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  historicoFase: { ...typography.bodySmall, color: colors.textBody },
  historicoInfo: { ...typography.caption, flexShrink: 1, textAlign: 'right', color: colors.textSecondary },
});
