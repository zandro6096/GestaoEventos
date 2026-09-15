# Microsoft SSO - Dados necessários

Para ativar o login com Microsoft (Entra ID/Azure AD), preciso destes dados por ambiente (`local`, `hml`, `prod`):

- `Client ID` (Application (client) ID)
- `Client Secret` (secret value)
- Tipo de conta permitida:
  - `common` (multitenant + contas pessoais) **ou**
  - tenant específico (single-tenant)
- URL pública do frontend
- URL pública da API

## Redirect URI que deve ser cadastrada no App Registration

Cadastre **exatamente**:

- `https://SEU_BACKEND/api/auth/sso/microsoft/callback`

Exemplo local:

- `https://localhost:57678/api/auth/sso/microsoft/callback`

## Permissões/escopos usados

- `openid`
- `profile`
- `email`
- `User.Read`

## Configuração no backend (`appsettings*.json`)

- `Sso:Microsoft:ClientId`
- `Sso:Microsoft:ClientSecret`
- `Sso:Microsoft:Scope` (padrão já definido)
- `Sso:DefaultReturnUrl`
- `Sso:StateSigningKey`

Se você quiser restringir para tenant único, me passe também o `TenantId` para eu trocar o endpoint `common` por `/{tenantId}`.
