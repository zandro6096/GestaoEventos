# Tasks: Modernizar Design e UX da Página de Criar Eventos

**Feature**: 002-evento-form-design  
**Branch**: `002-evento-form-design`  
**Input**: Design documents from `/specs/002-evento-form-design/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: Not requested for this visual/UX feature

**Organization**: Tasks organized by user story to enable independent implementation. MVP = US1 + US2 (P1 stories).

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4, US5, US6)
- File paths use Angular project root: `GestaoEventos.Angular/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create reusable design system components and verify prerequisites

- [X] T001 Verify provideAnimations() exists in GestaoEventos.Angular/src/app/app.config.ts
- [X] T002 [P] Create _design-tokens.scss in GestaoEventos.Angular/src/app/shared/styles/_design-tokens.scss
- [X] T003 [P] Create skeleton-loader.component.ts in GestaoEventos.Angular/src/app/shared/components/skeleton-loader/skeleton-loader.component.ts
- [X] T004 [P] Create skeleton-loader.component.html in GestaoEventos.Angular/src/app/shared/components/skeleton-loader/skeleton-loader.component.html (inline template)
- [X] T005 Verify PrimeNG modules imported in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (ButtonModule, FieldsetModule, SkeletonModule, MessageModule, ProgressSpinnerModule)

**Checkpoint**: Design tokens and skeleton loader ready for use

---

## Phase 2: User Story 1 - Interface Visual Moderna e Profissional (Priority: P1) 🎯 MVP

**Goal**: Garantir que todos os componentes PrimeNG estão renderizados corretamente com estilos aplicados, espaçamento consistente e hierarquia visual clara.

**Independent Test**: Abrir `/admin/eventos/criar` e verificar que todos os botões usam p-button com estilos PrimeNG, campos estão em grid responsivo, e há feedback visual em focus.

### Implementation for User Story 1

- [X] T006 [P] [US1] Add PrimeNG component imports to GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (ButtonModule, FieldsetModule, CalendarModule, InputTextModule, InputNumberModule, DropdownModule, MultiSelectModule, CheckboxModule, MessageModule, SkeletonModule, ProgressSpinnerModule)
- [X] T007 [P] [US1] Import SkeletonLoaderComponent in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts
- [X] T008 [US1] Refactor template to use p-button components in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (replace HTML buttons with p-button, add icons, severity attributes)
- [X] T009 [US1] Add PrimeFlex grid classes to form layout in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (grid, col-12, md:col-6, lg:col-4)
- [X] T010 [US1] Wrap form sections in p-fieldset components in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (QUANDO ACONTECE, QUEM PARTICIPA, EVENTO SE REPETE, OUTRAS INFORMAÇÕES)
- [X] T011 [US1] Import design tokens in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (@import '../../../../shared/styles/design-tokens')
- [X] T012 [US1] Add container max-width and centering styles in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (.evento-form-container { max-width: 1200px; margin: 0 auto; })
- [X] T013 [US1] Add focus state transitions to inputs in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (::ng-deep .p-inputtext:focus, transition 200ms)

**Checkpoint**: Form uses PrimeNG components, has responsive grid, and basic visual hierarchy

---

## Phase 3: User Story 2 - Animações Sutis e Feedback Visual (Priority: P1) 🎯 MVP

**Goal**: Implementar animações sutis e feedback visual para que usuário entenda o que está acontecendo no sistema.

**Independent Test**: Interagir com formulário e verificar transições suaves em focus, mensagens animadas com fadeIn, campos com erro exibem shake animation, botão mostra loading state.

### Implementation for User Story 2

