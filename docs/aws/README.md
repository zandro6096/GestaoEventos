# AWS MVP Deploy - GestaoEventos

## Arquitetura adotada

- Frontend: `S3 + CloudFront` com origem em `s3://seven-projects-sites/manager-events`
- Backend: `API Gateway HTTP API + Lambda (.NET 8)`
- Rota pública principal:
  - Frontend: `https://sistema-eventos.seven-projetos.com`
  - API (mesmo host): `https://sistema-eventos.seven-projetos.com/api/*`
- Domínio técnico opcional de API para suporte/debug: `https://sistema-gestao-nota-api.seven-projetos.com`
- Banco: reutiliza o RDS existente

## O que foi implementado neste repositório

- Template SAM da API: `infra/aws/sam-api.yaml`
- Template CloudFront/S3/OAC: `infra/aws/cloudfront-frontend.yaml`
- Template de baseline operacional: `infra/aws/ops-baseline.yaml`
- Scripts de deploy:
  - `infra/aws/scripts/deploy-api.ps1`
  - `infra/aws/scripts/deploy-edge.ps1`
  - `infra/aws/scripts/deploy-frontend.ps1`
  - `infra/aws/scripts/deploy-ops.ps1`
  - `infra/aws/scripts/deploy-all.ps1`
- Ajustes de app para produção com `/api` no mesmo domínio:
  - Angular sem duplicidade `/api/api`
  - Backend preparado para Lambda (`AddAWSLambdaHosting`)
  - Endpoint de smoke: `/api/health`

## Pre-requisitos

- AWS CLI autenticado (`aws configure`)
- AWS SAM CLI instalado
- Node/NPM instalados
- .NET 8 SDK instalado
- Certificado ACM (us-east-1) válido para `sistema-eventos.seven-projetos.com`

## Variáveis de ambiente esperadas (API deploy)

Defina no terminal antes de executar `deploy-api.ps1`:

```powershell
$env:GESTAO_EVENTOS_MYSQL_CONNECTION = "Server=...;Database=...;User=...;Password=...;"
$env:GESTAO_EVENTOS_JWT_SIGNING_KEY = "<chave-forte-aleatoria-com-32+ caracteres>"
$env:GESTAO_EVENTOS_SSO_STATE_SIGNING_KEY = "<chave-forte>"

# opcionais
$env:GESTAO_EVENTOS_SES_ACCESS_KEY = ""
$env:GESTAO_EVENTOS_SES_SECRET_KEY = ""
$env:GESTAO_EVENTOS_SES_REGION = "us-east-1"
$env:GESTAO_EVENTOS_SES_FROM_EMAIL = "noreply@seven-projetos.com"
$env:GESTAO_EVENTOS_SES_FROM_NAME = "Gestao de Eventos"

$env:GESTAO_EVENTOS_STRIPE_SECRET_KEY = ""
$env:GESTAO_EVENTOS_STRIPE_PUBLISHABLE_KEY = ""
$env:GESTAO_EVENTOS_STRIPE_WEBHOOK_SECRET = ""

$env:GESTAO_EVENTOS_SSO_GOOGLE_CLIENT_ID = ""
$env:GESTAO_EVENTOS_SSO_GOOGLE_CLIENT_SECRET = ""
$env:GESTAO_EVENTOS_SSO_FACEBOOK_CLIENT_ID = ""
$env:GESTAO_EVENTOS_SSO_FACEBOOK_CLIENT_SECRET = ""
$env:GESTAO_EVENTOS_SSO_MICROSOFT_CLIENT_ID = ""
$env:GESTAO_EVENTOS_SSO_MICROSOFT_CLIENT_SECRET = ""
```

## Ordem de deploy recomendada

1. Deploy API:

```powershell
./infra/aws/scripts/deploy-api.ps1 -Region us-east-1 -StackName gestao-eventos-api
```

2. Deploy CloudFront/edge:

```powershell
./infra/aws/scripts/deploy-edge.ps1 \
  -Region us-east-1 \
  -StackName gestao-eventos-edge \
  -ApiStackName gestao-eventos-api \
  -AcmCertificateArn "arn:aws:acm:us-east-1:...:certificate/..." \
  -HostedZoneId "ZXXXXXXXXXXXXX" \
  -CreateDnsRecord true \
  -CreateBucketPolicy false
```

> `CreateBucketPolicy=false` evita sobrescrever policy existente de bucket compartilhado. Se necessário, habilite `true` quando o stack puder gerenciar essa policy.
> Se preferir atualização manual, use o modelo em `infra/aws/bucket-policy-snippet.json`.

3. Deploy frontend:

```powershell
./infra/aws/scripts/deploy-frontend.ps1 -Region us-east-1 -BucketName seven-projects-sites -Prefix manager-events
```

4. Deploy baseline operacional (orçamento + alarmes):

```powershell
./infra/aws/scripts/deploy-ops.ps1 \
  -Region us-east-1 \
  -ApiStackName gestao-eventos-api \
  -StackName gestao-eventos-ops \
  -AlarmEmail "voce@dominio.com"
```

## SSO callbacks (providers)

Registre nos provedores exatamente:

- `https://sistema-eventos.seven-projetos.com/api/auth/sso/google/callback`
- `https://sistema-eventos.seven-projetos.com/api/auth/sso/facebook/callback`
- `https://sistema-eventos.seven-projetos.com/api/auth/sso/microsoft/callback`

## Cache strategy do frontend

`deploy-frontend.ps1` publica com:

- assets versionados: `cache-control: public,max-age=31536000,immutable`
- `index.html`: `cache-control: no-cache,no-store,must-revalidate`
- invalidação CloudFront apenas de `/` e `/index.html` (quando `DistributionId` for informado)

## Checklist de validação

1. Acessar `https://sistema-eventos.seven-projetos.com`
2. Dar refresh em rota interna da SPA (deve funcionar sem 404)
3. Validar `https://sistema-eventos.seven-projetos.com/api/health`
4. Validar login/senha normal
5. Validar SSO Google/Facebook/Microsoft ponta a ponta
6. Validar fluxo de e-mail (confirmação/reenvio)
7. Confirmar recebimento de e-mail de inscrição SNS/Budget

## Faixa de custo esperada (MVP controlado)

Premissas: até 50k chamadas API/mês, até 100GB frontend/mês.

- CloudFront + S3: ~US$ 0 a 1
- API Gateway HTTP API: ~US$ 0.05
- Lambda: ~US$ 0.11
- SES (10k e-mails): ~US$ 1
- Secrets Manager (6 segredos): ~US$ 2.40
- Total típico (sem RDS): ~US$ 3.5 a 6/mês

Observação de custo: evitar NAT Gateway no MVP.
