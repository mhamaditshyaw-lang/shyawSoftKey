@echo off
REM Create startup shortcut for TaskMasterPro Server
setlocal enabledelayedexpansion

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Define paths
set "VBS_FILE=%SCRIPT_DIR%create-link.vbs"
set "PROJECT_PATH=%SCRIPT_DIR%"

REM Create VBS script to make the shortcut
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
    echo objShell.Popup "Startup shortcut created!" + vbCrLf + "Server will auto-start on next login.", 0, "TaskMasterPro Setup"
) > "%VBS_FILE%"

REM Run the VBS script
echo Creating startup shortcut...
cscript.exe "%VBS_FILE%"

REM Clean up
del "%VBS_FILE%"
echo.
echo Setup Complete!
echo.
pause
