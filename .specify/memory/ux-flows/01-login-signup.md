# UX Flow: Login & Signup

**Version**: 1.1.0  
**Created**: 2026-02-15  
**Status**: ✅ Complete

---

## Overview

Este documento detalha os **fluxos de autenticação** - porta de entrada do sistema. Inclui login, criação de conta, recuperação de senha e autenticação social.

### Design Principles

- **Mobile-First**: Forms otimizados para mobile (teclado numérico para telefone, etc.)
- **Social Login**: Google, Facebook, Microsoft (opcional - reduz fricção)
- **Invite Clarity**: Quando login/signup vem com token de convite, mostrar estrutura, grupo e quem convidou
- **Progressive Disclosure**: Apenas campos essenciais visíveis inicialmente
- **Validation em Tempo Real**: Feedback imediato enquanto usuário digita
- **Accessibility**: Labels claros, contrast ratio WCAG AA, keyboard navigation

> **React atual**: o login publicado no app Expo mantém apenas e-mail/login, senha,
> recuperação de senha e registro de conta. Os provedores sociais e o reenvio de
> confirmação permanecem disponíveis na API/fluxos auxiliares, mas não são exibidos
> na tela principal de login.

---

## Flow 1: Login (Existing User)

**Trigger**: Usuário acessa sistema ou sessão expirou

### Desktop Login Screen

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                    ┌───────────────────┐                        │
│                    │   GestaoEventos   │                        │
│                    │   [Logo/Ícone]    │                        │
│                    └───────────────────┘                        │
│                                                                 │
│              Gestão inteligente de eventos e pessoas            │
│                                                                 │
│                                                                 │
│              ┌─────────────────────────────────┐                │
│              │ Email ou Telefone               │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ seu@email.com               │ │                │
│              │ └─────────────────────────────┘ │                │
│              │                                 │                │
│              │ Senha                           │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ ••••••••••          [👁]    │ │                │
│              │ └─────────────────────────────┘ │                │
│              │                                 │                │
│              │ ☐ Lembrar de mim               │                │
│              │                                 │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │      Entrar                 │ │                │
│              │ └─────────────────────────────┘ │                │
│              │                                 │                │
│              │    [Esqueci minha senha]        │                │
│              │                                 │                │
│              │ ─────────── ou ───────────      │                │
│              │                                 │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ [G] Entrar com Google       │ │                │
│              │ └─────────────────────────────┘ │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ [f] Entrar com Facebook     │ │                │
│              │ └─────────────────────────────┘ │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ [M] Entrar com Microsoft    │ │                │
│              │ └─────────────────────────────┘ │                │
│              │                                 │                │
│              │   Não tem uma conta?            │                │
│              │   [Criar conta gratuitamente]   │                │
│              └─────────────────────────────────┘                │
│                                                                 │
│                                                                 │
│           Ajuda • Privacidade • Termos de Uso                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Login Screen

```
┌───────────────────────────┐
│                           │
│   ┌─────────────────┐     │
│   │  GestaoEventos  │     │
│   │   [Logo/Ícone]  │     │
│   └─────────────────┘     │
│                           │
│ Gestão inteligente de     │
│ eventos e pessoas         │
│                           │
│ Email ou Telefone         │
│ ┌───────────────────────┐ │
│ │ seu@email.com         │ │
│ └───────────────────────┘ │
│                           │
│ Senha                     │
│ ┌───────────────────────┐ │
│ │ ••••••••••      [👁]  │ │
│ └───────────────────────┘ │
│                           │
│ ☐ Lembrar de mim          │
│                           │
│ ┌───────────────────────┐ │
│ │      Entrar           │ │
│ └───────────────────────┘ │
│                           │
│   [Esqueci minha senha]   │
│                           │
│ ───────── ou ─────────    │
│                           │
│ ┌───────────────────────┐ │
│ │ [G] Google            │ │
│ └───────────────────────┘ │
│ ┌───────────────────────┐ │
│ │ [f] Facebook          │ │
│ └───────────────────────┘ │
│                           │
│ Não tem conta?            │
│ [Criar gratuitamente]     │
│                           │
└───────────────────────────┘
```

### Validation Rules

- **Email/Phone**: Valid email format OR phone (11 digits with DDD)
- **Senha**: Mínimo 8 caracteres
- **Rate Limiting**: Máx 5 tentativas por 15 minutos
- **Captcha**: Após 3 tentativas falhadas
- **Reenvio de confirmação**: cooldown de 5 minutos entre envios para evitar spam

### Invite Context (token na URL)

- Banner no login deve informar:
  - Estrutura do convite
  - Grupo de participação (ou "Sem grupo definido")
  - Quem convidou (ou "Não informado")
