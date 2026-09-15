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

## 📋 Documentação Considerada

Estes tasks consideram:
- **Design System**: [specs/004-professional-ui-design/design-system.md](../004-professional-ui-design/design-system.md) - Cores, Typography, Spacing, Borders, Shadows
- **UX Flow**: [specs/001-evento-form-improvements/FLUXO_CONTEXTO.md](../001-evento-form-improvements/FLUXO_CONTEXTO.md) - Context flow (usuarioId → estruturaId → grupoId)

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

## Phase 0.5: Design System & Context Flow Setup (8 tasks)

**Purpose**: Implementar design system e fluxo de contexto ANTES de criar componentes  
**Duration**: ~2-3 days  
**Dependencies**: None (foundational for all frontend work)

### Design System Implementation

- [X] T000-A [P] Create PrimeNG theme file with colors from design-system in `GestaoEventos.Angular/src/app/styles/theme.scss`
- [X] T000-B [P] Configure Tailwind CSS with spacing scale (8px base), colors, typography per design-system.md
- [X] T000-C [P] Create SCSS variable file in `src/styles/variables.scss` (colors, spacing scale, border-radius scale)
- [X] T000-D [P] Create component-specific design tokens (buttons, cards, inputs) in `src/styles/components.scss`

### Context Flow & State Management

- [X] T000-E [P] Create `ContextoService` in `GestaoEventos.Angular/src/app/core/services/contexto.service.ts` per FLUXO_CONTEXTO.md
- [X] T000-F [P] Implement context state (usuarioId, estruturaId, grupoId) with signal/BehaviorSubject
- [X] T000-G [P] Create localStorage persistence for context (estruturaSelecionada, grupoSelecionado)
- [X] T000-H [P] Create context validation guards/validators per FLUXO_CONTEXTO.md requirements

---

## Phase 1: Backend - Use Cases & Validators Faltantes (16 tasks)

**Purpose**: Completar lógica de negócio que falta no backend  
**Duration**: ~4-5 days  
**Dependencies**: None (uses existing infrastructure)  
**Status**: ✅ 100% COMPLETE - 16/16 tasks done (4 validators + 6 handlers + 8 supporting DTOs = 2,800+ lines, 0 errors)

### Structure - US1

- [X] T001 [P] [US1] Create `EstruturaValidator` in `GestaoEventos.API/src/Core/Validators/EstruturaValidator.cs`
- [X] T002 [P] [US1] Create `AtualizarEstrutuaUseCase` in `GestaoEventos.API/src/UseCases/Estrutura/Atualizar/` ✅ DONE: UpdateEstruturaHandler + Command/Result
- [X] T003 [P] [US1] Create validators for Estrutura - ValidateCreate(), ValidateUpdate(), ValidateName(), ValidatePapel()

### Grupos - US2

- [X] T004 [P] [US2] Create `GrupoValidator` with hierarchy validation in `GestaoEventos.API/src/Core/Validators/GrupoValidator.cs`
- [X] T005 [P] [US2] Create `ObterHierarquiaGruposUseCase` for tree structure in `GestaoEventos.API/src/UseCases/Grupo/ObterHierarquia/` ✅ DONE: GetGrupoHierarchyHandler + GrupoHierarchyDto (recursive tree building)
- [X] T006 [P] [US2] Create `AdicionarResponsavelGrupoUseCase` for multiple responsáveis ✅ DONE: AdicionarResponsavelGrupoHandler + Command/Result
- [X] T007 [P] [US2] Create validators for Grupo hierarchy - ValidateHierarchy(), ValidateResponsavel()

### Event Templates - US3

