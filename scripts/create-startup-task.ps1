param(
  [string]$TaskName = 'TaskMasterPro Server Startup',
  [string]$VbsPath = 'E:\TaskMasterPro70\TaskMasterPro70\run-server-silent.vbs'
)

Write-Host "Creating or updating scheduled task: $TaskName"

if (-not (Test-Path $VbsPath)) {
  Write-Host "Error: VBS launcher not found at $VbsPath" -ForegroundColor Red
  exit 1
}

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$VbsPath`""
# Trigger at system startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# Run with highest privileges so it can start services/files that require elevation
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERNAME" -RunLevel Highest

try {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Write-Host "Task exists. Updating..."
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
  }

  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Description 'Start TaskMasterPro server on system startup' -Force
  Write-Host "Scheduled task registered: $TaskName" -ForegroundColor Green
} catch {
  Write-Host "Failed to register scheduled task: $_" -ForegroundColor Red
  exit 2
}

Write-Host "Done. The server will start automatically on next boot." -ForegroundColor Cyan
