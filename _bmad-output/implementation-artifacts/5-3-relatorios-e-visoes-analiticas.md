---
baseline_commit: NO_VCS
---

# Story 5.3: Relatorios e Visoes Analiticas

Status: review

## Story
As a usuario autorizado,
I want consultar relatorios disponiveis,
So that eu acompanhe frequencia, eventos e dados operacionais sem sair do app.

**Requirements covered:** FR15, NFR2, NFR3, NFR5.

## Acceptance Criteria
1. Given relatorio disponivel no escopo produtivo Angular When portado para React Then a tela usa endpoint/backend real correspondente And filtros/exportacoes existentes entram no manifesto quando implementados.
2. Given erro de carregamento When o relatorio falha Then o app preserva detalhe operacional suficiente para suporte And nao mostra estado vazio enganoso.

## Tasks / Subtasks
- [x] Confirmar contratos de relatorio
  - [x] Verificar Angular/backend antes de criar clients dedicados.
  - [x] Usar endpoints reais de frequencia/painel em vez de inventar `/api/reports`.
- [x] Implementar rota de frequencia/relatorios
  - [x] Filtros por periodo, grupo e pessoa quando suportados.
  - [x] Exibir dados analiticos em formato responsivo.
- [x] Adicionar exportacao somente se existir contrato
  - [x] Nao criar botao de exportacao fake.
  - [x] Quando exportar, respeitar permissao e contexto.
- [x] Integrar painel e jornada
  - [x] Permitir abrir relatorio a partir de painel/jornada quando a UX pedir.
  - [x] Manter query keys compartilhadas corretamente.
- [x] Testar estados grandes
  - [x] Lista vazia, volume alto, erro e filtros persistidos.

## Dev Notes

### Scope Boundaries
- Porta relatorios e visoes analiticas existentes, começando por frequencia.
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
- GestaoEventos.Angular/src/app/features/relatorios
- GestaoEventos.Angular/src/app/features/frequencia
- GestaoEventos.Angular/src/app/shared/services/participacao/participacao.service.ts
- GestaoEventos.Angular/src/app/shared/services/painel/painel.service.ts

### Backend Contracts
- GET /api/participacoes/frequencia
- GET /api/participacoes
- GET /api/paineis/comparativo
- Confirmar demais contratos usados pelo Angular antes de implementar

### React File Targets
- GestaoEventos.React/app/(app)/relatorios/frequencia.tsx
- GestaoEventos.React/features/relatorios/*
- GestaoEventos.React/services/api/relatorios-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/07-reports-analytics.md
- .specify/memory/ux-flows/06-dashboard-views.md

### Story-specific Cautions
- Nao inventar endpoints de relatorio ausentes.
- Relatorio nao pode mostrar dados de outra estrutura apos troca de contexto.
- Exportacao sem backend real deve ficar fora do escopo ou documentada como pendencia.

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
- Rotas de smoke sugeridas: `/relatorios/frequencia`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/07-reports-analytics.md
- .specify/memory/ux-flows/06-dashboard-views.md
- GestaoEventos.Angular/src/app/features/relatorios
- GestaoEventos.Angular/src/app/features/frequencia
- GestaoEventos.Angular/src/app/shared/services/participacao/participacao.service.ts
- GestaoEventos.Angular/src/app/shared/services/painel/painel.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run type-check` e `npm run lint` passaram.
- `npm run check:relatorios` e `npm run test:scaffold` passaram.
- `npm run smoke:relatorios` passou em 390px e 1440px.

### Completion Notes List
- Criada a rota `/relatorios/frequencia` com alias administrativo `/admin/relatorios/frequencia`.
- O relatorio compoe `GET /api/paineis/cockpit` e `GET /api/paineis/cockpit/participantes/matriz-template`, respeitando `estruturaId`, `grupoId` e permissao dinamica.
- Filtros de periodo, grupo e pessoa possuem query key compartilhada e analytics de entrada, filtro, sucesso e erro.
- Exportacao, agendamento e compartilhamento ficaram fora da tela porque nao ha contrato backend confirmado para essa fatia.
- Estados de carregamento, erro operacional, vazio e lista responsiva foram cobertos pelo smoke web.

### File List
- `GestaoEventos.React/services/api/relatorios-api.ts`
- `GestaoEventos.React/features/relatorios/frequencia/useFrequenciaRelatorio.ts`
- `GestaoEventos.React/features/relatorios/frequencia/FrequenciaReportScreen.tsx`
- `GestaoEventos.React/app/(app)/relatorios/frequencia.tsx`
- `GestaoEventos.React/app/(app)/admin/relatorios/frequencia.tsx`
- `GestaoEventos.React/services/query/query-keys.ts`
- `GestaoEventos.React/scripts/validate-relatorios.mjs`
- `GestaoEventos.React/tests/relatorios.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Implementada rota de frequencia com contratos reais de cockpit/matriz, filtros, estados responsivos, analytics e smoke Playwright.
