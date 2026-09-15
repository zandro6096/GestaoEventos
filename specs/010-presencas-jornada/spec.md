# Mini-PRD 05: Presenças & Jornada Pessoal

**Feature Branch**: `010-presencas-jornada`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Registro de Presença, Check-in, Jornada do Participante

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `GET/POST /api/participacoes-evento` — Registrar e listar presenças de evento
- `PATCH /api/participacoes-evento/{id}` — Atualizar status de presença (PRESENTE, AUSENTE, JUSTIFICADO)
- `GET /api/participacoes` — Jornada pessoal do usuário (todos os eventos participados)
- `GET /api/participacoes-eventos/jornada` — Histórico pessoal com metadados de frequência
- `GET /api/eventos/hoje` — Eventos com ocorrência hoje para o contexto ativo

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/presencas/checkin/checkin.component.ts` — Tela de check-in
- `libs/adm/jornada/jornada.component.ts` — Jornada pessoal
- `libs/adm/presencas/frequencia/frequencia.component.ts` — Estatísticas de frequência
- `libs/adm/presencas/historico-presencas/historico-presencas.component.ts` — Histórico de presenças listado
- `libs/adm/eventos/eventos-hoje/eventos-hoje.component.ts` — Widget "Seus eventos hoje"
- `libs/adm/calendario/proximas-reunioes/proximas-reunioes.component.ts` — Próximas ocorrências
- `shared/services/jornada/jornada.service.ts`

### O que precisa ser construído (o gap)

1. **Rotas faltantes** — `/admin/jornada` e `/admin/checkin/:eventoId` não existem no router
2. **Orquestração da Jornada** — `jornada.component` existe mas não agrega `frequencia`, `historico-presencas` e `proximas-reunioes` na mesma página
3. **Registro em lote** — Responsável marca presença de toda a lista de participantes de uma vez (aprovar/reprovar bulk)
4. **Auto check-in pelo participante** — Participante confirma própria presença no evento usando link ou QR code (sem precisar do responsável)
5. **Indicador visual de frequência** — percentual de presença calculado em tempo real na jornada

---

## User Scenarios & Testing

### User Story 1 — Participante Visualiza Sua Jornada Pessoal (Priority: P1)

João quer ver seu histórico de participação na célula — quantos eventos participou, sua frequência, e quais próximos eventos estão programados.

**Why this priority**: A Jornada é a "home do participante" — é o que diferencia o SaaS de uma simples planilha de presença. Sem ela, o participante não tem valor percebido no produto.

**Independent Test**: Um testador com 5 presenças registradas acessa `/admin/jornada` e vê: frequência percentual, lista de eventos participados com status, e próximas ocorrências.

**Acceptance Scenarios**:

1. **Given** o usuário acessa `/admin/jornada`, **When** a página carrega, **Then** vê card de frequência (percentual no período padrão: últimos 30 dias) e lista de eventos participados.
2. **Given** o usuário vê sua frequência, **When** muda o filtro de período (7 dias, 30 dias, 90 dias, ano), **Then** o percentual e a lista se atualizam dinamicamente.
3. **Given** o usuário tem próximas reuniões agendadas, **When** vê a seção de próximas reuniões, **Then** as ocorrências futuras aparecem ordenadas por data com nome e grupo.
4. **Given** o usuário tem presença JUSTIFICADA em evento, **When** vê na jornada, **Then** aparece com marcador diferente de PRESENTE ou AUSENTE.
5. **Given** o usuário acessa a jornada num grupo específico, **When** filtra por grupo, **Then** apenas presenças daquele grupo são calculadas.

---

### User Story 2 — Responsável Registra Presenças em Lote (Priority: P1)

Maria finalizou o evento e precisa marcar rapidamente quem estava presente entre os 15 participantes da lista.

**Why this priority**: Registrar presença participante-a-participante é inviável na prática. O lote é o modo de uso real do responsável ao finalizar.

**Independent Test**: Um testador com evento INICIADO com 5 participantes lista a tela de check-in, marca 3 presentes (inclui selecionar todos e desmarcar 2) e salva. Os 3 aparecem na jornada deles como PRESENTE.

**Acceptance Scenarios**:

1. **Given** o responsável está na tela de acompanhamento do evento, **When** acessa a lista de participantes, **Then** vê checkbox ao lado de cada nome para marcar presença.
2. **Given** há lista de participantes, **When** o responsável clica "Selecionar todos", **Then** todos os checkboxes são marcados; ao clicar de novo, todos são desmarcados.
3. **Given** responsável marcou as presenças, **When** clica em "Salvar Presenças", **Then** sistema persiste cada participação com status PRESENTE e participantes desmarcados ficam AUSENTE.
4. **Given** presença já salva, **When** responsável corrige (muda de PRESENTE para JUSTIFICADO e fornece motivo), **Then** status é atualizado sem afetar outras presenças.
5. **Given** evento está FINALIZADO, **When** responsável tenta alterar presença, **Then** pode fazer ajuste por até 24h com campo de motivo obrigatório (policy de correção).

---

### User Story 3 — Participante Faz Auto Check-in (Priority: P2)

Chega no evento, Pedro abre o app e se confirma presente — sem precisar que o líder faça isso manualmente.

**Why this priority**: Reduz trabalho manual do responsável e aumenta o engajamento do participante com o produto.

**Independent Test**: Um testador com evento INICIADO acessa `/admin/checkin/:eventoId`, confirma presença. Na tela do responsável, o nome aparece como PRESENTE.

**Acceptance Scenarios**:

1. **Given** evento está INICIADO, **When** participante acessa `/admin/checkin/:eventoId`, **Then** vê detalhes do evento e botão "Confirmar Minha Presença".
2. **Given** participante clica em "Confirmar", **When** confirmação é processada, **Then** feedback visual de sucesso é exibido e o participante aparece na lista do responsável.
3. **Given** participante já fez check-in, **When** tenta confirmar novamente, **Then** sistema exibe "Você já confirmou presença neste evento" sem criar duplicata.
4. **Given** participante não está na lista de participantes do evento, **When** tenta fazer check-in, **Then** sistema exibe mensagem "Você não está na lista — solicite ao responsável".
5. **Given** evento está FINALIZADO ou CANCELADO, **When** participante tenta check-in, **Then** sistema informa que o evento não está aberto para check-in.

---

### User Story 4 — Participante Vê Eventos de Hoje (Priority: P2)

Logo na abertura do app, Ana vê no card "Hoje" quais eventos tem agendados para o dia.

**Why this priority**: Orientação diária reduz o abandono — o usuário sabe imediatamente o que fazer no app naquele dia.

**Independent Test**: Com evento ocorrendo hoje, um testador vê na tela inicial (ou na jornada) o widget "Hoje" mostrando o evento e consegue navegar para check-in em um toque.

**Acceptance Scenarios**:

1. **Given** o usuário tem evento com ocorrência hoje, **When** acessa a home ou jornada, **Then** widget "Eventos Hoje" exibe o evento com horário e nome.
2. **Given** evento de hoje está INICIADO, **When** usuário toca no card, **Then** é levado diretamente para check-in.
3. **Given** nenhum evento ocorre hoje, **When** o widget carrega, **Then** exibe mensagem "Nenhum evento hoje" de forma amigável.

---

### Edge Cases

- Usuário sem nenhuma presença registrada vê Jornada com 0% de frequência e mensagem de estado vazio amigável.
- Evento com 0 participantes na lista: responsável ainda consegue adicionar participantes durante registro de presença.
- Check-in duplicado não cria dois registros — idempotente.
- Ajuste de presença após 24h de evento finalizado deve ser bloqueado com mensagem explicativa; apenas admins podem fazer esse ajuste.
- Participante com papel apenas de "participante" não vê botão de salvar presenças em lote (apenas responsáveis veem esse controle).

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar rota `/admin/jornada` exibindo frequência pessoal, histórico de presenças e próximas reuniões.
- **FR-002**: A Jornada DEVE permitir filtrar por período (7 dias, 30 dias, 90 dias, ano) e por grupo.
- **FR-003**: O sistema DEVE exibir percentual de frequência calculado sobre o período selecionado.
- **FR-004**: A tela de acompanhamento de evento DEVE exibir lista de participantes com checkbox de presença.
- **FR-005**: O sistema DEVE suportar seleção em lote (selecionar todos / desmarcar todos) no registro de presenças.
- **FR-006**: O sistema DEVE disponibilizar rota `/admin/checkin/:eventoId` para auto check-in pelo participante.
- **FR-007**: Auto check-in DEVE ser idempotente — segunda confirmação não cria duplicata.
- **FR-008**: O sistema DEVE bloquear auto check-in em eventos FINALIZADOS ou CANCELADOS.
- **FR-009**: O sistema DEVE exibir widget "Eventos Hoje" na jornada ou home com link direto para check-in.
- **FR-010**: Correções de presença após evento finalizado DEVEM ser permitidas por até 24h pelo responsável; após isso, exclusivo para admins.

### Key Entities

- **ParticipacaoEvento**: Vínculo entre usuário e ocorrência. Status: PRESENTE | AUSENTE | JUSTIFICADO. Campos: motivo_justificativa, registrado_por.
- **Ocorrencia**: Instância do evento em data específica (status controla abertura do check-in).
- **Participante**: Usuário vinculado ao evento como participante esperado.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Responsável consegue registrar presença de 15 participantes em lote em menos de 45 segundos.
- **SC-002**: Participante consegue fazer auto check-in em menos de 15 segundos a partir da tela inicial.
- **SC-003**: Página de Jornada carrega com frequência calculada em menos de 2 segundos.
- **SC-004**: Percentual de frequência na Jornada está correto em 100% dos casos (sem divergência entre registros e cálculo exibido).
- **SC-005**: Zero registros duplicados de presença — check-in é idempotente.

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
