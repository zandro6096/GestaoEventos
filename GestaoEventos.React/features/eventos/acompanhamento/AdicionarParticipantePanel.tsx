import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { colors, radius, typography } from '../../../shared/design/tokens';
import { adminApi } from '../../../services/api/admin-api';
import { acompanhamentosApi, type AcompanhamentoDraft, type AcompanhamentoTipo } from '../../../services/api/acompanhamentos-api';
import { eventosApi } from '../../../services/api/eventos-api';
import { eventoTemplatesApi } from '../../../services/api/evento-templates-api';
import { gruposApi } from '../../../services/api/grupos-api';
import { participantesEventoApi, type Participante, type ParticipationScope, type PessoaDisponivel } from '../../../services/api/participantes-evento-api';
import { usuariosEstruturaApi } from '../../../services/api/usuarios-estrutura-api';
import { usuariosVirtuaisApi } from '../../../services/api/usuarios-virtuais-api';
import { buscarCep } from '../../../services/api/viacep-api';
import type { AcompanhamentoAction } from './acompanhamento.service';

type Mode = 'virtual' | 'existente' | 'importar';
type Props = {
  estruturaId: number;
  grupoId: number | null;
  eventoId: number;
  eventoTemplateId: number | null;
  dataReferencia: string;
  participantes: Participante[];
  pending: boolean;
  error: string | null;
  onSubmit: (action: AcompanhamentoAction) => Promise<unknown>;
  onClose: () => void;
};
type Address = { cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string };

const scopeOptions: { value: ParticipationScope; title: string; description: string }[] = [
  { value: 'todas', title: 'Desde o inicio', description: 'Inclui a pessoa desde o primeiro registro deste evento.' },
  { value: 'futuros', title: 'Esta e as proximas ocorrencias', description: 'Preserva o historico e inicia a participacao na data escolhida.' },
  { value: 'somente_ocorrencia', title: 'Somente esta ocorrencia', description: 'Vincula a pessoa apenas ao encontro aberto agora.' },
];
const courseStatuses = [
  ['nao_iniciado', 'Nao iniciado'],
  ['em_andamento', 'Em andamento'],
  ['concluido', 'Concluido'],
  ['cancelado', 'Cancelado'],
] as const;

