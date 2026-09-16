---
baseline_commit: NO_VCS
---

# Story 6.1: Home de Configuracoes e Rotas Admin Guardadas

Status: review

## Story
As a administrador autorizado,
I want acessar configuracoes administrativas em um lugar consistente,
So that eu encontre as areas de gestao sem poluir a navegacao principal mobile.

**Requirements covered:** FR16, NFR1, NFR3, NFR4, UX-DR6.

## Acceptance Criteria
1. Given usuario autorizado When acessa `/configuracoes` Then a home lista areas administrativas permitidas And rotas admin ficam fora das tabs principais no mobile.
2. Given usuario sem permissao When acessa rota admin por URL direta Then a tela mostra estado sem permissao neutro ou redireciona conforme padrao And nao revela dados restritos.

## Tasks / Subtasks
- [x] Criar home de configuracoes
  - [x] Listar areas administrativas disponiveis por permissao.
  - [x] Usar layout operacional compacto.
- [x] Definir rotas admin
  - [x] Membros, papeis/permissoes, tipos, planos/assinaturas, auditoria e suporte.
  - [x] Ocultar rotas sem permissao na navegacao.
- [x] Aplicar guards
  - [x] Bloquear acesso direto por URL.
  - [x] Exibir feedback de sem permissao sem vazar dados.
- [x] Integrar contexto ativo
  - [x] Todas as configuracoes escopadas devem carregar estrutura atual.
  - [x] Diferenciar configuracao global de configuracao da estrutura quando o backend fizer isso.
- [x] Instrumentar analytics
  - [x] Entrada em configuracoes e abertura de area admin.

## Dev Notes

### Scope Boundaries
- Cria a area de configuracoes administrativas com guardas de permissao.
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
- GestaoEventos.Angular/src/app/features/admin
- GestaoEventos.Angular/src/app/app.routes.ts
- GestaoEventos.Angular/src/app/core/guards/permission.guard.ts

### Backend Contracts
- Sem contrato unico; cada rota admin consome os endpoints das Stories 6.2 a 6.4

### React File Targets
- GestaoEventos.React/app/(app)/configuracoes/index.tsx
- GestaoEventos.React/app/(app)/configuracoes/_layout.tsx
- GestaoEventos.React/features/configuracoes/*

### UX and Product Notes
- .specify/memory/ux-navigation.md
- .specify/memory/ux-flows/layout-structure.md

### Story-specific Cautions
- Configuracoes nao devem aparecer para usuario sem permissao.
- Nao transformar configuracoes em landing page; o usuario precisa operar.
- Evitar nomes especificos de igreja/empresa no codigo e na UI base.

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
- Rotas de smoke sugeridas: `/admin/configuracoes`, `/configuracoes`.

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
- .specify/memory/ux-flows/layout-structure.md
- GestaoEventos.Angular/src/app/features/admin
- GestaoEventos.Angular/src/app/app.routes.ts
- GestaoEventos.Angular/src/app/core/guards/permission.guard.ts

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run type-check` e `npm run lint` passaram.
- `npm run check:configuracoes` e `npm run test:scaffold` passaram.
- `npm run smoke:configuracoes` passou em 390px e 1440px para acesso autorizado e bloqueado.

### Completion Notes List
- Criada a home `/configuracoes` e alias `/admin/configuracoes` com `RequirePermission gerenciar:configuracoes`.
- Areas administrativas sao filtradas pela facade `can(...)`, com contexto de estrutura ativa e indicacao de escopo global ou estrutural.
- Criadas rotas guardadas para membros, papeis, permissoes, tipos, planos, assinatura, auditoria e suporte; cada uma permanece neutra ate sua historia de dados reais.
- A navegacao mobile continua sem novas tabs; a home permanece acessivel por rota e a navegacao desktop mantem a area administrativa secundaria.
- Nao foram criados endpoints ficticios nem dados administrativos simulados.

### File List
- `GestaoEventos.React/features/configuracoes/ConfiguracoesScreen.tsx`
- `GestaoEventos.React/features/configuracoes/AdminAreaPlaceholderScreen.tsx`
- `GestaoEventos.React/features/configuracoes/admin-route.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/index.tsx`
- `GestaoEventos.React/app/(app)/configuracoes/_layout.tsx`
- `GestaoEventos.React/app/(app)/admin/configuracoes.tsx`
- `GestaoEventos.React/app/(app)/admin/membros.tsx`
- `GestaoEventos.React/app/(app)/admin/papeis.tsx`
- `GestaoEventos.React/app/(app)/admin/permissoes.tsx`
- `GestaoEventos.React/app/(app)/admin/tipos-grupo.tsx`
- `GestaoEventos.React/app/(app)/admin/tipos-evento.tsx`
- `GestaoEventos.React/app/(app)/admin/planos.tsx`
- `GestaoEventos.React/app/(app)/admin/assinatura.tsx`
- `GestaoEventos.React/app/(app)/admin/auditoria.tsx`
- `GestaoEventos.React/app/(app)/admin/suporte.tsx`
- `GestaoEventos.React/shared/theme/app-theme.ts`
- `GestaoEventos.React/scripts/validate-configuracoes.mjs`
- `GestaoEventos.React/tests/configuracoes.smoke.cjs`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/docs/parity-manifest.md`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Implementada home administrativa, rotas guardadas, filtro por permissao/contexto, analytics e smoke responsivo.
