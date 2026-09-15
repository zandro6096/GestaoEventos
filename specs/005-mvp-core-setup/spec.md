# Feature Specification: MVP - Estrutura Agnóstica com Hierarquia, Grupos, Eventos e Participantes

**Feature Branch**: `005-mvp-core-setup`  
**Created**: 2026-02-15  
**Status**: Draft  
**Input**: "Implementar MVP com cadastro de estrutura, grupos, eventos e participantes, seguindo rigorosamente os padrões da constituição"

---

## Overview

O GestaoEventos MVP é um SaaS de gestão de eventos agnóstico que permite organizações (igrejas, empresas, comunidades, escolas, ONGs) gerenciarem estruturas hierárquicas customizáveis, grupos dentro dessas estruturas, eventos com templates granulares, e participação com rastreamento de presenças.

**Objetivo Principal**: Permitir que um usuário dono/admin crie sua estrutura organizacional, defina grupos/redes, crie eventos baseados em templates com permissões granulares, e gerencie participações com métricas de presença.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dono Cria Estrutura Organizacional (Priority: P1)

**Persona**: Sandro (Pastor, CEO, Diretor de ONG) - Dono/Admin que cria a organização

**Cenário**: Sandro faz login no GestaoEventos, acessa o painel e deseja criar sua estrutura "Igreja Batista Central" com hierarquia customizável (Pastor → Obreiros → Discipuladores → Líderes → Membros).

**Por que esta prioridade**: Esta é a base fundamental. Sem estrutura, não é possível criar grupos, eventos ou gerenciar participantes. É essencial para o MVP.

**Teste Independente**: Uma estrutura pode ser criada completamente e testada observando-se: (a) nome da estrutura salvo, (b) hierarquia de papéis salva, (c) dados persistidos no banco, (d) usuário visualiza estrutura no dashboard.

**Acceptance Scenarios**:

1. **Given** um usuário logado sem estruturas criadas, **When** ele clica em "Nova Estrutura", **Then** um formulário é exibido com campos: Nome da Estrutura, Descrição, Papéis/Níveis Hierárquicos (customizáveis).

2. **Given** um formulário de criação de estrutura aberto, **When** o usuário preenche: Nome "Igreja Batista Central", Descrição "Nossa comunidade", e define 5 papéis (Pastor, Obreiro, Discipulador, Líder de Célula, Membro) com descrições de cada um, **Then** a estrutura é salva com sucesso.

3. **Given** uma estrutura criada, **When** o usuário volta ao dashboard, **Then** a estrutura aparece na lista de estruturas disponíveis e pode ser selecionada como "Contexto Ativo".

4. **Given** um usuário com múltiplas estruturas (ex: Igreja + Empresa), **When** ele clica para trocar contexto, **Then** um dropdown exibe todas as suas estruturas e a seleção altera o contexto imediatamente.

---

### User Story 2 - Dono Cria Grupos Dentro da Estrutura (Priority: P1)

**Persona**: Sandro (Pastor/Dono) - Gerenciando sua estrutura

**Cenário**: Com a estrutura "Igreja Batista Central" criada, Sandro deseja criar grupos (redes/células) hierárquicos. Cria "Rede Nação Santa" (nível 2 - Obreiro) que contém "Célula de Maria" (nível 4 - Líder de Célula).

**Por que esta prioridade**: Grupos são o container para eventos. Sem grupos, eventos não têm contexto organizacional. Essencial para o MVP.

**Teste Independente**: Um grupo pode ser criado, designado a um nível da hierarquia, vinculado a um responsável, e testado observando-se: (a) grupo salvo no banco, (b) hierarquia respeitada (pai → filho), (c) grupo visível no contexto da estrutura.

**Acceptance Scenarios**:

1. **Given** uma estrutura ativa, **When** o usuário clica em "Novo Grupo", **Then** um formulário exibe campos: Nome do Grupo, Nível Hierárquico (select dos papéis disponíveis), Grupo Pai (opcional), Responsável (usuário ou pessoa a designar).

2. **Given** o formulário de novo grupo aberto, **When** Sandro preenche: Nome "Rede Nação Santa", Nível "Obreiro", Responsável "Obr. Dexter", **Then** o grupo é criado e atribuído ao nível correto.

3. **Given** um grupo "Rede Nação Santa" criado, **When** Sandro clica em "Novo Grupo" novamente e marca "Grupo Pai: Rede Nação Santa", **Then** pode criar um sub-grupo (célula) sob a rede.

