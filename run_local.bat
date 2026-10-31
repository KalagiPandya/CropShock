@echo off
echo ========================================================
echo   Starting CropShock Platform (Local Standalone Mode)
echo ========================================================
cd /d "%~dp0"

echo [1/3] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "CropShock Backend" cmd /k "cd /d "%~dp0" && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

echo [2/3] Launching React Frontend on http://localhost:5173 ...
start "CropShock Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0 --port 5173"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser automatically...
start http://localhost:5173/

echo.
echo ========================================================
echo   CropShock is fully running!
echo   Frontend Dashboard:   http://localhost:5173/
echo   Backend REST API:     http://127.0.0.1:8000/
echo   Interactive API Docs: http://127.0.0.1:8000/docs
echo ========================================================
