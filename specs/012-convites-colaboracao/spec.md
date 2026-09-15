# Mini-PRD 07: Convites & Colaboração

**Feature Branch**: `012-convites-colaboracao`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Envio de convites, aceite, gestão de pendentes, acesso de convidados

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `POST /api/convites` — Criar convite (email, papel, grupo_id, estrutura_id)
- `GET /api/convites` — Listar convites enviados com status (PENDENTE, ACEITO, EXPIRADO, CANCELADO)
- `POST /api/convites/aceitar` — Aceitar convite com token
- `GET /api/convites/validar/{token}` — Validar token antes de aceitar
- `DELETE /api/convites/{id}` — Cancelar convite pendente
- `POST /api/convites/{id}/reenviar` — Reenviar e-mail de convite

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/convites/aceitar-convite/aceitar-convite.component.ts` — Tela de aceite (roteada em `/convite/aceitar`)
- `shared/services/convite/convite.service.ts` — Service HTTP

### O que precisa ser construído (o gap)

1. **UI de envio de convite** — Não existe nenhuma tela para criar e enviar convites de dentro do app
2. **Gestão de convites enviados** — Não existe tela listando convites pendentes, aceitos, expirados com ações de reenviar/cancelar
3. **Fluxo não-autenticado do aceite** — `aceitar-convite.component` existe mas não trata o fluxo de usuário que ainda não tem conta (deve cadastrar ao aceitar)
4. **Convite por papel** — A UI precisa refletir que um convite pode ser para um papel específico (membro, líder, gestor) em um grupo específico

---

## User Scenarios & Testing

### User Story 1 — Gestor Envia Convite para Novo Membro (Priority: P1)

Rafael, líder de sua célula, quer convidar Pedro — que ainda não tem conta — para entrar no grupo com papel de membro.

**Why this priority**: Sem convites, a hierarquia não cresce. É o único mecanismo de onboarding de novos usuários com atribuição de papel.

**Independent Test**: Um testador acessa a tela de convites, envia convite para email-teste@exemplo.com como Membro do grupo "Célula Alpha". Um e-mail é disparado e aparece na lista como PENDENTE.

**Acceptance Scenarios**:

1. **Given** o gestor acessa "Gestão de Convites" no menu ou no detalhe do grupo, **When** clica em "Convidar", **Then** aparece modal/formulário solicitando: e-mail, papel e (opcionalmente) grupo.
2. **Given** o gestor preenche e-mail e papel e confirma, **When** o convite é enviado, **Then** aparece na lista como PENDENTE com data de expiração (7 dias padrão).
3. **Given** o e-mail já pertence a um usuário ativo na estrutura, **When** gestor tenta convidar, **Then** sistema exibe aviso "Este usuário já é membro" — não bloqueia envio mas informa.
4. **Given** o convite foi enviado, **When** gestor vê a lista, **Then** pode reenviar o e-mail ou cancelar o convite pendente.
5. **Given** convite já foi aceito, **When** gestor vê a lista, **Then** status exibe ACEITO com nome do usuário e data de aceite.

---

### User Story 2 — Convidado com Conta Aceita Convite (Priority: P1)

Joana recebe e-mail com link de convite. Ela já tem conta no sistema. Clica no link, faz login e é automaticamente adicionada ao grupo com o papel correto.

**Why this priority**: Fluxo mais comum — usuário já cadastrado sendo convidado para outro grupo ou estrutura.

**Independent Test**: Um testador com conta logada acessa `/convite/aceitar?token=XXX`. A tela exibe os detalhes do convite (grupo, papel) e ao clicar "Aceitar", o usuário é vinculado ao grupo.

**Acceptance Scenarios**:

1. **Given** o usuário está logado e acessa URL de aceite, **When** a página carrega, **Then** exibe: nome do grupo, papel que será atribuído, nome do remetente — e botão "Aceitar Convite".
2. **Given** usuário logado clica "Aceitar", **When** o backend processa, **Then** é adicionado ao grupo com o papel definido no convite e redirecionado para a home do contexto.
3. **Given** o token é inválido ou expirado, **When** a página carrega, **Then** exibe mensagem explicativa ("Link expirado" ou "Convite inválido") com opção de contatar o remetente.
4. **Given** o usuário já faz parte do grupo, **When** aceita convite duplicado, **Then** sistema exibe mensagem "Você já é membro deste grupo" sem criar vínculo duplicado.

---

### User Story 3 — Novo Usuário Aceita Convite e Cria Conta (Priority: P1)

Lucas recebe convite mas não tem conta. Ao clicar no link, vê a tela de aceite que lhe pede para criar conta — após cadastro, é automaticamente vinculado ao grupo.

**Why this priority**: A maioria dos novos usuários chegará via convite sem conta prévia. Se esse fluxo for ruim, a conversão de convidados em membros ativos será baixa.

**Independent Test**: Um testador sem conta acessa URL de aceite com token válido. Vê formulário de cadastro pré-preenchido com e-mail do convite. Após criar conta, é vinculado ao grupo conforme papel do convite.

**Acceptance Scenarios**:

1. **Given** usuário não autenticado acessa URL de aceite, **When** a página carrega, **Then** exibe detalhes do grupo/papel e formulário de cadastro com e-mail pré-preenchido pelo token.
2. **Given** o não-autenticado preenche nome, senha e confirma conta, **When** cadastro é concluído, **Then** é automaticamente logado e vinculado ao grupo com papel do convite.
3. **Given** o token expira enquanto o usuário está preenchendo o cadastro, **When** tenta confirmar, **Then** recebe mensagem clara de expiração com instrução para solicitar novo convite.
4. **Given** o usuário já tinha conta com aquele e-mail, **When** tenta criar conta nova via aceite, **Then** sistema detecta e-mail duplicado e oferece "Você já tem conta? Faça login" mantendo o contexto do convite na URL.

---

### User Story 4 — Gestor Gerencia Lista de Convites Pendentes (Priority: P2)

Rafael enviou 5 convites semana passada. Quer saber quais ainda não foram aceitos e reenviar para quem não respondeu.

**Why this priority**: Sem gestão de convites, o gestor não tem visibilidade de quem aceitou ou está ignorando e não pode tomar ação.

**Independent Test**: Um testador com 3 convites enviados (1 aceito, 1 pendente, 1 expirado) acessa "Gestão de Convites" e vê os 3 com status correto, podendo reenviar apenas o pendente e o expirado.

**Acceptance Scenarios**:

1. **Given** o gestor acessa "Gestão de Convites", **When** a lista carrega, **Then** exibe convites com status, e-mail do convidado, papel, grupo e data de envio.
2. **Given** convite está PENDENTE ou EXPIRADO, **When** gestor clica "Reenviar", **Then** novo e-mail é disparado e data de expiração é renovada.
3. **Given** convite está PENDENTE, **When** gestor clica "Cancelar", **Then** convite é marcado como CANCELADO e link original fica inválido.
4. **Given** gestor filtra por status PENDENTE, **When** lista é filtrada, **Then** vê apenas convites aguardando resposta.

---

### Edge Cases

- Convite expirado (> 7 dias sem aceite) deve ser exibido na lista mas com ação de "Reenviar" somente — sem "Aceitar" disponível ao convidado.
- Usuário pode ter múltiplos convites pendentes de estruturas diferentes — cada um é aceito independentemente.
- Convite para papel que o remetente não tem permissão de atribuir deve ser bloqueado com mensagem de permissão insuficiente.
- Reenvio de convite para e-mail que voltou como bounce deve registrar o erro mas não bloquear a ação na UI.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar tela de envio de convite acessível a partir do detalhe do grupo e de menu de gestão.
- **FR-002**: O form de convite DEVE solicitar: e-mail destino, papel e grupo (quando aplicável).
- **FR-003**: O sistema DEVE exibir lista de convites enviados com status, filtros (PENDENTE, ACEITO, EXPIRADO, CANCELADO) e ações (reenviar, cancelar).
- **FR-004**: Convites pendentes DEVEM expirar automaticamente após 7 dias.
- **FR-005**: A tela de aceite DEVE detectar se o usuário está autenticado: se sim, exibe aceite direto; se não, exibe formulário de cadastro.
- **FR-006**: Aceite de convite por usuário sem conta DEVE ter e-mail pré-preenchido no form de cadastro.
- **FR-007**: Após aceite, o usuário DEVE ser redirecionado para a home do contexto recém-ingressado.
- **FR-008**: Aceite duplicado (usuário já membro do grupo) DEVE ser idempotente — não criar vínculo duplicado.
- **FR-009**: O sistema DEVE bloquear criação de convite para papel acima da permissão do remetente.

### Key Entities

- **Convite**: Token UUID, email_destino, papel_id, grupo_id, estrutura_id, status (PENDENTE/ACEITO/EXPIRADO/CANCELADO), data_expiracao, remetente_id.
- **Papel**: Define o nível de acesso que será atribuído ao convidado após aceite.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Gestor consegue enviar convite em menos de 1 minuto a partir do detalhe do grupo.
- **SC-002**: Convidado com conta existente aceita convite e é vinculado ao grupo em menos de 30 segundos após clicar no link.
- **SC-003**: Novo usuário sem conta conclui cadastro via convite e acessa o grupo em menos de 3 minutos.
- **SC-004**: Taxa de conversão de convites enviados para aceitos deve ser mensurável (relatório de convites por status disponível).
- **SC-005**: Zero vínculos duplicados criados por aceites múltiplos do mesmo convite.

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
