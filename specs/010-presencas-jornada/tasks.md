# Tasks: Presenças & Jornada Pessoal

**Input**: Design documents from `/specs/010-presencas-jornada/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Não incluídos (não solicitados na spec).

**Feature Branch**: `010-presencas-jornada`

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story correspondente da spec.md (US1–US4)

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Propósito**: Adicionar interfaces TypeScript e rotas que toda a feature depende.

- [ ] T001 Criar interfaces `BulkPresencaItem`, `BulkPresencaRequest`, `BulkPresencaResponse`, `BulkPresencaErro` em `GestaoEventos.Angular/src/app/shared/models/bulk-presenca.model.ts`
- [ ] T002 [P] Criar tipo `PeriodoFrequencia` e interface `FrequenciaQuery` em `GestaoEventos.Angular/src/app/shared/models/frequencia.model.ts` (adicionar ao arquivo existente)
- [ ] T003 [P] Criar interface `ParticipanteComPresenca` em `GestaoEventos.Angular/src/app/shared/models/participante-com-presenca.model.ts`

**Checkpoint**: Interfaces compilam sem erros — base para todas as user stories.

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Propósito**: Peças de infraestrutura compartilhada que DEVEM estar prontas antes das user stories.

**⚠️ CRÍTICO**: Nenhuma user story pode começar até esta fase estar completa.

- [ ] T004 Adicionar método `getFrequencia(usuarioId, estruturaId, periodoDias = 30)` com query param `periodo_dias` em `GestaoEventos.Angular/src/app/shared/apis/jornada/jornada-api.service.ts`
- [ ] T005 [P] Adicionar método `salvarLote(request: BulkPresencaRequest)` em `GestaoEventos.Angular/src/app/shared/apis/participacao/participacao-api.service.ts`
- [ ] T006 [P] Criar record `BulkCreateResultRecord` e atualizar `MappingProfileConfig.cs` em `GestaoEventos.API/src/GestaoEventos.Web/Configurations/MappingProfileConfig.cs`
- [ ] T007 Criar spec de idempotência `ParticipacaoEventoPorUsuarioEOcorrenciaSpec` em `GestaoEventos.API/src/GestaoEventos.Infrastructure/Data/Queries/ParticipacaoEventoPorUsuarioEOcorrenciaSpec.cs`

**Checkpoint**: Foundation pronta — implementação das user stories pode começar.

---

## Phase 3: User Story 1 — Participante Visualiza Sua Jornada Pessoal (Priority: P1) 🎯 MVP

**Goal**: Jornada completa com frequência real + filtro de período + gauge animado + staggered cards + empty states. Rota `/admin/jornada` funcional com 4 abas conectadas a dados reais.

**Independent Test**: Usuário com ≥5 presenças registradas acessa `/admin/jornada` e vê: frequência percentual no gauge, lista de eventos participados com status colorido, próximas ocorrências. Filtros 7d/30d/90d/Ano atualizam o percentual dinamicamente.

### Implementation for User Story 1

- [ ] T008 [US1] Adicionar campo `PeriodoDias` (int, default 30) ao `FrequenciaCommand` em `GestaoEventos.API/src/GestaoEventos.UseCases/Participacoes/Frequencia/FrequenciaCommand.cs`
- [ ] T009 [P] [US1] Atualizar `ParticipacoesPorUsuarioEstruturSpec` para filtrar `OcorridoEm >= DateTime.UtcNow.AddDays(-PeriodoDias)` em `GestaoEventos.API/src/GestaoEventos.Infrastructure/Data/Queries/ParticipacoesPorUsuarioEstruturSpec.cs`
- [ ] T010 [US1] Adicionar property `PeriodoDias` ao request e atualizar binding em `GestaoEventos.API/src/GestaoEventos.Web/Participacao/List.ListParticipacaoRequest.cs` (ou arquivo de frequência request equivalente)
- [ ] T011 [US1] Substituir stubs Observable por delegate real ao `JornadaApiService` com `CacheService` (TTLs: 60s getEventos, 120s getParticipacoes, 300s getFrequencia/getOcorrencias) em `GestaoEventos.Angular/src/app/shared/services/jornada/jornada.service.ts`
- [ ] T012 [US1] Adicionar signals `periodoAtivo`, `frequenciaExibida`, computeds `gaugeColor`, `gaugeLabel`, `gaugeBadgeClass` e método `animarFrequencia(valor)` ao `JornadaComponent` em `GestaoEventos.Angular/src/app/libs/adm/jornada/jornada.component.ts`
- [ ] T013 [US1] Atualizar `carregarFrequencia()` no `JornadaComponent` para receber `periodoAtivo()` e chamar `animarFrequencia()` ao receber dados, e adicionar `onPeriodoChange()` em `GestaoEventos.Angular/src/app/libs/adm/jornada/jornada.component.ts`
- [ ] T014 [US1] Redesenhar `jornada.component.html`: header com nome/avatar placeholder, `p-selectButton` de período, card de gauge com `p-knob readonly`, métricas em grid 3 cols com `animate-fade-in` staggered, lista histórico com status coloridos, empty states em cada aba em `GestaoEventos.Angular/src/app/libs/adm/jornada/jornada.component.html`
- [ ] T015 [US1] Adicionar `@keyframes fadeInUp`, `.animate-fade-in`, `.animate-check`, staggered `animation-delay` e estilos do gauge ao `GestaoEventos.Angular/src/app/libs/adm/jornada/jornada.component.scss`

**Checkpoint**: `/admin/jornada` funcional com dados reais, gauge animado e filtro de período. US1 entregue independentemente.

---

## Phase 4: User Story 2 — Responsável Registra Presenças em Lote (Priority: P1)

**Goal**: AcompanharEvento exibe checkboxes por participante com "Selecionar Todos", "Salvar Presenças" persiste o lote em transação única via novo endpoint backend. Endpoint `POST /api/participacoes-evento/lote` criado e funcional.

**Independent Test**: Evento INICIADO com 5 participantes — responsável lista a tela, marca 3 presentes (usa "Selecionar Todos" e desmarca 2), clica "Salvar Presenças". Os 3 aparecem como PRESENTE na jornada deles. Segunda chamada com os mesmos dados não cria duplicatas.

### Implementation for User Story 2 — Backend

- [ ] T016 [P] [US2] Criar `BulkCreateParticipacaoEventoCommand` com records `BulkParticipanteItem` e `BulkCreateResultDto` em `GestaoEventos.API/src/GestaoEventos.UseCases/ParticipacaoEventos/BulkCreate/BulkCreateParticipacaoEventoCommand.cs`
- [ ] T017 [US2] Criar `BulkCreateParticipacaoEventoHandler` com lógica upsert (verificar existente via spec T007, insert ou update conforme resultado, `SaveChangesAsync` único ao final) em `GestaoEventos.API/src/GestaoEventos.UseCases/ParticipacaoEventos/BulkCreate/BulkCreateParticipacaoEventoHandler.cs`
- [ ] T018 [P] [US2] Criar `BulkCreate.BulkCreateParticipacaoEventoRequest` com `Route = "/api/participacoes-evento/lote"` em `GestaoEventos.API/src/GestaoEventos.Web/ParticipacaoEvento/BulkCreate.BulkCreateParticipacaoEventoRequest.cs`
- [ ] T019 [P] [US2] Criar `BulkCreate.BulkCreateParticipacaoEventoValidator` com FluentValidation (lista não vazia, máx 200, cada item com usuario_id XOR usuario_virtual_id, status enum válido, observação obrigatória para justificado) em `GestaoEventos.API/src/GestaoEventos.Web/ParticipacaoEvento/BulkCreate.BulkCreateParticipacaoEventoValidator.cs`
- [ ] T020 [US2] Criar `BulkCreate.cs` FastEndpoints endpoint com `Post("/api/participacoes-evento/lote")`, mapeamento via AutoMapper, delegate ao MediatR em `GestaoEventos.API/src/GestaoEventos.Web/ParticipacaoEvento/BulkCreate.cs`
- [ ] T021 [US2] Registrar mapeamento `BulkCreateParticipacaoEventoRequest → BulkCreateParticipacaoEventoCommand` e `BulkCreateResultDto → BulkCreateResultRecord` em `GestaoEventos.API/src/GestaoEventos.Web/Configurations/MappingProfileConfig.cs`

### Implementation for User Story 2 — Frontend

- [ ] T022 [P] [US2] Adicionar método `salvarLote` ao `ParticipacaoService` (business layer) que chama `ParticipacaoApiService.salvarLote` e invalida cache em `GestaoEventos.Angular/src/app/shared/services/participacao/participacao.service.ts`
- [ ] T023 [US2] Adicionar `participantesComStatus` signal, `todosSelecionados`, `salvandoLote`, `toggleTodos()`, `salvarPresencas()`, `setStatus(participante, status)`, `toggleParticipante(id)` ao `AcompanharEventoComponent` em `GestaoEventos.Angular/src/app/libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.ts`
- [ ] T024 [US2] Adicionar seção de bulk no template: checkbox "Selecionar Todos", checkboxes individuais por participante, seletor de status (presente/ausente/justificado) com textarea condicional e botão "Salvar Presenças" com `p-button` loading state em `GestaoEventos.Angular/src/app/libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.html`
- [ ] T025 [US2] Adicionar estilos da lista de presença: row destacada ao selecionar (background azul suave), animação de sucesso no ícone check, transição de cor por status em `GestaoEventos.Angular/src/app/libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.scss`

**Checkpoint**: Responsável consegue registrar presença de 15 usuários em <45s. Endpoint backend aceita lote com upsert idempotente. US2 entregue independentemente.

---

## Phase 5: User Story 3 — Participante Faz Auto Check-in (Priority: P2)

**Goal**: Rota `/admin/checkin/:eventoId` funciona com dados reais da API. Participante confirma própria presença em <15s. Check-in duplicado é idempotente (sem erro, sem duplicata).

**Independent Test**: Evento INICIADO — testador acessa `/admin/checkin/42`, vê detalhes do evento e botão "Confirmar Minha Presença". Clica, vê feedback de sucesso. Clica novamente — exibe "Você já confirmou presença neste evento" sem criar segundo registro.

### Implementation for User Story 3

- [ ] T026 [US3] Adicionar rota `checkin/:eventoId` com `loadComponent` para `CheckinComponent` após a rota `checkin` existente em `GestaoEventos.Angular/src/app/app.routes.ts`
- [ ] T027 [US3] Substituir mock `setTimeout` por chamadas reais: `JornadaApiService.getEventos` para eventos do dia, `ParticipacaoApiService.createPresenca` para confirmar presença; ler `eventoId` do `ActivatedRoute.snapshot.paramMap` e filtrar se presente; verificar `jaFezCheckin` antes de chamar API (idempotência client-side) em `GestaoEventos.Angular/src/app/libs/adm/checkin/checkin.component.ts`
- [ ] T028 [US3] Redesenhar `checkin.component.html`: header com data do dia, card de evento premium (ícone, nome, horário, local, status badge), botão "Confirmar Minha Presença" grande com `p-button` loading, estado "Presença confirmada" com check animado, empty state "Nenhum evento hoje", mensagem de erro para não-participante e evento não aberto em `GestaoEventos.Angular/src/app/libs/adm/checkin/checkin.component.html`
- [ ] T029 [P] [US3] Adicionar animação de sucesso `checkSuccess` e estilos premium (card com hover lift, gradiente de confirmação) em `GestaoEventos.Angular/src/app/libs/adm/checkin/checkin.component.scss`

**Checkpoint**: Auto check-in funcional em <15s com dados reais. US3 entregue independentemente.

---

## Phase 6: User Story 4 — Participante Vê Eventos de Hoje (Priority: P2)

**Goal**: Aba "Eventos de Hoje" na Jornada exibe eventos reais do dia do usuário com link direto para check-in em um toque. Widget `EventosHojeComponent` usa dados reais.

**Independent Test**: Usuário com evento ocorrendo hoje acessa `/admin/jornada` — Aba 1 mostra o evento com horário e nome. Toque no card navega para `/admin/checkin/:eventoId` em 1 interação.

### Implementation for User Story 4

- [ ] T030 [US4] Implementar lógica real no `EventosHojeHandler` substituindo o stub vazio por query real usando `IEventoService` ou `IRepository<Evento>` com filtro de data hoje e `usuario_id` em `GestaoEventos.API/src/GestaoEventos.UseCases/Jornada/EventosHojeHandler.cs`
- [ ] T031 [US4] Atualizar `JornadaService.getEventos()` para chamar `JornadaApiService.getEventos()` com `data='hoje'` (já existe no wiring do T011 — verificar se precisa de ajuste para passar `ocorrencia_id` no response para navegação) em `GestaoEventos.Angular/src/app/shared/services/jornada/jornada.service.ts`
- [ ] T032 [US4] Atualizar Aba 1 do `jornada.component.html`: cards de evento com horário, nome do grupo, badge de status, botão "Fazer Check-in" que navega para `/admin/checkin/:ocorrenciaId` (ou `/admin/checkin/:eventoId`), empty state "Nenhum evento hoje — aproveite o dia! 🎉" em `GestaoEventos.Angular/src/app/libs/adm/jornada/jornada.component.html`
- [ ] T033 [P] [US4] Adicionar lógica de navegação `irParaCheckin(eventoId: number)` usando `Router.navigate` no `JornadaComponent` em `GestaoEventos.Angular/src/app/libs/adm/jornada/jornada.component.ts`

**Checkpoint**: Widget "Eventos Hoje" mostra dados reais. Navegação 1 toque para check-in. US4 entregue independentemente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Propósito**: Polimento final, consistência visual e validação do quickstart.

- [ ] T034 [P] Adicionar `@keyframes fadeInUp` e `.animate-fade-in` ao `GestaoEventos.Angular/src/app/styles.scss` (global — evita duplicação nos SCSSs individuais dos componentes)
- [ ] T035 Verificar visibilidade do botão "Salvar Presenças" — esconder para participantes sem permissão `VALIDAR_PRESENCA_GRUPO` usando `permissionService.hasPermission('VALIDAR_PRESENCA_GRUPO')` como `*ngIf` em `GestaoEventos.Angular/src/app/libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.html`
- [ ] T036 [P] Executar checklist de validação do `quickstart.md` manualmente: testar 7/30/90/365 dias, bulk com 5 participantes, check-in duplicado, gauge counter-up, "Selecionar Todos" toggle, empty states
- [ ] T037 Garantir que `JornadaService.invalidarFrequencia()` é chamado após `salvarPresencas()` no `AcompanharEventoComponent` (cache bust pós-lote) em `GestaoEventos.Angular/src/app/libs/adm/eventos/acompanhar-evento/acompanhar-evento.component.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências — iniciar imediatamente
- **Phase 2 (Foundational)**: Depende do Phase 1 — **bloqueia todas as user stories**
- **Phase 3 (US1 Jornada)**: Depende de Phase 2 — pode iniciar após Foundation
- **Phase 4 (US2 Bulk)**: Depende de Phase 2 — pode rodar em paralelo com Phase 3
- **Phase 5 (US3 Check-in)**: Depende de Phase 2 — pode rodar em paralelo com Phase 3 e 4
- **Phase 6 (US4 Eventos Hoje)**: Depende de Phase 3 (US1) para a integração na Aba 1 da Jornada
- **Phase 7 (Polish)**: Depende de todas as fases anteriores

