$ErrorActionPreference = "Stop"

Write-Host "Downloading Git Installer..."
$gitInstallerPath = "$env:TEMP\Git-Installer.exe"
Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe" -OutFile $gitInstallerPath

Write-Host "Installing Git..."
Start-Process -FilePath $gitInstallerPath -ArgumentList "/VERYSILENT", "/NORESTART", "/NOCANCEL", "/SP-", "/CLOSEAPPLICATIONS", "/RESTARTAPPLICATIONS", "/COMPONENTS=icons,ext\reg\shellhere,assoc,assoc_sh" -Wait -NoNewWindow
Write-Host "Git install finished."

Write-Host "Downloading GitHub CLI Installer..."
$ghInstallerPath = "$env:TEMP\gh-cli.msi"
Invoke-WebRequest -Uri "https://github.com/cli/cli/releases/download/v2.45.0/gh_2.45.0_windows_amd64.msi" -OutFile $ghInstallerPath

Write-Host "Installing GitHub CLI..."
Start-Process "msiexec.exe" -ArgumentList "/i `"$ghInstallerPath`" /quiet /qn /norestart" -Wait -NoNewWindow
Write-Host "GitHub CLI install finished."

Write-Host "Installation script complete."
