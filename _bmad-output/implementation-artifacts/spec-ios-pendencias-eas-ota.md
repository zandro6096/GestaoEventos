---
title: 'iOS: pendências completas e atualização OTA'
type: 'bugfix'
created: '2026-10-22'
status: 'in-progress'
baseline_commit: '298df2d1a8ec66f2ff2e1c84962354c432f6c43e'
review_loop_iteration: 0
context:
  - 'GestaoEventos.React/AGENTS.md'
  - 'GestaoEventos.React/docs/ota-policy.md'
---

## Intent

**Problem:** No app iOS, a seção de pendências mostra o total, mas abre recolhida e busca apenas os primeiros 10 itens. Mudanças JavaScript também só são verificadas no início frio do app, sem aviso de atualização pronta durante uma sessão ativa. Os eventos de Nickolas ainda estão com o nome do grupo, apesar de a célula se chamar Dunamis.

**Approach:** No mobile, expandir inicialmente o primeiro grupo de pendências e carregar todos os itens resumidos para ele. Adicionar verificação OTA ao abrir e ao retornar ao primeiro plano, baixar atualização compatível e oferecer recarga explícita. Corrigir os títulos de produção para Dunamis, mantendo o grupo Nickolas abaixo de Davi.

## Boundaries & Constraints

**Always:** Respeitar EAS Update, canal `prod` e runtime compatível; não interromper o trabalho do usuário com recarga automática; manter a lista paginada para grupos muito grandes; distinguir nome do grupo (Nickolas) dos eventos da célula (Dunamis); preservar alterações preexistentes na árvore de trabalho.

**Ask First:** Alterações nativas, novos contratos de API, mudança de autenticação/contexto/permissões, ou promoção de outro conteúdo local para a OTA.

**Never:** Publicar OTA incompatível com o runtime iOS instalado; inserir endereço ou presenças não fornecidos; ocultar erros de carregamento das pendências.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mobile pending list | Summary has 18 items for Nickolas | First group expands and all 18 details load | Keep retry/“Ver mais” if response says more |
| User collapses group | Group is initially expanded | User can collapse; auto-expand does not reopen it | N/A |
| OTA available | Compatible release update found | Download and show a non-blocking “Atualizar agora” action | Keep current app if check/download fails |
| OTA disabled/development | `Updates.isEnabled` is false | No update request or banner | N/A |

## Code Map

- `GestaoEventos.React/features/jornada/screens/JornadaScreen.tsx` -- mobile pending-group expansion and detail size.
- `GestaoEventos.React/app/_layout.tsx` -- application-level update notice.
- `GestaoEventos.React/services/updates/` -- foreground EAS Update check, download and reload.
- `GestaoEventos.React/docs/ota-policy.md` -- safe OTA lifecycle and native-build boundary.
- `GestaoEventos.React/app.json`, `eas.json` -- existing runtime/update URL and `prod` channel to preserve.
- `prompt/2026/Julho/04/teste` -- final group/event names and production record notes.

## Tasks & Acceptance

**Execution:**
- [ ] Add mobile first-group auto-expansion and request enough detail rows to render its pending total; retain explicit collapse and pagination.
- [ ] Add launch/foreground OTA checks, download compatible updates, and expose a non-blocking user-triggered reload.
- [ ] Update OTA guidance without changing the existing native runtime or release channel.
- [ ] Rename Nickolas's three production event titles to Dunamis and update the task record.

**Acceptance Criteria:**
- Given 18 pending occurrences for Nickolas, when his iOS Jornada opens, then the expanded list shows all 18 and event titles reference Dunamis while the group label remains Nickolas.
- Given a compatible update is published to `prod`, when the app launches or returns to foreground, then it downloads the update and lets the user apply it without an App Store build.
- Given the device is offline or no compatible update exists, when the app resumes, then the current session continues without an update prompt.
- Given the downloaded update is ready, when the user chooses “Atualizar agora”, then the app reloads into the downloaded JavaScript update.

## Design Notes

EAS Update can replace JavaScript/assets only when the native binary already contains `expo-updates` and its runtime matches. Keep update checking on app launch and foreground, but leave reload under user control to protect unsaved work.

## Verification

**Commands:**
- `npm run type-check` -- expected: TypeScript succeeds.
- `npm run check:release-contract` -- expected: existing OTA policy and channels remain valid.
- `npx expo config --type public` -- expected: project ID, URL, runtime `1.0.0`, and prod config remain intact.

**Manual checks:**
- Confirm the first mobile group opens on load, renders all 18 provided details, and can still be collapsed.
- Confirm a compatible published update shows the prompt and reloads only after user action.
