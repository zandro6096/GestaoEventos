# Mini-PRD 06: Dashboard & Drill-Down Hierárquico

**Feature Branch**: `011-dashboard-drilldown`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Painéis por nível hierárquico, comparativo, drill-down, visão pessoal

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `GET /api/paineis/comparativo?estrutura_id=&periodo=` — Comparativo de frequência entre grupos no período
- `GET /api/grupos/{id}/presencas-media` — Média de presença do grupo
- `GET /api/estruturas/{id}/crescimento` — Dados de crescimento da estrutura
- `GET /api/grupos/{id}/eventos-realizados` — Contagem de eventos concluídos
- Todos os endpoints de grupos, eventos, presenças (filtragem já suportada por `grupo_id`, `estrutura_id`, `periodo`)

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/dashboard/macro-view/macro-view.component.ts` — Visão nível estrutura (owner/admin)
- `libs/adm/dashboard/intermediate-view/intermediate-view.component.ts` — Visão nível gestor de área
- `libs/adm/dashboard/micro-view/micro-view.component.ts` — Visão nível líder de grupo individual
- `libs/adm/dashboard/personal-view/personal-view.component.ts` — Visão pessoal do participante
- `libs/adm/dashboard/drilldown-card/drilldown-card.component.ts` — Card clicável para drill-down
- `libs/adm/dashboard/painel-comparativo/painel-comparativo.component.ts` — Painel comparativo entre grupos
- `libs/adm/dashboard/crescimento-membros/crescimento-membros.component.ts` — Gráfico de crescimento
- `libs/adm/dashboard/eventos-realizados/eventos-realizados.component.ts` — Contador de eventos realizados
- `libs/adm/dashboard/presenca-media/presenca-media.component.ts` — Indicador de presença média

### O que precisa ser construído (o gap)

1. **Página de Dashboard** — `dashboard.page.ts` existe mas não integra nenhum dos widgets acima
2. **Lógica de nível** — Servidor retorna contexto do usuário; front precisa selecionar qual view (macro/intermediate/micro/personal) renderizar com base no papel + nível hierárquico
3. **Navegação drill-down** — Clicar em card de grupo leva ao dashboard filtrado daquele grupo (URL params)
4. **Indicadores de alerta** — Badge em grupos com frequência abaixo do threshold configurado

---

## User Scenarios & Testing

### User Story 1 — Líder Vê Dashboard do Seu Grupo (Priority: P1)

Carlos, líder de célula, acessa o dashboard e vê apenas os dados da sua célula: presença média, eventos realizados e tendência de crescimento.

**Why this priority**: O dashboard é o principal argumento de valor do SaaS — líderes precisam ver dados acionáveis para tomar decisões.

**Independent Test**: Um testador com papel de líder acessa `/admin/dashboard` e vê cards com presença média, eventos realizados no mês e crescimento de membros — todos filtrados para o grupo que lidera.

**Acceptance Scenarios**:

1. **Given** o usuário tem papel de líder (micro view), **When** acessa `/admin/dashboard`, **Then** vê a micro-view com dados do seu grupo.
2. **Given** a micro-view carregou, **When** usuário vê o card de presença média, **Then** exibe percentual calculado sobre os últimos 30 dias por padrão.
3. **Given** dados carregaram, **When** o líder muda o período (7 dias, 30 dias, 3 meses), **Then** todos os widgets atualizam sem reload de página.
4. **Given** a presença média está abaixo de 60%, **When** o widget carrega, **Then** exibe indicador visual de alerta (cor vermelha ou ícone de aviso).
5. **Given** o líder tem múltiplos grupos, **When** abre o seletor de grupo, **Then** pode alternar entre os grupos que lidera.

---

### User Story 2 — Gestor de Área Faz Drill-Down para Grupo Específico (Priority: P1)

Ana, pastora de área, vê no painel comparativo que uma das células tem frequência muito baixa e clica para ver o detalhe daquele grupo.

**Why this priority**: O drill-down é o diferencial competitivo do produto — sem ele, o gestor não consegue agir sobre os dados que vê.

**Independent Test**: Um testador com papel de gestor acessa a visão intermediária, vê o painel comparativo com 3 grupos, clica em um card de grupo e a URL muda para o dashboard filtrado daquele grupo.

**Acceptance Scenarios**:

1. **Given** o usuário tem papel de gestor de área, **When** acessa `/admin/dashboard`, **Then** vê a intermediate-view com painel comparativo dos grupos sob sua gestão.
2. **Given** a intermediate-view mostra painel comparativo, **When** gestor clica em card de grupo específico, **Then** navega para dashboard filtered (`/admin/dashboard?grupo=:id`) mostrando micro-view daquele grupo.
3. **Given** o gestor está no drill-down de um grupo, **When** clica em "Voltar", **Then** retorna para a intermediate-view preservando o período selecionado.
4. **Given** um grupo tem frequência menor que o threshold, **When** aparece no painel comparativo, **Then** é destacado com badge de alerta.

---

### User Story 3 — Owner da Estrutura Vê Visão Macro (Priority: P1)

O dono da estrutura quer ver o health geral: crescimento de membros, percentual de grupos ativos este mês, e quantidade de eventos realizados.

**Why this priority**: Owner precisa do painel executivo para entender se a organização está crescendo ou estagnando.

**Independent Test**: Um testador com papel de owner acessa o dashboard e vê crescimento de membros (gráfico), total de grupos ativos e total de eventos realizados no mês — todos da estrutura inteira.

**Acceptance Scenarios**:

1. **Given** o usuário é owner, **When** acessa `/admin/dashboard`, **Then** vê macro-view com crescimento de membros, grupos ativos, eventos realizados e presença média geral.
2. **Given** owner está na macro-view, **When** clica em indicador de "grupos ativos", **Then** vê lista expandida de grupos com status individual e pode fazer drill-down.
3. **Given** owner está na macro-view, **When** muda período, **Then** gráfico de crescimento atualiza mostrando evolução mensal no período.

---

### User Story 4 — Participante Vê Visão Pessoal no Dashboard (Priority: P2)

Maria, participante ativa, quer ver seu resumo pessoal: quantos eventos participou, sua sequência atual e próximos eventos.

**Why this priority**: A visão pessoal aumenta o engajamento do participante — similar à Jornada, mas com foco em gamificação/streaks.

**Independent Test**: Um testador com papel de participante acessa o dashboard e vê: contagem de eventos participados, streak atual de presença contínua, e card de próximos eventos.

**Acceptance Scenarios**:

1. **Given** o usuário tem papel de participante sem grupos sob gestão, **When** acessa `/admin/dashboard`, **Then** vê personal-view com resumo de participação e próximos eventos.
2. **Given** o usuário tem streak de 4 semanas consecutivas, **When** vê a personal-view, **Then** streak é exibido com destaque visual.
3. **Given** o streak foi quebrado nesta semana, **When** o usuário vê, **Then** exibe streak atual (reiniciado) e melhor streak histórico em destaque secundário.

---

### Edge Cases

- Usuário com múltiplos papéis (ex: líder de grupo E gestor de área) vê o dashboard do nível mais alto. Pode alternar via seletor.
- Estrutura sem nenhum evento realizado exibe estado vazio amigável nos widgets (não erro ou zero sem contexto).
- Drill-down além do nível de permissão do usuário deve ser bloqueado — o card de grupos filhos de grupos que o usuário não gerencia não são navegáveis.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE selecionar automaticamente a view correta (macro / intermediate / micro / personal) com base no papel e nível hierárquico do usuário.
- **FR-002**: Todos os widgets DEVEM reagir ao seletor de período (7 dias, 30 dias, 3 meses) sem reload de página.
- **FR-003**: Cards de grupos na intermediate-view e macro-view DEVEM ser clicáveis para drill-down.
- **FR-004**: Drill-down DEVE atualizar a URL com parâmetros de filtro preservando o histórico de navegação.
- **FR-005**: Botão "Voltar" no drill-down DEVE restaurar a view anterior com o período preservado.
- **FR-006**: Grupos com frequência abaixo do threshold (padrão: 60%) DEVEM exibir badge de alerta.
- **FR-007**: O sistema DEVE exibir gráfico de crescimento de membros ao longo do tempo para macro e intermediate views.
- **FR-008**: Usuário com múltiplos papéis hierárquicos DEVE poder alternar o nível de visão via seletor.
- **FR-009**: Estados vazios (sem dados no período) DEVEM exibir mensagem amigável, não zeros sem contexto.

### Key Entities

- **PainelComparativo**: Agregação de frequência por grupo em período.
- **CrescimentoMembro**: Série temporal de adesão ao grupo/estrutura.
- **EventoRealizado**: Contagem de ocorrências FINALIZADAS no período.
- **NivelDashboard**: Determinado por papel do usuário: OWNER→macro, GESTOR→intermediate, LIDER→micro, PARTICIPANTE→personal.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Dashboard carrega com todos os widgets em menos de 2 segundos.
- **SC-002**: Drill-down de gestor para grupo específico ocorre em menos de 1 segundo (transição de URL + recarga de dados).
- **SC-003**: Mudança de período atualiza todos os widgets em menos de 1,5 segundos.
- **SC-004**: 100% dos usuários veem a view correta para seu papel sem precisar configurar manualmente.
- **SC-005**: Líderes com alerta de baixa frequência identificam qual grupo precisa de atenção em menos de 10 segundos após abrir o dashboard.

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
