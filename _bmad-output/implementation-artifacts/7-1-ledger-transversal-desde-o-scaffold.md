---
baseline_commit: NO_VCS
---

# Story 7.1: Ledger Transversal Desde o Scaffold

Status: done

## Story

As a time de desenvolvimento,
I want parity manifest, analytics service e offline guard criados no inicio,
so that cada feature nova ja nasca verificavel.

## Acceptance Criteria

1. Given `GestaoEventos.React` criado, when a base transversal do app e concluida, then `docs/parity-manifest.md` existe com schema de rota/fluxo React, fonte Angular, endpoint backend, contexto, permissoes, analytics, testes, status e gaps, and possui linhas iniciais para scaffold e fundacao transversal.
2. Given o app roda em web e nativo, when `analytics.service` registra evento, then o provider web publica o contrato `ge_event` em `window.dataLayer`, and providers Android/iOS mantem no-op/fila local ate escolha do destino nativo, and `detail` nao aceita dados pessoais, IDs ou valores sensiveis.
3. Given o dispositivo/navegador esta sem conexao, when o app detecta offline, then existe estado compartilhado e banner global para leitura offline, and um guard reutilizavel bloqueia mutacoes antes de chamadas de API.
4. Given os guardrails do scaffold sao executados, when typecheck, lint e validacoes locais rodam, then analytics, network/offline e parity manifest sao verificados, and o app continua sem runtime Angular, sem `/api/v1` e sem vazamento de dominio ManagerPerson.

## Tasks / Subtasks

- [x] Criar o ledger de paridade em `GestaoEventos.React/docs/parity-manifest.md` (AC: 1)
  - [x] Definir schema canonico com rota/fluxo React, fonte Angular, service Angular, endpoint/classe backend, contexto, permissoes, analytics, testes, status e gaps.
  - [x] Documentar estados permitidos do ledger e regra de que feature so conta para release quando a linha estiver `verified`.
  - [x] Registrar linhas iniciais para scaffold, analytics foundation e offline foundation.
- [x] Implementar `analytics.service` desde o scaffold (AC: 2)
  - [x] Criar tipos/contratos de analytics com actions de funil `visualization`, `entrance`, `simulation`, `confirmation` e actions auxiliares existentes do Angular.
  - [x] Criar provider web em `services/platform/analytics-provider/index.web.ts` usando `window.dataLayer` com evento `ge_event`.
  - [x] Criar providers Android/iOS sem dependencia externa de analytics, com fila local inspecionavel para futuro destino nativo.
  - [x] Bloquear `detail` dinamico/sensivel por contrato de servico antes de publicar evento.
  - [x] Adicionar tracker de rota inicial sem expor IDs ou parametros sensiveis.
- [x] Implementar estado offline e bloqueio de mutacoes (AC: 3)
  - [x] Criar adapter de rede web/Android/iOS em `services/platform/network`.
  - [x] Conectar estado de rede ao React Query `onlineManager` e a uma store compartilhada.
  - [x] Exibir banner global quando o app estiver offline.
  - [x] Criar `assertOnlineForMutation`/erro compartilhado para hooks de mutacao reutilizarem.
- [x] Expandir validacoes locais para o ledger transversal (AC: 4)
  - [x] Criar script de validacao do parity manifest.
  - [x] Atualizar `test:scaffold` para validar scaffold e ledger transversal.
  - [x] Garantir que `check-platform` valide os novos adapters Android/iOS/Web.
- [x] Validar localmente (AC: 1, 2, 3, 4)
  - [x] Rodar `npm run test:scaffold`.
  - [x] Rodar `npm run check:platform`.
  - [x] Rodar `npm run type-check`.
  - [x] Rodar `npm run lint`.
  - [x] Rodar `npx expo-doctor`.
  - [x] Rodar smoke web com Expo e confirmar tela nao branca.
  - [x] Buscar ausencia de `/api/v1`, runtime Angular e termos de dominio ManagerPerson no app React.

## Dev Notes

### Scope Boundaries