- [X] T014 [P] [US2] Import Angular Animations in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (trigger, state, style, transition, animate, keyframes from @angular/animations)
- [X] T015 [US2] Add @fadeIn animation trigger in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (transition :enter, 300ms cubic-bezier, opacity 0→1, translateY -10px→0)
- [X] T016 [US2] Add @shake animation trigger in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (transition *→error, 500ms keyframes, translateX 0→-10→10→-10→0)
- [X] T017 [US2] Add @slideIn animation trigger in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (transition :enter/:leave, 300ms, height 0→*, opacity 0→1)
- [X] T018 [US2] Add fieldErrorState signal in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (signal<Record<string, 'normal'|'error'>>({}))
- [X] T019 [US2] Add triggerFieldError() method in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (update fieldErrorState, setTimeout reset after 500ms)
- [X] T020 [US2] Update onSubmit() to trigger shake on invalid fields in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.ts (forEach controls, call triggerFieldError if invalid)
- [X] T021 [US2] Bind [@fadeIn] to messages in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (p-message *ngIf erro/sucesso)
- [X] T022 [US2] Bind [@shake] to form inputs in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html ([@shake]="fieldErrorState()['fieldName']" on p-calendar, p-multiSelect, input)
- [X] T023 [US2] Bind [@slideIn] to conditional sections in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (*ngIf recorrenteFlag section)
- [X] T024 [US2] Add loading state to submit button in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html ([loading]="carregando()" [disabled]="form.invalid")
- [X] T025 [US2] Add hover effects CSS in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (::ng-deep .p-inputtext:hover, .p-button:hover transform translateY(-2px))

**Checkpoint**: All interactions have smooth animations, loading states, and error feedback

---

## Phase 4: User Story 3 - Cards e Agrupamento Visual (Priority: P2)

**Goal**: Separar seções do formulário em cards visuais distintos para facilitar navegação.

**Independent Test**: Visualizar formulário e identificar cards distintos com sombras, bordas, espaçamento adequado, e hover effects.

### Implementation for User Story 3

- [X] T026 [P] [US3] Add card elevation styles to fieldsets in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (::ng-deep .form-card { box-shadow: $shadow-base; border-radius: $border-radius-lg; })
- [X] T027 [P] [US3] Add hover elevation effect in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (.form-card:hover { box-shadow: $shadow-md; transform: translateY(-2px); })
- [X] T028 [US3] Add styleClass="form-card" to all p-fieldset in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html
- [X] T029 [US3] Add header icons to fieldsets in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (ng-template pTemplate="header", i.pi-calendar, i.pi-users, i.pi-refresh, i.pi-info-circle)
- [X] T030 [US3] Style fieldset headers in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (::ng-deep .p-fieldset-legend { padding: $space-4; border-bottom: 1px solid $surface-border; })

**Checkpoint**: Form sections are visually grouped in elevated cards with clear separation

---

## Phase 5: User Story 4 - Sistema de Cores e Hierarquia Visual (Priority: P2)

**Goal**: Implementar paleta de cores consistente e hierarquia visual clara usando severity attributes.

**Independent Test**: Verificar que botão primário usa cor de destaque, botão secundário usa cor neutra, mensagens usam cores de status corretas, e contraste mínimo 4.5:1.

### Implementation for User Story 4

- [X] T031 [P] [US4] Add severity="primary" to submit button in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (p-button "Criar Evento")
- [X] T032 [P] [US4] Add severity="secondary" [outlined]="true" to cancel button in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (p-button "Cancelar")
- [X] T033 [P] [US4] Add severity attributes to messages in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (p-message severity="error"/"success"/"warn"/"info")
- [X] T034 [US4] Style required field indicators in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (.text-red-500 { color: $error-color; })
- [X] T035 [US4] Add error state styling in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (::ng-deep .ng-invalid.ng-touched { border-color: $error-color !important; })
- [X] T036 [US4] Style button states in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (::ng-deep .btn-submit:hover { background: $primary-hover; })
- [X] T037 [US4] Add message styling with border-left accent in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (::ng-deep .p-message-error { border-left: 4px solid $error-color; })

**Checkpoint**: Color hierarchy is clear, CTAs stand out, status colors are consistent

---

## Phase 6: User Story 5 - Skeleton Loaders (Priority: P3)

**Goal**: Implementar skeleton loaders para melhorar perceived performance durante carregamento de dados.

**Independent Test**: Simular carregamento lento de grupos e verificar skeleton loaders aparecem após 500ms com animação shimmer.

### Implementation for User Story 5

- [X] T038 [P] [US5] Replace grupos loading state with skeleton in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (app-skeleton-loader *ngIf="carregandoGrupos()" height="3rem")
- [X] T039 [P] [US5] Add [@fadeIn] to multiselect appearance in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (p-multiSelect *ngIf="!carregandoGrupos()" [@fadeIn])
- [ ] T040 [US5] Add skeleton for evento templates if applicable in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (if template loading exists)
- [ ] T041 [US5] Style skeleton animation in GestaoEventos.Angular/src/app/shared/components/skeleton-loader/skeleton-loader.component.ts (verify animation="wave" is default)

