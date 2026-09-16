---
baseline_commit: NO_VCS
---

# Story 7.4: Scripts de Qualidade e Smoke E2E

Status: review

## Story
As a time de desenvolvimento,
I want comandos confiaveis de validacao,
So that preview/prod dependam de evidencia, nao de teste manual solto.

**Requirements covered:** FR20, FR22, NFR8, NFR10.

## Acceptance Criteria
1. Given o app React possui scripts When o time executa validacao local ou CI Then build, typecheck, lint e smoke E2E rodam por comandos documentados And smoke minimo cobre login, contexto, troca de estrutura, jornada, evento/presenca e rota admin guardada.
2. Given teste falha When o pipeline retorna resultado Then release e bloqueado And erro aponta o comando e area afetada.

## Tasks / Subtasks
- [x] Revisar scripts existentes
  - [x] Manter `type-check`, `lint`, `test:scaffold`, `check:platform` e validar nomes.
  - [x] Corrigir duplicidade de dependencia/config quando impactar Expo Doctor.
- [x] Criar smoke e2e web
  - [x] Cobrir auth shell, contexto, jornada, eventos, grupos, painel e admin conforme rotas existirem.
  - [x] Usar fixtures/mocks deterministicos para nao depender de credenciais reais.
- [x] Criar comando de qualidade consolidado
  - [x] Rodar checks essenciais em uma unica chamada para CI/local.
  - [x] Falhar rapido com mensagens claras.
- [x] Adicionar validadores de arquitetura
  - [x] Detectar `/api/v1`, referencias ManagerPerson/academia e imports proibidos.
  - [x] Validar que arquivos de plataforma usam adapter correto.
- [x] Documentar uso
  - [x] Atualizar README/manifesto com comandos e escopo dos smokes.

## Dev Notes

### Scope Boundaries
- Completa scripts de qualidade e smoke end-to-end para sustentar execucao das stories.
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
- GestaoEventos.Angular/package.json
- GestaoEventos.Angular/cypress*

### Backend Contracts
- Sem contrato novo; smokes devem mockar ou apontar para ambiente configurado explicitamente

### React File Targets
- GestaoEventos.React/package.json
- GestaoEventos.React/scripts/*
- GestaoEventos.React/e2e/*
- GestaoEventos.React/docs/parity-manifest.md

### UX and Product Notes
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md

### Story-specific Cautions
- `GestaoEventos.React/package.json` contem historico de duplicidade de `expo-network`; verificar antes de rodar Expo Doctor.
- Smokes nao devem exigir credenciais produtivas.
- Nao transformar smoke em suite lenta de regressao completa.

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
- Rotas de smoke sugeridas: `/auth/login`, `/jornada`, `/admin/eventos`, `/admin/grupos`, `/admin/painel`, `/configuracoes`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- GestaoEventos.Angular/package.json
- GestaoEventos.Angular/cypress*

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run build:web`
- `npm run quality-gate`
- `npm run smoke:core` Playwright 390/1440
- `npm run check:architecture`
- `npm run type-check`
- `npm run lint`
- `npm run test:scaffold`
- `npx expo-doctor` (validado anteriormente sem alteracao de dependencias)

### Completion Notes List
- Build web exporta 107 rotas estaticas sem credenciais produtivas.
- `quality-gate` consolida build, plataforma, tipagem, lint, arquitetura, scaffold, contratos e smoke E2E e interrompe na primeira falha.
- Smoke core cobre login/offline, troca de estrutura, jornada, acompanhamento de evento, presenca individual/lote e admin guardado em 390/1440.
- Validadores bloqueiam `/api/v1`, referencias do produto de academia e acesso direto a `httpClient` por features; adapters de plataforma continuam verificados.
- README registra desenvolvimento, API local e comandos de release/qualidade.

### File List
- `GestaoEventos.React/README.md`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/scripts/quality-gate.mjs`
- `GestaoEventos.React/scripts/validate-architecture.mjs`
- `GestaoEventos.React/tests/core.smoke.cjs`
- `GestaoEventos.React/tests/context.smoke.cjs`
- `GestaoEventos.React/tests/jornada.smoke.cjs`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Gate consolidado, validador de arquitetura e smoke E2E core implementados e aprovados.
