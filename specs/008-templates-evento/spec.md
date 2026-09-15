# Mini-PRD 03: Templates de Evento

**Feature Branch**: `008-templates-evento`
**Created**: 2026-03-08
**Status**: Draft
**Módulo**: Criação de Templates, Permissões por Campo, Vínculo com Grupos

---

## Contexto do Mini-PRD

### Capacidades do Backend (já existem — não re-especificar)

- `GET/POST /api/evento-templates` — Listar e criar templates
- `GET/PUT/DELETE /api/evento-templates/{id}` — CRUD completo
- `GET/POST /api/tipos-evento` — Tipos de evento da estrutura
- `GET /api/grupos` — Grupos disponíveis para vincular ao template
- `GET /api/tipos-grupo` — Tipos de grupo para definir nível de acesso
- Template suporta campos de permissão granular: pode_customizar_nome, pode_customizar_local, pode_customizar_horario, pode_adicionar_participantes, pode_adicionar_responsaveis, recorrencia_travada

### Componentes Frontend já construídos (libs/adm/)

- `libs/adm/eventos/criar-modelo-evento/criar-modelo-evento.component.ts` — Form de criação de template
- `libs/adm/eventos/listar-modelos-evento/listar-modelos-evento.component.ts` — Lista de templates
- `libs/adm/eventos/template-selector/template-selector.component.ts` — Seletor ao criar evento
- `shared/services/evento-template/evento-template.service.ts` — Serviço de templates
- `shared/models/evento-template.model.ts` — Model do template

### O que precisa ser construído (o gap)

1. **Painel de permissões por campo** — toggles visuais para cada permissão no form do template
2. **Configuração de recorrência no template** — UI de RRule para definir padrão padrão/travado
3. **Vínculo template ↔ grupos** — selecionar quais grupos/tipos de grupo podem usar o template
4. **Indicador de templates em uso** — quantidade de eventos ativos por template na listagem

---

## User Scenarios & Testing

### User Story 1 — Owner Cria Template com Permissões Granulares (Priority: P1)

O dono da estrutura cria o template "Célula Semanal" definindo o que está travado (recorrência semanal obrigatória) e o que os líderes podem personalizar (nome, horário, local).

**Why this priority**: Templates são o diferencial central do produto. Sem eles, todos os eventos ficam totalmente livres, perdendo a consistência de métricas que é o valor principal do SaaS.

**Independent Test**: Um testador cria um template com recorrência travada em "Semanal" e campos nome e local liberados. Ao criar evento com o template, recorrência está bloqueada mas nome e local estão editáveis.

**Acceptance Scenarios**:

1. **Given** o owner acessa `/admin/templates/criar`, **When** a página carrega, **Then** vê formulário com nome, tipo de evento, configuração de recorrência e painel de permissões com toggles para cada campo customizável.
2. **Given** o owner ativa "Recorrência travada" e seleciona "Semanal", **When** salva o template, **Then** qualquer evento criado com esse template terá o campo de recorrência bloqueado para edição.
3. **Given** o owner deixa "Pode customizar nome" ativado, **When** um líder usa o template, **Then** o campo de nome aparece editável para o líder.
4. **Given** o owner desativa "Pode customizar local", **When** um líder usa o template, **Then** o campo local está bloqueado ou ausente no form do evento.
5. **Given** o owner está no painel de permissões, **When** vê os toggles, **Then** cada toggle tem label claro e tooltip explicando o impacto daquela permissão.

---

### User Story 2 — Owner Define Quais Grupos Podem Usar o Template (Priority: P1)

O owner quer que o template "Célula Semanal" seja disponível apenas para grupos do tipo "Célula" (nível 4), não para redes ou discipuladores.

**Why this priority**: Sem restrição por grupo/tipo, templates de nível errado aparecem para todos, gerando eventos inconsistentes com a proposta do template.

**Independent Test**: Um testador cria template restrito ao tipo "Célula". Ao criar evento em grupo do tipo "Rede", esse template não aparece como opção.

**Acceptance Scenarios**:

1. **Given** o owner está criando ou editando um template, **When** acessa a seção de grupos permitidos, **Then** pode selecionar tipos de grupo e/ou grupos específicos.
2. **Given** o owner seleciona o tipo "Célula" como grupo permitido, **When** um líder de célula cria evento, **Then** esse template aparece na lista de templates disponíveis.
3. **Given** o template está restrito ao tipo "Célula", **When** um discipulador tenta criar evento, **Then** esse template não aparece na lista.
4. **Given** o owner não seleciona nenhuma restrição, **When** qualquer membro cria evento, **Then** o template está disponível para todos os níveis.

