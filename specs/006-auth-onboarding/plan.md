# Implementation Plan: Auth & Onboarding

**Branch**: `006-auth-onboarding` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/006-auth-onboarding/spec.md`

**Note**: Plan gerado após pesquisa completa do codebase. US4 (Recuperar Senha) descoped para P3 — zero backend existe. Onboarding escolhido como full wizard overhaul.

---

## Summary

Implementar o fluxo completo de autenticação e onboarding do SaaS:
- **Track A — Backend** (Steps 1–3): `POST /api/usuarios` — endpoint de cadastro inexistente, construir stack completo Clean Architecture
- **Track B — Routing & Guards** (Steps 4–5): `loginRedirectGuard` funcional + atualização de `app.routes.ts`
- **Track C — UI** (Steps 6–12): Correção login, signup novo, `AuthService.cadastrar()`, wizard onboarding, `aceitar-convite` bifurcado, context switcher no header

**Decisões tomadas:**
- Backend registration: full Clean Arch stack (Command + Validator + Handler + Endpoint)
- US4 (Recuperar Senha): descoped — placeholder route `/auth/recuperar-senha` apenas
- Onboarding: reescrita total como `p-steps` wizard (3 etapas)
- Service ativo: `core/services/auth.service.ts` — demais services legados não são estendidos

---

## Technical Context

**Language/Version**: TypeScript / Angular 17 + .NET 8 (FastEndpoints + Clean Architecture + CQRS)  
**Primary Frontend Dependencies**: PrimeNG, TailwindCSS, Signals, ReactiveFormsModule  
**Backend Pattern**: Command → Handler → FastEndpoint, FluentValidation, Result pattern  
**Auth**: JWT via localStorage, `HelperJwt.isTokenValid()`  
**State**: `ContextService` (signals) em `core/services/` — único serviço de contexto a usar em novos componentes

**Constraints**:
- Standalone components only — sem NgModules
- 3 camadas obrigatórias: Component → Business Service → API Service
- Nunca HTTP direto no componente
- ReactiveFormsModule para todos os forms novos/atualizados
- Object Calisthenics obrigatório no backend

---

## Constitution Check

### ✅ Architecture Compliance

| Princípio | Status | Evidência |
|-----------|--------|-----------|
| Clean Architecture | ✅ PASS | Core → UseCases → Infrastructure → Web; `CreateUsuarioCommand` em UseCases, endpoint em Web |
| 3-Layer Frontend | ✅ PASS | Signup component → `AuthService` (business) → `AutenticacaoApiService` (HTTP) |
| Object Calisthenics | ✅ PASS | Handler com 1 nível indentação, sem else, Result pattern, sem primitivos expostos |
| Standalone Components | ✅ PASS | Todos os novos componentes standalone |
| Signals / BehaviorSubject | ✅ PASS | Estado local via signals; `ContextService` (BehaviorSubject existente) para estado compartilhado |
| No HTTP in Component | ✅ PASS | Componentes só injetam business services |

**GATE RESULT**: ✅ PASS

---

## Gaps Identificados na Pesquisa

| Gap | Impacto | Solução |
|-----|---------|---------|
| `POST /api/usuarios` não existe | Cadastro bloqueado | Build Track A completo |
| `loginRedirectGuard` não aplicado em `/auth/login` | Usuário autenticado vê login page | Step 4 |
| `/auth/cadastro` sem rota | FR-001 não atendido | Step 5 |
| `FormsModule`/ngModel no login | Sem validação client-side | Step 6 |
| Onboarding é painel flat, não wizard | FR-003 não atendido | Steps 9–10 |
| `aceitar-convite` assume autenticado | Novos usuários inviabilizados | Step 11 |
| Context switcher ausente no header | FR-009 não atendido | Step 12 |
| `AuthEstrutuaGuard` redireciona para `/onboarding` (path errado) | Bug latente | Step 5 |
| Sem `criarTiposGrupo()` no `OnboardingService` | Step 2 do wizard sem serviço | Step 9 |
| Zero endpoints de reset de senha | US4 inviável nesta iteração | Descoped — stub route |

---

## Project Structure

### Arquivos a criar

```text
GestaoEventos.API/src/
├── GestaoEventos.UseCases/
│   └── Usuarios/
│       └── Create/
│           ├── CreateUsuarioCommand.cs          [CREATE] Record + Result<UsuarioDto>
│           ├── CreateUsuarioCommandValidator.cs [CREATE] FluentValidation
│           └── CreateUsuarioHandler.cs          [CREATE] Handler CQRS
│
└── GestaoEventos.Web/
    └── Endpoints/
        └── Usuarios/
            └── Create.cs                        [CREATE] FastEndpoint POST /api/usuarios AllowAnonymous

