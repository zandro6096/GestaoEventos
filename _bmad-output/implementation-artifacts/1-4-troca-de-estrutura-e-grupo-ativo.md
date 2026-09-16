---
baseline_commit: NO_VCS
---

# Story 1.4: Troca de Estrutura e Grupo Ativo

Status: review

## Story
As a usuario com multiplas estruturas,
I want trocar estrutura e grupo ativo com seguranca,
So that cada tela mostre somente dados do contexto selecionado.

**Requirements covered:** FR2, FR3, NFR3, NFR5, NFR9.

## Acceptance Criteria
1. Given o usuario possui mais de uma estrutura When ele troca a estrutura ativa Then queries escopadas sao canceladas/invalidadas And detalhes em cache da estrutura anterior sao removidos And `grupoId` e limpo se nao pertencer a nova estrutura.
2. Given a troca de estrutura falha no backend When a UI recebe erro Then o contexto anterior permanece consistente And o usuario recebe erro acionavel.

## Tasks / Subtasks
- [x] Criar modelo e store de contexto ativo
  - [x] Persistir apenas identificadores e metadados nao sensiveis.
  - [x] Expor seletores para estrutura atual, grupo atual e disponibilidade de troca.
- [x] Construir UI de troca de estrutura/grupo
  - [x] Usar padrao responsivo adequado ao shell.
  - [x] Indicar claramente contexto atual sem terminologia fixa de dominio.
- [x] Invalidar caches por contexto
  - [x] Adotar query keys com `estruturaId` e `grupoId` quando aplicavel.
  - [x] Limpar grupo ativo quando ele nao pertencer a estrutura selecionada.
- [x] Reidratar permissoes apos troca
  - [x] Recalcular facade de permissoes e menus dependentes.
  - [x] Tratar rollback visual se a troca falhar.
- [x] Registrar analytics de troca
  - [x] Enviar `entrance` ao abrir seletor e `confirmation` ao aplicar troca, sem IDs no `detail`.

## Dev Notes

### Scope Boundaries
- Permite alternar estrutura e grupo ativo mantendo cache, permissoes e navegacao coerentes.
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
- GestaoEventos.Angular/src/app/core/services/contexto.service.ts
- GestaoEventos.Angular/src/app/core/services/hierarchy-context.service.ts
- GestaoEventos.Angular/src/app/core/services/context-refresh.service.ts
- GestaoEventos.Angular/src/app/features/estrutura/selecionar

### Backend Contracts
- GET /api/contexto/inicial
- Endpoints de estruturas/grupos ja usados pelo Angular para listar contextos disponiveis

### React File Targets
- GestaoEventos.React/stores/context.store.ts
- GestaoEventos.React/services/api/contexto-api.ts
- GestaoEventos.React/shared/components/ContextSwitcher.tsx
- GestaoEventos.React/services/query/query-keys.ts

### UX and Product Notes
- .specify/memory/ux-flows/03-structure-management.md
- .specify/memory/ux-flows/04-group-hierarchy.md
- .specify/memory/ux-flows/layout-structure.md

### Story-specific Cautions
- Multi-contexto e regra de dominio obrigatoria; nunca misturar dados de estruturas diferentes no mesmo cache.
- Grupo e evento nao sao a mesma entidade.
- Se houver apenas uma estrutura, ainda manter o estado de contexto explicito.

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
- Rotas de smoke sugeridas: `/admin/jornada`, `/estrutura/selecionar`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/03-structure-management.md
- .specify/memory/ux-flows/04-group-hierarchy.md
- .specify/memory/ux-flows/layout-structure.md
- GestaoEventos.Angular/src/app/core/services/contexto.service.ts
- GestaoEventos.Angular/src/app/core/services/hierarchy-context.service.ts
- GestaoEventos.Angular/src/app/core/services/context-refresh.service.ts
- GestaoEventos.Angular/src/app/features/estrutura/selecionar

## Dev Agent Record

### Agent Model Used
GPT-5 Codex.

### Debug Log References
- RED: `node scripts/validate-context-switching.mjs` falhou antes da implementacao por ausencia de persistence, cache reset, hook e `ContextSwitcher`.
- GREEN/REGRESSION: `npm run check:context` OK.
- GREEN/REGRESSION: `npm run type-check` OK.
- GREEN/REGRESSION: `npm run lint` OK.
- GREEN/REGRESSION: `npm run test:scaffold` OK.
- GREEN/REGRESSION: `npx expo-doctor` OK.
- GUARDRAIL: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` sem ocorrencias.

### Completion Notes List
- Store de contexto agora expoe `selectedStructureId`, `selectedGroupId`, `canSwitchStructure`, snapshot e rollback.
- Seleção ativa de estrutura/grupo e persistida por adapter de plataforma em chave dedicada `selected_context`, sem token.
- Troca de estrutura cancela, remove e invalida queries escopadas por contexto, incluindo root `permissoes`.
- Hook `useContextActions` reidrata `GET /api/contexto/inicial`, aplica estrutura selecionada e restaura snapshot anterior em erro.
- `ContextSwitcher` mostra contexto atual, grupo quando houver, lista estruturas disponiveis e registra analytics de entrada/troca.
- Tela `/estrutura/selecionar` agora usa o mesmo fluxo de troca, com loading e erro acionavel.

### File List
- GestaoEventos.React/package.json
- GestaoEventos.React/app/(app)/estrutura/selecionar.tsx
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/context/hooks/useContextActions.ts
- GestaoEventos.React/features/context/screens/StructureSelectionScreen.tsx
- GestaoEventos.React/features/session/screens/AuthenticatedHomeScreen.tsx
- GestaoEventos.React/scripts/validate-context-switching.mjs
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/services/query/context-query-client.ts
- GestaoEventos.React/services/query/query-keys.ts
- GestaoEventos.React/services/session/auth-session.service.ts
- GestaoEventos.React/services/session/context-selection.service.ts
- GestaoEventos.React/shared/components/ContextSwitcher.tsx
- GestaoEventos.React/stores/context.store.ts
- _bmad-output/implementation-artifacts/1-4-troca-de-estrutura-e-grupo-ativo.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log
- 2026-09-02: Implementada troca de estrutura com persistencia de selecao, reset de queries, rollback e `ContextSwitcher`.
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
