---
baseline_commit: NO_VCS
---

# Story 2.3: Paridade e Analytics da Jornada

Status: review

## Story
As a time de produto,
I want comprovar que Jornada no React corresponde ao Angular,
So that essa rota conte para o go-live.

**Requirements covered:** FR7, FR19, FR20, NFR2, NFR8.

## Acceptance Criteria
1. Given a jornada React implementada When a story e concluida Then `docs/parity-manifest.md` registra rota React, fonte Angular, endpoints, permissoes, analytics, testes, status e gaps And analytics emite `visualization` e eventos de funil quando houver acao.
2. Given smoke/regression da jornada When o teste executa Then cobre carregamento com contexto valido e pelo menos um estado de erro ou vazio.

## Tasks / Subtasks
- [x] Auditar paridade Angular x React
  - [x] Comparar campos, estados, filtros e rotas da Jornada.
  - [x] Registrar diferencas justificadas no manifesto.
- [x] Instrumentar analytics da Jornada
  - [x] Garantir `visualization` automatico por rota.
  - [x] Adicionar `entrance`, `simulation` e `confirmation` para interacoes da jornada sem PII.
- [x] Criar smokes da Jornada
  - [x] Cobrir render com dados, vazio, erro e permissao insuficiente.
  - [x] Validar mobile e web.
- [x] Revisar contratos de dados
  - [x] Garantir query keys por contexto ativo.
  - [x] Confirmar que nenhum dado de outra estrutura fica visivel apos troca.
- [x] Atualizar status de prontidao da Epic 2
  - [x] Deixar evidencia objetiva para execucao/review posterior.

## Dev Notes

### Scope Boundaries
- Fecha a fatia de Jornada com paridade documentada, analytics e smoke tests.
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
- GestaoEventos.Angular/src/app/features/jornada
- GestaoEventos.Angular/src/app/core/services/gtm.service.ts

### Backend Contracts
- Contratos de Story 2.1 e rotas auxiliares abertas pela Jornada

### React File Targets
- GestaoEventos.React/features/jornada/*
- GestaoEventos.React/services/analytics/*
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/scripts/*

### UX and Product Notes
- .specify/memory/ux-flows/05d-journey-personal.md
- docs/analytics/tagging-standard.md

### Story-specific Cautions
- IDs podem ir em `extra` tecnico quando indispensavel, nunca em `detail` de analytics.
- Nao marcar paridade completa sem evidencia de rota e dados.
- Registrar pendencias em ledger se o backend real nao expuser algum campo esperado.

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
- Rotas de smoke sugeridas: `/jornada`, `/admin/jornada`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/05d-journey-personal.md
- GestaoEventos.Angular/src/app/features/jornada
- GestaoEventos.Angular/src/app/core/services/gtm.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- RED: `npm run check:jornada-parity` falhou inicialmente por ausencia de auditoria, fixtures, script no scaffold e eventos de analytics da Jornada.
- GREEN: `npm run check:jornada-parity` passou apos adicionar auditoria, fixtures e instrumentacao.
- Validacoes finais: `npm run type-check`; `npm run lint`; `npm run test:scaffold`; `npm run check:platform`; `npx expo-doctor`; `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` sem ocorrencias.

### Completion Notes List
- Auditoria de paridade criada em `docs/jornada-parity-audit.md`, comparando baseline Angular, cobertura React, endpoints reais, gaps e evidencias de smoke/analytics.
- Jornada passou a emitir analytics de carregamento (`simulation`, `confirmation`, erro via `click`) e funis completos para abrir evento, resolver pendencia e registrar presenca, mantendo IDs/contagens apenas em `extra`.
- Corrigida a acao mutavel de evento para usar o alvo selecionado explicitamente, sem depender do update assincrono de estado.
- Smoke de paridade adicionado ao `test:scaffold`, com fixtures de sucesso, vazio, erro, 403, mobile e web.

### File List
- GestaoEventos.React/docs/jornada-parity-audit.md
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/jornada/hooks/useJornada.ts
- GestaoEventos.React/features/jornada/screens/JornadaScreen.tsx
- GestaoEventos.React/package.json
- GestaoEventos.React/scripts/validate-jornada-parity-smoke.mjs
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/tests/fixtures/jornada/empty.json
- GestaoEventos.React/tests/fixtures/jornada/error.json
- GestaoEventos.React/tests/fixtures/jornada/forbidden.json
- GestaoEventos.React/tests/fixtures/jornada/mobile.json
- GestaoEventos.React/tests/fixtures/jornada/success.json
- GestaoEventos.React/tests/fixtures/jornada/web.json

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-03: Implementada paridade/analytics da Jornada, smoke fixtures e gate `check:jornada-parity`.