- Esta story e parte do Epic 7, mas deve ser executada imediatamente apos a Story 1.1 e antes de qualquer feature story. O readiness report classifica isso como bootstrap obrigatorio para remover dependencia transversal futura. [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-08-30.md`]
- Nao implementar provider nativo definitivo de analytics, push notification, fila de mutacoes offline ou regras especificas de feature nesta story. O objetivo e criar contratos e guardrails reutilizaveis. [Source: `_bmad-output/specs/spec-gestaoeventos-react-app/SPEC.md`]
- Angular permanece baseline produtivo. O manifest deve apontar para fontes Angular/API por rota/fluxo nas proximas stories, sem aposentar Angular nesta etapa. [Source: `ARCHITECTURE-SPINE.md`: AD-2, AD-17]

### Architecture Guardrails

- `analytics.service` deve existir desde o scaffold. Web publica `ge_event` em `window.dataLayer`; nativo inicia no-op ou fila local ate escolha do destino final; rotas emitem `visualization`; funis usam `entrance`, `simulation`, `confirmation`; valores restritos ou sensiveis nunca entram em `detail`. [Source: `ARCHITECTURE-SPINE.md`: AD-9]
- O app pode mostrar leituras recentes em cache offline com banner, mas mutacoes offline sao bloqueadas. Nenhuma fila de escrita deve ser enviada neste release. [Source: `ARCHITECTURE-SPINE.md`: AD-10]
- Diferencas web/native devem ficar atras de adapters em `services/platform/*` com trio `index.android.ts`, `index.ios.ts`, `index.web.ts`; nao criar `index.ts` neutro nas portas de plataforma. [Source: Story 1.1 guardrail implemented]
- `docs/parity-manifest.md` e o ledger de release. Cada rota/fluxo implementado deve registrar rota React, fonte Angular route/component/service, endpoint backend/classe, contexto, permissoes, analytics, testes, status e gaps. [Source: `ARCHITECTURE-SPINE.md`: AD-17]
- Nenhuma tela pode chamar HTTP diretamente; esta story deve apenas preparar servicos compartilhados para as camadas futuras. [Source: `epics.md`: NFR6]

### Analytics Standard

- Fluxos novos devem mapear quatro pontos: `visualization`, `entrance`, `simulation` e `confirmation`, mesmo que nesta story apenas a rota scaffold tenha `visualization` automatica. [Source: `docs/analytics/tagging-standard.md`]
- `detail` deve ser token estavel e nao pode conter labels, dados pessoais, IDs, valores sensiveis ou caminhos concretos com parametros dinamicos. Quando algum identificador for permitido, deve ficar em `extra`, nunca em `detail`. [Source: `epics.md`: NFR2; `docs/analytics/tagging-standard.md`]

### Implementation Notes

- Reutilizar a estrutura criada na Story 1.1 em `GestaoEventos.React`.
- Para deteccao de rede nativa, usar dependencia Expo-managed se necessario e validar com `npx expo-doctor`.
- Providers nativos de analytics devem ser locais e deterministas, sem acoplar Firebase, Segment, GA nativo ou outro fornecedor nesta story.
- O banner offline deve ser visualmente consistente com os tokens GestaoEventos e acessivel com `accessibilityRole="alert"`.

### Testing Requirements

- A story so pode ser concluida se os comandos abaixo forem tentados a partir de `GestaoEventos.React` e registrados no Dev Agent Record:
  - `npm run test:scaffold`
  - `npm run check:platform`
  - `npm run type-check`
  - `npm run lint`
  - `npx expo-doctor`
  - smoke web com `npx expo start --web`
- Busca esperada sem resultados bloqueantes:
  - `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React`
  - `rg "GestaoEventos.Angular" GestaoEventos.React`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npx expo install expo-network`: dependencia Expo-managed instalada para deteccao de rede nativa.
- `npm run check:platform`: passou com `[check-platform] OK - 2 platform adapter port(s) verified.`
- `npm run check:parity`: passou com `[validate-parity-ledger] OK`.
- `npm run test:scaffold`: passou com `[validate-scaffold] OK`, `[validate-parity-ledger] OK` e `[validate-transversal-foundation] OK`.
- `npm run type-check`: passou com `tsc --noEmit`.
- `npm run lint`: passou com `eslint . --max-warnings=0`.
- `npx expo-doctor`: passou com `21/21 checks passed. No issues detected!`.
- `npx expo start --web --port 8085 --clear`: Metro web bundlou sem erro bloqueante.
- `Invoke-WebRequest http://localhost:8085`: retornou HTTP 200 e HTML contendo `GestaoEventos React`, `Expo SDK 57` e `Sem runtime Angular`.
- `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React`: sem resultados.
- `rg "GestaoEventos.Angular" GestaoEventos.React`: sem resultados.
- Revisao inline antes do fechamento: ajustou o payload React para seguir o contrato Angular `ge_event` com `custom.path/action/detail`, permitiu a taxonomia `btn:`, `screen:` e `{modulo}:`, tratou `UNKNOWN` como offline quando o Expo nao informar `isConnected`, e evitou rejeicao nao tratada na leitura inicial de rede.

### Completion Notes List

- Criado `docs/parity-manifest.md` como ledger de release com schema canonico, status permitidos e linhas iniciais verificadas para scaffold, analytics foundation e offline foundation.
- Criado `services/analytics/analytics.service.ts` com contrato `ge_event` compativel com o `GtmService.track()` Angular: `custom.path`, `custom.action`, `custom.detail` e extras no topo do payload web.
- Providers Android/iOS de analytics mantem fila local inspecionavel enquanto o destino nativo definitivo permanece decisao de release.
- Estado offline foi conectado a `expo-network`, React Query `onlineManager`, Zustand store e banner global acessivel.
- Criado `assertOnlineForMutation` para hooks futuros bloquearem escrita offline antes da chamada de API.
- `test:scaffold` agora cobre scaffold, parity manifest e fundacao transversal.
- Smoke web validado por HTTP 200; abertura em device fisico/simulador nativo nao foi executada nesta story.

### File List

- `_bmad-output/implementation-artifacts/7-1-ledger-transversal-desde-o-scaffold.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `GestaoEventos.React/app/_layout.tsx`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/package-lock.json`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/scripts/validate-parity-ledger.mjs`
- `GestaoEventos.React/scripts/validate-scaffold.mjs`
- `GestaoEventos.React/scripts/validate-transversal-foundation.mjs`
- `GestaoEventos.React/services/analytics/analytics.service.ts`
- `GestaoEventos.React/services/analytics/analytics.types.ts`
- `GestaoEventos.React/services/network/NetworkStatusProvider.tsx`
- `GestaoEventos.React/services/offline/mutation-guard.ts`
- `GestaoEventos.React/services/platform/analytics-provider/contract.ts`
- `GestaoEventos.React/services/platform/analytics-provider/index.android.ts`
- `GestaoEventos.React/services/platform/analytics-provider/index.ios.ts`
- `GestaoEventos.React/services/platform/analytics-provider/index.web.ts`
- `GestaoEventos.React/services/platform/analytics-provider/native-queue.ts`
- `GestaoEventos.React/services/platform/network/contract.ts`
- `GestaoEventos.React/services/platform/network/index.android.ts`
- `GestaoEventos.React/services/platform/network/index.ios.ts`
- `GestaoEventos.React/services/platform/network/index.web.ts`
- `GestaoEventos.React/services/platform/network/native.ts`
- `GestaoEventos.React/shared/components/OfflineBanner.tsx`
- `GestaoEventos.React/shared/components/RouteAnalyticsTracker.tsx`
- `GestaoEventos.React/stores/network.store.ts`
- `GestaoEventos.React/tsconfig.json`

## Change Log

- 2026-08-31: Historia criada com contexto BMAD para ledger transversal, analytics scaffold e offline guard.
- 2026-08-31: Implementado ledger de paridade, analytics service, providers web/native, rede/offline guard, banner global e validacoes transversais.
