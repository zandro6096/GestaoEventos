---
baseline_commit: NO_VCS
---

# Story 7.5: Lanes Dev, Preview e Prod

Status: review

## Story
As a responsavel por release,
I want ambientes explicitos para dev, preview e prod,
So that builds publicados nunca apontem para localhost ou API errada.

**Requirements covered:** FR22, NFR8, NFR10.

## Acceptance Criteria
1. Given build preview ou prod When `EXPO_PUBLIC_API_URL` esta ausente ou usa localhost Then build/start falha com erro claro And nao permite login contra destino incorreto.
2. Given web preview/prod When publicado Then origem web esta registrada no CORS do backend And analytics provider usa configuracao do ambiente correto.

## Tasks / Subtasks
- [x] Mapear variaveis de ambiente
  - [x] API base URL, analytics, modo de debug e flags de feature.
  - [x] Falhar alto quando variavel obrigatoria faltar.
- [x] Configurar lanes
  - [x] Dev local, preview homologacao e prod sem localhost/hardcode.
  - [x] Separar nomes, bundle/package identifiers e canais quando aplicavel.
- [x] Integrar backend/CORS
  - [x] Documentar origens necessarias por ambiente.
  - [x] Nao alterar backend sem necessidade; se alterar, gerar instrucao clara.
- [x] Validar configuracao
  - [x] Criar script/check que imprime ambiente sem expor segredos.
  - [x] Testar troca de ambiente no Expo web/native.
- [x] Atualizar docs de release
  - [x] Registrar como promover build entre lanes.

## Dev Notes

### Scope Boundaries
- Configura ambientes dev, preview e prod para o app Expo paralelo.
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
- GestaoEventos.Angular/src/environments
- GestaoEventos.API/src/GestaoEventos.Web/Program.cs

### Backend Contracts
- Configuracao de CORS/backend existente
- Sem novo endpoint

### React File Targets
- GestaoEventos.React/app.json
- GestaoEventos.React/app.config.*
- GestaoEventos.React/eas.json
- GestaoEventos.React/services/api/api-config.ts
- GestaoEventos.React/scripts/*

### UX and Product Notes
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md

### Story-specific Cautions
- Nao deixar `localhost` em preview/prod.
- Nao commitar segredos.
- Cada lane deve ter analytics/config identificavel para evitar misturar dados.

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
- Rotas de smoke sugeridas: `/auth/login`, `/jornada`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- GestaoEventos.Angular/src/environments
- GestaoEventos.API/src/GestaoEventos.Web/Program.cs

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run check:environment`
- `npm run test:environment`
- `npx expo config --json`
- `npx expo-doctor` (21/21 checks)
- `npm run build:web`
- `npm run type-check`
- `npm run lint`

### Completion Notes List
- `development`, `preview` e `prod` possuem configuracao explicita em `app.config.js` e `eas.json`, incluindo canais e identificadores separados.
- `validate-environment` rejeita API ausente, localhost, caminho `/api`, query, fragmento e HTTP nas lanes publicadas, sem imprimir segredos.
- `app.config.js` repete o bloqueio no momento de resolver a configuracao Expo, impedindo build/start publicado contra destino incorreto.
- Analytics inclui a lane no payload e mantem provider unico por plataforma.
- Backend/CORS nao foi alterado: o codigo real le `Cors:AllowedOrigins` e `App:Url`; os dominios finais foram deixados como decisao operacional documentada.

### File List
- `GestaoEventos.React/app.config.js`
- `GestaoEventos.React/eas.json`
- `GestaoEventos.React/services/runtime/app-environment.ts`
- `GestaoEventos.React/services/analytics/analytics.service.ts`
- `GestaoEventos.React/services/platform/analytics-provider/contract.ts`
- `GestaoEventos.React/scripts/validate-environment.mjs`
- `GestaoEventos.React/tests/environment.test.cjs`
- `GestaoEventos.React/.env.preview.example`
- `GestaoEventos.React/.env.production.example`
- `GestaoEventos.React/docs/release-environments.md`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/package.json`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: Lanes dev/preview/prod, preflight de ambiente, EAS profiles e documentacao CORS implementados e validados.