export function AdicionarParticipantePanel({ estruturaId, grupoId, eventoId, eventoTemplateId, dataReferencia, participantes, pending, error: parentError, onSubmit, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('virtual');
  const [scope, setScope] = useState<ParticipationScope>('futuros');
  const [entryDate, setEntryDate] = useState(() => toBrDate(dataReferencia));
  const [selectedPerson, setSelectedPerson] = useState<PessoaDisponivel | null>(null);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState('');
  const [address, setAddress] = useState<Address>({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [draftOverrides, setDraftOverrides] = useState<Record<number, AcompanhamentoDraft>>({});
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [sourceEventId, setSourceEventId] = useState<number | null>(null);
  const [importedKeys, setImportedKeys] = useState<string[]>([]);
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addressExpanded, setAddressExpanded] = useState(false);

  const groupMembers = useQuery({ queryKey: ['adicionar-participante-grupo-membros', grupoId], queryFn: () => gruposApi.membros(grupoId!, 0, 1000), enabled: grupoId !== null && grupoId > 0 });
  const users = useQuery({ queryKey: ['adicionar-participante-usuarios', estruturaId], queryFn: () => usuariosEstruturaApi.list(estruturaId, '', { ativo: true, take: 1000 }), enabled: estruturaId > 0 });
  const virtuals = useQuery({ queryKey: ['adicionar-participante-virtuais', estruturaId, grupoId], queryFn: () => usuariosVirtuaisApi.list(estruturaId, grupoId ?? undefined), enabled: estruturaId > 0 });
  const roles = useQuery({ queryKey: ['adicionar-participante-papeis', estruturaId], queryFn: () => adminApi.listPapeis(estruturaId), enabled: estruturaId > 0 });
  const accompanimentTypes = useQuery({ queryKey: ['acompanhamento-tipos', estruturaId], queryFn: () => acompanhamentosApi.listTipos(estruturaId), enabled: estruturaId > 0 });
  const events = useQuery({ queryKey: ['adicionar-participante-eventos', estruturaId], queryFn: () => eventosApi.listEventos({ estruturaId, pageNumber: 1, pageSize: 200, apenasTemplates: false }), enabled: estruturaId > 0 });
  const template = useQuery({ queryKey: ['adicionar-participante-template', eventoTemplateId], queryFn: () => eventoTemplatesApi.getById(eventoTemplateId!), enabled: !!eventoTemplateId });
  const sourceParticipants = useQuery({ queryKey: ['adicionar-participante-importacao', sourceEventId, dataReferencia], queryFn: () => participantesEventoApi.list(sourceEventId!, null, dataReferencia), enabled: mode === 'importar' && !!sourceEventId });
  const selectedIdentity = selectedPerson ? { tipo: selectedPerson.tipo, id: selectedPerson.id } : null;
  const currentAccompaniments = useQuery({ queryKey: ['participante-acompanhamentos', estruturaId, selectedIdentity?.tipo, selectedIdentity?.id], queryFn: () => acompanhamentosApi.listParticipante(estruturaId, selectedIdentity!), enabled: mode === 'existente' && !!selectedIdentity });

  const groupMemberIds = useMemo(() => new Set((groupMembers.data?.data ?? []).map((item) => item.usuarioId)), [groupMembers.data]);
  const currentKeys = useMemo(() => new Set(participantes.map((item) => `${item.isVirtual ? 'usuario_virtual' : 'usuario'}:${item.isVirtual ? item.usuarioVirtualId : item.usuarioId}`)), [participantes]);
  const people = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const memberPeople: PessoaDisponivel[] = users.data
      ?.filter((item) => !grupoId || groupMemberIds.has(item.usuarioId))
      .map((item) => ({ id: item.usuarioId, nome: item.nomeUsuario, tipo: 'usuario', email: item.emailUsuario })) ?? [];
    const virtualPeople: PessoaDisponivel[] = (virtuals.data ?? [])
      .filter((item) => item.status?.toLowerCase() !== 'inativo' && item.status?.toLowerCase() !== 'mesclado')
      .map((item) => ({ id: item.id, nome: item.nome, tipo: 'usuario_virtual', email: item.email })) ?? [];
    return [...memberPeople, ...virtualPeople]
      .filter((item) => !currentKeys.has(`${item.tipo}:${item.id}`))
      .filter((item) => !term || item.nome.toLocaleLowerCase('pt-BR').includes(term))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [currentKeys, groupMemberIds, grupoId, search, users.data, virtuals.data]);
  const sameGroupEvents = useMemo(() => (events.data?.data ?? []).filter((item) => item.id === eventoId || (grupoId !== null && item.grupoId === grupoId && (eventoTemplateId === null || item.eventoTemplateId === eventoTemplateId))).sort((a, b) => (a.id === eventoId ? -1 : b.id === eventoId ? 1 : a.titulo.localeCompare(b.titulo, 'pt-BR'))), [eventoId, eventoTemplateId, events.data, grupoId]);
  const importOptions = useMemo(() => (events.data?.data ?? [])
    .filter((item) => item.id !== eventoId)
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
    .map((item) => ({ ...item, titulo: `${item.titulo} — ${item.grupoNome || 'Sem grupo'} • ${item.dataInicio.slice(0, 10)}` })), [eventoId, events.data]);
  const duplicatePeople = useMemo(() => {
    const normalized = normalizeName(name);
    if (!normalized || duplicateConfirmed) return [];
    return people.filter((item) => {
      const candidate = normalizeName(item.nome);
      return candidate === normalized || candidate.startsWith(normalized) || normalized.startsWith(candidate);
    });
  }, [duplicateConfirmed, name, people]);
  const drafts = useMemo(() => {
    const defaults = Object.fromEntries((accompanimentTypes.data ?? []).map((type) => [type.id, { acompanhamentoTipoId: type.id, status: type.natureza === 'curso' ? 'nao_iniciado' : null, valor: type.natureza === 'curso' ? null : false }]));
    const current = Object.fromEntries((currentAccompaniments.data ?? []).map((item) => [item.acompanhamentoTipoId, { acompanhamentoTipoId: item.acompanhamentoTipoId, status: item.status, valor: item.valor, dataInicio: item.dataInicio, observacao: item.observacao }]));
    return { ...defaults, ...current, ...draftOverrides } as Record<number, AcompanhamentoDraft>;
  }, [accompanimentTypes.data, currentAccompaniments.data, draftOverrides]);
  const templateEventIds = sameGroupEvents.map((item) => item.id).filter((id) => id === eventoId || id > 0);
  const defaultEventIds = template.data?.data.adicionarNovosParticipantesEmTodosEventos ? templateEventIds : [eventoId];
  const effectiveEventIds = selectedEventIds.length ? selectedEventIds : defaultEventIds;
  const loadingEventDefaults = events.isLoading || (!!eventoTemplateId && template.isLoading);
  const eventDefaultsUnavailable = !!eventoTemplateId && template.isError;
  const selectedAccompaniments = useMemo(() => Object.values(draftOverrides).filter((draft) => draft.status || draft.valor !== null && draft.valor !== undefined || draft.dataInicio || draft.observacao), [draftOverrides]);
  const importRows = useMemo(() => (sourceParticipants.data ?? []).map((item) => {
    const type = item.isVirtual ? 'usuario_virtual' : 'usuario';
    const id = item.isVirtual ? item.usuarioVirtualId : item.usuarioId;
    const key = `${type}:${id}`;
    return { item, key, blocked: currentKeys.has(key) };
  }), [currentKeys, sourceParticipants.data]);

  const lookupAddress = async () => {
    const digits = address.cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    setCepError(null);
    try {
      const result = await buscarCep(digits);
      if (!result) {
        setCepError('CEP nao encontrado.');
        return;
      }
      setAddress((current) => ({
        ...current,
        cep: result.cep?.replace(/\D/g, '') || current.cep,
        logradouro: result.logradouro || current.logradouro,
        complemento: result.complemento || current.complemento,
        bairro: result.bairro || current.bairro,
        cidade: result.localidade || current.cidade,
        estado: result.uf || current.estado,
      }));
    } catch {
      setCepError('Nao foi possivel consultar o CEP agora.');
    } finally {
      setCepLoading(false);
    }
  };

  const changeMode = (next: Mode, person: PessoaDisponivel | null = null) => { setMode(next); setLocalError(null); setDuplicateConfirmed(false); setSelectedPerson(person); setSearch(''); if (next !== 'importar') { setSourceEventId(null); setImportedKeys([]); } };
  const updateDraft = (type: AcompanhamentoTipo, patch: Partial<AcompanhamentoDraft>) => setDraftOverrides((current) => ({ ...current, [type.id]: { ...drafts[type.id], acompanhamentoTipoId: type.id, ...patch } }));
  const submit = async () => {
    setLocalError(null);
    setSuccessMessage(null);
    if (scope === 'futuros' && !parseBrDate(entryDate)) { setLocalError('Informe uma data valida no formato DD/MM/AAAA.'); return; }
    if (mode === 'virtual') {
      if (!name.trim()) { setLocalError('Informe o nome completo.'); return; }
      const birthDateValue = birthDate ? parseBrDate(birthDate) : null;
      const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);
      if (birthDate && (!birthDateValue || birthDateValue.getTime() > endOfToday.getTime())) { setLocalError('Informe uma data de nascimento valida no formato DD/MM/AAAA.'); return; }
      if (duplicatePeople.length && !duplicateConfirmed) { setLocalError('Confirme se e outra pessoa ou selecione a pessoa existente.'); return; }
      await onSubmit({ kind: 'adicionar_virtual', dados: { nome: name.trim(), email: email.trim() || null, telefone: phone.trim() || null, dataNascimento: birthDate ? toIsoDate(birthDate) : null, funcao: role || null, ...address }, escopo: scope, dataReferencia: scope === 'futuros' ? toIsoDate(entryDate) : dataReferencia, eventoIds: effectiveEventIds, grupoId, acompanhamentos: selectedAccompaniments });
      setName(''); setEmail(''); setPhone(''); setBirthDate(''); setRole(''); setAddress({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }); setAddressExpanded(false); setSelectedEventIds([]); setDraftOverrides({}); setDuplicateConfirmed(false);
      setSuccessMessage('Participante adicionado. Voce ja pode cadastrar outra pessoa.');
      return;
    }
    if (mode === 'existente') {
      if (!selectedPerson) { setLocalError('Selecione uma pessoa.'); return; }
      await onSubmit({ kind: 'adicionar', pessoa: selectedPerson, escopo: scope, dataReferencia: scope === 'futuros' ? toIsoDate(entryDate) : dataReferencia, funcao: role || null, eventoIds: effectiveEventIds, grupoId, acompanhamentos: selectedAccompaniments });
      setSelectedPerson(null); setSearch(''); setRole(''); setSelectedEventIds([]); setSuccessMessage('Pessoa adicionada aos encontros selecionados.');
      return;
    }
    const selectedRows = importRows.filter((row) => importedKeys.includes(row.key) && !row.blocked);
    if (!selectedRows.length) { setLocalError('Selecione ao menos uma pessoa para importar.'); return; }
    for (const row of selectedRows) {
      const item = row.item;
      await onSubmit({ kind: 'adicionar', pessoa: { id: item.isVirtual ? item.usuarioVirtualId ?? 0 : item.usuarioId ?? 0, nome: item.nomeExibicao || item.nome, tipo: item.isVirtual ? 'usuario_virtual' : 'usuario', email: item.email }, escopo: scope, dataReferencia: scope === 'futuros' ? toIsoDate(entryDate) : dataReferencia, eventoIds: effectiveEventIds, grupoId });
    }
    setImportedKeys([]); setSelectedEventIds([]); setSuccessMessage(`${selectedRows.length} pessoa(s) adicionada(s) aos encontros selecionados.`);
  };

  return <View style={styles.body}>
    <View style={styles.modeRail}>{(['virtual', 'existente', 'importar'] as Mode[]).map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: mode === item }} style={[styles.modeButton, mode === item && styles.modeButtonActive]} onPress={() => changeMode(item)}><Ionicons name={item === 'virtual' ? 'person-add-outline' : item === 'existente' ? 'people-outline' : 'download-outline'} size={17} color={mode === item ? colors.surfacePrimary : colors.brandBlue} /><Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item === 'virtual' ? 'Novo participante' : item === 'existente' ? 'Pessoa existente' : 'Importar de evento'}</Text></Pressable>)}</View>
    <View style={styles.section}><Text style={styles.sectionTitle}>Desde quando essa pessoa participa?</Text><View style={styles.scopeRail}>{scopeOptions.map((option) => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: scope === option.value }} style={[styles.scopeCard, scope === option.value && styles.scopeCardActive]} onPress={() => setScope(option.value)}><Ionicons name={scope === option.value ? 'radio-button-on' : 'radio-button-off'} size={19} color={scope === option.value ? colors.brandBlue : colors.textMuted} /><View style={styles.flex}><Text style={styles.scopeTitle}>{option.title}</Text><Text style={styles.helper}>{option.description}</Text></View></Pressable>)}</View>{scope === 'futuros' && <View style={styles.dateRow}><View style={styles.flex}><Text style={styles.fieldLabel}>Chegou em</Text><DateField accessibilityLabel="Data de entrada" value={entryDate} onChange={setEntryDate} /></View><Pressable style={styles.todayButton} onPress={() => setEntryDate(toBrDate(new Date()))}><Text style={styles.todayText}>Hoje</Text></Pressable></View>}<Text style={styles.helper}>Data no formato DD/MM/AAAA. O historico registrado no passado e preservado.</Text></View>
    {mode !== 'importar' && <View style={styles.section}><Text style={styles.sectionTitle}>Em quais encontros?</Text><Text style={styles.helper}>{template.data?.data.adicionarNovosParticipantesEmTodosEventos ? 'O modelo esta configurado para selecionar todos os eventos deste grupo. Desmarque os encontros em que a pessoa nao participara.' : eventoTemplateId ? 'Este modelo adiciona a pessoa somente a este evento por padrao. Voce pode marcar outros eventos do grupo.' : 'Este evento sera selecionado. Marque outros eventos do grupo se a pessoa tambem participar deles.'}</Text>{loadingEventDefaults ? <ActivityIndicator color={colors.brandBlue} /> : eventDefaultsUnavailable ? <Text accessibilityRole="alert" style={styles.error}>Nao foi possivel carregar a preferencia do modelo. Tente novamente antes de adicionar.</Text> : sameGroupEvents.length ? sameGroupEvents.map((item) => <CheckRow key={item.id} label={item.titulo} checked={effectiveEventIds.includes(item.id)} disabled={item.id === eventoId} onPress={() => setSelectedEventIds((current) => { const base = current.length ? current : effectiveEventIds; return base.includes(item.id) ? base.filter((id) => id !== item.id || id === eventoId) : [...base, item.id]; })} />) : <Text style={styles.helper}>Este evento sera vinculado.</Text>}</View>}
    {mode === 'existente' && <View style={styles.section}><Text style={styles.fieldLabel}>Selecione a pessoa</Text><TextInput accessibilityLabel="Buscar pessoa" value={search} onChangeText={setSearch} placeholder="Buscar por nome" placeholderTextColor={colors.textMuted} style={styles.input} />{users.isLoading || virtuals.isLoading ? <ActivityIndicator color={colors.brandBlue} /> : people.length ? people.map((item) => <Pressable key={`${item.tipo}:${item.id}`} style={[styles.personRow, selectedPerson?.id === item.id && selectedPerson.tipo === item.tipo && styles.personRowSelected]} onPress={() => setSelectedPerson(item)}><Ionicons name={selectedPerson?.id === item.id && selectedPerson.tipo === item.tipo ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.brandBlue} /><View style={styles.flex}><Text style={styles.personName}>{item.nome}</Text>{item.email ? <Text style={styles.helper}>{item.email}</Text> : null}</View><Text style={styles.personTag}>{item.tipo === 'usuario' ? 'Membro' : 'Virtual'}</Text></Pressable>) : <Text style={styles.helper}>Nenhuma pessoa elegivel encontrada.</Text>}{selectedPerson && currentAccompaniments.isFetching && <Text style={styles.helper}>Carregando acompanhamentos atuais...</Text>}</View>}
    {mode === 'importar' && <View style={styles.section}><Text style={styles.fieldLabel}>Evento de origem</Text><SelectLike value={sourceEventId ? (importOptions.find((item) => item.id === sourceEventId)?.titulo ?? '') : ''} placeholder={events.isLoading ? 'Carregando eventos...' : 'Selecione um evento'} options={importOptions.map((item) => item.titulo)} onSelect={(label) => { const item = importOptions.find((option) => option.titulo === label); setSourceEventId(item?.id ?? null); setImportedKeys([]); }} />{sourceEventId ? <>{sourceParticipants.isFetching && <ActivityIndicator color={colors.brandBlue} />}{importRows.length ? <><View style={styles.importToolbar}><Text style={styles.sectionTitle}>Participantes do evento</Text><View style={styles.toolbarActions}><Pressable onPress={() => setImportedKeys(importRows.filter((row) => !row.blocked).map((row) => row.key))}><Text style={styles.link}>Selecionar todos</Text></Pressable><Pressable onPress={() => setImportedKeys([])}><Text style={styles.link}>Limpar</Text></Pressable></View></View>{importRows.map((row) => <CheckRow key={row.key} label={row.item.nomeExibicao || row.item.nome} description={row.blocked ? 'Ja esta neste evento' : row.item.email || undefined} checked={importedKeys.includes(row.key)} disabled={row.blocked} onPress={() => setImportedKeys((current) => current.includes(row.key) ? current.filter((key) => key !== row.key) : [...current, row.key])} />)}</> : !sourceParticipants.isFetching ? <Text style={styles.helper}>Nenhum participante elegivel neste evento.</Text> : null}</> : null}</View>}
    {mode === 'virtual' && <View style={styles.section}><Text style={styles.fieldLabel}>Nome completo *</Text><TextInput accessibilityLabel="Nome completo" value={name} onChangeText={(value) => { setName(value); setDuplicateConfirmed(false); }} placeholder="Ex.: Pedro Silva" placeholderTextColor={colors.textMuted} style={styles.input} />{duplicatePeople.length ? <View style={styles.warning}><Ionicons name="warning-outline" size={18} color="#B45309" /><View style={styles.flex}><Text style={styles.warningTitle}>Ja existe uma pessoa com nome semelhante neste grupo.</Text>{duplicatePeople.slice(0, 3).map((item) => <Pressable key={`${item.tipo}:${item.id}`} onPress={() => changeMode('existente', item)}><Text style={styles.link}>Usar esta pessoa: {item.nome}</Text></Pressable>)}<Pressable onPress={() => setDuplicateConfirmed(true)}><Text style={styles.link}>E outra pessoa, cadastrar mesmo assim</Text></Pressable></View></View> : null}<Text style={styles.fieldLabel}>E-mail</Text><TextInput accessibilityLabel="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Opcional" placeholderTextColor={colors.textMuted} style={styles.input} /><Text style={styles.fieldLabel}>Telefone</Text><TextInput accessibilityLabel="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Opcional" placeholderTextColor={colors.textMuted} style={styles.input} /><Text style={styles.fieldLabel}>Data de nascimento</Text><DateField accessibilityLabel="Data de nascimento" value={birthDate} onChange={setBirthDate} allowFuture={false} /><Pressable accessibilityRole="button" accessibilityState={{ expanded: addressExpanded }} style={styles.addressToggle} onPress={() => setAddressExpanded((current) => !current)}><Ionicons name={addressExpanded ? 'chevron-up' : 'chevron-down'} size={17} color={colors.brandBlue} /><Text style={styles.link}>{addressExpanded ? 'Ocultar endereco' : 'Adicionar endereco (opcional)'}</Text></Pressable>{addressExpanded ? <AddressFields address={address} onChange={setAddress} cepLoading={cepLoading} cepError={cepError} onCepBlur={() => void lookupAddress()} /> : null}<Text style={styles.helper}>Com e-mail, o convite de acesso sera processado. Sem e-mail, o cadastro fica interno.</Text></View>}
    {(mode === 'virtual' || mode === 'existente') && <View style={styles.section}><Text style={styles.fieldLabel}>Papel / funcao no evento</Text><SelectLike value={role} placeholder={roles.isLoading ? 'Carregando papeis...' : 'Nenhum'} options={['Nenhum', ...(roles.data ?? []).map((item) => item.nome)]} onSelect={(value) => setRole(value === 'Nenhum' ? '' : value)} /></View>}
    {mode === 'virtual' && <AccompanimentsSection types={accompanimentTypes.data ?? []} drafts={drafts} onChange={updateDraft} loading={accompanimentTypes.isLoading} error={accompanimentTypes.isError ? 'Nao foi possivel carregar os acompanhamentos configurados.' : null} />}
    {mode === 'existente' && <View style={styles.section}><Text style={styles.sectionTitle}>Dados da pessoa</Text><Text style={styles.helper}>Os acompanhamentos ja pertencem ao cadastro desta pessoa e nao precisam ser definidos novamente.</Text></View>}
    {successMessage ? <Text accessibilityRole="alert" style={styles.success}>{successMessage}</Text> : null}
    {(parentError || localError) && <Text accessibilityRole="alert" style={styles.error}>{parentError || localError}</Text>}
    <View style={styles.footer}><Pressable disabled={pending} style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryButtonText}>Cancelar</Text></Pressable><Pressable disabled={pending || loadingEventDefaults || eventDefaultsUnavailable} style={[styles.primaryButton, (pending || loadingEventDefaults || eventDefaultsUnavailable) && styles.disabled]} onPress={() => void submit()}><Ionicons name={mode === 'importar' ? 'download-outline' : 'person-add-outline'} size={18} color={colors.surfacePrimary} /><Text style={styles.primaryText}>{pending ? 'Salvando...' : loadingEventDefaults ? 'Carregando...' : mode === 'importar' ? `Importar ${importedKeys.length || ''}`.trim() : 'Adicionar participante'}</Text></Pressable></View>
  </View>;
}

