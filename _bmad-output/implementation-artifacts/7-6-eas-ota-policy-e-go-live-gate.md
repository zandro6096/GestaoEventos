---
baseline_commit: NO_VCS
---

# Story 7.6: EAS, OTA Policy e Go-Live Gate

Status: review

## Story
As a product owner,
I want liberar o React somente quando houver paridade e rollback,
So that o Angular nao seja substituido por um app parcial.

**Requirements covered:** FR20, FR22, NFR8, NFR9, NFR10.

## Acceptance Criteria
1. Given todos os epicos de produto concluidos When o go-live gate e executado Then manifesto exige status `verified` para o escopo produtivo And build/typecheck/lint/smoke E2E passam And existe rollback path documentado.
2. Given uma atualizacao OTA proposta When ela altera API contracts, auth, contexto ou permissoes Then OTA e bloqueado pelo criterio de release And a mudanca segue fluxo de build/release completo.

## Tasks / Subtasks
- [x] Configurar EAS build/update
  - [x] Criar ou ajustar `eas.json` conforme lanes.
  - [x] Definir profiles para dev, preview e prod.
- [x] Definir politica OTA
  - [x] Permitir OTA para UI/copy/ajustes seguros.
  - [x] Bloquear OTA para mudancas de contrato API, auth, contexto, permissoes e schema de dados sem build/review.
- [x] Criar checklist de go-live
  - [x] Paridade funcional por epic, smokes, Expo Doctor, configuracao de ambiente e rollback.
  - [x] Incluir criterio explicito para liberar corte do Angular.
- [x] Documentar rollback
  - [x] Como voltar para lane/build anterior.
  - [x] Como desabilitar feature flag ou rota React se necessario.
- [x] Registrar evidencia final
  - [x] Atualizar manifesto, sprint status e docs de release.

## Dev Notes

### Scope Boundaries
- Define build/release EAS, politica OTA e gate final de go-live para substituir o Angular somente quando houver paridade.
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
- GestaoEventos.Angular
- Docs de deploy existentes, se houver

### Backend Contracts
- Sem contrato novo; depende de compatibilidade total com API existente

### React File Targets
- GestaoEventos.React/eas.json
- GestaoEventos.React/app.json
- GestaoEventos.React/docs/release.md
- GestaoEventos.React/docs/parity-manifest.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### UX and Product Notes
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md

### Story-specific Cautions
- Nao liberar go-live enquanto app React nao estiver funcionando tudo que substitui Angular.
- OTA nao deve carregar mudanca incompatível com backend ou auth.
- Gate final precisa ser binario e baseado em evidencia, nao em promessa de paridade.

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
- Rotas de smoke sugeridas: `/auth/login`, `/jornada`, `/admin/eventos`, `/admin/grupos`, `/admin/painel`, `/configuracoes`.

### References
- _bmad-output/planning-artifacts/epics.md
- _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md
- GestaoEventos.React/docs/parity-manifest.md
- .specify/memory/constitution.md
- .specify/memory/business.md
- .specify/memory/frontend.md
- .specify/memory/design-system.md
- docs/analytics/tagging-standard.md
- GestaoEventos.Angular
- Docs de deploy existentes, se houver

## Dev Agent Record

### Agent Model Used
GPT-5 Codex

### Debug Log References
- `npm run check:release-contract`
- `npm run test:release-contract`
- `npm run check:go-live` (bloqueado com lista de 3 pendencias produtivas atuais)
- `npm run quality-gate`
- `npm run test:scaffold`
- `npx expo-doctor` (21/21 checks)
- `npm run release:gate` deve bloquear enquanto houver linhas produtivas nao verificadas

### Completion Notes List
- `eas.json` versiona os perfis development/preview/production e canais dev/preview/prod definidos na Story 7.5.
- Politica OTA restringe update a UI/copy/acessibilidade/estilos e exige build completo para API, auth, contexto, permissoes, schema ou dominio.
- `release:gate` executa o quality gate e exige status `verified` nas linhas do manifesto; falha com lista objetiva de gaps.
- Rollback web, EAS Update e mobile esta documentado, mantendo Angular como fallback ate o corte aprovado.
- O gate estrutural passa; o go-live permanece bloqueado por paridade produtiva incompleta, conforme solicitado para nao liberar app parcial.
- `EXPO_PUBLIC_ANALYTICS_ENABLED` permite desligar analytics por ambiente sem expor segredos ou alterar a API.

### File List
- `GestaoEventos.React/eas.json`
- `GestaoEventos.React/docs/ota-policy.md`
- `GestaoEventos.React/docs/release.md`
- `GestaoEventos.React/scripts/validate-release-contract.mjs`
- `GestaoEventos.React/scripts/validate-go-live-gate.mjs`
- `GestaoEventos.React/scripts/release-gate.mjs`
- `GestaoEventos.React/tests/release-contract.test.cjs`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/package.json`

## Change Log
- 2026-09-01: Historia criada via `bmad-create-story` em lote para execucao futura.
- 2026-09-07: EAS/OTA/rollback e gate binario de go-live implementados; gate de corte permanece bloqueado por paridade incompleta.
