---
baseline_commit: NO_VCS
---

# Story 3.2: Meus Eventos

Status: review

## Story
As a usuario autenticado,
I want ver meus eventos,
So that eu acompanhe os eventos em que participo ou sou responsavel.

**Requirements covered:** FR8, NFR3, NFR5, NFR6.

## Acceptance Criteria
1. Given usuario autenticado When ele acessa `/eventos/meus` Then a tela carrega dados do backend equivalente ao Angular And separa loading, vazio, erro e sucesso.
2. Given usuario troca estrutura When retorna a `/eventos/meus` Then dados da estrutura anterior nao aparecem And query keys usam o escopo correto.

## Tasks / Subtasks
- [x] Confirmar contrato real de Meus Eventos
  - [x] Verificar Angular/backend antes de assumir endpoint dedicado.
  - [x] Se nao houver `/api/eventos/meus`, usar contrato existente com filtros de responsavel/participante.
- [x] Criar tela e API client
  - [x] Listar eventos sob responsabilidade do usuario e participacoes pessoais conforme regra de produto.
  - [x] Separar eventos a acompanhar, futuros e historico.
- [x] Adicionar acoes contextuais
  - [x] Abrir acompanhamento, presenca ou detalhes conforme permissao e status.
  - [x] Aplicar bloqueio offline para mutacoes.
- [x] Preservar estados e contexto
  - [x] Invalidar por estrutura/grupo ativo.
  - [x] Mostrar vazio real quando nao houver eventos do usuario.
- [x] Instrumentar analytics
  - [x] Registrar entrada e abertura de evento sem incluir identificadores em `detail`.

## Dev Notes

### Scope Boundaries
- Cria a visao de eventos relacionados ao usuario atual.
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
- GestaoEventos.Angular/src/app/features/evento/meus-eventos
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

### Backend Contracts
- Verificar contrato usado pelo Angular para `/admin/eventos/meus`
- Possiveis fontes atuais: GET /api/eventos, GET /api/ocorrencias e filtros por responsavel/participante

### React File Targets
- GestaoEventos.React/app/(app)/eventos/meus.tsx
- GestaoEventos.React/features/eventos/meus-eventos/*
- GestaoEventos.React/services/api/eventos-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/05b-event-initiation.md
- .specify/memory/ux-flows/05c-attendance.md

### Story-specific Cautions
- Nao inventar endpoint se a API atual nao tiver rota dedicada.
- Nao confiar em `usuario_id` vindo da UI se o backend ja usa JWT/contexto.
- Eventos cancelados relacionados ao usuario seguem aparecendo no historico.

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
- Rotas de smoke sugeridas: `/admin/eventos/meus`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/05b-event-initiation.md
- .specify/memory/ux-flows/05c-attendance.md
- GestaoEventos.Angular/src/app/features/evento/meus-eventos
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- RED: `node scripts/validate-meus-eventos.mjs` falhou antes da implementacao com API complementar, service, hook, tela, rotas, docs, fixtures, script e manifesto ausentes.
- GREEN: `npm run check:meus-eventos` passou.
- Validacao: `npm run type-check` passou.
- Validacao: `npm run lint` passou.
- Validacao: `npm run test:scaffold` passou.
- Validacao: `npm run check:platform` passou.
- Validacao: `npx expo-doctor` passou com 21/21 checks.
- Regressao: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` sem ocorrencias.

### Completion Notes List
- Confirmado que nao existe rota dedicada `/api/eventos/meus`; a fatia React usa `/api/ocorrencias` e `/api/eventos/configuracoes`, como o Angular produtivo.
- Estendido `eventos-api` com configuracoes por responsavel, confirmacao de responsavel e cancelamento por status de ocorrencia.
- Criado service/hook de Meus Eventos com query key escopada por usuario, estrutura e grupo, evitando reaproveitar dados de estrutura anterior.
- Criada tela responsiva com secoes `Acompanhar`, `Futuros` e `Historico`, estados loading/empty/error/success e cancelados preservados no historico.
- Mutacoes contextuais passam por `assertOnlineForMutation` e invalidam a query de Meus Eventos apos sucesso.
- Registrados analytics de entrada, sucesso de carregamento, abertura, confirmacao de visita e cancelamento sem PII no `detail`.

### File List
- GestaoEventos.React/app/(app)/admin/eventos/meus.tsx
- GestaoEventos.React/app/(app)/admin/eventos/presenca-lote.tsx
- GestaoEventos.React/app/(app)/eventos/meus.tsx
- GestaoEventos.React/docs/meus-eventos-parity.md
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/eventos/meus-eventos/hooks/useMeusEventos.ts
- GestaoEventos.React/features/eventos/meus-eventos/screens/MeusEventosScreen.tsx
- GestaoEventos.React/features/eventos/meus-eventos/services/meus-eventos.service.ts
- GestaoEventos.React/package.json
- GestaoEventos.React/scripts/validate-meus-eventos.mjs
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/services/api/eventos-api.ts
- GestaoEventos.React/services/query/query-keys.ts
- GestaoEventos.React/tests/fixtures/eventos/meus-context-switch.json
- GestaoEventos.React/tests/fixtures/eventos/meus-empty.json
- GestaoEventos.React/tests/fixtures/eventos/meus-error.json
- GestaoEventos.React/tests/fixtures/eventos/meus-mobile.json
- GestaoEventos.React/tests/fixtures/eventos/meus-success.json

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-03: Implementada tela Meus Eventos no React com contratos reais, secoes operacionais, bloqueio offline, analytics, fixtures e evidencia de paridade.