function AccompanimentsSection({ types, drafts, onChange, loading, error }: { types: AcompanhamentoTipo[]; drafts: Record<number, AcompanhamentoDraft>; onChange: (type: AcompanhamentoTipo, patch: Partial<AcompanhamentoDraft>) => void; loading: boolean; error: string | null }) {
  return <View style={styles.section}><View style={styles.titleWithIcon}><Ionicons name="options-outline" size={18} color={colors.brandBlue} /><Text style={styles.sectionTitle}>Acompanhamentos</Text></View><Text style={styles.helper}>Campos definidos pela estrutura. O cadastro permanece dinamico.</Text>{loading ? <ActivityIndicator color={colors.brandBlue} /> : error ? <Text style={styles.helper}>{error}</Text> : !types.length ? <Text style={styles.helper}>Nenhum acompanhamento configurado.</Text> : types.map((type) => { const draft = drafts[type.id] ?? { acompanhamentoTipoId: type.id, status: type.natureza === 'curso' ? 'nao_iniciado' : null, valor: type.natureza === 'curso' ? null : false }; return <View key={type.id} style={styles.accompanimentRow}>{type.natureza === 'curso' ? <><Text style={styles.fieldLabel}>{type.nome}</Text><View style={styles.statusRail}>{courseStatuses.map(([value, label]) => <Pressable key={value} style={[styles.statusButton, draft.status === value && styles.statusButtonActive]} onPress={() => onChange(type, { status: value })}><Text style={[styles.statusButtonText, draft.status === value && styles.statusButtonTextActive]}>{label}</Text></Pressable>)}</View><View style={styles.dateRow}><View style={styles.flex}><Text style={styles.fieldLabel}>Data de inicio (opcional)</Text><DateField accessibilityLabel={`Data de inicio de ${type.nome}`} value={toBrDate(draft.dataInicio ?? '')} onChange={(value) => onChange(type, { dataInicio: toIsoDate(value) })} /></View>{draft.dataInicio ? <Pressable accessibilityRole="button" accessibilityLabel={`Limpar data de inicio de ${type.nome}`} style={styles.todayButton} onPress={() => onChange(type, { dataInicio: null })}><Text style={styles.link}>Limpar</Text></Pressable> : null}</View></> : <CheckRow label={type.nome} checked={draft.valor === true} onPress={() => onChange(type, { valor: draft.valor === true ? false : true })} />}</View>; })}</View>;
}

