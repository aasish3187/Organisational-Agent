@echo off
setlocal enabledelayedexpansion
title NEXUS Organization OS Launcher
color 0b

echo ==============================================================================
echo   NEXUS Organization OS -- 1-Click Launch Suite
echo   Dynamic Governance ^| VERITAS Cryptography ^| MNEMOS Memory
echo ==============================================================================
echo.

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo [1/3] Starting FastAPI Backend Server on port 8000...
start "NEXUS Backend API (Port 8000)" cmd /k "cd /d "%ROOT_DIR%\apps\api" && call "%ROOT_DIR%\apps\api\.venv\Scripts\activate.bat" && python -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload"

echo [2/3] Starting Next.js 15 Web Client on port 3000...
start "NEXUS Web Client (Port 3000)" cmd /k "cd /d "%ROOT_DIR%\apps\web" && npm run dev -- -p 3000"

echo [3/3] Waiting for dev servers to boot...
timeout /t 4 /nobreak >nul

echo [OK] Launching NEXUS in your default web browser...
start "" "http://localhost:3000"

echo.
echo ==============================================================================
echo   NEXUS is now live!
echo   - Web Application:  http://localhost:3000
echo   - Backend API:      http://localhost:8000
echo   - API Documentation: http://localhost:8000/docs
echo ==============================================================================
echo.
echo Leave this or the server windows open while using the application.
pause