- Se token inválido/expirado, exibir mensagem orientativa sem bloquear login comum

### Error States

**Invalid Credentials:**
```
❌ Email ou senha incorretos.
   Verifique seus dados e tente novamente.
   
   [Tentar Novamente] [Esqueci Minha Senha]
```

**Account Locked:**
```
🔒 Conta Bloqueada

Muitas tentativas de login falhadas.
Sua conta foi temporariamente bloqueada por segurança.

Tempo restante: 12 minutos
Ou: [Recuperar Senha Agora]
```

**Network Error:**
```
⚠️ Não foi possível conectar

Verifique sua conexão com a internet
e tente novamente.

[Tentar Novamente]
```

**E-mail Não Confirmado:**
```
⚠️ Seu e-mail ainda não foi confirmado.
   Confirme pelo link recebido para concluir o acesso.

   [Reenviar e-mail de confirmação]
   (após reenviar: bloqueio de 5 minutos para nova solicitação)
```

### Success Flow

```
Passo 1: [Entrar] → Loading spinner
Passo 2: Validação backend (JWT token gerado)
Passo 3A: Primeiro acesso → Onboarding (02-onboarding.md)
Passo 3B: Usuário recorrente → Dashboard (06-dashboard-views.md)
```

---

## Flow 2: Signup (New User)

**Trigger**: Usuário clica "Criar conta gratuitamente"