### User Story Dependencies

- **US1 (P1 Jornada)**: Após Foundation — independente
- **US2 (P1 Bulk)**: Após Foundation — independente de US1, pode correr em paralelo
- **US3 (P2 Check-in)**: Após Foundation — independente, mas beneficia de US4 (widget Hoje) para navegação
- **US4 (P2 Eventos Hoje)**: Após US1 (integrada na Aba 1 do JornadaComponent)

### Dentro de Cada User Story

- Backend (command/handler) antes de endpoint FastEndpoints
- Interface TypeScript antes de service
- Service antes de component
- Component TS antes de HTML template

---

## Parallel Opportunities

### Phase 1 — pode rodar tudo em paralelo

```
T001 — bulk-presenca.model.ts
T002 — frequencia.model.ts (adição)
T003 — participante-com-presenca.model.ts
```

### Phase 2 — T004 e T005 em paralelo, T006 e T007 em paralelo após T001-T003

```
T004 — jornada-api.service.ts (getFrequencia + periodo_dias)
T005 — participacao-api.service.ts (salvarLote)
T006 — MappingProfileConfig.cs (BulkCreateResultRecord)
T007 — ParticipacaoEventoPorUsuarioEOcorrenciaSpec.cs
```

### Phase 4 (US2) — Backend e Frontend em paralelo

