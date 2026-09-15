# Tasks: Evento Form Improvements

**Input**: Design documents from `/specs/001-evento-form-improvements/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/

**Tests**: Sem testes nesta iteração conforme constitution e clarificações

**Organization**: Tasks organizadas por user story para permitir implementação e teste independentes

---

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **Checkbox**: ALWAYS start with `- [ ]`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2) - REQUIRED for user story tasks
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificar que estrutura base existe e está correta

- [X] T001 Verificar que PrimeNG está instalado (package.json deve conter primeng@17+)
- [X] T002 Verificar que HelperJson existe em src/app/shared/helpers/helper-json/helper-json.ts
- [X] T003 Verificar que HelperHttp existe em src/app/shared/helpers/helper-http/helper-http.ts
- [X] T004 Verificar que ContextService existe em src/app/core/services/context.service.ts

**Checkpoint**: ✅ Infraestrutura base confirmada - implementação pode começar

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure que DEVE estar completa antes de qualquer user story

**⚠️ CRITICAL**: Nenhum trabalho de user story pode começar até esta fase estar completa

- [X] T005 [P] Verificar/criar evento.model.ts em src/app/core/models/evento.model.ts (interfaces Evento, EventoFormData, TipoRecorrencia)
- [X] T006 [P] Verificar/criar grupo.model.ts em src/app/core/models/grupo.model.ts (interface Grupo)
- [X] T006.5 [P] Verificar/criar grupo.service.ts em src/app/core/services/grupo.service.ts (se não existir, criar com método listarPorEstrutura)
- [X] T007 Verificar/criar evento-api.service.ts em src/app/shared/apis/evento/evento-api.service.ts (se não existir, criar estrutura base)
- [X] T008 Verificar/criar evento.service.ts em src/app/core/services/evento.service.ts (se não existir, criar estrutura base)
- [X] T009 Adicionar AuthGuard às rotas de evento em src/app/app.routes.ts

**Checkpoint**: ✅ Foundation ready - user story implementation pode começar em paralelo

---

## Phase 3: User Story 1 - Criar Evento com Sucesso (Priority: P0 - BLOQUEADOR) 🎯 MVP

**Goal**: Corrigir erro 400 ao criar evento - usuário consegue criar evento básico com sucesso

**Independent Test**: Preencher título, data, hora, selecionar grupos e clicar em "Criar". Sistema deve retornar sucesso 201.

**Why MVP**: Bloqueia totalmente a funcionalidade - taxa de erro atual é 100%

### Implementation for User Story 1

- [X] T010 [P] [US1] Implementar HelperJson.toSnakeCase() no eventoApiService.create() em src/app/shared/apis/evento/evento-api.service.ts
- [X] T011 [P] [US1] Implementar HelperJson.toCamelCase() no response do eventoApiService.create() em src/app/shared/apis/evento/evento-api.service.ts
- [X] T012 [US1] Modificar evento-form.component.ts onSubmit() para incluir usuario_id do ContextService em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T013 [US1] Modificar evento-form.component.ts onSubmit() para incluir estrutura_id (form ou context se único) em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T014 [US1] Implementar combinarDataHora() para criar Date com data + hora em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T015 [US1] Implementar calcularDataFim() baseado em duração (horas + minutos) em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T016 [US1] Converter datas para ISO 8601 usando toISOString() no payload em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T017 [US1] Garantir que grupos_ids é enviado como array (não string) no payload em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T018 [US1] Implementar tratamento de erro 400 com validações no formulário em src/app/libs/adm/evento/form/evento-form.component.ts (usar _.camelCase para mapear err.field)
- [X] T019 [US1] Adicionar mensagem de sucesso e navegação para /eventos após criar em src/app/libs/adm/evento/form/evento-form.component.ts

**Checkpoint**: ✅ User Story 1 completa - usuário consegue criar evento com taxa de erro 0%

---

## Phase 4: User Story 2 - Entender Claramente os Campos de Data (Priority: P1 - CRÍTICO)

**Goal**: Melhorar UX de data/hora - separar visualmente "QUANDO ACONTECE?" de "REPETIR?"

**Independent Test**: Abrir formulário e observar separação visual clara entre data do evento e recorrência

**Why Critical**: UX atual extremamente confusa com campos misturados causa frustração

### Implementation for User Story 2

- [X] T020 [P] [US2] Adicionar fieldset "QUANDO ACONTECE?" com data, hora, duração em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T021 [P] [US2] Adicionar p-calendar para dataInicio com dateFormat dd/mm/yy em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T022 [P] [US2] Adicionar input type="time" para horaInicio em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T023 [P] [US2] Adicionar p-inputNumber para duracaoHoras (0-23, showButtons) em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T024 [P] [US2] Adicionar p-inputNumber para duracaoMinutos (0-59, step 15, showButtons) em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T025 [US2] Implementar calcularHorarioFim() getter que retorna Date calculado em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T026 [US2] Adicionar preview "Horário de término: HH:mm" calculado em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T027 [P] [US2] Adicionar fieldset "REPETIR?" separado visualmente em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T028 [P] [US2] Adicionar p-dropdown para tipoRecorrencia (UNICO, DIARIO, SEMANAL, MENSAL) em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T029 [US2] Adicionar *ngIf para mostrar campos de recorrência apenas se tipo !== UNICO em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T030 [US2] Adicionar p-calendar para dataFimRecorrencia (minDate = dataInicio) em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T031 [US2] Corrigir previewOcorrencias getter para usar Math.min(5, total) em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T032 [US2] Adicionar preview "Mostrando X de Y ocorrências" com lista em src/app/libs/adm/evento/form/evento-form.component.html

**Checkpoint**: ✅ User Story 2 completa - usuários entendem diferença entre data do evento e recorrência

---

## Phase 5: Feature Adicional 1 - Seletor Multi-Grupo (Priority: P2)

**Goal**: Adicionar p-multiSelect para permitir evento em múltiplos grupos simultaneamente

**Independent Test**: Selecionar 3+ grupos, criar evento, verificar backend recebe array grupos_ids

### Implementation

- [X] T033 [P] Adicionar fieldset "PARA QUEM?" no formulário em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T034 [P] Adicionar p-multiSelect com filter, virtualScroll, showToggleAll em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T035 [P] Configurar p-multiSelect optionLabel="nome", optionValue="id" em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T036 [P] Adicionar custom template ng-template para mostrar nome + grupoPaiId em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T037 Implementar carregarGrupos() em ngOnInit() usando grupoService em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T038 Implementar autoSelecionarGrupoSeUnico() se grupos.length === 1 em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T039 Implementar getGrupoPaiNome(grupoPaiId) helper para template em src/app/libs/adm/evento/form/evento-form.component.ts

**Checkpoint**: ✅ Seletor multi-grupo funcional com pesquisa e virtualização

---

## Phase 6: Feature Adicional 2 - Validação de Limite de Ocorrências (Priority: P2)

**Goal**: Validar cliente-side que evento recorrente não gera mais de 365 ocorrências

**Independent Test**: Tentar criar evento diário por 2 anos, ver erro legível antes de enviar ao backend

### Implementation

- [X] T040 Implementar validarLimiteOcorrencias(formData) no eventoService em src/app/core/services/evento.service.ts
- [X] T041 Implementar construirRRule(formData) helper no eventoService em src/app/core/services/evento.service.ts
- [X] T042 Usar RRule.between() para calcular quantidade de ocorrências em src/app/core/services/evento.service.ts
- [X] T043 Retornar ValidationResult { valido, erro?, quantidade? } em src/app/core/services/evento.service.ts
- [X] T044 Chamar validação antes de eventoApiService.create() no eventoService.create() em src/app/core/services/evento.service.ts
- [X] T045 Mostrar mensagem de erro com limite excedido se validação falhar em src/app/libs/adm/evento/form/evento-form.component.ts

**Checkpoint**: ✅ Validação de limite funcional - usuário vê erro claro antes de tentar salvar

---

## Phase 7: Feature Adicional 3 - Validação de Conflitos de Horário (Priority: P2)

**Goal**: Avisar usuário se já existe evento no mesmo horário para os grupos selecionados

**Independent Test**: Criar evento às 20h para grupo X, tentar criar outro às 20h para grupo X, ver modal de aviso

### Implementation

- [X] T046 Implementar listarPorHorario() no eventoApiService usando HelperHttp.toQueryParams() em src/app/shared/apis/evento/evento-api.service.ts
- [X] T047 Implementar verificarConflitos(gruposIds, dataInicio, dataFim) no eventoService em src/app/core/services/evento.service.ts
- [X] T048 Configurar form.valueChanges com debounceTime(500) e distinctUntilChanged em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T049 Implementar switchMap para verificarConflitos() reativamente em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T050 Implementar mostrarModalConflito(eventos) com PrimeNG confirmDialog em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T051 Permitir usuário continuar salvando mesmo com conflito (modal com botão "Continuar") em src/app/libs/adm/evento/form/evento-form.component.ts

**Checkpoint**: ✅ Validação de conflitos funcional - usuário é avisado mas pode continuar

---

## Phase 8: Feature Adicional 4 - Configurações Avançadas (Priority: P3)

**Goal**: Adicionar seção colapsável com 9 checkboxes de permissões avançadas

**Independent Test**: Expandir accordion, marcar checkboxes, verificar valores no payload

### Implementation

- [X] T052 [P] Adicionar p-accordion com accordionTab "Configurações Avançadas" em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T053 [P] Adicionar 9 p-checkbox com binary="true" (permiteConvidados, convidadosPodemConvidar, etc) em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T054 [P] Configurar dependência: convidadosPodemConvidar [disabled]="!form.value.permiteConvidados" em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T055 [P] Adicionar p-inputNumber para limiteParticipantes (opcional, min 1, max 10000) em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T056 Adicionar FormControls para todos os 9 checkboxes no criarFormulario() em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T057 Incluir valores de permissões no payload do onSubmit() em src/app/libs/adm/evento/form/evento-form.component.ts

**Checkpoint**: ✅ Configurações avançadas funcional - usuário pode customizar permissões

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Refinamentos finais, validações, mensagens de erro, acessibilidade

- [X] T058 [P] Adicionar validators no FormGroup (required, maxLength, min, max) em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T059 [P] Implementar validarDataFimRecorrencia() custom validator em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T060 [P] Implementar validarDuracao() custom validator (horas + minutos > 0) em src/app/libs/adm/evento/form/evento-form.component.ts
- [X] T061 [P] Adicionar classes CSS TailwindCSS para fieldsets (border, rounded-lg, p-4, mb-4) em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T062 [P] Adicionar small text com hints para campos complexos em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T063 [P] Testar navegação com Tab e garantir ordem lógica dos campos em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T064 [P] Adicionar aria-labels e labels for= em todos os campos para acessibilidade em src/app/libs/adm/evento/form/evento-form.component.html
- [X] T065 Invalidar cache após criação bem-sucedida no eventoService em src/app/core/services/evento.service.ts
- [ ] T066 Testar fluxo completo end-to-end: login → criar evento → verificar sucesso

**Checkpoint**: ✅ Feature completa e polida - pronta para produção (MVP + UX + Multi-grupo + Config Avançadas)

---

## Dependencies & Parallel Execution

### Dependency Graph (By User Story)

```
Setup (T001-T004)
    ↓
