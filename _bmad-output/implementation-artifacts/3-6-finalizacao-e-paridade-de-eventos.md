---
baseline_commit: NO_VCS
---

# Story 3.6: Finalizacao e Paridade de Eventos

Status: review

## Story
As a usuario autorizado,
I want finalizar o fluxo de evento com seguranca,
So that o estado final fique igual ao produto atual.

**Requirements covered:** FR10, FR11, FR20, NFR3, NFR8.

## Acceptance Criteria
1. Given evento em estado finalizavel When o usuario confirma finalizacao Then o backend recebe a acao correta And a tela reflete o novo estado And erros de regra de negocio nao sao mascarados.
2. Given Epic 3 concluido When a validacao roda Then smoke E2E cobre listar, abrir, registrar presenca e finalizar And manifesto de paridade registra rotas, endpoints, permissoes, analytics e gaps.

## Tasks / Subtasks
- [x] Confirmar contrato real de finalizacao
  - [x] Verificar Angular/backend antes de criar endpoint novo.
  - [x] Se a API atual usar status de ocorrencia, documentar e encapsular no client.
- [x] Implementar acao de finalizar
  - [x] Bloquear quando houver pendencias obrigatorias.
  - [x] Exibir resumo antes da confirmacao.
- [x] Atualizar dados relacionados
  - [x] Invalidar listagem, meus eventos, jornada, painel e frequencia.
  - [x] Preservar historico de cancelados e finalizados.
- [x] Criar smoke ponta a ponta
  - [x] Iniciar evento, acompanhar, registrar presenca e finalizar usando mocks/fixtures quando necessario.
  - [x] Cobrir mobile e web.
- [x] Atualizar manifesto e ledger
  - [x] Registrar paridade de rotas, contratos e excecoes da Epic 3.

## Dev Notes

### Scope Boundaries
- Fecha a fatia de eventos com finalizacao, manifestos e fluxo ponta a ponta validado.
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
- GestaoEventos.Angular/src/app/shared/services/participacao/participacao.service.ts

### Backend Contracts
- Verificar contrato atual de finalizacao no backend antes de implementar.
- Contratos de eventos, ocorrencias e participacoes das Stories 3.1 a 3.5

### React File Targets
- GestaoEventos.React/features/eventos/*
- GestaoEventos.React/services/api/eventos-api.ts
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/scripts/*

### UX and Product Notes
- .specify/memory/ux-flows/05-event-management.md
- .specify/memory/ux-flows/05c-attendance.md

### Story-specific Cautions
- Nao inventar `/finalizar` se o backend atual nao expuser essa rota.
- Nao apagar eventos/ocorrencias cancelados ou finalizados.
- Nao marcar Epic 3 como parity complete sem fluxo ponta a ponta evidenciado.

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
- Rotas de smoke sugeridas: `/admin/eventos`, `/admin/eventos/iniciar`, `/admin/eventos/meus`.

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
- .specify/memory/ux-flows/05c-attendance.md
- GestaoEventos.Angular/src/app/features/evento
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts
- GestaoEventos.Angular/src/app/shared/services/participacao/participacao.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex via `bmad-dev-story`.

### Debug Log References
- `npm run check:acompanhamento`
- `npm run smoke:finalizacao`
- `npm run smoke:evento-inicio`
- `npm run smoke:acompanhamento`
- `npm run smoke:presenca`
- `npm run type-check`
- `npm run lint`
- `npm run test:scaffold`

### Completion Notes List
- Contrato confirmado no Angular/backend: finalizacao e `PUT /api/ocorrencias/{id}/status` com `novo_status: Realizada`.
- Modal apresenta resumo e exige decisao explicita para cada participante pendente: manter pendente ou marcar como ausente.
- Acoes sao bloqueadas por estado, permissao dinamica, contexto e offline conforme a fundacao do acompanhamento.
- Sucesso atualiza a ocorrencia e invalida eventos, meus eventos, jornada e frequencia sem apagar historico.
- Smoke de finalizacao passou em 390 px e 1440 px; smokes das Stories 3.3, 3.4 e 3.5 foram repetidos sem regressao.
- O item de enviar resumo/lembrete fica representado no fluxo, mas o endpoint atual nao possui campos para disparo; os valores nao sao enviados como contrato ficticio.

### File List
- `GestaoEventos.React/features/eventos/acompanhamento/acompanhamento.rules.ts`
- `GestaoEventos.React/features/eventos/acompanhamento/acompanhamento.service.ts`
- `GestaoEventos.React/features/eventos/acompanhamento/useAcompanhamento.ts`
- `GestaoEventos.React/features/eventos/acompanhamento/AcompanhamentoScreen.tsx`
- `GestaoEventos.React/tests/acompanhamento.test.cjs`
- `GestaoEventos.React/tests/finalizacao.smoke.cjs`
- `GestaoEventos.React/scripts/validate-finalizacao.mjs`
- `GestaoEventos.React/docs/finalizacao-parity.md`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/scripts/validate-scaffold.mjs`
- `GestaoEventos.React/package.json`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Contrato e fluxo de finalizacao implementados e validados para revisao.
