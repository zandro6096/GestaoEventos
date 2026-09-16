# Adversarial Divergence Review - GestaoEventos React App Architecture Spine

Reviewed artifact: `ARCHITECTURE-SPINE.md`  
Review type: BMad Architecture Reviewer Gate, adversarial divergence lens  
Date: 2026-08-29  
Deterministic lint: passed, 0 findings

## Verdict

Gate fails on semantic convergence. The spine is mechanically clean and contains the right architectural themes, but several rules are too underspecified to keep independently-built feature slices compatible. Two teams can obey every AD and still disagree on data contracts, query keys, permission checks, platform adapter behavior, route ownership, analytics taxonomy, and release parity evidence.

## Findings

- Shared data shapes are not canonicalized, so independently-built slices can type the same backend concepts differently while obeying AD-3, AD-4, AD-5, and AD-8.

  Example: the auth/context team defines `ActiveContext` as `{ usuario, estruturaAtual, estruturas, isOwner, permissionsByGroup }` because AD-5 discusses active context and permission authority. The eventos team defines `ContextScope` as `{ userId, estruturaId, grupoId, owner, permissoes: string[] }` because AD-4 says API services deserialize to camelCase and AD-5 only names the fields behaviorally. Both are compliant. They become incompatible when a shared `useCan()` hook, query key factory, or analytics context needs the same shape. The spine needs a canonical model owner and minimum shapes for `AuthSession`, `ActiveContext`, `EstruturaContext`, `GrupoScope`, `PermissionGrant`, paginated responses, and mutation errors.

- Envelope normalization is named but not specified, which lets API services return incompatible data shapes while obeying AD-4.

  Example: the grupos API service unwraps `{ data, total, pagina }` into `{ items, totalCount, page }`. The participantes API service returns `{ data, meta }` intact because it treats pagination as an existing envelope. Both can claim they normalized "existing envelopes such as data and pagination". Shared list components, infinite query hooks, and parity tests then cannot reuse the same contract. The spine needs one client-side pagination/result envelope and a rule for which layer unwraps it.

- Case conversion is underspecified for nested values, arrays, dates, enums, nulls, and non-JSON payloads.

  Example: the auth team writes a recursive `toSnakeCase`/`toCamelCase` that converts every object, including `Date` instances and nested arrays. The eventos team uses a shallow converter for query params and leaves nested recurrence rules untouched to match backend DTOs. Both obey AD-4 and the "case conversion at boundary" convention. They diverge on recurring event templates, filters, and optional fields, causing silent request mismatches. The spine needs a precise serialization contract: recursive JSON conversion, exclusions, date format, enum casing, empty/null behavior, and FormData/file handling.

- Query keys are only described by inclusion rules, not by a canonical factory or ownership model.

  Example: grupos implements keys as `['grupos', estruturaId]`, eventos implements `['estrutura', estruturaId, 'eventos', grupoId]`, and jornada implements `['jornada', userId, estruturaId]`. All include `estruturaId` where structure-scoped and `grupoId` where group-scoped, satisfying the spine. A context switch invalidating `['estrutura', oldId]` misses `['grupos', oldId]`; a presence mutation invalidating `['eventos', estruturaId]` misses jornada frequency. The spine needs a single `queryKeys` module with key families, invalidation groups, and mutation-to-invalidation rules.

- Context switch behavior is not defined as an atomic transaction.

  Example: one unit updates Zustand `estruturaId`, then asynchronously invalidates React Query. Another unit invalidates queries, then updates context store after the server validates the target structure. Both obey AD-5. During the transition, screens can fetch with a new store value and old cache, analytics can emit the wrong context, and permissions can be evaluated against stale grants. The spine needs an ordered `switchContext()` contract that gates rendering, cancels in-flight requests, updates store, clears invalid group selection, invalidates keys, and resumes navigation as one owned operation.