Foundational (T005-T009)
    ↓
    ├─→ User Story 1: Criar Evento (T010-T019) 🎯 MVP
    ├─→ User Story 2: UX Data/Hora (T020-T032)
    ├─→ Feature: Multi-Grupo (T033-T039)
    ├─→ Feature: Limite Ocorrências (T040-T045)
    ├─→ Feature: Conflitos Horário (T046-T051)
    └─→ Feature: Config Avançadas (T052-T057)
        ↓
    Polish (T058-T066)
```

### Parallel Execution Opportunities

**After Foundational Phase**:
- User Story 1 (T010-T019) - MUST complete first (MVP)
- User Story 2 (T020-T032) - Can start after US1
- Feature 1 (T033-T039) - Can run parallel with US2
- Feature 2 (T040-T045) - Can run parallel with US2
- Feature 3 (T046-T051) - Can run parallel with US2
- Feature 4 (T052-T057) - Can run parallel with US2

**Polish Phase**:
- All T058-T064 tasks can run in parallel (different aspects)
- T065-T066 must be sequential

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**Goal**: Get functionality working with minimum features
- ✅ Phase 1: Setup (T001-T004)
- ✅ Phase 2: Foundational (T005-T009)
- ✅ Phase 3: User Story 1 only (T010-T019)
- ✅ Phase 9: Basic polish (T058-T060, T065-T066)

**Result**: Users can create events successfully (0% error rate)

### Full Feature Scope
**Goal**: Complete all user stories and features
- Include MVP + User Story 2 + All Features + Full Polish

### Suggested Delivery Order
1. **Sprint 1** (1-2 days): MVP (US1) → Deploy to staging → Validate
2. **Sprint 2** (1 day): User Story 2 (UX) → Get user feedback
3. **Sprint 3** (1-2 days): Features 1-4 → Polish → Deploy to production

---

## Validation Checklist

Before marking feature as complete:

- [ ] Constitution compliance verified (3-layer, HelperJson usage, Context vs Form)
- [ ] All functional requirements (FR-001 to FR-010) implemented
- [ ] Success criteria met (SC-001 to SC-003)
- [ ] User Story 1 acceptance scenarios passing (3/3)
- [ ] User Story 2 acceptance scenarios passing (3/3)
- [ ] Manual testing checklist complete (quickstart.md)
- [ ] No console errors or warnings
- [ ] Forms accessible via keyboard navigation
- [ ] Error messages clear and actionable
- [ ] Code review by peer completed

---

## Resources

- **Spec**: [spec.md](./spec.md) - User stories and requirements
- **Plan**: [plan.md](./plan.md) - Technical context and architecture
- **Research**: [research.md](./research.md) - 7 technical decisions with rationale
- **Data Model**: [data-model.md](./data-model.md) - Entities and DTOs
- **Contracts**: [contracts/api-contracts.md](./contracts/api-contracts.md) - API endpoints
- **Quickstart**: [quickstart.md](./quickstart.md) - Implementation guide with code examples
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles

---

**Total Tasks**: 66  
**Estimated Time**: 3-5 days (MVP: 1-2 days)  
**Parallel Opportunities**: High (most features independent after foundational phase)  
**MVP Path**: T001-T009 → T010-T019 → T058-T060, T065-T066 (≈25 tasks)
