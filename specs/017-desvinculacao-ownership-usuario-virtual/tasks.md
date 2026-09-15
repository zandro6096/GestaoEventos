# Tasks: Desvinculacao, Ownership e Usuario Virtual

**Input**: Documentos de design em `/specs/017-desvinculacao-ownership-usuario-virtual/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Validacao funcional por historia, build da API e validacao do frontend ao final.

## Fase 1: Setup

**Purpose**: Preparar o modulo e alinhar pontos de entrada com fluxos ja existentes.

- [ ] T001 Registrar o modulo E12 no mapa de execucao/roadmap
- [ ] T002 Mapear e consolidar os pontos de entrada do frontend para `Sair da estrutura` e `Transferir ownership` em `src/app/libs/adm/admin/usuarios-estrutura/` e no fluxo do proprio usuario
- [ ] T003 Validar reaproveitamento de `shared/apis/usuarios-estrutura` e `shared/services/usuarios-estrutura` antes de criar novos artefatos no frontend

---

## Fase 2: Foundational

**Purpose**: Entregar contratos e regras backend que bloqueiam todas as historias.

**CRITICAL**: Nenhuma historia deve ser considerada pronta sem esta fase.

- [ ] T004 Criar/ajustar contratos backend de `saida-preview` com impacto e bloqueios
- [ ] T005 [P] Consolidar regra de ownership unico reutilizando `ORPHAN_OWNER` para saida estrutural
- [ ] T006 [P] Modelar regra de sucessao de responsavel de eventos ativos na remocao/desvinculacao
- [ ] T007 Ajustar auditoria para auto-saida, remocao, transferencia de ownership e reativacao
- [ ] T008 [P] Definir estrategia de consolidacao de usuario virtual sem duplicidade funcional
- [ ] T008A [P] Definir naming final das rotas sob `UsuarioEstrutura` para evitar abrir eixo paralelo em `Estruturas`

**Checkpoint**: Base de negocio pronta para historias independentes.

---

## Fase 3: User Story 1 - Sair da estrutura sem apagar historico (P1) 🎯 MVP

**Goal**: Usuario elegivel consegue sair da estrutura mantendo conta e historico.

**Independent Test**: Sair da estrutura atual, perder acesso imediato ao contexto e manter historico preservado.

- [ ] T009 [P] [US1] Implementar `GetPreflightSaidaEstruturaQuery/Handler` em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/SairDaEstrutura/`
- [ ] T010 [P] [US1] Implementar `SairDaEstruturaCommand/Handler` em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/SairDaEstrutura/`
- [ ] T011 [US1] Criar `SairPreviewRequest + SairPreviewValidator + SairPreview.cs` em `GestaoEventos.API/src/GestaoEventos.Web/UsuarioEstrutura/`
- [ ] T012 [US1] Criar `SairRequest + SairValidator + Sair.cs` em `GestaoEventos.API/src/GestaoEventos.Web/UsuarioEstrutura/`
- [ ] T013 [P] [US1] Evoluir `UsuariosEstruturaApiService` com metodos `getSaidaPreview()` e `sairDaEstrutura()` em `GestaoEventos.Angular/src/app/shared/apis/usuarios-estrutura/usuarios-estrutura-api.service.ts`
- [ ] T014 [P] [US1] Evoluir `UsuariosEstruturaService` com logica, cache e invalidacao de contexto para auto-saida em `GestaoEventos.Angular/src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts`
- [ ] T015 [US1] Criar UX de confirmacao de `Sair da estrutura` no componente/entrypoint escolhido sem fazer HTTP direto no componente
- [ ] T016 [US1] Atualizar contexto ativo/local apos saida concluida usando service apropriado de contexto

**Checkpoint**: US1 funcional e demonstravel isoladamente.

---

## Fase 4: User Story 2 - Remover membro respeitando hierarquia (P1)

**Goal**: Superior remove subordinado com preservacao historica e sucessao de responsabilidades.

**Independent Test**: Remover subordinado elegivel, validar corte de acesso e reatribuicao de responsavel em eventos ativos.

- [ ] T017 [P] [US2] Evoluir `RemoverUsuarioDaEstruturaCommand/Handler` em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/Remover/` para incluir impacto e sucessao de responsavel
- [ ] T018 [US2] Ajustar `RemoverUsuarioRequest + RemoverUsuarioValidator + Remover.cs` em `GestaoEventos.API/src/GestaoEventos.Web/UsuarioEstrutura/` para novo contrato/resultado
- [ ] T019 [P] [US2] Ajustar `UsuariosEstruturaApiService.remover()` para o novo contrato em `GestaoEventos.Angular/src/app/shared/apis/usuarios-estrutura/usuarios-estrutura-api.service.ts`
- [ ] T020 [P] [US2] Ajustar `UsuariosEstruturaService.remover()` para regra, cache e invalidacao em `GestaoEventos.Angular/src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts`
- [ ] T021 [US2] Melhorar UX de remocao na tela `usuarios-estrutura` com mensagem de impacto em `GestaoEventos.Angular/src/app/libs/adm/admin/usuarios-estrutura/`
- [ ] T022 [US2] Garantir bloqueio backend/frontend para remocao fora do escopo hierarquico