**Checkpoint**: Loading states use skeleton loaders instead of spinners, perceived performance improved

---

## Phase 7: User Story 6 - Responsividade e Layout Adaptativo (Priority: P2)

**Goal**: Garantir que formulário se adapta perfeitamente a mobile, tablet e desktop.

**Independent Test**: Testar em viewport 375px (mobile), 768px (tablet), 1024px+ (desktop) verificando grid adapta, botões full-width mobile, touch targets ≥44px.

### Implementation for User Story 6

- [X] T042 [P] [US6] Add responsive padding to container in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (class="px-3 md:px-6 lg:px-8")
- [X] T043 [P] [US6] Add responsive button layout in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (div class="flex flex-column md:flex-row gap-3", styleClass="w-full md:w-auto" on buttons)
- [X] T044 [US6] Add mobile touch target sizing in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (@media (max-width: 767px) { .p-button { min-height: 44px; } })
- [X] T045 [US6] Add mobile input sizing in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (@media (max-width: 767px) { .p-inputtext { min-height: 44px; } })
- [X] T046 [US6] Reduce card padding on mobile in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.scss (@media (max-width: 767px) { .p-fieldset-content { padding: $space-4; } })
- [ ] T047 [US6] Test responsive breakpoints manually (375px, 768px, 1024px, 1920px)

**Checkpoint**: Form is fully responsive across all device sizes

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, accessibility validation, performance testing

- [ ] T048 [P] Add page header with title in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (h1 "Criar Novo Evento", p subtitle)
- [ ] T049 [P] Add aria-labels to icon-only buttons if any exist in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html
- [ ] T050 [P] Verify tab order is logical in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (test keyboard navigation)
- [X] T051 [P] Add error message with icon transitions in GestaoEventos.Angular/src/app/libs/adm/eventos/form/evento-form.component.html (small.p-error with [@fadeIn])
- [ ] T052 Run Lighthouse audit for accessibility (target ≥90/100)
- [ ] T053 Run Lighthouse audit for performance (target ≥90/100, FCP <1.5s)
- [ ] T054 Test dark mode rendering (verify colors adapt correctly)
- [ ] T055 Manual UX testing with real users (5+ users, satisfaction survey)

**Checkpoint**: All success criteria met, ready for production

---

## Summary

**Total Tasks**: 55  
**By User Story**:
- Setup: 5 tasks
- US1 (P1 - MVP): 8 tasks (Interface Visual)
- US2 (P1 - MVP): 12 tasks (Animações)
- US3 (P2): 5 tasks (Cards)
- US4 (P2): 7 tasks (Cores)
- US5 (P3): 4 tasks (Skeleton)
- US6 (P2): 6 tasks (Responsividade)
- Polish: 8 tasks

**MVP Scope**: Setup + US1 + US2 = 25 tasks (2-3 hours)  
**Full Feature**: All 55 tasks (4-6 hours estimated)

**Parallel Opportunities**:
- Phase 1: T002, T003, T004 can run in parallel (different files)
- Phase 2: T006, T007 imports in parallel
- Phase 4: T026, T027 styles in parallel
- Phase 5: T031, T032, T033 HTML changes in parallel
- Phase 6: T038, T039 template changes in parallel
- Phase 7: T042, T043 layout changes in parallel
- Phase 8: T048, T049, T050, T051 polish tasks in parallel

**Dependencies**:
- US1 must complete before US2 (animations need PrimeNG components in place)
- US3, US4, US5, US6 are independent - can implement in any order after US1+US2
- Polish phase requires all user stories complete

**Implementation Strategy**:
1. Complete Setup + US1 + US2 for MVP (deliverable increment)
2. Add US3 + US4 + US6 for full P2 features (production-ready)
3. Add US5 for polish (nice-to-have P3)
4. Complete Phase 8 for final validation

**Success Validation**: Use checklist in [spec.md](./spec.md#success-criteria) (SC-001 to SC-010)
