---
baseline_commit: NO_VCS
---

# Story 5.4: Paridade Visual e Analytics de Painel

Status: review

## Story
As a time de produto,
I want validar leitura e instrumentacao das visoes operacionais,
So that painel/cockpit/relatorios fiquem confiaveis para go-live.

**Requirements covered:** FR14, FR15, FR19, FR20, NFR2, NFR4, NFR8, UX-DR2.

## Acceptance Criteria
1. Given Epic 5 implementado When a validacao roda Then manifesto cobre rotas, fontes Angular, endpoints, permissoes e testes And analytics registra `visualization` sem dados sensiveis And layout nao usa hero/landing page promocional.

## Tasks / Subtasks
- [x] Auditar paridade visual
  - [x] Comparar painel, cockpit, fila e relatorios com Angular/producao.
  - [x] Registrar diferencas justificadas no manifesto.
- [x] Completar analytics
  - [x] Visualization automatica e funis de filtro/drilldown/confirmacao.
  - [x] Sanitizar `detail` conforme padrao.
- [x] Criar smokes da Epic 5
  - [x] Painel operacional, cockpit, fila semanal e frequencia.
  - [x] Validar desktop e mobile.
- [x] Revisar performance
  - [x] Checar listas/matriz grandes.
  - [x] Garantir que re-renderizacao por filtro nao trave a UI.
- [x] Atualizar ledger de paridade
  - [x] Deixar evidencia para decisao de execucao/review.

## Dev Notes

### Scope Boundaries
- Fecha painel, cockpit e relatorios com paridade visual, analytics e evidencia.
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
- GestaoEventos.Angular/src/app/features/painel
- GestaoEventos.Angular/src/app/features/relatorios
- GestaoEventos.Angular/src/app/core/services/gtm.service.ts

### Backend Contracts
- Contratos das Stories 5.1 a 5.3

### React File Targets
- GestaoEventos.React/features/painel/*
- GestaoEventos.React/features/relatorios/*
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/scripts/*

### UX and Product Notes
- .specify/memory/ux-flows/06-dashboard-views.md
- .specify/memory/ux-flows/07-reports-analytics.md
- docs/analytics/tagging-standard.md

### Story-specific Cautions
- Paridade visual nao significa copiar layout web que quebra mobile.
- Nao usar graficos sem dado real ou sem fallback acessivel.
- Nao marcar pronto se cockpit matricial nao estiver coberto.

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
- Rotas de smoke sugeridas: `/admin/painel`, `/admin/painel/cockpit`, `/relatorios/frequencia`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/06-dashboard-views.md
- .specify/memory/ux-flows/07-reports-analytics.md
- GestaoEventos.Angular/src/app/features/painel
- GestaoEventos.Angular/src/app/features/relatorios
- GestaoEventos.Angular/src/app/core/services/gtm.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run type-check`, `npm run lint`, `npm run test:scaffold` e `npm run check:epic5` passaram.
- `npm run smoke:epic5` passou em 390px e 1440px para painel, cockpit e relatorio.
- `npx expo-doctor` passou em 21/21 checks.
- Busca de regressao por `/api/v1`, `manager-person`, `student`, `treino`, `nutrition` e `workout` sem ocorrencias no app React.

### Completion Notes List
- Auditoria registrada em `GestaoEventos.React/docs/epic5-parity-audit.md`, com diferencas responsivas e lacunas de contratos documentadas.
- Painel, cockpit, fila semanal e frequencia usam layout responsivo Expo Universal, sem hero promocional e sem graficos ficticios.
- Analytics cobre visualization transversal, entrada, filtros/drilldown e confirmacao/erro; IDs e contagens ficam em `extra`, fora do `detail`.
- Smoke consolidado cobre as tres superficies em mobile e desktop; o relatorio exercita fixture de 200 participantes.
- Navegacao desktop ganhou Relatorios na area secundaria; a barra inferior mobile permanece limitada aos fluxos primarios.

### File List
- `GestaoEventos.React/features/painel/cockpit/useCockpit.ts`
- `GestaoEventos.React/features/painel/cockpit/FilaSemanalScreen.tsx`
- `GestaoEventos.React/shared/theme/app-theme.ts`
- `GestaoEventos.React/docs/epic5-parity-audit.md`
- `GestaoEventos.React/scripts/validate-epic5.mjs`
- `GestaoEventos.React/tests/epic5.smoke.cjs`
- `GestaoEventos.React/tests/relatorios.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Fechada evidencia visual, analytics, performance e smoke consolidado do Epic 5.
