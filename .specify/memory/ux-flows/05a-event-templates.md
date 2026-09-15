# UX Flow: Criar e Gerir Modelos de Evento (Templates)

**Version**: 1.0.0
**Created**: 2026-02-18
**Status**: ✅ Mapeado com base no código real

> **Parte de**: [05 — Event Management Index](05-event-management.md)
> **Relacionado**: [05b — Iniciar Evento](05b-event-initiation.md)

---

## Quem Pode Criar Templates

| Perfil | Condição |
|--------|---------|
| Owner | `context.isOwner = true` → sempre liberado |
| Responsável de grupo | Precisa de `CRIAR_EVENTO` concedido explicitamente |

O guard `permissionGuard` checa `context.isOwner` primeiro — se `true`, libera
sem consultar `HierarchyPermissionsService`. Caso contrário, exige permissão explícita.

---

## Onde Está no Menu

```
Menu Lateral → Eventos → Modelos de Evento
                          ↓
                 /admin/eventos/modelos  (listar)
                          ↓
              [+ Novo Modelo] → /admin/eventos/criar

Menu Lateral → Eventos → Objetivos
                          ↓
                 /admin/eventos/objetivos
```

O item **"Modelos de Evento"** (e "Criar Evento") só aparece se o usuário tiver
`CREATE_EVENTS` — verificado em `menu.component.ts → buildMenu()`.

O item **"Objetivos"** fica disponível para owner com permissão de criação de evento.
Objetivos definem metas esperadas por template para alimentar a matriz do Cockpit.

---

## Rota e Componente

| Ação | Rota | Componente |
|------|------|-----------|
| Listar modelos | `/admin/eventos/modelos` | `ListarModelosEventoComponent` |
| Gerir objetivos | `/admin/eventos/objetivos` | `EventoObjetivosComponent` |
| Criar modelo | `/admin/eventos/criar` | `EventoFormComponent` |
| Editar modelo | `/admin/eventos/:id/editar` | `EventoFormComponent` |

---

## Gestão de Objetivos por Template

Componente: `GestaoEventos.Angular/src/app/libs/adm/eventos/objetivos/evento-objetivos.component`

Fluxo:

1. Owner acessa `Eventos → Objetivos` ou o botão `Objetivos` na listagem de modelos.
2. Filtra por status/modelo.
3. Cria ou edita objetivo usando o mesmo formulário.
4. Define tipo de avaliação: presença válida, quantidade de presenças, papel esperado ou conversão de papel.
5. Define prazo, meta e escopo por grupos, tipos de grupo ou por evento concreto quando o objetivo é de papel.
6. Para objetivo por papel no evento, escolhe o papel carregado da estrutura e a quantidade mínima de participantes ativos que cumpre a meta.
7. Usa `Atualizar estimativa` para ver grupos e participantes afetados antes de salvar.
8. Pausa/reativa objetivos sem apagar histórico.

Contratos principais:

| Ação | Endpoint |
|------|----------|
| Listar | `GET /api/evento-objetivos` |
| Obter por ID | `GET /api/evento-objetivos/{id}` |
| Estimar alcance | `POST /api/evento-objetivos/preview` |
| Criar | `POST /api/evento-objetivos` |
| Atualizar | `PUT /api/evento-objetivos/{id}` |
| Ativar/Pausar | `PATCH /api/evento-objetivos/{id}/status` |

---

## Formulário "Criar Modelo de Evento"

Componente: `GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component`

O formulário usa **PrimeNG** com `p-fieldset` para agrupar seções. Cada seção pode
ser colapsada (exceto "INFORMAÇÕES DO MODELO" que é sempre visível).

### Fieldset 1 — INFORMAÇÕES DO MODELO

| Campo | Elemento | Obrigatório | Regra de validação |
|-------|---------|-------------|-------------------|
| Nome Genérico | `pInputText` | ✅ | min 3, max 100 chars |
| Nome Personalizado (alias) | `pInputText` | ❌ | max 200 chars |
| Status | badge visual | — | default `RASCUNHO` (não editável pelo usuário) |
| Descrição | `pTextarea` | ❌ | legado |

> **Nota**: `nomeGenerico` é o nome canônico do template (ex: "Célula Semanal").
> `nomePersonalizado` é o apelido que o líder responsável pode customizar,
> se `podeCustomizarNome = true` no template.

### Fieldset 2 — QUANDO ACONTECE?