4. **Given** uma estrutura com múltiplos grupos (hierarquia), **When** o usuário visualiza a estrutura, **Then** a hierarquia é exibida em árvore (tree view) mostrando relacionamentos pai-filho.

5. **Given** um grupo criado, **When** o usuário tenta designar um responsável que não existe no sistema, **Then** o sistema oferece opção de convidar/adicionar essa pessoa como novo membro da estrutura.

---

### User Story 3 - Dono Cria Template de Evento com Permissões Granulares (Priority: P1)

**Persona**: Sandro (Pastor/Dono) - Definindo regras para eventos

**Cenário**: Sandro deseja criar um template "Célula Semanal" onde recorrência é obrigatória (SEMANAL - travada), mas líderes podem customizar nome, horário e local. Trava campos críticos para métricas consistentes.

**Por que esta prioridade**: Templates com permissões granulares são o diferencial competitivo. Permitem controle centralizador do dono com flexibilidade de líderes. Essencial para o MVP.

**Teste Independente**: Um template pode ser criado com campos travados e liberados, testado observando-se: (a) campos travados não podem ser editados por usuários menores, (b) campos liberados podem ser customizados, (c) recorrência é mantida consistente.

**Acceptance Scenarios**:

1. **Given** um usuário dono em sua estrutura, **When** clica em "Novo Template de Evento", **Then** um formulário exibe: Nome do Template, Descrição, Campos Disponíveis (nome, recorrência, horário, local, participantes, etc) com toggles para "Travado" ou "Liberado".

2. **Given** o formulário de template aberto, **When** Sandro configura: Nome "Célula Semanal", Recorrência "SEMANAL (TRAVADA)", Nome Personalizado "LIBERADO", Horário "LIBERADO", Local "LIBERADO", **Then** o template é salvo com essas restrições.

3. **Given** um template criado com campos travados, **When** um líder tenta criar um evento baseado nesse template, **Then** os campos travados aparecem readonly/disabled e campos liberados são editáveis.

4. **Given** um template com recorrência semanal travada, **When** um líder cria múltiplos eventos baseados nesse template, **Then** todos os eventos mantêm recorrência semanal automaticamente (métricas consistentes).

5. **Given** um dono alterando um template existente, **When** ele muda as permissões de um campo, **Then** uma notificação é exibida alertando que eventos futuros baseados nesse template serão afetados.

---

### User Story 4 - Líder Cria Evento Baseado em Template com Participantes (Priority: P1)

**Persona**: Maria (Líder de Célula) - Gerenciando suas células

**Cenário**: Maria recebe designação para a "Célula Simplesmente Sobrenatural" baseada no template "Célula Semanal". Personaliza nome, horário (20h), local (Rua das Flores, 123) e adiciona participantes (membros do grupo + convidados).

**Por que esta prioridade**: Criar eventos com participantes é o core do sistema. É aqui que as métricas começam a ser coletadas. Essencial para testar o fluxo completo do MVP.

**Teste Independente**: Um evento pode ser criado, personalizado respeitando permissões do template, participantes adicionados, e testado observando-se: (a) evento salvo, (b) template respeitado, (c) participantes vinculados, (d) evento visível no calendário.

**Acceptance Scenarios**:

1. **Given** um usuário com permissão de criar eventos em um grupo, **When** clica em "Novo Evento", **Then** um dropdown exibe templates disponíveis para esse grupo/nível.

2. **Given** Maria selecionando o template "Célula Semanal", **When** o formulário é preenchido: Nome Personalizado "Simplesmente Sobrenatural", Horário "20h", Local "Rua das Flores, 123", Recorrência "SEMANAL (readonly)", **Then** o evento é criado com essas informações.

3. **Given** um evento criado, **When** Maria clica em "Adicionar Participantes", **Then** opções aparecem: (a) Selecionar membros do grupo (checkbox), (b) Adicionar convidado externo (input email/nome).

4. **Given** Maria adicionando convidado externo, **When** ela insere email de Paulo (não cadastrado), **Then** o sistema registra Paulo como convidado pendente e oferece enviar convite por email.

5. **Given** um evento criado com participantes, **When** a data do evento chega, **Then** Maria pode: (a) Iniciar Evento (status muda para INICIADO), (b) Registrar presenças (checkbox), (c) Finalizar Evento (métricas calculadas).

---

### User Story 5 - Discipulador Visualiza Métricas de Presença (Zoom Hierárquico) (Priority: P2)

**Persona**: Carlos (Discipulador) - Supervisando seus 5 líderes

