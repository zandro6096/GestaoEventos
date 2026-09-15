[CmdletBinding()]
param(
  [string]$StackName = "gestao-eventos-edge",
  [string]$ApiStackName = "gestao-eventos-api",
  [string]$Region = "us-east-1",
  [string]$SiteBucketName = "seven-projects-sites",
  [string]$SiteOriginPath = "/manager-events",
  [string]$FrontendDomainName = "sistema-eventos.seven-projetos.com",
  [string]$AcmCertificateArn,
  [string]$HostedZoneId = "",
  [ValidateSet("true", "false")]
  [string]$CreateDnsRecord = "true",
  [ValidateSet("true", "false")]
  [string]$CreateBucketPolicy = "false",
  [string]$TemplateFile = "infra/aws/cloudfront-frontend.yaml"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($AcmCertificateArn)) {
  throw "AcmCertificateArn is required"
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
Set-Location $repoRoot

$outputsJson = aws cloudformation describe-stacks `
  --stack-name $ApiStackName `
  --region $Region `
  --query "Stacks[0].Outputs" `
  --output json

if ($LASTEXITCODE -ne 0) {
  throw "Unable to read outputs from API stack '$ApiStackName'"
}

$outputs = $outputsJson | ConvertFrom-Json
$apiDomain = ($outputs | Where-Object { $_.OutputKey -eq "ApiOriginDomainName" } | Select-Object -First 1).OutputValue
$apiOriginPath = ($outputs | Where-Object { $_.OutputKey -eq "ApiOriginPath" } | Select-Object -First 1).OutputValue

if ([string]::IsNullOrWhiteSpace($apiDomain)) {
  throw "ApiOriginDomainName output not found in API stack"
}

$parameterOverrides = @(
  "SiteBucketName=$SiteBucketName",
  "SiteOriginPath=$SiteOriginPath",
  "FrontendDomainName=$FrontendDomainName",
  "AcmCertificateArn=$AcmCertificateArn",
  "ApiOriginDomainName=$apiDomain",
  "CreateDnsRecord=$CreateDnsRecord",
  "CreateBucketPolicy=$CreateBucketPolicy"
)

if (-not [string]::IsNullOrWhiteSpace($apiOriginPath)) {
  $parameterOverrides += "ApiOriginPath=$apiOriginPath"
}

if (-not [string]::IsNullOrWhiteSpace($HostedZoneId)) {
  $parameterOverrides += "HostedZoneId=$HostedZoneId"
}

$deployArgs = @(
  "cloudformation", "deploy",
  "--stack-name", $StackName,
  "--template-file", $TemplateFile,
  "--region", $Region,
  "--no-fail-on-empty-changeset",
  "--parameter-overrides"
)
$deployArgs += $parameterOverrides

& aws @deployArgs
if ($LASTEXITCODE -ne 0) {
  throw "CloudFront stack deploy failed"
}

Write-Host "Edge stack deployed: $StackName"
