---
baseline_commit: NO_VCS
---

# Story 4.4: Paridade de Grupos

Status: review

## Story
As a time de produto,
I want comprovar paridade de grupos e responsaveis,
So that essa area conte para o go-live.

**Requirements covered:** FR12, FR13, FR20, NFR8.

## Acceptance Criteria
1. Given rotas de grupos implementadas When a story e concluida Then manifesto registra React route, Angular source, endpoint backend, permissoes, analytics e testes And smoke cobre lista, detalhe e pelo menos uma operacao guardada.

## Tasks / Subtasks
- [x] Auditar paridade da Epic 4
  - [x] Comparar lista, detalhe, membros, responsaveis, permissoes e estados de erro.
  - [x] Registrar lacunas no manifesto.
- [x] Criar smokes de grupos
  - [x] Listagem com hierarquia, detalhe, membro existente, convite e responsavel.
  - [x] Cobrir mobile e web.
- [x] Instrumentar analytics final
  - [x] Visualization automatica e entradas/confirmacoes das principais acoes.
  - [x] Sem dados pessoais ou identificadores em `detail`.
- [x] Validar contexto/permissao
  - [x] Queries de grupos, detalhe e mutacoes carregam estrutura/grupo e revalidam permissao dinamica.
  - [x] Guard de 403/sem permissao permanece na rota; smoke cobre autoridade owner e mutacao guardada.
- [x] Atualizar ledger
  - [x] Registrar pendencias que exigem backend/prod data.

## Dev Notes

### Scope Boundaries
- Fecha a fatia de grupos com paridade, analytics e testes.
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
- GestaoEventos.Angular/src/app/features/grupo
- GestaoEventos.Angular/src/app/shared/services/grupo/grupo.service.ts

### Backend Contracts
- Contratos das Stories 4.1 a 4.3

### React File Targets
- GestaoEventos.React/features/grupos/*
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/scripts/*

### UX and Product Notes
- .specify/memory/ux-flows/04-group-hierarchy.md
- docs/analytics/tagging-standard.md

### Story-specific Cautions
- Nao marcar paridade completa se reativacao de pessoa inativa nao estiver contemplada.
- Nao esconder funcionalidades de responsavel por falta de tela; registrar explicitamente se houver pendencia.
- Garantir que termos continuem agnosticos.

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
- Rotas de smoke sugeridas: `/admin/grupos`, `/admin/grupos/1`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/04-group-hierarchy.md
- GestaoEventos.Angular/src/app/features/grupo
- GestaoEventos.Angular/src/app/shared/services/grupo/grupo.service.ts

## Dev Agent Record

### Agent Model Used
Codex GPT-5

### Debug Log References
- `npm run check:grupos-parity`
- `npm run smoke:grupos`, `npm run smoke:grupo-detalhe`, `npm run smoke:grupo-membros`
- `npm run type-check`, `npm run lint`, `npm run test:scaffold`

### Completion Notes List
- Auditoria final consolidada em `docs/grupos-epic-parity.md`.
- A composicao mobile foi refinada com contexto compacto, metricas em duas colunas e abas horizontais sem quebra de linha.
- O ledger de membros/responsaveis foi verificado apos a inclusao do endpoint real de reativacao; nenhum comportamento ficticio foi criado.

### File List
- `scripts/validate-grupos-parity.mjs`
- `docs/grupos-epic-parity.md`
- `docs/grupos-parity.md`
- `docs/grupo-detalhe-parity.md`
- `shared/components/AppShell.tsx`
- `shared/components/ContextSwitcher.tsx`
- `features/grupos/detalhe/GrupoDetalheScreen.tsx`
- `docs/parity-manifest.md`
- `package.json`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Auditoria da Epic 4, smokes e ledger de paridade consolidados com reativacao real.
