---
baseline_commit: NO_VCS
---

# Story 3.3: Inicio de Evento

Status: review

## Story
As a usuario autorizado,
I want iniciar um evento conforme templates e regras existentes,
So that eu execute o fluxo operacional sem divergencia do Angular.

**Requirements covered:** FR9, NFR3, NFR6, NFR9.

## Acceptance Criteria
1. Given usuario com permissao para iniciar evento When abre `/eventos/iniciar` Then o formulario carrega templates/regras do backend atual And usa React Hook Form + Zod para validacao complexa And submit passa por business hook/service.
2. Given payload de inicio When enviado ao backend Then request/query sai em `snake_case` And erros de validacao retornam em campos acionaveis.

## Tasks / Subtasks
- [x] Criar API de templates e inicio
  - [x] Listar templates pendentes/proximos.
  - [x] Criar evento e materializar/iniciar conforme contrato real.
- [x] Implementar tela `/admin/eventos/iniciar`
  - [x] Exibir cards de templates pendentes por padrao, sem tela vazia de selecao inicial.
  - [x] Permitir ajuste de grupo, horario local e responsaveis quando suportado.
- [x] Validar regras de dados
  - [x] Enviar `grupo_id` obrigatorio maior que zero.
  - [x] Enviar data/hora local como `YYYY-MM-DDTHH:mm:ss`, sem deslocar escolha local para UTC.
- [x] Tratar conflitos e permissoes
  - [x] Exibir conflitos retornados pela API.
  - [x] Bloquear criacao sem permissao dinamica.
- [x] Navegar apos sucesso
  - [x] Ir para `/admin/eventos/acompanhar/:id`; fallback para `/admin/eventos/meus` se o contrato nao retornar ID acompanhavel.

## Dev Notes

### Scope Boundaries
- Porta o fluxo de iniciar evento com templates proativos e contrato real de criacao/materializacao.
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
- GestaoEventos.Angular/src/app/features/evento/iniciar
- GestaoEventos.Angular/src/app/shared/services/evento-template/evento-template.service.ts
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts

### Backend Contracts
- GET /api/evento-templates
- POST /api/eventos
- POST /api/eventos/{id}/materializar
- GET /api/eventos/conflitos

### React File Targets
- GestaoEventos.React/app/(app)/eventos/iniciar.tsx
- GestaoEventos.React/features/eventos/iniciar-evento/*
- GestaoEventos.React/services/api/evento-templates-api.ts
- GestaoEventos.React/services/api/eventos-api.ts

### UX and Product Notes
- .specify/memory/ux-flows/05b-event-initiation.md
- .specify/memory/ux-flows/05a-event-templates.md

### Story-specific Cautions
- Nao converter horario escolhido pelo usuario para UTC antes de enviar ao backend.
- Nao permitir `grupo_id` zero/nulo em criacao.
- O fluxo inicial deve ser proativo com templates pendentes.

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
- Rotas de smoke sugeridas: `/admin/eventos/iniciar`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- .specify/memory/ux-flows/05b-event-initiation.md
- .specify/memory/ux-flows/05a-event-templates.md
- GestaoEventos.Angular/src/app/features/evento/iniciar
- GestaoEventos.Angular/src/app/shared/services/evento-template/evento-template.service.ts
- GestaoEventos.Angular/src/app/shared/services/evento/evento.service.ts

## Dev Agent Record

### Agent Model Used
Codex.

### Debug Log References
- RED: teste executavel falhou por ausencia do schema antes da implementacao.
- GREEN: 7 testes de schema/service/adaptador HTTP reais passaram.
- Playwright com API mockada: 390x900 e 1440x900, criacao unica, snake_case, navegacao e ausencia de overflow/erros JS.
- type-check, lint, test:scaffold e check:platform passaram; expo-doctor 21/21 apos patches Expo/Router.
- Busca de contratos/terminologia indevidos sem resultados.

### Completion Notes List
- Modelos proativos, formulario RHF/Zod, horario local, recorrencia com rrule e politica de fim do modelo.
- Contexto, permissao de criacao e conectividade revalidados entre requisicoes; falha apos criacao nao repete POST de evento.
- Contrato de criacao nao permite selecionar responsaveis; lacuna documentada sem enviar campos ficticios.
- Endpoint de conflitos agora consulta eventos ativos da mesma estrutura/grupo e bloqueia sobreposicoes reais.
- Destino de acompanhamento ainda depende da Story 3.4. Testes nao representam homologacao em producao ou dispositivo nativo.

### File List
- GestaoEventos.React/services/api/evento-templates-api.ts
- GestaoEventos.React/services/api/eventos-api.ts
- GestaoEventos.React/features/eventos/iniciar-evento/inicio.schema.ts
- GestaoEventos.React/features/eventos/iniciar-evento/inicio.service.ts
- GestaoEventos.React/features/eventos/iniciar-evento/useInicioEvento.ts
- GestaoEventos.React/features/eventos/iniciar-evento/InicioEventoScreen.tsx
- GestaoEventos.React/features/eventos/meus-eventos/screens/MeusEventosScreen.tsx
- GestaoEventos.React/app/(app)/eventos/iniciar.tsx
- GestaoEventos.React/app/(app)/admin/eventos/iniciar.tsx
- GestaoEventos.React/tests/evento-inicio.test.cjs
- GestaoEventos.React/tests/evento-inicio.smoke.cjs
- GestaoEventos.React/tests/artifacts/evento-inicio/form-390.png
- GestaoEventos.React/tests/artifacts/evento-inicio/form-1440.png
- GestaoEventos.React/docs/evento-inicio-parity.md
- GestaoEventos.React/docs/parity-manifest.md
- GestaoEventos.React/package.json
- GestaoEventos.React/package-lock.json
- _bmad-output/implementation-artifacts/3-3-inicio-de-evento.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log
- 2026-09-07: Implementacao de inicio de evento, testes executaveis e smoke responsivo; lacunas de backend registradas para release.
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
