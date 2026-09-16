---
baseline_commit: NO_VCS
---

# Story 1.2: Rotas Publicas de Auth

Status: done

## Story

As a usuario nao autenticado,
I want acessar login, cadastro, recuperacao, redefinicao, confirmacao de email, convite e SSO callback,
so that eu consiga entrar pelos mesmos caminhos publicos existentes no produto.

## Acceptance Criteria

1. Given o usuario abre o app sem token valido, when acessa `/auth/login`, `/auth/cadastro`, `/auth/recuperar-senha`, `/auth/redefinir-senha`, `/confirmar-email`, `/aceitar-convite` ou `/auth/sso/callback`, then a rota React renderiza uma tela publica equivalente ao Angular, and usa copy agnostica GestaoEventos, tokens visuais e estados de loading/erro/sucesso.
2. Given o usuario abre qualquer rota autenticada do grupo `app/(app)` sem sessao valida, when o layout autenticado monta, then o app redireciona para `/auth/login` sem renderizar conteudo privado.
3. Given o backend retorna erro de autenticacao, validacao, token invalido ou erro operacional, when o usuario submete credenciais, cadastro, reset, confirmacao, convite ou SSO callback, then a UI exibe mensagem acionavel, and nao trata falha como sucesso vazio.
4. Given um fluxo publico dispara acao principal, when o usuario interage com CTA, submit ou sucesso, then `analytics.service` emite `ge_event` conforme o tagging standard, com dados dinamicos em `extra` e sem IDs/dados pessoais em `detail`.
5. Given o app esta offline, when o usuario tenta uma acao publica que faz POST/GET operacional contra auth/convite, then a acao e bloqueada ou falha com mensagem clara antes de mascarar sucesso.
6. Given a story e concluida, when os guardrails rodam, then `docs/parity-manifest.md` registra rotas React, fontes Angular, endpoints backend, contexto publico, permissoes, analytics, testes, status e gaps da 1.2.

## Tasks / Subtasks

- [x] Criar services de API/public auth sem HTTP direto em telas (AC: 1, 3, 5)
  - [x] Criar `services/api/http-client.ts` com Axios usando `API_BASE_URL` e paths `/api/...`.
  - [x] Criar helpers de case/error para normalizar envelopes `Response<T>` e erros FastEndpoints.
  - [x] Criar `services/api/auth-api.ts` para `/api/auth/token`, `/api/usuarios`, `/api/auth/recuperar-senha`, `/api/auth/redefinir-senha`, `/api/auth/reenviar-confirmacao-email`, `/api/auth/confirmar-email`, `/api/convites/validar/{token}` e `/api/convites/aceitar-token`.
- [x] Criar camada de negocio/hook de auth publico (AC: 1, 3, 4, 5)
  - [x] Criar schemas Zod para login, cadastro, recuperacao e redefinicao.
  - [x] Criar `features/auth/services/public-auth.service.ts` com analytics e `assertOnlineForMutation`.
  - [x] Criar hooks React Query para as mutacoes publicas.
  - [x] Criar helper de SSO com `Linking.createURL('/auth/sso/callback')` e endpoint `/api/auth/sso/{provider}/iniciar`.
- [x] Criar UI publica responsiva e reutilizavel (AC: 1)
  - [x] Criar layout e componentes de campo/mensagem/botao em `features/auth/components`.
  - [x] Usar tokens GestaoEventos, acessibilidade basica e sem tema/terminologia ManagerPerson.
- [x] Criar rotas publicas React (AC: 1, 3, 4)
  - [x] Implementar `/auth/login` com convite opcional, login, reenvio de confirmacao e SSO Google/Facebook/Microsoft.
  - [x] Implementar `/auth/cadastro` com cadastro comum e aceite de convite por token.
  - [x] Implementar `/auth/recuperar-senha`.
  - [x] Implementar `/auth/redefinir-senha?token=...`.
  - [x] Implementar `/confirmar-email?token=...`.
  - [x] Implementar `/aceitar-convite?token=...`.
  - [x] Implementar `/auth/sso/callback`.
- [x] Proteger grupo autenticado enquanto sessao/hydrate nao existem (AC: 2)
  - [x] Redirecionar `app/(app)` para `/auth/login` ate Story 1.3 criar sessao segura.
- [x] Atualizar parity manifest e validacoes (AC: 6)
  - [x] Adicionar linhas verificaveis para todas as rotas publicas da 1.2.
  - [x] Expandir scripts locais para validar presenca das rotas publicas de auth.
- [x] Validar localmente (AC: 1, 2, 3, 4, 5, 6)
  - [x] Rodar `npm run test:scaffold`.
  - [x] Rodar `npm run check:platform`.
  - [x] Rodar `npm run type-check`.
  - [x] Rodar `npm run lint`.
  - [x] Rodar `npx expo-doctor`.
  - [x] Rodar smoke web em pelo menos `/auth/login`, `/auth/cadastro`, `/auth/recuperar-senha`, `/auth/redefinir-senha`, `/confirmar-email`, `/aceitar-convite` e `/auth/sso/callback`.
  - [x] Buscar ausencia de `/api/v1`, runtime Angular e termos de dominio ManagerPerson no app React.

