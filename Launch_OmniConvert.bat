@echo off
setlocal
title OmniConvert Launcher
cd /d "%~dp0"

echo ========================================================
echo          OmniConvert - Universal Image Converter
echo ========================================================
echo.

:: Check if server is already running on port 3002
netstat -ano | findstr ":3002 " | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] Server is already running on http://localhost:3002
    echo Opening browser...
    start http://localhost:3002
    timeout /t 2 >nul
    exit /b
)

echo [1/2] Starting local server in background (port 3002)...
start /min "OmniConvert Server (Port 3002)" cmd /c "npm run dev"

echo [2/2] Waiting for server to initialize...
:waitloop
timeout /t 1 /nobreak >nul
netstat -ano | findstr ":3002 " | findstr "LISTENING" >nul
if %errorlevel% neq 0 (
    echo       Checking port 3002...
    goto waitloop
)

echo.
echo [SUCCESS] OmniConvert is online!
echo Opening browser: http://localhost:3002
start http://localhost:3002
timeout /t 2 >nul
exit
