---
baseline_commit: NO_VCS
---

# Story 7.3: Offline Read-Only e Bloqueio de Mutacoes

Status: review

## Story
As a usuario com conexao instavel,
I want entender quando estou vendo cache e quando nao posso gravar,
So that eu nao acredite que uma presenca ou alteracao foi salva offline.

**Requirements covered:** FR21, NFR3, NFR5.

## Acceptance Criteria
1. Given app sem conexao e cache disponivel When uma tela de leitura abre Then dados recentes podem ser exibidos com banner offline And o usuario entende que pode estar vendo cache.
2. Given app sem conexao When o usuario tenta uma mutacao Then a acao e bloqueada antes do submit And nenhum item entra em fila offline automatica.

## Tasks / Subtasks
- [x] Revisar detector de rede
  - [x] Confirmar store/provider web/native e banner global.
  - [x] Tratar estado desconhecido sem liberar mutacao insegura.
- [x] Centralizar guard de mutacao
  - [x] Toda mutacao deve passar pelo guard offline.
  - [x] Exibir feedback padrao quando bloqueada.
- [x] Aplicar em features
  - [x] Auth sensivel, eventos, presenca, grupos, painel/admin e configuracoes.
  - [x] Manter leitura de cache quando possivel.
- [x] Criar testes de bloqueio
  - [x] Cobrir mutacao online, offline e retorno para online.
  - [x] Garantir que nenhuma fila de escrita seja criada.
- [x] Documentar politica
  - [x] Atualizar manifesto e docs de plataforma com read-only offline.

## Dev Notes

### Scope Boundaries
- Aplica a politica offline read-only em todas as mutacoes do app React.
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
- .specify/memory/ux-flows/09-mobile-adaptations.md

### Backend Contracts
- Sem contrato novo; bloqueio acontece antes de chamadas POST/PUT/PATCH/DELETE

### React File Targets
- GestaoEventos.React/services/network/*
- GestaoEventos.React/services/offline/*
- GestaoEventos.React/stores/network.store.ts
- GestaoEventos.React/shared/components/OfflineBanner.tsx
- GestaoEventos.React/services/api/http-client.ts

### UX and Product Notes
- .specify/memory/ux-flows/09-mobile-adaptations.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md

### Story-specific Cautions
- Architecture AD-10 prevalece sobre docs antigas: offline inicial e read-only, sem fila de mutacao.
- Nao tentar sincronizacao em background nesta etapa.
- Bloqueio deve ser consistente em todas as features, nao por tela isolada.

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
- Rotas de smoke sugeridas: `/jornada`, `/admin/eventos/acompanhar/1`, `/configuracoes/membros`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/09-mobile-adaptations.md

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run check:offline-policy`
- `npm run test:offline-policy`
- `npm run smoke:offline-policy` Playwright 390px
- `npm run test:scaffold`
- `npm run type-check`
- `npm run lint`
- `npm run check:platform`

### Completion Notes List
- Estado inicial e snapshots com conectividade desconhecida bloqueiam escrita ate a rede ser confirmada.
- Consultas usam `offlineFirst` para aproveitar cache; mutacoes usam `always` para rejeicao imediata pelo guard, sem fila automatica.
- Banner global diferencia verificacao de rede e offline confirmado e informa o risco de dados desatualizados.
- Todas as mutacoes conhecidas de auth, eventos, presenca, grupos, jornada e administracao foram auditadas para `assertOnlineForMutation`.
- Smoke confirmou zero chamadas de escrita offline, nova tentativa online e ausencia de reprocessamento automatico.

### File List
- `GestaoEventos.React/stores/network.store.ts`
- `GestaoEventos.React/shared/components/OfflineBanner.tsx`
- `GestaoEventos.React/services/offline/mutation-guard.ts`
- `GestaoEventos.React/app/_layout.tsx`
- `GestaoEventos.React/docs/offline-policy.md`
- `GestaoEventos.React/scripts/validate-offline-policy.mjs`
- `GestaoEventos.React/tests/offline-policy.test.cjs`
- `GestaoEventos.React/tests/offline-policy.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Politica offline read-only implementada, auditada e validada com smoke de bloqueio/retorno da rede.
