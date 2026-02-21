$WshShell = New-Object -ComObject WScript.Shell
$Startup = $WshShell.SpecialFolders("Startup")
$ShortcutPath = Join-Path $Startup "TaskMasterPro-Server.lnk"
$VBSPath = "E:\TaskMasterPro70\TaskMasterPro70\run-server-silent.vbs"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "cscript.exe"
$Shortcut.Arguments = "`"$VBSPath`""
$Shortcut.WorkingDirectory = "E:\TaskMasterPro70\TaskMasterPro70"
$Shortcut.WindowStyle = 7
$Shortcut.Description = "Start TaskMasterPro Server (192.168.70.10:3000)"
$Shortcut.Save()

Write-Host "OK: Startup shortcut created!" -ForegroundColor Green
Write-Host "Location: $ShortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "The server will automatically start on next login." -ForegroundColor Green
