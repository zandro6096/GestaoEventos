[CmdletBinding()]
param(
  [string]$StackName = "gestao-eventos-api",
  [string]$Region = "us-east-1",
  [string]$StageName = '$default',
  [string]$AppUrl = "https://sistema-eventos.seven-projetos.com",
  [string]$SsoDefaultReturnUrl = "https://sistema-eventos.seven-projetos.com/auth/sso/callback",
  [string]$TemplateFile = "infra/aws/sam-api.yaml",
  [switch]$UseContainer,
  [switch]$NoExecuteChangeset
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
Set-Location $repoRoot

$samCommand = (Get-Command sam -ErrorAction SilentlyContinue).Source
if ([string]::IsNullOrWhiteSpace($samCommand)) {
  $fallbackSam = "C:\\Program Files\\Amazon\\AWSSAMCLI\\bin\\sam.cmd"
  if (Test-Path $fallbackSam) {
    $samCommand = $fallbackSam
  }
}
if ([string]::IsNullOrWhiteSpace($samCommand)) {
  throw "SAM CLI not found. Install AWS SAM CLI and ensure 'sam' is available."
}

$mysqlConnection = $env:GESTAO_EVENTOS_MYSQL_CONNECTION
$ssoStateSigningKey = $env:GESTAO_EVENTOS_SSO_STATE_SIGNING_KEY
$jwtSigningKey = $env:GESTAO_EVENTOS_JWT_SIGNING_KEY

function Get-EnvOrDefault {
  param(
    [string]$Value,
    [string]$DefaultValue
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $DefaultValue
  }

  return $Value
}

if ([string]::IsNullOrWhiteSpace($mysqlConnection)) {
  throw "Missing env var GESTAO_EVENTOS_MYSQL_CONNECTION"
}

if ([string]::IsNullOrWhiteSpace($ssoStateSigningKey)) {
  throw "Missing env var GESTAO_EVENTOS_SSO_STATE_SIGNING_KEY"
}

# Sem a chave de JWT a API nao sobe (por design). Falhar aqui e melhor do que
# publicar uma versao que morre no boot.
if ([string]::IsNullOrWhiteSpace($jwtSigningKey)) {
  throw "Missing env var GESTAO_EVENTOS_JWT_SIGNING_KEY"
}

if ($jwtSigningKey.Length -lt 32) {
  throw "GESTAO_EVENTOS_JWT_SIGNING_KEY muito curta (minimo 32 caracteres)"
}

$parameterOverrides = @(
  "StageName=$StageName",
  "AppUrl=$AppUrl",
  "MysqlConnectionString=$mysqlConnection",
  "SsoDefaultReturnUrl=$SsoDefaultReturnUrl",
  "SsoStateSigningKey=$ssoStateSigningKey",
  "JwtSigningKey=$jwtSigningKey"
)

function Add-ParameterOverrideIfPresent {
  param(
    [string]$Name,
    [string]$Value,
    [string]$DefaultValue = ""
  )

  $finalValue = Get-EnvOrDefault $Value $DefaultValue
  if ([string]::IsNullOrWhiteSpace($finalValue)) {
    return
  }

  $script:parameterOverrides += "$Name=$finalValue"
}

Add-ParameterOverrideIfPresent -Name "SesAccessKey" -Value $env:GESTAO_EVENTOS_SES_ACCESS_KEY
Add-ParameterOverrideIfPresent -Name "SesSecretKey" -Value $env:GESTAO_EVENTOS_SES_SECRET_KEY
Add-ParameterOverrideIfPresent -Name "SesRegion" -Value $env:GESTAO_EVENTOS_SES_REGION -DefaultValue "us-east-1"
Add-ParameterOverrideIfPresent -Name "SesFromEmail" -Value $env:GESTAO_EVENTOS_SES_FROM_EMAIL -DefaultValue "noreply@seven-projetos.com"
Add-ParameterOverrideIfPresent -Name "SesFromName" -Value $env:GESTAO_EVENTOS_SES_FROM_NAME -DefaultValue "Gestao de Eventos"
Add-ParameterOverrideIfPresent -Name "StripeSecretKey" -Value $env:GESTAO_EVENTOS_STRIPE_SECRET_KEY
Add-ParameterOverrideIfPresent -Name "StripePublishableKey" -Value $env:GESTAO_EVENTOS_STRIPE_PUBLISHABLE_KEY
Add-ParameterOverrideIfPresent -Name "StripeWebhookSecret" -Value $env:GESTAO_EVENTOS_STRIPE_WEBHOOK_SECRET
Add-ParameterOverrideIfPresent -Name "JwtIssuer" -Value $env:GESTAO_EVENTOS_JWT_ISSUER -DefaultValue "gestao-eventos-api"
Add-ParameterOverrideIfPresent -Name "JwtAudience" -Value $env:GESTAO_EVENTOS_JWT_AUDIENCE -DefaultValue "gestao-eventos-app"
Add-ParameterOverrideIfPresent -Name "SsoGoogleClientId" -Value $env:GESTAO_EVENTOS_SSO_GOOGLE_CLIENT_ID
Add-ParameterOverrideIfPresent -Name "SsoGoogleClientSecret" -Value $env:GESTAO_EVENTOS_SSO_GOOGLE_CLIENT_SECRET
Add-ParameterOverrideIfPresent -Name "SsoFacebookClientId" -Value $env:GESTAO_EVENTOS_SSO_FACEBOOK_CLIENT_ID
Add-ParameterOverrideIfPresent -Name "SsoFacebookClientSecret" -Value $env:GESTAO_EVENTOS_SSO_FACEBOOK_CLIENT_SECRET
Add-ParameterOverrideIfPresent -Name "SsoMicrosoftClientId" -Value $env:GESTAO_EVENTOS_SSO_MICROSOFT_CLIENT_ID
Add-ParameterOverrideIfPresent -Name "SsoMicrosoftClientSecret" -Value $env:GESTAO_EVENTOS_SSO_MICROSOFT_CLIENT_SECRET
Add-ParameterOverrideIfPresent -Name "PushJobKey" -Value $env:GESTAO_EVENTOS_PUSH_JOB_KEY
# Sem override o CloudFormation mantem o valor antigo do parametro; bcrypt/JIT precisam de CPU.
Add-ParameterOverrideIfPresent -Name "FunctionMemorySize" -Value $env:GESTAO_EVENTOS_FUNCTION_MEMORY -DefaultValue "1024"

$buildArgs = @("build", "--template-file", $TemplateFile)
if ($UseContainer.IsPresent) {
  $buildArgs += "--use-container"
}

& $samCommand @buildArgs
if ($LASTEXITCODE -ne 0) {
  throw "SAM build failed"
}

$deployArgs = @(
  "deploy",
  "--template-file", ".aws-sam/build/template.yaml",
  "--stack-name", $StackName,
  "--region", $Region,
  "--capabilities", "CAPABILITY_IAM",
  "--resolve-s3",
  "--no-confirm-changeset",
  "--no-fail-on-empty-changeset",
  "--parameter-overrides"
)
$deployArgs += $parameterOverrides
if ($NoExecuteChangeset.IsPresent) {
  $deployArgs += "--no-execute-changeset"
}

& $samCommand @deployArgs
if ($LASTEXITCODE -ne 0) {
  throw "SAM deploy failed"
}

Write-Host "API stack deployed: $StackName"
