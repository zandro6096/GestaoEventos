[CmdletBinding()]
param(
  [string]$StackName = "gestao-eventos-ops",
  [string]$ApiStackName = "gestao-eventos-api",
  [string]$Region = "us-east-1",
  [string]$AlarmEmail,
  [int]$MonthlyBudgetUsd = 15,
  [int]$SecondaryBudgetUsd = 30,
  [int]$LambdaP95ThresholdMs = 1500,
  [string]$TemplateFile = "infra/aws/ops-baseline.yaml"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($AlarmEmail)) {
  throw "AlarmEmail is required"
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
$lambdaFunctionName = ($outputs | Where-Object { $_.OutputKey -eq "LambdaFunctionName" } | Select-Object -First 1).OutputValue
$httpApiId = ($outputs | Where-Object { $_.OutputKey -eq "HttpApiId" } | Select-Object -First 1).OutputValue
$httpApiStageName = ($outputs | Where-Object { $_.OutputKey -eq "HttpApiStageName" } | Select-Object -First 1).OutputValue

if ([string]::IsNullOrWhiteSpace($lambdaFunctionName)) {
  throw "LambdaFunctionName output not found in API stack"
}
if ([string]::IsNullOrWhiteSpace($httpApiId)) {
  throw "HttpApiId output not found in API stack"
}
if ([string]::IsNullOrWhiteSpace($httpApiStageName)) {
  $httpApiStageName = '$default'
}

$parameterOverrides = @(
  "AlarmEmail=$AlarmEmail",
  "LambdaFunctionName=$lambdaFunctionName",
  "HttpApiId=$httpApiId",
  "HttpApiStageName=$httpApiStageName",
  "MonthlyBudgetUsd=$MonthlyBudgetUsd",
  "SecondaryBudgetUsd=$SecondaryBudgetUsd",
  "LambdaP95ThresholdMs=$LambdaP95ThresholdMs"
)

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
  throw "Ops stack deploy failed"
}

Write-Host "Ops stack deployed: $StackName"
Write-Host "Remember to confirm SNS and AWS Budget email subscriptions sent to: $AlarmEmail"