- Permission semantics can diverge because the spine does not define the client permission contract.

  Example: configuracoes builds `can(resource, action, grupoId)` from a normalized `PermissionGrant { recurso, acao, grupoId, descendentes }`. Eventos builds `hasPermission('CRIAR_EVENTO', grupoId)` from backend string codes listed in documentation. Both respect dynamic permissions and backend authority under AD-5. They cannot share guarded buttons, route guards, or disabled states. Owner bypass also remains ambiguous: one unit returns true for every `can()` when `isOwner`, another hides only when backend context explicitly includes grants. The spine needs a canonical client permission API, code vocabulary, owner handling, inheritance/descendant semantics, and "unknown permission" behavior.

- Backend endpoint ownership is not settled, so two slices can consume different endpoints for the same capability and still comply with AD-4 and AD-8.

  Example: jornada consumes `/api/participacoes` for the logged-in user's attendance, eventos consumes `/api/participacoes-evento` for writes, and relatorios consumes `/api/participacoes-eventos` for lists. All are real or documented backend routes and all sit under `/api/...`. Without an endpoint registry by capability, two teams may duplicate models for "participacao", disagree on status values, and miss invalidations after presence updates. The spine needs an API contract map that assigns each capability to an API service owner and names canonical read/write endpoints.

- Route ownership is not precise enough for deep workflows and overlapping domains.

  Example: eventos owns `app/(app)/eventos/acompanhar/[id].tsx`; presenca wants a direct `app/(app)/presenca/[ocorrenciaId].tsx`; jornada wants an event detail route under `jornada/eventos/[id]`. AD-6 allows deep workflows outside the tab bar and lists only some route seeds. All implementations can obey the route tree while fragmenting the same attendance flow across three route families. Deep links, back behavior, breadcrumbs/sidebar selection, analytics path mapping, and parity checklists then disagree. The spine needs a route registry with canonical route names, params, owning feature, aliases/redirects, and semantic path mapping.

- Route parameter semantics are not fixed.

  Example: `acompanhar/[id]` can mean `eventoId` to the eventos team, `ocorrenciaId` to the attendance team, or backend `configuracaoId` to a recurrence/template team. All can point at real backend concepts and still satisfy the structural route seed. A shared screen opened from push notifications, jornada, or meus eventos will fetch the wrong resource unless the route contract names the identifier. The spine needs explicit param names and resource identity rules for each dynamic route.

- Platform adapters are required but their contracts are not defined, so features can rely on incompatible adapter behavior while obeying AD-11.

  Example: secure storage adapter A exposes `getToken(): Promise<string | null>` and stores only the JWT. Adapter B exposes generic `getJson<T>(key)` and stores session plus context together. Analytics adapter A resolves immediately for no-op native; adapter B queues and returns a flush result. Notification adapter A returns Expo permission statuses; adapter B returns booleans. All behavior lives under `services/platform/*`, so all is compliant. Feature code then cannot be shared across web/native without adapter-specific assumptions leaking back in. The spine needs per-adapter interfaces, return types, error behavior, initialization order, and web/native parity expectations.

- Offline read-only is a product rule, but the enforcement boundary is not defined.

  Example: eventos blocks mutations in feature hooks when `online === false`; grupos blocks in the API client interceptor; auth allows token refresh offline from cache; contexto blocks structure switch only after server revalidation fails. All can claim AD-10 compliance. The user experience and data consistency diverge: some buttons are disabled, some submit then fail, some optimistically update. The spine needs a single network state adapter, mutation guard policy, React Query onlineManager wiring, retry policy, and UI error contract.

- Analytics instrumentation can diverge because the spine names the funnel stages but does not define an event registry.

  Example: the eventos team emits `confirmation` with `detail: 'evento:criar'`; the presenca team emits `confirmation` with `detail: 'presenca:registrar:success'`; the checkout/configuracoes team emits `simulation` on each step while onboarding emits it only on submit. These are all snake_case-ish and use the required actions. Funnels become non-comparable and migration data cannot be trusted. The spine needs a canonical analytics registry per route/flow: semantic `path`, required `action`, allowed `detail`, required/optional `extra`, and ownership.

