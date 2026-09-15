# Phase 1 Implementation Plan: Backend Use Cases & Validators

**Status**: Ready for Implementation  
**Duration**: ~4-5 days  
**Tasks**: 16 total (T001-T015 + T032-A)

---

## Task Breakdown

### User Story 1: Estrutura Management (T001-T003)

#### T001: Complete CriarEstruturaUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/Estrutura/Create/CreateEstruturaHandler.cs`
- **Current State**: Handler exists but may need enhancement for:
  - Validate unique name per usuário
  - Validate papéis array (1-10 níveis required)
  - Assign usuário as owner/admin papel
  - Set initial timestamps (created_at, updated_at)
- **Changes Needed**:
  - Add business logic validation before mapping
  - Call EstruturaValidator.ValidateCreate()
  - Ensure default papel assignments
  - Return proper error responses

#### T002: Create AtualizarEstruturaUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/Estrutura/Update/` [NEW]
- **Deliverables**:
  - `UpdateEstruturaCommand.cs` - command with estrutura data + usuarioId
  - `UpdateEstruturaHandler.cs` - handler with:
    - Validate ownership/permissions
    - Validate updated fields
    - Transaction-safe updates
    - Audit trail (who changed what, when)
- **Business Rules**:
  - Only owner can update
  - Cannot delete last papel
  - Preserve creation timestamp
  - Track all changes in audit

#### T003: Create Estrutura Validators
- **File**: `GestaoEventos.API/src/GestaoEventos.Core/Validators/EstruturaValidator.cs` [NEW]
- **Validations**:
  - `ValidateCreate()`: Name not empty, 1-10 papéis, each papel has name + cor
  - `ValidateUpdate()`: Same as create + ensure ownership
  - `ValidateName()`: Unique per usuário, 3-255 chars
  - `ValidatePapeis()`: 1-10 items, each with unique name

---

### User Story 2: Grupo Management (T004-T007)

#### T004: Complete CriarGrupoUseCase with Hierarchy Val

idation
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/Grupos/Create/CreateGrupoHandler.cs`
- **Changes**:
  - Validate parent grupo exists (if specified)
  - Validate hierarchy depth (<20 levels)
  - Prevent circular references (parent cannot be descendent)
  - Call GrupoValidator
  - Auto-assign responsável (from context)

#### T005: Create ObterHierarquiaGruposUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/Grupos/ObterHierarquia/` [NEW]
- **Deliverables**:
  - `GetGrupoHierarchyQuery.cs` - query with estruturaId
  - `GetGrupoHierarchyHandler.cs` - handler that:
    - Returns tree structure (parent + children nested)
    - Includes grupo members count
    - Includes event count per grupo
    - Filters by parent (for drill-down navigation)
  - `GrupoHierarchyDto.cs` - DTO with nested children
- **Response Format**:
  ```json
  {
    "id": "grupo-id",
    "nome": "Grupo Principal",
    "children": [
      {
        "id": "child-1",
        "nome": "Subgrupo 1",
        "children": [],
        "membrosCount": 5,
        "eventosCount": 2
      }
    ]
  }
  ```

#### T006: Create AdicionarResponsavelGrupoUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/ResponsavelGrupo/Adicionar/` [NEW]
- **Deliverables**:
  - `AdicionarResponsavelCommand.cs` - grupoId + responsvelIds[] + motivoConvite
  - `AdicionarResponsavelHandler.cs` - adds multiple responsáveis (batch operation)
  - Validates permissions (only current responsável can add)
  - Sends invites to new responsáveis
- **Business Rules**:
  - Prevent duplicates (user already responsável)
  - Validate usuário id exists
  - Create Convite records with status=PENDENTE
  - Log change to audit trail

#### T007: Create Grupo Validators
- **File**: `GestaoEventos.API/src/GestaoEventos.Core/Validators/GrupoValidator.cs` [NEW]
- **Validations**:
  - `ValidateCreate()`: Name not empty, parent exists, hierarchy valid
  - `ValidateHierarchy()`: No circular refs, max 20 levels
  - `ValidateName()`: Non-empty, unique within parent grupo
  - `ValidateResponsavel()`: User exists, not duplicate
  - `ValidateRelations()`: Parent-child consistency

---

### User Story 3: EventoTemplate Management (T008-T010 + T032-A)

#### T008: Complete CriarTemplateEventoUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/EventoTemplates/Create/CreateEventoTemplateHandler.cs`
- **Changes**:
  - Validate ALL campos defined
  - Enforce **AT LEAST 1 field must be LIBERADO** (unlocked)
  - Validate campo restrictions:
    - If TRAVADO: cannot edit after evento creation
    - If LIBERADO: participants can edit
  - Call EventoTemplateValidator.ValidateCreate()
  - Create audit entry for field locks

#### T009: Create ValidarPermissõesTemplateUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/EventoTemplates/ValidarPermissoes/` [NEW]
- **Deliverables**:
  - `ValidarPermissoesCampoCommand.cs` - template + usuario + field
  - `ValidarPermissoesCampoHandler.cs` - checks:
    - Is campo TRAVADO? Only owner/admin can modify
    - Is campo LIBERADO? Anyone can modify
    - Return { canEdit: boolean, reason: string }
- **Response**:
  ```json
  {
    "canEdit": false,
    "reason": "Campo 'Local' está travado neste template",
    "lockedBy": "admin@empresa.com",
    "lockedAt": "2026-02-15T10:30:00Z"
  }
  ```

#### T010: Create EventoTemplate Validators
- **File**: `GestaoEventos.API/src/GestaoEventos.Core/Validators/EventoTemplateValidator.cs` [NEW]
- **Validations**:
  - `ValidateCreate()`: At least 1 field LIBERADO, all campos have names
  - `ValidateCampos()`: Each campo named, lock status specified
  - `ValidateLockState()`: Ensure not all campos TRAVADO
  - `ValidateUpdate()`: Cannot change lock state after eventos created (FR-028)

#### T032-A: Create SincronizarEventosTemplateUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/EventoTemplates/Sincronizar/` [NEW]
- **Purpose**: Per clarification - Sync template updates to FUTURE events only
- **Deliverables**:
  - `SincronizarEventosTemplateCommand.cs` - templateId + usuarioId
  - `SincronizarEventosTemplateHandler.cs` - handler that:
    - Finds all eventos with this template
    - ONLY updates if: `data_inicio >= today` AND `status != INICIADO && status != FINALIZADO`
    - Applies template field changes
    - Logs which eventos synced vs skipped
- **Business Rules**:
  - Does NOT affect past events
  - Does NOT affect in-progress or finalized events
  - Preserves existing participant data
  - Transaction: All or nothing per grupo
  - Notify affected users of changes

---

### User Story 4: Evento & Participação Management (T011-T015)

#### T011: Create RegistrarPresencasEmMassaUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/Participacoes/RegistrarEmMassa/` [NEW]
- **Purpose**: Bulk register attendance for multiple participants
- **Deliverables**:
  - `RegistrarPresencasEmMassaCommand.cs` - eventoId + [{ usuarioId, status }]
  - `RegistrarPresencasEmMassaHandler.cs` - batch operation:
    - Validate all usuários exist and are participants
    - Create/update Presenca records
    - Use transaction (all or nothing)
    - Return summary: { created: 5, updated: 3, errors: [] }
- **Status Options**: PRESENTE, AUSENTE, JUSTIFICADO, NAO_RESPONDEU

#### T012: Create IniciarEventoUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/Eventos/Iniciar/` [NEW]
- **Purpose**: Mark evento status=INICIADO
- **Deliverables**:
  - `IniciarEventoCommand.cs` - eventoId + usuarioId
  - `IniciarEventoHandler.cs` - handler:
    - Validate user is owner/admin
    - Check current status is CRIADO (not yet started)
    - Update evento.status = INICIADO
    - Set evento.data_inicio_real = now
    - Lock all template fields (TRAVADO)
    - Create audit entry
- **Permissions**: Only evento creator/estrutura admin

#### T013: Create FinalizarEventoUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/Eventos/Finalizar/` [NEW]
- **Purpose**: Mark evento status=FINALIZADO + trigger metrics
- **Deliverables**:
  - `FinalizarEventoCommand.cs` - eventoId + usuarioId
  - `FinalizarEventoHandler.cs` - handler:
    - Validate status=INICIADO
    - Update evento.status = FINALIZADO
    - Set evento.data_fim_real = now
    - Call MetricasService to calculate attendance
    - Trigger notifications
    - Create audit entry
- **Metrics Trigger**: Calculate taxa_presenca immediately

#### T014: Create Evento & Presença Validators
- **File**: `GestaoEventos.API/src/GestaoEventos.Core/Validators/EventoValidator.cs` [NEW]
- **Validations**:
  - `ValidateCreate()`: Title not empty, data valid, duração > 0, ≥1 grupo
  - `ValidateStatusTransition()`: Correct flow (CRIADO → INICIADO → FINALIZADO)
  - `ValidatePresencaRegistration()`: Usuário is participant, status valid
  - `ValidateBulkRegistration()`: All usuários exist in evento

#### T015: Create EnviarConviteExternoUseCase
- **File**: `GestaoEventos.API/src/GestaoEventos.UseCases/Eventos/EnviarConvite/` [NEW]
- **Purpose**: Invite external participant via email with token
- **Deliverables**:
  - `EnviarConviteExternoCommand.cs` - eventoId + emailExterno + nome
  - `EnviarConviteExternoHandler.cs` - handler:
    - Generate secure token (JWT or encrypted UUID)
    - Store Convite record with status=PENDENTE
    - Send email with link: `https://app.com/eventos/{eventoId}/responder?token={token}`
    - Return convite ID
    - Token expires in 30 days
  - `ConviteExternoDto.cs` - response DTO
