Set-Location $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting CropShock Platform (Local Standalone Mode)" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "[1/3] Launching FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory $PSScriptRoot -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

Write-Host "[2/3] Launching React Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -WorkingDirectory (Join-Path $PSScriptRoot "frontend") -ArgumentList "-NoExit", "-Command", "npm run dev -- --host 0.0.0.0 --port 5173"

Write-Host "[3/3] Initializing services and opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173/"

Write-Host "`nCropShock services running and browser opened!" -ForegroundColor Green
Write-Host "  Frontend Dashboard:    http://localhost:5173/" -ForegroundColor Cyan
Write-Host "  Backend REST API:      http://127.0.0.1:8000/" -ForegroundColor Cyan
Write-Host "  Interactive API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor Cyan
