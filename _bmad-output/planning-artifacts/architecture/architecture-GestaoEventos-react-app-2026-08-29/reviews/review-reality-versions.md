# Review - Reality and Versions

**Target:** `ARCHITECTURE-SPINE.md`  
**Lens:** Verify that committed decisions were web-researched or reality-checked rather than asserted from training data: current library/framework versions, named technology existence/fit, and brownfield claims against GestaoEventos and ManagerPerson React.  
**Date:** 2026-08-29  
**Reviewer verdict:** **Changes required before final handoff.**

The spine is directionally grounded in the actual projects and most named packages exist and are current in the npm registry. However, the pinned stack mixes npm `latest` values with an Expo SDK stack, which creates an unsupported or at least unverified dependency matrix for an Expo universal app. The contract and brownfield scan also needs one correction around context hydration: the Angular flow uses `/api/contexto/inicial`, while `/api/auth/context` is a separate POST endpoint.

## Method

- Ran the BMad deterministic spine lint:
  - `uv run .agents/skills/bmad-architecture/scripts/lint_spine.py --workspace _bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29`
  - Result: `ok: true`, `total_findings: 0`.
- Checked `ARCHITECTURE-SPINE.md` and `.memlog.md`.
- Checked local GestaoEventos Angular routes/services/interceptors/design tokens.
- Checked local GestaoEventos API FastEndpoints route constants and endpoint code.
- Checked `C:/Users/Sandr/workspace/manager-person/ManagerPersonTrainer.React` package manifest, Expo config, route tree, services, stores and adapters.
- Checked npm registry with `npm view <package>@latest ...` on 2026-08-29.
- Checked official web sources:
  - Expo SDK 57 changelog: https://expo.dev/changelog/sdk-57
  - React Native 0.87 release notes: https://reactnative.dev/blog/2026/08/11/react-native-0.87

## Findings

### High - Stack pins npm latest React Native/TypeScript instead of the Expo SDK 57 compatible matrix

**Where:** `ARCHITECTURE-SPINE.md` stack lines 151-164; `.memlog.md` version entry.

**Evidence:**

- Spine pins:
  - `Expo 57.0.18`
  - `React 19.2.8`
  - `React Native 0.87.1`
  - `TypeScript 7.0.2`
- npm registry confirms these are current latest values for their individual packages:
  - `expo@latest = 57.0.18`
  - `react@latest = 19.2.8`
  - `react-native@latest = 0.87.1`
  - `typescript@latest = 7.0.2`
- Official Expo SDK 57 changelog says SDK 57 brings React Native 0.86 to Expo, and `expo@57.0.17` updates React Native to 0.86.3.
- `npm view expo-template-tabs@57.0.20 ...` returns the SDK 57 template matrix:
  - `expo ~57.0.18`
  - `expo-router ~57.0.17`
  - `react 19.2.3`
  - `react-dom 19.2.3`
  - `react-native 0.86.3`
  - `react-native-web ~0.21.0`
  - `typescript ~6.0.3`
- ManagerPerson reference app is also on the SDK 57 family but uses `react 19.2.3`, `react-dom 19.2.3`, `react-native 0.86.2`, and `typescript ~6.0.3` in `C:/Users/Sandr/workspace/manager-person/ManagerPersonTrainer.React/package.json`.
- React Native 0.87 exists, but its official release notes call out new breaking changes and toolchain requirements including Node.js >= 22.13.0, AGP 9 and Kotlin 2.0+.

**Why this matters:**

The spine says "Expo universal app" but the stack table is effectively "npm latest per package." Expo apps should usually use the Expo SDK-compatible dependency set, installed through `npx expo install`/templates, unless a deliberate bare/native upgrade decision is made. Pinning RN 0.87.1 and TS 7.0.2 into Expo SDK 57 can cause install, typecheck, Metro, native build, or Expo Doctor failures.

**Recommended correction to the spine:**

Replace the stack table with an Expo SDK-compatible matrix, for example:

- `expo ~57.0.18`
- `expo-router ~57.0.17`
- `react 19.2.3`
- `react-dom 19.2.3`
- `react-native 0.86.3`
- `react-native-web ~0.21.0`
- `typescript ~6.0.3`

