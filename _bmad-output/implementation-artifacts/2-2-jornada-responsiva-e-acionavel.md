---
baseline_commit: NO_VCS
---

# Story 2.2: Jornada Responsiva e Acionavel

Status: review

## Story
As a usuario em mobile ou web,
I want consultar detalhes da jornada em layout adequado,
So that eu entenda pendencias e historico sem perder contexto.

**Requirements covered:** FR6, FR7, NFR4, NFR7, UX-DR3, UX-DR7.

## Acceptance Criteria
1. Given viewport mobile When a jornada exibe listas ou tabelas Then o conteudo usa cards, accordions ou sheets And controles principais tem alvo de toque adequado.
2. Given viewport web/tablet When a jornada exibe conteudo operacional Then a tela usa densidade administrativa sem hero promocional And foco, labels e contraste atendem o piso de acessibilidade.

## Tasks / Subtasks
- [x] Criar layout responsivo da Jornada
  - [x] Usar blocos compactos para resumo e listas escaneaveis.
  - [x] Adaptar detalhes para sheets/modais em mobile e paines em desktop.
- [x] Adicionar acoes de jornada
  - [x] Permitir abrir evento, resolver pendencia e navegar para frequencia/historico quando disponivel.
  - [x] Aplicar permissoes e bloqueio offline nas acoes mutaveis.
- [x] Implementar filtros e ordenacao essenciais
  - [x] Priorizar hoje/proximos, pendencias e historico recente.
  - [x] Manter performance com listas grandes.
- [x] Tratar estados de dados
  - [x] Exibir vazio, erro recuperavel e atualizacao em background sem layout shift relevante.
- [x] Validar acessibilidade basica
  - [x] Tamanhos de toque, foco web e labels de controles.

## Dev Notes

### Scope Boundaries
- Refina a Jornada para uso mobile/web com acoes e estados esperados pelo usuario.
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
- GestaoEventos.Angular/src/app/features/jornada
- GestaoEventos.Angular/src/app/features/frequencia
- GestaoEventos.Angular/src/app/shared/services/jornada/jornada.service.ts

### Backend Contracts
- Contratos de Story 2.1
- Endpoints de eventos/ocorrencias usados para abrir detalhes vinculados

### React File Targets
- GestaoEventos.React/features/jornada/components/*
- GestaoEventos.React/features/jornada/screens/JornadaScreen.tsx
- GestaoEventos.React/shared/components/*

### UX and Product Notes
- .specify/memory/ux-flows/05d-journey-personal.md
- .specify/memory/ux-flows/09-mobile-adaptations.md
- .specify/memory/ux-flows/ux-principles.md

### Story-specific Cautions
- Nao depender de hover para informacao critica.
- Textos devem caber em cards/botoes pequenos; reduzir densidade antes de reduzir legibilidade.
- Acoes indisponiveis devem explicar o motivo quando isso impactar o fluxo.

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
- Rotas de smoke sugeridas: `/jornada`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/05d-journey-personal.md
- .specify/memory/ux-flows/09-mobile-adaptations.md
- .specify/memory/ux-flows/ux-principles.md
- GestaoEventos.Angular/src/app/features/jornada
- GestaoEventos.Angular/src/app/features/frequencia
- GestaoEventos.Angular/src/app/shared/services/jornada/jornada.service.ts

## Dev Agent Record

### Agent Model Used
Codex GPT-5

### Debug Log References
- RED: `node scripts/validate-jornada-responsive.mjs` falhou por ausencia de componentes, acoes e criterios responsivos.
- GREEN: `npm run check:jornada-responsive` passou apos `JornadaSectionTabs`, `JornadaActionPanel`, detalhe sob demanda e acoes.
- Lint: `npm run lint` falhou inicialmente por tipo `Array<T>` e variavel nao usada no validador; passou apos ajustes.
- Validacao final: `npm run check:platform`, `npm run type-check`, `npm run lint`, `npm run test:scaffold`, `npx expo-doctor`.
- Regressao de termos/contratos: `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React` retornou `no_forbidden_terms`.

### Completion Notes List
- Jornada agora usa abas compactas no mobile e grade administrativa com painel lateral no desktop.
- Acoes de abrir evento, resolver pendencia e registrar presenca usam `can(...)`, Expo Router e bloqueio offline via `assertOnlineForMutation`.
- Pendencias podem abrir um detalhe carregado sob demanda por grupo sem trocar o contexto ativo.
- Atualizacao em background aparece como indicador compacto sem trocar a estrutura das secoes.
- Manifesto registra `journey-responsive-actions-foundation`.

### File List
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/features/jornada/components/JornadaActionPanel.tsx
- GestaoEventos.React/features/jornada/components/JornadaSectionTabs.tsx
- GestaoEventos.React/features/jornada/hooks/useJornada.ts
- GestaoEventos.React/features/jornada/hooks/usePendenciasDetalhe.ts
- GestaoEventos.React/features/jornada/screens/JornadaScreen.tsx
- GestaoEventos.React/features/jornada/services/jornada.service.ts
- GestaoEventos.React/package.json
- GestaoEventos.React/scripts/validate-jornada-responsive.mjs
- GestaoEventos.React/scripts/validate-scaffold.mjs
- GestaoEventos.React/services/query/query-keys.ts

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-02: Jornada responsiva com abas, painel/sheet de detalhe e acoes guardadas implementada.
