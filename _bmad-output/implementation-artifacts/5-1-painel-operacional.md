---
baseline_commit: NO_VCS
---

# Story 5.1: Painel Operacional

Status: review

## Story
As a usuario autorizado,
I want consultar o painel principal,
So that eu veja indicadores operacionais do contexto ativo.

**Requirements covered:** FR14, NFR3, NFR5, NFR6, UX-DR5.

## Acceptance Criteria
1. Given usuario autenticado com estrutura ativa When abre `/painel` Then cards/indicadores carregam dos contratos backend equivalentes ao Angular And erro, vazio e loading sao estados distintos And dados respeitam contexto ativo.

## Tasks / Subtasks
- [x] Criar API de painel
  - [x] Mapear comparativo, painel por estrutura/tipo e dados agregados ja existentes.
  - [x] Normalizar contratos em tipos client.
- [x] Implementar tela de painel
  - [x] Exibir indicadores principais, filtros por periodo/grupo/tipo e estados de carregamento.
  - [x] Usar visual operacional denso, nao landing page.
- [x] Aplicar contexto e permissao
  - [x] Carregar apenas estrutura ativa.
  - [x] Ocultar indicadores sem permissao e tratar 403.
- [x] Criar componentes reutilizaveis de metrica
  - [x] Cartoes compactos, tabela/lista e grafico simples quando houver dados.
  - [x] Evitar layout que dependa de largura fixa.
- [x] Registrar analytics
  - [x] Entrada, filtro e abertura de drilldown.

## Dev Notes

### Scope Boundaries
- Porta o painel operacional com indicadores reais e filtros por contexto.
- Esta historia deve preparar uma fatia executavel sem substituir o app Angular produtivo nesta etapa.
- Se algum contrato esperado nao existir no backend real, registrar a lacuna no manifesto/ledger em vez de criar comportamento ficticio no client.

### Architecture Guardrails
- Manter o app React como app paralelo em `GestaoEventos.React`; nao alterar o Angular produtivo nem o backend salvo se a story declarar explicitamente um contrato ausente.
- Seguir a arquitetura Expo Universal, Feature-Sliced e camadas `screen -> feature service/hook -> services/api -> backend` definida no architecture spine.
- Consumir o backend existente diretamente, sem BFF e sem criar endpoints `/api/v1` ficticios.
- Todo dado sensivel de sessao fica em adapter seguro de plataforma; Zustand guarda apenas estado derivado/nao sensivel.
- Todas as consultas e mutacoes devem carregar `estruturaId` e, quando aplicavel, `grupoId` no contrato ou no contexto de query key.
- Nao fazer checagem direta de papel em tela; usar facade `can(...)`/permissoes dinamicas quando a decisao for de autorizacao.

### Existing Foundation / Previous Story Intelligence
- Stories 1.1, 7.1 e 1.2 ja existem como `Status: done` e formam a base tecnica inicial.
- `GestaoEventos.React` ja possui Expo Router, rotas publicas de auth, `http-client`, conversao camel/snake, aviso de configuracao de API, banner offline, analytics de rota e validadores de scaffold.
- `GestaoEventos.React/docs/parity-manifest.md` e o ledger de Story 7.1 sao a fonte de acompanhamento de paridade durante a migracao.
- O bug levantado sobre pessoa inativa/reativacao deve ser preservado nas stories de membros/admin: pessoa inativa nao deve ficar presa em fluxo de reenviar convite quando a acao correta for reativar.

### Angular Source Hints
- GestaoEventos.Angular/src/app/features/painel
- GestaoEventos.Angular/src/app/shared/services/painel/painel.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

### Backend Contracts
- GET /api/paineis/comparativo
- GET /api/painel/{estruturaId}/{tipo}
- GET /api/paineis/cockpit

### React File Targets
- GestaoEventos.React/app/(app)/painel/index.tsx
- GestaoEventos.React/features/painel/*
- GestaoEventos.React/services/api/painel-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/06-dashboard-views.md
- .specify/memory/ux-flows/07-reports-analytics.md

### Story-specific Cautions
- Painel administrativo deve ser quieto e escaneavel, sem composicao de marketing.
- Nao agregar dados de outra estrutura no cache.
- Se a API nao retornar algum indicador do Angular, registrar lacuna em vez de fabricar valor.

### Analytics and Parity
- Toda rota nova deve gerar `visualization` pelo tracker transversal.
- Interacoes relevantes devem usar `entrance`, `simulation` e `confirmation` conforme `docs/analytics/tagging-standard.md`.
- Nao incluir nomes, emails, telefones, documentos ou IDs em `detail`; usar `extra` tecnico somente quando indispensavel.
- Atualizar `GestaoEventos.React/docs/parity-manifest.md` antes de mover a story para review/done.

### Testing Requirements
- Executar, no minimo, em `GestaoEventos.React`: `npm run type-check`, `npm run lint`, `npm run test:scaffold` e `npm run check:platform`.
- Rodar `npx expo-doctor` quando dependencias, Expo config ou scripts forem alterados.
- Adicionar smoke web/mobile para as rotas tocadas pela story, usando API mockada ou fixture local quando nao houver ambiente backend autenticado disponivel.
- Atualizar `GestaoEventos.React/docs/parity-manifest.md` com evidencia objetiva da paridade validada.
- Executar busca de regressao para terminologia/contratos indevidos: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React`.
- Rotas de smoke sugeridas: `/admin/painel`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/06-dashboard-views.md
- .specify/memory/ux-flows/07-reports-analytics.md
- GestaoEventos.Angular/src/app/features/painel
- GestaoEventos.Angular/src/app/shared/services/painel/painel.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run lint` inicialmente apontou imports nao usados e tipos `Array<T>` no novo painel; ambos foram corrigidos.
- Smoke inicial falhou por strict mode ao localizar o nome do grupo duplicado entre filtro e lista; o teste passou a usar o nome acessivel da acao de abertura.

### Completion Notes List
- Criado contrato `painelApi` para `GET /api/painel/{estruturaId}/{tipo}`, com envelope camelCase normalizado e escopo de estrutura/grupo.
- Criado hook React Query com filtros de indicador, periodo e grupo, estados de loading/vazio/erro/403 e analytics seguro.
- Substituido placeholder de `/admin/painel` por painel operacional responsivo; criado alias `/painel`.
- Adicionado smoke Playwright para mobile e desktop e validador de paridade integrado ao `test:scaffold`.

### File List
- `GestaoEventos.React/services/api/painel-api.ts`
- `GestaoEventos.React/services/query/query-keys.ts`
- `GestaoEventos.React/features/painel/hooks/usePainel.ts`
- `GestaoEventos.React/features/painel/screens/PainelScreen.tsx`
- `GestaoEventos.React/app/(app)/admin/painel.tsx`
- `GestaoEventos.React/app/(app)/painel/index.tsx`
- `GestaoEventos.React/scripts/validate-painel.mjs`
- `GestaoEventos.React/tests/painel.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Story 5.1 implementada e movida para review apos validacoes automatizadas.