---

### User Story 3 — Owner Edita Template em Uso (Priority: P2)

O owner precisa alterar as permissões de um template que já está em uso por vários líderes.

**Why this priority**: Templates evoluem com a organização. Bloquear edição tornaria o sistema rígido demais.

**Independent Test**: Um testador edita um template existente, altera uma permissão, salva. Ao criar novo evento com o template, a nova permissão está em vigor. Eventos já criados não são afetados.

**Acceptance Scenarios**:

1. **Given** o owner acessa a lista de templates, **When** clica em editar um template em uso, **Then** vê aviso de que alterações afetarão apenas novos eventos.
2. **Given** o owner altera permissões e salva, **When** um líder cria novo evento com o template, **Then** as novas permissões são aplicadas.
3. **Given** evento já criado com o template antes da edição, **When** o template é editado, **Then** as permissões do evento existente não são alteradas retroativamente.

---

### User Story 4 — Owner Visualiza Templates e Seu Uso (Priority: P2)

O owner quer ver todos os templates da estrutura e quantos eventos ativos usam cada um.

**Why this priority**: Visibilidade de uso ajuda a decidir quais templates manter, arquivar ou duplicar.

**Independent Test**: Um testador com 3 templates e eventos vinculados a 2 deles vê na lista quantos eventos cada template tem ativamente.

**Acceptance Scenarios**:

1. **Given** o owner acessa `/admin/templates`, **When** a lista carrega, **Then** cada template exibe: nome, tipo de evento, grupos permitidos, e quantidade de eventos ativos.
2. **Given** o owner quer criar template similar a um existente, **When** clica em "Duplicar", **Then** abre form preenchido com os dados do template original.
3. **Given** um template não tem eventos em uso, **When** o owner clica em arquivar, **Then** o template é inativado e não aparece mais no seletor ao criar eventos.

---

### Edge Cases

- Template com recorrência travada não pode ser usado para criar evento único (sem recorrência) — deve exibir aviso ao tentar.
- Deletar template com eventos ativos deve exibir aviso impeditivo ou exigir confirmação explícita.
- Template sem grupos restritos = disponível para toda a estrutura.
- Tipo de evento excluído não deve deixar templates em estado inválido — sistema deve alertar o owner.

---

## Requirements

### Functional Requirements

- **FR-001**: O form de template DEVE exibir painel de permissões com toggle individual para cada campo customizável.
- **FR-002**: O sistema DEVE permitir travar a recorrência com padrão pré-definido no template.
- **FR-003**: O sistema DEVE permitir vincular o template a tipos de grupo e/ou grupos específicos.
- **FR-004**: Template sem restrição de grupo DEVE estar disponível para toda a estrutura.
- **FR-005**: A lista de templates DEVE exibir contagem de eventos ativos por template.
- **FR-006**: O sistema DEVE permitir duplicar um template existente.
- **FR-007**: O sistema DEVE exibir aviso ao editar template em uso, informando que apenas novos eventos são afetados.
- **FR-008**: O sistema DEVE impedir deleção imediata de template com eventos ativos.

### Key Entities

- **EventoTemplate**: Modelo de evento com campos de permissão. Atributos: nome, tipo_evento_id, recorrencia (padrão/travada), permissões por campo, status.
- **EventoTemplateGrupo**: Vínculo entre template e grupo/tipo-grupo permitido.
- **TipoEvento**: Classificação do evento (ex: "Célula", "Conferência"). Pertence à estrutura.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Owner consegue criar template com permissões granulares em menos de 5 minutos.
- **SC-002**: 100% das permissões configuradas no template são refletidas corretamente no form do evento.
- **SC-003**: Lista de templates com contagem de uso carrega em menos de 2 segundos para até 50 templates.
- **SC-004**: Zero casos onde template restrito a tipo X aparece disponível para tipo Y.

---

## Assumptions

- Campos de permissão são: pode_customizar_nome, pode_customizar_local, pode_customizar_horario, pode_adicionar_participantes, pode_adicionar_responsaveis, recorrencia_travada.
- Tipo de evento deve ser criado antes do template. Templates sem tipo de evento não são permitidos.
- Recorrência usa o padrão RRule (RFC 5545) já implementado no backend.
