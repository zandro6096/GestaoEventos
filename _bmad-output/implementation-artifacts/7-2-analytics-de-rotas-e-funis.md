---
baseline_commit: NO_VCS
---

# Story 7.2: Analytics de Rotas e Funis

Status: review

## Story
As a product owner,
I want rotas e fluxos instrumentados sem dados sensiveis,
So that a migracao mantenha visibilidade de uso.

**Requirements covered:** FR19, NFR2, UX-DR8.

## Acceptance Criteria
1. Given rota React implementada When o usuario navega Then `visualization` e emitido conforme padrao And `detail` nao contem IDs, labels sensiveis ou dados pessoais.
2. Given fluxo com intencao, submit e sucesso When implementado Then eventos `entrance`, `simulation` e `confirmation` sao emitidos And dados dinamicos permitidos ficam em `extra`.

## Tasks / Subtasks
- [x] Revisar tracker de rotas
  - [x] Garantir `visualization` automatico para rotas publicas e autenticadas.
  - [x] Evitar duplicidade em redirects/hydrate.
- [x] Criar helpers de funil
  - [x] Padronizar `entrance`, `simulation` e `confirmation` por feature.
  - [x] Fornecer API simples para telas chamarem sem montar payload manual sensivel.
- [x] Instrumentar features implementadas
  - [x] Auth, contexto, jornada, eventos, grupos, painel e admin conforme ficarem disponiveis.
  - [x] Registrar pendencias quando feature ainda estiver `ready-for-dev`.
- [x] Criar testes de sanitizacao
  - [x] Validar que `detail` nao recebe email, nome, telefone, documento ou IDs.
  - [x] Permitir IDs somente em campo tecnico `extra` quando indispensavel.
- [x] Atualizar docs
  - [x] Relacionar eventos React com padrao GTM/GA4 existente.

## Dev Notes

### Scope Boundaries
- Completa analytics transversal de rotas e funis de conversao do React.
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
- GestaoEventos.Angular/src/app/core/services/gtm.service.ts
- docs/analytics/tagging-standard.md

### Backend Contracts
- Sem contrato backend; analytics client-side deve respeitar configuracao de ambiente

### React File Targets
- GestaoEventos.React/services/analytics/*
- GestaoEventos.React/shared/components/RouteAnalyticsTracker.tsx
- GestaoEventos.React/features/*
- GestaoEventos.React/docs/parity-manifest.md

### UX and Product Notes
- docs/analytics/tagging-standard.md

### Story-specific Cautions
- Nunca chamar `window.dataLayer.push()` direto; manter adapter unico.
- Nao enviar PII ou IDs em `detail`.
- Evitar evento duplicado em navegacao inicial, refresh e redirect.

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
- Rotas de smoke sugeridas: `/auth/login`, `/jornada`, `/admin/eventos`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- GestaoEventos.Angular/src/app/core/services/gtm.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run check:analytics`
- `npm run test:analytics`
- `npm run test:scaffold`
- `npm run type-check`
- `npm run lint`

### Completion Notes List
- Tracker transversal de rota emite `visualization:screen_view` uma vez por pathname observado e usa normalizacao de parametros.
- Helper `funnel` padroniza `entrance`, `simulation` e `confirmation` e delega toda validacao ao tracker central.
- Auth, contexto, jornada, eventos, grupos, painel/cockpit, relatorios e administracao possuem eventos de fluxo conforme implementacao atual; pendencias permanecem no manifesto.
- Testes verificam bloqueio de email/URL/IDs no `detail`, normalizacao de rota e isolamento do `dataLayer` no provider web.
- Mapa de eventos React documentado em `GestaoEventos.React/docs/analytics/react-events-map.md`.

### File List
- `GestaoEventos.React/services/analytics/funnel.ts`
- `GestaoEventos.React/services/analytics/analytics.service.ts`
- `GestaoEventos.React/shared/components/RouteAnalyticsTracker.tsx`
- `GestaoEventos.React/docs/analytics/react-events-map.md`
- `GestaoEventos.React/scripts/validate-analytics-routes.mjs`
- `GestaoEventos.React/tests/analytics-contract.test.cjs`
- `GestaoEventos.React/features/admin/auditoria/useAuditoriaAdmin.ts`
- `GestaoEventos.React/features/admin/assinatura/useAssinaturaAdmin.ts`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Analytics de rotas e funis validado; helper, mapa documental e testes de sanitizacao adicionados.
