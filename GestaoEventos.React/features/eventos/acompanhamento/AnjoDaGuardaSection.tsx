import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, radius, typography } from '../../../shared/design/tokens';
import { anjoApi, mesmaPessoa, type PessoaRef } from '../../../services/api/anjo-api';
import { normalizeApiError } from '../../../services/api/api-error';
import { track } from '../../../services/analytics/analytics.service';
import type { Participante } from '../../../services/api/participantes-evento-api';

// Anjo da guarda (alternativa C aprovada): seção no "Editar participante". O campo abre a lista de pessoas
// do evento; escolher grava na hora (vínculo com histórico próprio, independente do "Salvar" do painel).

type Props = { estruturaId: number; participante: Participante; candidatos: Participante[] };

const ref = (p: Participante): PessoaRef => (p.usuarioId ? { usuarioId: p.usuarioId } : { usuarioVirtualId: p.usuarioVirtualId });
const nomeDe = (p: Participante) => p.nomeExibicao || p.nome;

export function AnjoDaGuardaSection({ estruturaId, participante, candidatos }: Props) {
  const pessoa = ref(participante);
  const chave = ['participante-anjo', estruturaId, pessoa.usuarioId ?? `v${pessoa.usuarioVirtualId}`];
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: chave, queryFn: () => anjoApi.obter(estruturaId, pessoa), enabled: estruturaId > 0, retry: false });
  const [escolhendo, setEscolhendo] = useState(false);
  const [aberturas, setAberturas] = useState(0);
  const [verHistorico, setVerHistorico] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!aviso) return undefined;
    const timer = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(timer);
  }, [aviso]);

  const mutation = useMutation({
    mutationFn: (anjo: Participante | null) => anjoApi.definir(estruturaId, pessoa, anjo ? ref(anjo) : null),
    onSuccess: (resultado, anjo) => {
      queryClient.setQueryData(chave, resultado);
      track('confirmation', anjo ? 'participante:anjo_definido' : 'participante:anjo_retirado');
      setEscolhendo(false);
      setAviso(anjo ? `Anjo atualizado: ${nomeDe(anjo)}` : 'Anjo da guarda retirado');
    },
  });

  // Pessoas do evento que podem ser anjo: sem a própria pessoa e sem repetir quem aparece mais de uma vez.
  const usuarioId = pessoa.usuarioId;
  const usuarioVirtualId = pessoa.usuarioVirtualId;
  const opcoes = useMemo(() => {
    const vistos = new Set<string>();
    return candidatos.filter((c) => {
      const k = c.usuarioId ? `u${c.usuarioId}` : `v${c.usuarioVirtualId}`;
      if (vistos.has(k) || mesmaPessoa(ref(c), { usuarioId, usuarioVirtualId })) return false;
      vistos.add(k);
      return true;
    });
  }, [candidatos, usuarioId, usuarioVirtualId]);

  const info = query.data;
  const atual = info?.atual ?? null;
  const abrir = () => { track('entrance', 'participante:anjo_abrir'); mutation.reset(); setAberturas((n) => n + 1); setEscolhendo(true); };

  return <View style={styles.secao}>
    <View style={styles.titulo}><Ionicons name="shield-outline" size={18} color={colors.brandBlue} /><Text style={styles.tituloTexto}>Anjo da guarda</Text></View>
    {query.isLoading ? <ActivityIndicator color={colors.brandBlue} accessibilityLabel="Carregando anjo da guarda" /> : query.isError ? <Text style={styles.ajuda}>Não foi possível carregar o anjo da guarda.</Text> : <>
      {info?.podeAlterar
        ? <Pressable accessibilityRole="button" accessibilityLabel={atual ? `Anjo da guarda: ${atual.anjoNome}. Trocar` : 'Definir anjo da guarda'} onPress={abrir} style={styles.campo}>
            <Text style={atual ? styles.campoTexto : styles.campoVazio}>{atual?.anjoNome ?? 'Nenhum anjo definido'}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </Pressable>
        : <Text style={styles.campoTexto}>{atual?.anjoNome ?? 'Nenhum anjo definido'}</Text>}
      {aviso ? <View accessibilityLiveRegion="polite" style={styles.aviso}><Ionicons name="checkmark-circle" size={14} color="#047857" /><Text style={styles.avisoTexto}>{aviso}</Text></View> : null}
      {atual || info?.historico.length ? <View style={styles.linhaInfo}>
        {atual ? <Text style={styles.ajuda}>Cuidando desde {isoParaBr(atual.inicio)}</Text> : null}
        {info?.historico.length ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: verHistorico }} onPress={() => setVerHistorico((v) => !v)} style={styles.linkToque}>
          <Text style={styles.link}>{verHistorico ? 'Ocultar histórico' : `Histórico (${info.historico.length})`}</Text>
        </Pressable> : null}
      </View> : null}
      {verHistorico && info ? <View style={styles.historico}>
        {info.historico.map((h) => <View key={h.id} style={styles.historicoLinha}>
          <Text style={styles.historicoNome}>{h.anjoNome ?? '—'}</Text>
          <Text style={styles.historicoInfo}>{isoParaBr(h.inicio)} – {h.fim ? isoParaBr(h.fim) : 'atual'}{h.registradoPorNome ? ` · por ${h.registradoPorNome}` : ''}</Text>
        </View>)}
      </View> : null}
    </>}

    <SeletorAnjo
      key={aberturas}
      visivel={escolhendo}
      nomePessoa={nomeDe(participante)}
      opcoes={opcoes}
      atual={atual ? { usuarioId: atual.anjoUsuarioId, usuarioVirtualId: atual.anjoUsuarioVirtualId } : null}
      temAtual={!!atual}
      salvando={mutation.isPending}
      erro={mutation.isError ? normalizeApiError(mutation.error, 'Não foi possível salvar o anjo da guarda.').message : null}
      onEscolher={(anjo) => { track('simulation', 'participante:anjo_salvar'); mutation.mutate(anjo); }}
      onFechar={() => !mutation.isPending && setEscolhendo(false)}
    />
  </View>;
}

