# Implementation Plan: UX & SaaS Platform Enhancements

**Branch**: `003-ux-saas-improvements` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification com análise UX completa e clarificações de requisitos

## Summary

Esta feature transforma o GestaoEventos em uma plataforma SaaS robusta com UX aprimorada, focando em 3 pilares:

1. **Onboarding & Conversão**: Landing page profissional, wizard guiado, planos Free/Pro visíveis
2. **Visualização Hierárquica**: Organograma em árvore colapsável + drill-down para superiores visualizarem subordinados
3. **Features SaaS**: Integração Mercado Pago (Pix + cartões), limites de uso visíveis, sistema de convites

**Abordagem Técnica**:
- Frontend: Novos componentes Angular standalone com arquitetura de 3 camadas (Component → Business Service → API Service)
- Backend: Novos endpoints FastEndpoints com CQRS para hierarquia, drill-down context, e subscription management
- Integração: Mercado Pago SDK para pagamentos, i18n architecture com ngx-translate (apenas PT-BR ativo no MVP)

**Problema Resolvido**: Dashboard atual mostra erros técnicos, falta contexto hierárquico, não tem sistema de planos/billing, e onboarding inexistente levando a baixa ativação de usuários.

## Technical Context

**Language/Version**: 
- Backend: .NET 8+ (C#)
- Frontend: Angular 17+ (TypeScript, Standalone Components)

**Primary Dependencies**: 
- Backend: FastEndpoints, MediatR, AutoMapper, Entity Framework Core, Mercado Pago SDK
- Frontend: PrimeNG 17+, RxJS, ngx-translate (i18n), HttpClient

**Storage**: 
- PostgreSQL (production)
- SQL Server (dev/local)
- Indexes necessários: hierarquia (árvore), eventos por período (30 dias rolling window)

**Testing**: 
- Backend: xUnit, FluentAssertions, NSubstitute
- Frontend: Jasmine, Karma, Playwright (E2E)

**Target Platform**: 
- Web (responsive desktop-first, mobile-friendly)
- Browsers: Chrome, Firefox, Safari, Edge (últimas 2 versões)

**Project Type**: Web application (Angular SPA + .NET API)

**Performance Goals**:
- Dashboard load: < 2s com dados completos
- API responses: < 500ms p95
- Hierarchical queries: < 1s para estruturas até 500 usuários
- Org chart rendering: < 1s para até 100 nós

**Constraints**:
- Zero erros técnicos visíveis aos usuários (FR-007)
- Drill-down em 3 clicks ou menos (SC-004)
- Mercado Pago PCI compliance (sem armazenar dados de cartão)
- GDPR: export/delete de dados do usuário

**Scale/Scope**:
- 1,000 usuários simultâneos suportados
- Estruturas até 500 membros por organização
- 6 níveis de profundidade hierárquica
- 35 requisitos funcionais (FR-001 a FR-035)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Clean Architecture Compliance
- [ ] Todos os novos endpoints usam FastEndpoints com padrão Create/Update/Delete/GetById/List
- [ ] Commands/Queries separados usando MediatR
- [ ] DTOs mapeados com AutoMapper (snake_case ← camelCase)
- [ ] Aggregates DDD no Core (SubscriptionAggregate, InviteCodeAggregate, DrillDownContextAggregate)
- [ ] Repository pattern na Infrastructure

**Riscos**: Nenhum. Arquitetura existente já segue Clean Architecture.

### ⚠️ Object Calisthenics Compliance  
- [ ] 1 nível de indentação por método
- [ ] Sem palavra `else` (usar guard clauses e pattern matching)
- [ ] Encapsular tipos primitivos (e.g., EventLimitValue, HierarchyDepthValue)
- [ ] Coleções de primeira classe
- [ ] Um ponto por linha
- [ ] Não abreviar nomes
- [ ] Manter entidades pequenas
- [ ] Nenhuma classe com mais de 2 variáveis de instância
- [ ] Sem getters/setters/propriedades públicas (usar Records para DTOs)

**Violações Justificadas**: 
- Org chart component pode ter > 2 variáveis (state, config, data) - componente de UI complexo necessita state management
- Drill-down service pode ter > 2 variáveis (current context, history, permissions) - gerenciamento de sessão requer estado

### ✅ Frontend 3-Layer Architecture
- [ ] Components: Apenas apresentação, injeção de Business Services
- [ ] Business Services: Lógica de negócio + cache + validações (e.g., `subscription.service.ts`)
- [ ] API Services: HTTP puro sem lógica (e.g., `subscription-api.service.ts`)
- [ ] Todos os serviços em `libs/` ou `shared/` conforme escopo

**Riscos**: Nenhum. Padrão já estabelecido no projeto.

### ✅ Separation of Concerns
- [ ] Guards apenas para auth/permissions (não lógica de negócio)
- [ ] Interceptors apenas para HTTP concerns (headers, errors, retry)
- [ ] Resolvers apenas para pré-carregar dados de rota
- [ ] Services não têm responsabilidades de UI

**Riscos**: Drill-down guard pode ser tentado para lógica de contexto - documentar claramente que isso vai em service.

### 🟡 External Dependencies
**Necessita Aprovação**:
- Mercado Pago SDK (backend + frontend) - integração de third-party para pagamentos
- ngx-translate ou Angular i18n - biblioteca i18n adicional
- Biblioteca de org chart (ex: d3-hierarchy, ngx-graph, ou PrimeNG TreeTable customizado)

**Justificativa**: 
- Mercado Pago: Decisão tomada na clarificação (melhor para mercado brasileiro, Pix integrado)
- i18n: Decisão clarificada - arquitetura preparada mas apenas PT-BR no MVP
- Org chart: Visualização complexa requer biblioteca especializada; avaliar PrimeNG nativo primeiro antes de third-party

**Aprovação Pendente**: Escolha de biblioteca para org chart visualization (pesquisa Phase 0)

### ✅ Database Migrations
- [ ] Novas tabelas: `Subscriptions`, `InviteCodes`, `DrillDownContexts`, `AuditLogs`
- [ ] Índices para queries hierárquicas otimizadas
- [ ] Índice composto para rolling 30-day event queries
- [ ] Soft delete para `Users` e `Events` (GDPR compliance)

**Riscos**: Nenhum. Migrações seguirão padrão EF Core existente.

### ⚠️ Breaking Changes
**Potenciais Impactos**:
- API de eventos pode mudar resposta para incluir `alias` e `permissions`
- Dashboard endpoint precisa retornar contexto adicional (role, structure, group)
- Autenticação pode precisar de token refresh para incluir subscription info

**Mitigação**: Versionamento de API (e.g., `/api/v2/eventos`) ou adicionar campos opcionais mantendo compatibilidade.

**Decisão**: Adicionar campos opcionais na v1, considerar v2 apenas se mudanças estruturais profundas.

### ✅ Gate Summary
- **APPROVED**: Pode prosseguir para Phase 0
- **PENDING**: Decisão de biblioteca de org chart (researchar em Phase 0)
- **VIOLATIONS**: 2 justificadas (org chart component state, drill-down service state)

## Project Structure

### Documentation (this feature)

```text
specs/003-ux-saas-improvements/
├── spec.md              # Feature specification (✅ completed & clarified)
├── plan.md              # This file - Implementation plan
├── research.md          # Phase 0: Technology decisions & best practices
├── data-model.md        # Phase 1: Entity relationships & database schema
├── quickstart.md        # Phase 1: Getting started guide for developers
├── contracts/           # Phase 1: API contracts (OpenAPI specs)
│   ├── subscription-api.yaml
│   ├── invite-api.yaml
│   ├── hierarchy-api.yaml
│   └── drill-down-api.yaml
├── tasks.md             # Phase 2: Decomposed implementation tasks
├── checklists/
│   └── requirements.md  # Quality checklist (✅ completed)
└── ux-analysis-summary.md  # UX findings from MCP Playwright analysis
```

### Source Code - Backend (.NET)

```text
GestaoEventos.API/src/
├── GestaoEventos.Core/           # Domain Layer
│   ├── Aggregates/
│   │   ├── SubscriptionAggregate.cs      # NEW - Subscription + Plan logic
│   │   ├── InviteCodeAggregate.cs        # NEW - Invitation system
│   │   ├── DrillDownContextAggregate.cs  # NEW - Hierarchical drill-down
│   │   └── AuditLogAggregate.cs          # NEW - Audit trail
│   ├── Interfaces/
│   │   ├── ISubscriptionRepository.cs
│   │   ├── IInviteCodeRepository.cs
│   │   ├── IDrillDownContextRepository.cs
│   │   └── IAuditLogRepository.cs
│   ├── Services/
│   │   ├── PermissionConflictResolver.cs  # NEW - Most restrictive rule
│   │   └── HierarchyTraversalService.cs   # NEW - Tree navigation logic
│   └── ValueObjects/
│       ├── EventLimit.cs                  # NEW - Rolling 30-day window
│       ├── HierarchyDepth.cs              # NEW - Max 6 levels
│       └── PlanType.cs                    # NEW - Free/Pro enum
│
├── GestaoEventos.UseCases/       # Application Layer
│   ├── Subscription/
│   │   ├── Commands/
│   │   │   ├── UpgradePlanCommand.cs
│   │   │   ├── UpgradePlanHandler.cs
│   │   │   ├── CancelSubscriptionCommand.cs
│   │   │   └── ProcessPaymentWebhookCommand.cs  # Mercado Pago
│   │   └── Queries/
│   │       ├── GetSubscriptionStatusQuery.cs
│   │       ├── GetUsageStatsQuery.cs
│   │       └── GetBillingHistoryQuery.cs
│   ├── Invite/
│   │   ├── Commands/
│   │   │   ├── CreateInviteCommand.cs
│   │   │   ├── AcceptInviteCommand.cs
│   │   │   └── RevokeInviteCommand.cs
│   │   └── Queries/
│   │       ├── ValidateInviteTokenQuery.cs
│   │       └── ListPendingInvitesQuery.cs
│   ├── Hierarchy/
│   │   ├── Queries/
│   │   │   ├── GetOrganizationChartQuery.cs
│   │   │   ├── GetDrillDownContextQuery.cs
│   │   │   └── GetSubordinateEventsQuery.cs
│   │   └── Commands/
│   │       ├── SetDrillDownContextCommand.cs
│   │       └── ClearDrillDownContextCommand.cs
│   └── Onboarding/
│       ├── Commands/
│       │   ├── CreateStructureCommand.cs
│       │   └── CompleteOnboardingCommand.cs
│       └── Queries/
│           └── GetOnboardingStatusQuery.cs
│
├── GestaoEventos.Infrastructure/ # Infrastructure Layer
│   ├── Data/
│   │   ├── Configurations/
│   │   │   ├── SubscriptionConfiguration.cs
│   │   │   ├── InviteCodeConfiguration.cs
│   │   │   └── AuditLogConfiguration.cs
│   │   └── Migrations/
│   │       └── [timestamp]_AddSubscriptionTables.cs
│   ├── Repositories/
│   │   ├── SubscriptionRepository.cs
│   │   ├── InviteCodeRepository.cs
│   │   └── DrillDownContextRepository.cs
│   └── Services/
│       ├── MercadoPagoService.cs          # NEW - Payment integration
│       ├── EmailService.cs                # Existing - for invites
│       └── AuditLogService.cs             # NEW - Compliance logging
│
└── GestaoEventos.Web/            # Presentation Layer (FastEndpoints)
    ├── Subscription/
    │   ├── GetStatus.cs
    │   ├── Upgrade.cs
    │   ├── GetUsage.cs
    │   ├── GetBillingHistory.cs
    │   └── ProcessWebhook.cs              # Mercado Pago callback
    ├── Invite/
    │   ├── Create.cs
    │   ├── Validate.cs
    │   ├── Accept.cs
    │   ├── Revoke.cs
    │   └── List.cs
    ├── Hierarchy/
    │   ├── GetChart.cs
    │   ├── GetSubordinateEvents.cs
    │   └── SetDrillDownContext.cs
    └── Onboarding/
        ├── GetStatus.cs
        ├── CreateStructure.cs
        └── Complete.cs
```

### Source Code - Frontend (Angular)

```text
GestaoEventos.Angular/src/app/
├── libs/
│   ├── public/
│   │   ├── landing/                       # NEW - Landing page
│   │   │   ├── landing.component.ts
│   │   │   ├── landing.component.html
│   │   │   ├── landing.component.scss
│   │   │   └── components/
│   │   │       ├── pricing-tiers/
│   │   │       ├── features-showcase/
│   │   │       └── testimonials/
│   │   ├── onboarding/                    # ENHANCE - Wizard multi-step
│   │   │   ├── onboarding.component.ts
│   │   │   └── steps/
│   │   │       ├── welcome-step/
│   │   │       ├── structure-creation-step/
│   │   │       ├── group-setup-step/
│   │   │       └── completion-step/
│   │   └── aceitar-convite/              # ENHANCE - Better UX
│   │       └── aceitar-convite.component.ts
│   │
│   └── adm/
│       ├── dashboard/                     # ENHANCE - Context + Quick Actions
│       │   ├── dashboard.component.ts
│       │   └── widgets/
│       │       ├── context-header/        # NEW - Role, structure, group
│       │       ├── todays-events/         # NEW - Quick actions
│       │       ├── upcoming-events/       # NEW - Next 7 days
│       │       └── pending-attendance/    # NEW - Action required
│       │
│       ├── hierarchy/                     # NEW - Org chart + drill-down
│       │   ├── hierarchy.component.ts
│       │   ├── components/
│       │   │   ├── org-chart/            # Tree visualization
│       │   │   ├── drill-down-breadcrumb/
│       │   │   └── subordinate-view/
│       │   └── services/
│       │       └── drill-down.service.ts  # Business logic
│       │
│       ├── subscription/                  # NEW - Billing & plan management
│       │   ├── subscription.component.ts
│       │   ├── components/
│       │   │   ├── plan-selector/
│       │   │   ├── usage-meter/
│       │   │   ├── billing-history/
│       │   │   └── payment-form/         # Mercado Pago integration
│       │   └── services/
│       │       └── subscription.service.ts
│       │
│       ├── invite/                        # NEW - Team invitation system
│       │   ├── invite.component.ts
│       │   ├── components/
│       │   │   ├── invite-form/
│       │   │   └── invite-list/
│       │   └── services/
│       │       └── invite.service.ts
│       │
│       └── help/                          # NEW - Help system
│           ├── help.component.ts
│           ├── documentation/
│           ├── video-tutorials/
│           └── faq/
│
├── shared/
│   ├── apis/                             # HTTP Services (Layer 3)
│   │   ├── subscription-api.service.ts   # NEW
│   │   ├── invite-api.service.ts         # NEW
│   │   ├── hierarchy-api.service.ts      # NEW
│   │   ├── drill-down-api.service.ts     # NEW
│   │   └── convite-api.service.ts        # EXISTING
│   │
│   ├── services/                         # Business Services (Layer 2)
│   │   ├── subscription.service.ts       # NEW - Usage tracking, upgrade logic
│   │   ├── invite.service.ts             # NEW - Invitation workflow
│   │   ├── hierarchy.service.ts          # NEW - Tree data management
│   │   ├── drill-down.service.ts         # NEW - Context switching
│   │   └── convite.service.ts            # EXISTING
│   │
│   ├── components/                       # Reusable UI components
│   │   ├── context-header/               # NEW - Shows user context
│   │   ├── plan-badge/                   # NEW - Free/Pro indicator
│   │   ├── upgrade-prompt/               # NEW - CTA for upgrades
│   │   ├── help-tooltip/                 # NEW - Contextual help
│   │   └── error-message/                # ENHANCE - User-friendly errors
│   │
│   ├── models/
│   │   ├── subscription.model.ts         # NEW
│   │   ├── invite.model.ts               # NEW
│   │   ├── hierarchy.model.ts            # NEW
│   │   ├── drill-down-context.model.ts   # NEW
│   │   └── convite.model.ts              # EXISTING (✅ created)
│   │
│   ├── interceptors/
│   │   ├── error-handler.interceptor.ts  # ENHANCE - Better error messages
│   │   └── drill-down-context.interceptor.ts  # NEW - Inject context header
│   │
│   └── guards/
│       ├── subscription.guard.ts         # NEW - Check plan limits
│       └── drill-down.guard.ts           # NEW - Validate drill-down permission
│
├── core/
│   └── services/
│       └── i18n.service.ts               # NEW - ngx-translate setup (PT-BR only)
│
└── assets/
    ├── i18n/
    │   └── pt-br.json                    # NEW - Translation strings
    └── docs/
        ├── getting-started.md            # NEW - User documentation
        ├── hierarchy-guide.md            # NEW
        └── subscription-faq.md           # NEW
```

**Structure Decision**: Web application com backend/frontend separados. Frontend segue arquitetura libs/ (features modulares) + shared/ (recursos compartilhados) conforme constitution. Backend segue Clean Architecture com camadas Domain/Application/Infrastructure/Presentation usando FastEndpoints.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Org chart component > 2 state variables | Visualização hierárquica complexa requer: state (tree data), config (expand/collapse), selectedNode, drillDownContext | Componente mais simples não suportaria expand/collapse + drill-down + seleção simultânea; state management é essencial para UI responsiva |
| Drill-down service > 2 variables | Gerenciamento de sessão drill-down requer: currentContext (quem está vendo), contextHistory (stack de navegação), permissions (o que pode ver) | Service sem estado não permitiria navegação back/forward no drill-down; history stack é fundamental para UX |

**Justificativa Geral**: Ambas violações são em componentes/services de UI que gerenciam estado de usuário complexo. Object Calisthenics é relaxado para UI state management conforme patterns estabelecidos da indústria (e.g., NgRx, Redux). Código de domínio (Aggregates, Handlers) continuará 100% em compliance.

---

## Phase 0: Research & Discovery

**Objetivo**: Resolver incertezas técnicas, pesquisar best practices, e documentar decisões arquiteturais.

### Research Tasks

#### 1. Biblioteca de Visualização de Org Chart
**Questão**: Qual biblioteca usar para árvore hierárquica colapsável?

**Opções a Avaliar**:
- **PrimeNG TreeTable/OrganizationChart** (já no projeto)
  - Prós: Já instalado, consistência visual, suporte PrimeNG
  - Contras: Pode ser limitado para customizações avançadas
- **d3-hierarchy + Angular wrapper**
  - Prós: Máxima flexibilidade, renderização performática
  - Contras: Curva de aprendizado, manutenção custom
- **ngx-graph**
  - Prós: Angular-native, boa performance
  - Contras: Pode ser overkill para árvore simples

**Critérios de Decisão**:
- Performance com 100+ nós
- Suporte a expand/collapse individual por nível
- Customização de estilo (match com design system)
- Facilidade de integração com dados dinâmicos

**Deliverable**: Seção em `research.md` com comparação, POC simples, e recomendação final.

---

#### 2. Estratégia de Internacionalização (i18n)
**Questão**: Angular i18n nativo vs ngx-translate?

**Opções**:
- **Angular i18n (nativo)**
  - Prós: Oficial, AOT compilation, performance otimizada
  - Contras: Requer build separado por idioma
- **ngx-translate**
  - Prós: Runtime loading, troca de idioma dinâmica, mais flexível
  - Contras: Pequeno overhead de performance

**Critérios de Decisão**:
- MVP apenas PT-BR (não precisa troca dinâmica ainda)
- Facilidade de adicionar idiomas futuros
- Impact no bundle size
- Developer experience

**Deliverable**: Seção em `research.md` com decisão + setup guide.

---

#### 3. Mercado Pago SDK & Webhook Setup
**Questão**: Como integrar Mercado Pago de forma segura e PCI-compliant?

**Áreas de Pesquisa**:
- SDK do Mercado Pago para .NET (server-side)
- MercadoPago.js para tokenização client-side (evitar manusear dados de cartão)
- Webhook configuration para status de pagamento
- Ambiente de sandbox para testes
- Tratamento de edge cases (webhook duplicado, pagamento pendente, estorno)

**Deliverable**: 
- Seção detalhada em `research.md`
- Exemplo de código de integração
- Diagrama de fluxo de pagamento (usuário → frontend → backend → Mercado Pago → webhook)

---

#### 4. Rolling 30-Day Window Query Optimization
**Questão**: Como implementar limite de eventos com janela de 30 dias rolling de forma eficiente?

**Desafios**:
- Query precisa contar eventos nos últimos 30 dias a qualquer momento
- Pode ser executada frequentemente (cada vez que criar evento)
- Precisa ser rápido mesmo com milhares de eventos históricos

**Estratégia a Avaliar**:
```sql
-- Opção 1: Query direta com index
SELECT COUNT(*) 
FROM Events 
WHERE UserId = @userId 
  AND CreatedAt >= DATEADD(day, -30, GETDATE())
  AND Status != 'Deleted';

-- Opção 2: Materialized aggregate (cache)
-- Atualizar contador a cada evento criado/deletado

-- Opção 3: Partition by month + query otimizada
```

**Critérios**:
- Performance < 50ms
- Accuracy (contagem correta)
- Manutenibilidade

**Deliverable**: Análise em `research.md` com query escolhida + estratégia de indexação.

---

#### 5. Most Restrictive Permission Resolution
**Questão**: Como implementar algoritmo de resolução de conflito de permissões?

**Cenário**: Usuário pertence a Grupo A (pode editar) e Grupo B (não pode editar) → resultado: NÃO pode editar.

**Implementação a Pesquisar**:
- Onde aplicar a lógica: Domain Service, Handler, ou Guard?
- Como cachear permissões resolvidas para performance?
- Como logar decisões de permissão para auditoria?

**Deliverable**: 
- Pseudocódigo do algoritmo
- Decisão de onde implementar (recomendação: Domain Service)
- Estratégia de cache

---

#### 6. Error Handling & User-Friendly Messages
**Questão**: Como transformar erros técnicos em mensagens amigáveis? (FR-007)

**Problemas Atuais**:
- "Recurso não encontrado" (genérico)
- Stack traces visíveis
- Erros HTTP diretos (404, 405, 500)

**Estratégia a Pesquisar**:
- Enum de error codes customizados
- Mapping de HTTP status → mensagens PT-BR
- Componente de erro global
- Retry strategies (com exponential backoff)

**Exemplo Desejado**:
```typescript
// Ao invés de:
"Http failure response for https://localhost:57678/api/eventos/configuracoes?grupo_id=1: 405 OK"

// Mostrar:
"Não foi possível carregar os eventos. [Tentar novamente]"
```

**Deliverable**: 
- Error code enum
- Translation map (error code → PT-BR message)
- Global error interceptor implementation guide

---

### Research Output

**Arquivo**: `research.md`

**Estrutura Esperada**:
```markdown
# Research: UX & SaaS Platform Enhancements

## 1. Org Chart Visualization Library
- Decisão: [Biblioteca escolhida]
- Justificativa: [...]
- POC: [Link para código ou screenshot]

## 2. Internacionalização Strategy
- Decisão: [ngx-translate ou Angular i18n]
- Setup steps: [...]

## 3. Mercado Pago Integration
- SDK setup: [...]
- Webhook configuration: [...]
- Payment flow diagram: [...]

## 4. Rolling Window Optimization
- Query final: [SQL]
- Índices necessários: [...]
- Performance esperada: [...]

## 5. Permission Conflict Resolution
- Algoritmo: [pseudocódigo]
- Implementação: [Domain Service]
- Cache strategy: [...]

## 6. Error Handling Strategy
- Error codes enum: [...]
- Message mapping: [...]
- Interceptor guide: [...]
```

---

## Phase 1: Design & Contracts

**Objetivo**: Modelar dados, definir APIs, criar guia de início rápido.

### 1.1 Data Model (`data-model.md`)

**Entidades a Modelar**:

#### Subscription (Nova)
```
Subscription
- Id: Guid
- UserId: int
- StructureId: int (nullable - pode ser por usuário ou por estrutura)
- PlanType: enum (Free, Pro, Enterprise)
- Status: enum (Active, Canceled, PastDue, Trialing)
- CurrentPeriodStart: DateTime
- CurrentPeriodEnd: DateTime
- EventsCreatedInPeriod: int (cache para rolling window)
- LastEventCountUpdate: DateTime
- MercadoPagoSubscriptionId: string (nullable)
- CreatedAt: DateTime
- UpdatedAt: DateTime

Relacionamentos:
- Subscription → User (1:1 ou 1:N)
- Subscription → Structure (0..1:1)
- Subscription → BillingHistory (1:N)
```

#### InviteCode (Nova)
```
InviteCode
- Id: Guid
- Token: string (unique, indexed)
- StructureId: int
- HierarchyLevelId: int (target level para o convidado)
- InvitedEmail: string
- InvitedByUserId: int
- Status: enum (Pending, Accepted, Expired, Revoked)
- ExpiresAt: DateTime
- AcceptedAt: DateTime (nullable)
- AcceptedByUserId: int (nullable)
- CreatedAt: DateTime

Relacionamentos:
- InviteCode → Structure (N:1)
- InviteCode → HierarchyLevel (N:1)
- InviteCode → User (invitedBy) (N:1)
- InviteCode → User (acceptedBy) (N:0..1)
```

#### DrillDownContext (Nova - Session State)
```
DrillDownContext
- Id: Guid
- ViewerUserId: int (quem está visualizando)
- TargetUserId: int (quem está sendo visualizado)
- StructureId: int
- ContextStack: JSON (array de [userId, level] para navegação back)
- PermissionsSnapshot: JSON (cache das permissões atuais)
- CreatedAt: DateTime
- LastAccessedAt: DateTime
- ExpiresAt: DateTime (session timeout)

Relacionamentos:
- DrillDownContext → User (viewer) (N:1)
- DrillDownContext → User (target) (N:1)
- DrillDownContext → Structure (N:1)

Notas:
- Armazenado em cache (Redis) ou tabela temporária
- TTL: 30 minutos de inatividade
```

#### AuditLog (Nova)
```
AuditLog
- Id: Guid
- EntityType: string (e.g., "Event", "User", "Permission")
- EntityId: string
- Action: string (e.g., "Create", "Update", "Delete", "PermissionGrant")
- PerformedByUserId: int
- StructureId: int (nullable)
- ChangesJson: JSON (before/after snapshot)
- IpAddress: string
- UserAgent: string
- Timestamp: DateTime

Relacionamentos:
- AuditLog → User (N:1)
- AuditLog → Structure (N:0..1)

Índices:
- EntityType + EntityId
- PerformedByUserId + Timestamp
- StructureId + Timestamp
```

#### Event (Atualização - campos novos)
```
Event (existente + novos campos)
+ Alias: string (nullable) - apelido customizado
+ PermissionFlags: int (bitmask para granular permissions)
  - CanAddParticipants: bit 0
  - CanEditAlias: bit 1
  - CanChangeLocation: bit 2
  - CanChangeDateTime: bit 3
+ OwnerId: int (transferível)
+ IsRecurring: bool
+ RecurrencePattern: JSON (nullable)

Índices adicionais:
- OwnerId + CreatedAt (para rolling window)
- StructureId + CreatedAt (para drill-down queries)
```

**Deliverable**: `data-model.md` com todas as entidades, relacionamentos, índices, e migrações EF Core.

---

### 1.2 API Contracts (`contracts/`)

**OpenAPI Specs a Criar**:

#### `subscription-api.yaml`
```yaml
/api/subscription/status:
  get:
    summary: Get current subscription status
    responses:
      200:
        schema:
          type: object
          properties:
            planType: string (Free/Pro)
            eventsUsed: int
            eventsLimit: int
            periodEndsAt: string (ISO date)
            canUpgrade: bool

/api/subscription/upgrade:
  post:
    summary: Initiate plan upgrade
    requestBody:
      targetPlan: string (Pro/Enterprise)
    responses:
      200:
        schema:
          mercadoPagoPreferenceId: string
          checkoutUrl: string

/api/subscription/webhook:
  post:
    summary: Mercado Pago webhook callback
    # Validar signature, processar status
```

#### `invite-api.yaml`
```yaml
/api/invites:
  post:
    summary: Create invitation
    requestBody:
      email: string
      structureId: int
      hierarchyLevelId: int
    responses:
      201:
        schema:
          inviteId: guid
          token: string
          expiresAt: string

  get:
    summary: List pending invitations
    responses:
      200:
        schema:
          array of invites

/api/invites/{token}/validate:
  get:
    summary: Validate invitation token
    responses:
      200:
        schema:
          valid: bool
          structureName: string
          hierarchyLevelName: string
          invitedByName: string

/api/invites/{token}/accept:
  post:
    summary: Accept invitation
    requestBody:
      acceptedByUserId: int
    responses:
      200: success
```

#### `hierarchy-api.yaml`
```yaml
/api/hierarchy/chart:
  get:
    summary: Get organization chart
    parameters:
      - structureId: int
      - maxDepth: int (default 6)
    responses:
      200:
        schema:
          tree structure with nodes:
            - userId
            - name
            - level
            - subordinates: array
            - eventCount: int
            - attendanceRate: float

/api/drill-down/context:
  post:
    summary: Set drill-down context
    requestBody:
      targetUserId: int
    responses:
      200:
        schema:
          contextId: guid
          viewAs: user object
          permissions: array

  delete:
    summary: Clear drill-down (return to own view)
    responses:
      204: no content

/api/drill-down/events:
  get:
    summary: Get events from target user's perspective
    parameters:
      - contextId: guid (optional, from session)
    responses:
      200:
        array of events with aliasing + permissions
```

**Deliverable**: 4 arquivos YAML na pasta `contracts/`, validados com OpenAPI Schema Validator.

---

### 1.3 Quickstart Guide (`quickstart.md`)

**Conteúdo**:

```markdown
# Quickstart: UX & SaaS Enhancements

## Para Desenvolvedores Backend

### Setup Mercado Pago
1. Criar conta no [Mercado Pago Developers](...)
2. Obter credenciais de teste: `TEST-xxx` (public key) e `TEST-xxx` (access token)
3. Adicionar ao `appsettings.Development.json`:
   ```json
   "MercadoPago": {
     "PublicKey": "TEST-xxx",
     "AccessToken": "TEST-xxx",
     "WebhookSecret": "your-secret"
   }
   ```
4. Instalar SDK: `dotnet add package MercadoPagoSDK`

### Executar Migrações
```bash
cd GestaoEventos.API/src/GestaoEventos.Infrastructure
dotnet ef migrations add AddSubscriptionTables
dotnet ef database update
```

### Testar Endpoints
```bash
# Health check
curl http://localhost:5000/api/subscription/status

# Ver invites pendentes
curl http://localhost:5000/api/invites -H "Authorization: Bearer <token>"
```

## Para Desenvolvedores Frontend

### Setup i18n
```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

### Configurar Módulo
```typescript
// app.config.ts
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

providers: [
  importProvidersFrom(
    TranslateModule.forRoot({
      defaultLanguage: 'pt-br',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  )
]
```

### Usar Traduções
```html
<!-- Template -->
<h1>{{ 'SUBSCRIPTION.TITLE' | translate }}</h1>

<!-- Component -->
this.translate.instant('ERROR.NOT_FOUND')
```

### Testar Componentes
```bash
ng serve
# Navegar para http://localhost:4200/admin/hierarchy
# Login com credenciais de teste
```

## Testes E2E com Playwright

### Setup
```bash
cd GestaoEventos.Angular
npm install -D @playwright/test
npx playwright install
```

### Executar
```bash
npx playwright test tests/e2e/subscription.spec.ts
```

## Checklist de Desenvolvimento

- [ ] Backend: Endpoints /api/subscription/* implementados
- [ ] Backend: Endpoints /api/invites/* implementados
- [ ] Backend: Endpoints /api/hierarchy/* implementados
- [ ] Backend: Mercado Pago webhook configurado
- [ ] Backend: Migrations aplicadas
- [ ] Frontend: Landing page responsiva
- [ ] Frontend: Onboarding wizard multi-step
- [ ] Frontend: Org chart com drill-down
- [ ] Frontend: Subscription management UI
- [ ] Frontend: Error handling melhorado
- [ ] Frontend: i18n configurado (translations em pt-br.json)
- [ ] Testes: E2E para fluxo de onboarding
- [ ] Testes: E2E para drill-down navigation
- [ ] Testes: Integração com sandbox Mercado Pago
```

**Deliverable**: `quickstart.md` completo com todos os comandos e configurações necessárias.

---

### 1.4 Agent Context Update

Após completar Phase 1, executar:

```bash
.specify/scripts/bash/update-agent-context.sh copilot
```

Isso adiciona as novas tecnologias (Mercado Pago SDK, ngx-translate, org chart library) ao contexto do agent para melhor assistência AI em desenvolvimento futuro.

---

## Phase 2: Implementation Planning

**Nota**: Tasks detalhadas serão geradas pelo comando `/speckit.tasks` (não por `/speckit.plan`).

**Output Esperado**: `tasks.md` com decomposição granular dos 35 requisitos funcionais em tarefas executáveis.

**Estrutura Sugerida para Tasks**:
1. Backend: Subscription Management (FR-022 a FR-026)
2. Backend: Invite System (FR-004, FR-027)
3. Backend: Hierarchy & Drill-Down (FR-010 a FR-015)
4. Frontend: Landing Page & Onboarding (FR-001 a FR-003)
5. Frontend: Dashboard Context (FR-005, FR-006)
6. Frontend: Org Chart & Drill-Down UI (FR-010, FR-011, FR-012)
7. Frontend: Subscription UI (FR-024, FR-025)
8. Frontend: Help System (FR-028 a FR-031)
9. Integration: Mercado Pago (backend + frontend)
10. Polishing: Error Handling (FR-007), i18n (FR-035), Navigation Fixes (FR-009)

**Prioridade de Implementação** (conforme spec):
- **P1 (MVP-critical)**: FR-001 a FR-015 (Onboarding, Hierarchy, Dashboard)
- **P2 (Launch-ready)**: FR-016 a FR-031 (Events, SaaS features, Help)
- **P3 (Post-launch)**: FR-032 a FR-035 (Data export, i18n, audit)

---

## Próximos Passos

1. ✅ **Aprovação do Plano**: Revisar este documento com tech lead/stakeholders
2. 📚 **Executar Phase 0**: Criar `research.md` resolvendo as 6 questões técnicas
3. 📐 **Executar Phase 1**: Criar `data-model.md`, `contracts/`, e `quickstart.md`
4. 🔄 **Re-check Constitution**: Validar todas as decisões contra constitution.md
5. 📋 **Gerar Tasks**: Executar `/speckit.tasks` para quebrar em tarefas de implementação
6. 🚀 **Iniciar Development**: Seguir tasks em ordem de prioridade (P1 → P2 → P3)

---

## Estimativas

**Phase 0 (Research)**: 2-3 dias (1 desenvolvedor)  
**Phase 1 (Design & Contracts)**: 3-4 dias (1 desenvolvedor)  
**Phase 2 (Implementation)**:
- Backend: 10-12 dias (1 desenvolvedor backend)
- Frontend: 12-15 dias (1 desenvolvedor frontend)
- Integration & Testing: 5-7 dias (ambos)

**Total**: ~30-40 dias de desenvolvimento (6-8 semanas com 1 backend + 1 frontend dev em paralelo)

**Riscos de Cronograma**:
- Integração Mercado Pago (sandbox pode ter issues) = +2-3 dias buffer
- Org chart library learning curve (se não usar PrimeNG nativo) = +2 dias buffer
- Debugging queries hierárquicas complexas = +2 dias buffer

**Estimativa conservadora**: 8-10 semanas

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
