import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { adminApi } from '../../../services/api/admin-api';
import { colors, radius, spacing, typography } from '../../../shared/design/tokens';
import type { Participante } from '../../../services/api/participantes-evento-api';

type Props = {
  participante: Participante | null;
  estruturaId: number;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (values: { nome: string; email: string | null; telefone: string | null; dataNascimento: string | null; papelIds: number[]; papelPrincipalId: number | null }) => void;
};

export function EditarParticipantePanel({ participante, estruturaId, pending, error, onClose, onSave }: Props) {
  const [nome, setNome] = useState(() => participante?.nomeExibicao || participante?.nome || '');
  const [email, setEmail] = useState(() => participante?.email ?? '');
  const [telefone, setTelefone] = useState(() => participante?.telefone ?? '');
  const [dataNascimento, setDataNascimento] = useState(() => toBrDate(participante?.dataNascimento));
  const [papelIds, setPapelIds] = useState<number[]>(() => participante?.papeis?.map((item) => item.id) ?? []);
  const [papelPrincipalId, setPapelPrincipalId] = useState<number | null>(() => participante?.papeis?.find((item) => item.principal)?.id ?? participante?.papeis?.[0]?.id ?? null);
  const papeis = useQuery({ queryKey: ['editar-participante-papeis', estruturaId], queryFn: () => adminApi.listPapeis(estruturaId), enabled: Boolean(participante && estruturaId > 0) });

  const togglePapel = (id: number) => {
    setPapelIds((current) => {
      if (current.includes(id)) {
        const next = current.filter((item) => item !== id);
        setPapelPrincipalId((principal) => principal === id ? next[0] ?? null : principal);
        return next;
      }
      setPapelPrincipalId((principal) => principal ?? id);
      return [...current, id];
    });
  };

  return <Modal visible={Boolean(participante)} transparent animationType="slide" onRequestClose={() => !pending && onClose()}>
    <View style={styles.overlay}><View style={styles.dialog} accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}><View style={styles.flex}><Text style={styles.title}>Editar participante</Text><Text numberOfLines={1} style={styles.subtitle}>{participante?.nomeExibicao || participante?.nome}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fechar edicao do participante" disabled={pending} onPress={onClose}><Ionicons name="close-outline" size={24} color={colors.textMuted} /></Pressable></View>
        <Text style={styles.label}>Nome completo *</Text><TextInput accessibilityLabel="Nome completo do participante" value={nome} onChangeText={setNome} style={styles.input} />
        <Text style={styles.label}>E-mail</Text><TextInput accessibilityLabel="E-mail do participante" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
        <Text style={styles.label}>Telefone</Text><TextInput accessibilityLabel="Telefone do participante" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" style={styles.input} />
        <Text style={styles.label}>Data de nascimento</Text><TextInput accessibilityLabel="Data de nascimento do participante" value={dataNascimento} onChangeText={(value) => setDataNascimento(formatDateInput(value))} placeholder="DD/MM/AAAA" keyboardType="numeric" maxLength={10} style={styles.input} />
        <View style={styles.roleSection}><Text style={styles.label}>Papéis na estrutura</Text>{papeis.isLoading ? <ActivityIndicator color={colors.brandBlue} /> : papeis.data?.map((papel) => <Pressable key={papel.id} accessibilityRole="checkbox" accessibilityState={{ checked: papelIds.includes(papel.id) }} style={styles.roleRow} onPress={() => togglePapel(papel.id)}><Ionicons name={papelIds.includes(papel.id) ? 'checkbox' : 'square-outline'} size={21} color={colors.brandBlue} /><Text style={styles.roleName}>{papel.nome}</Text>{papelIds.includes(papel.id) ? <Pressable accessibilityRole="radio" accessibilityState={{ checked: papelPrincipalId === papel.id }} onPress={() => setPapelPrincipalId(papel.id)}><Text style={styles.primaryRole}>{papelPrincipalId === papel.id ? 'Principal' : 'Definir principal'}</Text></Pressable> : null}</Pressable>)}</View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <View style={styles.footer}><Pressable disabled={pending} style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryText}>Cancelar</Text></Pressable><Pressable disabled={pending || !nome.trim()} style={[styles.primaryButton, (pending || !nome.trim()) && styles.disabled]} onPress={() => onSave({ nome: nome.trim(), email: email.trim() || null, telefone: telefone.trim() || null, dataNascimento: toIsoDate(dataNascimento), papelIds, papelPrincipalId })}><Ionicons name="save-outline" size={18} color={colors.surfacePrimary} /><Text style={styles.primaryText}>{pending ? 'Salvando...' : 'Salvar'}</Text></Pressable></View>
      </ScrollView>
    </View></View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.42)' },
  dialog: { width: '100%', maxHeight: '92%', borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, backgroundColor: colors.surfacePrimary },
  content: { gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
  flex: { flex: 1, minWidth: 0 },
  title: { ...typography.h3, color: colors.textHeading },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  label: { ...typography.caption, color: colors.textHeading, fontWeight: '800' },
  input: { minHeight: 44, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 11, color: colors.textBody, backgroundColor: colors.surfacePrimary },
  roleSection: { gap: spacing.xs, marginTop: spacing.sm },
  roleRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderColor: colors.borderSubtle },
  roleName: { flex: 1, ...typography.bodySmall, color: colors.textBody },
  primaryRole: { ...typography.caption, color: colors.brandBlue, fontWeight: '700' },
  error: { ...typography.bodySmall, color: colors.error, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: spacing.md, marginTop: spacing.sm },
  secondaryButton: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: spacing.md },
  secondaryText: { ...typography.bodySmall, color: colors.textBody, fontWeight: '700' },
  primaryButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, borderRadius: radius.sm, backgroundColor: colors.brandBlue, paddingHorizontal: spacing.md },
  primaryText: { ...typography.bodySmall, color: colors.surfacePrimary, fontWeight: '800' },
  disabled: { opacity: 0.55 },
});

function toBrDate(value?: string | null) { if (!value) return ''; const date = new Date(`${value.slice(0, 10)}T12:00:00`); return Number.isNaN(date.getTime()) ? '' : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; }
function formatDateInput(value: string) { const digits = value.replace(/\D/g, '').slice(0, 8); return digits.length <= 2 ? digits : digits.length <= 4 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`; }
function toIsoDate(value: string) { const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value); return match ? `${match[3]}-${match[2]}-${match[1]}` : value.trim() || null; }