function DateField({ accessibilityLabel, value, onChange, allowFuture = true }: { accessibilityLabel: string; value: string; onChange: (value: string) => void; allowFuture?: boolean }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => parseBrDate(value) ?? new Date());
  const [draft, setDraft] = useState(selected);
  const openPicker = () => { const date = parseBrDate(value) ?? new Date(); setSelected(date); setDraft(date); setOpen(true); };
  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') { setOpen(false); return; }
    if (!date) return;
    if (Platform.OS === 'android') { onChange(toBrDate(date)); setOpen(false); }
    else setDraft(date);
  };
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={styles.dateField} onPress={openPicker}>
      <Text style={value ? styles.dateValue : styles.datePlaceholder}>{value || 'DD/MM/AAAA'}</Text>
      <Ionicons name="calendar-outline" size={19} color={colors.brandBlue} />
    </Pressable>
    {open && Platform.OS === 'android' ? <DateTimePicker value={selected} mode="date" display="calendar" maximumDate={allowFuture ? undefined : new Date()} onChange={handleChange} /> : null}
    {Platform.OS === 'ios' && <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.dateModalBackdrop}><View style={styles.dateModal} accessibilityViewIsModal>
        <Text style={styles.sectionTitle}>{accessibilityLabel}</Text>
        <DateTimePicker value={draft} mode="date" display="inline" locale="pt-BR" maximumDate={allowFuture ? undefined : new Date()} onChange={handleChange} />
        <View style={styles.dateModalActions}><Pressable style={styles.dateModalButton} onPress={() => setOpen(false)}><Text style={styles.secondaryButtonText}>Cancelar</Text></Pressable><Pressable style={[styles.dateModalButton, styles.dateModalConfirm]} onPress={() => { onChange(toBrDate(draft)); setOpen(false); }}><Text style={styles.dateModalConfirmText}>Confirmar</Text></Pressable></View>
      </View></View>
    </Modal>}
  </>;
}

