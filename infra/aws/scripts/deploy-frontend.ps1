[CmdletBinding()]
param(
  [string]$Region = "us-east-1",
  [string]$BucketName = "seven-projects-sites",
  [string]$Prefix = "manager-events",
  [string]$DistributionId = "",
  [switch]$SkipNpmInstall
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$frontendRoot = Join-Path $repoRoot "GestaoEventos.Angular"

Push-Location $frontendRoot
try {
  if (-not $SkipNpmInstall.IsPresent) {
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
  }

  npm run build:prod
  if ($LASTEXITCODE -ne 0) { throw "Angular production build failed" }
}
finally {
  Pop-Location
}

$browserOutput = Join-Path $frontendRoot "dist/gestao-nota-fiscal/browser"
if (-not (Test-Path $browserOutput)) {
  throw "Build output not found: $browserOutput"
}

$target = "s3://$BucketName/$Prefix"
$immutableCacheControl = "public,max-age=31536000,immutable"
$shortCacheControl = "public,max-age=300"

function Set-S3ContentType {
  param(
    [string]$Pattern,
    [string]$ContentType,
    [string]$CacheControl = $immutableCacheControl
  )

  aws s3 cp $browserOutput $target `
    --recursive `
    --exclude "*" `
    --include $Pattern `
    --content-type $ContentType `
    --cache-control $CacheControl `
    --region $Region

  if ($LASTEXITCODE -ne 0) {
    throw "S3 upload failed for pattern '$Pattern'"
  }
}

# Keep old hashed assets available so open browser tabs do not fail lazy route
# loading during a deploy. index.html is still replaced with no-cache below.
aws s3 sync $browserOutput $target `
  --exclude "index.html" `
  --cache-control $immutableCacheControl `
  --region $Region
if ($LASTEXITCODE -ne 0) { throw "S3 asset sync failed" }

# Enforce MIME types explicitly to avoid browser module-load failures.
Set-S3ContentType "*.js" "application/javascript"
Set-S3ContentType "*.mjs" "application/javascript"
Set-S3ContentType "*.css" "text/css"
Set-S3ContentType "*.map" "application/json"
Set-S3ContentType "*.json" "application/json" $shortCacheControl
Set-S3ContentType "*.svg" "image/svg+xml"
Set-S3ContentType "*.ico" "image/x-icon" "no-cache,no-store,must-revalidate"
Set-S3ContentType "*.png" "image/png"
Set-S3ContentType "*.jpg" "image/jpeg"
Set-S3ContentType "*.jpeg" "image/jpeg"
Set-S3ContentType "*.gif" "image/gif"
Set-S3ContentType "*.webp" "image/webp"
Set-S3ContentType "*.woff" "font/woff"
Set-S3ContentType "*.woff2" "font/woff2"
Set-S3ContentType "*.ttf" "font/ttf"
Set-S3ContentType "*.otf" "font/otf"
Set-S3ContentType "*.html" "text/html; charset=utf-8" "no-cache,no-store,must-revalidate"

$rootIndex = Join-Path $browserOutput "index.html"
if (-not (Test-Path $rootIndex)) {
  $landingIndex = Join-Path $browserOutput "landing/index.html"
  $loginIndex = Join-Path $browserOutput "auth/login/index.html"

  if (Test-Path $landingIndex) {
    Copy-Item -Path $landingIndex -Destination $rootIndex -Force
  }
  elseif (Test-Path $loginIndex) {
    Copy-Item -Path $loginIndex -Destination $rootIndex -Force
  }
  else {
    throw "Root index.html not found and no fallback route index is available."
  }
}

aws s3 cp $rootIndex "$target/index.html" `
  --cache-control "no-cache,no-store,must-revalidate" `
  --content-type "text/html; charset=utf-8" `
  --region $Region
if ($LASTEXITCODE -ne 0) { throw "S3 index upload failed" }

if (-not [string]::IsNullOrWhiteSpace($DistributionId)) {
  aws cloudfront create-invalidation `
    --distribution-id $DistributionId `
    --paths "/*"

  if ($LASTEXITCODE -ne 0) {
    throw "CloudFront invalidation failed"
  }
}

Write-Host "Frontend deployed to $target"
