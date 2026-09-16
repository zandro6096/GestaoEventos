---
baseline_commit: NO_VCS
---

# Story 6.2: Membros, Papeis e Permissoes

Status: review

## Story
As a administrador autorizado,
I want gerir membros, papeis e permissoes,
So that a estrutura mantenha governanca correta.

**Requirements covered:** FR16, NFR1, NFR3, NFR6, NFR9.

## Acceptance Criteria
1. Given usuario com permissao administrativa When acessa membros, papeis ou permissoes Then o React consome endpoints equivalentes ao Angular And operacoes sensiveis passam por business hook/service.
2. Given qualquer decisao de visibilidade When a UI renderiza comando administrativo Then usa `can(action, resource, scope)` And nao deriva permissao de role-name fixo.

## Tasks / Subtasks
- [x] Criar APIs administrativas
  - [x] Usuarios da estrutura, papeis, permissoes e usuarios virtuais.
  - [x] Normalizar contratos e erros de duplicidade/inativo.
- [x] Implementar tela de membros
  - [x] Listar membros ativos/inativos quando suportado.
  - [x] Permitir alterar papel, funcao, remover/desvincular e convidar conforme permissao.
- [x] Implementar reativacao correta
  - [x] Cadastro/convite de pessoa ja existente inativa deve oferecer `Reativar`.
  - [x] Nao mostrar apenas `Reenviar convite` quando o problema real for vinculo inativo.
- [x] Implementar papeis/permissoes
  - [x] CRUD de papeis e atribuicao/revogacao de permissoes.
  - [x] Usar facade para refletir mudancas imediatamente.
- [x] Testar estados criticos
  - [x] Duplicidade, inativo, convite pendente, 403, owner bypass e troca de estrutura.

## Dev Notes

### Scope Boundaries
- Porta administracao de membros da estrutura, papeis e permissoes dinamicas.
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
- GestaoEventos.Angular/src/app/features/admin/membros
- GestaoEventos.Angular/src/app/features/admin/papeis
- GestaoEventos.Angular/src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts
- GestaoEventos.Angular/src/app/shared/services/papel/papel.service.ts
- GestaoEventos.Angular/src/app/shared/services/permissions/permissions.service.ts
- specs/017-desvinculacao-ownership-usuario-virtual

### Backend Contracts
- GET /api/usuarios-estrutura
- PUT /api/usuarios-estrutura/{Id}/papel
- PATCH /api/usuarios-estrutura/{Id}/funcao
- DELETE /api/usuarios-estrutura/{Id}
- GET /api/papeis
- POST /api/papeis
- PUT /api/papeis/{Id}
- DELETE /api/papeis/{Id}
- GET /api/permissoes/recursos
- POST /api/permissoes/atribuir
- POST /api/permissoes/revogar
- GET /api/usuarios-virtuais
- POST /api/usuarios-virtuais/{id}/enviar-convite

### React File Targets
- GestaoEventos.React/app/(app)/configuracoes/membros.tsx
- GestaoEventos.React/app/(app)/configuracoes/papeis.tsx
- GestaoEventos.React/features/admin/membros/*
- GestaoEventos.React/features/admin/papeis-permissoes/*
- GestaoEventos.React/services/api/admin-api.ts

### UX and Product Notes
- .specify/memory/business.md
- .specify/memory/ux-flows/03-structure-management.md

### Story-specific Cautions
- Permissao dinamica nao e papel fixo.
- Owner bypass deve ficar centralizado na regra/facade.
- Pessoa inativa precisa de caminho de reativacao real, preservando historico.

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
- Rotas de smoke sugeridas: `/configuracoes/membros`, `/configuracoes/papeis`.

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
- GestaoEventos.Angular/src/app/features/admin/membros
- GestaoEventos.Angular/src/app/features/admin/papeis
- GestaoEventos.Angular/src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts
- GestaoEventos.Angular/src/app/shared/services/papel/papel.service.ts
- GestaoEventos.Angular/src/app/shared/services/permissions/permissions.service.ts
- specs/017-desvinculacao-ownership-usuario-virtual

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run check:admin`
- `npm run smoke:admin`
- `npm run type-check`
- `npm run lint`

### Completion Notes List
- APIs administrativas React implementadas sobre os endpoints reais de usuarios da estrutura, usuarios virtuais, papeis e recursos de permissao.
- Tela de membros suporta estados ativo, inativo e convite pendente, com alteracao de papel/funcao, desvinculacao e reenvio apenas para convite pendente.
- Pessoa inativa exibe `Reativar` e chama `POST /api/usuarios-estrutura/{id}/reativar`; a UI nao troca a acao por reenviar convite.
- CRUD de papeis envia permissoes com os valores numericos definidos no contrato e usa a facade `can(...)` para autorizacao dinamica.
- Smoke web passou em 390px e 1440px para autorizado e bloqueado, incluindo a chamada real de reativacao.

### File List
- `GestaoEventos.React/services/api/usuarios-estrutura-api.ts`
- `GestaoEventos.React/services/api/admin-api.ts`
- `GestaoEventos.React/features/admin/membros/useAdminMembros.ts`
- `GestaoEventos.React/features/admin/membros/MembrosAdminScreen.tsx`
- `GestaoEventos.React/features/admin/papeis-permissoes/usePapeisAdmin.ts`
- `GestaoEventos.React/features/admin/papeis-permissoes/PapeisAdminScreen.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/membros.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/papeis.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/permissoes.tsx`
- `GestaoEventos.React/app/(app)/admin/membros.tsx`
- `GestaoEventos.React/app/(app)/admin/papeis.tsx`
- `GestaoEventos.React/app/(app)/admin/permissoes.tsx`
- `GestaoEventos.React/scripts/validate-admin.mjs`
- `GestaoEventos.React/tests/admin.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Implementacao React concluida e movida para review; endpoint real de reativacao integrado e validado.