function AddressFields({ address, onChange, cepLoading, cepError, onCepBlur }: { address: Address; onChange: (value: Address) => void; cepLoading: boolean; cepError: string | null; onCepBlur: () => void }) {
  const fields: [keyof Address, string][] = [['logradouro', 'Logradouro'], ['numero', 'Numero'], ['complemento', 'Complemento'], ['bairro', 'Bairro'], ['cidade', 'Cidade'], ['estado', 'Estado']];
  return <View style={styles.addressSection}><Text style={styles.fieldLabel}>Endereco (opcional)</Text><View style={styles.cepRow}><TextInput accessibilityLabel="CEP" value={address.cep} onChangeText={(value) => { onChange({ ...address, cep: value }); }} onBlur={onCepBlur} keyboardType="numeric" maxLength={9} placeholder="CEP" placeholderTextColor={colors.textMuted} style={[styles.input, styles.cepInput]} />{cepLoading ? <ActivityIndicator style={styles.cepSpinner} color={colors.brandBlue} /> : null}</View>{cepError ? <Text style={styles.cepError}>{cepError}</Text> : null}{fields.map(([key, label]) => <TextInput key={key} accessibilityLabel={label} value={address[key]} onChangeText={(value) => onChange({ ...address, [key]: value })} placeholder={label} placeholderTextColor={colors.textMuted} style={styles.input} />)}</View>;
}