**Cenário**: Carlos acessa o dashboard e vê métricas agregadas de presença das células sob sua supervisão (Maria 85%, Pedro 75%, João 60%, Ana 90%, Lucas 50%). Clica em "Lucas" para ver detalhes de por que presença está baixa.

**Por que esta prioridade**: Métricas com drill-down são o diferencial. Permitem ação gerencial baseada em dados. Importante para o MVP mas não bloqueia outras funcionalidades.

**Teste Independente**: Métricas podem ser calculadas e exibidas em um dashboard, testando-se: (a) presençasregistradas são sumariadas, (b) taxa de presença é calculada corretamente, (c) drill-down mostra detalhes, (d) múltiplos níveis podem ser acessados.

**Acceptance Scenarios**:

1. **Given** um usuário acessa o Dashboard, **When** seleciona um grupo sous sua responsabilidade, **Then** métricas agregadas aparecem: Taxa de Presença (%), Quantidade de Participantes, Últimas 4 semanas de dados.

2. **Given** Carlos vendo "Líder Lucas: 50% presença", **When** clica em "Lucas", **Then** detalhes aparecem: Últimas 4 semanas de eventos, presenças por semana, tendência.

3. **Given** métricas de presença, **When** a taxa é < 60%, **Then** um alerta visual (⚠️) é exibido junto à métrica.

4. **Given** o dashboard aberto, **When** um usuário de nível superior navega para drill-down, **Then** pode ver hierarquia completa de responsáveis e suas métricas em cascata (Obreiro → Discipulador → Líder).

---

### User Story 6 - Pastor (Topo) Vê Visão Completa com Zoom Hierárquico (Priority: P2)

**Persona**: Sandro (Pastor) - Visão executiva

**Cenário**: Pastor vê visão geral de toda a estrutura (45 células ativas, 520 participantes, 78% presença). Pode fazer zoom em qualquer nível (Obreiro → Discipulador → Líder → Célula) para investigar problemas.

**Por que esta prioridade**: Visa executiva é importante mas não bloqueia funcionalidades core. Descrito em P2 para iteração seguinte se necessário.

**Teste Independente**: Dashboard de topo pode ser acessado e navegação em zoom testada observando-se: (a) métricas agregadas corretas, (b) drill-down funciona em múltiplos níveis, (c) dados são consistentes.

**Acceptance Scenarios**:

1. **Given** um usuário no topo da hierarquia acessa o Dashboard, **When** visualiza o home, **Then** cards aparecem: Total de Células Ativas, Total de Participantes, Taxa de Presença Geral, Crescimento Mensal.

2. **Given** Pastor vendo "Obreiro Dexter: 72% presença", **When** clica em "Dexter", **Then** zoom mostra os 10 discipuladores sob Dexter com suas métricas.

3. **Given** zoom em um discipulador, **When** clica em um discipulador específico, **Then** zoom mostra os 5 líderes com suas métricas.

4. **Given** zoom em um líder, **When** clica em um líder, **Then** zoom mostra histórico de eventos daquele líder (últimas 4 semanas).

---

### Edge Cases

- **EC-01**: O que acontece quando um usuário tenta criar uma estrutura com nome duplicado? Sistema deve rejeitar com mensagem clara.
- **EC-02**: O que acontece quando um usuário é designado responsável mas não existe no sistema? Sistema permite convidá-lo ou bloqueia até cadastro?
- **EC-03**: O que acontece quando um template tem campos travados mas um evento é criado antes da definição de template? Sistema mantém compatibilidade ou força recriação?
- **EC-04**: O que acontece quando um evento recurente é EditDo (ex: mudar horário)? Afeta apenas futuras ocorrências ou todas?
- **EC-05**: O que acontece quando um convidado externo é adicionado mas não tem email válido? Sistema deve validar antes de salvamento.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Gerenciamento de Estrutura (FR-001 a FR-010)

- **FR-001**: Sistema DEVE permitir ao usuário dono criar uma estrutura organizacional com nome, descrição e até 10 níveis hierárquicos customizáveis.

- **FR-002**: Sistema DEVEC permite designar títulos/papéis em cada nível (ex: Pastor, Obreiro, Discipulador, Líder, Membro).

- **FR-003**: Sistema DEVE armazenar e persistir definição da estrutura em banco de dados (tabela `estruturas`).

- **FR-004**: Sistema DEVE permitir usuário ter múltiplas estruturas simultaneamente (multi-estrutura).

- **FR-005**: Sistema DEVE manter contexto ativo (qual estrutura o usuário está visualizando) e isolamento total entre estruturas.

