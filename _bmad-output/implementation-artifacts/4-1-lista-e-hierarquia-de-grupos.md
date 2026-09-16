---
baseline_commit: NO_VCS
---

# Story 4.1: Lista e Hierarquia de Grupos

Status: review

## Story
As a usuario autorizado,
I want navegar pelos grupos da estrutura ativa,
So that eu encontre o container correto antes de operar pessoas ou eventos.

**Requirements covered:** FR12, NFR5, NFR6, UX-DR3.

## Acceptance Criteria
1. Given usuario com estrutura ativa When abre `/grupos` Then a lista/hierarquia carrega grupos do backend equivalente ao Angular And Grupo e modelado como container hierarquico, nao como Evento.
2. Given viewport mobile When a hierarquia e extensa Then a UI usa padrao navegavel ou cards expansivos And preserva breadcrumb ou caminho do grupo.

## Tasks / Subtasks
- [x] Criar API e tipos de grupos
  - [x] Mapear grupo, grupo pai, membros/responsaveis resumidos e status.
  - [x] Separar grupo de evento em tipos e nomes.
- [x] Implementar arvore/lista responsiva
  - [x] Exibir hierarquia com busca/filtros.
  - [x] Usar padrao compacto para desktop e navegacao por drilldown em mobile quando necessario.
- [x] Adicionar navegacao para detalhe
  - [x] Abrir `/admin/grupos/:id` ou rota equivalente definida para React.
  - [x] Preservar contexto e filtros ao voltar.
- [x] Aplicar permissoes
  - [x] Mostrar criar/editar/remover conforme facade.
  - [x] Bloquear dados fora da estrutura ativa.
- [x] Instrumentar analytics
  - [x] Entrada em grupos, filtro e abertura de detalhe.

## Dev Notes

### Scope Boundaries
- Porta a listagem hierarquica de grupos respeitando estrutura ativa.
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
- GestaoEventos.Angular/src/app/core/services/hierarchy-context.service.ts

### Backend Contracts
- GET /api/grupos
- GET /api/grupos/{Id:int}
- POST /api/grupos
- PUT /api/grupos/{Id:int}
- DELETE /api/grupos/{Id:int}

### React File Targets
- GestaoEventos.React/app/(app)/grupos/index.tsx
- GestaoEventos.React/features/grupos/*
- GestaoEventos.React/services/api/grupos-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/04-group-hierarchy.md
- .specify/memory/ux-flows/09-mobile-adaptations.md

### Story-specific Cautions
- Grupo e container hierarquico, nao ocorrencia ou evento.
- Nao carregar arvore de outra estrutura apos troca de contexto.
- Delecao, se exposta, deve seguir regras do backend e nao esconder erro.

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
- Rotas de smoke sugeridas: `/admin/grupos`.

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
- .specify/memory/ux-flows/09-mobile-adaptations.md
- GestaoEventos.Angular/src/app/features/grupo
- GestaoEventos.Angular/src/app/shared/services/grupo/grupo.service.ts
- GestaoEventos.Angular/src/app/core/services/hierarchy-context.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex via `bmad-dev-story`.

### Debug Log References
- `npm run check:grupos`
- `npm run smoke:grupos`
- `npm run type-check`
- `npm run lint`
- `npm run test:scaffold`

### Completion Notes List
- Lista paginada real por estrutura com montagem de arvore usando `grupo_superior_id`.
- Busca por nome, filtro por nivel, expansao/recolhimento e drill-down implementados.
- Rotas `/grupos` e `/admin/grupos` usam permissao dinamica e contexto ativo.
- Smoke Playwright/Edge passou em 390 px e 1440 px.

### File List
- `GestaoEventos.React/services/api/grupos-api.ts`
- `GestaoEventos.React/features/grupos/grupos.rules.ts`
- `GestaoEventos.React/features/grupos/useGrupos.ts`
- `GestaoEventos.React/features/grupos/GruposScreen.tsx`
- `GestaoEventos.React/app/(app)/admin/grupos.tsx`
- `GestaoEventos.React/app/(app)/admin/grupos/[id].tsx`
- `GestaoEventos.React/app/(app)/grupos/index.tsx`
- `GestaoEventos.React/tests/grupos.test.cjs`
- `GestaoEventos.React/tests/grupos.smoke.cjs`
- `GestaoEventos.React/scripts/validate-grupos.mjs`
- `GestaoEventos.React/docs/grupos-parity.md`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/scripts/validate-scaffold.mjs`
- `GestaoEventos.React/package.json`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Lista e hierarquia implementadas e validadas para revisao.
