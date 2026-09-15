# Tasks: Auth & Onboarding

**Input**: Design documents from `/specs/006-auth-onboarding/`  
**Prerequisites**: [plan.md](./plan.md) ✅ | [spec.md](./spec.md) ✅  
**Feature Branch**: `006-auth-onboarding`  
**Generated**: 2026-03-08

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências de tasks incompletas)
- **[Story]**: User Story a que pertence (US1…US5 mapeados às histórias do spec.md)
- Caminhos de arquivo absolutos incluídos em cada task

---

## Dependencies (Ordem de Conclusão)

```
Phase 2 (Foundational)
  ↓
Phase 3 (US1) ← maior bloco, T004-T010
  ↓
Phase 4 (US2) ← T011 — pode rodar em paralelo com US3/US4
Phase 5 (US3) ← T012 — depende apenas da Phase 2
Phase 6 (US4) ← T013 — independente (stub puro)
Phase 7 (US5) ← T014-T015 — depende do AuthService (T007 deve estar merged)
  ↓
Phase 8 (Polish) ← T016-T017
```

**Paralelismo por story**: US2 (T011) e US3 (T012) podem ser implementadas em paralelo com US1 após Phase 2 estar completa.

---

## Phase 1: Setup

> Projeto já existe. Nenhuma inicialização de projeto necessária.

*Skipped — ambiente já configurado.*

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Correções de domínio e infraestrutura de roteamento que bloqueiam TODAS as user stories.

**⚠️ CRÍTICO**: Nenhuma implementação de user story pode iniciar antes desta fase estar completa.

- [X] T001 Tornar `Celular` nullable no domínio `Usuario` em `GestaoEventos.API/src/GestaoEventos.Core/Aggregates/UsuarioAgg/Usuario.cs` (adicionar overload `Create(nome, email, senha)` sem celular — manter overload existente)
- [X] T002 [P] Converter `LoginRedirectGuard` para `CanActivateFn` funcional em `GestaoEventos.Angular/src/app/core/guards/login-redirect.guard.ts` (injetar `AuthService`, redirecionar para `/admin/dashboard` se autenticado)
- [X] T003 Atualizar `GestaoEventos.Angular/src/app/app.routes.ts`: aplicar `loginRedirectGuard` em `auth/login`, adicionar rota `auth/cadastro` → `SignupComponent` (lazy), adicionar rota `auth/recuperar-senha` → stub, garantir `canActivate: [authGuard]` em `/admin/onboarding`

**Checkpoint**: Foundation completa — implementação das user stories pode começar em paralelo.

---

## Phase 3: User Story 1 — Cadastro & Onboarding (Priority: P1) 🎯 MVP

**Goal**: Novo usuário cria conta, passa pelo wizard de 3 passos e chega ao dashboard com estrutura e tipo de grupo criados.

**Independent Test**: Testador acessa `/auth/cadastro`, preenche nome/e-mail/senha, cria estrutura "Teste Org" com tipo de grupo "Célula", e vê o dashboard — sem nenhuma etapa manual no servidor.