### Step 1: Basic Info

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        Criar sua conta                          │
│                                                                 │
│              É grátis e sempre será! 🎉                         │
│                                                                 │
│              ┌─────────────────────────────────┐                │
│              │ Nome Completo *                 │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ João da Silva               │ │                │
│              │ └─────────────────────────────┘ │                │
│              │                                 │                │
│              │ Email *                         │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ joao@email.com              │ │                │
│              │ └─────────────────────────────┘ │                │
│              │ ✅ Email disponível              │                │
│              │                                 │                │
│              │ Telefone (Opcional)             │                │
│              │ ┌────┬─────────────────────────┐│                │
│              │ │+55 │(11) 98765-4321         ││                │
│              │ └────┴─────────────────────────┘│                │
│              │                                 │                │
│              │ Senha *                         │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ ••••••••••          [👁]    │ │                │
│              │ └─────────────────────────────┘ │                │
│              │                                 │                │
│              │ Força: ████████░░ Boa            │                │
│              │ ✅ Mínimo 8 caracteres           │                │
│              │ ✅ Letras e números              │                │
│              │ ⚠ Adicione símbolo (!@#$)       │                │
│              │                                 │                │
│              │ ☑ Aceito os Termos de Uso e     │                │
│              │   Política de Privacidade       │                │
│              │                                 │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │   Criar Minha Conta         │ │                │
│              │ └─────────────────────────────┘ │                │
│              │                                 │                │
│              │ ─────────── ou ───────────      │                │
│              │                                 │                │
│              │ ┌─────────────────────────────┐ │                │
│              │ │ [G] Cadastrar com Google    │ │                │
│              │ └─────────────────────────────┘ │                │
│              │                                 │                │
│              │   Já tem uma conta?             │                │
│              │   [Fazer login]                 │                │
│              └─────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Real-Time Validation

**Email Check (on blur):**
```
⏳ Verificando disponibilidade...
→ ✅ Email disponível
→ ❌ Este email já está cadastrado. [Fazer Login]
```

**Password Strength (on type):**
```
Força: ░░░░░░░░░░ Muito Fraca   (< 6 chars)
Força: ████░░░░░░ Fraca          (6-7 chars, só letras)
Força: ████████░░ Boa            (8+ chars, letras + números)
Força: ██████████ Excelente      (8+ chars, letras + números + símbolos)
```

### Validation Rules

- **Nome**: 3-100 caracteres, sem números
- **Email**: RFC 5322 valid, unique
- **Telefone**: Opcional, formato BR (11) 9xxxx-xxxx
- **Senha**: 
  - Mínimo 8 caracteres
  - Pelo menos 1 letra e 1 número
  - Recomendado: 1 símbolo
- **Termos**: Checkbox obrigatório

### Success Flow

```
┌─────────────────────────────────────────────────┐
│ ✅ Conta Criada com Sucesso!                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ Bem-vindo, João! 🎉                             │
│                                                 │
│ Enviamos um email de confirmação para:          │
│ joao@email.com                                  │
│                                                 │
│ Confirme o e-mail para concluir sua             │
│ autenticação e fazer o primeiro login.          │
│                                                 │
│              [Ir para Login]                    │
│              [Reenviar Email]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

After clicking "Ir para Login" → Login Flow (após confirmar e-mail) → Onboarding ([02-onboarding.md](02-onboarding.md))

---

## Flow 3: Password Recovery

**Trigger**: Usuário clica "Esqueci minha senha"

### Step 1: Request Reset

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            Recuperar Senha                      │
│                                                 │
│ Digite seu email ou telefone cadastrado.        │
│ Enviaremos um código de recuperação.            │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Email ou Telefone                           │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ seu@email.com                           │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │          Enviar Código                      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [← Voltar ao Login]                │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Step 2: Verify Code

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            Código de Verificação                │
│                                                 │
│ Enviamos um código de 6 dígitos para:           │
│ joao@email.com                                  │
│                                                 │
│ Digite o código recebido:                       │
│                                                 │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐           │
│ │ 3 │ │ 7 │ │ 4 │ │ 9 │ │ 2 │ │ 1 │           │
│ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘           │
│                                                 │
│ Código expira em: 09:42                         │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │          Verificar Código                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Não recebeu o código?                           │
│ [Reenviar código] (disponível em 00:58)        │
│                                                 │
│              [← Voltar]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Code Input Behavior**:
- Auto-focus próximo campo após digitar
- Auto-submit após 6º dígito
- Backspace volta para campo anterior
- Paste support (cola 6 dígitos automaticamente)

### Step 3: Reset Password

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            Criar Nova Senha                     │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Nova Senha *                                │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ ••••••••••              [👁]            │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │                                             │ │
│ │ Força: ████████░░ Boa                        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Confirmar Nova Senha *                      │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ ••••••••••              [👁]            │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ │ ✅ Senhas conferem                           │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Requisitos:                                     │
│ ✅ Mínimo 8 caracteres                          │
│ ✅ Letras e números                             │
│ ⚠ Adicione símbolos para maior segurança       │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │       Salvar Nova Senha                     │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Success

```
✅ Senha Alterada com Sucesso!

Você já pode fazer login com sua nova senha.

           [Ir para Login]
```

---

## Flow 4: Social Login (Google/Facebook/Microsoft)

**Trigger**: Usuário clica "Entrar com Google" (ou Facebook/Microsoft)

### OAuth Flow

```
Step 1: Click "Entrar com Google"
        ↓
Step 2: Redirect para Google OAuth
        (popup ou redirect dependendo do device)
        ↓
Step 3A: Primeira vez → Permissões Google
         User autoriza acesso (email, nome, foto)
         ↓
Step 3B: Já autorizou → Auto-approve
         ↓
Step 4: Google redirect de volta com token
        ↓
Step 5: Backend valida token e cria/loga usuário
        ↓
Step 6A: Primeira vez → Onboarding (02-onboarding.md)
Step 6B: Usuário existente → Dashboard (06-dashboard-views.md)
```

### Loading State During OAuth

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Spinner Animation]                │
│                                                 │
│          Conectando com Google...               │
│                                                 │
│   Aguarde enquanto validamos suas credenciais   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Error Handling

**OAuth Cancelled:**
```
ℹ️ Autenticação Cancelada

Você cancelou a autenticação com Google.

[Tentar Novamente] [Usar Email/Senha]
```

**OAuth Error:**
```
❌ Erro na Autenticação

Não foi possível conectar com Google.
Tente novamente ou use email/senha.

[Tentar Novamente] [Usar Email/Senha]
```

**Email Already Used (Different Provider):**
```
⚠️ Email Já Cadastrado

O email joao@gmail.com já está cadastrado
usando login tradicional (email/senha).

Você pode:
• [Fazer Login com Email/Senha]
• [Vincular Conta Google] (requer login primeiro)
```

---

## Flow 5: First-Time Social Login

**Scenario**: Usuário usa Social Login pela primeira vez

### Additional Info Collection

```
┌─────────────────────────────────────────────────┐
│                                                 │
│       Bem-vindo, João! 👋                       │
│                                                 │
│ Sua conta foi criada com sucesso!               │
│                                                 │
│ Apenas mais algumas informações:                 │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Telefone (Opcional)                         │ │
│ │ ┌────┬──────────────────────────────────┐  │ │
│ │ │+55 │(11) 98765-4321                   │  │ │
│ │ └────┴──────────────────────────────────┘  │ │
│ │                                             │ │
│ │ Útil para receber notificações via SMS      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ☑ Aceito receber emails sobre atualizações     │
│ ☐ Aceito receber SMS de lembrete de eventos    │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │              Continuar                      │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│              [Pular por Enquanto]               │
│                                                 │
└─────────────────────────────────────────────────┘
```

After completion → Onboarding ([02-onboarding.md](02-onboarding.md))

---

## Session Management

### Remember Me

- **ON**: Session persiste por 30 dias (refresh token)
- **OFF**: Session persiste apenas enquanto browser aberto (session storage)

### Auto-Logout Scenarios

- **Inatividade**: 8 horas sem ação (warning 5min antes)
- **Logout Manual**: Usuário clica "Sair"
- **Token Expirado**: JWT expired (redirect para login)
- **Multiple Devices**: Permitido (não força logout)

### Session Expiring Warning

```
┌─────────────────────────────────────────────────┐
│ ⏰ Sessão Expirando                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Sua sessão expira em 5 minutos por inatividade.│
│                                                 │
│ Deseja continuar conectado?                     │
│                                                 │
│    [Sim, Continuar Conectado] [Fazer Logout]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Mobile-Specific Adaptations

### Biometric Login (Fingerprint/Face ID)

```
┌───────────────────────────┐
│  GestaoEventos            │
│   [Logo]                  │
│                           │
│ Bem-vindo de volta,       │
│ João!                     │
│                           │
│ ┌───────────────────────┐ │
│ │                       │ │
│ │     [👆 Ícone]        │ │
│ │                       │ │
│ │  Toque para entrar    │ │
│ │  com biometria        │ │
│ │                       │ │
│ └───────────────────────┘ │
│                           │
│ [Usar Senha em Vez]       │
│                           │
└───────────────────────────┘
```

### Push Notification Permission (After Login)

```
┌───────────────────────────┐
│ 🔔 Ativar Notificações    │
├───────────────────────────┤
│                           │
│ Receba alertas sobre:     │
│ • Novos eventos           │
│ • Lembretes de reuniões   │
│ • Mensagens importantes   │
│                           │
│ ┌───────────────────────┐ │
│ │  Ativar Notificações  │ │
│ └───────────────────────┘ │
│                           │
│ [Agora Não]               │
│                           │
└───────────────────────────┘
```

---

## Security Features

### Rate Limiting

- **Login**: Máx 5 tentativas / 15 min por IP
- **Signup**: Máx 3 contas / hora por IP
- **Password Reset**: Máx 3 requests / hora por email

### CAPTCHA

Triggered after:
- 3 failed login attempts
- Signup from suspicious IP
- Password reset request

```
┌─────────────────────────────────────────────────┐
│                                                 │
│ Verificação de Segurança                        │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │                                             │ │
│ │   [reCAPTCHA v3 Invisible]                  │ │
│ │   ou                                        │ │
│ │   [hCaptcha Widget]                         │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Two-Factor Authentication (Future)

```
┌─────────────────────────────────────────────────┐
│ 🔐 Autenticação em Dois Fatores                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Digite o código do seu app autenticador:        │
│                                                 │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│ │  3 │ │  7 │ │  4 │ │  9 │ │  2 │ │  1 │     │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘     │
│                                                 │
│ [Não recebeu? Usar backup code]                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Integration Points

### Backend Endpoints

```
POST   /api/auth/token                            # Login with email/password (bloqueia email nao confirmado)
POST   /api/usuarios                              # Cadastro de nova conta
GET    /api/auth/confirmar-email?token=...       # Confirmacao de e-mail
POST   /api/auth/reenviar-confirmacao-email       # Reenvio de confirmacao
POST   /api/auth/recuperar-senha                  # Solicitar redefinicao de senha
POST   /api/auth/redefinir-senha                  # Confirmar redefinicao
GET    /api/auth/sso/{provider}/iniciar           # Iniciar OAuth (google/facebook/microsoft)
GET    /api/auth/sso/{provider}/callback          # Callback OAuth (redireciona para /auth/sso/callback)
POST   /api/auth/context                           # Contexto autenticado
```

### Related Flows

- **Onboarding**: After first login ([02-onboarding.md](02-onboarding.md))
- **Dashboard**: After successful login ([06-dashboard-views.md](06-dashboard-views.md))
- **Notifications**: Push permission request ([08-notifications-actions.md](08-notifications-actions.md))

---

## Accessibility

- **Keyboard Navigation**: Tab order lógico (email → password → submit)
- **Screen Reader**: Labels descritivos para todos inputs
- **High Contrast**: Support para modo alto contraste
- **Text Scaling**: Campos ajustam com zoom do browser
- **Error Announcements**: Screen reader anuncia erros de validação

---

## Performance

- **Lazy Load**: Social login SDKs carregados on-demand
- **Debounce**: Email availability check debounced 500ms
- **Optimistic UI**: Show loading state imediatamente
- **Offline**: Cache last logged user (biometric quick access)

---

**Version History**:
- v1.0.0 (2026-02-15): Initial complete login & signup flows
- v1.1.0 (2026-04-22): Confirmacao de email obrigatoria no login + fluxo SSO Google/Facebook/Microsoft

**End of Login & Signup Flow**
