---
baseline_commit: NO_VCS
---

# Story 4.3: Gestao de Membros e Responsaveis

Status: review

## Story
As a usuario autorizado,
I want gerenciar membros e responsaveis de grupo,
So that a estrutura operacional reflita quem pode acompanhar cada contexto.

**Requirements covered:** FR13, NFR3, NFR6, NFR9, UX-DR9.

## Acceptance Criteria
1. Given usuario com permissao dinamica When adiciona, remove ou altera membro/responsavel Then a acao passa por business hook/service And componentes usam `can()` para affordances And backend permanece autoridade.
2. Given falha parcial ou erro de permissao When a operacao retorna erro Then a UI nao fecha como sucesso And mostra mensagem que cita a acao afetada.

## Tasks / Subtasks
- [x] Criar API de membros e responsaveis
  - [x] Mapear adicionar/remover membro, listar membros e responsaveis.
  - [x] Usar endpoints de usuarios virtuais/estrutura para convite quando o Angular fizer isso.
- [x] Implementar dialogs/forms de membro
  - [x] Permitir escolher pessoa existente e convidar por email quando suportado.
  - [x] Separar claramente membro do grupo e responsavel do grupo.
- [x] Implementar reativacao de pessoa inativa
  - [x] Quando a pessoa/link ja existir inativo, exibir acao `Reativar`.
  - [x] Nao apresentar `Reenviar convite` como acao primaria para pessoa inativa que precisa reativacao.
- [x] Aplicar permissoes e auditoria visual
  - [x] Acoes de responsavel exigem permissao dinamica de gerenciamento do grupo.
  - [x] Feedback indica sucesso, erro, conflito de duplicidade e lacuna de contrato.
- [x] Cobrir edge cases
  - [x] Pessoa ja ativa no grupo, convite pendente, usuario virtual, convite de responsavel e remocao com historico.

## Dev Notes

### Scope Boundaries
- Porta gestao de membros do grupo, responsaveis e fluxos de convite/reativacao.
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
- GestaoEventos.Angular/src/app/features/grupo
- GestaoEventos.Angular/src/app/shared/services/participante/participante.service.ts
- GestaoEventos.Angular/src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts
- GestaoEventos.Angular/src/app/shared/services/usuario-virtual.service.ts
- specs/017-desvinculacao-ownership-usuario-virtual

### Backend Contracts
- GET /api/grupos-membros
- POST /api/grupos-membros
- DELETE /api/grupos-membros/{Id:int}
- GET /api/responsaveis-grupo
- POST /api/responsaveis-grupo
- DELETE /api/responsaveis-grupo/{id}
- POST /api/usuarios-virtuais/{id}/enviar-convite

### React File Targets
- GestaoEventos.React/features/grupos/membros/*
- GestaoEventos.React/services/api/grupos-membros-api.ts
- GestaoEventos.React/services/api/responsaveis-grupo-api.ts
- GestaoEventos.React/services/api/usuarios-virtuais-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/04-group-hierarchy.md
- .specify/memory/business.md

### Story-specific Cautions
- Convite externo nao torna a pessoa responsavel automaticamente.
- Pessoa inativa deve ter fluxo claro de reativacao, preservando historico.
- Duplicidade deve acionar reativacao/estado existente quando aplicavel, nao erro generico sem saida.

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
- Rotas de smoke sugeridas: `/admin/grupos/1`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/04-group-hierarchy.md
- GestaoEventos.Angular/src/app/features/grupo
- GestaoEventos.Angular/src/app/shared/services/participante/participante.service.ts
- GestaoEventos.Angular/src/app/shared/services/usuarios-estrutura/usuarios-estrutura.service.ts
- GestaoEventos.Angular/src/app/shared/services/usuario-virtual.service.ts
- specs/017-desvinculacao-ownership-usuario-virtual

## Dev Agent Record

### Agent Model Used
Codex GPT-5

### Debug Log References
- `npm run check:grupo-membros`
- `npm run smoke:grupo-membros` com Playwright em 390px e 1440px
- `npm run type-check`, `npm run lint`, `npm run test:scaffold`

### Completion Notes List
- A tela de detalhe agora lista e remove membros/responsaveis, adiciona usuarios reais, cria convites por email e reenvia convites virtuais pendentes.
- Pessoas inativas exibem `Reativar`, nunca `Reenviar convite`; a acao reativa o vinculo existente e conclui a associacao ao grupo.
- Usuario virtual aceito/ativo permanece informativo, pois os POSTs reais de membro/responsavel aceitam somente `usuario_id`.

### File List
- `services/api/grupos-membros-api.ts`
- `services/api/responsaveis-grupo-api.ts`
- `services/api/usuarios-estrutura-api.ts`
- `services/api/usuarios-virtuais-api.ts`
- `features/grupos/membros/membros.rules.ts`
- `features/grupos/membros/membros.service.ts`
- `features/grupos/membros/useGrupoMembros.ts`
- `features/grupos/detalhe/GrupoDetalheScreen.tsx`
- `tests/grupo-membros.test.cjs`
- `tests/grupo-membros.smoke.cjs`
- `scripts/validate-grupo-membros.mjs`
- `docs/grupo-membros-parity.md`
- `docs/parity-manifest.md`
- `package.json`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Implementada a fatia React de membros, responsaveis, convites, estados inativos, reativacao e remocao.
