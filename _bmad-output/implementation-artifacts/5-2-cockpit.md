---
baseline_commit: NO_VCS
---

# Story 5.2: Cockpit

Status: review

## Story
As a usuario autorizado,
I want acessar o cockpit operacional,
So that eu acompanhe situacoes agregadas e tome acoes a partir dele.

**Requirements covered:** FR14, NFR4, NFR5, NFR6, UX-DR3, UX-DR10.

## Acceptance Criteria
1. Given rota de cockpit existente no Angular When o usuario abre `/painel/cockpit` Then o React reproduz filtros, indicadores e acoes relevantes And cada acao guardada passa por `can()`.
2. Given mobile When o cockpit exibe tabelas ou grids densos Then a UI adapta para cards, secoes ou sheets And preserva leitura rapida.

## Tasks / Subtasks
- [x] Criar API do cockpit
  - [x] Mapear resumo, matriz, fila de pessoas, faltas e analitico de participantes.
  - [x] Preservar nomes agnosticos no client.
- [x] Implementar matriz principal
  - [x] Pessoa x Template como experiencia central.
  - [x] Permitir abrir detalhes de faltas pelo item/celula da matriz.
- [x] Separar fila semanal
  - [x] Manter `/admin/painel/fila-semanal` como fluxo separado quando implementado.
  - [x] Evitar misturar fila como card perdido dentro do cockpit.
- [x] Adicionar filtros e drilldowns
  - [x] Periodo, grupo, template/tipo e status conforme contrato.
  - [x] Garantir usabilidade mobile sem tabela quebrada.
- [x] Instrumentar analytics e smokes
  - [x] Entrada no cockpit, filtro e abertura de detalhe.

## Dev Notes

### Scope Boundaries
- Porta o cockpit operacional com matriz Pessoa x Template e drilldowns.
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
- GestaoEventos.Angular/src/app/features/painel/cockpit
- GestaoEventos.Angular/src/app/shared/services/painel/painel.service.ts

### Backend Contracts
- GET /api/paineis/cockpit
- GET /api/paineis/cockpit/grupos/{grupo_id}/participantes-analitico
- GET /api/paineis/cockpit/participantes/matriz-template
- GET /api/paineis/cockpit/fila-pessoas
- PUT /api/paineis/cockpit/fila-pessoas/{tipo}/{participante_id}
- GET /api/paineis/cockpit/participantes/{tipo}/{participante_id}/faltas

### React File Targets
- GestaoEventos.React/app/(app)/painel/cockpit.tsx
- GestaoEventos.React/app/(app)/painel/fila-semanal.tsx
- GestaoEventos.React/features/painel/cockpit/*
- GestaoEventos.React/services/api/painel-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/06-dashboard-views.md
- .specify/memory/ux-flows/09-mobile-adaptations.md

### Story-specific Cautions
- Cockpit atual e matricial; nao substituir por cards genericos.
- Detalhe de faltas deve vir do drilldown da matriz.
- Nao implementar alteracao de fila offline.

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
- Rotas de smoke sugeridas: `/admin/painel/cockpit`, `/admin/painel/fila-semanal`.

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
- .specify/memory/ux-flows/09-mobile-adaptations.md
- GestaoEventos.Angular/src/app/features/painel/cockpit
- GestaoEventos.Angular/src/app/shared/services/painel/painel.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- O primeiro smoke revelou que o ambiente local estava marcado como `preview` enquanto usava o proxy em `localhost`; `.env.local` foi corrigido para `development`.
- O clique do drilldown era inicialmente coberto por um alerta visual do `ApiConfigNotice`; após corrigir o ambiente, o alerta desapareceu e o fluxo passou sem forcar a interacao.

### Completion Notes List
- Criados contratos e normalizadores para resumo do cockpit, matriz Pessoa x Template, faltas e fila semanal usando endpoints reais.
- Cockpit responsivo com filtros de periodo/grupo/busca/risco/status, indicadores, alertas e celulas acionaveis para detalhe de faltas.
- Fila semanal ficou em rota dedicada e somente leitura; mutacoes seguem fora do fluxo offline desta fatia.
- Adicionados aliases `/painel/cockpit` e `/painel/fila-semanal`, smoke Playwright mobile/desktop e validador integrado ao `test:scaffold`.

### File List
- `GestaoEventos.React/services/api/painel-api.ts`
- `GestaoEventos.React/services/query/query-keys.ts`
- `GestaoEventos.React/features/painel/cockpit/useCockpit.ts`
- `GestaoEventos.React/features/painel/cockpit/CockpitScreen.tsx`
- `GestaoEventos.React/features/painel/cockpit/FilaSemanalScreen.tsx`
- `GestaoEventos.React/app/(app)/admin/painel/cockpit.tsx`
- `GestaoEventos.React/app/(app)/admin/painel/fila-semanal.tsx`
- `GestaoEventos.React/app/(app)/painel/cockpit.tsx`
- `GestaoEventos.React/app/(app)/painel/fila-semanal.tsx`
- `GestaoEventos.React/scripts/validate-cockpit.mjs`
- `GestaoEventos.React/tests/cockpit.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Story 5.2 implementada e movida para review apos validacoes automatizadas.
