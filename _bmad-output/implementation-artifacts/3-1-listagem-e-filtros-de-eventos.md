---
baseline_commit: NO_VCS
---

# Story 3.1: Listagem e Filtros de Eventos

Status: review

## Story
As a usuario autorizado,
I want listar e filtrar eventos,
So that eu encontre rapidamente o evento que preciso operar.

**Requirements covered:** FR8, FR21, NFR3, NFR5, NFR6, UX-DR3.

## Acceptance Criteria
1. Given usuario com contexto ativo When ele abre `/eventos` Then o app consulta endpoints reais equivalentes ao Angular And filtros preservam contexto ativo And eventos cancelados continuam visiveis no historico quando o Angular/backend exibem esse estado.
2. Given viewport mobile When a lista possui muitas colunas Then a UI usa cards ou lista adaptada And nao depende de tabela larga horizontal para acao primaria.

## Tasks / Subtasks
- [x] Criar API e tipos de eventos
  - [x] Mapear listagem, detalhe, status, grupo, tipo/template, datas e responsaveis.
  - [x] Separar evento planejado de ocorrencia quando o backend distinguir os conceitos.
- [x] Implementar tela de listagem
  - [x] Criar filtros por periodo, grupo, status, tipo/template e responsavel quando suportado.
  - [x] Manter eventos cancelados visiveis no historico por padrao de dominio.
- [x] Integrar navegacao para detalhes
  - [x] Abrir acompanhamento, iniciar evento ou templates conforme estado/permissao.
  - [x] Preservar parametros de filtro ao voltar.
- [x] Tratar performance e estados
  - [x] Usar paginacao/virtualizacao se o contrato retornar muitos itens.
  - [x] Exibir erro recuperavel sem limpar filtros.
- [x] Registrar analytics de filtros
  - [x] Marcar entrada na listagem e simulacao de filtro sem PII.

## Dev Notes

### Scope Boundaries
- Porta a listagem operacional de eventos com filtros reais e historico preservado.
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
- GestaoEventos.Angular/src/app/features/evento
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts
- GestaoEventos.Angular/src/app/shared/apis/evento-configuracao
- GestaoEventos.Angular/src/app/app.routes.ts

### Backend Contracts
- GET /api/eventos
- GET /api/eventos/{id}
- GET /api/ocorrencias
- PATCH /api/eventos/{id}/cancelar
- GET /api/eventos/conflitos

### React File Targets
- GestaoEventos.React/app/(app)/eventos/index.tsx
- GestaoEventos.React/features/eventos/*
- GestaoEventos.React/services/api/eventos-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/05-event-management.md
- .specify/memory/ux-flows/09-mobile-adaptations.md

### Story-specific Cautions
- Evento cancelado nao deve ser apagado nem escondido para simular sucesso.
- Grupo continua sendo container hierarquico; evento e ocorrencia agendada.
- Filtros devem respeitar contexto ativo e permissao dinamica.

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
- Rotas de smoke sugeridas: `/admin/eventos`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/05-event-management.md
- .specify/memory/ux-flows/09-mobile-adaptations.md
- GestaoEventos.Angular/src/app/features/evento
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts
- GestaoEventos.Angular/src/app/shared/apis/evento-configuracao
- GestaoEventos.Angular/src/app/app.routes.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- RED: `node scripts/validate-eventos-list.mjs` falhou antes da implementacao com arquivos, rotas, docs, fixtures, script e manifesto ausentes.
- GREEN: `npm run check:eventos-list` passou.
- Validacao: `npm run type-check` passou.
- Validacao: `npm run lint` passou.
- Validacao: `npm run test:scaffold` passou.
- Validacao: `npm run check:platform` passou.
- Validacao: `npx expo-doctor` passou com 21/21 checks.
- Regressao: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` sem ocorrencias.

### Completion Notes List
- Criada API React de eventos com contratos reais `/api/eventos`, `/api/eventos/{id}` e `/api/ocorrencias`, mantendo `estrutura_id`, `grupo_id`, paginacao e `include_canceladas`.
- Criado service/hook feature-sliced para separar evento planejado de ocorrencia, filtrar periodo/status/tipo/grupo/responsavel/titulo e preservar cancelados no historico.
- Criada tela responsiva de listagem em cards, sem tabela horizontal como acao primaria, com estados de carregamento, vazio, erro recuperavel, paginacao e parametros de filtro na rota.
- Integradas rotas `/eventos` e `/admin/eventos` com `RequirePermission`, alem dos destinos protegidos de iniciar, acompanhar, modelos e ocorrencias para continuidade das proximas stories.
- Registrados analytics de entrada, aplicacao de filtro, sucesso de carregamento e abertura de evento sem PII no `detail`.
- Adicionados smoke fixtures, validador `check:eventos-list`, doc de paridade e linha `events-list-filter-foundation` no manifesto.

### File List
- GestaoEventos.React/app/(app)/admin/eventos.tsx
- GestaoEventos.React/app/(app)/admin/eventos/[id]/ocorrencias.tsx
- GestaoEventos.React/app/(app)/admin/eventos/acompanhar/[id].tsx
- GestaoEventos.React/app/(app)/admin/eventos/iniciar.tsx
- GestaoEventos.React/app/(app)/admin/eventos/modelos.tsx
- GestaoEventos.React/app/(app)/eventos/index.tsx
- GestaoEventos.React/docs/eventos-list-parity.md
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/eventos/hooks/useEventos.ts
- GestaoEventos.React/features/eventos/screens/EventosListScreen.tsx
- GestaoEventos.React/features/eventos/services/eventos.service.ts
- GestaoEventos.React/package.json
- GestaoEventos.React/scripts/validate-eventos-list.mjs
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/services/api/eventos-api.ts
- GestaoEventos.React/services/query/query-keys.ts
- GestaoEventos.React/shared/theme/app-theme.ts
- GestaoEventos.React/tests/fixtures/eventos/list-empty.json
- GestaoEventos.React/tests/fixtures/eventos/list-error.json
- GestaoEventos.React/tests/fixtures/eventos/list-mobile.json
- GestaoEventos.React/tests/fixtures/eventos/list-success.json
- GestaoEventos.React/tests/fixtures/eventos/list-web.json

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-03: Implementada listagem/filtros de eventos no React, com contratos reais, historico cancelado, rotas, analytics, fixtures e evidencia de paridade.
