<!--
SYNC IMPACT REPORT - Version 2.4.0
================================================================================
VERSION CHANGE: 2.3.0 → 2.4.0

MODIFICAÇÕES (2.4.0 - MINOR):
- ✅ **MODULARIZAÇÃO de ux-flows/05-event-management.md (v2.0.0 → v3.0.0)**:
  - Arquivo monolítico de 1511 linhas dividido em 4 arquivos por escopo:
    * 05a-event-templates.md — Criar/editar modelo de evento (template)
      → Todos os 6 fieldsets mapeados do EventoFormComponent (HTML + TS)
      → Campos: nomeGenerico, horaInicio, duracaoHoras/Minutos, local, grupos,
        tipoRecorrencia, dataFimRecorrencia, podeCustomizar*, permiteConvidados, etc.
      → Comportamentos reativos: calcularHorarioFim, conflito 500ms, slideIn
      → Restrições de negócio declarativas (MUST/SHOULD/MUST NOT)
    * 05b-event-initiation.md — Iniciar evento (UX corrigida) + Meus Eventos
      → DECISÃO DE DESIGN: Substituído fluxo de seleção manual por cards proativos
      → "Pendentes automáticos" — templates do grupo aparecem sem seleção do usuário
      → Explicação clara do destino pós-início: /admin/eventos/meus
      → Etapas: Pendentes → Configuração → Confirmação → /admin/eventos/meus
      → Ciclo de vida do evento (RASCUNHO → PUBLICADO → EM_ANDAMENTO → CONCLUIDO)
    * 05c-attendance.md — Registrar presença e finalizar evento
      → Novo: campo `requerJustificativa` é CONFIGURÁVEL no template (não hard-coded)
      → AUSENTE: textarea aparece apenas SE template.requerJustificativa = true
      → JUSTIFICADO: textarea sempre obrigatória (independente do template)
      → Funcionalidades planejadas do AcompanharEventoComponent (em dev)
    * 05d-journey-personal.md — Minha Jornada (/jornada) — visão pessoal
      → 4 abas: Eventos de Hoje, Minha Frequência, Histórico, Próximas Reuniões
      → Diferença clara entre Minha Jornada (participante) vs Meus Eventos (responsável)
  - 05-event-management.md agora é ÍNDICE slim (~150 linhas) com:
    → Links para 05a/05b/05c/05d
    → Conceitos críticos (Evento vs Grupo, Permissões Dinâmicas)
    → Menu real completo (de menu.component.ts)
    → Jornada resumida (Login → Evento Iniciado)
    → Tabela de rotas completa com status de implementação
    → Matriz de permissões dinâmica

DECISÕES DE DESIGN REGISTRADAS:
  1. UX "Pendentes Proativos" (05b):
     ANTES: /admin/eventos/iniciar abria lista vazia + usuário selecionava template
     AGORA: templates do grupo aparecem automaticamente como cards de pendência
     MOTIVO: Usuários não sabiam o que fazer na tela anterior; a relação template→grupo era opaca

  2. Justificativa de ausência configurável (05c):
     ANTES: textarea para AUSENTE era hard-coded (sempre aparecia)
     AGORA: `requerJustificativa: boolean` no template controla exibição
     MOTIVO: Nem todo evento precisa de justificativa — configurabilidade pelo owner

  3. Destino pós-início explicitado (05b):
     ANTES: não documentado (usuário "perdia" o evento)
     AGORA: POST /api/eventos → 2s feedback → redirect /admin/eventos/meus
     MOTIVO: /meus é o hub do responsável — event recém-criado fica visível com ações

TEMPLATES VERIFICADOS:
  ✅ .specify/templates/plan-template.md — sem referências a fluxos de eventos quebradas
  ✅ .specify/templates/spec-template.md — sem referências quebradas
  ✅ .specify/templates/tasks-template.md — sem referências quebradas

