# Tasks: Gestão Administrativa

**Input**: Documentos de design em `/specs/015-gestao-admin/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não há exigência explícita de TDD no spec; os critérios independentes abaixo guiam validação funcional por história.

## Fase 1: Setup (Infra inicial)

**Purpose**: Garantir base de rota e organização do shell de configurações administrativas.

- [X] T001 Consolidar constantes de rota de configurações em `GestaoEventos.Angular/src/app/shared/constants/router.ts`
- [X] T002 Registrar e proteger rota `/admin/configuracoes` em `GestaoEventos.Angular/src/app/app.routes.ts`
- [X] T003 Integrar item de menu “Configurações” com regra de acesso por contexto em `GestaoEventos.Angular/src/app/libs/layout/menu/menu.component.ts`
- [X] T004 Ajustar shell de configurações e subnavegação entre seções em `GestaoEventos.Angular/src/app/libs/adm/admin/configuracoes/configuracoes.component.ts`
- [X] T005 Ajustar template do shell com as 5 seções (Papéis, Tipos Grupo, Tipos Evento, Usuários, Auditoria) em `GestaoEventos.Angular/src/app/libs/adm/admin/configuracoes/configuracoes.component.html`

---

## Fase 2: Foundational (Pré-requisitos bloqueantes)

**Purpose**: Entregar contratos backend/base de dados e integrações compartilhadas que bloqueiam as histórias.

**⚠️ CRITICAL**: Nenhuma história deve ser considerada concluída sem esta fase completa.

- [X] T006 Criar migration para correção `EstruuraId` → `EstruturaId` em `GestaoEventos.API/src/GestaoEventos.Infrastructure/Data/Migrations/`
- [X] T007 [P] Atualizar agregate/modelo de auditoria para coluna corrigida em `GestaoEventos.API/src/GestaoEventos.Core/Aggregates/AuditoriaAggregate/Auditoria.cs`
- [X] T008 [P] Ajustar repositório de auditoria para coluna corrigida e filtros de período em `GestaoEventos.API/src/GestaoEventos.Infrastructure/Data/Repositories/AuditoriaRepository.cs`
- [X] T009 Implementar validação de impacto para exclusão de tipo de grupo em `GestaoEventos.API/src/GestaoEventos.UseCases/TiposGrupo/Delete/DeleteTipoGrupoHandler.cs`
- [X] T010 [P] Implementar atualização de tipo de grupo em `GestaoEventos.API/src/GestaoEventos.UseCases/TiposGrupo/Update/UpdateTipoGrupoHandler.cs`
- [X] T011 Implementar validação de impacto para exclusão de tipo de evento em `GestaoEventos.API/src/GestaoEventos.UseCases/TiposEvento/Delete/DeleteTipoEventoHandler.cs`
- [X] T012 [P] Implementar atualização de tipo de evento em `GestaoEventos.API/src/GestaoEventos.UseCases/TiposEvento/Update/UpdateTipoEventoHandler.cs`
- [X] T013 [P] Expor endpoint `PUT /api/tipos-grupo/{id}` em `GestaoEventos.API/src/GestaoEventos.Web/TipoGrupo/Update.cs`
- [X] T014 [P] Expor endpoint `DELETE /api/tipos-grupo/{id}` com payload de impacto em `GestaoEventos.API/src/GestaoEventos.Web/TipoGrupo/Delete.cs`
- [X] T015 [P] Expor endpoint `PUT /api/tipos-evento/{id}` em `GestaoEventos.API/src/GestaoEventos.Web/TipoEvento/Update.cs`
- [X] T016 [P] Expor endpoint `DELETE /api/tipos-evento/{id}` com payload de impacto em `GestaoEventos.API/src/GestaoEventos.Web/TipoEvento/Delete.cs`
- [X] T017 Implementar query de listagem por estrutura/filtros de usuários em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/List/ListUsuariosHandler.cs`
- [X] T018 [P] Implementar troca de papel do vínculo estrutura-usuário em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/UpdatePapel/UpdateUsuarioPapelHandler.cs`
- [X] T019 [P] Implementar remoção soft delete com regra `ORPHAN_OWNER` em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/Remover/RemoverUsuarioHandler.cs`
- [X] T020 [P] Expor endpoint `GET /api/usuarios-estrutura` em `GestaoEventos.API/src/GestaoEventos.Web/UsuarioEstrutura/List.cs`
- [X] T021 [P] Expor endpoint `PUT /api/usuarios-estrutura/{usuario_id}/papel` em `GestaoEventos.API/src/GestaoEventos.Web/UsuarioEstrutura/UpdatePapel.cs`
- [X] T022 [P] Expor endpoint `DELETE /api/usuarios-estrutura/{usuario_id}` em `GestaoEventos.API/src/GestaoEventos.Web/UsuarioEstrutura/Remover.cs`
- [X] T023 Implementar bloqueio backend para editar/excluir papéis de sistema em `GestaoEventos.API/src/GestaoEventos.Web/Papel/Update.cs` e `GestaoEventos.API/src/GestaoEventos.Web/Papel/Delete.cs`