GestaoEventos.Angular/src/app/
├── core/guards/
│   └── login-redirect.guard.ts                  [CREATE] CanActivateFn funcional
│
└── pages/
    └── signup/
        ├── signup.component.ts                   [CREATE] Standalone, ReactiveFormsModule
        └── signup.component.html                 [CREATE] PrimeNG + TailwindCSS
```

### Arquivos a modificar

```text
GestaoEventos.Core/
└── Aggregates/UsuarioAgg/
    └── Usuario.cs                                [MODIFY] Tornar Celular nullable (string?)

GestaoEventos.Angular/src/app/
├── core/
│   ├── guards/
│   │   ├── auth-estrutura.guard.ts              [MODIFY] Fix path /onboarding → /admin/onboarding
│   │   └── login-redirect/login-redirect-guard.ts [MODIFY] Converter para CanActivateFn
│   └── services/
│       └── auth.service.ts                       [MODIFY] Adicionar cadastrar(), selecionarEstrutura()
│
├── app.routes.ts                                 [MODIFY] Rotas novas + guards aplicados
│
├── libs/adm/
│   ├── onboarding/
│   │   └── onboarding.component.ts              [MODIFY] Reescrever como stepper wizard
│   ├── public/
│   │   └── aceitar-convite/
│   │       └── aceitar-convite.component.ts     [MODIFY] Bifurcação auth/unauth
│   └── layout/
│       └── header/
│           └── header.component.ts              [MODIFY] Context switcher dropdown
│
├── pages/
│   └── login/
│       └── login.component.ts                   [MODIFY] ReactiveFormsModule + validação + links
│
└── shared/services/
    └── onboarding/
        └── onboarding.service.ts                [MODIFY] criarTiposGrupo() + stepAtual signal + sessionStorage
