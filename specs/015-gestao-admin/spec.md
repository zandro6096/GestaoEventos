# Mini-PRD 10: Gestão Administrativa

**Feature Branch**: `015-gestao-admin`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Papéis, tipos de grupo/evento, auditoria, gestão de usuários da estrutura

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `GET/POST/PUT/DELETE /api/papeis` — CRUD de papéis com permissões associadas
- `GET/POST/PUT/DELETE /api/tipos-grupo` — CRUD de tipos de grupo (ex: "Célula", "Departamento")
- `GET/POST/PUT/DELETE /api/tipos-evento` — CRUD de tipos de evento (ex: "Culto", "Reunião")
- `GET /api/auditoria` — Log de ações auditáveis filtrado por usuário, tipo, data
- `GET/PUT/DELETE /api/usuarios` — Listar usuários da estrutura; atualizar papel; remover
- `GET /api/usuarios/{id}/permissoes` — Permissões detalhadas do usuário no contexto

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/admin/papeis/papeis.component.ts` — CRUD de papéis
- `libs/adm/admin/tipos-evento/tipos-evento.component.ts` — CRUD de tipos de evento
- `libs/adm/admin/tipos-grupo/tipos-grupo.component.ts` — CRUD de tipos de grupo
- `libs/adm/admin/auditoria/auditoria.component.ts` — Log de auditoria
- `libs/adm/admin/usuario/usuario.component.ts` — Gestão de usuário individual
- `libs/adm/admin/configuracoes/configuracoes.component.ts` — Página de configurações gerais

### O que precisa ser construído (o gap)

1. **Rotas de configurações** — Nenhuma das rotas `/admin/configuracoes/*` está registrada no router
2. **Orquestração da página de admin** — Cada componente existe isolado; não há página container com sub-navegação
3. **Confirmação de ações destrutivas** — Excluir papel, tipo, ou usuário sem confirmação adequada é risco em produção
4. **Impacto em cascata** — Ao excluir tipo ou papel em uso, mostrar quais grupos/eventos são afetados antes de confirmar

---

## User Scenarios & Testing

### User Story 1 — Owner Gerencia Papéis e Permissões (Priority: P1)

A pastora quer criar um papel "Coordenador" com permissões entre Membro e Líder — pode ver relatórios mas não pode criar grupos.

**Why this priority**: Papéis determinam o que cada usuário pode fazer. Sem gestão de papéis, a estrutura não consegue adaptar o produto à sua hierarquia real.

**Independent Test**: Um testador acessa `/admin/configuracoes/papeis`, cria papel "Coordenador" selecionando permissões específicas. Um usuário com esse papel consegue acessar relatórios mas não o botão de criar grupo.

**Acceptance Scenarios**:

1. **Given** owner acessa `/admin/configuracoes/papeis`, **When** clica em "Novo Papel", **Then** form exibe nome e lista de permissões disponíveis com checkboxes agrupados por módulo.
2. **Given** papel criado, **When** owner atribui papel a um usuário, **Then** as permissões são aplicadas imediatamente sem necessidade de logout/login.
3. **Given** owner tenta excluir papel em uso por usuários, **When** clica "Excluir", **Then** sistema exibe: "Este papel está atribuído a N usuários. O que deseja fazer?" com opções: Transferir para outro papel | Cancelar.
4. **Given** papel é o único papel de um usuário, **When** owner tenta removê-lo sem substituição, **Then** ação é bloqueada com mensagem explicativa.

---

### User Story 2 — Owner Define Tipos de Grupo e Evento (Priority: P1)

A organização quer criar tipos de grupo personalizados: "Célula", "Ministério" e "Departamento" — cada um com ícone e cor diferente.

**Why this priority**: Tipos de grupo e evento são a base da configuração da estrutura. Sem tipos personalizados, todos os grupos parecem iguais — confuso para organizações com hierarquias complexas.

**Independent Test**: Um testador cria tipo de grupo "Ministério" com ícone de música e cor roxa. Ao criar novo grupo, "Ministério" aparece como opção e o novo grupo exibe o ícone/cor corretos.

**Acceptance Scenarios**:

1. **Given** owner acessa `/admin/configuracoes/tipos-grupo`, **When** clica em "Novo Tipo", **Then** form solicita: nome, ícone (seletor de ícones pré-definidos) e cor.
2. **Given** tipo criado, **When** usuário cria novo grupo, **Then** o novo tipo aparece na lista de opções do seletor de tipo.
3. **Given** owner tenta excluir tipo com grupos vinculados, **When** clica "Excluir", **Then** vê aviso: "Existem N grupos do tipo [X]. Exclua ou reclassifique-os antes de remover este tipo."
4. **Given** owner acessa `/admin/configuracoes/tipos-evento`, **When** cria tipo de evento "Treinamento", **Then** ao criar template de evento, "Treinamento" está disponível como tipo.

---

### User Story 3 — Owner Gerencia Usuários da Estrutura (Priority: P2)

A coordenadora precisa transferir um membro inativo para outro grupo e revogar acesso de alguém que saiu da organização.

**Why this priority**: Gestão de usuários é necessária para manter a estrutura atualizada — sem isso, ex-membros continuam com acesso e a lista fica poluída.

**Independent Test**: Um testador acessa lista de usuários, filtra por papel "Membro inativo", seleciona usuário e clica "Remover da Estrutura". O usuário perde acesso mas seus dados históricos (presenças) são preservados.

**Acceptance Scenarios**:

1. **Given** owner acessa `/admin/configuracoes/usuarios`, **When** a lista carrega, **Then** vê todos os usuários da estrutura com nome, e-mail, papel atual e data do último acesso.
2. **Given** owner seleciona usuário, **When** clica em "Alterar Papel", **Then** dropdown mostra papéis disponíveis; ao selecionar e confirmar, papel é atualizado imediatamente.
3. **Given** owner remove usuário da estrutura, **When** confirma a ação, **Then** usuário perde acesso mas histórico de presenças e participações é preservado (desvinculado, não excluído).
4. **Given** owner filtra usuários por papel ou status, **When** filtro é aplicado, **Then** lista é atualizada sem reload mostrando apenas usuários correspondentes.

---

### User Story 4 — Admin Consulta Log de Auditoria (Priority: P2)

Após perceber dados alterados, o admin quer investigar quem mudou as configurações de um grupo nas últimas 24 horas.

**Why this priority**: Auditoria é fundamental para conformidade e investigação de incidentes. Sem ela, mudanças indevidas são irrastreáveis.

**Independent Test**: Um testador acessa `/admin/configuracoes/auditoria`, filtra por tipo "grupo" e data "último dia". Vê lista de ações com usuário, timestamp, ação e objeto afetado.

**Acceptance Scenarios**:

1. **Given** admin acessa `/admin/configuracoes/auditoria`, **When** a página carrega, **Then** vê log com: timestamp, usuário, tipo de ação (criou/editou/excluiu), objeto afetado.
2. **Given** admin filtra por usuário específico, **When** filtro é aplicado, **Then** log mostra apenas ações daquele usuário no período selecionado.
3. **Given** admin clica em uma entrada de log, **When** detalhes são exibidos, **Then** vê antes/depois dos campos alterados para ações de edição.
4. **Given** admin seleciona período e tipo, **When** clica em "Exportar", **Then** log filtrado é exportado em CSV.

---

### Edge Cases

- Excluir tipo de grupo que é referenciado em templates de evento deve mostrar impacto nos templates antes de confirmar.
- Renomear papel não deve afetar as permissões atribuídas — apenas o nome exibido muda.
- Owner não pode remover seu próprio papel de owner sem transferir a outra pessoa (evitar estrutura sem owner).
- Log de auditoria deve ser somente-leitura — nenhum admin pode editar ou excluir entradas do log.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar `/admin/configuracoes` com sub-navegação para: Papéis, Tipos de Grupo, Tipos de Evento, Usuários, Auditoria.
- **FR-002**: CRUD de Papéis DEVE permitir definir permissões granulares por módulo (grupos, eventos, relatorios, configuracoes) via checkboxes.
- **FR-003**: Exclusão de papel com usuários vinculados DEVE exigir transferência de papel antes de confirmar.
- **FR-004**: CRUD de Tipos de Grupo DEVE suportar: nome, ícone (seletor pré-definido), cor.
- **FR-005**: Exclusão de Tipo com registros vinculados DEVE ser bloqueada com mensagem listando registros afetados.
- **FR-006**: Lista de Usuários DEVE suportar filtros por papel e data de último acesso.
- **FR-007**: Remoção de usuário da estrutura DEVE preservar histórico de presenças e participações.
- **FR-008**: Owner não pode remover seu próprio papel de owner sem designar outro owner.
- **FR-009**: Log de Auditoria DEVE suportar filtros por: usuário, tipo de ação, objeto, período.
- **FR-010**: Log de Auditoria DEVE ser exportável em CSV para o período filtrado.
- **FR-011**: Log de Auditoria é somente-leitura — nenhuma UI de edição ou exclusão deve existir.

### Key Entities

- **Papel**: Nome, lista de permissões (PermissaoEnum[]). Papéis padrão do sistema (OWNER, ADMIN, GESTOR, LIDER, MEMBRO) não são editáveis.
- **TipoGrupo**: Nome, ícone, cor, estrutura_id.
- **TipoEvento**: Nome, ícone, cor, estrutura_id.
- **LogAuditoria**: Timestamp, usuario_id, tipo_acao, entidade_tipo, entidade_id, dados_antes (JSON), dados_depois (JSON).

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Owner consegue criar novo papel com permissões em menos de 2 minutos.
- **SC-002**: Remoção de usuário da estrutura conclui em menos de 5 segundos com confirmação visual.
- **SC-003**: 100% das ações destrutivas (excluir papel, tipo, usuário) exibem modal de confirmação com impacto — zero exclusões acidentais por falta de aviso.
- **SC-004**: Log de auditoria retorna resultados filtrados em menos de 2 segundos para logs do último mês.
- **SC-005**: Zero dados históricos perdidos em remoção de usuário — presenças e participações preservadas em 100% dos casos.

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
