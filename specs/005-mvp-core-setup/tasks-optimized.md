# Feature Tasks: MVP - Estrutura Agnóstica com Hierarquia, Grupos, Eventos e Participantes

**Branch**: `005-mvp-core-setup`  
**Specification**: [spec.md](spec.md)  
**Plan**: [plan.md](plan.md)  
**GAP Analysis**: [GAP_ANALYSIS.md](GAP_ANALYSIS.md)  
**Status**: Ready for Development (OPTIMIZED)

---

## Overview

⚠️ **CRITICAL**: Este é um **tasks.md REVISADO** com base em Gap Analysis.  
❌ **Removidas**: ~70 tasks de coisas já implementadas (Entities, Repositories, Base Services, Controllers)  
✅ **Focado em**: ~65 tasks que REALMENTE faltam

**Novas Fases**:
- **Fase 1**: Backend - Use Cases & Validators Faltantes (15 tasks)
- **Fase 2**: Backend - Métricas & Drill-Down (12 tasks)
- **Fase 3**: Frontend - Páginas de Gerenciamento (10 tasks)
- **Fase 4**: Frontend - Componentes Críticos (18 tasks)
- **Fase 5**: Frontend - Integração & Validação (10 tasks)
- **Fase 6**: Tests & Polish (6 tasks)

**Estimativa Revisada**: **~65 tasks** em **~40-50 dias** (em vez de 138 tasks)

---

## Format Guide

