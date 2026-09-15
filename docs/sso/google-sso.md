# Google SSO - Dados necessários

Para ativar o login com Google no backend/frontend, preciso destes dados por ambiente (`local`, `hml`, `prod`):

- `ClientId` OAuth 2.0 Web Application
- `ClientSecret` OAuth 2.0 Web Application
- URL pública do frontend (ex.: `https://app.seu-dominio.com`)
- URL pública da API (ex.: `https://api.seu-dominio.com`)

## Redirect URI que deve ser cadastrada no Google Cloud

Cadastre **exatamente**:

- `https://SEU_BACKEND/api/auth/sso/google/callback`

Exemplo local:

- `https://localhost:57678/api/auth/sso/google/callback`

## Escopo utilizado

- `openid email profile`

## Configuração no backend (`appsettings*.json`)

- `Sso:Google:ClientId`
- `Sso:Google:ClientSecret`
- `Sso:Google:Scope` (padrão já definido)
- `Sso:DefaultReturnUrl` (ex.: `https://SEU_FRONTEND/auth/sso/callback`)
- `Sso:StateSigningKey` (chave forte privada)
