# Mini-PRD 09: Planos & Gestão SaaS

**Feature Branch**: `014-planos-saas`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Planos de assinatura, limites por recurso, upgrade/downgrade, billing

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `GET /api/planos` — Listar planos disponíveis com recursos e limites
- `GET /api/planos/{id}` — Detalhe de um plano específico
- `GET /api/assinaturas` — Assinatura ativa da estrutura atual
- `POST /api/assinaturas` — Criar/iniciar assinatura
- `PUT /api/assinaturas/{id}` — Atualizar (upgrade/downgrade)
- `GET /api/recursos` — Recursos disponíveis no sistema com limites por plano
- `GET /api/assinaturas/limites` — Limites atuais da estrutura e uso corrente

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/admin/planos/planos.component.ts` — Listagem de planos
- `libs/adm/admin/planos/planos-sistema.component.ts` — Painel de admin de planos do sistema
- `shared/services/assinatura/assinatura.service.ts`

### O que precisa ser construído (o gap)

1. **Rota de planos** — `/admin/planos` não existe no router; `planos.component` não está conectado
2. **Indicadores de limite** — Widgets no app que mostram uso vs. limite (ex: "3/5 grupos usados") quando usuário se aproxima do limite
3. **Fluxo de upgrade** — Ao atingir limite, usuário vê CTA de upgrade com comparativo de planos
4. **Página de assinatura atual** — Owner vê plano ativo, data de renovação, limites consumidos

---

## User Scenarios & Testing

### User Story 1 — Owner Visualiza Plano Atual e Consumo (Priority: P1)

O pastor quer saber qual plano está usando, quantos grupos já criou dos disponíveis e quando renova.

**Why this priority**: Owner precisa de transparência sobre o que está pagando e quanto headroom tem antes de precisar fazer upgrade — é responsabilidade básica do SaaS.

**Independent Test**: Um testador com estrutura ativa acessa `/admin/planos`. Vê plano ativo com nome, data de renovação, e barras de progresso mostrando uso de cada recurso (grupos, membros, eventos/mês).

**Acceptance Scenarios**:

1. **Given** o owner acessa `/admin/planos`, **When** a página carrega, **Then** vê: nome do plano ativo, data de próxima renovação, e lista de recursos com uso atual vs. limite.
2. **Given** recurso com limite de 5 grupos, **When** estrutura tem 4 grupos criados, **Then** barra de progresso mostra 80% e é exibida em amarelo (alerta).
3. **Given** recurso atingiu 100% do limite, **When** owner vê a página, **Then** barra está vermelha e aparece botão "Fazer Upgrade" com destaque.
4. **Given** owner clica em "Fazer Upgrade", **When** modal/página de upgrade abre, **Then** vê comparativo lado a lado com plano atual e opções de planos superiores.

---

### User Story 2 — Usuário Atinge Limite e Recebe CTA de Upgrade (Priority: P1)

Carlos tenta criar o sexto grupo mas o plano permite apenas 5. O sistema bloqueia a criação com mensagem clara e link para upgrade.

**Why this priority**: O momento exato em que o usuário tenta fazer algo além do limite é o maior ponto de conversão para upgrade — a mensagem precisa ser clara e o caminho de upgrade imediato.

**Independent Test**: Limitar estrutura de teste a 2 grupos. Com 2 grupos, ao tentar criar o terceiro, o sistema bloqueia a ação com mensagem de limite atingido e botão "Ver Planos".

**Acceptance Scenarios**:

1. **Given** estrutura atingiu limite de grupos do plano, **When** usuário clica em "Criar Grupo", **Then** ação é bloqueada com modal: "Limite atingido. Seu plano permite N grupos. Faça upgrade para continuar."
2. **Given** modal de limite atingido, **When** usuário clica "Ver Planos", **Then** é redirecionado para página de comparativo de planos com plano atual destacado.
3. **Given** estrutura atingiu 90% do limite de membros, **When** qualquer admim acessa o dashboard, **Then** banner de aviso aparece no topo: "Você está usando 90% do seu limite de membros."
4. **Given** banner de 90%, **When** usuário dispensa o banner, **Then** ele não reaparece naquela sessão mas volta na próxima se o limite ainda estiver alto.

---

### User Story 3 — Owner Faz Upgrade de Plano (Priority: P2)

O pastor decidiu expandir sua organização e quer fazer upgrade do plano Básico para o Profissional.

**Why this priority**: Upgrade é a ação de monetização do SaaS — o fluxo precisa ser simples e sem fricção.

**Independent Test**: Um testador na página de planos clica em "Fazer Upgrade para Profissional", confirma, e o plano ativo muda imediatamente com novos limites aplicados.

**Acceptance Scenarios**:

1. **Given** owner está na página de planos, **When** clica no botão do plano superior, **Then** vê modal de confirmação com: novo valor, diferença pro-rata se aplicável, e benefícios adicionais.
2. **Given** owner confirma upgrade, **When** processado, **Then** limites são atualizados imediatamente e página mostra o novo plano ativo.
3. **Given** upgrade foi concluído, **When** owner acessa a página de planos, **Then** novo plano está marcado como ATIVO e ações bloqueadas anteriormente estão disponíveis.

---

### User Story 4 — Admin do Sistema Gerencia Planos Disponíveis (Priority: P3)

O admin da plataforma SaaS precisa criar um novo plano promocional com limites diferentes para um grupo específico de clientes.

**Why this priority**: Capacidade do admin de gerenciar catálogo de planos é necessária para o SaaS ser operável sem deploy de código para cada mudança de preço.

**Independent Test**: Um testador com papel de admin do sistema acessa `/admin/planos-sistema`, cria novo plano "Promo Igrejas", define limites e o plano aparece disponível para estruturas.

**Acceptance Scenarios**:

1. **Given** admin do sistema acessa `/admin/planos-sistema`, **When** clica em "Novo Plano", **Then** form solicita: nome, descrição, preço, limites por recurso (grupos, membros, eventos/mês, relatórios).
2. **Given** plano criado, **When** owner de estrutura acessa sua página de planos, **Then** novo plano aparece na lista de opções disponíveis.
3. **Given** admin desativa um plano, **When** estruturas ativas naquele plano tentam fazer upgrade/downgrade, **Then** plano desativado não aparece como opção mas assinaturas existentes não são afetadas.

---

### Edge Cases

- Downgrade para plano com limite menor que uso atual deve ser bloqueado com mensagem: "Você tem N grupos. Este plano permite X. Exclua Y grupos antes de fazer downgrade."
- Trial gratuito expirado deve bloquear ações mas preservar todos os dados — usuário ainda consegue visualizar tudo, apenas ação de criação é bloqueada.
- Mudança de limite não afeta retroativamente grupos/membros já criados — apenas bloqueia novas criações quando limite for atingido.

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar rota `/admin/planos` para owners visualizarem plano ativo e consumo.
- **FR-002**: A página de planos DEVE exibir barras de progresso de uso por recurso (grupos, membros, eventos/mês).
- **FR-003**: Recursos acima de 80% de uso DEVEM ter indicador visual de alerta (amarelo); 100% em vermelho com CTA de upgrade.
- **FR-004**: Ao tentar ação além do limite, o sistema DEVE bloquear com modal explicativo + link para upgrade.
- **FR-005**: O sistema DEVE exibir banner de aviso em páginas administrativas quando uso >= 90% de qualquer recurso.
- **FR-006**: A página de planos DEVE exibir comparativo lado a lado dos planos disponíveis.
- **FR-007**: O fluxo de upgrade DEVE exibir modal de confirmação com novo valor e benefícios antes de confirmar.
- **FR-008**: Downgrade para plano com limite menor que uso atual DEVE ser bloqueado com instrução clara.
- **FR-009**: Admin do sistema DEVE ter acesso a `/admin/planos-sistema` para gerenciar catálogo de planos.

### Key Entities

- **Plano**: Nome, preço, lista de limites por recurso. Status: ATIVO/INATIVO.
- **Assinatura**: Estrutura_id, plano_id, data_inicio, data_renovacao, status.
- **Recurso**: Nome (grupos, membros, eventos_por_mes), tipo (count, boolean).
- **LimitesAssinatura**: Uso corrente vs. limite do plano para cada recurso da estrutura.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Owner consegue ver plano ativo e uso de recursos em menos de 2 segundos na página de planos.
- **SC-002**: Fluxo de upgrade (selecionar plano → confirmar → plano ativo atualizado) conclui em menos de 30 segundos.
- **SC-003**: 100% das ações acima do limite exibem mensagem de bloqueio clara com CTA de upgrade — zero ações bem-sucedidas além do limite.
- **SC-004**: Banner de alerta de 90% aparece para todos os admins da estrutura em 100% dos acessos após atingir o threshold.
- **SC-005**: Downgrade com uso acima do novo limite é bloqueado em 100% dos casos — zero dados perdidos por downgrade acidental.

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