```
Backend: T016, T018, T019 em paralelo (arquivos distintos)
T017 após T016 + T007
T020 após T017
T021 em paralelo com T020

Frontend: T022, T023 em paralelo
T024 após T023
T025 em paralelo com T024
```

---

## Implementation Strategy

### MVP First (US1 + US2 — ambos P1)

1. Complete **Phase 1**: Setup de interfaces
2. Complete **Phase 2**: Foundation (API methods, spec)
3. Complete **Phase 3**: US1 Jornada → **VALIDAR**: `/admin/jornada` com dados reais, gauge animado
4. Complete **Phase 4**: US2 Bulk → **VALIDAR**: lote de 5 participantes salvo em <45s
5. **DEPLOY / DEMO**: Ambos P1 entregues — valor immediato ao cliente

### Incremental Delivery

1. Setup + Foundation → base estável
2. US1 (Jornada) → demo "home do participante" 
3. US2 (Bulk lote) → demo "responsável registra presenças em 45s"
4. US3 (Check-in) → demo "confirmo presença em 15s"
5. US4 (Eventos hoje) → widget diário + navegação 1 toque
6. Polish → produto polido

---

## Notes

- Testes não incluídos (não solicitados na spec).
- Todos os componentes são **Standalone** — sem NgModules.
- **Nunca** chamar HTTP diretamente no componente — sempre via Business Service.
- `ParticipacaoEvento` já existe no banco — sem migration nova para US1/US2/US3/US4.
- O único artefato novo de banco é implícito no upsert do bulk (sem nova tabela/coluna).
- UX: priorizar animações CSS (`@keyframes`) e PrimeNG built-in — sem libs externas.
- `[P]` = tarefas em arquivos distintos sem dependência entre si.
- Commitar ao final de cada fase ou user story para facilitar rollback.
