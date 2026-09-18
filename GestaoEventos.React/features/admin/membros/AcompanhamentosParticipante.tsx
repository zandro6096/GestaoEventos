import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { acompanhamentosApi, type AcompanhamentoTipo, type ParticipanteAcompanhamento } from '../../../services/api/acompanhamentos-api';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';

export function AcompanhamentosParticipante({ estruturaId, usuarioId }: { estruturaId: number; usuarioId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tipos, setTipos] = useState<AcompanhamentoTipo[]>([]);
  const [items, setItems] = useState<ParticipanteAcompanhamento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const current = (id: number) => items.find((item) => item.acompanhamentoTipoId === id);
  async function openPanel() {
    if (open) { setOpen(false); return; }
    setOpen(true); setLoading(true); setError(null);
    try { const [typeList, itemList] = await Promise.all([acompanhamentosApi.listTipos(estruturaId), acompanhamentosApi.listParticipante(estruturaId, { tipo: 'usuario', id: usuarioId })]); setTipos(typeList); setItems(itemList); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Nao foi possivel carregar os acompanhamentos.'); }
    finally { setLoading(false); }
  }
  function update(tipo: AcompanhamentoTipo, changes: Partial<ParticipanteAcompanhamento>) {
    setItems((previous) => { const existing = previous.find((item) => item.acompanhamentoTipoId === tipo.id); if (existing) return previous.map((item) => item.acompanhamentoTipoId === tipo.id ? { ...item, ...changes } : item); return [...previous, { id: 0, estruturaId, usuarioId, usuarioVirtualId: null, acompanhamentoTipoId: tipo.id, codigo: tipo.codigo, nome: tipo.nome, natureza: tipo.natureza, status: null, valor: null, dataInicio: null, observacao: null, historico: [], ...changes }]; });
  }
  async function save() {
    setSaving(true); setError(null);
    try { await Promise.all(tipos.map((tipo) => { const item = current(tipo.id); return acompanhamentosApi.save(estruturaId, { tipo: 'usuario', id: usuarioId }, { acompanhamentoTipoId: tipo.id, status: tipo.natureza === 'curso' ? item?.status ?? 'nao_iniciado' : null, valor: tipo.natureza === 'indicador' ? item?.valor ?? false : null, dataInicio: item?.dataInicio ?? null }); })); const result = await acompanhamentosApi.listParticipante(estruturaId, { tipo: 'usuario', id: usuarioId }); setItems(result); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Nao foi possivel salvar os acompanhamentos.'); }
    finally { setSaving(false); }
  }
  return <View style={styles.container}><Pressable accessibilityRole="button" accessibilityLabel="Acompanhamentos do participante" onPress={() => void openPanel()} style={styles.toggle}><Ionicons name="list-outline" size={16} color={colors.brandBlue} /><Text style={styles.toggleText}>{open ? 'Ocultar acompanhamento' : 'Acompanhamentos'}</Text></Pressable>{open ? <View style={styles.panel}><Text style={styles.title}>Situacao na estrutura</Text>{loading ? <ActivityIndicator color={colors.brandBlue} /> : null}{error ? <Text style={styles.error}>{error}</Text> : null}{!loading && tipos.map((tipo) => { const item = current(tipo.id); return <View key={tipo.id} style={styles.row}><Text style={styles.name}>{tipo.nome}</Text>{tipo.natureza === 'curso' ? <View style={styles.options}>{['nao_iniciado', 'iniciado', 'em_andamento', 'concluido', 'cancelado'].map((status) => <Pressable key={status} accessibilityRole="button" accessibilityState={{ selected: item?.status === status }} onPress={() => update(tipo, { status })} style={[styles.option, item?.status === status && styles.active]}><Text style={[styles.optionText, item?.status === status && styles.activeText]}>{status.replaceAll('_', ' ')}</Text></Pressable>)}</View> : <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: item?.valor === true }} onPress={() => update(tipo, { valor: item?.valor !== true })} style={[styles.boolean, item?.valor === true && styles.active]}><Text style={styles.optionText}>{item?.valor === true ? 'Sim' : 'Nao'}</Text></Pressable>}{tipo.natureza === 'indicador' && item?.historico?.length ? <Text style={styles.history}>Historico: {item.historico.slice(0, 4).map((history) => `${history.valorNovo ? 'Sim' : 'Nao'} (${new Date(history.alteradoEm).toLocaleDateString('pt-BR')})`).join(' · ')}</Text> : null}</View>; })}{!loading && tipos.length ? <Pressable accessibilityRole="button" disabled={saving} onPress={() => void save()} style={styles.save}><Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar acompanhamentos'}</Text></Pressable> : null}</View> : null}</View>;
}

const styles = StyleSheet.create({ container: { gap: spacing.sm }, toggle: { minHeight: 40, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, borderWidth: 1, borderColor: colors.brandBlue, borderRadius: radius.sm, paddingHorizontal: spacing.sm }, toggleText: { ...typography.caption, color: colors.brandBlue, fontWeight: '700' }, panel: { gap: spacing.sm, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: spacing.sm }, title: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '700' }, row: { gap: spacing.xs, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: spacing.sm }, name: { ...typography.caption, color: colors.textBody, fontWeight: '700' }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, option: { borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 5 }, active: { borderColor: colors.brandBlue, backgroundColor: '#EEF5FF' }, optionText: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' }, activeText: { color: colors.brandBlue, fontWeight: '700' }, boolean: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }, history: { ...typography.caption, color: colors.textMuted }, error: { ...typography.bodySmall, color: colors.error }, save: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.brandBlue, paddingHorizontal: spacing.sm }, saveText: { ...typography.caption, color: '#fff', fontWeight: '700' } });