Then add a rule that Expo-managed packages are resolved with `npx expo install` and verified by `npx expo-doctor`/`npx expo install --check`.

### High - Universal web dependency set is incomplete

**Where:** `ARCHITECTURE-SPINE.md` stack lines 151-164; AD-1 line 56 says Android, iOS and web.

**Evidence:**

- `expo@latest` peer dependencies include `react-dom` and `react-native-web`.
- `expo-template-tabs@57.0.20` includes `react-dom 19.2.3` and `react-native-web ~0.21.0`.
- ManagerPerson reference app includes `react-dom 19.2.3` and `react-native-web ^0.21.2` in `package.json`.
- The spine stack omits `react-dom` and `react-native-web`.

**Why this matters:**

AD-1 binds the app as universal, including web. Leaving web runtime packages out of the pinned stack lets implementers scaffold incompatible or incomplete web builds while still believing they followed the architecture.

**Recommended correction to the spine:**

Add `react-dom` and `react-native-web` to the stack table, using the Expo SDK 57-compatible versions.

### Medium - RHF + Zod decision omits the resolver package needed by implementation

**Where:** `ARCHITECTURE-SPINE.md` consistency convention line 143 and stack lines 159-160.

**Evidence:**

- Spine commits to React Hook Form + Zod for complex forms.
- npm registry confirms `@hookform/resolvers@latest = 5.9.1`, with peer support for `react-hook-form ^7.55.0` and `zod ^3.25.0 || ^4.0.0`.
- ManagerPerson reference app includes `@hookform/resolvers`.
- The spine stack lists `React Hook Form` and `Zod` but not `@hookform/resolvers`.

**Why this matters:**

The architectural decision is implementable, but the dependency matrix is incomplete. Each form feature could choose a different validation bridge or hand-roll integration.

**Recommended correction to the spine:**

Add `@hookform/resolvers` to the stack and pin it to a current compatible version, preferably `^5.9.1` if adopting Zod 4.

### Medium - Context hydration route is under-specified against brownfield reality

**Where:** AD-5 line 80, AD-13 line 128, capability map lines 277-278.

**Evidence:**

- Angular login flow stores the JWT in `LOCAL_STORAGE.AUTH` and calls `carregarContextoInicial()` after `loginComToken()` in `GestaoEventos.Angular/src/app/core/services/auth.service.ts`.
- That flow delegates to `OnboardingService.getContextoInicial()` and `ContextoApiService.getContextoInicial()`, which calls `${environment.API}/contexto/inicial` with query param `usuario_id`.
- The backend implements `GET /api/contexto/inicial` in `GestaoEventos.API/src/GestaoEventos.Web/Contexto/GetContextoInicial.cs`.
- The backend also implements `POST /api/auth/context`, with token in the form body and `AllowAnonymous()`, in `GestaoEventos.API/src/GestaoEventos.Web/Autenticacao/Context.cs`.
- The spine states "revalidate context with the backend" but does not bind which endpoint shape is authoritative for React parity.

**Why this matters:**

There are two real context endpoints with different methods and payload shapes. If React implementers infer the wrong one from docs or naming, session hydration/onboarding parity can diverge immediately.

**Recommended correction to the spine:**

Bind the initial React context hydration contract explicitly:

- Use the Angular parity path `GET /api/contexto/inicial?usuario_id=<id>` unless product/backend intentionally moves React to `POST /api/auth/context`.
- If `POST /api/auth/context` is chosen, document it as a deliberate contract change and verify Angular coexistence/backward compatibility.

### Low - Version evidence exists in memlog but is too narrow for "fit"

**Where:** `.memlog.md` version entry; `ARCHITECTURE-SPINE.md` stack.

**Evidence:**

- `.memlog.md` records current npm registry package versions for core packages.
- It does not record Expo template compatibility, Expo SDK release notes, peer dependency constraints, or ManagerPerson exact installed versions.
- The deterministic lint cannot detect "current latest but wrong matrix" because it only checks mechanical pinned versions.

**Why this matters:**

The Reviewer Gate lens asks not only "does the package exist/currently publish?" but "does this named technology still fit?" The current memlog entry proves the first and misses the second.

**Recommended correction to the architecture run process:**

Add memlog `version` entries for:

- Expo SDK 57 template matrix.
- ManagerPerson `package.json` reference matrix.
- Official Expo SDK 57 RN/React compatibility note.
- React Native 0.87 toolchain/breaking-change note if considering RN 0.87.

## Confirmed Decisions

These committed decisions were reality-checked and hold:

- **AD-1 Expo universal app:** ManagerPerson has `expo`, `expo-router`, `app/` route groups, `web.bundler = metro`, `web.output = static`, and scripts for Android/iOS/web.
- **AD-2 parallel migration:** This is a user-approved release strategy and fits the brownfield state. The Angular app is present and has extensive routed flows under `app.routes.ts`.
- **AD-3 layered boundaries:** The local Angular rules require a Component -> Business Service -> API Service model. ManagerPerson uses services/hooks/stores and React Query; the React adaptation is plausible.
- **AD-4 no BFF and no `/api/v1`:** GestaoEventos API routes are `/api/...`; ManagerPerson services use `/api/v1`, so the spine correctly prevents inheriting that prefix.
- **AD-5 SecureStore/Zustand/React Query split:** ManagerPerson uses SecureStore for tokens and Zustand stores; React Query is wired at the root layout. The chosen split fits Expo.
- **AD-6 one route tree with tabs/deep routes:** ManagerPerson uses Expo Router route groups and hidden tab routes via `href: null`; the pattern is real and fits the requested app.
- **AD-7 GestaoEventos visual source:** GestaoEventos design docs and SCSS tokens use brand blue `#0066FF`, light surfaces and 8px rhythm. ManagerPerson local tokens are dark/lime and should not be copied.
- **AD-9 analytics from scaffold:** GestaoEventos has `docs/analytics/tagging-standard.md`, `GtmService.track()`, `ge_event`, automatic route visualization, and funnel actions.
- **AD-10 offline read-only first:** This is a defensible architecture decision for multi-context/event-presence consistency. No contradictory local evidence found.
- **AD-11 platform adapters:** ManagerPerson has `services/platform/*` adapters for native/web differences, validating the pattern.
- **AD-12 loud environment failure:** ManagerPerson has `services/api-config.ts` and `ApiConfigNotice` implementing exactly this class of failure handling.
- **AD-13 parity gate:** Fits the brownfield strategy and the actual Angular/API coexistence risk.

## Named Technology Check

| Technology | Current existence/version check | Fit verdict |
| --- | --- | --- |
| Expo | npm `57.0.18`; official SDK 57 current. | Fits, but stack must use SDK matrix. |
| Expo Router | npm `57.0.17`; present in ManagerPerson. | Fits. |
| React | npm latest `19.2.8`; Expo SDK 57 template uses `19.2.3`. | Fits only when aligned with Expo matrix. |
| React Native | npm latest `0.87.1`; Expo SDK 57 targets RN 0.86.x. | Current but not a verified Expo SDK 57 fit. |
| TypeScript | npm latest `7.0.2`; Expo SDK 57 template uses `~6.0.3`. | Current but not a verified Expo SDK 57 fit. |
| TanStack React Query | npm `5.102.8`; peer supports React 18/19; present in ManagerPerson. | Fits. |
| Zustand | npm `5.0.15`; peer supports React >=18; present in ManagerPerson. | Fits. |
| Axios | npm `1.20.0`; present in ManagerPerson. | Fits. |
| React Hook Form | npm `7.86.0`; peer supports React through 19. | Fits. |
| Zod | npm `4.5.4`. | Fits; add resolver package. |
| Expo SecureStore | npm `57.0.2`; present in ManagerPerson. | Fits. |
| Expo Notifications | npm `57.0.15`; present in ManagerPerson. | Fits, with provider deferred. |
| React Native Safe Area Context | npm latest `5.9.1`; Expo SDK 57 template uses `~5.7.0`. | Use Expo-compatible version. |
| Expo Vector Icons | npm `15.1.1`; ManagerPerson uses `^15.0.2`. | Fits; install through Expo-compatible flow if needed. |

## Bottom Line

The architecture should not be finalized until the stack table is changed from "individual npm latest" to an Expo SDK 57-compatible dependency matrix, the missing universal web/runtime form dependencies are added, and context hydration is bound to the real brownfield endpoint shape.