**Checkpoint**: APIs e regras de negócio prontas para evolução independente de cada história.

---

## Fase 3: User Story 1 — Gerenciar Papéis e Permissões (P1) 🎯 MVP

**Goal**: Owner gerencia papéis com permissões granulares, sem risco de exclusão indevida.

**Independent Test**: Em `/admin/configuracoes`, criar papel “Coordenador”, aplicar permissões e validar bloqueio/transferência ao excluir papel em uso.

- [X] T024 [P] [US1] Ajustar contrato de API de papéis para `is_sistema` e impacto de exclusão em `GestaoEventos.Angular/src/app/shared/apis/papel/model/papel-api.model.ts`
- [X] T025 [P] [US1] Implementar suporte a `papel_substituto_id` no API service de papéis em `GestaoEventos.Angular/src/app/shared/apis/papel/papel-api.service.ts`
- [X] T026 [US1] Implementar regra de papéis protegidos e transferência no service de domínio em `GestaoEventos.Angular/src/app/shared/services/papel/papel.service.ts`
- [X] T027 [US1] Ajustar formulário de criar/editar papel com agrupamento de permissões em `GestaoEventos.Angular/src/app/libs/adm/admin/papeis/salvar/salvar-papel.component.ts`
- [X] T028 [US1] Ajustar template do formulário de papel para UX de permissões por módulo em `GestaoEventos.Angular/src/app/libs/adm/admin/papeis/salvar/salvar-papel.component.html`
- [X] T029 [US1] Implementar fluxo de confirmação destrutiva com substituição de papel em `GestaoEventos.Angular/src/app/libs/adm/admin/papeis/papeis.component.ts`
- [X] T030 [US1] Ajustar tabela/listagem de papéis para ocultar ações em papéis de sistema em `GestaoEventos.Angular/src/app/libs/adm/admin/papeis/papeis.component.html`

**Checkpoint**: US1 funcional e testável isoladamente.

---

## Fase 4: User Story 2 — Definir Tipos de Grupo e Evento (P1)

**Goal**: Owner mantém tipos com ícone/cor e recebe impacto explícito antes de excluir registros em uso.

**Independent Test**: Criar tipo “Ministério” com ícone/cor, usar o tipo em grupo/evento e validar bloqueio com mensagem de impacto ao excluir.

- [X] T031 [P] [US2] Ajustar contrato/modelo de impacto de exclusão em tipos de grupo em `GestaoEventos.Angular/src/app/shared/apis/tipo-grupo/model/tipo-grupo.model.ts`
- [X] T032 [P] [US2] Ajustar contrato/modelo de impacto de exclusão em tipos de evento em `GestaoEventos.Angular/src/app/shared/apis/tipo-evento/model/tipo-evento.model.ts`
- [X] T033 [US2] Implementar tratamento de erro de impacto no service de tipos de grupo em `GestaoEventos.Angular/src/app/shared/apis/tipo-grupo/tipo-grupo-api.service.ts`
- [X] T034 [US2] Implementar tratamento de erro de impacto no service de tipos de evento em `GestaoEventos.Angular/src/app/shared/apis/tipo-evento/tipo-evento-api.service.ts`
- [X] T035 [US2] Ajustar lógica de exclusão com confirmação contextual em `GestaoEventos.Angular/src/app/libs/adm/admin/tipos-grupo/tipos-grupo.component.ts`
- [X] T036 [US2] Ajustar lógica de exclusão com confirmação contextual em `GestaoEventos.Angular/src/app/libs/adm/admin/tipos-evento/tipos-evento.component.ts`
- [X] T037 [US2] Melhorar UI de tipos de grupo com estados de impacto/erro/empty em `GestaoEventos.Angular/src/app/libs/adm/admin/tipos-grupo/tipos-grupo.component.html`
- [X] T038 [US2] Melhorar UI de tipos de evento com estados de impacto/erro/empty em `GestaoEventos.Angular/src/app/libs/adm/admin/tipos-evento/tipos-evento.component.html`

**Checkpoint**: US2 funcional e testável isoladamente.

---

## Fase 5: User Story 3 — Gerenciar Usuários da Estrutura (P2)

**Goal**: Owner lista, filtra, troca papel e remove vínculo mantendo histórico e protegendo o último owner.

**Independent Test**: Filtrar usuários por papel/status, trocar papel e tentar remover último owner (bloqueado por `ORPHAN_OWNER`).

