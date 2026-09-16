---
baseline_commit: NO_VCS
---

# Story 1.5: Guards e Facade de Permissao

Status: review

## Story
As a usuario com permissoes dinamicas,
I want ver apenas rotas e acoes disponiveis para meu contexto,
So that a UI seja coerente sem substituir a autoridade do backend.

**Requirements covered:** FR4, NFR1, NFR3, NFR9, UX-DR6.

## Acceptance Criteria
1. Given contexto hidratado com permissoes When uma tela decide mostrar menu, botao ou rota Then a decisao passa por `can(action, resource, scope)` And componentes nao checam papel bruto diretamente.
2. Given o backend rejeita uma acao por permissao When a mutacao retorna erro autorizado/forbidden Then a UI preserva o erro real And nao aplica owner bypass no componente.

## Tasks / Subtasks
- [x] Criar tipos canonicos de permissao
  - [x] Mapear recursos, acoes e escopos usados pelo backend/Angular.
  - [x] Normalizar retorno de permissao para uso em tela e mutacao.
- [x] Implementar facade `can(...)`
  - [x] Suportar contexto de estrutura, grupo e recurso.
  - [x] Isolar owner bypass dentro da facade, nao nas telas.
- [x] Criar guards de rota e acao
  - [x] Bloquear rotas administrativas sem permissao.
  - [x] Desabilitar ou ocultar comandos conforme convencao de UX existente.
- [x] Integrar tratamento 401/403 do `http-client`
  - [x] 401 deve encerrar sessao quando aplicavel.
  - [x] 403 deve exibir feedback de autorizacao sem perder estado da tela.
- [x] Cobrir menus e rotas iniciais
  - [x] Aplicar guard no shell, jornada admin, eventos, grupos, painel e configuracoes.

## Dev Notes

### Scope Boundaries
- Centraliza autorizacao do app React em guards e facade de permissao dinamica.
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
- GestaoEventos.Angular/src/app/core/guards/permission.guard.ts
- GestaoEventos.Angular/src/app/core/services/hierarchy-permissions.service.ts
- GestaoEventos.Angular/src/app/shared/services/permissions/permissions.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

### Backend Contracts
- GET /api/permissoes/recursos
- GET /api/permissoes/responsavel/{responsavelId}/grupo/{grupoId}
- POST /api/permissoes/atribuir
- POST /api/permissoes/revogar

### React File Targets
- GestaoEventos.React/services/permissions/permission.facade.ts
- GestaoEventos.React/services/api/permissoes-api.ts
- GestaoEventos.React/shared/guards/RequirePermission.tsx
- GestaoEventos.React/app/(app)/_layout.tsx

### UX and Product Notes
- .specify/memory/business.md
- .specify/memory/ux-navigation.md

### Story-specific Cautions
- Nao fazer if por papel literal em componente.
- Permissoes dinamicas prevalecem sobre nomenclatura de cargo.
- A falta de permissao deve ser auditavel e previsivel, nao um erro generico.

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
- Rotas de smoke sugeridas: `/admin/eventos`, `/admin/grupos`, `/admin/painel`, `/admin/configuracoes`.

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
- GestaoEventos.Angular/src/app/core/guards/permission.guard.ts
- GestaoEventos.Angular/src/app/core/services/hierarchy-permissions.service.ts
- GestaoEventos.Angular/src/app/shared/services/permissions/permissions.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex.

### Debug Log References
- RED: `node scripts/validate-permissions.mjs` falhou antes da implementacao por ausencia de tipos, API, facade, store, guard e rotas protegidas.
- GREEN/REGRESSION: `npm run check:permissions` OK.
- GREEN/REGRESSION: `npm run type-check` OK.
- GREEN/REGRESSION: `npm run lint` OK.
- GREEN/REGRESSION: `npm run test:scaffold` OK.
- GREEN/REGRESSION: `npx expo-doctor` OK.
- GUARDRAIL: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` sem ocorrencias.

### Completion Notes List
- Criados tipos canonicos de permissao por acao, recurso e escopo.
- Criado `permissoesApi` para listar recursos e atribuir/revogar permissoes usando contratos reais do backend.
- Criada facade `can(action, resource, scope)` com owner bypass isolado e sem checagem de papel bruto em componentes.
- Criado `RequirePermission` com estado acionavel de acesso negado.
- `http-client` agora registra handler para 401 e preserva 403 para a UI tratar o erro real.
- Rotas iniciais `/admin/jornada`, `/admin/eventos`, `/admin/grupos`, `/admin/painel` e `/admin/configuracoes` usam guard de permissao.

### File List
- GestaoEventos.React/package.json
- GestaoEventos.React/app/(app)/admin/configuracoes.tsx
- GestaoEventos.React/app/(app)/admin/eventos.tsx
- GestaoEventos.React/app/(app)/admin/grupos.tsx
- GestaoEventos.React/app/(app)/admin/jornada.tsx
- GestaoEventos.React/app/(app)/admin/painel.tsx
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/session/screens/ProtectedPlaceholderScreen.tsx
- GestaoEventos.React/scripts/validate-permissions.mjs
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/services/api/http-client.ts
- GestaoEventos.React/services/api/permissoes-api.ts
- GestaoEventos.React/services/permissions/permission.facade.ts
- GestaoEventos.React/services/permissions/permission.types.ts
- GestaoEventos.React/shared/guards/RequirePermission.tsx
- GestaoEventos.React/stores/auth.store.ts
- GestaoEventos.React/stores/permission.store.ts
- _bmad-output/implementation-artifacts/1-5-guards-e-facade-de-permissao.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log
- 2026-09-02: Implementada facade de permissao, API client, guard de rota/acao e tratamento 401/403.
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
