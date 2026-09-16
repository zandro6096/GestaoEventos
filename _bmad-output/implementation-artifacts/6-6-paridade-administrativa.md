---
baseline_commit: NO_VCS
---

# Story 6.6: Paridade Administrativa

Status: review

## Story
As a time de produto,
I want comprovar que administracao esta em paridade,
So that rotas sensiveis possam ir para go-live com confianca.

**Requirements covered:** FR16, FR17, FR18, FR20, NFR8, NFR9.

## Acceptance Criteria
1. Given Epic 6 implementado When a validacao roda Then manifesto cobre configuracoes, membros, papeis, permissoes, tipos, planos, assinatura, limites e auditoria And smoke cobre pelo menos uma rota administrativa guardada And usuarios sem permissao nao acessam dados.

## Tasks / Subtasks
- [x] Auditar paridade admin
  - [x] Configuracoes, membros, papeis, permissoes, tipos, planos, assinaturas, auditoria e suporte.
  - [x] Comparar Angular/backend e registrar lacunas.
- [x] Completar analytics admin
  - [x] Visualization automatica e eventos de entrada/simulacao/confirmacao.
  - [x] Sanitizar detalhes.
- [x] Criar smokes admin
  - [x] Rotas protegidas, sem permissao, membro inativo/reativacao, papeis, tipos e auditoria.
  - [x] Cobrir mobile e web.
- [x] Validar troca de contexto
  - [x] Garantir que dados administrativos mudem/limpem apos troca de estrutura.
  - [x] Confirmar invalidacao de permissoes.
- [x] Atualizar manifesto
  - [x] Deixar Epic 6 pronta para review de execucao.

## Dev Notes

### Scope Boundaries
- Fecha configuracoes/admin com paridade documentada, analytics e testes.
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
- GestaoEventos.Angular/src/app/features/admin
- GestaoEventos.Angular/src/app/app.routes.ts

### Backend Contracts
- Contratos das Stories 6.1 a 6.5

### React File Targets
- GestaoEventos.React/features/admin/*
- GestaoEventos.React/features/configuracoes/*
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/scripts/*

### UX and Product Notes
- .specify/memory/ux-navigation.md
- docs/analytics/tagging-standard.md

### Story-specific Cautions
- Nao marcar paridade se reativacao de inativos e permissoes dinamicas nao estiverem cobertas.
- Rotas admin devem falhar fechadas.
- Nao vazar dados sensiveis em logs/analytics.

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
- Rotas de smoke sugeridas: `/configuracoes`, `/configuracoes/membros`, `/configuracoes/papeis`, `/configuracoes/auditoria`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-navigation.md
- GestaoEventos.Angular/src/app/features/admin
- GestaoEventos.Angular/src/app/app.routes.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run check:epic6`
- `node tests/epic6.smoke.cjs`
- `npm run test:scaffold`
- `npm run type-check`
- `npm run lint`
- `npm run check:platform`
- `npx expo-doctor`

### Completion Notes List
- Manifesto auditado para configuracoes, membros, papeis, permissoes, tipos, planos, assinatura, limites, auditoria e suporte.
- Agregador `epic6.smoke` executa os quatro conjuntos de smoke das rotas administrativas.
- Smokes passaram em 390px e 1440px para autorizado e bloqueado, incluindo pessoa inativa/reativacao, papeis, tipos e auditoria.
- Rotas administrativas usam `RequirePermission`, hooks usam `can(...)` e queries incluem contexto; lacunas de reativacao, tickets e indicadores estao registradas sem comportamento ficticio.
- Analytics administrativos nao expõem PII, IDs ou payloads sensiveis em `detail`.

### File List
- `GestaoEventos.React/scripts/validate-epic6-parity.mjs`
- `GestaoEventos.React/tests/epic6.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/tests/configuracoes.smoke.cjs`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Auditoria administrativa concluida e movida para review; agregador de paridade validado no Windows.