- **FR-006**: Sistema DEVE rastrear histórico de mudanças na hierarquia (quem alterou, quando, o quê).

#### Gerenciamento de Grupos (FR-011 a FR-025)

- **FR-011**: Sistema DEVE permitir criar grupos (redes, células, departamentos, etc) dentro de uma estrutura.

- **FR-012**: Sistema DEVE designar cada grupo a um nível hierárquico específico da estrutura.

- **FR-013**: Sistema DEVE suportar hierarquia de grupos (grupo pai → sub-grupos), até profundidade ilimitada.

- **FR-014**: Sistema DEVE permitir visualizar grupos em formato de árvore (tree view) mostrando relacionamento pai-filho.

- **FR-015**: Sistema DEVE permitir designar um responsável (usuário ou convite) para cada grupo.

- **FR-016**: Sistema DEVE permitir editar grupo (nome, descrição, responsável) após criação.

- **FR-017**: Sistema DEVE permitir desativar um grupo (soft delete) mantendo histórico.

- **FR-018**: Sistema DEVE rastrear histórico de mudanças em grupos (quem alterou, quando, o quê).

- **FR-019**: Sistema DEVE permitir associar múltiplos responsáveis a um grupo (responsável principal + auxiliares).

- **FR-020**: Sistema DEVE validar que responsável pertence a nível hierárquico esperado (ex: Discipulador não pode ser responsável de Obreiro).

- **FR-021**: Sistema DEVE suportar busca/filtro de grupos por nome, responsável, nível.

- **FR-022**: Sistema DEVE permitir mover um grupo para outro grupo pai (reorganização).

- **FR-023**: Sistema DEVE rastrear quantidade de participantes em cada grupo.

- **FR-024**: Sistema DEVE permitir convidar usuários para integrar um grupo com papéis específicos.

- **FR-025**: Sistema DEVE calcular e exibir métricas de presença agregadas por grupo.

#### Gerenciamento de Templates de Eventos (FR-026 a FR-040)

- **FR-026**: Sistema DEVE permitir dono criar templates de eventos com campos granulares.

- **FR-027**: Sistema DEVE permitir dono marcar cada campo como "Travado" (read-only, definido pelo dono) ou "Liberado" (customizável por usuário menor).
  - **Clarificação**: Campos travados aparecem como **labels read-only** (sem input) no formulário de evento
  - **Clarificação**: At least 1 field DEVE estar liberado em todo template (permite customização mínima)

- **FR-028**: Campos travados em um template NÃO DEVEM ser editáveis por usuários menores (apenas visualizáveis como labels).

- **FR-029**: Sistema DEVE suportar os seguintes campos em template: Nome, Descrição, Recorrência (RRule), Horário, Local, Duração, Participantes (permitir adicionar?), Responsáveis (permitir adicionar?).

- **FR-030**: Sistema DEVE persistir definição de template em banco (tabela `templates_evento`).

- **FR-031**: Sistema DEVE permitir dono modificar template após criação (mudanças afetam apenas eventos futuros, com notificação).

- **FR-032**: Sistema DEVE permitir dono duplicar um template existente como base para novo.

- **FR-033**: Sistema DEVE permitir designar template a grupos/níveis específicos (ex: template "Célula" só para Líderes).

- **FR-034**: Sistema DEVE validar que campos obrigatórios estão preenchidos antes de salvar template.

- **FR-035**: Sistema DEVE recalcular recorrência (RRule) quando template é modificado e eventos futuro são regenerados.

- **FR-036**: Sistema DEVE rastrear histórico de mudanças em templates (quem alterou, quando, o quê).

- **FR-037**: Sistema DEVE suportar até 20 campos customizáveis por template.

- **FR-038**: Sistema DEVE permitir dono criar templates com permissões diferentes para diferentes grupos.

- **FR-039**: Sistema DEVE exibir claramente ao criar evento qual campo foi travado pelo template (indicador visual).

- **FR-040**: Sistema DEVE calcular e exibir estatísticas de utilização de cada template (quantos eventos, taxa de presença média).

#### Gerenciamento de Eventos (FR-041 a FR-070)

- **FR-041**: Sistema DEVE permitir usuário com permissão criar novo evento baseado em template.

- **FR-042**: Sistema DEVE exibir apenas templates pertinentes ao grupo/nível do usuário.

- **FR-043**: Sistema DEVE aplicar restrições de template (campos travados, recorrência obrigatória) automaticamente.

