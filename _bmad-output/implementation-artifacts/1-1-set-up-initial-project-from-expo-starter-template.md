---
baseline_commit: NO_VCS
---

# Story 1.1: Set up Initial Project from Expo Starter Template

Status: done

## Story

As a usuario do GestaoEventos,
I want abrir o novo app React em web e mobile,
so that eu tenha uma primeira base usavel para a migracao sem substituir o Angular.

## Acceptance Criteria

1. Given o repositorio `GestaoEventos` com Angular e API existentes, when o dev cria `GestaoEventos.React` com Expo SDK 57, then o app inicia em web e mobile usando a matriz de versoes compativel do Expo, and `npx expo doctor`, typecheck e lint base executam sem erro bloqueante, and o app nao importa runtime do Angular.
2. Given um build fora de desenvolvimento sem `EXPO_PUBLIC_API_URL`, when o app inicia, then a configuracao falha de forma visivel e acionavel, and preview/prod nao usam fallback localhost.

## Tasks / Subtasks

- [x] Criar o app Expo universal em `GestaoEventos.React` (AC: 1)
  - [x] Usar starter atual do Expo com SDK 57 e corrigir dependencias com `npx expo install`.
  - [x] Manter o app paralelo ao Angular/API; nao mover, renomear ou aposentar `GestaoEventos.Angular`.
  - [x] Garantir que `package.json`, `app.json`, `tsconfig.json`, `babel.config.js` e entrypoint Expo fiquem dentro de `GestaoEventos.React`.
  - [x] Configurar scripts minimos: `start`, `android`, `ios`, `web`, `lint`, `type-check`, `check:platform`.
- [x] Alinhar stack e dependencias base (AC: 1)
  - [x] Seguir Expo SDK 57: Expo `^57.0.0`, React `19.2.3`, React Native `0.86.x`, React Native Web `0.21.x`, TypeScript `~6.0.3`, Node.js `22.13.x` minimo.
  - [x] Incluir Expo Router, React Query, Zustand, Axios, React Hook Form, Zod, `@hookform/resolvers`, SecureStore, Safe Area, Screens, Gesture Handler e Vector Icons conforme necessidade do scaffold.
  - [x] Nao instalar pacotes nativos do ManagerPerson que nao pertencem ao GestaoEventos nesta story: camera, audio, notifications, live activity targets, Firebase/Google services, MMKV, treino/nutricao/progresso.
- [x] Criar estrutura inicial Feature-Sliced Layered Client (AC: 1)
  - [x] Criar `app/`, `features/`, `services/`, `stores/`, `shared/`, `docs/` e `tests/` conforme architecture spine.
  - [x] Criar `app/_layout.tsx` com providers minimos seguros: `GestureHandlerRootView`, `QueryClientProvider`, `Stack` do Expo Router e status/safe-area necessario.
  - [x] Criar rotas iniciais suficientes para o app abrir em web/mobile sem tela quebrada; a arvore completa de auth/app pode ser skeleton, mas deve respeitar `app/(auth)` e `app/(app)`.
  - [x] Nao implementar funcionalidades de auth/contexto/shell completo nesta story alem do necessario para o app iniciar; Story 1.2+ e Story 1.6 aprofundam esses fluxos.
- [x] Implementar configuracao de API fail-loud (AC: 2)
  - [x] Criar modulo unico para resolver `EXPO_PUBLIC_API_URL`, com fallback local somente em desenvolvimento.
  - [x] Garantir que `EXPO_PUBLIC_API_URL` contenha apenas host/base URL, sem `/api`.
  - [x] Bloquear ou cobrir visualmente builds preview/prod sem `EXPO_PUBLIC_API_URL`.
  - [x] Falhar de forma clara se preview/prod apontarem para `localhost`, `127.0.0.1` ou host equivalente local.
- [x] Adicionar guardrail de plataforma (AC: 1)
  - [x] Adaptar o padrao de `scripts/check-platform-modules.mjs` do ManagerPerson para validar portas em `services/platform/*`.
  - [x] Exigir trio `index.android.ts`, `index.ios.ts`, `index.web.ts` quando uma porta de plataforma existir.
  - [x] Proibir fallback neutro `index.ts` dentro das portas de plataforma; contratos/tipos devem ficar em arquivo neutro com outro nome, por exemplo `contract.ts`.
- [x] Aplicar identidade visual base GestaoEventos (AC: 1)
  - [x] Criar `shared/design/tokens.ts` com brand blue `#0066FF`, superficies claras, escala neutra, cores semanticas, espacamento de 8px e foco acessivel.
  - [x] Nao copiar o tema dark/lime, textos, rotas ou icones de academia do ManagerPerson.
  - [x] Usar terminologia generica do produto: `estrutura`, `grupo`, `evento`, `participante`, `responsavel`, `papel`, `permissao`.
