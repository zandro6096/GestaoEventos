[CmdletBinding()]
param(
  [string]$EnvFile = "",
  [switch]$SkipApi,
  [switch]$SkipFrontend,
  [switch]$SkipNpmInstall
)

$ErrorActionPreference = "Stop"

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($EnvFile)) {
  $EnvFile = Join-Path $scriptRoot "deploy-prod.env.ps1"
}

if (-not (Test-Path $EnvFile)) {
  throw "Env file not found: $EnvFile"
}

. $EnvFile

$requiredValues = @(
  "GE_AWS_ACCOUNT_ID",
  "GE_AWS_REGION",
  "GE_API_STACK_NAME",
  "GE_API_STAGE_NAME",
  "GE_LAMBDA_FUNCTION_NAME",
  "GE_FRONTEND_BUCKET",
  "GE_FRONTEND_PREFIX",
  "GE_CLOUDFRONT_DISTRIBUTION_ID",
  "GE_APP_URL",
  "GE_SSO_DEFAULT_RETURN_URL"
)

foreach ($key in $requiredValues) {
  $value = (Get-Item -Path ("Env:" + $key) -ErrorAction SilentlyContinue).Value
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing required env value '$key' in $EnvFile"
  }
}

$account = aws sts get-caller-identity --query "Account" --output text
if ($LASTEXITCODE -ne 0) {
  throw "Unable to read AWS account identity"
}

if ($account -ne $env:GE_AWS_ACCOUNT_ID) {
  throw "Wrong AWS account. Expected $($env:GE_AWS_ACCOUNT_ID), got $account"
}

$lambdaEnvJson = aws lambda get-function-configuration `
  --region $env:GE_AWS_REGION `
  --function-name $env:GE_LAMBDA_FUNCTION_NAME `
  --query "Environment.Variables" `
  --output json

if ($LASTEXITCODE -ne 0) {
  throw "Unable to read lambda environment from $($env:GE_LAMBDA_FUNCTION_NAME)"
}

$lambdaEnv = $lambdaEnvJson | ConvertFrom-Json
if (-not $lambdaEnv) {
  throw "Lambda environment was empty"
}

function Set-EnvIfPresent {
  param(
    [object]$Source,
    [string]$SourceName,
    [string]$TargetName
  )

  $prop = $Source.PSObject.Properties[$SourceName]
  if ($null -eq $prop) {
    return
  }

  $value = $prop.Value
  if ([string]::IsNullOrWhiteSpace($value)) {
    return
  }

  Set-Item -Path ("Env:" + $TargetName) -Value $value
}

Set-EnvIfPresent -Source $lambdaEnv -SourceName "ConnectionStrings__Mysql" -TargetName "GESTAO_EVENTOS_MYSQL_CONNECTION"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Sso__StateSigningKey" -TargetName "GESTAO_EVENTOS_SSO_STATE_SIGNING_KEY"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Ses__AccessKey" -TargetName "GESTAO_EVENTOS_SES_ACCESS_KEY"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Ses__SecretKey" -TargetName "GESTAO_EVENTOS_SES_SECRET_KEY"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Ses__Region" -TargetName "GESTAO_EVENTOS_SES_REGION"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Ses__FromEmail" -TargetName "GESTAO_EVENTOS_SES_FROM_EMAIL"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Ses__FromName" -TargetName "GESTAO_EVENTOS_SES_FROM_NAME"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Stripe__SecretKey" -TargetName "GESTAO_EVENTOS_STRIPE_SECRET_KEY"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Stripe__PublishableKey" -TargetName "GESTAO_EVENTOS_STRIPE_PUBLISHABLE_KEY"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Stripe__WebhookSecret" -TargetName "GESTAO_EVENTOS_STRIPE_WEBHOOK_SECRET"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Jwt__SigningKey" -TargetName "GESTAO_EVENTOS_JWT_SIGNING_KEY"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Jwt__Issuer" -TargetName "GESTAO_EVENTOS_JWT_ISSUER"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Jwt__Audience" -TargetName "GESTAO_EVENTOS_JWT_AUDIENCE"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Sso__Google__ClientId" -TargetName "GESTAO_EVENTOS_SSO_GOOGLE_CLIENT_ID"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Sso__Google__ClientSecret" -TargetName "GESTAO_EVENTOS_SSO_GOOGLE_CLIENT_SECRET"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Sso__Facebook__ClientId" -TargetName "GESTAO_EVENTOS_SSO_FACEBOOK_CLIENT_ID"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Sso__Facebook__ClientSecret" -TargetName "GESTAO_EVENTOS_SSO_FACEBOOK_CLIENT_SECRET"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Sso__Microsoft__ClientId" -TargetName "GESTAO_EVENTOS_SSO_MICROSOFT_CLIENT_ID"
Set-EnvIfPresent -Source $lambdaEnv -SourceName "Sso__Microsoft__ClientSecret" -TargetName "GESTAO_EVENTOS_SSO_MICROSOFT_CLIENT_SECRET"

if ([string]::IsNullOrWhiteSpace($env:GESTAO_EVENTOS_MYSQL_CONNECTION)) {
  throw "Missing required lambda var ConnectionStrings__Mysql"
}

if ([string]::IsNullOrWhiteSpace($env:GESTAO_EVENTOS_SSO_STATE_SIGNING_KEY)) {
  throw "Missing required lambda var Sso__StateSigningKey"
}

function New-RandomSecret {
  $bytes = New-Object byte[] 48
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()

  try {
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
  }
  finally {
    $rng.Dispose()
  }
}

if ([string]::IsNullOrWhiteSpace($env:GESTAO_EVENTOS_JWT_SIGNING_KEY)) {
  $env:GESTAO_EVENTOS_JWT_SIGNING_KEY = New-RandomSecret
  Write-Host "Jwt__SigningKey was not present on Lambda; generated a new deployment key. Existing sessions will need to sign in again."
}

if (-not $SkipApi.IsPresent) {
  & (Join-Path $scriptRoot "deploy-api.ps1") `
    -StackName $env:GE_API_STACK_NAME `
    -Region $env:GE_AWS_REGION `
    -StageName $env:GE_API_STAGE_NAME `
    -AppUrl $env:GE_APP_URL `
    -SsoDefaultReturnUrl $env:GE_SSO_DEFAULT_RETURN_URL
}

if (-not $SkipFrontend.IsPresent) {
  $frontendArgs = @{
    Region = $env:GE_AWS_REGION
    BucketName = $env:GE_FRONTEND_BUCKET
    Prefix = $env:GE_FRONTEND_PREFIX
    DistributionId = $env:GE_CLOUDFRONT_DISTRIBUTION_ID
  }

  if ($SkipNpmInstall.IsPresent) {
    $frontendArgs["SkipNpmInstall"] = $true
  }

  & (Join-Path $scriptRoot "deploy-frontend.ps1") @frontendArgs
}

Write-Host "Production deployment flow completed."