FOLLOW-UP TODOS (atualizado):
- ✅ 05-event-management.md — ÍNDICE v3.0.0
- ✅ 05a-event-templates.md — v1.0.0 (novo)
- ✅ 05b-event-initiation.md — v1.0.0 (novo, UX corrigida)
- ✅ 05c-attendance.md — v1.0.0 (novo, justificativa configurável)
- ✅ 05d-journey-personal.md — v1.0.0 (novo)
- ⚠ PENDENTE: 01-login-signup.md
- ⚠ PENDENTE: 02-onboarding.md
- ⚠ PENDENTE: 06-dashboard-views.md
- ⚠ PENDENTE: 07-reports-analytics.md
- ⚠ PENDENTE: 08-notifications-actions.md
- ⚠ PENDENTE: 09-mobile-adaptations.md
- ⚠ PENDENTE: layout-structure.md
- ⚠ PENDENTE: ux-principles.md
- ✅ 7 de 11+ arquivos modulares completos

RATIONALE:
- MINOR bump (2.3.0 → 2.4.0): Novos arquivos adicionados (05a, 05b, 05c, 05d)
- Refatoração não remove princípios — apenas expande e organiza documentação UX
- Decisões de design agora documentadas explicitamente (UX pendentes, justificativa configurável)

Data: 2026-02-18

================================================================================
SYNC IMPACT REPORT - Version 2.3.0
================================================================================
VERSION CHANGE: 2.2.0 → 2.3.0

MODIFICAÇÕES (2.3.0 - MINOR):
- ✅ **REESCRITA COMPLETA de ux-flows/05-event-management.md (v1.0.0 → v2.0.0)**:
  - Removida documentação genérica com wireframes ASCII desconexos
  - Substituída por documentação baseada no código real implementado
  - ADICIONADO: Modelo de permissões DINÂMICAS (não fixas por papel)
    → Permissões concedidas por Owner/responsável a responsáveis de grupos
    → CRIAR_EVENTO, EDITAR_EVENTO, EXCLUIR_EVENTO, VALIDAR_PRESENCA_GRUPO,
       VALIDAR_PRESENCA_FILHOS, GERENCIAR_RESPONSAVEIS, CONFIGURAR_PERMISSOES
    → context.isOwner = true bypassa todas as verificações
  - ADICIONADO: Jornada completa com rotas reais (login → dashboard → criação)
    → Fase 0: /auth/login (campos: email, senha)
    → Fase 1: /admin/onboarding (apenas primeira vez, sem estrutura)
    → Fase 2: /admin/dashboard (menu lateral mapeado com rotas reais)
  - ADICIONADO: 3 caminhos de acesso a eventos (Owner, Responsável c/ permissão, Jornada)
  - ADICIONADO: Flow A — Criar Template com todos os campos mapeados:
    → Seção 1: Informações básicas (título, descrição)
    → Seção 2: Recorrência (tipo, intervalo, duração, dias semana, horário, local, fim)
    → Seção 3: Grupos vinculados (card multiselect)
    → Seção 4: Permissões de configuração (4 checkboxes — campos travados/liberados)
    → Seção 5: Permissões de gestão (5 checkboxes — responsáveis e participantes)
  - ADICIONADO: Flow B — Wizard 4 etapas com campos por template liberado/travado
  - ADICIONADO: Flow C — Meus Eventos (campos do card mapeados)
  - ADICIONADO: Flow D — Minha Jornada (/jornada — 4 abas + campos de cada uma)
  - ADICIONADO: Ciclo de vida completo com estados
  - ADICIONADO: Matriz de permissões dinâmica (não por papel fixo)
  - ADICIONADO: Mapeamento completo de rotas com guards e componentes
  - ADICIONADO: Estado de implementação (✅/⚠️) por funcionalidade em 2026-02-18
  - CORRIGIDO: "Simplesmente Sobrenatural" é EVENTO (ocorrência), não grupo
  - CORRIGIDO: Permissões não são fixas por nível hierárquico — são concedidas dinamicamente

