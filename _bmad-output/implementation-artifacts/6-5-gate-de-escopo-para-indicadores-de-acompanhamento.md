---
baseline_commit: NO_VCS
---

# Story 6.5: Gate de Escopo para Indicadores de Acompanhamento

Status: review

## Story
As a product owner,
I want registrar como Indicadores de Acompanhamento entra no app React,
So that o UX contract existente nao expanda o MVP sem decisao explicita.

**Requirements covered:** FR16, FR20, UX-DR11, UX-DR12.

## Acceptance Criteria
1. Given o UX contract de 2026-08-26 existe When o manifesto de paridade e preparado Then Indicadores de Acompanhamento recebe status `verified`, `in-progress` ou `deferred` And a decisao referencia se ha backend/Angular produtivo suficiente para portar.
2. Given Indicadores entra no escopo When stories dedicadas forem criadas Then elas devem cobrir configuracao de indicadores, applicability picker, target rule, sensitivity callout, tracking matrix, participant tracking card, participant profile drawer, history timeline e regras de dados restritos And nenhuma label sensivel entra em analytics.

## Tasks / Subtasks
- [x] Inventariar indicadores existentes
  - [x] Comparar docs de UX, Angular e backend.
  - [x] Identificar o que e evento objetivo, cockpit, painel ou feature nao implementada.
- [x] Criar decisao de escopo
  - [x] Classificar cada indicador como `implementar agora`, `ja coberto`, `deferido` ou `bloqueado por contrato`.
  - [x] Registrar decisao no manifesto/ledger.
- [x] Validar contratos de objetivos
  - [x] Verificar endpoints e componentes de objetivos de evento/template.
  - [x] Nao misturar objetivos com indicadores administrativos sem fonte.
- [x] Criar stub apenas quando util
  - [x] Se necessario, criar aviso/placeholder operacional para item deferido, sem prometer funcionalidade inexistente.
  - [x] Evitar botoes sem acao real.
- [x] Atualizar plano de execucao
  - [x] Alinhar historias afetadas da Epic 5/6 conforme decisao.

## Dev Notes

### Scope Boundaries
- Define e valida o escopo real dos indicadores de acompanhamento antes de implementar algo fora da paridade.
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
- GestaoEventos.Angular/src/app/features/evento/objetivos
- GestaoEventos.Angular/src/app/features/painel
- GestaoEventos.Angular/src/app/shared/services/evento-configuracao/evento-configuracao.service.ts

### Backend Contracts
- GET/POST/PUT/DELETE de objetivos de evento se presentes no backend
- Contratos de painel/cockpit das Stories 5.1 e 5.2

### React File Targets
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/painel/*
- GestaoEventos.React/features/admin/*

### UX and Product Notes
- .specify/memory/ux-flows/05a-event-templates.md
- .specify/memory/ux-flows/06-dashboard-views.md
- .specify/memory/ux-flows/07-reports-analytics.md

### Story-specific Cautions
- Esta story e gate de escopo; nao deve virar implementacao grande sem decisao registrada.
- Nao criar indicadores inventados para preencher tela.
- Se indicador depender de backend ausente, marcar como bloqueado/deferido com evidencia.

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
- Rotas de smoke sugeridas: `/admin/painel`, `/configuracoes`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/05a-event-templates.md
- .specify/memory/ux-flows/06-dashboard-views.md
- .specify/memory/ux-flows/07-reports-analytics.md
- GestaoEventos.Angular/src/app/features/evento/objetivos
- GestaoEventos.Angular/src/app/features/painel
- GestaoEventos.Angular/src/app/shared/services/evento-configuracao/evento-configuracao.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `rg -n -i "indicador|acompanhamento|objetivo" .specify/memory/ux-flows docs GestaoEventos.Angular/src/app GestaoEventos.API/src`
- `npm run check:indicadores-scope`
- `npm run test:scaffold`
- `npm run check:cockpit`
- `npm run check:relatorios`

### Completion Notes List
- Inventario comparou UX contract, Angular produtivo e endpoints reais de objetivos/cockpit.
- Registrada decisao em `GestaoEventos.React/docs/indicadores-acompanhamento-scope.md` e no manifesto de paridade.
- Objetivos por template/papel possuem contrato backend e base Angular, mas a paridade React exige story dedicada para CRUD, applicability picker, target rule, matriz e filtros de status.
- Sensitivity callout, participant tracking card, participant profile drawer e history timeline foram deferidos por ausencia de contrato claro; nenhuma tela ou dado ficticio foi criado.
- Analytics futuro deve omitir PII e labels sensiveis de objetivos.

### File List
- `GestaoEventos.React/docs/indicadores-acompanhamento-scope.md`
- `GestaoEventos.React/scripts/validate-indicadores-scope.mjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Gate de escopo concluido e movido para review com inventario e classificacao de indicadores.
