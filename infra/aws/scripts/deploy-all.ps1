[CmdletBinding()]
param(
  [string]$Region = "us-east-1",
  [string]$ApiStackName = "gestao-eventos-api",
  [string]$EdgeStackName = "gestao-eventos-edge",
  [string]$OpsStackName = "gestao-eventos-ops",
  [string]$FrontendDomainName = "sistema-eventos.seven-projetos.com",
  [string]$AcmCertificateArn,
  [string]$HostedZoneId = "",
  [string]$AlarmEmail = "",
  [ValidateSet("true", "false")]
  [string]$CreateDnsRecord = "true",
  [ValidateSet("true", "false")]
  [string]$CreateBucketPolicy = "false"
)

$ErrorActionPreference = "Stop"

$scriptRoot = $PSScriptRoot

& (Join-Path $scriptRoot "deploy-api.ps1") -StackName $ApiStackName -Region $Region

& (Join-Path $scriptRoot "deploy-edge.ps1") `
  -StackName $EdgeStackName `
  -ApiStackName $ApiStackName `
  -Region $Region `
  -FrontendDomainName $FrontendDomainName `
  -AcmCertificateArn $AcmCertificateArn `
  -HostedZoneId $HostedZoneId `
  -CreateDnsRecord $CreateDnsRecord `
  -CreateBucketPolicy $CreateBucketPolicy

$distributionId = aws cloudformation describe-stacks `
  --stack-name $EdgeStackName `
  --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" `
  --output text

& (Join-Path $scriptRoot "deploy-frontend.ps1") `
  -Region $Region `
  -DistributionId $distributionId

if (-not [string]::IsNullOrWhiteSpace($AlarmEmail)) {
  & (Join-Path $scriptRoot "deploy-ops.ps1") `
    -StackName $OpsStackName `
    -ApiStackName $ApiStackName `
    -Region $Region `
    -AlarmEmail $AlarmEmail
}

Write-Host "Deployment flow completed"