- [x] Validar scaffold localmente (AC: 1, 2)
  - [x] Rodar `npm run check:platform`.
  - [x] Rodar `npm run type-check`.
  - [x] Rodar `npm run lint`.
  - [x] Rodar `npx expo doctor`.
  - [x] Rodar smoke de abertura web com `npm run web` ou `npx expo start --web` e confirmar tela nao branca.
  - [x] Confirmar por busca que `GestaoEventos.React` nao importa runtime de `GestaoEventos.Angular` e nao usa `/api/v1`.

## Dev Notes

### Scope Boundaries

- Esta story cria a base tecnica do app paralelo `GestaoEventos.React`; Angular continua sendo o baseline produtivo ate paridade completa. [Source: `_bmad-output/planning-artifacts/architecture/architecture-GestaoEventos-react-app-2026-08-29/ARCHITECTURE-SPINE.md`: AD-2]
- Nao implementar a migracao completa nesta story. Auth detalhado, hydrate de contexto, guards, shell responsivo completo, analytics/offline/manifest e feature slices tem stories dedicadas.
- O readiness report exige bootstrap especial: Story 1.1 primeiro e Story 7.1 segundo. Nao avance features antes de Story 7.1 criar o ledger transversal. [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-08-30.md`: Summary and Recommendations]

### Architecture Guardrails

- `GestaoEventos.React` deve ser app Expo universal unico para Android, iOS e web; diferencas de plataforma ficam atras de adapters ou arquivos platform-specific. [Source: `ARCHITECTURE-SPINE.md`: AD-1, AD-11]
- Nao criar BFF, nao usar `/api/v1`, nao copiar contrato do ManagerPerson. O backend GestaoEventos e consumido diretamente em `/api/...`; o env contem apenas a base URL. [Source: `ARCHITECTURE-SPINE.md`: AD-4]
- Estrutura obrigatoria: `app/` compoe rotas/layouts; `features/<dominio>` contem screens/components/hooks; `services/api` faz HTTP e normalizacao; `stores` guarda apenas sessao/contexto/preferencias; React Query e dono de dados remotos. [Source: `ARCHITECTURE-SPINE.md`: AD-3, Consistency Conventions]
- Rotas devem respeitar `app/(auth)` para publico/auth e `app/(app)` para autenticado. Tabs/shell completo ficam para Story 1.6, mas a estrutura inicial nao pode contrariar esse desenho. [Source: `ARCHITECTURE-SPINE.md`: AD-6]
- Configuracao deve falhar alto em preview/prod quando `EXPO_PUBLIC_API_URL` faltar ou apontar para localhost. [Source: `ARCHITECTURE-SPINE.md`: AD-12; PRD FR-22]
- Requisitos de release desta story: build/start local, typecheck, lint e `npx expo doctor` sem erro bloqueante. [Source: `epics.md`: Story 1.1 AC]

### Stack Requirements

- Use a matriz oficial do Expo SDK 57 em vez de `npm latest`: Expo SDK `57.0.0`, React Native `0.86`, React `19.2.3`, React Native Web `0.21.0`, Node.js minimo `22.13.x`. [Source: Expo SDK reference, https://docs.expo.dev/versions/latest/]
- O changelog oficial do SDK 57 confirma upgrade para React Native 0.86 e React mantido em 19.2. [Source: Expo SDK 57 changelog, https://expo.dev/changelog/sdk-57]
- Instale/modifique dependencias Expo-managed usando `npx expo install` e valide com `npx expo doctor`. [Source: `ARCHITECTURE-SPINE.md`: Stack rule]
- ManagerPerson package atual mostra combinacao tecnica compativel com SDK 57: `expo-router`, React Query, Zustand, Axios, SecureStore, Gesture Handler, Screens, Safe Area e TypeScript strict. Use como referencia de tecnica, nao como fonte de produto. [Source: `C:/Users/Sandr/workspace/manager-person/ManagerPersonTrainer.React/package.json`]

### ManagerPerson Reference: Reuse and Rejection List

Use as referencia tecnica:

- `app/_layout.tsx`: ordem de providers, `QueryClientProvider`, `GestureHandlerRootView`, cuidado para sempre montar o `<Stack>` antes de redirecionamentos.
- `services/api-config.ts`: resolver unico de API URL, fallback apenas em dev, erro visivel quando build publicado nao tem URL.
- `components/mobile/ApiConfigNotice.tsx`: aviso inescapavel para build mal configurado, adaptado para visual GestaoEventos.
- `scripts/check-platform-modules.mjs`: guardrail contra adapters de plataforma incompletos.
- `tsconfig.json`: `strict`, `moduleResolution: bundler` e aliases, adaptados para a estrutura do GestaoEventos.
- `eas.json`: forma de declarar profiles, mas sem copiar URLs, IDs, bundle identifiers ou credenciais.

Nao reutilizar:

- `services/api.ts` como esta, porque usa `${BASE_URL}/api/v1` e public API `/api/pub`, ambos errados para GestaoEventos.
- `constants/theme.ts` como esta, porque e dark/lime e fitness-oriented.
- Rotas `treino`, `progresso`, `student-*`, `nutrition`, `competitions`, live activity targets, sons de treino, permissao de camera/audio, Firebase/Google services e assets do ManagerPerson.

### Initial File Structure

Criar somente arquivos novos sob `GestaoEventos.React`. Nenhum arquivo Angular/API deve ser alterado para cumprir esta story.

```text
GestaoEventos.React/
  app/
    _layout.tsx
    index.tsx
    (auth)/
      _layout.tsx
    (app)/
      _layout.tsx
  features/
  services/
    api/
      api-config.ts
    platform/
  shared/
    design/
      tokens.ts
    components/
  stores/
  docs/
  scripts/
    check-platform-modules.mjs
  tests/
  package.json
  app.json
  tsconfig.json
  babel.config.js
  .env.example
```

### API Configuration Requirements

- `EXPO_PUBLIC_API_URL` examples:
  - dev: `https://localhost:57678` or the actual local API host in use.
  - preview/prod: public HTTPS API host only.
- Never append `/api` in env. API services later append `/api/<resource>`.
- Production/preview detection must not rely only on `__DEV__`; use explicit `EXPO_PUBLIC_ENV` plus release runtime fallback.
- The visible configuration error must be accessible (`accessibilityRole="alert"` or equivalent React Native accessibility props).

### Design Requirements

- Base tokens must reflect GestaoEventos: brand blue `#0066FF`, secondary indigo `#6366F1`, semantic success/warning/error/info, neutral light surfaces, dark heading/body text and 8px spacing rhythm. [Source: `.specify/memory/design-system.md`: Color Palette, Spacing System]
- Use light operational SaaS/admin UI. No landing page, no hero, no dark/lime ManagerPerson identity. [Source: `epics.md`: UX-DR1, UX-DR2]
- Prefer system font stack unless a later UX story explicitly selects a native font package. ManagerPerson fonts (`Sora`, `SourceSans3`) are not required here.

### Testing Requirements

- The story is not complete unless these commands are attempted from `GestaoEventos.React` and results are recorded in the Dev Agent Record:
  - `npm run check:platform`
  - `npm run type-check`
  - `npm run lint`
  - `npx expo doctor`
  - `npm run web` or `npx expo start --web` smoke check
- If a command cannot run because the local machine lacks Node.js `22.13.x+`, npm, Android/iOS tooling, or network access, record the exact blocker. Do not mark it as passed.
- Include a search verification:
  - `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React`
  - `rg "GestaoEventos.Angular" GestaoEventos.React`
  Expected result: no runtime dependency or product/domain leakage. Mentions in docs are acceptable only when explicitly marked as rejected reference.

### Project Context Reference

- No `project-context.md` file exists in the repo at story creation time.
- Foundational context loaded from `AGENTS.md`, `.specify/memory/constitution.md`, `.specify/memory/estado-atual.md`, `.specify/memory/frontend.md`, `.specify/memory/design-system.md`, `docs/analytics/tagging-standard.md`, PRD, architecture spine, epics, readiness report and ManagerPerson reference files.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `nvm install 22.13.1; nvm use 22.13.1`: ambiente ajustado para Node.js `v22.13.1`.
- `npx create-expo-app@latest GestaoEventos.React --template blank-typescript`: scaffold Expo TypeScript criado em app paralelo.
- `npx expo install ...`: dependencias Expo-managed instaladas e peers obrigatorios adicionados.
- `npm run test:scaffold`: passou com `[validate-scaffold] OK`.
- `npm run check:platform`: passou com `[check-platform] OK - 0 platform adapter port(s) verified.`
- `npm run type-check`: passou com `tsc --noEmit`.
- `npm run lint`: passou com `eslint . --max-warnings=0`.
- `npx expo doctor`: CLI local informou que o comando direto nao e suportado e orientou usar `npx expo-doctor`.
- `npx expo-doctor`: passou com `21/21 checks passed. No issues detected!`.
- Revisao inline antes do fechamento: endureceu `EXPO_PUBLIC_API_URL` para rejeitar path, query string e fragmento; adicionou `engines.node >=22.13.0`; removeu `.claude/settings.json` vindo do template.
- `npx expo start --web --port 8082 --clear`: Metro web bundlou e o runtime registrou `Running application "main"`.
- `Invoke-WebRequest http://localhost:8082`: retornou HTTP 200 com HTML renderizado contendo `GestaoEventos React`, `Expo SDK 57`, `Android, iOS e web` e `Sem runtime Angular`.
- `npx expo export --platform web --clear`: exportou `dist`; em ambiente de export sem `EXPO_PUBLIC_API_URL`, registrou o erro fail-loud esperado para build publicado.
- `npx expo start --localhost --port 8083 --clear`: Metro universal iniciou com QR/Expo Go em `exp://127.0.0.1:8083`.
- `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React`: sem resultados.
- `rg "GestaoEventos.Angular" GestaoEventos.React`: sem resultados.

### Completion Notes List

- Criado `GestaoEventos.React` como app Expo universal paralelo, sem alteracao em `GestaoEventos.Angular` ou `GestaoEventos.API`.
- Configurado Expo Router como entrypoint, skeleton de rotas `app/`, `app/(auth)` e `app/(app)`, providers base e tela inicial operacional.
- API base URL centralizada em `services/api/api-config.ts`, com fallback local apenas em desenvolvimento e aviso visual acessivel para configuracao invalida em preview/prod.
- `EXPO_PUBLIC_API_URL` aceita somente URL base absoluta do backend; paths, `/api`, query string, fragmentos e localhost em preview/prod sao bloqueados.
- Guardrail de plataforma criado para exigir trio Android/iOS/Web quando adapters forem adicionados em `services/platform/*`.
- Tokens visuais GestaoEventos criados em UI clara com brand blue, sem copiar tema, rotas, textos ou funcionalidades de academia do ManagerPerson.
- Web smoke validado por SSR/HTTP e Metro runtime. Mobile smoke validou o servidor Expo Go/QR; abertura em device fisico ou simulador nao foi executada porque nenhum dispositivo/emulador foi acionado nesta story.
- `npm install` manteve 10 vulnerabilidades moderadas reportadas pelo audit; `expo-doctor` nao acusou issue bloqueante e nao foi aplicado `npm audit fix --force`.

### File List

- `_bmad-output/implementation-artifacts/1-1-set-up-initial-project-from-expo-starter-template.md`
- `GestaoEventos.React/.env.example`
- `GestaoEventos.React/.gitignore`
- `GestaoEventos.React/AGENTS.md`
- `GestaoEventos.React/CLAUDE.md`
- `GestaoEventos.React/LICENSE`
- `GestaoEventos.React/app.json`
- `GestaoEventos.React/babel.config.js`
- `GestaoEventos.React/eslint.config.js`
- `GestaoEventos.React/package-lock.json`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/tsconfig.json`
- `GestaoEventos.React/app/_layout.tsx`
- `GestaoEventos.React/app/index.tsx`
- `GestaoEventos.React/app/(app)/_layout.tsx`
- `GestaoEventos.React/app/(auth)/_layout.tsx`
- `GestaoEventos.React/assets/android-icon-background.png`
- `GestaoEventos.React/assets/android-icon-foreground.png`
- `GestaoEventos.React/assets/android-icon-monochrome.png`
- `GestaoEventos.React/assets/favicon.png`
- `GestaoEventos.React/assets/icon.png`
- `GestaoEventos.React/assets/splash-icon.png`
- `GestaoEventos.React/docs/.gitkeep`
- `GestaoEventos.React/features/.gitkeep`
- `GestaoEventos.React/scripts/check-platform-modules.mjs`
- `GestaoEventos.React/scripts/validate-scaffold.mjs`
- `GestaoEventos.React/services/api/api-config.ts`
- `GestaoEventos.React/services/platform/.gitkeep`
- `GestaoEventos.React/shared/components/ApiConfigNotice.tsx`
- `GestaoEventos.React/shared/components/GestureRoot.native.tsx`
- `GestaoEventos.React/shared/components/GestureRoot.tsx`
- `GestaoEventos.React/shared/components/ScaffoldHome.tsx`
- `GestaoEventos.React/shared/design/tokens.ts`
- `GestaoEventos.React/stores/.gitkeep`
- `GestaoEventos.React/tests/.gitkeep`

## Change Log

- 2026-08-31: Scaffold Expo SDK 57 criado em `GestaoEventos.React`, com providers, rotas skeleton, tokens, fail-loud de API, guardrails e validacoes locais.
- 2026-08-31: Revisao inline aplicou engine minimo de Node, endureceu validacao da URL da API e removeu configuracao `.claude` gerada pelo template.
