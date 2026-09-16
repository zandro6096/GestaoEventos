---
baseline_commit: NO_VCS
---

# Story 3.4: Acompanhamento de Evento

Status: review

## Story
As a usuario autorizado,
I want acompanhar um evento por rota profunda,
So that eu veja estado, participantes e acoes disponiveis em um so fluxo.

**Requirements covered:** FR10, FR21, NFR3, NFR4, NFR5, UX-DR3, UX-DR10.

## Acceptance Criteria
1. Given evento existente When o usuario acessa `/eventos/acompanhar/[id]` Then a tela carrega estado, participantes e acoes equivalentes ao Angular And acoes passam por `can()` And backend continua autoridade para autorizacao.
2. Given viewport mobile When participantes ou detalhes nao cabem em tabela Then a UI usa cards/sheets And texto, botoes e estados nao se sobrepoem.

## Tasks / Subtasks
- [x] Criar rota de acompanhamento
  - [x] Implementar `/admin/eventos/acompanhar/:id` com carregamento por ID real.
  - [x] Distinguir evento, ocorrencia e ciclo se o contrato retornar entidades separadas.
- [x] Exibir dados operacionais
  - [x] Status, periodo, grupo, responsaveis, participantes, pendencias e acoes disponiveis.
  - [x] Usar layout denso, escaneavel e responsivo.
- [x] Adicionar acoes permitidas
  - [x] Confirmar responsavel, reabrir/descancelar/cancelar ocorrencia quando permitido.
  - [x] Adicionar/remover participantes com escopo explicito.
- [x] Integrar merge/ciclos quando aplicavel
  - [x] Expor candidatos de merge apenas se o Angular/backend ja suportar no fluxo.
  - [x] Nao apagar historico de participantes.
- [x] Instrumentar e testar
  - [x] Analytics de entrada/acao.
  - [x] Smoke com sucesso, 404/sem permissao e status cancelado.

## Dev Notes

### Scope Boundaries
- Cria a tela de acompanhamento operacional de um evento/ocorrencia.
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
- GestaoEventos.Angular/src/app/features/evento/acompanhar
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts
- GestaoEventos.Angular/src/app/shared/services/participante/participante-merge.service.ts

### Backend Contracts
- GET /api/eventos/{id}
- GET /api/eventos/{evento_id}/participantes
- PUT /api/ocorrencias/{id}/status
- POST /api/ocorrencias/{id}/confirmacao-responsavel
- POST /api/ocorrencias/{id}/reabrir
- POST /api/ocorrencias/{id}/descancelar

### React File Targets
- GestaoEventos.React/app/(app)/eventos/acompanhar/[id].tsx
- GestaoEventos.React/features/eventos/acompanhamento/*
- GestaoEventos.React/services/api/ocorrencias-api.ts
- GestaoEventos.React/services/api/participantes-evento-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/05c-attendance.md
- .specify/memory/ux-flows/09-mobile-adaptations.md

### Story-specific Cautions
- Acoes de add/remove participantes devem pedir escopo: `somente_ocorrencia`, `futuros` ou `todas`; em chamada usar apenas escopos expostos pela UX.
- Cancelamento e descancelamento sao estados historicos, nao exclusao.
- Nao renderizar botoes de acao sem passar pela facade de permissao.

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
- Rotas de smoke sugeridas: `/admin/eventos/acompanhar/1`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/05c-attendance.md
- .specify/memory/ux-flows/09-mobile-adaptations.md
- GestaoEventos.Angular/src/app/features/evento/acompanhar
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts
- GestaoEventos.Angular/src/app/shared/services/participante/participante-merge.service.ts

## Dev Agent Record

### Agent Model Used
Codex.

### Debug Log References
- RED: testes de regras falharam antes da criacao do modulo de acompanhamento.
- GREEN: 5 testes de regras/servico passaram, incluindo ocorrencia virtual, escopo, cancelamento e IDs de pessoa.
- Playwright com API mockada: sucesso, cancelado, 404 e 403 em 390x900 e 1440x900; inclusao/remocao validou snake_case, escopo e identificador da pessoa.
- type-check, lint, test:scaffold, check:platform e expo-doctor 21/21 passaram.
- Busca de contratos/terminologia indevidos sem resultados.

### Completion Notes List
- Acompanhamento carrega evento, ocorrencia, participantes e ciclos; cancelados permanecem visiveis.
- Acoes passam por `can()`, validam contexto/permissao/offline novamente e exigem motivo onde o contrato exige.
- Ocorrencias virtuais sao materializadas antes de inclusao/remocao; historico nao e apagado.
- Merge exibe candidatos reais, enquanto preview/confirmacao permanecem fora desta fatia por exigir uma etapa adicional de contrato/UI.
- Presenca por participante e finalizacao permanecem nas Stories 3.5/3.6.

### File List
- GestaoEventos.React/services/api/participantes-evento-api.ts
- GestaoEventos.React/services/api/ocorrencias-api.ts
- GestaoEventos.React/services/api/eventos-api.ts
- GestaoEventos.React/features/eventos/acompanhamento/acompanhamento.rules.ts
- GestaoEventos.React/features/eventos/acompanhamento/acompanhamento.service.ts
- GestaoEventos.React/features/eventos/acompanhamento/useAcompanhamento.ts
- GestaoEventos.React/features/eventos/acompanhamento/AcompanhamentoScreen.tsx
- GestaoEventos.React/app/(app)/admin/eventos/acompanhar/[id].tsx
- GestaoEventos.React/app/(app)/eventos/acompanhar/[id].tsx
- GestaoEventos.React/tests/acompanhamento.test.cjs
- GestaoEventos.React/tests/acompanhamento.smoke.cjs
- GestaoEventos.React/tests/artifacts/acompanhamento/*.png
- GestaoEventos.React/scripts/validate-acompanhamento.mjs
- GestaoEventos.React/docs/acompanhamento-parity.md
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/package.json
- GestaoEventos.React/package-lock.json
- _bmad-output/implementation-artifacts/3-4-acompanhamento-de-evento.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log
- 2026-09-07: Implementado acompanhamento responsivo, acoes de ocorrencia, participantes, ciclos, candidatos de merge e smoke multi-viewport.
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