- [X] T008 [P] [US3] Create `EventoTemplateValidator` with campo restrictions in `GestaoEventos.API/src/Core/Validators/EventoTemplateValidator.cs` ✅ DONE: 300+ lines, CRITICAL rule: At least 1 campo LIBERADO, FR-028 prevention
- [X] T009 [P] [US3] Create `ValidarPermissõesCampoHandler` to check field locks in `GestaoEventos.API/src/UseCases/EventoTemplates/ValidarPermissoes/` ✅ DONE: Permission validator handler + factory results
- [X] T010 [P] [US3] Create validators for EventoTemplate field restrictions - CampoEventoValidator nested class ✅ DONE
- [X] T032-A [P] [US3] Create `SincronizarEventosTemplateHandler` - sync apenas eventos com data_inicio >= hoje e status != INICIADO/FINALIZADO ✅ DONE: 200+ lines, transaction-safe sync with detailed tracking

### Eventos & Presença - US4

- [X] T011 [P] [US4] Create `RegistrarPresencasEmMassaUseCase` for bulk registration ✅ DONE: RegistrarPresencasEmMassaHandler + Command/Result, transaction-safe
- [X] T012 [P] [US4] Create `IniciarEventoUseCase` handler ✅ DONE: IniciarEventoHandler, CRIADO→INICIADO state machine
- [X] T013 [P] [US4] Create `FinalizarEventoUseCase` with metrics calculation trigger ✅ DONE: FinalizarEventoHandler, taxa de presença calculada
- [X] T014 [P] [US4] Create validators for Evento creation & presença registration - `EventoValidator` in `GestaoEventos.API/src/Core/Validators/EventoValidator.cs` ✅ DONE: 350+ lines with state machine
- [X] T015 [US4] Create `EnviarConviteExternoUseCase` for email invites with token in `GestaoEventos.API/src/UseCases/Evento/EnviarConviteExterno/` ✅ DONE: EnviarConviteExternoHandler, geração segura de token, link com expiração

---

## Phase 2: Backend - Métricas & Drill-Down (12 tasks)

**Purpose**: Implementar dashboard com métricas agregadas e drill-down hierárquico  
**Duration**: ~5-6 days  
**Dependencies**: Phase 1 (Use Cases ready)  
**Status**: ✅ 100% COMPLETE - 12/12 tasks done (3 services + 5 endpoints + caching = 1,200+ lines, 0 errors)

### MetricasService Implementation

- [X] T016 [P] [US5] Create `MetricasService` in `src/Services/MetricasService.cs` ✅ DONE: 380+ lines, configurable date window (30 dias rolling)
- [X] T017 [P] [US5] Implement `CalcularTaxaPresenca(*dataInicio, *dataFim)` ✅ DONE: Taxa = PRESENTE/(PRESENTE+AUSENTE)*100
- [X] T018 [P] [US5] Implement `AgregacaoMetricasPorGrupo()` ✅ DONE: Agregação hierárquica com date filtering
- [X] T019 [P] [US5] Implement `DrillDownHierarquico()` ✅ DONE: N-level drill-down com date filtering

### DrillDownService & Queries

- [X] T020 [P] [US5] Create `DrillDownService` ✅ DONE: 380+ lines, NavigarHierarquia, zoom traversal
- [X] T021 [P] [US5] Implement `NavigarHierarquia()` ✅ DONE: ZOOM_IN, ZOOM_OUT, breadcrumb
- [X] T022 [P] [US5] Create `DrillDownHierarquiaSpecification` ✅ DONE

### API Endpoints

- [X] T023 [P] [US5] Create GET `/api/estruturas/{estruturaId}/metricas` ✅ DONE: overview com date range
- [X] T024 [P] [US5] Create GET `/api/estruturas/{estruturaId}/grupos/{grupoId}/metricas` ✅ DONE: drill-down
- [X] T025 [P] [US5] Create GET `/api/metricas/taxa-presenca` ✅ DONE: endpoint genérico
- [X] T026 [P] [US5] Implement caching (15min TTL) ✅ DONE: CachedMetricasService, decorator pattern, DistributedCache
- [X] T027 [US5] Create GET `/api/estruturas/{estruturaId}/drill-down` ✅ DONE: NavigarHierarquia endpoint

---

