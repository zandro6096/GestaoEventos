# Paridade de Grupos

## Escopo

A Story 4.1 porta a lista hierarquica de grupos da estrutura ativa para `/grupos` e `/admin/grupos`. A API usa `GET /api/grupos?estrutura_id=...&skip=...&take=...`, conforme o endpoint FastEndpoints e o `GrupoApiService` do Angular.

## Comportamento

- A lista transforma o contrato plano em arvore por `grupo_superior_id`, mantendo grupo como container persistente, separado de eventos.
- Busca por nome, filtro por nivel, expansao/recolhimento e drill-down para `/admin/grupos/:id` funcionam em mobile e web.
- Query keys incluem usuario, estrutura e grupo ativos; a rota e guardada por permissao dinamica `ler:grupos`.
- O detalhe e a gestao de membros/responsaveis foram entregues nas Stories 4.2 e 4.3; a auditoria final da Epic 4 fica em `docs/grupos-epic-parity.md`.

## Evidencias

`npm run check:grupos`, `npm run smoke:grupos` com Playwright/Edge em 390 px e 1440 px, `type-check`, `lint`, `test:scaffold` e `expo-doctor`.