- **FR-044**: Sistema DEVE permitir personalizar evento respeitando permissões do template (campos liberados).

- **FR-045**: Sistema DEVE suportar eventos únicos (sem recorrência) e recorrentes (com RRule complexo).

- **FR-046**: Sistema DEVE calcular ocorrências futuras de eventos recorrentes usando RRule (iCalendar RFC 5545).

- **FR-047**: Sistema DEVE permitir user editar evento (apenas dentro de permissões do template).

- **FR-048**: Sistema DEVE permitir user cancelar/desativar evento.

- **FR-049**: Sistema DEVE permitir user designar responsável principal e responsáveis auxiliares para evento.

- **FR-050**: Sistema DEVE persistir evento e suas ocorrências em banco (tabelas `eventos`, `evento_ocorrencias`).

- **FR-051**: Sistema DEVE retornar eventos por data/calendário (view mensal, semanal, diária).

- **FR-052**: Sistema DEVE permitir adicionar participantes (seleção de integrantes de grupo + convidados externos).

- **FR-053**: Sistema DEVE permitir convidar pessoas externas por email.

- **FR-054**: Sistema DEVE validar emails antes de enviar convites.

- **FR-055**: Sistema DEVE enviar notificação ao convidado externo com link de aceitação.

- **FR-056**: Sistema DEVE rastrear status de participação (não respondeu, aceitou, recusou).

- **FR-057**: Sistema DEVE permitir responsável iniciar evento (status INICIADO) no momento da ocorrência.

- **FR-058**: Sistema DEVE permitir responsável registrar presenças com status: PRESENTE, AUSENTE, JUSTIFICADO, NÃO_RESPONDEU.
  - **Clarificação (UI Model)**: Dropdown select com 4 opções
  - **Clarificação**: Se selecionado JUSTIFICADO ou AUSENTE, campo de textarea para observação PODE aparecer (condicional)

- **FR-059**: Sistema DEVE permitir responsável adicionar participantes durante evento (se permitido por template).

- **FR-060**: Sistema DEVE permitir participante fazer auto check-in (confirme presença).

- **FR-061**: Sistema DEVE permitir responsável finalizar evento (status FINALIZADO, métricas calculadas).

- **FR-062**: Após finalizar evento, Sistema DEVEM calcular métricas de presença (taxa %, comparativo com histórico).

- **FR-063**: Sistema DEVE rastrear histórico completo de mudanças em eventos.

- **FR-064**: Sistema DEVE suportar múltiplos papéis para participantes em um evento (ex: Líder, Auxiliar, Anfitrião).

- **FR-065**: Sistema DEVE permitir vincular participante a cursos/estágios (ex: "Fazendo treinamento X").

- **FR-066**: Sistema DEVE permitir responsável gerar relatório de presença para evento.

- **FR-067**: Sistema DEVE permitir usuário visualizar seu próprio calendário de eventos.

- **FR-068**: Sistema DEVE validar que responsável tem permissão de criar/editar evento naquele grupo.

- **FR-069**: Sistema DEVE permitir dono/admin cancelar qualquer evento em sua estrutura.

- **FR-070**: Sistema DEVE sincronizar eventos recorrentes quando template é modificado (regeneração de ocorrências futuras).
  - **Clarificação**: Apenas eventos com data_inicio >= hoje (hoje em diante) são afetados
  - **Clarificação**: Eventos em status INICIADO ou FINALIZADO não são alterados
  - **Clarificação**: Usuários recebem notificação de mudanças antes da sync

#### Gerenciamento de Participantes (FR-071 a FR-090)

- **FR-071**: Sistema DEVE permitir adicionar participantes a um evento de forma individual (checkbox) ou em grupo.

- **FR-072**: Sistema DEVE validar que participante faz parte do grupo/estrutura antes de adicionar.

- **FR-073**: Sistema DEVE permitir convidar pessoa externa (não membro) como convidado pontual.

- **FR-074**: Sistema DEVE enviar notificação (in-app + email se configurado) ao participante incluído em evento.

- **FR-075**: Sistema DEVE rastrear todos os participantes de um evento (lista completa).

- **FR-076**: Sistema DEVE permitir removar participante de evento (antes do evento ou durante).

- **FR-077**: Sistema DEVE registrar presença com status: AUSENTE, PRESENTE, JUSTIFICADO, NÃO_RESPONDEU.

- **FR-078**: Sistema DEVE permitir participante visualizar detalhes do evento (data, horário, local, responsável).

