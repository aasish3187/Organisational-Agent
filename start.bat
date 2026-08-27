@echo off
title NEXUS Organization OS Launcher
color 0b
echo ==============================================================================
echo   NEXUS Organization OS -- 1-Click Launch Suite
echo   Dynamic Governance | VERITAS Cryptography | MNEMOS Memory
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting FastAPI Backend Server on port 8000...
start "NEXUS Backend API (Port 8000)" cmd /k "cd /d apps\api && if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) && uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload"

echo [2/3] Starting Next.js 15 Web Client on port 3000...
start "NEXUS Web Client (Port 3000)" cmd /k "cd /d apps\web && npm run dev -- -p 3000"

echo [3/3] Initializing runtime environments...
timeout /t 3 /nobreak >nul

echo [OK] Launching NEXUS in your default web browser...
start http://localhost:3000

echo.
echo ==============================================================================
echo   NEXUS is now live!
echo   - Web Application:  http://localhost:3000
echo   - Backend Service:  http://localhost:8000
echo   - API Documentation: http://localhost:8000/docs
echo ==============================================================================
echo.
echo (You may close this launcher window; servers will keep running in the background)
timeout /t 5 >nul
