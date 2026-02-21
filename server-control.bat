@echo off
REM TaskMasterPro Server Control Menu
REM Easy management script for starting/stopping the server

:menu
cls
echo.
echo   ========================================
echo      TaskMasterPro Server Control Menu
echo   ========================================
echo.
echo   1. Start Server (in new window)
echo   2. Start Server (in background)
echo   3. Stop All Node Processes
echo   4. Restart Server
echo   5. View Server Status
echo   6. Open in Browser (192.168.70.10:3000)
echo   7. Open Startup Shortcut Folder
echo   8. Rebuild Application
echo   9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto start_new
if "%choice%"=="2" goto start_bg
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto restart
if "%choice%"=="5" goto status
if "%choice%"=="6" goto browser
if "%choice%"=="7" goto startup_folder
if "%choice%"=="8" goto rebuild
if "%choice%"=="9" goto end

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:start_new
cls
echo Starting TaskMasterPro Server in new window...
call run-server.bat
goto menu

:start_bg
cls
echo Starting TaskMasterPro Server in background...
start /min npm start
echo Server started in background.
timeout /t 3 >nul
goto menu

:stop
cls
echo Stopping all Node processes...
taskkill /F /IM node.exe /IM npm.exe >nul 2>&1
echo Processes stopped.
timeout /t 2 >nul
goto menu

:restart
cls
echo Restarting server...
taskkill /F /IM node.exe /IM npm.exe >nul 2>&1
timeout /t 2 >nul
start /min npm start
echo Server restarted in background.
timeout /t 2 >nul
goto menu

:status
cls
echo Checking Node.js process status...
tasklist | find /i "node.exe" >nul
if %errorlevel% equ 0 (
    echo [OK] Server is RUNNING
    echo.
    echo Active Node processes:
    tasklist | find /i "node.exe"
) else (
    echo [OFFLINE] Server is NOT running
    echo.
    echo Start server with: npm start
)
timeout /t 5 >nul
goto menu

:browser
cls
echo Opening http://192.168.70.10:3000 in browser...
start "" "http://192.168.70.10:3000"
timeout /t 2 >nul
goto menu

:startup_folder
cls
echo Opening startup shortcut folder...
start "" "C:\Users\%USERNAME%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup"
timeout /t 2 >nul
goto menu

:rebuild
cls
echo Building TaskMasterPro application...
call npm run build
echo.
echo Build complete! Press any key to return to menu...
pause >nul
goto menu

:end
echo.
echo Goodbye!
exit /b 0