| Campo | Elemento PrimeNG | Obrigatório | Regra |
|-------|-----------------|-------------|-------|
| Data de Início | `p-calendar` (dateFormat dd/mm/yy, showIcon) | ✅ | — |
| Hora de Início | `pInputText` (máscara HH:mm) | ✅ | — |
| Duração — Horas | `p-inputNumber` (step 1, min 0, max 23) | ✅ | 0-23 |
| Duração — Minutos | `p-inputNumber` (step 15, min 0, max 59) | ✅ | 0-59 |
| Horário de Término | label calculado automaticamente (`calcularHorarioFim()`) | — | somente leitura |
| Local / Endereço | `pInputText` | ❌ | max 100 chars |

### Fieldset 3 — PARA QUEM?

| Campo | Elemento | Obrigatório | Comportamento |
|-------|---------|-------------|--------------|
| Adicionar para TODOS os Grupos | `p-inputSwitch` | ❌ | quando ON desabilita o multiselect abaixo |
| Grupos Específicos | `p-multiSelect` (filter, virtualScroll) | ✅ (se não for todos) | min 1 grupo selecionado |
| Incluir Participantes Específicos | `p-multiSelect` (filter, virtualScroll) | ❌ | pessoas fora dos grupos |
| Excluir Participantes Específicos | `p-multiSelect` (filter, virtualScroll) | ❌ | remover pessoas dos grupos |

> O `p-multiSelect` de grupos usa skeleton loader (`app-skeleton-loader`) enquanto
> carrega, e transição `[@fadeIn]` ao renderizar. Cada opção mostra nome + grupo pai.

### Fieldset 4 — REPETIR? (colapsável)

| Campo | Elemento | Obrigatório | Opções |
|-------|---------|-------------|--------|
| Tipo de Recorrência | `p-dropdown` | ✅ | UNICO / DIARIO / SEMANAL / MENSAL / ANUAL |
| Repetir Até | `p-calendar` | ✅ (se recorrente) | data fim > dataInicio |
| Dias da Semana | botões `p-button` (toggle visual) | ❌ | Seg–Dom; só aparece se SEMANAL |
| Dia do Mês | `p-inputNumber` (1-31) | ❌ | só aparece se MENSAL |
| Preview próximas ocorrências | lista calculada | — | mostra 5 de N ocorrências |

### Fieldset 5 — PERMISSÕES AO INICIAR (colapsável)

Define o que o responsável poderá customizar ao configurar um evento a partir deste template.
Cada item é um `p-inputSwitch` (ON = permite, OFF = campo travado/read-only).

| Switch | Controla | Efeito quando OFF |
|--------|---------|------------------|
| Permite dar apelido (alias) | `podeCustomizarNome` | Nome do evento é read-only |
| Permite editar local | `podeCustomizarLocal` | Campo local desabilitado |
| Permite editar data e horário | `podeCustomizarData` | Campos data/hora desabilitados |
| Permite escolher dias da semana | `podeCustomizarDia` | Dias são read-only (travados no template) |
| Permite adicionar participantes | `podeAdicionarParticipantes` | Botão de add participante oculto |
| Permite remover participantes | `podeRemoverParticipantes` | Botão de remover participante oculto |
| Permite adicionar responsáveis | `podeAdicionarResponsaveis` | Seção de co-responsáveis oculta |

> **Semântica de campos travados**: Quando um campo está travado (`podeCustomizar* = false`),
> existe **apenas um valor** — o definido no template. O responsável vê esse valor como
> texto somente leitura. Não há dois valores coexistindo.
>
> Quando liberado (`podeCustomizar* = true`), o responsável preenche o field na configuração
> e esse valor se torna o **único valor vigente** para aquela instância.
> O template não mantém um "valor paralelo" — o campo do responsável substitui completamente.
>
> Exemplo: `podeCustomizarLocal = true` → responsável preenche "Av. Paulista, 100".
> O owner vê "Av. Paulista, 100" na visualização da instância. Não existe
> "Rua do Owner" + "Av. Paulista" — só a rua do responsável.

---

### Fieldset 4-a — DIAS MÍNIMOS (apenas para recorrência SEMANAL, colapsável)

Quando `tipoRecorrencia = SEMANAL` e `podeCustomizarDia = true`, o owner pode definir
uma quantidade mínima de dias por semana que o responsável deve configurar:

| Campo | Elemento | Obrigatório | Regra |
|-------|---------|-------------|-------|
| Mínimo de dias por semana | `p-inputNumber` (min 1, max 7) | ❌ | Padrão = número de dias selecionados pelo owner |
| Dias sugeridos do template | botões toggle (read-only no form de configuração) | — | Usados como sugestão inicial |

