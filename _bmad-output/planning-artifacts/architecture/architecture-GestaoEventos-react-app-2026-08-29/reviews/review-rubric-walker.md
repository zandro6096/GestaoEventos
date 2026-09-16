# Rubric Walker Review - Architecture Spine

**Target:** `ARCHITECTURE-SPINE.md`  
**Checklist:** `bmad-architecture/references/reviewer-gate.md` good-spine checklist  
**Scope requested:** real divergence points for next level, enforceable AD rules, operational/environmental envelope, and bloated seed/detail only.  
**Spine editing:** not performed.

## Verdict

**Needs revision before handoff.**

The spine has the right paradigm and covers several real divergence points: Expo universal vs separate clients, Angular coexistence, layered boundaries, direct backend contract, auth/context, responsive route shell, analytics, offline read-only, adapters, and parity gate. The deterministic lint pass also returned zero mechanical findings.

It is not yet a good initiative-level build substrate because three high-impact areas can still diverge across the next layer: environment/release operations, route/flow parity evidence, and structure-context propagation into backend requests. It also carries more seed/detail than needed in stack and file-tree sections.

## Gate Notes

- Deterministic pass: `uv run .agents/skills/bmad-architecture/scripts/lint_spine.py --workspace _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29`
- Result: `ok=true`, `total_findings=0`
- Version currentness spot-check: the stack versions in the spine matched `npm view` on 2026-08-29 for the listed packages. No finding raised for stale package versions.

## Findings

### HIGH - Operational/environmental envelope is under-specified and wrongly defers release-shaping decisions

**Evidence**

- AD-12 only binds `EXPO_PUBLIC_API_URL` and fail-loud behavior for missing API configuration: `ARCHITECTURE-SPINE.md:118-122`.
- The spine defers "Store distribution profile details": `ARCHITECTURE-SPINE.md:299`.
- The ManagerPerson reference has real environment/build lanes in `eas.json` with development, preview, production, channels, and API URLs; the new spine does not decide the equivalent envelope for GestaoEventos.

**Why this matters**

At initiative altitude for an Expo universal app, environment and release topology are not implementation garnish. They control whether Android/iOS/web builds point at the right API, whether CORS/backend origins need to change, how preview builds are distributed, whether OTA updates are allowed, and how production incidents are diagnosed. If left deferred, separate stories can independently choose EAS profiles, web hosting path/domain, update channels, env variable names, and telemetry behavior.

**Divergence allowed**

- One story may deploy web as an Expo static export under a new domain while another assumes replacement under the current Angular host.
- One story may use EAS Update channels; another may require store-only releases.
- One story may add Sentry/crash reporting; another may rely on console-only diagnostics.
- Backend/CORS changes may be discovered late because no web/mobile origins are bound.

**Recommended fix**

Add one AD or an "Operational Envelope" section that binds at least:

- dev, preview, production build profiles and their API base sources;
- web hosting strategy during Angular coexistence;
- production CORS/origin expectation for React web and native;
- OTA/update-channel policy for Expo;
- minimal runtime monitoring/error reporting expectation;
- release smoke target per environment.

Do not defer store distribution profile details wholesale. Exact app-store metadata can wait, but the release/environment lanes should be a spine-level invariant.

### HIGH - Parity gate is directionally correct but not enforceable as an artifact

**Evidence**

- AD-13 requires "every React route/flow needs a parity checklist" but does not name a required file, schema, owner, or CI check: `ARCHITECTURE-SPINE.md:124-128`.
- The structural seed lists a subset of routes: `ARCHITECTURE-SPINE.md:169-205`.
- The current Angular route file contains additional productive/deep flows, including `admin/participacoes`, `admin/eventos/presenca-lote`, `checkin`, `admin/checkin/:eventoId`, `admin/painel/fila-semanal`, `admin/eventos/modelos`, and `admin/eventos/objetivos`: `GestaoEventos.Angular/src/app/app.routes.ts:174`, `245`, `345`, `351`, `393`, `420`, `427`.

**Why this matters**

The user explicitly decided the React app will only be released when everything works. Without a canonical parity manifest, downstream stories can each define "parity" differently. The broad capability map does not prevent missing a deep Angular route, a public route, a guarded admin path, or a backend endpoint used by the Angular flow.

**Divergence allowed**

- One implementation story may treat `eventos` as the only event surface and omit `presenca-lote`, objectives, occurrences, or statistics.
- QA may create smoke tests for only top-level tabs and miss productive deep routes.
- Release planning may claim full parity without traceability to Angular routes and backend endpoints.

**Recommended fix**

Add a rule that React must maintain a canonical parity manifest, for example `GestaoEventos.React/docs/parity/route-flow-map.md` or `tests/parity/route-flow-map.yaml`, with required fields:

- Angular route;
- React route;
- backing backend endpoint(s);
- auth/context/permission requirement;
- analytics events required;
- mobile/web layout expectation;
- smoke/E2E coverage status.

Then update AD-13 so release is blocked unless the manifest is complete for all Angular production routes and all required smoke entries pass.

### HIGH - Structure-context propagation into API requests is not bound tightly enough

**Evidence**

- AD-5 binds token storage, context revalidation, query invalidation, and client-side permission posture: `ARCHITECTURE-SPINE.md:76-80`.
- AD-4 binds request/response case conversion and `/api/...` usage: `ARCHITECTURE-SPINE.md:70-74`.
- The backend tenant middleware actively checks `estrutura_id`/`estruturaId` from query, path, or body and returns 403 when the authenticated user lacks access: `GestaoEventos.API/src/GestaoEventos.Web/Configurations/TenantIsolationMiddleware.cs:10-16`, `36-66`, `89-100`.
- Many backend requests explicitly bind `estrutura_id` and `grupo_id` as request fields or query params.

**Why this matters**

Multi-context is a non-negotiable domain rule. The spine says the client owns active context state, but it does not enforce how API services must receive and transmit that context. Downstream feature slices can choose to pass `estruturaId` manually, infer it in components, default it during development, put it in URL params inconsistently, or omit it on list reads. That creates tenant leakage risk, inconsistent cache keys, and hard-to-debug 403s.

**Divergence allowed**

- A feature hook may include `estruturaId` in React Query keys but forget to pass `estrutura_id` to the endpoint.
- One API service may accept `estruturaId` from a component; another may read Zustand directly; another may default to the first structure.
- Some requests may use camelCase despite the chosen boundary convention.

**Recommended fix**

Tighten AD-4 or AD-5 with an explicit context contract:

- all structure-scoped API methods must require `estruturaId` from the business layer or a typed context-aware API wrapper;
- API services must serialize it as the backend route expects, defaulting to `estrutura_id` for query/body unless the route path owns the structure id;
- components must never invent, default, or pass stale structure context;
- grouped requests must similarly require/validate `grupoId` when the backend operation is group-scoped;
- tests should cover at least one context-scoped query and mutation for missing/stale `estruturaId`.

### MEDIUM - Stack and structural seed are more detailed than a durable spine needs

**Evidence**

- The stack table pins many exact package patch versions: `ARCHITECTURE-SPINE.md:147-162`.
- The structural seed prescribes a large initial file tree with many concrete files/routes: `ARCHITECTURE-SPINE.md:166-236`.

**Why this matters**

The spine definition treats stack, tree, and detailed data shape as seed: useful at cold start, then owned by code. The listed packages are current, and the initial route shape is useful, but the density risks turning the spine into a scaffold spec. Future agents may overfit to the tree, create files before feature need, or treat exact package patch versions as architecture decisions rather than package-manager state.

**Divergence allowed**

This is lower risk than the first three findings, because the details mostly converge builders rather than split them. The risk is seed drift and overbuilding, not immediate architectural contradiction.

**Recommended fix**

Keep only load-bearing stack choices and directory invariants in the spine:

- Expo universal + Expo Router;
- React Query for server state;
- Zustand for true global client state;
- Axios API boundary;
- React Hook Form + Zod for complex forms;
- SecureStore for JWTs.

Move exact package versions and the full route/file scaffold into the initial scaffold story or package files, while keeping a minimal seed that names only folders and the primary route groups.

## Positive Coverage

- AD-1 and AD-6 fix the central web/mobile divergence with a single Expo route tree.
- AD-2 keeps Angular as production baseline and protects backend compatibility during coexistence.
- AD-3 is a clear, enforceable layered boundary that maps well to the current Angular three-layer rule.
- AD-7 correctly rejects ManagerPerson visual identity and binds GestaoEventos design language.
- AD-9 preserves the analytics funnel contract from scaffold.
- AD-10 avoids unsafe offline mutation queues for presence and permission workflows.
- AD-11 is an appropriate adapter invariant for Expo universal.

## Non-Findings

- Deterministic lint found no missing AD fields, placeholder tags, duplicate AD IDs, or unpinned stack versions.
- The stack versions listed in the spine matched `npm view` at review time, so current-version verification is not a blocker.
- No contradiction was found with the brownfield decision to keep Angular as the functional baseline and consume the existing backend directly.

## Recommended Gate Outcome

Hold the spine in draft until the three high findings are addressed. The medium seed/detail issue can be fixed during the same pass or accepted with a conscious decision if the team wants the spine to double as a scaffold guide.