PRINCÍPIO ATUALIZADO (Permissões):
  ANTES (incorreto): Permissões eram referenciadas como fixas por papel/nível
  AGORA (correto): Permissões são DINÂMICAS, concedidas por Owner ou responsável
    com CONFIGURAR_PERMISSOES a responsáveis de grupos específicos.
    O sistema verifica: context.isOwner OR HierarchyPermissionsService.hasPermission()

FOLLOW-UP TODOS (atualizado):
- ✅ 05-event-management.md — COMPLETO (v2.0.0)
- ⚠ PENDENTE: 01-login-signup.md
- ⚠ PENDENTE: 02-onboarding.md
- ⚠ PENDENTE: 06-dashboard-views.md
- ⚠ PENDENTE: 07-reports-analytics.md
- ⚠ PENDENTE: 08-notifications-actions.md
- ⚠ PENDENTE: 09-mobile-adaptations.md
- ⚠ PENDENTE: layout-structure.md
- ⚠ PENDENTE: ux-principles.md
- ✅ 4 de 11+ arquivos modulares completos

RATIONALE:
- MINOR bump (2.2.0 → 2.3.0): Seção material expandida (05-event-management v2)
- Novo princípio de permissões dinâmicas adicionado ao documento
- Documentação agora reflete o código implementado (permissao.model.ts,
  permission.guard.ts, hierarchy-permissions.service)
- Jornada step-by-step baseada em app.routes.ts real

Data: 2026-02-18

================================================================================
SYNC IMPACT REPORT - Version 2.2.0
================================================================================
VERSION CHANGE: 2.1.1 → 2.2.0

MODIFICAÇÕES (2.2.0 - MINOR):
- ✅ **MODULARIZAÇÃO COMPLETA de ux-navigation.md (v2.0.0 - BREAKING)**:
  - ux-navigation.md convertido em ÍNDICE limpo (1691 linhas → 226 linhas)
  - Conteúdo detalhado quebrado em 9+ arquivos modulares em `.specify/memory/ux-flows/`:
    * README.md - Índice e princípios dos fluxos
    * 03-structure-management.md - Gestão completa de estruturas (criar, convidar, aceitar/recusar, desvincular)
    * 04-group-hierarchy.md - Navegação hierárquica e distinção CRÍTICA Grupos vs Eventos
    * 01-login-signup.md (pendente)
    * 02-onboarding.md (pendente)
    * 05-event-management.md (pendente)
    * 06-dashboard-views.md (pendente)
    * 07-reports-analytics.md (pendente)
    * 08-notifications-actions.md (pendente)
    * 09-mobile-adaptations.md (pendente)
    * layout-structure.md (pendente)
    * ux-principles.md (pendente)
  - RAZÃO: Arquivo monolítico (1000+ linhas) era difícil de navegar e manter
  - Adicionado fluxo CRÍTICO: "Receber convite" (aceitar/recusar com/sem conta)
  - Clarificada confusão #1: "Simplesmente Sobrenatural" é EVENTO, não GRUPO
  - Removida terminologia church-specific ("Minha Rede" → "Meus Subordinados")
- Novo documento: `.specify/memory/ux-flows/README.md` (v1.0.0)
  - Índice completo com 9 fluxos + arquivos auxiliares
  - Princípios de design: Nomenclatura Agnóstica, Distinção Grupo/Evento
  - Cenários de integração cross-flow
- Novos documentos criados (completos):
  * `.specify/memory/ux-flows/03-structure-management.md` (v1.0.0)
    - 6 fluxos: Criar, Convidar, Receber convite, Trocar, Sair, Transferir ownership
    - Templates de email, notificações, estados de erro
  * `.specify/memory/ux-flows/04-group-hierarchy.md` (v1.0.0)
    - 6 fluxos: Ver hierarquia, Zoom navigation, CRUD de grupos
    - Seção crítica: ASCII diagram GROUP vs EVENT
    - Tabela de nomenclatura agnóstica

