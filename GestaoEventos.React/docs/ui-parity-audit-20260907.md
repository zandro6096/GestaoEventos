# React UI Parity Audit

## Standard

All authenticated routes use the shared app shell: structure context in the header, responsive navigation, page background `#FAFBFC`, constrained content, semantic colors, rounded surfaces and touch targets of at least 44px. Domain screens may add their own data hierarchy, but must keep the same page rhythm.

## Canonical routes

| Area | Routes | Current status |
| --- | --- | --- |
| Auth | `/auth/login`, `/auth/cadastro`, `/auth/recuperar-senha`, `/auth/redefinir-senha`, `/aceitar-convite`, `/confirmar-email`, `/auth/sso/callback` | Shared public auth layout and real API states |
| Context | `/estrutura/selecionar` | Real structure selection and context rehydration |
| Jornada | `/jornada` | Real data, responsive tabs, pending accordion and action panel |
| Eventos | `/eventos/meus`, `/admin/eventos/meus` | Angular-aligned month/group filters, timeline cards and on-demand month loading |
| Event creation | `/admin/eventos/criar`, `/eventos/iniciar`, `/admin/eventos/iniciar` | Direct 4-step event form plus template-based start flow; both use real groups, templates, conflict validation and event creation APIs |
| Event templates/objectives | `/admin/eventos/modelos`, `/admin/eventos/objetivos` | Dedicated model catalog/form and objective configuration; these routes no longer use placeholders |
| Event follow-up | `/eventos/acompanhar/:id`, `/admin/eventos/acompanhar/:id` | Real occurrence, participant, cycle and attendance workflow |
| Bulk attendance | `/admin/eventos/presenca-lote` | Real occurrence picker opening the batch attendance workflow |
| Groups | `/grupos`, `/admin/grupos`, `/admin/grupos/:id` | Hierarchy, group detail, members, responsible people and events |
| Operational views | `/painel`, `/admin/painel`, `/painel/cockpit`, `/admin/painel/cockpit`, `/painel/fila-semanal`, `/admin/painel/fila-semanal` | Real scoped data and consistent loading, empty and error states |
| Reports | `/relatorios/frequencia`, `/admin/relatorios/frequencia` | Real scoped report filters and responsive participant list |
| Administration | `/configuracoes/*`, `/admin/*` | Real member, role, type, commercial, audit and support screens, guarded by dynamic permissions |
| Account | `/perfil` | Active account and context information with logout action |

## Review rules

- Keep the shared header and bottom navigation untouched when adjusting an individual screen.
- Use the existing tokens in `shared/design/tokens.ts`; do not introduce a new color or radius for a single route.
- Preserve the four states: loading, empty, error and success. Mutations must keep the offline guard.
- For mobile, prefer stacked cards and horizontal chips with no page-level horizontal overflow. For desktop, constrain the reading width and use columns only when comparison benefits from it.
- A route alias may reuse a screen, but it must not create a second visual implementation of the same workflow.

## Evidence

- `node tests/jornada.smoke.cjs`, `npm run smoke:meus-eventos`, `npm run smoke:evento-inicio`, `npm run smoke:acompanhamento`, `npm run smoke:presenca`, `npm run smoke:grupos`, `npm run smoke:grupo-detalhe`, `npm run smoke:painel`, `npm run smoke:cockpit`, `npm run smoke:relatorios`, `npm run smoke:configuracoes` and `npm run smoke:admin` cover 390px and 1440px where the route has a dedicated smoke.
- `npm run type-check`, `npm run lint` and `npm run build:web` are required before release.

## Visual comparison completed

The React review was performed against the running Angular application, using mobile captures at 390px and source-level confirmation for the desktop layout. The following surfaces were compared page by page and adjusted where the hierarchy differed: Jornada, Meus Eventos, acompanhamento de evento, Grupos, Painel Comparativo, Configuracoes, Usuarios da Estrutura, Auditoria and Relatorio de Frequencia.

The administrative screens now use the same Angular rhythm: framed white page header, explicit functional title, active-context copy, separated filter surface and semantic empty/loading/error states. Actions and fields remain limited to backend contracts already available in React; no visual control was added without a real operation behind it.