function CheckRow({ label, description, checked, disabled = false, onPress }: { label: string; description?: string; checked: boolean; disabled?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked, disabled }} disabled={disabled} style={[styles.checkRow, disabled && styles.disabledRow]} onPress={onPress}><Ionicons name={checked ? 'checkbox' : 'square-outline'} size={21} color={checked ? colors.brandBlue : colors.textMuted} /><View style={styles.flex}><Text style={styles.personName}>{label}</Text>{description ? <Text style={styles.helper}>{description}</Text> : null}</View>{disabled && <Text style={styles.personTag}>Atual</Text>}</Pressable>;
}

function SelectLike({ value, placeholder, options, onSelect }: { value: string; placeholder: string; options?: string[]; onSelect?: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <View><Pressable style={styles.selectLike} onPress={() => setOpen((current) => !current)}><Text style={value ? styles.selectValue : styles.selectPlaceholder}>{value || placeholder}</Text><Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={17} color={colors.textMuted} /></Pressable>{open && options?.length ? <View style={styles.optionMenu}>{options.map((option) => <Pressable key={option} style={styles.optionRow} onPress={() => { onSelect?.(option); setOpen(false); }}><Text style={styles.optionText}>{option}</Text>{option === value && <Ionicons name="checkmark" size={17} color={colors.brandBlue} />}</Pressable>)}</View> : null}</View>;
}

function normalizeName(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ').trim(); }
function toBrDate(value: string | Date) { const date = value instanceof Date ? value : new Date(`${value.slice(0, 10)}T12:00:00`); return Number.isNaN(date.getTime()) ? '' : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; }
function parseBrDate(value: string) { const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value); if (!match) return null; const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12); return date.getFullYear() === Number(match[3]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[1]) ? date : null; }
function toIsoDate(value: string) { const date = parseBrDate(value); return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T12:00:00` : ''; }

const styles = StyleSheet.create({
  body: { gap: 14, paddingBottom: 8 }, modeRail: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, modeButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: 10 }, modeButtonActive: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue }, modeText: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' }, modeTextActive: { color: colors.surfacePrimary }, section: { gap: 9, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 13 }, sectionTitle: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '800' }, titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 7 }, scopeRail: { gap: 7 }, scopeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, padding: 10 }, scopeCardActive: { borderColor: '#93C5FD', backgroundColor: '#EFF6FF' }, scopeTitle: { ...typography.caption, color: colors.textHeading, fontWeight: '800' }, helper: { ...typography.caption, color: colors.textSecondary, lineHeight: 17 }, flex: { flex: 1, minWidth: 0 }, dateRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 }, dateField: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 11, backgroundColor: colors.surfacePrimary }, dateValue: { ...typography.bodySmall, color: colors.textBody }, datePlaceholder: { ...typography.bodySmall, color: colors.textMuted }, dateModalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.42)' }, dateModal: { gap: 10, padding: 18, paddingBottom: 28, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md, backgroundColor: colors.surfacePrimary }, dateModalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }, dateModalButton: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: 14 }, dateModalConfirm: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue }, dateModalConfirmText: { ...typography.bodySmall, color: colors.surfacePrimary, fontWeight: '800' }, todayButton: { minHeight: 46, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: 12 }, todayText: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' }, fieldLabel: { ...typography.caption, color: colors.textHeading, fontWeight: '800' }, input: { minHeight: 44, borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 11, color: colors.textBody, backgroundColor: colors.surfacePrimary }, cepRow: { position: 'relative', justifyContent: 'center' }, cepInput: { paddingRight: 42 }, cepSpinner: { position: 'absolute', right: 13 }, cepError: { ...typography.caption, color: colors.error, fontWeight: '700' }, personRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 7 }, personRowSelected: { borderColor: '#93C5FD', backgroundColor: '#EFF6FF' }, personName: { ...typography.bodySmall, color: colors.textHeading, fontWeight: '700' }, personTag: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' }, checkRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 7 }, disabledRow: { opacity: 0.65 }, selectLike: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, paddingHorizontal: 11, backgroundColor: colors.surfacePrimary }, selectValue: { ...typography.bodySmall, color: colors.textBody }, selectPlaceholder: { ...typography.bodySmall, color: colors.textMuted }, optionMenu: { overflow: 'hidden', borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.sm, backgroundColor: colors.surfacePrimary }, optionRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#F1F5F9', paddingHorizontal: 11 }, optionText: { ...typography.bodySmall, color: colors.textBody }, importToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, toolbarActions: { flexDirection: 'row', gap: 12 }, link: { ...typography.caption, color: colors.brandBlue, fontWeight: '800' }, addressToggle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }, warning: { flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: '#FDE68A', borderRadius: radius.sm, backgroundColor: '#FFFBEB', padding: 10 }, warningTitle: { ...typography.caption, color: '#92400E', fontWeight: '800' }, addressSection: { gap: 8, paddingTop: 4 }, accompanimentRow: { gap: 7, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingBottom: 9 }, statusRail: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 }, statusButton: { minHeight: 32, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.full, paddingHorizontal: 8 }, statusButtonActive: { borderColor: colors.brandBlue, backgroundColor: colors.brandBlue }, statusButtonText: { ...typography.caption, color: colors.textSecondary }, statusButtonTextActive: { color: colors.surfacePrimary, fontWeight: '800' }, error: { ...typography.bodySmall, color: colors.error, fontWeight: '700' }, success: { ...typography.bodySmall, color: '#047857', fontWeight: '800' }, footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderColor: colors.borderSubtle, paddingTop: 13 }, secondaryButton: { minHeight: 44, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderSubtle, borderRadius: radius.sm, paddingHorizontal: 14 }, secondaryButtonText: { ...typography.bodySmall, color: colors.textBody, fontWeight: '700' }, primaryButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.brandBlue, paddingHorizontal: 14 }, primaryText: { ...typography.bodySmall, color: colors.surfacePrimary, fontWeight: '800' }, disabled: { opacity: 0.55 },
});
