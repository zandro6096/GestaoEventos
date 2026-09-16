---
baseline_commit: NO_VCS
---

# Story 1.6: Shell Responsivo e Tokens GestaoEventos

Status: review

## Story
As a usuario em celular, tablet ou web,
I want navegar pelo mesmo app com layout adequado ao meu dispositivo,
So that eu opere sem aprender fluxos diferentes por plataforma.

**Requirements covered:** FR5, FR6, NFR4, NFR6, NFR7, UX-DR1, UX-DR2, UX-DR3, UX-DR4, UX-DR7, UX-DR8, UX-DR10.

## Acceptance Criteria
1. Given viewport mobile When o usuario entra em rotas autenticadas Then tabs primarias exibem `jornada`, `eventos`, `grupos`, `painel` e `perfil` And rotas profundas/admin continuam acessiveis fora da tab bar principal.
2. Given viewport tablet largo ou web When o usuario entra em rotas autenticadas Then a mesma arvore de rotas renderiza sidebar/topbar And breadcrumb/contexto ativo permanecem visiveis quando aplicavel.
3. Given componentes base do app When tokens sao aplicados Then cores, espacamento, foco, estados, tipografia e mensagens seguem GestaoEventos And nao usam identidade dark/lime do ManagerPerson.

## Tasks / Subtasks
- [x] Criar shell autenticado responsivo
  - [x] Usar bottom tabs/toolbar compacta em mobile e navegacao lateral/topbar em desktop web.
  - [x] Manter dimensoes estaveis para barras, botoes e areas de conteudo.
- [x] Portar tokens visuais do design system
  - [x] Definir cores, tipografia, espacamentos e componentes base em `shared/theme`.
  - [x] Evitar paleta de uma nota e respeitar contraste.
- [x] Adicionar navegacao principal
  - [x] Expor Jornada, Eventos, Grupos, Painel e Configuracoes conforme permissoes.
  - [x] Incluir indicador de contexto ativo.
- [x] Remover dependencia visual de scaffold
  - [x] Manter utilitarios tecnicos, mas substituir a primeira tela por experiencia funcional.
  - [x] Garantir que textos caibam em mobile e desktop.
- [x] Criar snapshots/smokes de layout
  - [x] Validar largura mobile, tablet/web estreito e desktop.

## Dev Notes

### Scope Boundaries
- Entrega o shell visual responsivo e tokens do GestaoEventos para substituir a tela scaffold.
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
- GestaoEventos.Angular/src/app/libs/layout/main/main.component.*
- GestaoEventos.Angular/src/app/libs/layout/sidebar
- GestaoEventos.Angular/src/app/app.routes.ts

### Backend Contracts
- Sem novo contrato obrigatorio; depende de auth/contexto/permissoes das stories 1.3 a 1.5

### React File Targets
- GestaoEventos.React/app/(app)/_layout.tsx
- GestaoEventos.React/shared/theme/*
- GestaoEventos.React/shared/components/AppShell.tsx
- GestaoEventos.React/shared/components/AppNavigation.tsx

### UX and Product Notes
- .specify/memory/design-system.md
- .specify/memory/frontend.md
- .specify/memory/ux-flows/layout-structure.md
- .specify/memory/ux-flows/09-mobile-adaptations.md

### Story-specific Cautions
- Nao criar landing page/hero; a primeira tela autenticada deve ser ferramenta operacional.
- Nao colocar cards dentro de cards nem secoes inteiras como cards flutuantes.
- Usar icones conhecidos quando o comando for iconico; evitar texto em botoes pequenos.

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
- Rotas de smoke sugeridas: `/admin/jornada`, `/admin/eventos`, `/admin/grupos`, `/admin/painel`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/layout-structure.md
- .specify/memory/ux-flows/09-mobile-adaptations.md
- GestaoEventos.Angular/src/app/libs/layout/main/main.component.*
- GestaoEventos.Angular/src/app/libs/layout/sidebar
- GestaoEventos.Angular/src/app/app.routes.ts

## Dev Agent Record

### Agent Model Used
Codex GPT-5

### Debug Log References
- RED: `node scripts/validate-shell-layout.mjs` falhou por ausencia de shell, tema, rota de perfil, script e manifesto.
- GREEN: `npm run check:shell` passou.
- Typecheck: `npm run type-check` falhou inicialmente por `Redirect` tipado em `/admin/jornada`; passou apos cast `Href`.
- Lint: `npm run lint` falhou inicialmente por import/hook; passou apos preservar `Slot` na selecao de estrutura e remover `useMemo` desnecessario.
- Validacao final: `npm run check:platform`, `npm run type-check`, `npm run lint`, `npm run test:scaffold`, `npx expo-doctor`.
- Regressao de termos/contratos: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` retornou `no_forbidden_terms`.

### Completion Notes List
- Shell autenticado responsivo implementado em `AppShell` com sidebar/topbar em desktop e bottom nav mobile.
- Navegacao primaria expoe Jornada, Eventos, Grupos, Painel e Perfil; Configuracoes entra como item secundario por permissao.
- Contexto ativo foi centralizado na shell para evitar repeticao nas telas internas.
- Rota raiz agora redireciona para a experiencia funcional autenticada; `ScaffoldHome` permanece como utilitario validavel da fundacao.
- Manifesto de paridade recebeu `responsive-shell-foundation` com evidencia de validacao.

### File List
- GestaoEventos.React/app/(app)/_layout.tsx
- GestaoEventos.React/app/(app)/perfil.tsx
- GestaoEventos.React/app/index.tsx
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/session/screens/AuthenticatedHomeScreen.tsx
- GestaoEventos.React/features/session/screens/ProfileScreen.tsx
- GestaoEventos.React/features/session/screens/ProtectedPlaceholderScreen.tsx
- GestaoEventos.React/package.json
- GestaoEventos.React/scripts/validate-context-switching.mjs
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/scripts/validate-shell-layout.mjs
- GestaoEventos.React/shared/components/AppNavigation.tsx
- GestaoEventos.React/shared/components/AppShell.tsx
- GestaoEventos.React/shared/theme/app-theme.ts
- GestaoEventos.React/shared/theme/index.ts

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-02: Shell responsivo, tokens compartilhados, navegacao por permissoes e rota de perfil implementados no app React.