## Dev Notes

### Scope Boundaries

- Esta story implementa rotas e operacoes publicas de auth/convite. Persistencia segura de sessao, hydrate de contexto e navegacao final pos-login pertencem a Story 1.3.
- O redirect de rotas autenticadas nesta story deve ser conservador: sem sessao valida, enviar para `/auth/login`. Guards por permissao e owner bypass ficam para Story 1.5.
- Nao criar BFF, nao trocar rotas backend e nao alterar Angular/API para cumprir esta story.

### Angular Route Sources

- `/auth/login`: `GestaoEventos.Angular/src/app/pages/login/login.component.ts|html`.
- `/auth/cadastro`: `GestaoEventos.Angular/src/app/pages/signup/signup.component.ts|html`.
- `/auth/recuperar-senha`: `GestaoEventos.Angular/src/app/pages/recuperar-senha/recuperar-senha.component.ts|html`.
- `/auth/redefinir-senha`: `GestaoEventos.Angular/src/app/pages/redefinir-senha/redefinir-senha.component.ts|html`.
- `/confirmar-email`: `GestaoEventos.Angular/src/app/pages/confirmar-email/confirmar-email.component.ts`.
- `/aceitar-convite`: `GestaoEventos.Angular/src/app/libs/public/aceitar-convite/aceitar-convite.component.ts`.
- `/auth/sso/callback`: `GestaoEventos.Angular/src/app/pages/auth-sso-callback/auth-sso-callback.component.ts`.
- Public route map: `GestaoEventos.Angular/src/app/app.routes.ts`.

### Backend Contracts

- `POST /api/auth/token`: `GestaoEventos.API/src/GestaoEventos.Web/Autenticacao/Token.cs`, request `{ username, password }`, response `Response<AutenticacaoRecord>`.
- `POST /api/usuarios`: `GestaoEventos.API/src/GestaoEventos.Web/Usuarios/Create.cs`, request `{ nome, email, senha, data_nascimento? }`, response `Response<UsuarioCreatedResponse>`.
- `POST /api/auth/recuperar-senha`: `RecuperarSenha.cs`, anti-enumeracao sempre 200 quando processado.
- `POST /api/auth/redefinir-senha`: `RedefinirSenha.cs`, request `{ token, novaSenha, confirmarSenha }`, erros 400 para token invalido/expirado ou validacao.
- `POST /api/auth/reenviar-confirmacao-email`: `ReenviarConfirmacaoEmail.cs`, pode retornar 429 com `EMAIL_CONFIRMACAO_RATE_LIMIT`.
- `GET /api/auth/confirmar-email?token=...`: `Usuarios/ConfirmarEmail.cs`.
- `GET /api/convites/validar/{token}`: `Convites/ValidarToken.cs`, response snake_case com dados do usuario virtual/estrutura/grupo.
- `POST /api/convites/aceitar-token`: `Usuarios/AceitarConviteToken.cs`, request `{ token, senha, confirmar_senha }`, response `{ usuarioId, nome, email, estruturaId }`.
- `GET /api/auth/sso/{provider}/iniciar?return_url=...` e `/api/auth/sso/{provider}/callback`: `Autenticacao/SsoIniciar.cs`, `Autenticacao/SsoCallback.cs`.

### Analytics Requirements

- Login: `click btn:login`, `simulation auth:login_submit`, `confirmation auth:login_success`, SSO entrances `btn:login_google`, `btn:login_facebook`, `btn:login_microsoft`.
- Cadastro: `entrance page:signup_view`, `click btn:signup`, `simulation auth:signup_submit`, `confirmation auth:signup_success`.
- Recuperar senha: `click btn:recuperar_senha`, `simulation auth:recuperar_senha_submit`, `confirmation auth:recuperar_senha_email_enviado`.
- Redefinir senha: `click btn:redefinir_senha`, `simulation auth:redefinir_senha_submit`, `confirmation auth:redefinir_senha_success`.
- Confirmar email: `simulation auth:confirmar_email_process`, `confirmation auth:confirmar_email_success`, erro por `click auth:confirmar_email_invalido|auth:confirmar_email_expirado`.
- SSO callback: `simulation auth:sso_callback_process`, `confirmation auth:sso_login_success`, erro por `click auth:sso_callback_error|auth:sso_callback_token_ausente|auth:sso_login_error`.

### Testing Requirements

