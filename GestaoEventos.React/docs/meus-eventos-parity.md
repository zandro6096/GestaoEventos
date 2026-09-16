# My Events Parity Audit

## Angular baseline

- Route baseline: `GestaoEventos.Angular/src/app/app.routes.ts` exposes `/admin/eventos/meus`.
- Primary screen: `libs/adm/eventos/meus-eventos/meus-eventos.component.*`.
- Angular uses `OcorrenciaApiService.listar` with `usuario_id`, `estrutura_id`, `data_inicio`, `data_fim`, `include_canceladas=true` and optional group context.
- Angular also exposes `EventoConfiguracaoApiService.listarPorResponsavel` through `/api/eventos/configuracoes?responsavel_id=...`.
- Context switching is handled by the Angular context services before loading the occurrence window.

## React coverage

- `/admin/eventos/meus` and `/eventos/meus` render `MeusEventosScreen` behind `RequirePermission`.
- The hook uses `queryKeys.eventos.meus` with active `estruturaId`, optional `grupoId` and `usuarioId` in the query params.
- The service keeps `includeCanceladas: true`, paginates `GET /api/ocorrencias` until all pages for the requested window are consumed, and caches responsible configurations by user and structure.
- The initial request is limited to the current month. Selecting another month loads only that month once; `Todos do ano` is an explicit single annual query, and results are merged and deduplicated in the scoped React Query cache.
- When the active context has more than six groups, React loads only the lightweight group list and waits for the user to select a group before requesting occurrences.
- The screen follows the Angular event-cycle composition: year navigation, month chips, `Todos do ano`, cycle guidance, cancelled toggle, group-name tabs and event cards grouped by occurrence timeline.
- Recurring occurrences for the same event are rendered in one timeline card; single occurrences keep the event card treatment and both preserve loading, empty, error and success states.
- Desktop keeps text actions; compact layouts use icon actions with accessible labels to preserve the operational list density.
- Mutations for confirming a visit and cancelling an occurrence call the real occurrence endpoints and pass through `assertOnlineForMutation`.

## Endpoint coverage

- `GET /api/ocorrencias` loads personal/responsible occurrences scoped by authenticated user, `estrutura_id`, optional `grupo_id`, period and `include_canceladas`.
- `GET /api/eventos/configuracoes` loads configurations where the current user is responsible through `responsavel_id`.
- `POST /api/ocorrencias/{id}/confirmacao-responsavel` confirms responsible execution.
- `PUT /api/ocorrencias/{id}/status` marks cancellation with a required reason.
- The React `MeusEventosScreen` does not prefetch event cycles. The operational follow-up screen caches `/api/eventos/{id}/ciclos` per event, preventing repeated requests while navigating the same event.

## Known gaps

- There is no dedicated `/api/eventos/meus` route in the current backend. React uses the same occurrence and responsible-configuration contracts used by Angular.
- The backend still exposes cycles one event at a time. React avoids an N+1 cycle loop on the My Events list and reuses each follow-up cycle response in memory; a backend batch endpoint can be considered separately for legacy Angular parity.
- Cycle names are displayed when the occurrence contract provides a cycle reference; the guidance panel remains visible so the visual hierarchy matches Angular while the full cycle directory stays owned by the backend.

## Smoke evidence

- `npm run check:meus-eventos` validates route wiring, endpoint names, context-scoped query key, offline mutation guard, sections, fixtures, analytics and manifesto evidence.
- `npm run smoke:meus-eventos` exercises the group-name filter and captures 390px and 1440px visual evidence against mocked API contracts.
- The visual smoke captures the initial current-month view before switching to `Todos do ano`, covering the recurring-card timeline and the group filter behavior.
- `npm run test:scaffold` includes `validate-meus-eventos.mjs`.
- Fixtures cover success, empty, backend failure, structure switch and mobile viewport under `tests/fixtures/eventos`.
