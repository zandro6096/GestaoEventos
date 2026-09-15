# Facebook SSO - Dados necessários

Para ativar o login com Facebook no backend/frontend, preciso destes dados por ambiente (`local`, `hml`, `prod`):

- `App ID` (equivalente ao `ClientId`)
- `App Secret` (equivalente ao `ClientSecret`)
- URL pública do frontend
- URL pública da API

## Redirect URI que deve ser cadastrada no Meta for Developers

Cadastre **exatamente**:

- `https://SEU_BACKEND/api/auth/sso/facebook/callback`

Exemplo local:

- `https://localhost:57678/api/auth/sso/facebook/callback`

## Permissões necessárias

- `email`
- `public_profile`

Observação: se o app ainda estiver em modo desenvolvimento, somente usuários de teste (test users/roles) conseguirão autenticar.

## Configuração no backend (`appsettings*.json`)

- `Sso:Facebook:ClientId`
- `Sso:Facebook:ClientSecret`
- `Sso:Facebook:Scope` (padrão já definido)
- `Sso:DefaultReturnUrl`
- `Sso:StateSigningKey`