**Comportamento no formulário de configuração (responsável)**:
- O responsável vê os dias sugeridos pelo template pré-selecionados.
- Pode trocar os dias (ex: Ter+Qui → Qua+Dom).
- Não pode selecionar menos dias do que `minDiasSemana`.
- Pode selecionar mais dias (ex: se mínimo = 2, pode escolher 3 dias).

**Propósito de negócio**: O owner garante frequência mínima de encontros por semana
(KPI de engajamento). O responsável adapta os dias para a realidade do grupo.

---

> **Campos travados** nos formulários downstream não têm input — aparecem como
> texto descritivo somente leitura, garantindo consistência de métricas sem
> tirar flexibilidade nos campos liberados.

### Fieldset 6 — CONFIGURAÇÕES ADICIONAIS (colapsável, collapsed por padrão)

| Switch / Campo | Controla | Default |
|---------------|---------|---------|
| Permite convidados | `permiteConvidados` | OFF |
| Convidados podem convidar | `convidadosPodemConvidar` | OFF |
| Exige confirmação de presença | `exigeConfirmacao` | OFF |
| Limite de Participantes | `p-inputNumber` (min 1) | em branco = sem limite |

---

## Botões de Ação

```
[Cancelar]  [Criar Modelo] (desabilitado se form inválido ou carregando)
```

Sucesso → toast de confirmação + redirect para `/admin/eventos/modelos`.

---

## Comportamentos Reativos do Formulário

- `tipoRecorrencia` muda → seções de dias/diaDoMes aparecem/somem (`[@slideIn]`)
- `todosGrupos = true` → `p-multiSelect` de grupos é desabilitado via `AbstractControl.disable()`
- `dataInicio` + `horaInicio` + duração → `calcularHorarioFim()` atualizado em tempo real
- Detecção de conflito de agenda (debounce 500ms) → alerta visual se outro evento
  já existe no mesmo horário do grupo

---

## Campos Internos (Controle do Sistema — Não Editáveis pelo Usuário)

| Campo | Tipo | Propósito |
|-------|------|----------|
| `eventoTemplateId` | uuid (nullable) | Vincula ao template pai (se for derivado) |
| `responsavelPrincipalId` | uuid | Auto-preenchido do `contextService.contexto()?.usuarioId` |
| `responsaveisAuxiliares` | uuid[] | Co-responsáveis definidos no wizard |
| `localizacaoTravada` | bool | Lock flag gerado conforme `podeCustomizarLocal` |
| `horarioTravado` | bool | Lock flag para hora/data |
| `recorrenciaTravada` | bool | Tipo de recorrência sempre travado |

---

## Restrições de Negócio

1. **MUST**: Grupos vinculados ao template — mínimo 1 grupo (ou `todosGrupos = true`).
2. **MUST**: Responsável principal é preenchido automaticamente pelo contexto do usuário logado.
3. **SHOULD**: Templates criados como `RASCUNHO` só aparecem para o criador; PUBLICADO é visível
   para responsáveis dos grupos vinculados.
4. **MUST NOT**: Alterar `tipoRecorrencia` após o primeiro evento ser iniciado a partir do template
   (campo travado após primeira ocorrência).
5. **MUST**: `tipoRecorrencia` é sempre travado para o responsável — ele não pode mudar o tipo
   (ex: de Semanal para Mensal). Apenas os dias específicos podem ser alterados, se `podeCustomizarDia = true`.
6. **MUST**: Quando `podeCustomizarDia = true` e `minDiasSemana` está definido, o responsável
   NÃO pode selecionar menos dias do que `minDiasSemana`. O backend deve rejeitar configurações abaixo do mínimo.
7. **MUST**: `nomeGenerico` é imutável pelo responsável em qualquer cenário. O responsável
   apenas preenche `nomePersonalizado` (apelido), nunca sobrescreve o nome oficial.
8. **MUST**: No dashboard do owner, instâncias de um mesmo template são agrupadas por
   `nomeGenerico` e identificadas individualmente por `nomePersonalizado` (apelido) quando houver.

---

## Relacionamentos

- Template → Grupos vinculados: N grupos podem ter o mesmo template
- Template → Eventos: Um template gera N eventos (um por grupo/responsável)
- Evento → Ocorrências: Um evento recorrente gera N ocorrências ao longo do tempo

---

**Próximo passo**: → [05b — Iniciar Evento (UX de Pendentes)](05b-event-initiation.md)