- [X] T004 [P] [US1] Criar `CreateUsuarioCommand.cs` e `CreateUsuarioCommandValidator.cs` (FluentValidation: nome obrigatório, e-mail formato, senha min 8) em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/Create/`
- [X] T005 [US1] Criar `CreateUsuarioHandler.cs` em `GestaoEventos.API/src/GestaoEventos.UseCases/Usuarios/Create/` (verificar unicidade de e-mail via `IUsuarioRepository`, hash senha, `Usuario.Create()`, persistir, retornar `Result<UsuarioDto>`)
- [X] T006 [US1] Criar FastEndpoint `GestaoEventos.API/src/GestaoEventos.Web/Endpoints/Usuarios/Create.cs` (`POST /api/usuarios`, `AllowAnonymous`, request: `{Nome, Email, Senha}`, 201 em sucesso / 422 em e-mail duplicado)
- [X] T007 [US1] Adicionar método `cadastrar(nome, email, senha)` ao `GestaoEventos.Angular/src/app/core/services/auth.service.ts` (chama API de cadastro → em sucesso chama `this.login(email, senha)` para auto-autenticar)
- [X] T008 [P] [US1] Criar `GestaoEventos.Angular/src/app/pages/signup/signup.component.ts` (standalone, `ReactiveFormsModule`, campos: nome/e-mail/senha/confirmarSenha, cross-field match validator, PrimeNG `p-card`+`p-floatlabel`+`p-password[feedback]`, TailwindCSS, link para `/auth/login`, on success → `/admin/onboarding`, suporte a `?convite=TOKEN` na URL)
- [X] T009 [US1] Atualizar `GestaoEventos.Angular/src/app/shared/services/onboarding/onboarding.service.ts`: adicionar `stepAtual = signal<1|2|3>(1)`, `estruturaCriada = signal<Estrutura|null>(null)`, método `criarTiposGrupo(tipos[])` chamando `TiposGrupoApiService`, persistir `stepAtual` em `sessionStorage`
- [X] T010 [US1] Reescrever `GestaoEventos.Angular/src/app/libs/adm/onboarding/onboarding.component.ts` como wizard `p-steps` com 3 steps: Step 1 (nome+descrição da estrutura, chama `criarEstrutura()`), Step 2 (lista dinâmica de tipos de grupo, mínimo 1, chama `criarTiposGrupo()`), Step 3 (confirmação + botão "Ir para Dashboard" → `/admin/dashboard`)

**Checkpoint**: US1 completa e testável de forma independente.

---

## Phase 4: User Story 2 — Login Existente (Priority: P1)

**Goal**: Usuário existente faz login e é redirecionado corretamente (com estrutura → dashboard; sem estrutura → onboarding). Validação client-side antes de qualquer chamada HTTP.

**Independent Test**: Usuário com estrutura faz login e vai para dashboard. Usuário sem estrutura vai para onboarding. Credenciais erradas exibem mensagem sem revelar se e-mail existe.

- [X] T011 [US2] Atualizar `GestaoEventos.Angular/src/app/pages/login/login.component.ts`: converter `FormsModule`/ngModel para `ReactiveFormsModule` com `FormGroup` (campos: email+validators.email, senha+required), exibir erros inline com `p-message`, substituir link morto "Solicitar acesso" por `routerLink="/auth/cadastro"`, adicionar link "Esqueci minha senha" → `/auth/recuperar-senha`, aplicar `[loading]="carregando()"` no `p-button`, ajustar layout com TailwindCSS

**Checkpoint**: US1 + US2 completas e testáveis de forma independente.

---

## Phase 5: User Story 3 — Aceitar Convite sem Autenticação (Priority: P2)

**Goal**: Usuário não autenticado acessa link de convite, vê o nome da organização e pode criar conta ou fazer login — sem ser redirecionado para login de forma cega.

**Independent Test**: Testador sem sessão acessa `/aceitar-convite?token=VALID` e vê: nome do grupo/estrutura, papel atribuído, botão "Criar conta" → `/auth/cadastro?convite=TOKEN`, botão "Já tenho conta" → `/auth/login?convite=TOKEN`. Sem campos de senha visíveis.

- [X] T012 [US3] Bifurcar `GestaoEventos.Angular/src/app/libs/public/aceitar-convite/aceitar-convite.component.ts` para máquina de estados: `validating` → chama `validarToken(token)`; se inválido → estado `error` (mensagem + "Contate o remetente"); se válido + **não autenticado** → estado `unauthenticated` (exibir org+papel+2 CTAs, remover campos senha/confirmarSenha); se válido + **autenticado** → estado `authenticated` (fluxo atual de aceite — manter)

**Checkpoint**: US1 + US2 + US3 testáveis de forma independente.

---

## Phase 6: User Story 4 — Recuperar Senha (Priority: P2 — Descoped)

**Goal**: US4 foi descoped desta iteração (zero backend de reset de senha existe). Entregar stub navegável para não bloquear links na UI.

**Independent Test**: Link "Esqueci minha senha" na login page navega para `/auth/recuperar-senha` e exibe mensagem "Em breve" sem erro de rota.

- [X] T013 [US4] Criar `GestaoEventos.Angular/src/app/pages/recuperar-senha/recuperar-senha.component.ts` (standalone, componente stub com `p-message` severity="info" exibindo "Funcionalidade em breve. Entre em contato com o administrador." + link de volta para `/auth/login`)

**Checkpoint**: Rota `/auth/recuperar-senha` navegável sem erro — nenhuma funcionalidade real.

---

## Phase 7: User Story 5 — Troca de Contexto Multi-Estrutura (Priority: P3)

**Goal**: Usuário com ≥2 estruturas vê dropdown no header e troca de contexto em 1 clique sem re-login.

**Independent Test**: Testador com 2 estruturas vê `p-dropdown` no header com nomes das estruturas; ao selecionar a segunda, o dashboard recarrega com os dados corretos.

- [X] T014 [P] [US5] Adicionar método `selecionarEstrutura(estruturaId)` ao `GestaoEventos.Angular/src/app/core/services/auth.service.ts` (chama `ContextoApiService.getContextoInicial(usuarioId)` com nova estrutura, atualiza `ContextService.setContexto()`, navega para `/admin/dashboard`)
- [X] T015 [US5] Atualizar HeaderComponent em `GestaoEventos.Angular/src/app/libs/adm/layout/header/` para exibir `p-dropdown` de estruturas quando `ContextService.estruturas().length > 1`, com `onChange` chamando `authService.selecionarEstrutura(id)`; exibir nome como texto simples quando estrutura única

**Checkpoint**: US5 completa — troca de contexto funcional sem re-login.

---

## Phase 8: Polish & Qualidade

**Purpose**: Correções de bugs e validação final de build limpo.

- [X] T016 [P] Corrigir path hardcoded errado em `GestaoEventos.Angular/src/app/core/guards/auth-estrutura.guard.ts`: substituir `/onboarding` por `/admin/onboarding`
- [X] T017 Validar build limpo: `dotnet build GestaoEventos.API/src/GestaoEventos.Web/GestaoEventos.API.Web.csproj` + `ng build` — zero erros em ambos

---

## Parallel Execution Examples

### Sprint A (US1 backend + US1 frontend em paralelo após Phase 2):

```
[Agente 1 — Backend]        [Agente 2 — Frontend]
T001 → T004 → T005 → T006   T002 → T003 → T008
```

### Sprint B (US1 concluída — US2, US3, US4 em paralelo):

```
[Agente 1]   [Agente 2]   [Agente 3]
T009 → T010  T011         T012         T013
```

### Sprint C (todas as stories concluídas — polish):

```
T014 [P] T016
T015
T017 ← (aguarda todos)
```

---

## Implementation Strategy

**MVP (entrega mínima viável)**: Phases 2 + 3 + 4 = T001–T011

- Um novo usuário consegue criar conta, passar pelo onboarding e fazer login
- Usuário existente faz login com redirecionamento correto
- `ng build` e `dotnet build` passam

**Incremento 2**: Phase 5 (T012) — convites para não autenticados  
**Incremento 3**: Phase 6 (T013) — stub de recuperação de senha  
**Incremento 4**: Phase 7 (T014–T015) — context switcher multi-estrutura  
**Incremento final**: Phase 8 (T016–T017) — polish

---

## Summary

| Métrica | Valor |
|---------|-------|
| Total de tasks | 17 |
| Tasks US1 (P1 MVP) | 7 (T004–T010) |
| Tasks US2 (P1) | 1 (T011) |
| Tasks US3 (P2) | 1 (T012) |
| Tasks US4 (P2 stub) | 1 (T013) |
| Tasks US5 (P3) | 2 (T014–T015) |
| Tasks Foundational | 3 (T001–T003) |
| Tasks Polish | 2 (T016–T017) |
| Tasks paralelizáveis [P] | 7 |
| MVP scope (Phase 2+3+4) | T001–T011 |
