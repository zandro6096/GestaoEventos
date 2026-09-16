---
baseline_commit: NO_VCS
---

# Story 1.3: Sessao Segura e Hydrate de Contexto

Status: review

## Story
As a usuario autenticado,
I want minha sessao restaurada com contexto valido,
So that eu entre direto no app sem misturar dados ou estrutura errada.

**Requirements covered:** FR1, FR2, FR4, NFR1, NFR3, NFR5.

## Acceptance Criteria
1. Given login bem-sucedido retorna JWT e usuario When a sessao e salva Then o token fica no secure-storage adapter And dados remotos nao ficam duplicados em Zustand.
2. Given o app inicia com token salvo When a sessao e reidratada Then o client chama `GET /api/contexto/inicial` com query `usuario_id` And rotas autenticadas so renderizam apos contexto valido And o tipo React expoe `estruturaId`, nao `estrutuaId`.

## Tasks / Subtasks
- [x] Criar adapter de secure storage por plataforma
  - [x] Web deve usar alternativa compativel e documentada; native deve usar storage seguro disponivel no Expo.
  - [x] Centralizar leitura/escrita/limpeza de token e evitar armazenamento sensivel em Zustand.
- [x] Implementar store de auth e contexto inicial
  - [x] Representar estados `unknown`, `authenticated`, `unauthenticated` e `context-required`.
  - [x] Hidratar sessao no bootstrap antes de liberar rotas autenticadas.
- [x] Consumir contexto inicial real
  - [x] Criar `services/api/contexto-api.ts` usando o `http-client` existente.
  - [x] Mapear `GET /api/contexto/inicial` para tipos canonicos camelCase no client.
- [x] Proteger shell autenticado
  - [x] Bloquear render de telas privadas enquanto sessao/contexto nao estiverem resolvidos.
  - [x] Redirecionar para auth ou selecao de estrutura conforme estado real.
- [x] Atualizar manifesto de paridade
  - [x] Registrar autenticacao hidratada, troca de token e contexto inicial como capacidades verificadas ou pendentes com evidencia.

## Dev Notes

### Scope Boundaries
- Implementa persistencia segura de sessao e hidratacao inicial de contexto no app autenticado.
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
- GestaoEventos.Angular/src/app/core/services/auth.service.ts
- GestaoEventos.Angular/src/app/core/services/contexto.service.ts
- GestaoEventos.Angular/src/app/shared/services/context/context.service.ts
- GestaoEventos.Angular/src/app/shared/apis/contexto/contexto-api.service.ts

### Backend Contracts
- GET /api/contexto/inicial
- Fluxos publicos de Story 1.2: token, cadastro, recuperar senha, redefinir senha, confirmar email e convite

### React File Targets
- GestaoEventos.React/services/platform/secure-storage.*
- GestaoEventos.React/stores/auth.store.ts
- GestaoEventos.React/stores/context.store.ts
- GestaoEventos.React/services/api/contexto-api.ts
- GestaoEventos.React/app/(app)/_layout.tsx

### UX and Product Notes
- .specify/memory/ux-navigation.md
- .specify/memory/ux-flows/03-structure-management.md

### Story-specific Cautions
- Nao inventar endpoint de contexto alternativo; se o contrato divergir, adaptar ao endpoint real.
- Falha de contexto nao pode virar sucesso vazio; exibir estado de erro recuperavel.
- Token expirado deve limpar sessao e voltar ao fluxo publico sem loop.

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
- Rotas de smoke sugeridas: `/`, `/auth/login`, `/admin/jornada`.

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
- .specify/memory/ux-flows/03-structure-management.md
- GestaoEventos.Angular/src/app/core/services/auth.service.ts
- GestaoEventos.Angular/src/app/core/services/contexto.service.ts
- GestaoEventos.Angular/src/app/shared/services/context/context.service.ts
- GestaoEventos.Angular/src/app/shared/apis/contexto/contexto-api.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex.

### Debug Log References
- RED: `node scripts/validate-session-context.mjs` falhou antes da implementacao por ausencia de secure-storage, stores, contexto API e hydrate no layout.
- GREEN/REGRESSION: `npm run check:session` OK.
- GREEN/REGRESSION: `npm run type-check` OK.
- GREEN/REGRESSION: `npm run lint` OK.
- GREEN/REGRESSION: `npm run test:scaffold` OK.
- GREEN/REGRESSION: `npx expo-doctor` OK apos alinhar patches Expo SDK 57.
- GUARDRAIL: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` sem ocorrencias.

### Completion Notes List
- Implementado adapter `secureStorage` por plataforma: `expo-secure-store` para iOS/Android e `sessionStorage` como fallback web sem `localStorage` para token.
- Implementada sessao segura com persistencia do JWT fora do Zustand, `attachAuthToken`, decode de usuario pelo JWT e hydrate via `GET /api/contexto/inicial?usuario_id=...`.
- Implementados stores de auth/contexto com estados `unknown`, `authenticated`, `unauthenticated` e `context-required`; o client expõe `estruturaId` e normaliza o legado backend `EstrutuaId`.
- Login e callback SSO passam a persistir token, hidratar contexto e navegar para `/admin/jornada` ou `/estrutura/selecionar`.
- Layout autenticado bloqueia render privado durante hydrate e redireciona usuario sem sessao para `/auth/login`.
- Manifesto de paridade atualizado com `session-context-foundation` verificado.

### File List
- GestaoEventos.React/package.json
- GestaoEventos.React/package-lock.json
- GestaoEventos.React/app/(app)/_layout.tsx
- GestaoEventos.React/app/(app)/admin/jornada.tsx
- GestaoEventos.React/app/(app)/estrutura/selecionar.tsx
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/auth/screens/LoginScreen.tsx
- GestaoEventos.React/features/auth/screens/SsoCallbackScreen.tsx
- GestaoEventos.React/features/auth/services/public-auth.service.ts
- GestaoEventos.React/features/context/screens/StructureSelectionScreen.tsx
- GestaoEventos.React/features/session/screens/AuthenticatedHomeScreen.tsx
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/scripts/validate-session-context.mjs
- GestaoEventos.React/services/api/contexto-api.ts
- GestaoEventos.React/services/api/http-client.ts
- GestaoEventos.React/services/platform/secure-storage/contract.ts
- GestaoEventos.React/services/platform/secure-storage/index.android.ts
- GestaoEventos.React/services/platform/secure-storage/index.ios.ts
- GestaoEventos.React/services/platform/secure-storage/index.web.ts
- GestaoEventos.React/services/query/query-keys.ts
- GestaoEventos.React/services/session/auth-session.service.ts
- GestaoEventos.React/stores/auth.store.ts
- GestaoEventos.React/stores/context.store.ts
- _bmad-output/implementation-artifacts/1-3-sessao-segura-e-hydrate-de-contexto.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log
- 2026-09-02: Implementada persistencia segura de sessao, hydrate de contexto inicial, guards do shell autenticado e validadores da Story 1.3.
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
