# Epic 5 Parity Audit

## Scope

The React app ports the productive Angular operational views as an Expo Universal surface:

- `/admin/painel` keeps the comparative panel and its period/group/type filters.
- `/admin/painel/cockpit` keeps the KPI summary, alerts, filters, participant/template matrix and absence drilldown.
- `/admin/painel/fila-semanal` keeps the weekly read-only queue.
- `/relatorios/frequencia` adds the confirmed frequency report composition from cockpit and matrix contracts.

## Responsive Decisions

Desktop keeps a sidebar and a constrained analytical canvas. Mobile keeps the bottom navigation limited to primary flows; reports remain available from deep links and the desktop secondary navigation so the small-screen bar stays scannable. Analytical blocks wrap vertically on narrow screens and use horizontal filter scrolling where option labels need more room.

## Contract Decisions

Only backend routes confirmed in the API and Angular services are used. The report does not call the speculative `/api/reports` routes described in the UX concept document. Export, scheduling and sharing remain hidden until a real backend contract and permission model exist.

## Evidence

- `check:painel`, `smoke:painel`
- `check:cockpit`, `smoke:cockpit`
- `check:relatorios`, `smoke:relatorios`
- `smoke:epic5` runs the three route smokes at 390px and 1440px.
- The frequency smoke renders a 200-person fixture to exercise a larger analytical list without blocking filter interaction.
- `type-check`, `lint`, `test:scaffold`, `npx expo-doctor`

Analytics uses automatic route visualization and sanitized detail names. Dynamic IDs and counts stay in `extra`; no user names, emails or IDs are placed in the detail string.