**Checkpoint**: US2 funcional e validavel isoladamente.

---

## Fase 5: User Story 3 - Transferir ownership (P1)

**Goal**: Owner unico transfere administracao para outro membro elegivel e desbloqueia fluxos dependentes.

**Independent Test**: Transferir ownership ponta a ponta e depois repetir fluxo antes bloqueado no E11/E12.

- [ ] T023 [P] [US3] Implementar `GetOwnershipTransferOptionsQuery/Handler` em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/TransferirOwnership/`
- [ ] T024 [P] [US3] Implementar `TransferirOwnershipCommand/Handler` em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/TransferirOwnership/`
- [ ] T025 [US3] Criar `OwnershipOptionsRequest + OwnershipOptionsValidator + OwnershipOptions.cs` em `GestaoEventos.API/src/GestaoEventos.Web/UsuarioEstrutura/`
- [ ] T026 [US3] Criar `TransferirOwnershipRequest + TransferirOwnershipValidator + TransferirOwnership.cs` em `GestaoEventos.API/src/GestaoEventos.Web/UsuarioEstrutura/`
- [ ] T027 [P] [US3] Evoluir `UsuariosEstruturaApiService` com metodos `getOwnershipOptions()` e `transferirOwnership()` em `GestaoEventos.Angular/src/app/shared/apis/usuarios-estrutura/usuarios-estrutura-api.service.ts`
- [ ] T028 [P] [US3] Evoluir `UsuariosEstruturaService` com logica/cache para ownership em `GestaoEventos.Angular/src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts`
- [ ] T029 [US3] Criar dialog/fluxo de transferencia de ownership na UI em `GestaoEventos.Angular/src/app/libs/adm/admin/usuarios-estrutura/`
- [ ] T030 [US3] Integrar CTA de desbloqueio nos fluxos que recebem bloqueio de owner unico, incluindo o elo com E11

**Checkpoint**: US3 funcional e validavel isoladamente.

---

## Fase 6: User Story 4 - Reativar usuario virtual sem duplicidade (P2)

**Goal**: Historico virtual pode ser associado a conta real sem criar duas identidades operacionais.

**Independent Test**: Aceitar convite/recadastro associado a usuario virtual existente e validar consolidacao de historico.

- [ ] T031 [P] [US4] Identificar e consolidar ponto de entrada de reativacao no backend reaproveitando fluxo existente de convite/aceite
- [ ] T032 [P] [US4] Implementar/ajustar comando de associacao/reativacao com `UsuarioVirtualService`
- [ ] T033 [US4] Ajustar contrato de resposta para informar consolidacao de historico
- [ ] T034 [P] [US4] Refletir comportamento no frontend apenas via API Service + Business Service nos fluxos publicos quando aplicavel
- [ ] T035 [US4] Validar bloqueio para casos `nunca associar` e duplicidade por e-mail/token

**Checkpoint**: US4 funcional e validavel isoladamente.

---

## Fase 7: Polish & Cross-Cutting

**Purpose**: Fechamento visual, validacao e integracao com modulos adjacentes.

- [ ] T036 Consolidar loading, empty, error e success states dos fluxos novos
- [ ] T037 [P] Atualizar contratos OpenAPI em `specs/017-desvinculacao-ownership-usuario-virtual/contracts/`
- [ ] T038 [P] Validar integracao de E12 com bloqueios e CTAs do E11
- [ ] T039 [P] Executar build da API e corrigir quebras relacionadas ao modulo
- [ ] T040 [P] Executar validacao do frontend e corrigir quebras relacionadas ao modulo
- [ ] T041 Atualizar `quickstart.md` com observacoes reais apos implementacao

---

## Dependencies & Execution Order

### Dependencias entre fases

- Fase 1 nao depende de nenhuma outra.
- Fase 2 depende da Fase 1 e bloqueia todas as historias.
- Fase 3 depende da Fase 2.
- Fase 4 depende da Fase 2.
- Fase 5 depende da Fase 2.
- Fase 6 depende da base da Fase 2 e do fluxo de convite/usuario virtual existente.
- Fase 7 depende das historias selecionadas para entrega.

### Ordem recomendada

1. US1
2. US3
3. US2
4. US4

---

## Parallel Opportunities

### Foundational

- T005 e T006 em paralelo.
- T007 e T008 em paralelo.

### US1

- T009 e T013 em paralelo.

### US3

- T023 e T027 em paralelo.

### US4

- T031 e T034 em paralelo, depois da estratégia fechada.

---

## Implementation Strategy

### MVP first

1. Fechar Setup + Foundational.
2. Entregar US1.
3. Entregar US3, porque desbloqueia o owner unico.
4. Validar ganho de produto antes de seguir para remocao mais complexa.

### Entrega incremental completa

1. Setup + Foundational.
2. US1.
3. US3.
4. US2.
5. US4.
6. Polish final com build e validacao guiada.