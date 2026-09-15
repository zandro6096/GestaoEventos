# Mini-PRD 08: Relatórios de Frequência & Crescimento

**Feature Branch**: `013-relatorios-frequencia`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Relatórios exportáveis, análise de frequência por grupo/evento, crescimento de membros

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `GET /api/relatorios/frequencia?grupo_id=&periodo=&formato=` — Relatório de frequência em JSON ou CSV
- `GET /api/relatorios/crescimento?estrutura_id=&periodo=` — Crescimento de membros
- `GET /api/relatorios/eventos-por-grupo?grupo_id=&periodo=` — Eventos realizados agrupados
- `GET /api/participacoes-eventos/jornada?usuario_id=&periodo=` — Frequência individual
- Todos os endpoints de participações suportam filtros `?grupo_id`, `?periodo`

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/relatorios/frequencia-relatorio/frequencia-relatorio.component.ts` — Tabela de frequência
- `libs/adm/relatorios/relatorio/frequencia/frequencia.component.ts` — Wrapper de relatório de frequência
- `libs/adm/presencas/frequencia/frequencia.component.ts` — Widget de frequência inline
- `shared/services/relatorio/relatorio.service.ts`

### O que precisa ser construído (o gap)

1. **Rota de relatórios** — `/admin/relatorios` não existe no router
2. **Filtros de período e grupo** — Controles de filtro não estão conectados aos componentes existentes
3. **Exportação** — Botão de exportar CSV/PDF ainda não implementado no front
4. **Navegação entre tipos de relatório** — Tabs ou menu para alternar entre frequência, crescimento, eventos realizados

---

## User Scenarios & Testing

### User Story 1 — Gestor Visualiza Relatório de Frequência do Grupo (Priority: P1)

Pastor Marcos quer ver a frequência semanal de cada membro da sua célula nos últimos 3 meses para identificar quem está se afastando.

**Why this priority**: Relatórios de frequência são o principal argumento de valor do produto para líderes — é o dado que move conversas pastorais.

**Independent Test**: Um testador com evento em grupo acessa `/admin/relatorios`, seleciona grupo "Célula Alpha" e período "últimos 3 meses". Vê tabela com nome de cada membro, semana a semana, com P(PRESENTE)/A(AUSENTE)/J(JUSTIFICADO).

**Acceptance Scenarios**:

1. **Given** o gestor acessa `/admin/relatorios`, **When** a página carrega, **Then** vê seletor de tipo de relatório (Frequência / Crescimento / Eventos Realizados) e filtros de grupo e período.
2. **Given** gestor seleciona relatório de Frequência, grupo e período, **When** clica em "Gerar", **Then** tabela exibe membros nas linhas e datas de eventos nas colunas, com status de cada presença.
3. **Given** tabela está carregada, **When** gestor clica em nome de membro, **Then** vê drill-down do histórico individual com percentual de frequência e tendência.
4. **Given** membro tem frequência abaixo de 50% no período, **When** aparece na tabela, **Then** linha é destacada visualmente (cor ou ícone de alerta).
5. **Given** período selecionado não tem nenhum evento registrado, **When** "Gerar" é clicado, **Then** estado vazio amigável é exibido com sugestão de ampliar o período.

---

### User Story 2 — Gestor Exporta Relatório para CSV (Priority: P2)

Marcos precisa enviar o relatório de frequência do trimestre para o pastor supervisor por e-mail. Clica em "Exportar CSV" e baixa o arquivo.

**Why this priority**: Exportação é necessária para integrações externas e fluxos offline — igrejas frequentemente precisam enviar dados para outras ferramentas.

**Independent Test**: Um testador gera relatório de frequência e clica em "Exportar CSV". Um arquivo `.csv` é baixado com colunas: nome do membro, e-mail, + uma coluna por data de evento (P/A/J).

**Acceptance Scenarios**:

1. **Given** relatório gerado está visível, **When** gestor clica em "Exportar CSV", **Then** arquivo `.csv` é baixado com os mesmos dados exibidos na tabela.
2. **Given** arquivo CSV é aberto em planilha, **When** visualizado, **Then** cabeçalhos incluem: Nome, E-mail, Grupo, + uma coluna por data de evento com status (P/A/J/-).
3. **Given** relatório filtrado tem 0 linhas, **When** gestor tenta exportar, **Then** botão de exportar está desabilitado com tooltip "Gere um relatório primeiro".

---

### User Story 3 — Owner Analisa Crescimento da Estrutura (Priority: P2)

O responsável pela organização quer ver se a estrutura cresceu nos últimos 6 meses comparando o número de membros mês a mês.

**Why this priority**: Crescimento é o KPI primário para owners de estruturas — demonstra ROI do uso do SaaS.

**Independent Test**: Um testador com papel de owner acessa relatório de Crescimento, seleciona período "últimos 6 meses". Vê gráfico de linha com total de membros por mês e tabela detalhada exibindo entradas e saídas.

**Acceptance Scenarios**:

1. **Given** o owner acessa relatório de Crescimento, **When** seleciona período, **Then** gráfico de linha exibe evolução mensal do total de membros ativos.
2. **Given** gráfico carregado, **When** owner passa o mouse sobre ponto do mês, **Then** tooltip exibe: total de membros, novos entrantes, saídas do mês.
3. **Given** estrutura teve crescimento positivo no período, **When** vê o gráfico, **Then** percentual de crescimento total do período é exibido em destaque acima do gráfico.

---

### Edge Cases

- Relatório com mais de 500 membros deve ter paginação na tabela ou aviso de download recomendado.
- Membros que saíram do grupo durante o período selecionado aparecem no relatório apenas para as datas em que eram membros.
- Gestor sem permissão para ver grupo específico não deve conseguir gerar relatório daquele grupo (retorna erro de autorização).

---

## Requirements

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar rota `/admin/relatorios` com seletor de tipo de relatório.
- **FR-002**: Relatório de Frequência DEVE suportar filtros: grupo, período, tipo de membro.
- **FR-003**: Relatório de Frequência DEVE exibir tabela com membros nas linhas e datas de eventos nas colunas.
- **FR-004**: Membros com frequência abaixo de 50% no período DEVEM ser destacados visualmente.
- **FR-005**: O sistema DEVE suportar exportação do relatório filtrado para CSV.
- **FR-006**: Relatório de Crescimento DEVE exibir gráfico de linha com evolução mensal de membros.
- **FR-007**: Relatório de Eventos Realizados DEVE listar eventos com: nome, data, participantes presentes, percentual de frequência.
- **FR-008**: Relatórios DEVEM ser escopados pela permissão do usuário — gestor vê seus grupos; owner vê toda a estrutura.
- **FR-009**: Estado vazio (sem dados no período) DEVE exibir mensagem amigável com sugestão de ampliar período.

### Key Entities

- **RelatorioFrequencia**: Agregação de participacoes_evento filtradas por grupo+período.
- **RelAtorioCreswimento**: Série temporal de membros ativos por mês.
- **EventoRealizado**: Ocorrência FINALIZADA com contagem de presentes e percentual.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Gestor consegue gerar e visualizar relatório de frequência do grupo em menos de 3 segundos.
- **SC-002**: Exportação CSV de relatório com até 100 membros conclui em menos de 5 segundos.
- **SC-003**: 100% dos dados no relatório correspondem ao estado real de presenças no banco.
- **SC-004**: Relatório de crescimento exibe percentual correto para qualquer período selecionado (sem divergência matemática).
- **SC-005**: Usuário identifica membros com baixa frequência em menos de 30 segundos após abrir o relatório (graças ao destaque visual).

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
