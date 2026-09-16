---
baseline_commit: NO_VCS
---

# Story 3.5: Registro de Presenca

Status: review

## Story
As a usuario autorizado,
I want registrar presenca no evento,
So that o historico operacional fique correto.

**Requirements covered:** FR11, FR21, NFR3, NFR5, UX-DR9.

## Acceptance Criteria
1. Given evento com participantes elegiveis When o usuario registra presenca Then a mutacao usa endpoint real do backend And sucesso atualiza React Query sem reload completo And falha reverte estado otimista ou preserva valor anterior.
2. Given o app esta offline When o usuario tenta registrar presenca Then a mutacao e bloqueada And um banner/toast informa que escrita offline nao esta disponivel.

## Tasks / Subtasks
- [x] Criar API de presenca
  - [x] Mapear criar/atualizar/remover participacao em evento.
  - [x] Suportar envio individual e lote conforme contrato atual.
- [x] Implementar UI de chamada
  - [x] Lista de participantes com status PRESENTE/AUSENTE/JUSTIFICADO e estados de sincronizacao.
  - [x] Adicionar busca/filtro sem quebrar uso mobile.
- [x] Aplicar regras de justificativa
  - [x] JUSTIFICADO sempre exige motivo.
  - [x] AUSENTE exige motivo apenas quando o template/configuracao exigir.
- [x] Tratar mutacao/offline
  - [x] Bloquear alteracoes offline com feedback claro.
  - [x] Invalidar dados de evento/jornada/frequencia apos sucesso.
- [x] Cobrir edge cases
  - [x] Participante removido, evento finalizado/cancelado, conflito de permissao e erro parcial em lote.

## Dev Notes

### Scope Boundaries
- Porta o registro de presenca individual e em lote com validacoes de justificativa.
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
- GestaoEventos.Angular/src/app/features/evento/presenca
- GestaoEventos.Angular/src/app/shared/services/participacao/participacao.service.ts
- GestaoEventos.Angular/src/app/shared/services/participante/participante.service.ts

### Backend Contracts
- POST /api/participacoes-evento
- POST /api/participacoes-evento/lote
- GET /api/participacoes-eventos
- GET /api/participacoes-evento/{Id:int}
- PUT /api/participacoes-evento/{Id:int}
- DELETE /api/participacoes-evento/{Id:int}

### React File Targets
- GestaoEventos.React/features/eventos/presenca/*
- GestaoEventos.React/services/api/participacoes-evento-api.ts
- GestaoEventos.React/services/offline/mutation-guard.ts
- GestaoEventos.React/app/(app)/eventos/acompanhar/[id].tsx

### UX and Product Notes
- .specify/memory/ux-flows/05c-attendance.md

### Story-specific Cautions
- Nao permitir JUSTIFICADO sem motivo.
- Nao exigir motivo de AUSENTE quando o template nao exigir.
- Nao implementar fila de mutacao offline nesta fase; arquitetura definiu offline read-only.

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
- GestaoEventos.Angular/src/app/features/evento/presenca
- GestaoEventos.Angular/src/app/shared/services/participacao/participacao.service.ts
- GestaoEventos.Angular/src/app/shared/services/participante/participante.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex via `bmad-dev-story`.

### Debug Log References
- `npm run check:presenca`
- `npm run smoke:presenca`
- `npm run type-check`
- `npm run lint`
- `npm run test:scaffold`

### Completion Notes List
- Implementado registro individual e em lote usando `/api/participacoes-evento` e `/api/participacoes-evento/lote`.
- A lista permite busca, selecao em lote e acoes individuais, respeitando permissao dinamica e estado da ocorrencia.
- Justificativa foi aplicada conforme status e configuracao do modelo; offline bloqueia escrita com feedback explicito.
- Cache da ocorrencia e consultas de jornada sao invalidados apos sucesso, sem reload completo.
- Smoke Playwright/Edge passou em 390 px e 1440 px para os fluxos individual e em lote.
- Gap backend documentado: `AUSENTE` ainda e validado como observacao obrigatoria no servidor mesmo quando a configuracao permite ausencia sem motivo.

### File List
- `GestaoEventos.React/services/api/participacoes-evento-api.ts`
- `GestaoEventos.React/features/eventos/presenca/presenca.rules.ts`
- `GestaoEventos.React/features/eventos/presenca/presenca.service.ts`
- `GestaoEventos.React/features/eventos/presenca/usePresenca.ts`
- `GestaoEventos.React/features/eventos/acompanhamento/AcompanhamentoScreen.tsx`
- `GestaoEventos.React/services/api/evento-templates-api.ts`
- `GestaoEventos.React/tests/presenca.test.cjs`
- `GestaoEventos.React/tests/presenca.smoke.cjs`
- `GestaoEventos.React/scripts/validate-presenca.mjs`
- `GestaoEventos.React/docs/presenca-parity.md`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/scripts/validate-scaffold.mjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/package-lock.json`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Implementada e validada a presenca individual/em lote para revisao.