- **FR-079**: Sistema DEVE permitir participante confirmar/recusar presença antecipadamente (se configurado).

- **FR-080**: Sistema DEVE rastrear todas as presenças (histórico completo por participante).

- **FR-081**: Sistema DEVE calcular taxa de presença individual.
  - **Clarificação**: Taxa = (Quantidade PRESENTE) / (Total de Convidados) × 100
  - **Clarificação**: JUSTIFICADO e NÃO_RESPONDEU NÃO contam como presença

- **FR-082**: Sistema DEVE calcular taxa de presença por grupo (média de presenças dos participantes).

- **FR-083**: Sistema DEVE exibir alertas quando taxa de presença < 60% (para gerenciadores).

- **FR-084**: Sistema DEVE suportar múltiplos papéis por participante em um evento (ex: Membro + Intercessor).

- **FR-085**: Sistema DEVE rastrear papel de participante em grupos (ex: Membro, Auxiliar).

- **FR-086**: Sistema DEVE permitir responsável editar papel de participante durante evento.

- **FR-087**: Sistema DEVE permitir adicionar justificativa para ausência.

- **FR-088**: Sistema DEVE calcular ausências justificadas vs não justificadas.

- **FR-089**: Sistema DEVE exportar lista de participantes (com presenças) em formato CSV/PDF.

- **FR-090**: Sistema DEVE rastrear histórico completo de mudanças em participações (quem adicionou, quando, mudanças de status).

#### Autenticação e Acesso (FR-091 a FR-100)

- **FR-091**: Sistema DEVE suportar login por email/senha (cadastro padrão).

- **FR-092**: Sistema DEVE suportar login social (Google, Facebook).

- **FR-093**: Sistema DEVE validar permissões baseado em papel (nível hierárquico).

- **FR-094**: Sistema DEVE bloquear acesso a estruturas que usuário não faz parte.

- **FR-095**: Sistema DEVE bloquear edição de campos travados mesmo para usuários autenticados com permissão de editar.

- **FR-096**: Sistema DEVE manter sessão ativa durante uso normal (timeout configurável, ~30 min).

- **FR-097**: Sistema DEVE rastrear todas as ações por usuário (auditoria).

- **FR-098**: Sistema DEVE permitir dono convidar novos usuários para sua estrutura.

- **FR-099**: Sistema DEVE suportar reset de senha via email.

- **FR-100**: Sistema DEVE implementar RBAC (Role-Based Access Control) com papéis baseados em nível hierárquico.

#### Dados e Persistência (FR-101 a FR-110)

- **FR-101**: Sistema DEVE persistir todos os dados em banco relacional (estrutura, grupos, templates, eventos, participações).

- **FR-102**: Sistema DEVE manter histórico de auditori a (quem alterou o quê, quando) para compliance.

- **FR-103**: Sistema DEVE suportar soft delete (dados não são removidos, apenas marcados como inativos).
  - **Clarificação**: Todas as entidades devem ter DUAS colunas: `ativa` (boolean, DEFAULT true) e `deletado_em` (datetime, DEFAULT null)

- **FR-104**: Sistema DEVE calcular métricas de presença em tempo real quando evento é finalizado.
  - **Clarificação**: Cálculo usa janela temporal configurável: default 30 dias rolantes (data_evento >= hoje - 30 dias)
  - **Clarificação**: Dashboard expõe date range picker com presets: 7d, 30d, 3m, 6m, 1y, custom
  - **Clarificação**: Métricas recalculadas automaticamente quando período é alterado

- **FR-105**: Sistema DEVE exportar estrutura e dados para backup (JSON, CSV).

- **FR-106**: Sistema DEVE suportar importação de estrutura/grupos de arquivo (JSON, CSV).

- **FR-107**: Sistema DEVE validar integridade referencial (ex: grupo pai não pode ser deletado se tem filhos ativos).

- **FR-108**: Sistema DEVE manter consistência de dados mesmo em caso de erro durante operação (transações).

- **FR-109**: Sistema DEVE suportar busca e filtros complexos (por nome, data, responsável, nível, etc).

- **FR-110**: Sistema DEVE armazenar timezone e data/hora em UTC (independente de local de usuário).

### Key Entities

- **Estrutura**: Organização (Igreja, Empresa, ONG, Escola). Atributos: ID, nome, descrição, dono (usuário), papéis hierárquicos (1-10 níveis customizáveis), data_criacao, ativa.

