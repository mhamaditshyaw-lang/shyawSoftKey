@echo off
REM TaskMasterPro Server Auto-Start Script
REM This batch file starts the TaskMasterPro server with the correct environment configuration

cd /d "E:\TaskMasterPro70\TaskMasterPro70"

REM Set environment variables
set HOST=192.168.70.10
set PORT=3000
set NODE_ENV=production
set DATABASE_URL=postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin

REM Wait 10 seconds before starting to allow system to settle
REM This prevents restart loops
timeout /t 10 /nobreak

REM Check if already running to prevent multiple instances
tasklist | find /i "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo Server is already running. Exiting.
    exit /b 0
)

REM Start the server with error handling
echo.
echo ======================================
echo   Starting TaskMasterPro server...
echo ======================================
echo   Host: %HOST%
echo   Port: %PORT%
echo   URL: http://%HOST%:%PORT%
echo ======================================
echo.

REM Run server and capture any errors
npm start

REM If we reach here, server crashed - log the error but don't restart
if errorlevel 1 (
    echo.
    echo ======================================
    echo   ERROR: Server failed to start
    echo ======================================
    echo.
    echo Check the error above. Do NOT restart automatically.
    echo Server will NOT auto-restart to prevent infinite loops.
    echo.
    timeout /t 60
)