- [X] T039 [P] [US3] Ajustar modelos de request/response de usuários da estrutura em `GestaoEventos.Angular/src/app/shared/apis/usuarios-estrutura/model/usuarios-estrutura.model.ts`
- [X] T040 [P] [US3] Ajustar URLs e payloads da API de usuários da estrutura em `GestaoEventos.Angular/src/app/shared/apis/usuarios-estrutura/model/url.enum.ts`
- [X] T041 [US3] Implementar filtros de papel/status/último acesso no API service em `GestaoEventos.Angular/src/app/shared/apis/usuarios-estrutura/usuarios-estrutura-api.service.ts`
- [X] T042 [US3] Implementar tratamento de erro `ORPHAN_OWNER` e invalidação de cache no business service em `GestaoEventos.Angular/src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts`
- [X] T043 [US3] Ajustar fluxo de alteração de papel e remoção no componente em `GestaoEventos.Angular/src/app/libs/adm/admin/usuarios-estrutura/usuarios-estrutura.component.ts`
- [X] T044 [US3] Ajustar template de filtros/listagem/confirm dialog em `GestaoEventos.Angular/src/app/libs/adm/admin/usuarios-estrutura/usuarios-estrutura.component.html`

**Checkpoint**: US3 funcional e testável isoladamente.

---

## Fase 6: User Story 4 — Consultar Log de Auditoria (P2)

**Goal**: Admin consulta log somente leitura, filtra por período e exporta CSV.

**Independent Test**: Filtrar por usuário/entidade/ação/período e exportar CSV refletindo exatamente os dados filtrados em tela.

- [X] T045 [P] [US4] Ajustar contrato de filtros e record de auditoria em `GestaoEventos.Angular/src/app/shared/apis/auditoria/model/auditoria.model.ts`
- [X] T046 [US4] Implementar filtros avançados no API service de auditoria em `GestaoEventos.Angular/src/app/shared/apis/auditoria/auditoria-api.service.ts`
- [X] T047 [US4] Implementar geração de CSV no componente de auditoria em `GestaoEventos.Angular/src/app/libs/adm/admin/auditoria/auditoria.component.ts`
- [X] T048 [US4] Ajustar template da auditoria com filtros e exportação em `GestaoEventos.Angular/src/app/libs/adm/admin/auditoria/auditoria.component.html`
- [X] T049 [US4] Garantir UX somente-leitura sem ações de edição/exclusão em `GestaoEventos.Angular/src/app/libs/adm/admin/auditoria/auditoria.component.html`

**Checkpoint**: US4 funcional e testável isoladamente.

---

## Fase 7: Polish & Cross-Cutting

**Purpose**: Fechamento de integração e validação do fluxo completo.

- [X] T050 Validar integração das 5 seções no shell admin em `GestaoEventos.Angular/src/app/libs/adm/admin/configuracoes/configuracoes.component.ts`
- [X] T051 [P] Atualizar contratos OpenAPI da feature conforme implementação em `specs/015-gestao-admin/contracts/`
- [X] T052 [P] Atualizar roteiro de validação funcional da feature em `specs/015-gestao-admin/quickstart.md`
- [X] T053 Executar build da API e corrigir quebras relacionadas à feature em `GestaoEventos.API/src/GestaoEventos.Web/GestaoEventos.API.Web.csproj`
- [X] T054 Executar validação do frontend e corrigir quebras relacionadas à feature em `GestaoEventos.Angular/src/app/libs/adm/admin/`

---

## Dependencies & Execution Order

### Dependências entre Fases

- Fase 1 não depende de nenhuma outra.
- Fase 2 depende da Fase 1 e bloqueia conclusão das histórias.
- Fases 3 a 6 dependem da Fase 2 (podem avançar em paralelo por história após bloqueantes concluídos).
- Fase 7 depende das histórias selecionadas para entrega.

### Dependências entre Histórias

- US1 (P1): depende de T023 + setup de rota/configurações.
- US2 (P1): depende de T009-T016.
- US3 (P2): depende de T017-T022.
- US4 (P2): depende de T006-T008 + endpoint de listagem já existente.

### Ordem recomendada de entrega

1. US1 (MVP)  
2. US2  
3. US3  
4. US4

---

## Parallel Opportunities

### US1

- T024 e T025 em paralelo.
- Depois, T027 e T028 em paralelo.

### US2

- T031 e T032 em paralelo.
- T033 e T034 em paralelo.
- T037 e T038 em paralelo após lógica pronta.

### US3

- T039 e T040 em paralelo.
- T041 e T042 em paralelo.

### US4

- T045 e T046 em paralelo.
- T048 e T049 em paralelo após T047.

---

## Implementation Strategy

### MVP First (somente US1)

1. Concluir Fase 1.
2. Concluir itens bloqueantes da Fase 2 para papéis (especialmente T023).
3. Concluir Fase 3 (US1).
4. Validar critérios independentes da US1.

### Entrega incremental

1. Setup + Foundational.
2. US1 (deploy/demonstração).
3. US2 (deploy/demonstração).
4. US3 (deploy/demonstração).
5. US4 (deploy/demonstração).
6. Polish final com build + validação de quickstart.