- Analytics route visualization is ambiguous for Expo Router and may leak IDs despite AD-9.

  Example: one implementation tracks the concrete route `/eventos/acompanhar/42`; another tracks the Expo pattern `/eventos/acompanhar/[id]`; another manually maps it to `/presenca/lote/lista`. All can argue they emit route visualization and do not put IDs in `detail`. The tagging standard allows `custom_path` overrides, but the spine does not require normalized route patterns or specify where path mapping lives. The result is split pageview metrics and possible dynamic IDs in `custom_path`. The spine needs pattern-normalized paths and a single route-to-analytics mapper.

- The native analytics deferred decision conflicts with "analytics from scaffold" unless the no-op/queue behavior is pinned.

  Example: native provider A is no-op, so mobile funnel events disappear until a provider is selected. Native provider B queues locally, so events replay later with stale context/timestamps. Both are explicitly allowed by AD-9. This creates incompatible interpretation of "we have dados" across web and native. The spine needs to choose no-op vs durable queue for native before any mobile parity claim, or define native analytics as non-parity until provider selection.

- Release parity is required but not made measurable enough to prevent incompatible checklists.

  Example: one team defines parity against Angular routed `pages/admin`, which is sparse. Another defines parity against rich `libs/adm` components, which are not routed. A third defines parity against backend capabilities from `estado-atual.md`. All can satisfy AD-13 wording by maintaining a checklist "against the Angular equivalent". The release gate will then pass different scopes. The spine needs a parity source hierarchy and a checklist schema: canonical flow, Angular route/component reference, backend endpoint reference, React route, acceptance assertions, analytics events, permissions cases, platform coverage, and E2E evidence.

- "Every React route/flow needs a parity checklist" is too broad without ownership and lifecycle rules.

  Example: feature teams add internal routes, modals, settings pages, and hidden deep links. One team creates a parity checklist in a story file, another in test metadata, another as Markdown under the feature. All obey AD-13. Release tooling cannot discover or enforce completeness. The spine needs a fixed location and naming convention for parity artifacts and a CI-readable index.

- Error handling is underspecified across API, business hooks, and UI.

  Example: auth returns discriminated union results, eventos throws normalized `ApiError`, grupos returns Axios errors to hooks, and configuracoes maps `403` into a disabled-state toast. Each can claim API services preserve details and business layers map to actionable UI messages. Shared mutation components, retry handling, and E2E assertions become inconsistent. The spine needs a shared error type, HTTP status mapping, validation error shape, auth-expired behavior, and permission-denied behavior.

- The spine does not define shared enum/status vocabularies for event lifecycle and attendance.

  Example: eventos models status as backend strings like `EM_ANDAMENTO`; jornada maps them to lowercase UI strings; painel maps them to numeric chart categories; attendance uses localized labels for presence states. All can be camelCase response consumers under AD-4 and feature-owned UI under AD-8. Cross-feature filters, badges, analytics extras, and parity tests diverge. The spine needs canonical client enums for event lifecycle, participation status, recurrence type, permission codes, plan status, and invite status, with UI labels kept separate and configurable.

- There is no explicit request cancellation or race policy for auth/context-sensitive queries.

  Example: while switching structure, eventos has in-flight `/api/eventos` for the old structure; grupos has a new query for the new structure; painel retries a failed old request. All follow React Query and AD-5 invalidation. Late responses can repopulate stale data if keys are insufficient or mutation side effects update broad caches. The spine needs a cancellation policy tied to context switch, auth logout, token refresh failure, and app background/resume.

## Recommended Spine Fixes

- Add a "Shared Client Contracts" AD covering canonical models, pagination/result envelopes, enum vocabularies, and error shapes.
- Add a "Query Key and Invalidation Registry" AD requiring a centralized `queryKeys` module and mutation invalidation map.
- Add a "Context Switch Transaction" AD defining owned service, ordering, cancellation, cache invalidation, and navigation gating.
- Add a "Permission Contract" AD defining `can()`/`useCan()` semantics, permission code vocabulary, owner bypass, descendant scope, and unknown-state behavior.
- Add a "Route and Analytics Registry" AD assigning route owners, dynamic param semantics, semantic analytics paths, event details, and required extras.
- Add a "Platform Adapter Interfaces" AD pinning each adapter contract and whether native analytics is no-op or queued before parity.
- Add a "Parity Artifact Contract" AD defining source hierarchy, checklist schema, file location, and CI discoverability.

