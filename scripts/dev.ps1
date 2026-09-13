# PeopleOS one-command dev start (Windows)
# Backend on :8080 (H2 + seed), frontend on :5173 — closes both when you close this window's children.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$backendCmd = "cd `"$rootackend`"; ..\mvnw.cmd spring-boot:run `"-Dspring-boot.run.profiles=dev`""
$frontendDir = "$rootrontend"
$frontendCmd = "cd `"$frontendDir`"; if (-not (Test-Path node_modules)) { npm install }; npm run dev"

Write-Host "Starting backend (dev profile, H2 + seed)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd | Out-Null

Write-Host "Waiting for the API to come up..." -ForegroundColor Cyan
$B = "http://localhost:8080/api/v1"
for ($i = 0; $i -lt 60; $i++) {
    try { Invoke-RestMethod -Uri "$B/health" -TimeoutSec 3 | Out-Null; break } catch { Start-Sleep -Seconds 2 }
}

Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd | Out-Null

Write-Host "`nPeopleOS is starting:" -ForegroundColor Green
Write-Host "  Dashboard : http://localhost:5173"
Write-Host "  API health: $B/health"
