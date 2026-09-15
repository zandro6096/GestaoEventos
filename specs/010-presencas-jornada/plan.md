# Implementation Plan: Presenças & Jornada Pessoal

**Branch**: `010-presencas-jornada` | **Date**: 2026-03-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-presencas-jornada/spec.md`

---

## Summary

Conectar os componentes frontend já existentes de Jornada e Check-in às APIs reais do backend; adicionar registro de presença em lote no `AcompanharEventoComponent`; implementar filtro por período/grupo na Jornada; criar novo endpoint backend para registro em lote (`POST /api/participacoes-evento/lote`); e entregar UX de alto impacto — animações fluidas, gauge de frequência, empty states emocionais — com o padrão visual do design system.

---

## Technical Context

**Language/Version**: TypeScript / Angular 17 (frontend) | C# 12 / .NET 8 (backend)
**Primary Dependencies**:
  - Frontend: Angular 17 Standalone, PrimeNG 17, TailwindCSS 3, RxJS 7, Signals
  - Backend: FastEndpoints, MediatR, FluentValidation, EF Core, Result pattern
**Storage**: PostgreSQL via EF Core (entidades `ParticipacaoEvento`, `Participacao`, `OcorrenciaEvento` já existem)
**Testing**: Angular (Jasmine/Karma), .NET (xUnit)
**Target Platform**: Web SPA + API REST
**Project Type**: web (frontend Angular + backend .NET)
**Performance Goals**: Jornada carrega em <2s (SC-003); lote de 15 registros em <45s (SC-001); auto check-in <15s (SC-002)
**Constraints**: Sem duplicata de presença (idempotência — SC-005); ajuste pós-evento limitado a 24h para responsável; bulk apenas para responsáveis com `VALIDAR_PRESENCA_GRUPO`
**Scale/Scope**: Telas existentes com dados reais; novo endpoint de lote no backend

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Regra | Status | Observação |
|-------|--------|------------|
| Clean Architecture (Core → UseCases → Infra → Web) | ✅ PASS | Novo endpoint `BulkCreate` seguirá o mesmo padrão de `ParticipacaoEvento/Create.cs` |
| CQRS via MediatR | ✅ PASS | `BulkCreateParticipacaoEventoCommand` será Command novo |
| FastEndpoints (sem Controller MVC) | ✅ PASS | `BulkCreate.cs` em `Web/ParticipacaoEvento/` |
| Object Calisthenics (9 regras) | ✅ PASS | Sem primitivos expostos; 1 nível de indentação; early return |
| FluentValidation | ✅ PASS | Validador específico para lista de participantes |
| Result Pattern | ✅ PASS | Handlers retornam `Result<T>` |
| Frontend 3 camadas obrigatória | ✅ PASS | Component → Business Service → API Service |
| Standalone Components | ✅ PASS | Todos os componentes existentes são standalone |
| Signals para estado local | ✅ PASS | Componentes já usam `signal<>()` |
| PrimeNG como UI library | ✅ PASS | Usar PrimeNG Knob, SelectButton, Checkbox, Toast |
| TailwindCSS para layout | ✅ PASS | Sem CSS custom para spacing/layout |
| Nunca HTTP direto no component | ✅ PASS | Apenas via `JornadaService` e `ParticipacaoService` (Business layer) |

**Resultado pós-design (Phase 1)**: ✅ Sem violações. Design confirma Clean Architecture em todos os artefatos gerados. BulkCreate segue exatamente o padrão do `Create.cs` existente. JornadaService mantém a 3-camada fazendo delegate a JornadaApiService + CacheService.

---

## Project Structure

### Documentation (this feature)

```text
specs/010-presencas-jornada/
├── plan.md              ← Este arquivo
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── participacao-evento.yaml      ← endpoints existentes documentados
│   └── participacao-evento-lote.yaml ← novo endpoint de bulk
└── tasks.md             ← Phase 2 (/speckit.tasks - não criado aqui)
```

### Source Code (repository root)

```text
# Backend — novo endpoint bulk
GestaoEventos.API/src/
├── GestaoEventos.Core/
│   └── Aggregates/ParticipacaoEventoAgrregate/
│       └── (sem mudança de entidade — reaproveitar ParticipacaoEvento)
├── GestaoEventos.UseCases/
│   └── ParticipacaoEventos/
│       └── BulkCreate/
│           ├── BulkCreateParticipacaoEventoCommand.cs
│           └── BulkCreateParticipacaoEventoHandler.cs
└── GestaoEventos.Web/
    └── ParticipacaoEvento/
        ├── BulkCreate.cs
        ├── BulkCreate.BulkCreateParticipacaoEventoRequest.cs
        └── BulkCreate.BulkCreateParticipacaoEventoValidator.cs

# Backend — endpoint frequência por período (novo query param)
GestaoEventos.UseCases/Participacoes/Frequencia/
└── FrequenciaHandler.cs   ← adicionar param `periodo` (7d | 30d | 90d | ano)

# Frontend — wiring JornadaService (remover TODO stubs)
GestaoEventos.Angular/src/app/shared/services/jornada/
└── jornada.service.ts   ← conectar a JornadaApiService (métodos já existem)

# Frontend — CheckinComponent (wiring real API)
GestaoEventos.Angular/src/app/libs/adm/checkin/
├── checkin.component.ts  ← substituir mock por JornadaApiService + ParticipacaoApiService
└── checkin.component.html ← redesign UX premium com animações

# Frontend — JornadaComponent (filtros + UI premium)
GestaoEventos.Angular/src/app/libs/adm/jornada/
├── jornada.component.ts  ← filtro período, filtro grupo, JornadaService wired
└── jornada.component.html ← gauge animado, empty states, cards premium

# Frontend — AcompanharEventoComponent (bulk lote)
GestaoEventos.Angular/src/app/libs/adm/eventos/acompanhar-evento/
└── acompanhar-evento.component.ts ← adicionar bulk checkbox + salvar lote
```

**Structure Decision**: Web application (Angular frontend + .NET backend). Sem novos projetos, sem novos módulos — apenas adições dentro da estrutura existente.

---

## Complexity Tracking

> Sem violações da constituição que precisem de justificativa.

| Decisão | Justificativa |
|---------|--------------|
| Novo endpoint `BulkCreate` (não reusar POST individual em loop) | Loop de N chamadas sob latência alta é inviável para SC-001 (45s); atomic bulk é a única abordagem que garante consistência e performance |
| Frequência com filtro de período via query param (não novo endpoint) | Reaproveitar `GET /api/participacoes/frequencia?periodo=30d` é mais simples e mantém contratos existentes |
| `JornadaService` wire em um único passo (não criar novo service) | Service já existe com a interface certa; apenas remover os stubs Observable e delegar a `JornadaApiService` |
