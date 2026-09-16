# Jornada Parity Audit

## Angular baseline

| Area | Evidence |
| --- | --- |
| Routes | `GestaoEventos.Angular/src/app/app.routes.ts` maps `/jornada` and `/admin/jornada` to `libs/adm/jornada/jornada.component`. |
| Personal frequency | `GestaoEventos.Angular/src/app/app.routes.ts` also maps `/frequencia` to the detailed personal frequency view. |
| UI sections | Angular Jornada exposes current events, personal frequency, history and upcoming meetings. |
| Data layer | `shared/services/jornada/jornada.service.ts` delegates HTTP to `shared/apis/jornada/jornada-api.service.ts`. |
| Analytics baseline | Angular uses `core/services/gtm.service.ts`; React keeps the same funnel model through `services/analytics/analytics.service.ts`. |

## React coverage

| React route or source | Coverage |
| --- | --- |
| `/jornada` | Authenticated personal Jornada route with real backend data. |
| `/admin/jornada` | Guarded alias for admin navigation parity. |
| `features/jornada/services/jornada.service.ts` | Composes current events, personal frequency, history, upcoming meetings and pending-presence summary. |
| `features/jornada/hooks/useJornada.ts` | React Query keys include active `estruturaId`, optional `grupoId` and `usuarioId`. |
| `features/jornada/screens/JornadaScreen.tsx` | Mobile tabs, desktop grid, empty/error/partial states and action panel. |
| `shared/guards/RequirePermission.tsx` | Covers insufficient permission state before rendering protected Jornada routes. |

## Endpoint coverage

| Backend endpoint | React use |
| --- | --- |
| `GET /api/ocorrencias` | Current-day and upcoming occurrences with `usuario_id`, `estrutura_id`, optional `grupo_id` and `somente_participante`. |
| `GET /api/participacoes` | Personal history for the authenticated user in the active structure. |
| `GET /api/participacoes/frequencia` | Personal frequency summary for the active structure. |
| `GET /api/pendencias/minhas/resumo` | Pending-presence group summary for the mobile accordion. |
| `GET /api/pendencias/minhas` | Pending-presence detail for the selected group. |

## Known gaps

| Gap | Status |
| --- | --- |
| Dedicated event detail/deep link | Verified. Expanded pending items open `/admin/eventos/acompanhar/:id` with the occurrence date. |
| Direct presence mutation from Jornada | Deferred to the event execution stories, because the current backend flow is owned by event attendance screens. |
| `/frequencia` detailed route | Outside Story 2 scope; basic frequency summary is present in Jornada. |

## Smoke evidence

| Scenario | Fixture or gate |
| --- | --- |
| Valid context with data | `tests/fixtures/jornada/success.json` and `check:jornada-parity`. |
| Valid context with empty state | `tests/fixtures/jornada/empty.json` and `check:jornada-parity`. |
| Operational error | `tests/fixtures/jornada/error.json` and `check:jornada-parity`. |
| Insufficient permission | `tests/fixtures/jornada/forbidden.json`, `RequirePermission` and `check:jornada-parity`. |
| Mobile layout | `tests/fixtures/jornada/mobile.json` and `check:jornada-responsive`. |
| Web layout | `tests/fixtures/jornada/web.json` and `check:jornada-responsive`. |

## Analytics evidence

| Event | Source |
| --- | --- |
| `visualization:screen_view` | `shared/components/RouteAnalyticsTracker.tsx` fires route visualization automatically. |
| `simulation:jornada:carregar_dados` | `features/jornada/hooks/useJornada.ts`. |
| `confirmation:jornada:carregar_sucesso` | `features/jornada/hooks/useJornada.ts`. |
| `click:jornada:carregar_erro` | `features/jornada/hooks/useJornada.ts`. |
| `entrance:btn:abrir_evento` | `features/jornada/screens/JornadaScreen.tsx`. |
| `simulation:jornada:evento_abrir_submit` | `features/jornada/screens/JornadaScreen.tsx`. |
| `confirmation:jornada:evento_abrir_success` | `features/jornada/screens/JornadaScreen.tsx`. |
| `entrance:btn:abrir_pendencia` | `features/jornada/screens/JornadaScreen.tsx`. |
| `simulation:jornada:pendencia_abrir_submit` | `features/jornada/screens/JornadaScreen.tsx`. |
| `confirmation:jornada:pendencia_abrir_success` | `features/jornada/screens/JornadaScreen.tsx`. |
| `entrance:btn:registrar_presenca` | `features/jornada/screens/JornadaScreen.tsx`. |
| `simulation:jornada:registrar_presenca_submit` | `features/jornada/screens/JornadaScreen.tsx`. |
| `confirmation:jornada:registrar_presenca_success` | `features/jornada/screens/JornadaScreen.tsx`. |

IDs and counts are sent only in `extra`; `detail` remains static and free of personal data.
