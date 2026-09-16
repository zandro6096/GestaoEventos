# Event List Parity Audit

## Angular baseline

- Route baseline: `GestaoEventos.Angular/src/app/app.routes.ts` exposes `/admin/eventos`.
- Primary list: `libs/adm/evento/evento.component.*` renders the operational event table and actions.
- Card/list precedent: `libs/adm/eventos/list/evento-list.component.*` shows the responsive card pattern with title, type and period filters.
- Data source: `shared/services/evento/evento.service.ts`, `shared/apis/evento/evento-api.service.ts` and `shared/apis/ocorrencia/ocorrencia-api.service.ts`.

## React coverage

- `/admin/eventos` and `/eventos` render `EventosListScreen` behind `RequirePermission`.
- The screen uses cards/list layout with `useWindowDimensions` and `layoutMetrics.desktopBreakpoint`.
- Filters cover period, group, status, type/template, responsible and title.
- The feature service separates planned events from materialized occurrences by using `tipo: 'evento'` and `tipo: 'ocorrencia'`.
- Filter parameters are preserved in the route params when the user applies, clears or paginates.
- Cancelled occurrences stay visible through `includeCanceladas: true` and a dedicated cancelled state in the card.

## Endpoint coverage

- `GET /api/eventos` supplies planned events scoped by `estrutura_id` and optional `grupo_id`.
- `GET /api/eventos/{id}` is mapped for detail readiness.
- `GET /api/ocorrencias` supplies occurrences scoped by `usuario_id`, `estrutura_id`, optional `grupo_id`, period window and `include_canceladas`.
- Client side case conversion keeps backend snake_case responses aligned with React camelCase models.

## Known gaps

- The backend list contract for planned events does not expose every Angular filter directly. React applies title, status, type/template, group label and responsible filters in the feature service after the scoped backend fetch.
- Occurrences opened from the list navigate directly to the operational follow-up screen, preserving the event ID and occurrence date in the route. The `/admin/eventos/:id/ocorrencias` path remains a compatibility alias for the same screen.
- Pagination merges planned event and occurrence page info conservatively because the two backend contracts return separate windows.

## Smoke evidence

- `npm run check:eventos-list` validates route wiring, endpoint names, filters, cancelled history, fixtures, analytics and parity manifest evidence.
- `npm run test:scaffold` includes `validate-eventos-list.mjs`.
- Fixtures cover success, empty, backend failure, mobile and web viewports under `tests/fixtures/eventos`.