MODIFICAÇÕES (2.1.1 - PATCH):
- ✅ **CORREÇÃO CRÍTICA em ux-navigation.md (v1.1.0)**:
  - Removida nomenclatura FIXA ("Células", "Obreiro", "Discipulador", "Líder", "Membro")
  - Substituída por nomenclatura GENÉRICA ("Grupos", "Nível 2", "Nível 3", "Nível 4", "Nível 5")
  - Adicionada seção explicando configurabilidade de labels por estrutura
  - Menus alinhados com implementação real (Dashboard, Grupos, Eventos, Participação, Relatórios)
  - Todos wireframes marcados como EXEMPLOS usando contexto de igreja
  - Tabela de tradução: Termo Sistema ↔ Exemplos Customização
- Clarificação: Sistema é **AGNÓSTICO** - labels configuráveis por estrutura

MODIFICAÇÕES (2.1.0):
- Adicionado novo documento: ux-navigation.md
- Documento cobre UX, fluxos de navegação, wireframes e responsividade
- Dashboards por perfil hierárquico detalhados
- Fluxos de navegação críticos documentados (5 cenários principais)
- Wireframes ASCII para todas as telas principais
- Estados da aplicação, notificações, busca global
- Princípios de acessibilidade e responsividade

MODIFICAÇÕES (2.0.0):
- Constitution reorganizada em arquitetura modular
- Conteúdo separado em 3 documentos especializados:
  * business.md - Modelo de negócio e funcionalidades
  * frontend.md - Arquitetura e padrões de frontend
  * backend.md - Arquitetura e padrões de backend

PRINCÍPIOS CORE:
- Clean Architecture + CQRS (backend)
- Object Calisthenics (backend - 9 regras)
- 3-Layer Architecture (frontend)
- Separation of Concerns (ambos)
- Mobile-First Responsive UX
- **Nomenclatura Agnóstica e Configurável (crítico)**

