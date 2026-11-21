---
title: 'Preparar app iOS para revisão como serviço empresarial'
type: 'chore'
created: '2026-09-29'
status: 'in-review'
review_loop_iteration: 0
baseline_commit: '49159d9'
context:
  - 'GestaoEventos.React/AGENTS.md'
  - 'GestaoEventos.React/docs/store-release.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A Apple solicitou esclarecimentos sobre assinaturas e o app precisa deixar inequívoco que a organização compra o serviço fora do app e os colaboradores apenas acessam a assinatura empresarial já contratada.

**Approach:** Garantir no binário iOS que checkout, contratação, upgrade e gerenciamento externo não sejam oferecidos, preservando somente a consulta do plano/limites e o uso operacional. Validar o contrato, gerar uma nova versão iOS e preparar as notas de revisão.

## Boundaries & Constraints

**Always:** Manter Stripe para o portal web/Android; no iOS ocultar qualquer CTA que abra checkout ou portal externo; permitir acesso aos recursos previamente contratados pela organização; respeitar permissões dinâmicas e o contexto ativo; não alterar API/Angular sem necessidade.

**Ask First:** Alterar o modelo comercial para venda individual via Apple In-App Purchase; remover totalmente a consulta do plano atual; submeter ou publicar qualquer build na Apple.

**Never:** Adicionar IAP nesta entrega; abrir links Stripe no iOS; declarar à Apple um fluxo diferente do binário enviado; apagar alterações existentes dos repositórios aninhados.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| iOS enterprise user | Platform.OS = ios, organization has active plan | Sees current plan/limits and uses operational features; no purchase or payment-management CTA | API status error is shown without offering checkout |
| non-iOS admin | Platform.OS != ios, authorized account | Existing plan comparison, Stripe checkout and portal behavior remain available | Existing API error handling is preserved |
| unauthorized user | Missing permission for commercial resources | No commercial data/actions are exposed | Existing permission state is rendered |

</frozen-after-approval>

## Code Map

- `GestaoEventos.React/features/admin/assinatura/AssinaturaAdminScreen.tsx` -- platform gate that hides external purchase/portal actions on iOS while retaining current-plan read-only access.
- `GestaoEventos.React/features/admin/assinatura/useAssinaturaAdmin.ts` -- existing checkout/status/portal orchestration; must not invoke external actions from iOS UI.
- `GestaoEventos.React/features/configuracoes/ConfiguracoesScreen.tsx` -- commercial navigation entries visible according to existing permissions.
- `GestaoEventos.React/tests/store-review-contract.test.cjs` -- contract test for the App Store review requirements.
- `GestaoEventos.React/app.json` and `GestaoEventos.React/eas.json` -- iOS version/build and production EAS submission settings.
- `GestaoEventos.React/docs/store-release.md` -- release and App Store review notes.

## Tasks & Acceptance

**Execution:**
- [x] Verify the existing iOS platform gate and strengthen it only if a reachable purchase/portal CTA remains -- keep iOS read-only and preserve non-iOS behavior.
- [x] Extend the store-review contract test for every reachable iOS commercial CTA -- prevent regressions before a new build.
- [x] Validate the production Expo configuration and increment the iOS build metadata only if required by the submitted binary -- make the App Store submission unambiguous.
- [x] Update release/review notes with the enterprise-only access model and reviewer test path -- align the explanation with the binary.

**Acceptance Criteria:**
- Given the iOS production build, when an authorized organization collaborator opens commercial settings, then only current plan/limits are readable and no purchase, upgrade, portal or external-payment CTA exists.
- Given Android or web, when an authorized account opens commercial settings, then existing Stripe checkout/portal behavior is unchanged.
- Given the review contract tests, when they run, then they fail if an iOS external-payment CTA is reintroduced.
- Given the production Expo configuration, when a production iOS build is generated, then it uses the production bundle ID/API and a build number greater than the previously submitted binary.

## Design Notes

The current code already contains a `Platform.OS !== 'ios'` gate and a store-review contract test from the previous App Store correction. The implementation should first verify whether that fix is present in the build source and focus on gaps, metadata, validation, and review documentation instead of duplicating the same guard.

## Verification

**Commands:**
- `npm run type-check` -- expected: TypeScript succeeds.
- `npm run lint` -- expected: zero lint errors.
- `npm run test:scaffold` -- expected: scaffold and review contract tests succeed.
- `npm run check:platform` -- expected: platform-module checks succeed.
- `npx expo config --type public` with production environment -- expected: production bundle/API configuration is resolved.
