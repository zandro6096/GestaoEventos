# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Single Source of Truth for Agent Rules

- The authoritative agent instructions live in `AGENTS.md` at repository root.
- This file is a convenience reference and must not redefine conflicting operational rules.
- If any rule here diverges from `AGENTS.md`, follow `AGENTS.md`.

## Repository Structure

This is a full-stack SaaS event management platform with two independent projects:

- `GestaoEventos.Angular/` — Angular 19 frontend
- `GestaoEventos.API/` — .NET 8 backend (Clean Architecture)

---

## Frontend — Angular

### Commands

```bash
# From GestaoEventos.Angular/
npm start              # Dev server with proxy to https://localhost:57678
npm run build          # Production build
npm test               # Karma/Jasmine test runner (watch mode)
npm run test:ci        # Headless CI test run with coverage
npm run lint           # ESLint
npm run format         # Prettier over src/**

# Run a single spec file
ng test --include='src/app/path/to/file.spec.ts'
```

The dev proxy (`proxy.conf.json`) forwards `/api` requests to `https://localhost:57678`. Use `npm run start:prod:api` to proxy against the production API instead.

### Architecture

```
src/app/
  core/          # Guards, interceptors, app-wide services (auth, hierarchy context)
  libs/
    layout/      # Shell: MainComponent, AppSidebar, AppTopbar, AppMenu, AppMenuItemComponent
    adm/         # Feature modules: eventos, grupos, painel, jornada, admin, etc.
    public/      # Unauthenticated pages (invite acceptance)
  pages/         # Route-level pages: auth flows, landing, email confirmation
  shared/
    apis/        # Raw HTTP services — one folder per resource
    services/    # Business services (wrap api/ with CacheService)
    components/  # ~70 reusable UI components
    styles/      # Global SCSS, theme tokens
```

Component authoring standard (mandatory): keep Angular components split across
`*.component.ts`, `*.component.html`, and `*.component.scss` (no inline template/styles).

### Service Layer Pattern

Components always call **business services**, never API services directly:

```
Component → BusinessService (cache) → CacheService → ApiService (HTTP) → Backend
```

- **API services** (`shared/apis/`): Pure HTTP. Responses pass through `HelperJson.toCamelCase()`, request bodies through `HelperJson.toSnakeCase()`.
- **Business services** (`shared/services/`): Wrap API calls in `CacheService.get()` for GETs; call `cache.invalidatePattern()` on mutations.
- **Cache keys**: `{resource}:{action}:{id}:{filters}` — e.g. `evento:list:1:*`.

### Hierarchy Context

The app is multi-tenant via a hierarchy: **Estrutura → Grupo → Papel (role)**. `HierarchyContextService` (core) holds the active context as Angular signals. The navigation menu and most permission checks re-evaluate reactively when this context changes.

- `isOwner()` — owner of the current Estrutura; bypasses all permission checks
- `PermissionsService.hasPermission(Permission.X)` — checks against the active context

### Layout Modes

`LayoutService` tracks menu mode (`static` | `overlay`) and mobile state. `MainComponent` applies CSS classes (`layout-static`, `layout-overlay`, `layout-mobile-active`) that drive sidebar visibility. On mobile, the menu closes automatically after navigation.

### Theme

Defined by CSS custom properties in `src/styles/_themes.scss`. Use `var(--bg-surface)`, `var(--text-primary)`, etc. — never hardcode colors. `ThemeService` persists preference to `localStorage` and falls back to system preference.

Breakpoints: `640px / 768px / 1024px / 1280px / 1536px`.

### Error Handling Pattern

```typescript
// In components:
error = signal(false);
errorType = signal<'network' | 'server' | 'generic'>('generic');

// On error:
const info = this.errorHandler.handleHttpError(err, 'Carregar dados');
this.errorType.set(info.type);
this.error.set(true);
```

Template uses `<app-error-state>`, `<app-skeleton-loader>`, and `<app-empty-state>` for consistent loading/error/empty UX.

---

## Backend — .NET API

### Commands

```bash
# From GestaoEventos.API/src/GestaoEventos.Web/
dotnet run                    # Start API (reads appsettings.local.json for secrets)
dotnet build                  # Build solution

# From solution root (GestaoEventos.API/)
dotnet test                   # All tests
dotnet test tests/Clean.Architecture.UnitTests/   # Unit tests only

# EF Core migrations (from GestaoEventos.Web/ directory)
dotnet ef migrations add MIGRATIONNAME -c AppDbContext \
  -p ../GestaoEventos.Infrastructure/GestaoEventos.API.Infrastructure.csproj \
  -s GestaoEventos.API.Web.csproj \
  -o Data/Migrations

dotnet ef database update -c AppDbContext \
  -p ../GestaoEventos.Infrastructure/GestaoEventos.API.Infrastructure.csproj \
  -s GestaoEventos.API.Web.csproj
```

Local secrets go in `appsettings.local.json` (gitignored). Required: `ConnectionStrings:Mysql`.

### Architecture (Clean Architecture)

```
GestaoEventos.Core          # Domain: aggregates, value objects, interfaces, specs
GestaoEventos.UseCases      # CQRS: Commands and Queries via MediatR handlers
GestaoEventos.Infrastructure # EF Core (MySQL), email (SES/SMTP), repositories
GestaoEventos.Web           # FastEndpoints, Program.cs, DI config, AutoMapper profiles
```

Dependency direction: **Web → UseCases → Core ← Infrastructure**.

### Endpoint Pattern (REPR via FastEndpoints)

Each endpoint lives in its own file under `GestaoEventos.Web/{Resource}/`:

```csharp
public class CreateEventoEndpoint : Endpoint<CreateEventoRequest, Response<EventoRecord>>
{
    public override void Configure() { Post(CreateEventoRequest.Route); /* auth */ }
    public override async Task HandleAsync(CreateEventoRequest req, CancellationToken ct)
    {
        var command = _mapper.Map<CreateEventoCommand>(req);
        var result = await _mediator.Send(command, ct);
        // map result → Response<T>, send with status code
    }
}
```

Validators are in a separate `*.Validator.cs` file in the same folder.

### JSON Serialization

The API uses `JsonNamingPolicy.SnakeCaseLower`. The Angular `HelperJson` helpers handle the camelCase ↔ snake_case conversion on the frontend.

### Domain Aggregates

Core aggregates: `Estrutura`, `Grupo`, `GrupoMembro`, `Evento`, `ExcecaoEvento`, `Participacao`, `Usuario`, `Papel`, `Assinatura`, `Plano`, `TipoEvento`, `TipoGrupo`, `Auditoria`, `Historico`.

### Auth & External Services

- JWT Bearer authentication (`FastEndpoints.Security`)
- SSO: Google, Facebook, Microsoft (configured in `appsettings.json` under `Sso`)
- Payments: Stripe (`Stripe.net`)
- Email: AWS SES or SMTP (configured under `Ses` / `Mailserver`)
- Hosting: Supports AWS Lambda (`Amazon.Lambda.AspNetCoreServer.Hosting`)
