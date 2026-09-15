# Feature Specification: Melhorias no Formulário de Eventos

**Feature Branch**: `001-evento-form-improvements`  
**Created**: 31/01/2026  
**Status**: Draft  
**Input**: "Corrigir bugs e melhorias UX no formulário de criar eventos: campos de data confusos, preview quebrado, erro 400, falta seletor de grupo, falta configurações de permissões"

---

## Clarifications

### Session 2026-01-31

- Q: Quando um evento é criado para múltiplos grupos, qual é o comportamento esperado? → A: Um evento compartilhado entre todos os grupos (1 registro, relação N:N)
- Q: Se a criação de um evento recorrente falhar parcialmente (criou 3 de 10 ocorrências e deu erro), qual deve ser o comportamento? → A: Rollback completo - não cria nada, mostra erro, usuário tenta novamente
- Q: Qual o limite máximo de grupos que podem ser selecionados por evento? → A: Sem limite - usar pesquisa e paginação no multiselect para UX inteligente (casos com muitos grupos serão raros)
- Q: Sistema deve validar conflitos de horário (eventos simultâneos no mesmo grupo)? → A: Avisar com modal "Já existe evento neste horário - continuar?", mas permitir salvar (eventos simultâneos podem ser legítimos)
- Q: Qual o limite máximo de ocorrências para eventos recorrentes? → A: 365 ocorrências (1 ano de eventos diários) para balancear flexibilidade com performance

---

## User Scenarios & Testing

### User Story 1 - Criar Evento com Sucesso (Priority: P0 - BLOQUEADOR)

Como **administrador de estrutura**, preciso criar um evento básico e ter certeza que será salvo corretamente, para que os participantes possam visualizá-lo.

**Why this priority**: Atualmente o formulário retorna erro 400 e NENHUM evento pode ser criado. Isso bloqueia totalmente a funcionalidade.

**Independent Test**: Preencher título, data, hora e clicar em "Criar". Sistema deve retornar sucesso 201 e redirecionar para listagem.

**Acceptance Scenarios**:

1. **Given** estou logado e tenho estrutura/grupo selecionados, **When** preencho título "Reunião", data "15/02/2026", hora "20:00", duração "1h" e clico em "Criar", **Then** evento é criado com sucesso e recebo mensagem "Evento criado com sucesso!"

2. **Given** formulário está preenchido corretamente, **When** clico em "Criar", **Then** request contém \`usuario_id\`, \`estrutura_id\`, \`grupo_id\` válidos e data no formato ISO 8601

3. **Given** backend retorna erro 400 com mensagens de validação, **When** tento criar evento, **Then** mensagens de erro são exibidas de forma clara no formulário

---

### User Story 2 - Entender Claramente os Campos de Data (Priority: P1 - CRÍTICO)

Como **usuário**, preciso entender facilmente se estou configurando a data DO EVENTO ou da RECORRÊNCIA, para evitar confusão e erros.

**Why this priority**: A UX atual é extremamente confusa - há "Data Início", "Data Fim" e "Data Fim Recorrência" misturados, causando frustração.

**Independent Test**: Abrir formulário e observar se há separação visual clara entre "QUANDO ACONTECE?" e "REPETIR?".

**Acceptance Scenarios**:

1. **Given** estou criando um evento único, **When** preencho data e hora, **Then** vejo apenas campos de início, duração calculada automaticamente, e sem campos de recorrência visíveis

2. **Given** estou criando evento recorrente, **When** seleciono "Repetir: Semanal", **Then** campos de recorrência aparecem em seção separada visualmente

3. **Given** preencho duração "2h 30min", **When** visualizo preview, **Then** horário de fim é calculado automaticamente (ex: início 19:00 → fim 21:30)

---s_ids\` (array) em todos os requests de criação de evento
- **FR-002**: Sistema DEVE validar que usuário tem estrutura e grupo selecionados ANTES de permitir criar evento
- **FR-003**: Sistema DEVE enviar datas no formato ISO 8601
- **FR-004**: Sistema DEVE usar snake_case nos nomes de campos ao enviar para backend
- **FR-005**: Sistema DEVE exibir mensagens de erro do backend de forma legível
- **FR-006**: Sistema DEVE criar UM único evento vinculado a múltiplos grupos (relação N:N, não duplicação de registros)
- **FR-007**: Sistema DEVE usar transação atômica para eventos recorrentes - se falhar qualquer ocorrência, rollback completo (all-or-nothing)
- **FR-008**: Seletor de grupos NÃO deve ter limite máximo, mas DEVE implementar pesquisa (filter) e virtualização/paginação para manter performance e UX quando há muitos grupos
- **FR-009**: Sistema DEVE verificar conflitos de horário antes de salvar e AVISAR com modal confirmável ("Já existe evento neste horário para este(s) grupo(s) - continuar?"), mas PERMITIR salvar se usuário confirmar
- **FR-010**: Sistema DEVE limitar eventos recorrentes a no máximo 365 ocorrências e EXIBIR erro legível se usuário tentar gerar mais

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Usuário consegue criar evento simples (sem recorrência) em menos de 30 segundos
- **SC-002**: Taxa de erro 400 ao criar evento reduz para 0% (atualmente é 100%)
- **SC-003**: Preview de ocorrências mostra exatamente a quantidade correta em 100% dos casos
