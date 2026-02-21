@echo off
REM Re-enable TaskMasterPro Auto-Start with Safety Checks
REM This script creates the startup shortcut with improved error handling

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set "VBS_FILE=%SCRIPT_DIR%create-link-safe.vbs"
set "PROJECT_PATH=%SCRIPT_DIR%"

echo.
echo ========================================
echo   TaskMasterPro Auto-Start Re-Enable
echo ========================================
echo.

echo Creating safe startup shortcut...
echo (with 10-second delay to prevent restart loops)
echo.

REM Create improved VBS script
(
    echo Option Explicit
    echo Dim objShell, objFSO, strStartupFolder, strShortcutPath, strVBSFile
    echo Dim objShortcut
    echo.
    echo Set objShell = CreateObject("WScript.Shell"^)
    echo Set objFSO = CreateObject("Scripting.FileSystemObject"^)
    echo.
    echo strStartupFolder = objShell.SpecialFolders("Startup"^)
    echo strShortcutPath = objFSO.BuildPath(strStartupFolder, "TaskMasterPro-Server.lnk"^)
    echo strVBSFile = objFSO.BuildPath("%PROJECT_PATH%", "run-server-silent.vbs"^)
    echo.
    echo Set objShortcut = objShell.CreateShortcut(strShortcutPath^)
    echo objShortcut.TargetPath = "cscript.exe"
    echo objShortcut.Arguments = """" ^& strVBSFile ^& """"
    echo objShortcut.WorkingDirectory = "%PROJECT_PATH%"
    echo objShortcut.WindowStyle = 7
    echo objShortcut.Description = "Start TaskMasterPro Server"
    echo objShortcut.Save
    echo.
    echo objShell.Popup "Startup shortcut created!" + vbCrLf + vbCrLf + "Server will now auto-start on next login" + vbCrLf + vbCrLf + "Wait 30-40 seconds after login for server to start.", 0, "TaskMasterPro Auto-Start"
) > "%VBS_FILE%"

REM Run the VBS script
cscript.exe "%VBS_FILE%"

REM Clean up temp file
del "%VBS_FILE%"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Auto-start is now RE-ENABLED
echo Server will start on next login
echo.
echo To test:
echo 1. Restart your computer
echo 2. Login
echo 3. Wait 30-40 seconds
echo 4. Visit: http://192.168.70.10:3000
echo.
pause
