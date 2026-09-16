---
baseline_commit: NO_VCS
---

# Story 2.1: Rota de Jornada com Dados Reais

Status: review

## Story
As a usuario autenticado,
I want abrir minha jornada no app React,
So that eu acompanhe minha situacao operacional sem voltar ao Angular.

**Requirements covered:** FR7, NFR3, NFR5, NFR6, UX-DR5.

## Acceptance Criteria
1. Given usuario autenticado com contexto valido When ele acessa `/jornada` Then a tela carrega dados do backend equivalente ao Angular And query keys incluem o escopo ativo quando aplicavel And loading, erro e estado vazio sao visualmente distintos.
2. Given o backend retorna erro When a jornada tenta carregar Then a UI mostra falha acionavel And nao renderiza uma jornada vazia como sucesso.

## Tasks / Subtasks
- [x] Criar contratos e API de jornada
  - [x] Mapear frequencia, proximos eventos, pendencias e historico pessoal.
  - [x] Reutilizar `http-client` e conversao camel/snake ja existentes.
- [x] Implementar hooks de dados
  - [x] Usar React Query com query keys por estrutura/contexto.
  - [x] Separar estados de loading, vazio, erro e sucesso parcial.
- [x] Criar tela `/jornada` e alias admin quando necessario
  - [x] Exibir resumo pessoal, eventos proximos, pendencias e historico.
  - [x] Preservar navegacao equivalente ao Angular.
- [x] Aplicar autorizacao e contexto
  - [x] Garantir que o usuario veja apenas sua propria jornada no contexto ativo.
  - [x] Tratar estrutura sem participacao cadastrada sem fluxo anonimo.
- [x] Atualizar manifesto
  - [x] Registrar campos faltantes entre Angular/backend e React, se houver.

## Dev Notes

### Scope Boundaries
- Cria a rota de Jornada no React consumindo dados reais do backend.
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
- GestaoEventos.Angular/src/app/shared/services/jornada/jornada.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

### Backend Contracts
- GET /api/participacoes
- GET /api/participacoes/frequencia
- GET /api/pendencias/minhas/resumo
- GET /api/pendencias/minhas
- GET /api/ocorrencias

### React File Targets
- GestaoEventos.React/app/(app)/jornada.tsx
- GestaoEventos.React/features/jornada/*
- GestaoEventos.React/services/api/jornada-api.ts
- GestaoEventos.React/services/query/query-keys.ts

### UX and Product Notes
- .specify/memory/ux-flows/05d-journey-personal.md
- .specify/memory/ux-flows/09-mobile-adaptations.md

### Story-specific Cautions
- Participacao exige cadastro; nao criar fallback anonimo.
- Nao mascarar erro operacional como jornada vazia.
- Evitar acoplar a tela a termos de academia ou ManagerPerson.

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
- .specify/memory/ux-flows/09-mobile-adaptations.md
- GestaoEventos.Angular/src/app/features/jornada
- GestaoEventos.Angular/src/app/shared/services/jornada/jornada.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

## Dev Agent Record

### Agent Model Used
Codex GPT-5

### Debug Log References
- RED: `node scripts/validate-jornada-data.mjs` falhou por ausencia dos arquivos/contratos de jornada.
- GREEN: `npm run check:jornada` passou apos API service, feature service, hook, tela e rotas.
- Validacao final: `npm run check:platform`, `npm run type-check`, `npm run lint`, `npm run test:scaffold`, `npx expo-doctor`.
- Regressao de termos/contratos: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` retornou `no_forbidden_terms`.

### Completion Notes List
- `jornada-api` consome os endpoints reais de ocorrencias, participacoes, frequencia e pendencias com query params snake_case.
- `jornadaService` monta eventos de hoje, proximas reunioes, historico, frequencia e pendencias sem transformar erro operacional em sucesso vazio.
- `useJornada` usa React Query com query keys por `estruturaId`/`grupoId`, retry acionavel e estados parciais.
- `/jornada` e `/admin/jornada` renderizam a mesma tela protegida por `RequirePermission ler:jornada`.
- Manifesto registra `journey-real-data-foundation`; detalhe paginado de pendencias ficou disponivel no API service para as fatias acionaveis seguintes.

### File List
- GestaoEventos.React/app/(app)/admin/jornada.tsx
- GestaoEventos.React/app/(app)/jornada.tsx
- GestaoEventos.React/app/index.tsx
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/jornada/hooks/useJornada.ts
- GestaoEventos.React/features/jornada/screens/JornadaScreen.tsx
- GestaoEventos.React/features/jornada/services/jornada.service.ts
- GestaoEventos.React/package.json
- GestaoEventos.React/scripts/validate-jornada-data.mjs
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/services/api/jornada-api.ts
- GestaoEventos.React/services/query/query-keys.ts
- GestaoEventos.React/shared/components/AppNavigation.tsx
- GestaoEventos.React/shared/components/AppShell.tsx
- GestaoEventos.React/shared/theme/app-theme.ts

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-02: Rota de jornada com dados reais, React Query escopado e estados de UI implementados no app React.