- **Email Content**:
  - Convite subject: "Você foi convidado para {eventoNome}"
  - Body: Link para responder sim/não com token
  - Link válido por 30 dias

---

## Implementation Sequence

### Week 1: Estrutura & Grupo (T001-T007)
1. **Day 1**: Create validators folder + EstruturaValidator + GrupoValidator
2. **Day 2**: Enhance CreateEstruturaHandler, create UpdateEstruturaHandler + command
3. **Day 3**: Create ObterHierarquiaGruposHandler + handler
4. **Day 4**: Create AdicionarResponsavelGrupoHandler, test hierarchy queries
5. **Day 5**: Integration testing, bug fixes

### Week 2: Templates & Eventos (T008-T015)
1. **Day 1**: Enhance CreateTemplateHandler, create EventoTemplateValidator
2. **Day 2**: Create ValidarPermissoesCampoHandler, SincronizarEventosTemplateHandler
3. **Day 3**: Create InitiarEventoUseCase, FinalizarEventoUseCase
4. **Day 4**: Create RegistrarPresencasEmMassaHandler, EnviarConviteExternoHandler
5. **Day 5**: Create EventoValidator, test all event flows

---

## Testing Strategy

### Unit Tests (Per Handler)
```
Tests/
├── Estrutura/
│   ├── CreateEstruturaHandlerTests.cs
│   ├── UpdateEstruturaHandlerTests.cs
│   └── EstruturaValidatorTests.cs
├── Grupo/
│   ├── GetGrupoHierarchyHandlerTests.cs
│   ├── AdicionarResponsavelHandlerTests.cs
│   └── GrupoValidatorTests.cs
├── EventoTemplate/
│   ├── SincronizarEventosTemplateHandlerTests.cs
│   └── EventoTemplateValidatorTests.cs
└── Evento/
    ├── RegistrarPresencasHandlerTests.cs
    ├── IniciarEventoHandlerTests.cs
    ├── FinalizarEventoHandlerTests.cs
    └── EnviarConviteHandlerTests.cs
```

### Integration Tests
- Test hierarchy queries with complex nesting
- Test transaction rollback on constraint violations
- Test audit trail creation
- Test email sending integration

### Manual Testing Scenarios
1. Create estrutura → Add grupos → Create template → Create evento → Register presences → Finalize
2. Template sync: Create evento, start it, update template, verify sync skipped in-progress
3. Hierarchy drill-down: Query nested grupos, expand/collapse tree

---

## Acceptance Criteria

✅ **All 16 tasks implemented** (T001-T015 + T032-A)  
✅ **All validators in place** and called before operations  
✅ **Hierarchy queries work** with N-level nesting  
✅ **Template sync** correctly filters future-only eventos  
✅ **Transactions atomic** for batch operations  
✅ **Audit trail** tracked for all write operations  
✅ **Error responses** include detailed validation errors  
✅ **90%+ code coverage** on business logic

---

## Dependencies & Prerequisites

### Required Before Starting
- ✅ Phase 0.5: Design System & Context (already complete)
- ✅ Existing EF Core models + DbContext
- ✅ Existing repositories + UnitOfWork
- ✅ MediatR + AutoMapper configured

### External Dependencies
- SendGrid or SMTP for email (T015)
- Swagger/OpenAPI for API docs

---

## Files to Create/Modify Summary

| Category | Count | Details |
|----------|-------|---------|
| **New Use Cases** | 10 | Create handlers for Update, Hierarchy, Sync, Presences, Invite |
| **New Commands/Queries** | 10 | DTOs for each new use case |
| **New Validators** | 4 | Estrutura, Grupo, EventoTemplate, Evento validators |
| **Modified Handlers** | 6 | Enhance existing Create handlers with validation |
| **Total New Files** | ~30 | (handlers + commands + validators + dtos) |

---

## Rollout Plan

1. ✅ Phase 0.5 (Design System & Context) - COMPLETE
2. ⏳ Phase 1 (Backend Use Cases) - START NOW
3. ⏳ Phase 2 (Metrics) - Can start after Phase 1 day 3
4. ⏳ Phase 3 (Frontend Pages) - Can start after Phase 1 complete
5. ⏳ Phase 4 (Frontend Components) - Can start after Phase 3 day 2
6. ⏳ Phase 5 (Integration) - After all components ready
7. ⏳ Phase 6 (Tests & Polish) - Final validation

**Parallel Opportunities**: Phase 1 + 2 can run in parallel after day 3 of Phase 1

---

**Generated**: 2026-02-15  
**Status**: Ready for Development  
**Next Step**: Start with T001 (Complete CriarEstruturaUseCase)
