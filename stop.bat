@echo off
title Stop ORGagent Organization OS
color 0c
echo ==============================================================================
echo   Stopping ORGagent Organization OS Servers...
echo ==============================================================================
echo.

echo [1/2] Releasing Port 8000 (FastAPI Server)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/2] Releasing Port 3000 (Next.js Dev Server)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [OK] All ORGagent processes have been stopped successfully.
timeout /t 3 >nul