- **[P]**: Task pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[US#]**: User Story (US1, US2, US3, US4, US5)
- Sem [US#]: Setup, Foundational, Polish phases

---

## ✅ What's NOT in this list (Already Done)

- Database schema (26 aggregates already defined)
- Entity models (Estrutura, Grupo, Evento, Papel, etc.)
- Repositories & UnitOfWork pattern
- Controllers base structure
- Services base (estrutura, evento, grupo services exist)
- Frontend services (30+ services already implemented)
- Authentication & JWT framework
- DbContext configuration

See [GAP_ANALYSIS.md](GAP_ANALYSIS.md) for what's already built.

---

## Phase 1: Backend - Use Cases & Validators Faltantes (15 tasks)

**Purpose**: Completar lógica de negócio que falta no backend  
**Duration**: ~4-5 days  
**Dependencies**: None (uses existing infrastructure)

### Structure - US1

- [ ] T001 [P] [US1] Complete `CriarEstrutuaUseCase` handler in `GestaoEventos.API/src/UseCases/Estrutura/CriarEstrutura/`
- [ ] T002 [P] [US1] Create `AtualizarEstrutuaUseCase` in `GestaoEventos.API/src/UseCases/Estrutura/Atualizar/`
- [ ] T003 [P] [US1] Create validators for Estrutura in `GestaoEventos.API/src/Core/Validators/`

### Grupos - US2

- [ ] T004 [P] [US2] Complete `CriarGrupoUseCase` handler with hierarchy validation
- [ ] T005 [P] [US2] Create `ObterHierarquiaGruposUseCase` for tree structure in `GestaoEventos.API/src/UseCases/Grupo/ObterHierarquia/`
- [ ] T006 [P] [US2] Create `AdicionarResponsavelGrupoUseCase` for multiple responsáveis
- [ ] T007 [P] [US2] Create validators for Grupo hierarchy

### Event Templates - US3

- [ ] T008 [P] [US3] Complete `CriarTemplateEventoUseCase` with campo restrictions
- [ ] T009 [P] [US3] Create `ValidarPermissõesTemplateUseCase` to check field locks
- [ ] T010 [P] [US3] Create validators for EventoTemplate field restrictions

### Eventos & Presença - US4

- [ ] T011 [P] [US4] Create `RegistrarPresencasEmMassaUseCase` for bulk registration
- [ ] T012 [P] [US4] Create `IniciarEventoUseCase` handler
- [ ] T013 [P] [US4] Create `FinalizarEventoUseCase` with metrics calculation trigger
- [ ] T014 [P] [US4] Create validators for Evento creation & presença registration
- [ ] T015 [US4] Create `EnviarConviteExternoUseCase` for email invites with token in `GestaoEventos.API/src/UseCases/Evento/EnviarConviteExterno/`

---

## Phase 2: Backend - Métricas & Drill-Down (12 tasks)

**Purpose**: Implementar dashboard com métricas agregadas e drill-down hierárquico  
**Duration**: ~5-6 days  
**Dependencies**: Phase 1 (Use Cases ready)

### MetricasService Implementation

- [ ] T016 [P] [US5] Create `MetricasService` in `GestaoEventos.API/src/Services/MetricasService.cs`
- [ ] T017 [P] [US5] Implement `CalcularTaxaPresenca()` method (presença/total)
- [ ] T018 [P] [US5] Implement `AgregacaoMetricasPorGrupo()` for group aggregation
- [ ] T019 [P] [US5] Implement `DrillDownHierarquico()` for N-level drill-down

### DrillDownService & Queries

- [ ] T020 [P] [US5] Create `DrillDownService` in `GestaoEventos.API/src/Services/DrillDownService.cs`
- [ ] T021 [P] [US5] Implement `NavigarHierarquia()` method for zoom traversal
- [ ] T022 [P] [US5] Create `DrillDownHierarquiaSpecification` for complex queries

### API Endpoints

- [ ] T023 [P] [US5] Create GET `/api/estruturas/{estruturaId}/metricas` (overview) in `GestaoEventos.API/src/Web/Metricas/MetricasController.cs`
- [ ] T024 [P] [US5] Create GET `/api/estruturas/{estruturaId}/grupos/{grupoId}/metricas` (drill-down)
- [ ] T025 [P] [US5] Create GET `/api/estruturas/{estruturaId}/metricas/hierarquica` (full tree)
- [ ] T026 [P] [US5] Add authorization checks for metrics endpoints
- [ ] T027 [US5] Create `MetricasController` in `GestaoEventos.API/src/Web/Metricas/`

---

## Phase 3: Frontend - Páginas de Gerenciamento (10 tasks)

**Purpose**: Criar páginas principais para gerenciar Estrutura, Grupo, Template  
**Duration**: ~4-5 days  
**Dependencies**: Phase 1 (Use Cases ready to call)

### Estrutura Management Page

- [ ] T028 [P] [US1] Create `EstruturasPageComponent` in `GestaoEventos.Angular/src/app/pages/admin/estruturas/`
- [ ] T029 [P] [US1] Create list view with structure selectors
- [ ] T030 [P] [US1] Create "Nova Estrutura" button → routing to criador

### Grupos Management Page

- [ ] T031 [P] [US2] Create `GruposPageComponent` in `GestaoEventos.Angular/src/app/pages/admin/grupos/`
- [ ] T032 [P] [US2] Implement tree view for hierarquia visualization
- [ ] T033 [P] [US2] Create "Novo Grupo" button → routing to criador

### Templates Management Page

- [ ] T034 [P] [US3] Create `TemplatesPageComponent` in `GestaoEventos.Angular/src/app/pages/admin/templates/`
- [ ] T035 [P] [US3] Create list view with template cards (showing campo infos)
- [ ] T036 [P] [US3] Create "Novo Template" button → routing to criador

### Dashboard Métricas Page

- [ ] T037 [US5] Create `MetricasDashboardPageComponent` in `GestaoEventos.Angular/src/app/pages/admin/dashboard/`

---

## Phase 4: Frontend - Componentes Críticos (18 tasks)

**Purpose**: Criar componentes de formulário e visualização  
**Duration**: ~6-7 days  
**Dependencies**: Phase 1 + Phase 3 (Page structure ready)

### Estrutura Creator Component

- [ ] T038 [P] [US1] Create `CriarEstrutuaComponent` form in `GestaoEventos.Angular/src/app/modules/admin/estrutura/criar/`
- [ ] T039 [P] [US1] Implement dynamic papéis form (1-10 níveis customizáveis)
- [ ] T040 [P] [US1] Add form validation & error messages
- [ ] T041 [US1] Connect to backend API + test

### Grupo Creator Component

- [ ] T042 [P] [US2] Create `CriarGrupoComponent` form
- [ ] T043 [P] [US2] Create `GrupoPaiSelectorComponent` (dropdown com hierarquia)
- [ ] T044 [P] [US2] Create `ResponsavelSelectorComponent` (multi-select + invite)
- [ ] T045 [US2] Add validations & test integration

### EventoTemplate Editor Component

- [ ] T046 [P] [US3] Create `CriarTemplateEventoComponent` form
- [ ] T047 [P] [US3] Create `CampoTemplateEditorComponent` com toggle travado/liberado
- [ ] T048 [P] [US3] Implement visual indicator para campos travados
- [ ] T049 [P] [US3] Add campo restrictions validation

### Metrics & Dashboard Components

- [ ] T050 [P] [US5] Create `MetricasCardComponent` para exibir taxa_presenca
- [ ] T051 [P] [US5] Create `DrillDownNavigatorComponent` para zoom hierárquico
- [ ] T052 [P] [US5] Create `AlertaPresencaComponent` para taxa < 60%
- [ ] T053 [P] [US5] Create `HierarchyTreeComponent` com interação clickable
- [ ] T054 [US5] Implement drill-down navigation logic
- [ ] T055 [US5] Connect to metrics API + test

---

## Phase 5: Frontend - Integração & Validação (10 tasks)

**Purpose**: Integrar componentes, testar fluxos end-to-end  
**Duration**: ~3-4 days  
**Dependencies**: Phase 4 (Components ready)

### User Journeys Testing

- [ ] T056 [P] [US1] Test estrutura creation → list → select → context switch
- [ ] T057 [P] [US2] Test grupo hierarchy creation (parent/child) → tree view
- [ ] T058 [P] [US3] Test template creation → field restrictions → freeze/unfreeze
- [ ] T059 [P] [US4] Test evento creation with template → field restrictions enforced
- [ ] T060 [P] [US4] Test participante addition → presença registration → bulk operations
- [ ] T061 [US5] Test metrics calculation → drill-down navigation through hierarchy

### Performance & UX

- [ ] T062 [P] Optimize tree rendering for large hierarchies (1000+ nodes)
- [ ] T063 [P] Add loading indicators & error states for API calls
- [ ] T064 [P] Implement caching for frequently accessed data
- [ ] T065 Validate accessibility (WCAG 2.1 AA) for admin pages

---

## Phase 6: Tests & Polish (6 tasks)

**Purpose**: Testes, otimizações, documentação  
**Duration**: ~3-4 days

- [ ] T066 [P] Create integration tests for API endpoints (90%+ coverage)
- [ ] T067 [P] Create E2E tests for critical user journeys (Playwright)
- [ ] T068 [P] Add API documentation (Swagger) with examples
- [ ] T069 [P] Create user guide for admin pages
- [ ] T070 Soft delete implementation for entities
- [ ] T071 Add comprehensive error handling & logging

---

## Summary

| Phase | Tasks | Duration | Type |
|-------|-------|----------|------|
| 1 | 15 | 4-5d | Backend Use Cases |
| 2 | 12 | 5-6d | Backend Metrics |
| 3 | 10 | 4-5d | Frontend Pages |
| 4 | 18 | 6-7d | Frontend Components |
| 5 | 10 | 3-4d | Integration & Validation |
| 6 | 6 | 3-4d | Tests & Polish |
| **TOTAL** | **71** | **~30-35d** | **Full MVP** |

---

## Dependency Graph

```
Phase 1 (Use Cases)
    ↓
Phase 2 (Metrics)
    ↓
Phase 3 (Pages) → Phase 4 (Components)
    ↓
Phase 5 (Integration)
    ↓
Phase 6 (Tests & Polish)
```

## Parallel Opportunities

**Can run in parallel**:
- **Phase 1 & 2**: Run simultaneously (independent backend work)
- **Phase 3**: Can run while Phase 1 is ongoing (pages use existing API)
- **Phase 4**: Can run while Phase 3 is halfway done
- **Phase 5 & 6**: Final validation & polish

**Optimized Timeline** with parallelization: **~25-30 days** (serial: ~30-35 days)

---

## Success Criteria

✅ All 65 tasks completed  
✅ User Stories 1-5 independently testable  
✅ Métricas calculated correctly (±0.1% accuracy)  
✅ Drill-down navigation works N levels deep  
✅ 90%+ test coverage on API layer  
✅ Features accessible (WCAG 2.1 AA)  
✅ Performance: <2s load time for 1000+ node hierarchies
