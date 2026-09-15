# Non-secret production deployment defaults.
# Keep only identifiers and paths here; do not store keys or passwords.

$env:GE_AWS_ACCOUNT_ID = "905418147879"
$env:GE_AWS_REGION = "us-east-1"

$env:GE_API_STACK_NAME = "gestao-eventos-api"
$env:GE_API_STAGE_NAME = '$default'
$env:GE_LAMBDA_FUNCTION_NAME = "gestao-eventos-api-api"

$env:GE_EDGE_STACK_NAME = "gestao-eventos-edge"
$env:GE_FRONTEND_BUCKET = "seven-projects-sites"
$env:GE_FRONTEND_PREFIX = "manager-events"
$env:GE_CLOUDFRONT_DISTRIBUTION_ID = "EOCIIEVTDMQ2U"

$env:GE_APP_URL = "https://sistema-eventos.seven-projetos.com"
$env:GE_SSO_DEFAULT_RETURN_URL = "https://sistema-eventos.seven-projetos.com/auth/sso/callback"
