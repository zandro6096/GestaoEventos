---
baseline_commit: NO_VCS
---

# Story 4.2: Detalhe de Grupo

Status: review

## Story
As a usuario autorizado,
I want abrir um grupo e ver seu contexto,
So that eu entenda membros, responsaveis e relacoes antes de agir.

**Requirements covered:** FR12, FR13, NFR3, NFR5.

## Acceptance Criteria
1. Given grupo existente no contexto ativo When o usuario acessa `/grupos/[id]` Then a tela carrega detalhe, membros/responsaveis disponiveis e acoes permitidas And query key inclui `estruturaId` e `grupoId`.
2. Given grupo de outra estrutura When o usuario tenta acessar por URL direta Then a UI nao exibe dados indevidos And backend rejeita ou o client redireciona com erro acionavel.

## Tasks / Subtasks
- [x] Implementar rota de detalhe
  - [x] Carregar grupo por ID no contexto ativo.
  - [x] Tratar 404/403 sem quebrar shell.
- [x] Exibir secoes principais
  - [x] Resumo do grupo, pai/filhos, membros, responsaveis e eventos relacionados.
  - [x] Adaptar tabs/segmentos para mobile e desktop.
- [x] Adicionar acoes permitidas
  - [x] Editar grupo, gerenciar membros/responsaveis e abrir eventos vinculados.
  - [x] Centralizar permissao via facade.
- [x] Manter caches coerentes
  - [x] Invalidar detalhe/lista apos mudancas.
  - [x] Atualizar breadcrumb/contexto quando o grupo ativo for alterado.
- [x] Registrar analytics e manifesto
  - [x] Abertura de detalhe, acao de edicao e navegacao vinculada.

## Dev Notes

### Scope Boundaries
- Cria a tela de detalhe de grupo com dados, membros, responsaveis e eventos relacionados.
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
- GestaoEventos.Angular/src/app/features/grupo
- GestaoEventos.Angular/src/app/shared/services/grupo/grupo.service.ts
- GestaoEventos.Angular/src/app/shared/services/responsavel-grupo

### Backend Contracts
- GET /api/grupos/{Id:int}
- GET /api/grupos-membros
- GET /api/responsaveis-grupo
- GET /api/eventos

### React File Targets
- GestaoEventos.React/app/(app)/grupos/[id].tsx
- GestaoEventos.React/features/grupos/detalhe/*
- GestaoEventos.React/services/api/grupos-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/04-group-hierarchy.md
- .specify/memory/ux-flows/layout-structure.md

### Story-specific Cautions
- Eventos relacionados sao ocorrencias dentro do grupo; nao inverter dependencia.
- Breadcrumb nao deve virar fonte de contexto se a store disser outra estrutura.
- Nao exibir comando administrativo sem permissao.

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
- Rotas de smoke sugeridas: `/admin/grupos/1`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/04-group-hierarchy.md
- .specify/memory/ux-flows/layout-structure.md
- GestaoEventos.Angular/src/app/features/grupo
- GestaoEventos.Angular/src/app/shared/services/grupo/grupo.service.ts
- GestaoEventos.Angular/src/app/shared/services/responsavel-grupo

## Dev Agent Record

### Agent Model Used
GPT-5 Codex via `bmad-dev-story`.

### Debug Log References
- `npm run check:grupo-detalhe`
- `npm run smoke:grupo-detalhe`
- `npm run type-check`
- `npm run lint`
- `npm run test:scaffold`

### Completion Notes List
- Detalhe carrega grupo, hierarquia, membros, responsaveis e ocorrencias relacionadas por contratos reais.
- Query key preserva usuario, estrutura e grupo ativos; grupo de outra estrutura e recusado antes da exibicao.
- Abas e breadcrumb funcionam em mobile/web; eventos vinculados mantem navegacao para acompanhamento.
- Mutacoes administrativas foram mantidas na Story 4.3, conforme escopo sequencial.

### File List
- `GestaoEventos.React/services/api/grupos-api.ts`
- `GestaoEventos.React/features/grupos/detalhe/detalhe.service.ts`
- `GestaoEventos.React/features/grupos/detalhe/useGrupoDetalhe.ts`
- `GestaoEventos.React/features/grupos/detalhe/GrupoDetalheScreen.tsx`
- `GestaoEventos.React/app/(app)/admin/grupos/[id].tsx`
- `GestaoEventos.React/tests/grupo-detalhe.test.cjs`
- `GestaoEventos.React/tests/grupo-detalhe.smoke.cjs`
- `GestaoEventos.React/scripts/validate-grupo-detalhe.mjs`
- `GestaoEventos.React/docs/grupo-detalhe-parity.md`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/scripts/validate-scaffold.mjs`
- `GestaoEventos.React/package.json`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Detalhe de grupo implementado e validado para revisao.