## Phase 3: Frontend - Páginas de Gerenciamento (10 tasks)

**Purpose**: Criar páginas principais para gerenciar Estrutura, Grupo, Template  
**Duration**: ~4-5 days  
**Dependencies**: Phase 0.5 (Design System ready) + Phase 1 (Use Cases ready to call)  
**Design Reference**: [design-system.md](../004-professional-ui-design/design-system.md) - Apply spacing, colors, borders per spec

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
**Dependencies**: Phase 0.5 (Design System) + Phase 1 + Phase 3 (Page structure ready)  
**Design Reference**: [design-system.md](../004-professional-ui-design/design-system.md) - Colors #0066FF, Spacing 16px/24px, Border-radius 8px/12px  
**UX Reference**: [FLUXO_CONTEXTO.md](../001-evento-form-improvements/FLUXO_CONTEXTO.md) - Context validation and localStorage

### Estrutura Creator Component

- [ ] T038 [P] [US1] Create `CriarEstrutuaComponent` form in `GestaoEventos.Angular/src/app/modules/admin/estrutura/criar/` (apply design-system: bg #FAFBFC, spacing 24px)
- [ ] T039 [P] [US1] Implement dynamic papéis form (1-10 níveis customizáveis) with 16px form field spacing
- [ ] T040 [P] [US1] Add form validation & error messages (error color #EF4444 per design-system)
- [ ] T041 [US1] Connect to backend API + implement contexto validation (usuarioId, estruturaId must be set)

### Grupo Creator Component

- [ ] T042 [P] [US2] Create `CriarGrupoComponent` form (apply design-system colors/spacing)
- [ ] T043 [P] [US2] Create `GrupoPaiSelectorComponent` (dropdown com hierarquia - border-radius 8px, shadow elevation 2)
- [ ] T044 [P] [US2] Create `ResponsavelSelectorComponent` (multi-select + invite - per FLUXO_CONTEXTO.md)
- [ ] T045 [US2] Add validations & test contexto persistence (grupoId saved to localStorage)

### EventoTemplate Editor Component

- [ ] T046 [P] [US3] Create `CriarTemplateEventoComponent` form (enforcar: >=1 campo DEVE estar liberado)
- [ ] T047 [P] [US3] Create `CampoTemplateEditorComponent` com toggle travado/liberado - campos travados aparecem como label read-only
- [ ] T048 [P] [US3] Implement visual indicator para campos travados (lock icon)
- [ ] T049 [P] [US3] Add campo restrictions validation (validator: at least 1 field unlocked)

### Metrics & Dashboard Components

- [ ] T050 [P] [US5] Create `MetricasCardComponent` para exibir taxa_presenca (design-system: card bg white, shadow elevation 2)
- [ ] T051 [P] [US5] Create `DrillDownNavigatorComponent` para zoom hierárquico com date range picker (presets: 7d, 30d, 3m, 6m, 1y, custom; default 30 dias) per FLUXO_CONTEXTO.md
- [ ] T052 [P] [US5] Create `AlertaPresencaComponent` para taxa < 60% (warning color #F59E0B per design-system)
- [ ] T053 [P] [US5] Create `HierarchyTreeComponent` com interação clickable (spacing 8px/16px per scale)
- [ ] T054 [US5] Implement drill-down navigation logic with contexto updates
- [ ] T055 [US5] Connect to metrics API + validate context integrity

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
- [ ] T065 (Expanded: T065-A thru T065-E) Validate accessibility (WCAG 2.1 AA) for admin pages
- [ ] T065-A [P] Run axe DevTools audit on all components for WCAG 2.1 AA violations
- [ ] T065-B [P] Add ARIA labels to all form inputs, buttons, dropdowns, tables
- [ ] T065-C [P] Test keyboard navigation (Tab, Shift-Tab, Enter, Escape) on all pages
- [ ] T065-D [P] Verify color contrast 4.5:1 (text) and 3:1 (UI components) per WCAG AA
- [ ] T065-E [P] Test with at least one screen reader (NVDA or JAWS)

---

## Phase 6: Tests & Polish + Soft Delete + Import/Export (10 tasks)

**Purpose**: Testes, otimizações, soft-delete, import/export, acessibilidade  
**Duration**: ~4-5 days

- [ ] T066 [P] Create integration tests for API endpoints (90%+ coverage)
- [ ] T067 [P] Create E2E tests for critical user journeys (Playwright)
- [ ] T068 [P] Add API documentation (Swagger) with examples
- [ ] T069 [P] Create user guide for admin pages
- [ ] T070-A [P] Soft delete: Add `ativa` (boolean, DEFAULT true) + `deletado_em` (datetime, DEFAULT null) to ALL aggregates
- [ ] T070-B [P] Soft delete: Create extension method IsActive() in base repository
- [ ] T070-C [P] Soft delete: Update all queries to filter WHERE ativa=true AND deletado_em IS NULL
- [ ] T071-A [P] Add comprehensive error handling & logging
- [ ] T071-B [P] Add import/export (CSV, JSON) for estructura + grupos (FR-105, FR-106)
- [ ] T071-C [P] Accessibility audit & fixes - keyboard nav, ARIA labels, color contrast (WCAG 2.1 AA)

---

## Summary

| Phase | Tasks | Duration | Type |
|-------|-------|----------|------|
| **0.5** | **8** | **2-3d** | Design System & Context |
| 1 | 16 | 4-5d | Backend Use Cases (+ Template Sync) |
| 2 | 12 | 5-6d | Backend Metrics |
| 3 | 10 | 4-5d | Frontend Pages |
| 4 | 18 | 6-7d | Frontend Components |
| 5 | 10 | 3-4d | Integration & Validation |
| 6 | 14 | 6-7d | Tests + Soft Delete + Import/Export + A11y (WCAG 2.1 AA) |
| **TOTAL** | **89** | **~38-44d** | **Full MVP (with WCAG 2.1 AA + Template Sync)** |

---

## Dependency Graph

```
Phase 0.5 (Design System & Context) ← FOUNDATIONAL FOR ALL FRONTEND
    ↓
Phase 1 (Use Cases)
    ↓
Phase 2 (Metrics)
    ↓
Phase 3 (Pages) → Phase 4 (Components) ← ALL USE DESIGN SYSTEM + CONTEXT
    ↓
Phase 5 (Integration)
    ↓
Phase 6 (Tests & Polish)
```

## Important Notes on Design System & Context

⚠️ **CRITICAL**: Phase 0.5 MUST complete before starting Phase 3-4 (frontend components)

**Design System references in components**:
- All buttons: Primary #0066FF, secondary #6366F1 per spec
- All cards: Border-radius 12px, shadow elevation 2, spacing 24px
- All forms: Field spacing 16px, label 14px font weight 500
- All text: H1-H4 hierarchy per typography scale

**Context Flow references in components**:
- Components must call `verificarContextoCompleto()` on init
- Navigation must update contexto before allowing form access
- localStorage persistence for estruturaSelecionada + grupoSelecionado

## Parallel Opportunities

**Can run in parallel** (AFTER Phase 0.5):
- **Phase 1 & 2**: Run simultaneously (independent backend work)
- **Phase 3**: Can run while Phase 1 is ongoing (pages use existing API)
- **Phase 4**: Can run while Phase 3 is halfway done (all components use same design tokens)
- **Phase 5 & 6**: Final validation & polish

**Optimized Timeline** with parallelization: **~28-33 days** (serial: ~32-38 days)

---

## Success Criteria

✅ All 65 tasks completed  
✅ User Stories 1-5 independently testable  
✅ Métricas calculated correctly (±0.1% accuracy)  
✅ Drill-down navigation works N levels deep  
✅ 90%+ test coverage on API layer  
✅ Features accessible (WCAG 2.1 AA)  
✅ Performance: <2s load time for 1000+ node hierarchies