- A story so pode ser concluida se os comandos de validacao forem tentados a partir de `GestaoEventos.React` e registrados no Dev Agent Record.
- Os smokes web devem provar que as rotas renderizam sem tela branca; API real pode estar indisponivel localmente, mas erros de rede nao podem ser tratados como sucesso.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm run type-check`: passou com `tsc --noEmit`.
- `npm run lint`: passou com `eslint . --max-warnings=0`.
- `npm run test:scaffold`: passou com `[validate-scaffold] OK`, `[validate-parity-ledger] OK`, `[validate-transversal-foundation] OK` e `[validate-auth-routes] OK`.
- `npm run check:platform`: passou com `[check-platform] OK - 2 platform adapter port(s) verified.`
- `npx expo-doctor`: passou com `21/21 checks passed. No issues detected!`.
- `npx expo start --web --port 8086 --clear`: Metro web bundlou sem erro bloqueante.
- Smoke HTTP web para `/auth/login`, `/auth/cadastro`, `/auth/recuperar-senha`, `/auth/redefinir-senha`, `/confirmar-email`, `/aceitar-convite` e `/auth/sso/callback`: todas retornaram HTTP 200 com HTML renderizado e texto GestaoEventos.
- `rg "/api/v1|manager-person|student|treino|nutrition|workout" GestaoEventos.React`: sem resultados.
- `rg "GestaoEventos.Angular" GestaoEventos.React`: sem resultados.
- Revisao inline antes do fechamento: corrigiu lint de `SsoCallbackScreen`, ajustou imports Axios, e criou `check:auth` para impedir HTTP direto nas screens e garantir rotas/contratos publicos.

### Completion Notes List

- Criadas sete rotas publicas React equivalentes ao Angular: login, cadastro, recuperar senha, redefinir senha, confirmar email, aceitar convite e SSO callback.
- Criado `auth-api` com contratos reais `/api/...` e helpers de case/error para envelopes FastEndpoints/Response.
- Criada camada `public-auth.service` + hooks React Query; telas nao importam Axios/API diretamente.
- Fluxos publicos bloqueiam acoes offline via `assertOnlineForMutation` e propagam erro operacional em vez de mascarar sucesso.
- Analytics da 1.2 segue o contrato `ge_event` criado na Story 7.1 e replica os detalhes relevantes do Angular sem IDs/dados pessoais em `detail`.
- `app/(app)` redireciona para `/auth/login` enquanto sessao segura/hydrate entram na Story 1.3.
- API real nao foi exercitada com credenciais/tokens de ambiente nesta story; os smokes validaram renderizacao das rotas e os services foram validados por typecheck/lint/checks estaticos.

### File List

- `_bmad-output/implementation-artifacts/1-2-rotas-publicas-de-auth.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `GestaoEventos.React/app/(app)/_layout.tsx`
- `GestaoEventos.React/app/(auth)/aceitar-convite.tsx`
- `GestaoEventos.React/app/(auth)/auth/cadastro.tsx`
- `GestaoEventos.React/app/(auth)/auth/login.tsx`
- `GestaoEventos.React/app/(auth)/auth/recuperar-senha.tsx`
- `GestaoEventos.React/app/(auth)/auth/redefinir-senha.tsx`
- `GestaoEventos.React/app/(auth)/auth/sso/callback.tsx`
- `GestaoEventos.React/app/(auth)/confirmar-email.tsx`
- `GestaoEventos.React/docs/parity-manifest.md`
- `GestaoEventos.React/features/auth/components/AuthButton.tsx`
- `GestaoEventos.React/features/auth/components/AuthField.tsx`
- `GestaoEventos.React/features/auth/components/AuthLayout.tsx`
- `GestaoEventos.React/features/auth/components/AuthMessage.tsx`
- `GestaoEventos.React/features/auth/hooks/usePublicAuth.ts`
- `GestaoEventos.React/features/auth/schemas/public-auth.schemas.ts`
- `GestaoEventos.React/features/auth/screens/AcceptInviteScreen.tsx`
- `GestaoEventos.React/features/auth/screens/ConfirmEmailScreen.tsx`
- `GestaoEventos.React/features/auth/screens/LoginScreen.tsx`
- `GestaoEventos.React/features/auth/screens/RecoverPasswordScreen.tsx`
- `GestaoEventos.React/features/auth/screens/ResetPasswordScreen.tsx`
- `GestaoEventos.React/features/auth/screens/SignupScreen.tsx`
- `GestaoEventos.React/features/auth/screens/SsoCallbackScreen.tsx`
- `GestaoEventos.React/features/auth/screens/screen-utils.ts`
- `GestaoEventos.React/package.json`
- `GestaoEventos.React/scripts/validate-auth-routes.mjs`
- `GestaoEventos.React/scripts/validate-scaffold.mjs`
- `GestaoEventos.React/services/api/api-error.ts`
- `GestaoEventos.React/services/api/auth-api.ts`
- `GestaoEventos.React/services/api/case-conversion.ts`
- `GestaoEventos.React/services/api/http-client.ts`

## Change Log

- 2026-08-31: Historia criada com fontes Angular/API para rotas publicas de auth.
- 2026-08-31: Implementadas rotas publicas React, API services, hooks, UI auth, redirect conservador, analytics e manifest verificado.
