---
baseline_commit: NO_VCS
---

# Story 6.4: Auditoria e Suporte Administrativo

Status: review

## Story
As a administrador autorizado,
I want consultar auditoria e trilhas de suporte,
So that eu investigue mudancas sem acessar dados fora do meu escopo.

**Requirements covered:** FR18, NFR1, NFR3, UX-DR6.

## Acceptance Criteria
1. Given usuario com permissao de auditoria When acessa auditoria Then dados carregam filtrados pelo contexto permitido And informacoes restritas nao aparecem sem permissao.
2. Given erro operacional When a consulta falha Then a UI preserva status/mensagem/codigo util para suporte And mostra feedback acionavel.

## Tasks / Subtasks
- [x] Criar API de auditoria
  - [x] Mapear filtros por periodo, usuario, recurso, acao e estrutura quando suportados.
  - [x] Preservar paginacao/ordenacao do backend.
- [x] Implementar tela de auditoria
  - [x] Lista/tabela responsiva com detalhe acessivel.
  - [x] Mostrar estados de erro/vazio e filtros persistidos.
- [x] Implementar suporte administrativo existente
  - [x] Portar somente fluxos que existam no Angular/producao.
  - [x] Registrar lacunas quando nao houver backend claro.
- [x] Aplicar permissoes fortes
  - [x] Auditoria e suporte nao podem vazar para usuario comum.
  - [x] 403 deve ser tratado sem expor dados anteriores.
- [x] Instrumentar analytics
  - [x] Abertura de auditoria, filtro e detalhe sem PII no `detail`.

## Dev Notes

### Scope Boundaries
- Porta auditoria e telas administrativas de suporte com filtros e permissoes.
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
- GestaoEventos.Angular/src/app/features/admin/auditoria
- GestaoEventos.Angular/src/app/shared/services/auditoria/auditoria.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

### Backend Contracts
- GET /api/auditoria

### React File Targets
- GestaoEventos.React/app/(app)/configuracoes/auditoria.tsx
- GestaoEventos.React/features/admin/auditoria/*
- GestaoEventos.React/services/api/auditoria-api.ts

### UX and Product Notes
- .specify/memory/ux-navigation.md
- docs/analytics/tagging-standard.md

### Story-specific Cautions
- Auditoria e area sensivel; nao reutilizar dados em cache entre estruturas sem invalidacao.
- Nao registrar PII em analytics.
- Nao criar tela de suporte ficticia sem fonte no Angular/backend.

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
- Rotas de smoke sugeridas: `/configuracoes/auditoria`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-navigation.md
- GestaoEventos.Angular/src/app/features/admin/auditoria
- GestaoEventos.Angular/src/app/shared/services/auditoria/auditoria.service.ts
- GestaoEventos.Angular/src/app/app.routes.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run check:auditoria-suporte`
- `npm run smoke:auditoria-suporte`
- `npm run test:scaffold`
- `npm run type-check`
- `npm run lint`
- `npm run check:platform`
- `npx expo-doctor`
- `rg -n "/api/v1|manager-person|student|treino|nutrition|workout" . -g '!node_modules/**' -g '!.expo/**' -g '!dist/**'` sem ocorrencias.

### Completion Notes List
- API de auditoria implementada com filtro por entidade/acao/data, estrutura ativa, paginacao e normalizacao dos envelopes reais do backend.
- Tela responsiva exibe lista, estados vazio/erro, paginacao e detalhe com dados anteriores/novos quando fornecidos pelo backend.
- 403 e demais falhas operacionais nao deixam registros anteriores visiveis e exibem mensagem acionavel.
- Auditoria e suporte usam `RequirePermission`; analytics nao envia PII, IDs, nomes ou payloads de auditoria no `detail`.
- O backend/Angular nao possuem fluxo de tickets de suporte; a tela oferece somente o canal oficial `suporte@gestaoeventos.app`, com essa lacuna registrada no manifesto.
- Smoke passou em 390px e 1440px nos cenarios autorizado e bloqueado; regressao do scaffold, type-check, lint, check de plataforma e Expo Doctor passaram.

### File List
- `GestaoEventos.React/services/api/auditoria-api.ts`
- `GestaoEventos.React/features/admin/auditoria/useAuditoriaAdmin.ts`
- `GestaoEventos.React/features/admin/auditoria/AuditoriaAdminScreen.tsx`
- `GestaoEventos.React/features/admin/suporte/SuporteAdminScreen.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/auditoria.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/suporte.tsx`
- `GestaoEventos.React/app/(app)/admin/auditoria.tsx`
- `GestaoEventos.React/app/(app)/admin/suporte.tsx`
- `GestaoEventos.React/scripts/validate-auditoria-suporte.mjs`
- `GestaoEventos.React/tests/auditoria-suporte.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Implementacao React concluida e movida para review; suporte limitado ao canal oficial por ausencia de contrato de tickets.
