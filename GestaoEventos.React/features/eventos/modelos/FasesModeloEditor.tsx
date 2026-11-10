import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, typography } from '../../../shared/design/tokens';
import type { FaseUso } from '../../../services/api/fases-api';

export const MAX_FASES = 20;
export const MAX_NOME_FASE = 60;

type Props = {
  value: string[];
  onChange: (fases: string[]) => void;
  /** Em quantos eventos cada fase já foi usada (aviso antes de remover). */
  uso: FaseUso[];
};

/** Lista ordenada de fases do modelo: adicionar, reordenar e remover com aviso quando já está em uso. */
export function FasesModeloEditor({ value, onChange, uso }: Props) {
  const [nova, setNova] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarRemocao, setConfirmarRemocao] = useState<string | null>(null);

  const emUso = (nome: string) => uso.find((u) => u.nome.toLowerCase() === nome.toLowerCase())?.eventosEmUso ?? 0;

  const adicionar = () => {
    const nome = nova.trim();
    if (!nome) return;
    if (nome.length > MAX_NOME_FASE) { setErro(`Use até ${MAX_NOME_FASE} caracteres.`); return; }
    if (value.some((f) => f.toLowerCase() === nome.toLowerCase())) { setErro(`"${nome}" já está na lista.`); return; }
    if (value.length >= MAX_FASES) { setErro(`No máximo ${MAX_FASES} fases.`); return; }
    onChange([...value, nome]);
    setNova('');
    setErro(null);
  };

  const mover = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= value.length) return;
    const copia = [...value];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    onChange(copia);
  };

  const remover = (nome: string) => {
    if (emUso(nome) > 0 && confirmarRemocao !== nome) { setConfirmarRemocao(nome); return; }
    onChange(value.filter((f) => f !== nome));
    setConfirmarRemocao(null);
  };

  return <View style={styles.container}>
    {value.map((fase, i) => <View key={fase} style={styles.linha}>
      <Text style={styles.numero}>{i + 1}</Text>
      <Text style={styles.nome} numberOfLines={2}>{fase}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Subir ${fase}`} disabled={i === 0} onPress={() => mover(i, -1)} style={[styles.icone, i === 0 && styles.desabilitado]}><Ionicons name="chevron-up" size={18} color={colors.textSecondary} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Descer ${fase}`} disabled={i === value.length - 1} onPress={() => mover(i, 1)} style={[styles.icone, i === value.length - 1 && styles.desabilitado]}><Ionicons name="chevron-down" size={18} color={colors.textSecondary} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${fase}`} onPress={() => remover(fase)} style={styles.icone}><Ionicons name="close" size={18} color={colors.textSecondary} /></Pressable>
    </View>)}

    {confirmarRemocao ? <View accessibilityRole="alert" style={styles.aviso}>
      <Ionicons name="warning-outline" size={20} color="#B45309" />
      <View style={styles.flex}>
        <Text style={styles.avisoTitulo}>“{confirmarRemocao}” está em uso em {emUso(confirmarRemocao)} {emUso(confirmarRemocao) === 1 ? 'evento' : 'eventos'}</Text>
        <Text style={styles.avisoTexto}>Ela some das opções, mas o histórico e os relatórios antigos continuam mostrando essa fase.</Text>
        <View style={styles.avisoAcoes}>
          <Pressable accessibilityRole="button" style={styles.avisoManter} onPress={() => setConfirmarRemocao(null)}><Text style={styles.avisoManterTexto}>Manter fase</Text></Pressable>
          <Pressable accessibilityRole="button" style={styles.avisoRemover} onPress={() => remover(confirmarRemocao)}><Text style={styles.avisoRemoverTexto}>Remover mesmo assim</Text></Pressable>
        </View>
      </View>
    </View> : null}

    <View style={styles.adicionar}>
      <TextInput accessibilityLabel="Nova fase" value={nova} onChangeText={(t) => { setNova(t); setErro(null); }} onSubmitEditing={adicionar} placeholder={value.length ? 'Nova fase' : 'Ex.: Evangelismo'} placeholderTextColor={colors.textMuted} maxLength={MAX_NOME_FASE + 10} returnKeyType="done" style={styles.input} />
      <Pressable accessibilityRole="button" disabled={!nova.trim()} onPress={adicionar} style={[styles.botao, !nova.trim() && styles.desabilitado]}><Text style={styles.botaoTexto}>Adicionar</Text></Pressable>
    </View>
    {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : <Text style={styles.ajuda}>Até {MAX_FASES} fases, {MAX_NOME_FASE} caracteres cada, sem repetir.</Text>}
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  flex: { flex: 1, minWidth: 0 },
  linha: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: 10, paddingLeft: 12, backgroundColor: colors.surfacePrimary },
  numero: { width: 24, height: 24, borderRadius: radius.full, backgroundColor: '#E6F0FF', color: colors.brandBlue, textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: '800', overflow: 'hidden' },
  nome: { ...typography.bodySmall, flex: 1, fontSize: 15, color: colors.textHeading },
  icone: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  desabilitado: { opacity: 0.35 },
  adicionar: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 12, color: colors.textBody, backgroundColor: colors.surfacePrimary, fontSize: 15 },
  botao: { minHeight: 46, justifyContent: 'center', borderWidth: 1, borderColor: colors.brandBlue, borderRadius: radius.sm, paddingHorizontal: 16 },
  botaoTexto: { ...typography.bodySmall, color: colors.brandBlue, fontWeight: '700' },
  ajuda: { ...typography.caption, color: colors.textSecondary },
  erro: { ...typography.caption, color: colors.error, fontWeight: '700' },
  aviso: { flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10, backgroundColor: '#FFFBEB', padding: 12 },
  avisoTitulo: { ...typography.bodySmall, color: '#78350F', fontWeight: '700' },
  avisoTexto: { ...typography.caption, color: '#78350F', lineHeight: 19 },
  avisoAcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  avisoManter: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: '#FDE68A', borderRadius: radius.sm, backgroundColor: colors.surfacePrimary, paddingHorizontal: 14 },
  avisoManterTexto: { ...typography.bodySmall, color: '#78350F', fontWeight: '700' },
  avisoRemover: { minHeight: 44, justifyContent: 'center', borderRadius: radius.sm, backgroundColor: '#B45309', paddingHorizontal: 14 },
  avisoRemoverTexto: { ...typography.bodySmall, color: colors.surfacePrimary, fontWeight: '700' },
});
