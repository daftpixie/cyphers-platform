# generate-og-images.ps1
# Run from punks-web/scripts:  ./generate-og-images.ps1

param(
    [string]$ProjectRoot = ".."
)

Write-Host "=== Cyphers OG Image Generator (CommonJS) ==="

$rootPath = Resolve-Path $ProjectRoot
Set-Location $rootPath
Write-Host "Working directory: $rootPath"

if (-not (Test-Path "public")) {
    Write-Host "Creating public directory..."
    New-Item -ItemType Directory -Path "public" | Out-Null
}

if (-not (Test-Path "scripts")) {
    Write-Host "Creating scripts directory..."
    New-Item -ItemType Directory -Path "scripts" | Out-Null
}

Write-Host "Ensuring canvas is installed..."
npm install canvas

Write-Host "Running Node generator..."
node ./scripts/generate-og-images.cjs

Write-Host "=== Done. Check punks-web/public for generated images. ==="