- **Grupo**: Unidade organizacional dentro da estrutura (Rede, Departamento, Célula, etc). Atributos: ID, estrutura_id, nome, descricao, nível_hierárquico, grupo_pai_id (para hierarquia), responsável_id, data_criacao, ativa, histórico de mudanças.

- **Template de Evento**: Padrão para criação de eventos com permissões granulares. Atributos: ID, estrutura_id, nome, descricao, campos (JSON com definição de como cada campo é travado/liberado), grupos_permitidos (array de grupos/níveis), data_criacao, histórico de mudanças.

- **Evento**: Atividade/reunião agendada (única ou recorrente). Atributos: ID, template_id, grupo_id, nome_genérico (do template), nome_personalizado, descricao, data_inicio, hora_inicio, duracao, local, recorrencia (RRule), status (RASCUNHO, CONFIGURADO, INICIADO, FINALIZADO, CANCELADO), responsável_id, responsáveis_auxiliares (array), data_criacao.

- **Ocorrência de Evento**: Instância específica de um evento recorrente. Atributos: ID, evento_id, data, hora (calculada), status, data_inicio_real (quando iniciado), data_fim_real (quando finalizado).

- **Participação**: Registro deum participante em um evento. Atributos: ID, evento_id (ou ocorrência_id), usuario_id (ou convidado_externo_id), papel_evento (array, ex: ["Membro", "Intercessor"]), papel_grupo (ex: Líder, Auxiliar), status_presenca (AUSENTE, PRESENTE, JUSTIFICADO, NÃO_RESPONDEU), justificativa, data_resposta, data_criacao, histórico de mudanças.

- **Usuário**: Pessoa com acesso ao sistema. Atributos: ID, email, nome, senha_hash, data_criacao, ativo, histórico de acesso, papéis na estrutura (relação M2M).

- **Convite Externo**: Convite a pessoa não cadastrada. Atributos: ID, email,  tipo_convite (grupo, evento), token_aceitacao, data_expiração, data_respondido, status (PENDENTE, ACEITO, RECUSADO).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário dono pode criar uma estrutura completa (nome, 5 níveis hierárquicos com papéis customizados) em menos de 5 minutos.

- **SC-002**: Um dono pode criar um grupo e designar responsável em menos de 2 minutos.

- **SC-003**: Um líder pode criar um evento baseado em template (com template aplicado corretamente) em menos de 3 minutos.

- **SC-004**: Um responsável pode registrar presenças para um evento de 20 participantes em menos de 2 minutos.

- **SC-005**: Métricas de presença são calculadas e exibidas no dashboard em tempo real (< 1s após finalizar evento).

- **SC-006**: Um usuário em qualquer nível pode fazer drill-down (zoom) em até 3 cliques para ver detalhes de qualquer evento/participação abaixo de seu nível.

- **SC-007**: Sistema suporta até 10,000 participantes simultâneos em uma estrutura sem degradação de performance (< 2s para carregar dashboard).

- **SC-008**: Campos travados em template não aparecem como editáveis para usuários menores (99% de validação).

- **SC-009**: Convites por email têm taxa de entrega > 99% (monitorado via email provider).

- **SC-010**: Histórico de auditoria registra 100% das ações de criação/leitura/atualização/exclusão de dados.

- **SC-011**: 95% de usuários conseguem completar fluxo completo (criar estrutura → grupo → evento → registrar presença) sem erros na primeira tentativa.

- **SC-012**: Sistema mantém disponibilidade > 99.5% (máx. 3.6 horas downtime/mês).

---

## Clarifications

### Session 2026-02-15

- Q: Accessibility Compliance Level → A: **WCAG 2.1 AA Completo** (auditoria axe DevTools, testes screen reader, navegação teclado, ARIA labels, color contrast)
- Q: Template Modification Sync Strategy → A: **Apenas Eventos Futuros** (data_inicio >= hoje; eventos em progresso/passados não são alterados)
- Q: Metrics Endpoint Response Structure → A: **Response Nested** (hierarquia aninhada com métricas por nível, permite UI renderizar drill-down em uma requisição)
- Q: Metrics Time Window & Calculation → A: **Range Customizável (Default 30 Dias)** - Dashboard com date picker: default últimos 30 dias, mas usuário pode escolher período customizado (1d, 7d, 30d, 3m, 6m, 1y, custom range)- Q: Terminologia (Travado vs Locked) → A: **Misto Pragmático** - Código backend em inglês (locked/unlocked), UI/docs em português (travado/liberado)

---

## Terminology & Code Standards

### Terminology Mapping (Glossário Bilíngue)