TEMPLATES ATUALIZADOS:
✅ .specify/templates/plan-template.md - Referências atualizadas
✅ .specify/templates/spec-template.md - Links para documentos corretos
✅ .specify/templates/tasks-template.md - Categorização alinhada
✅ .specify/templates/commands/*.md - Referências genéricas verificadas

FOLLOW-UP TODOS:
- ⚠ PENDENTE: Completar arquivos de fluxo restantes em ux-flows/:
  * 01-login-signup.md
  * 02-onboarding.md
  * ✅ 05-event-management.md — CONCLUÍDO v2.0.0 (2026-02-18)
  * 06-dashboard-views.md
  * 07-reports-analytics.md
  * 08-notifications-actions.md
  * 09-mobile-adaptations.md
  * layout-structure.md
  * ux-principles.md
- ✅ 4 de 11+ arquivos modulares completos
- ✅ framework estrutural estabelecido (README.md com princípios)

RATIONALE:
- MINOR version bump (2.1.1 → 2.2.0): Nova seção adicionada (ux-flows modular)
- Modularização melhora significativamente manutenibilidade
- Arquivo monolítico de 1691 linhas era navegação difícil
- BREAKING CHANGE em ux-navigation.md justifica novo documento índice
- Arquivos modulares podem ser versionados independentemente
- Adicionados fluxos críticos ausentes (receber convite, aceitar/recusar)
- Clarificada distinção arquitetural: GRUPO (container) vs EVENTO (ocorrência)
- Sistema permanece 100% agnóstico: nomenclatura configurável por estrutura

Data: 2026-02-15
-->

# GestaoEventos Project Constitution

**Version**: 2.4.0
**Ratified**: 2026-01-31
**Last Amended**: 2026-02-18

---

## Visão Geral

**GestaoEventos** é um sistema SaaS de gestão de eventos avançado e agnóstico que permite diferentes organizações (igrejas, empresas, comunidades) gerenciarem eventos, participantes, hierarquia e métricas de forma customizável.

### Documentação Modular

Esta constituição foi reorganizada em **documentos especializados** para melhor manutenibilidade e navegação:

| Documento | Propósito | Quando Usar |
|-----------|-----------|-------------|
| **[business.md](business.md)** | Modelo de negócio, funcionalidades e regras de domínio | Entender o projeto, casos de uso, regras de negócio |
| **[frontend.md](frontend.md)** | Arquitetura, padrões e convenções de frontend (Angular) | Implementar features frontend, estruturar código client-side |
| **[backend.md](backend.md)** | Arquitetura, padrões e convenções de backend (.NET) | Implementar features backend, estruturar código server-side |
| **[ux-navigation.md](ux-navigation.md) v2.0** | **ÍNDICE** de fluxos UX → ver [ux-flows/](ux-flows/README.md) | Ponto de entrada para documentação UX modular |
| **[ux-flows/README.md](ux-flows/README.md)** | Índice detalhado de 9+ fluxos UX modulares | Navegação completa de todos os fluxos detalhados |
| **[ux-flows/*.md](ux-flows/)** | Fluxos individuais (login, estrutura, grupos, eventos, etc.) | Implementar UX específica, wireframes, mobile patterns |
| **[design-system.md](design-system.md)** | Sistema de design moderno com cores, tipografia, animações | Criar componentes UI consistentes, seguir padrão visual |

---

## 📖 Referência Rápida

### Para Entender o Negócio
→ **Leia [business.md](business.md)**
- ✅ O que é o GestaoEventos?
- ✅ Casos de uso completos (Pastor cria célula, líder gerencia, owner vê métricas)
- ✅ Diferenciais competitivos (hierarquia dinâmica, zoom visual, multi-estrutura)
- ✅ Modelo de planos (freemium: FREE, BÁSICO, PRO, ENTERPRISE)
- ✅ Regras de domínio (ciclo de vida de eventos, permissões, métricas)
- ✅ Exemplo de estrutura de igreja e empresa

### Para Implementar Frontend
→ **Leia [frontend.md](frontend.md)**
- ✅ Arquitetura de 3 camadas obrigatória (Component → Business Service → API Service)
- ✅ Estrutura de pastas STRICT (`core/`, `shared/`, `libs/`)
- ✅ Separation of Concerns (Guards, Components, Services)
- ✅ Utility helpers obrigatórios (HelperJson, HelperHttp)
- ✅ Environment e API URLs configuration
- ✅ RESTful URL conventions
- ✅ Context vs Form Data
- ✅ State management (Signals, RxJS)
- ✅ Forms, validação, error handling
- ✅ Naming conventions
- ✅ Acessibilidade (WCAG 2.1 Level AA)
- ✅ Performance (lazy loading, OnPush, trackBy)
- ✅ Testing (unit + E2E)

### Para Implementar Backend
→ **Leia [backend.md](backend.md)**
- ✅ Clean Architecture obrigatória (Core, UseCases, Infrastructure, Web)
- ✅ Object Calisthenics - 9 regras MANDATORY
- ✅ FastEndpoints pattern completo (Request, Validator, Endpoint, Command, Handler, Record, Mapping)
- ✅ CQRS pattern (Commands vs Queries)
- ✅ Repository pattern
- ✅ Entity Framework configurations
- ✅ Result pattern (error handling)
- ✅ Naming conventions
- ✅ FluentValidation
- ✅ JWT/Authorization
- ✅ Testing (unit + integration)

### Para Entender UX e Fluxos de Navegação
→ **Leia [ux-navigation.md](ux-navigation.md)**
- ✅ Princípios de UX (mobile-first, hierarquia visual, zoom hierárquico)
- ✅ Estrutura de layout (header, sidebar colapsável, bottom nav mobile)
- ✅ Dashboards por perfil (Owner, Obreiro, Discipulador, Líder, Membro)
- ✅ Fluxos de navegação críticos (criar template, iniciar evento, zoom hierárquico)
- ✅ Wireframes ASCII de todas as telas principais
- ✅ Estados da aplicação (loading, vazio, erro, sucesso)
- ✅ Notificações (push, in-app, email)
- ✅ Responsividade (breakpoints + adaptações mobile)
- ✅ Acessibilidade (WCAG 2.1 AA + atalhos de teclado)
- ✅ Busca global (Ctrl+K)

### Para Criar Interface com Design Moderno
→ **Leia [design-system.md](design-system.md)**
- ✅ Paleta de cores profissional (#0066FF brand blue, sem purple genérico)
- ✅ Tipografia consistente (escala H1-H4, body, small)
- ✅ Sistema de spacing (8px base unit)
- ✅ Border radius moderno (8-12px, nunca quadrado)
- ✅ Shadows com elevation system (4 níveis)
- ✅ Animações smooth (300ms transitions, cubic-bezier)
- ✅ Componentes UI patterns (buttons, cards, forms)
- ✅ Acessibilidade WCAG 2.1 AA (contrast, focus states)
- ✅ Focus states e keyboard navigation
- ✅ Implementação de micro-interactions

---

## Core Principles (NON-NEGOTIABLE)

Esta seção contém **apenas os princípios fundamentais não-negociáveis**. Detalhes de implementação estão nos documentos especializados.

### I. Clean Architecture (Backend)

**Mandatório**: Backend DEVE seguir Clean Architecture com CQRS.

```
GestaoEventos.Core (Domain)
  └── Aggregates, Interfaces, Services, ValueObjects

GestaoEventos.UseCases (Application)
  └── Commands, Queries, Handlers (MediatR)

GestaoEventos.Infrastructure
  └── Data, Repositories, Services

GestaoEventos.Web (Presentation)
  └── FastEndpoints por entidade
```

**Dependências**: Web → UseCases → Core ← Infrastructure

**Detalhes completos**: Ver [backend.md - Section I](backend.md#i-clean-architecture-non-negotiable)

---

### II. Object Calisthenics (Backend)

**Mandatório**: TODO código C# DEVE seguir as 9 regras de Object Calisthenics:

1. ✅ 1 nível de indentação por método
2. ✅ Sem palavra `else`
3. ✅ Encapsular tipos primitivos (Value Objects)
4. ✅ Coleções de primeira classe
5. ✅ Um ponto por linha
6. ✅ Não abreviar
7. ✅ Manter entidades pequenas
8. ✅ Máximo 2 variáveis de instância
9. ✅ Sem getters/setters públicos (usar Records para DTOs)

**Detalhes completos**: Ver [backend.md - Section II](backend.md#ii-object-calisthenics-mandatory)

---

### III. 3-Layer Architecture (Frontend)

**Mandatório**: Frontend DEVE seguir arquitetura de 3 camadas:

```
Component (Apresentação)
    ↓
Business Service (Lógica + Cache)
    ↓
API Service (HTTP Puro)
    ↓
Backend API
```

**Regras:**
- **Components**: Apenas UI e input do usuário
- **Business Services**: Lógica de negócio, cache, estado compartilhado
- **API Services**: Apenas HTTP calls (usando HelperJson, HelperHttp)

**Detalhes completos**: Ver [frontend.md - Section I](frontend.md#i-arquitetura-de-3-camadas-mandatory)

---

### IV. Separation of Concerns (Frontend & Backend)

**Mandatório**: Responsabilidades bem definidas e isoladas.

**Frontend:**
- **Guards**: APENAS controle de acesso (autenticação, permissões)
- **Components**: APENAS apresentação e input
- **Services**: Lógica de negócio E chamadas HTTP (separados em Business + API)

**Backend:**
- **Endpoints**: APENAS roteamento e validação básica
- **Handlers**: Lógica de negócio (use cases)
- **Repositories**: APENAS persistência

**Detalhes completos**: Ver [frontend.md - Section III](frontend.md#iii-separation-of-concerns-non-negotiable) e [backend.md - Section III](backend.md#iii-fastendpoints-pattern-mandatory)

---

### V. Utility Helpers (Frontend)

**Mandatório**: Use helpers centralizados. **NÃO recrie funcionalidades.**

- **HelperJson**: Conversão camelCase ↔ snake_case
- **HelperHttp**: Construção de query params
- **Lodash**: Transformações de objetos

**Detalhes completos**: Ver [frontend.md - Section VI](frontend.md#vi-utility-helpers-mandatory)

---

### VI. Permissões Dinâmicas Baseadas em Responsáveis de Grupo

**Mandatório**: O sistema NUNCA atribui permissões fixas por papel/nível hierárquico.
Permissões são concedidas DINAMICAMENTE por responsáveis com autoridade.

**Regras:**
- **Owner**: `context.isOwner = true` — bypassa TODAS as verificações de permissão
- **Responsáveis**: Permissões explícitas por grupo, concedidas por Owner ou por quem tem `CONFIGURAR_PERMISSOES`
- **Guard**: `permissionGuard` verifica `HierarchyPermissionsService.hasPermission(recurso, acao)`
- **Escopo**: Permissão concedida em um grupo se aplica apenas àquele grupo e seus filhos

**Permissões de Evento disponíveis para delegação:**

| Código | O que permite |
|--------|--------------|
| `CRIAR_EVENTO` | Configurar e criar eventos a partir de templates |
| `EDITAR_EVENTO` | Editar eventos configurados no grupo |
| `EXCLUIR_EVENTO` | Excluir eventos (apenas os próprios) |
| `VALIDAR_PRESENCA_GRUPO` | Registrar presença em eventos do próprio grupo |
| `VALIDAR_PRESENCA_FILHOS` | Registrar presença em eventos de grupos descendentes |

**Permissões de autoridade (permitem delegar a outros):**

| Código | O que permite |
|--------|--------------|
| `GERENCIAR_RESPONSAVEIS` | Adicionar/remover responsáveis do grupo |
| `CONFIGURAR_PERMISSOES` | Conceder/revogar permissões de outros responsáveis no grupo |

**Detalhes completos**: Ver [ux-flows/05-event-management.md](ux-flows/05-event-management.md)

---

### VII. Naming Conventions
- Aggregates: `EventoAggregate`, `GrupoAggregate`
- Commands: `CreateEventoCommand`
- Queries: `GetEventoByIdQuery`
- Handlers: `CreateEventoHandler`
- Endpoints: `Create.cs`, `Update.cs`, `GetById.cs`, `List.cs`
- Records: `EventoRecord` (DTO)

**Frontend:**
- Business Services: `evento.service.ts`
- API Services: `evento-api.service.ts`
- Components: `evento-list.component.ts`, `evento-form.component.ts`
- Models: `evento.model.ts`

**Detalhes completos**: Ver [frontend.md - Section VIII](frontend.md#viii-naming-conventions) e [backend.md - Section VII](backend.md#vii-naming-conventions)

---

## Technical Stack Summary

| Camada | Tecnologia | Versão Mínima |
|--------|-----------|---------------|
| **Backend** | .NET | 8 |
| | Entity Framework Core | 8 |
| | FastEndpoints | Latest |
| | MediatR | Latest |
| | AutoMapper | Latest |
| | FluentValidation | Latest |
| **Frontend** | Angular | 17+ |
| | PrimeNG | Latest |
| | RxJS | Latest |
| | TailwindCSS | Latest |
| **Database** | SQL Server ou PostgreSQL | Latest |

---

## Code Quality Standards

### Backend
- ✅ Unit tests: **mínimo 80% cobertura**
- ✅ Integration tests: **fluxos críticos cobertos**
- ✅ SonarQube compliance: 0 bugs, 0 code smells críticos
- ✅ Code review obrigatório

### Frontend
- ✅ Unit tests: **mínimo 70% cobertura**
- ✅ E2E tests (Cypress): **fluxos principais cobertos**
- ✅ Lint: **0 erros**
- ✅ Acessibilidade: **WCAG 2.1 Level AA**

### Performance
- ✅ Tempo de carregamento: **< 2s**
- ✅ API response time (p95): **< 500ms**
- ✅ Cache hit rate: **> 70%**

---

## Security Requirements

1. ✅ **JWT Authentication** obrigatória
2. ✅ **HTTPS** em produção
3. ✅ **Validação de permissões** em todos os endpoints
4. ✅ **Rate limiting** em endpoints públicos
5. ✅ **SQL Injection protection** (via EF Core)
6. ✅ **XSS protection** (via Angular sanitization)
7. ✅ **CORS** configurado corretamente
8. ✅ **Auditoria** de ações críticas

---

## Governance

### Princípios de Governança

1. **Esta constitution é não-negociável** para código de produção
2. **Desvios devem ser documentados** e justificados em PR
3. **Code reviews verificam compliance** com checklist baseado nesta constitution
4. **PRs que violam princípios são rejeitados** até correção

### Processo de Amendments (Emendas)

1. **Proposta documentada** com justificativa clara
2. **Discussão com time** (mínimo 3 desenvolvedores)
3. **Aprovação por consenso** (maioria qualificada)
4. **Atualização da constitution** via PR
5. **Comunicação** a todos os desenvolvedores
6. **Versionamento semântico** (MAJOR para mudanças incompatíveis, MINOR para adições, PATCH para clarificações)

### Enforcement (Aplicação)

- ✅ **Automated linting**:
  - Backend: Roslyn analyzers para Object Calisthenics
  - Frontend: ESLint para estrutura de pastas e naming
- ✅ **Code review checklist** baseada nesta constitution
- ✅ **CI/CD gates** verificam testes e lint
- ✅ **Documentação sempre atualizada** (obrigatório em PRs que mudam arquitetura)

---

## Code Review Checklist

### Backend
- [ ] Clean Architecture respeitada (camadas corretas)
- [ ] Object Calisthenics seguido (9 regras)
- [ ] FastEndpoints pattern completo
- [ ] CQRS implementado (Commands vs Queries)
- [ ] Repository pattern utilizado
- [ ] Result pattern para error handling
- [ ] Naming conventions
- [ ] FluentValidation
- [ ] Entity configurations (Fluent API)
- [ ] Testes unitários (80%+)

### Frontend
- [ ] 3-Layer Architecture (Component → Business Service → API Service)
- [ ] Separation of Concerns
- [ ] Helpers utilizados (HelperJson, HelperHttp)
- [ ] Environment.API usado
- [ ] Query params em snake_case
- [ ] Context separado de Form Data
- [ ] Signals ou RxJS para estado
- [ ] Reactive Forms
- [ ] Error handling
- [ ] Lint: 0 erros
- [ ] Testes unitários (70%+)
- [ ] Acessibilidade (labels, ARIA)

---

## Documentos de Referência Adicionais

Além dos 3 documentos principais (business.md, frontend.md, backend.md), consulte:

- [DOCUMENTACAO_TECNICA.md](../../GestaoEventos.API/docs/DOCUMENTACAO_TECNICA.md) - Documentação completa da arquitetura
- [MAPEAMENTO_INTEGRACAO.md](../../GestaoEventos.API/docs/MAPEAMENTO_INTEGRACAO.md) - Integração Backend ↔️ Frontend
- [COMECE_AQUI.md](../../GestaoEventos.API/docs/COMECE_AQUI.md) - Guia de início rápido
- [ARCHITECTURE_DIAGRAM.md](../../GestaoEventos.Angular/ARCHITECTURE_DIAGRAM.md) - Diagramas visuais

---

## Version History

| Versão | Data | Mudanças |
|--------|------|----------|
| **2.0.0** | 2026-02-15 | Reorganização modular em 3 documentos especializados (business, frontend, backend) |
| **1.0.0** | 2026-01-31 | Constitution inicial com todos os princípios em documento único |

---

**Esta constitution é a fonte única de verdade para arquitetura e padrões do GestaoEventos.**

Para detalhes de implementação específicos, sempre consulte os documentos especializados:
- Negócio → [business.md](business.md)
- Frontend → [frontend.md](frontend.md)
- Backend → [backend.md](backend.md)
