---
baseline_commit: NO_VCS
---

# Story 6.3: Tipos, Planos, Assinatura e Limites

Status: review

## Story
As a administrador autorizado,
I want configurar tipos e consultar plano/assinatura/limites,
So that a estrutura opere dentro das regras contratadas.

**Requirements covered:** FR16, FR17, NFR2, NFR3, NFR6.

## Acceptance Criteria
1. Given contexto inicial possui plano e limites When telas administrativas precisam desses dados Then exibem informacao consistente com o backend And nao enviam dados financeiros sensiveis para analytics `detail`.
2. Given usuario opera tipos de grupo ou evento When cria/edita registros Then requests seguem `snake_case` And erros de validacao aparecem nos campos corretos.

## Tasks / Subtasks
- [x] Criar APIs de configuracao
  - [x] Tipos de grupo, tipos de evento, planos e assinaturas.
  - [x] Mapear status/limites retornados pelo backend.
- [x] Implementar CRUDs de tipos
  - [x] Usar componente/form unico por entidade no React.
  - [x] Validar nomes, status e vinculos antes de permitir exclusao quando backend negar.
- [x] Implementar telas de plano/assinatura
  - [x] Mostrar status atual, limites e acoes de checkout/portal quando habilitadas.
  - [x] Tratar indisponibilidade de gateway de forma explicita.
- [x] Integrar limites
  - [x] Consumir status de assinatura/limite para bloquear acoes administrativas se necessario.
  - [x] Nao duplicar regra sensivel no client alem de feedback preventivo.
- [x] Testar permissoes e erros
  - [x] 403, plano inexistente, limite excedido e erro de checkout/portal.

## Dev Notes

### Scope Boundaries
- Porta configuracoes de tipos, planos, assinaturas e limites operacionais.
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
- GestaoEventos.Angular/src/app/features/admin/tipos-grupo
- GestaoEventos.Angular/src/app/features/admin/tipos-evento
- GestaoEventos.Angular/src/app/core/services/limite.service.ts
- GestaoEventos.Angular/src/app/core/services/limite-validation.service.ts

### Backend Contracts
- GET /api/tipos-grupo
- POST /api/tipos-grupo
- PUT /api/tipos-grupo/{Id}
- DELETE /api/tipos-grupo/{Id}
- GET /api/tipos-evento
- POST /api/tipos-evento
- PUT /api/tipos-evento/{Id}
- DELETE /api/tipos-evento/{Id}
- GET /api/planos
- POST /api/planos
- PUT /api/planos/{Id:int}
- DELETE /api/planos/{Id:int}
- GET /api/assinaturas/status
- POST /api/assinaturas/checkout
- POST /api/assinaturas/portal

### React File Targets
- GestaoEventos.React/app/(app)/configuracoes/tipos.tsx
- GestaoEventos.React/app/(app)/configuracoes/assinatura.tsx
- GestaoEventos.React/features/admin/tipos/*
- GestaoEventos.React/features/admin/assinatura/*
- GestaoEventos.React/services/api/configuracoes-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/03-structure-management.md
- .specify/memory/design-system.md

### Story-specific Cautions
- Nao enviar dados financeiros sensiveis para analytics.
- Checkout/portal devem usar URLs/contratos retornados pela API, nao valores hardcoded.
- Exclusao negada pelo backend deve aparecer como estado de regra, nao erro generico.

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
- Rotas de smoke sugeridas: `/configuracoes/tipos`, `/configuracoes/assinatura`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/03-structure-management.md
- GestaoEventos.Angular/src/app/features/admin/tipos-grupo
- GestaoEventos.Angular/src/app/features/admin/tipos-evento
- GestaoEventos.Angular/src/app/core/services/limite.service.ts
- GestaoEventos.Angular/src/app/core/services/limite-validation.service.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run check:configuracoes-comerciais`
- `npm run smoke:configuracoes-comerciais`
- `npm run test:scaffold`
- `npm run type-check`
- `npm run lint`
- `npm run check:platform`
- `npx expo-doctor`

### Completion Notes List
- Serviço React implementado para tipos de grupo/evento, planos, status da assinatura, checkout e portal usando os endpoints existentes.
- CRUD de tipos usa payloads `snake_case`, contexto de estrutura ativo, validação preventiva e erro operacional do backend para exclusao negada.
- Tela universal de tipos cobre grupo e evento com formulario unico por entidade e aliases administrativos protegidos por permissao dinamica.
- Tela de planos exibe limites retornados pela API; assinatura exibe status, validade e limites oficiais. Checkout e portal abrem somente URLs devolvidas pelo backend.
- Analytics nao envia valores, IDs, URLs ou outros dados financeiros no `detail`.
- Smoke passou em 390px e 1440px nos cenarios autorizado e bloqueado; regressao completa do scaffold e Expo Doctor passaram.

### File List
- `GestaoEventos.React/services/api/configuracoes-api.ts`
- `GestaoEventos.React/features/admin/tipos/useTiposAdmin.ts`
- `GestaoEventos.React/features/admin/tipos/TiposAdminScreen.tsx`
- `GestaoEventos.React/features/admin/assinatura/useAssinaturaAdmin.ts`
- `GestaoEventos.React/features/admin/assinatura/AssinaturaAdminScreen.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/tipos.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/planos.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/assinatura.tsx`
- `GestaoEventos.React/app/(app)/admin/tipos-grupo.tsx`
- `GestaoEventos.React/app/(app)/admin/tipos-evento.tsx`
- `GestaoEventos.React/app/(app)/admin/planos.tsx`
- `GestaoEventos.React/app/(app)/admin/assinatura.tsx`
- `GestaoEventos.React/scripts/validate-configuracoes-comerciais.mjs`
- `GestaoEventos.React/tests/configuracoes-comerciais.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Implementacao React concluida e movida para review; contratos comerciais e lacunas do backend registrados.