function SeletorAnjo({ visivel, nomePessoa, opcoes, atual, temAtual, salvando, erro, onEscolher, onFechar }: {
  visivel: boolean; nomePessoa: string; opcoes: Participante[]; atual: PessoaRef | null; temAtual: boolean; salvando: boolean;
  erro: string | null; onEscolher: (anjo: Participante | null) => void; onFechar: () => void;
}) {
  const [busca, setBusca] = useState('');
  const filtradas = opcoes.filter((o) => nomeDe(o).toLowerCase().includes(busca.trim().toLowerCase()));
  const primeiroNome = nomePessoa.split(' ')[0];

  return <Modal transparent visible={visivel} animationType="slide" onRequestClose={onFechar}>
    <View style={styles.backdrop}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar lista" style={StyleSheet.absoluteFill} onPress={onFechar} />
      <View style={styles.sheet} accessibilityViewIsModal>
        <View style={styles.sheetTopo}>
          <View style={styles.flex}>
            <Text style={styles.sheetTitulo}>Anjo da guarda de {primeiroNome}</Text>
            <Text style={styles.ajuda}>Escolha quem acompanha {nomePessoa}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" disabled={salvando} onPress={onFechar} style={styles.fechar}><Ionicons name="close" size={18} color={colors.textSecondary} /></Pressable>
        </View>
        {opcoes.length > 8 ? <TextInput accessibilityLabel="Buscar pessoa" value={busca} onChangeText={setBusca} placeholder="Buscar pessoa" placeholderTextColor={colors.textMuted} style={styles.busca} /> : null}
        {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}
        {salvando ? <ActivityIndicator style={styles.salvando} color={colors.brandBlue} accessibilityLabel="Salvando" /> : null}
        <ScrollView contentContainerStyle={styles.lista} keyboardShouldPersistTaps="handled">
          {filtradas.map((o) => {
            const ehAtual = !!atual && mesmaPessoa(ref(o), atual);
            return <Pressable key={`${o.usuarioId ?? 'v'}:${o.usuarioVirtualId ?? ''}:${o.id}`} accessibilityRole="radio" accessibilityState={{ checked: ehAtual, disabled: salvando }} aria-checked={ehAtual}
              accessibilityLabel={`${nomeDe(o)}${o.funcao ? `, ${o.funcao}` : ''}${ehAtual ? ', anjo atual' : ''}`}
              disabled={salvando || ehAtual} onPress={() => onEscolher(o)} style={[styles.opcao, ehAtual && styles.opcaoAtual]}>
              <View style={styles.avatar}><Text style={styles.avatarTexto}>{nomeDe(o).charAt(0).toUpperCase()}</Text></View>
              <View style={styles.flex}>
                <Text numberOfLines={1} style={styles.opcaoNome}>{nomeDe(o)}</Text>
                <Text numberOfLines={1} style={styles.ajuda}>{o.funcao || 'Participante'}{ehAtual ? ' · atual' : ''}</Text>
              </View>
              {ehAtual ? <Ionicons name="checkmark" size={20} color={colors.brandBlue} /> : null}
            </Pressable>;
          })}
          {!filtradas.length ? <Text style={[styles.ajuda, styles.vazio]}>Nenhuma pessoa encontrada neste evento.</Text> : null}
          {temAtual ? <Pressable accessibilityRole="button" disabled={salvando} onPress={() => onEscolher(null)} style={styles.opcao}>
            <Ionicons name="close-circle-outline" size={20} color={colors.error} />
            <Text style={styles.retirar}>Sem anjo da guarda</Text>
          </Pressable> : null}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

function isoParaBr(valor: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}

const styles = StyleSheet.create({
  secao: { gap: 8, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 12, marginTop: 4 },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tituloTexto: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' },
  campo: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 12, backgroundColor: colors.surfacePrimary },
  campoTexto: { ...typography.bodySmall, fontSize: 15, color: colors.textHeading },
  campoVazio: { ...typography.bodySmall, fontSize: 15, color: colors.textMuted },
  linhaInfo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 10 },
  ajuda: { ...typography.caption, color: colors.textSecondary },
  linkToque: { minHeight: 44, justifyContent: 'center' },
  link: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' },
  aviso: { alignSelf: 'flex-start', minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.full, backgroundColor: '#ECFDF5', paddingHorizontal: 10 },
  avisoTexto: { ...typography.caption, color: '#047857', fontWeight: '700' },
  historico: { gap: 6, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, padding: 10 },
  historicoLinha: { gap: 1 },
  historicoNome: { ...typography.bodySmall, color: colors.textBody, fontWeight: '700' },
  historicoInfo: { ...typography.caption, color: colors.textSecondary },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  sheet: { maxHeight: '85%', borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: colors.surfacePrimary, paddingTop: 16 },
  sheetTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 18, paddingBottom: 10 },
  flex: { flex: 1, minWidth: 0 },
  sheetTitulo: { ...typography.h3, fontSize: 18, color: colors.textHeading },
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full },
  busca: { minHeight: 46, marginHorizontal: 18, marginBottom: 8, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 12, color: colors.textBody, fontSize: 15 },
  erro: { ...typography.caption, color: colors.error, fontWeight: '700', paddingHorizontal: 18, paddingBottom: 6 },
  salvando: { paddingBottom: 6 },
  lista: { borderTopWidth: 1, borderColor: colors.borderSubtle, paddingBottom: 28 },
  opcao: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  opcaoAtual: { backgroundColor: '#F0F6FF' },
  avatar: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: '#E6F0FF' },
  avatarTexto: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '800' },
  opcaoNome: { ...typography.bodySmall, fontSize: 15, color: colors.textHeading, fontWeight: '700' },
  retirar: { ...typography.bodySmall, fontSize: 15, color: colors.error, fontWeight: '700' },
  vazio: { padding: 18 },
});