| Conceito | Backend (Code) | Frontend (UI/Docs) | Exemplo |
|----------|----------------|--------------------|----------|
| Campo não editável | `isLocked` (bool) | Travado | "Campo Recorrência está travado" |
| Campo editável | `isUnlocked` (bool) | Liberado | "Você pode liberar o Nome" |
| Ação: bloquear campo | `LockField()` method | Travar Campo | Botão: "Travar" |
| Ação: desbloquear | `UnlockField()` method | Liberar Campo | Botão: "Liberar" |
| Property em DB | `campo_travado` (boolean) | (interno, tradução automática) | schema: `campo_travado BOOLEAN DEFAULT false` |
| Enum estado | `FieldRestriction { Locked, Unlocked }` | (mapeado via i18n) | Code: `FieldRestriction.Locked` → UI: "Travado" |

### Implementation Guidelines

1. **Backend (C# / .NET)**:
   - Use inglês em class names: `CampoTemplateRestriction`, `IsLocked`, `LockField()`
   - Use inglês em database schema: `campo_travado` (snake_case, mas semanticamente "locked")
   - Enums: `public enum FieldMode { Locked, Unlocked }`

2. **Frontend (Angular / TypeScript)**:
   - Use inglês em service methods: `lockField()`, `unlockField()`, `isFieldLocked()`
   - Use português em UI labels/messages via i18n (ngx-translate)
   - Component properties: `@Input() fieldMode: 'locked' | 'unlocked'`

3. **Documentation & Comments**
   - Code comments: English
   - User-facing docs: Portuguese
   - Specification (este arquivo): Portuguese com referências a code terms em backticks
---

## Additional Constraints & Assumptions

### Assumptions

1. **Autenticação**: Código de autenticação (login/logout) já existe; esta feature foca em RBAC e permissões.

2. **Email**: Serviço de email (SMTP ou terceiro) está configurado; esta feature apenas integra.

3. **Banco de Dados**: PostgreSQL ou similar está disponível; schema será criado automaticamente (migrations).

4. **Frontend Framework**: Angular 18+ já está setup; esta feature usa componentes UI padrão (PrimeNG, etc).

5. **Moeda/Planos**: MVP não implementa sistema de planos freemium (será em feature Future); apenas plano único.

6. **Recorrência**: RFC 5545 (iCalendar RRule) será usada para recorrência; biblioteca `rrule.js` ou similar fornecerá parsing.

7. **Timezone**: Sistema opera em UTC internamente; frontend converte para timezone local do usuário.

8. **API**: Backend expõe RESTful API para todas as operações; frontend consome via HTTP.

9. **Notificações**: MVP suporta apenas email e in-app notifications; push/SMS são future.

10. **Multi-idioma**: MVP é em português; i18n será implementado em feature separada.

11. **Acessibilidade**: MVP deve estar conforme WCAG 2.1 AA, incluindo contraste de cores, ARIA labels, navegação por teclado, e testes de screen reader.

### Constraints

1. **Hibridade**: Estrutura agnóstica DEVE funcionar para qualquer tipo de organização (nada hardcoded para Igreja).

2. **Granularidade**: Templates DEVEM permitir lock/unlock de cada campo individualmente (não grupos de campos).

3. **Recorrência**: Eventos recorrentes DEVEM suportar RRule complexo (ex: "todo 2º Domingo de cada mês").

4. **Drill-down**: Dashboard DEVE permitir navegação em N níveis sem performance degradation.

5. **Isolamento**: Estruturas diferentes DEVEM ter isolamento total de dados (nenhuma contaminação).

6. **Auditoria**: Todas as ações DEVEM ser registradas para compliance (LGPD, GDPR).

7. **Acessibilidade**: MVP DEVE estar conforme WCAG 2.1 AA (nível AA, não AAA), incluindo auditoria com axe DevTools, testes de navegação por teclado (Tab, Shift-Tab, Enter, Escape), ARIA labels em todos os inputs/buttons, color contrast mínimo 4.5:1 para texto.

---

## Next Steps

1. **Validação de Especificação**: Esta spec será validada por checklist (qualidade, clareza, completudo).

2. **Clarificações**: Questões marcadas [NEEDS CLARIFICATION] serão resolvidas com stakeholder.

3. **Planejamento**: Após aprovação, spec alimentará planning (épicas, stories, tasks, sprints).

4. **Desenvolvimento**: Backend (APIs) será desenvolvido primeiro (test-driven), seguido por frontend.

5. **Testes**: Testes unitários, integração e E2E serão criados simultaneamente.