```

---

## Track A — Backend: User Registration

### Step 1 — Verificar e corrigir domínio `Usuario`

**Arquivo**: `GestaoEventos.Core/Aggregates/UsuarioAgg/Usuario.cs`

Tornar `Celular` nullable (`string?`) ou adicionar factory overload `Create(nome, email, senha)` sem celular. Manter overload existente intacto. Seguir Object Calisthenics: sem primitivos expostos, value objects onde aplicável.

**Critério de conclusão**: Domínio compila sem erros; `Celular = null` é válido.

---

### Step 2 — Criar use case `CreateUsuario`

**Diretório**: `GestaoEventos.UseCases/Usuarios/Create/`

**`CreateUsuarioCommand.cs`**:
```csharp
public record CreateUsuarioCommand(string Nome, string Email, string Senha) : IRequest<Result<UsuarioDto>>;
```

**`CreateUsuarioCommandValidator.cs`** (FluentValidation):
- `Nome`: NotEmpty
- `Email`: NotEmpty + EmailAddress
- `Senha`: NotEmpty + MinimumLength(8)

**`CreateUsuarioHandler.cs`**:
1. Chamar `IUsuarioRepository.GetByEmailAsync(command.Email)` — se existir → `Result.Error("E-mail já cadastrado")`
2. Hash de senha via `IPasswordHasher` (ou `BCrypt` — verificar qual já está em uso)
3. Chamar `Usuario.Create(nome, email, senhaHash)`
4. `IRepository<Usuario>.AddAsync(usuario)`
5. Retornar `Result.Success(new UsuarioDto(id, nome, email))`

**Critério de conclusão**: Handler retorna `Result.Success` com dados do usuário criado; e-mail duplicado retorna `Result.Error`.

---

### Step 3 — Criar FastEndpoint `POST /api/usuarios`

**Arquivo**: `GestaoEventos.Web/Endpoints/Usuarios/Create.cs`

```
Route: POST /api/usuarios
AllowAnonymous: true
Request: CadastrarUsuarioRequest { Nome, Email, Senha }
Response: CadastrarUsuarioResponse { Id, Email, Nome }
```

Mapear `Result.Success` → HTTP 201; `Result.Error` → HTTP 422 com mensagem.

**Critério de conclusão**: `POST /api/usuarios` com body válido retorna 201; e-mail duplicado retorna 422.

---

## Track B — Routing & Guards

### Step 4 — Criar `loginRedirectGuard` funcional

**Arquivo**: `core/guards/login-redirect.guard.ts`

```typescript
export const loginRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.estahAutenticado() ? router.createUrlTree(['/admin/dashboard']) : true;
};
```

Substituir a classe `LoginRedirectGuard` legada. Não deletar o arquivo antigo neste step — apenas criar o novo export funcional no mesmo arquivo para não quebrar imports existentes.

**Critério de conclusão**: Usuário autenticado que acessa `/auth/login` é redirecionado para `/admin/dashboard`.

---

### Step 5 — Atualizar `app.routes.ts`

**Arquivo**: `GestaoEventos.Angular/src/app/app.routes.ts`

Mudanças:
1. Aplicar `canActivate: [loginRedirectGuard]` na rota `auth/login`
2. Adicionar rota `auth/cadastro` → `SignupComponent` (lazy)
3. Adicionar rota `auth/recuperar-senha` → componente stub com mensagem "Em breve" (inline ou componente simples)
4. Garantir que `/admin/onboarding` tem `canActivate: [authGuard]`

**Arquivo**: `core/guards/auth-estrutura.guard.ts`  
Fix: substituir `/onboarding` por `/admin/onboarding` onde hardcoded.

**Critério de conclusão**: `npm run build` sem erros; rotas novas navegáveis.

---

## Track C — UI Components

### Step 6 — Corrigir `LoginComponent`

**Arquivo**: `pages/login/login.component.ts`

Mudanças:
- Converter `FormsModule`/ngModel → `ReactiveFormsModule` com `FormGroup`
- Adicionar validators: `email` (Validators.email + required), `senha` (required)
- Exibir erros inline com `p-message` severity="error" abaixo de cada campo inválido
- Substituir link morto "Solicitar acesso" por `routerLink="/auth/cadastro"` com texto "Criar conta"
- Adicionar link "Esqueci minha senha" → `/auth/recuperar-senha`
- Loading state: `[disabled]="carregando()"` no botão; `[loading]="carregando()"` no `p-button`
- Layout: TailwindCSS para centering/spacing (remover CSS customizado onde possível)

**Critério de conclusão**: Tentar submit com campos vazios exibe erros. Links de cadastro e recuperação navegam corretamente.

---

### Step 7 — Criar `SignupComponent`

**Arquivo**: `pages/signup/signup.component.ts`

Campos: `nome` (required), `email` (required + email), `senha` (required, min 8), `confirmarSenha` (cross-field match validator).

Comportamento:
- On success: `router.navigate(['/admin/onboarding'])`
- Se URL contém `?convite=TOKEN`: após cadastro/login, chamar `aceitar convite` e navegar para dashboard (skip onboarding)
- Validação client-side antes de qualquer HTTP call
- `p-card`, `p-floatlabel`, `p-password [feedback]="true"`, `p-button`
- TailwindCSS layout; link "Já tenho conta? → /auth/login"

**Critério de conclusão**: Cadastro com dados válidos cria usuário (API 201) e redireciona para onboarding. Validação impede submit com campos inválidos.

---

### Step 8 — Adicionar `cadastrar()` e `selecionarEstrutura()` ao `AuthService`

**Arquivo**: `core/services/auth.service.ts`

**`cadastrar(nome, email, senha)`**:
1. Chama `AutenticacaoApiService.cadastrar()` (ou `UsuariosApiService.post()`)
2. Em sucesso → chama `this.login(email, senha)` para auto-autenticar

**`selecionarEstrutura(estruturaId)`**:
1. Chama `ContextoApiService.getContextoInicial(usuarioId)` com a estrutura selecionada
2. Chama `ContextService.setContexto()` com os novos dados
3. Navega para `/admin/dashboard`

**Critério de conclusão**: `authService.cadastrar()` retorna sem erro e usuário fica autenticado em seguida.

---

### Step 9 — Atualizar `OnboardingService`

**Arquivo**: `shared/services/onboarding/onboarding.service.ts`

Adicionar:
- `stepAtual = signal<1 | 2 | 3>(1)` — gerência de step
- `estruturaCriada = signal<Estrutura | null>(null)` — mantém resultado do step 1 para uso no step 2
- `criarTiposGrupo(tipos: {nome: string, icone: string}[])` → chama `TiposGrupoApiService.criar()` para cada item (sequencial ou forkJoin)
- Persistência do `stepAtual` em `sessionStorage` para sobreviver reload em mid-onboarding

**Critério de conclusão**: `criarTiposGrupo([{nome: 'Célula', icone: 'pi-users'}])` chama a API e retorna sem erro.

---

### Step 10 — Reescrever `OnboardingComponent` como wizard

**Arquivo**: `libs/adm/onboarding/onboarding.component.ts`

Converter para `p-steps` PrimeNG com 3 etapas:

**Step 1 — Criar Estrutura**:
- Campos: `nome` (required), `descricao` (optional)
- Botão "Próximo": chama `onboardingService.criarEstrutura()` → on success → `stepAtual = 2`
- Link secundário abaixo: "Entrar com convite" → fluxo de código de compartilhamento

**Step 2 — Tipos de Grupo**:
- Lista dinâmica de tipos (mínimo 1, máximo 5)
- Cada tipo tem: `nome` (input) + seletor de ícone (dropdown com ícones PrimeIcons pré-definidos)
- Sugestão default pré-populada: `[{nome: 'Grupo', icone: 'pi-users'}]`
- Botão "Próximo": chama `onboardingService.criarTiposGrupo()` → on success → `stepAtual = 3`
- Botão "Voltar": `stepAtual = 1`

**Step 3 — Confirmação**:
- Ilustração de sucesso (ícone PrimeIcons grande + mensagem motivacional)
- Resumo: nome da estrutura criada + quantidade de tipos de grupo definidos
- Botão único "Ir para o Dashboard" → `router.navigate(['/admin/dashboard'])`

**Critério de conclusão**: Wizard completo navega pelos 3 steps criando dados reais. Step 3 redireciona para dashboard.

---

### Step 11 — Bifurcar `aceitar-convite` para usuários não autenticados

**Arquivo**: `libs/public/aceitar-convite/aceitar-convite.component.ts`

Máquina de estados:
1. `validating` — chama `conviteService.validarToken(token)`
2. Se token inválido/expirado → estado `error`: mensagem clara + "Contate o remetente"
3. Se token válido + usuário **não autenticado** → estado `unauthenticated`:
   - Exibir: nome do grupo/estrutura, papel que será atribuído, remetente
   - CTA primário: "Criar conta" → `/auth/cadastro?convite=TOKEN`
   - CTA secundário: "Já tenho conta" → `/auth/login?convite=TOKEN`
   - **Remover** campos `senha`/`confirmarSenha` (pertencem ao signup)
4. Se token válido + usuário **autenticado** → estado `authenticated` (fluxo atual — manter)

**Critério de conclusão**: Acessar URL de convite sem login mostra informações do convite com dois CTAs; nenhum campo de senha visível.

---

### Step 12 — Context Switcher no Header

**Arquivo**: header component em `libs/adm/layout/header/`

Lógica:
- Injetar `ContextService`; ler `estruturas` signal (lista de estruturas do usuário)
- Se `estruturas.length > 1`: renderizar `p-dropdown` mostrando `nome` da estrutura ativa
  - `onChange`: chamar `authService.selecionarEstrutura(estruturaId)`
- Se `estruturas.length === 1`: exibir nome da estrutura como texto simples (sem dropdown)
- Width do dropdown: `auto` com min-width de 160px; colocado na área esquerda/centro do header

**Critério de conclusão**: Usuário com 2 estruturas vê dropdown no header; ao trocar, dashboard recarrega com dados da nova estrutura.

---

## Verification Checklist

| # | Teste | Como verificar |
|---|-------|----------------|
| 1 | `POST /api/usuarios` válido | curl/Postman → retorna 201 com `{id, nome, email}` |
| 2 | `POST /api/usuarios` e-mail duplicado | Mesma request duas vezes → segundo retorna 422 |
| 3 | Guard loginRedirect | `auth/login` com token JWT válido em localStorage → redireciona para dashboard |
| 4 | Signup flow | `/auth/cadastro` → preencher formulário → submit → redirecionado para `/admin/onboarding` |
| 5 | Validação do signup | Submit com campos vazios/inválidos → erros inline, nenhuma HTTP call disparada |
| 6 | Onboarding Step 1 | Criar estrutura → nome salvo no DB, step 2 é exibido |
| 7 | Onboarding Step 2 | Adicionar TipoGrupo → registro criado no DB, step 3 é exibido |
| 8 | Onboarding Step 3 | Botão "Ir para Dashboard" navega para `/admin/dashboard` |
| 9 | Convite unauth | `/aceitar-convite?token=VALID` sem sessão → org name + dois CTAs; sem campos de senha |
| 10 | Convite auth | `/aceitar-convite?token=VALID` com sessão → fluxo antigo de aceite funciona |
| 11 | Context switcher | Usuário com 2 estruturas vê dropdown; trocar estrutura recarrega dashboard |
| 12 | Build limpo | `dotnet build` + `ng build` — zero erros |

---

## Descoped (US4)

**Recuperar Senha (US4)** — P3, sem backend:

Entregável nesta spec: rota `/auth/recuperar-senha` → componente stub com `p-message` informando "Funcionalidade em breve". Link acessível a partir da página de login.

Backend completo (ForgotPassword + ResetPassword endpoints + email trigger) será especificado em spec separada quando o módulo de e-mail transacional for configurado em `Infrastructure/Email/`.

---

## Next Steps

```
/speckit.tasks
```

Gera `tasks.md` com breakdown atômico por user story, ordenado por dependência (Track A → Track B → Track C).
