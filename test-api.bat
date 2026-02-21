@echo off
REM Test script to verify operational data API is working

echo ========================================
echo TaskMasterPro - Operational Data API Test
echo ========================================
echo.

REM Login first to get token
echo Step 1: Authenticating...
powershell -Command "
try {
    \$loginResponse = Invoke-RestMethod -Uri 'http://192.168.70.10:3000/api/login' `
      -Method Post `
      -ContentType 'application/json' `
      -Body '{\"username\":\"admin\",\"password\":\"password123\"}' -ErrorAction Stop
    
    \$TOKEN = \$loginResponse.accessToken
    if (-not \$TOKEN) {
        Write-Host 'ERROR: Failed to get authentication token' -ForegroundColor Red
        exit 1
    }
    
    Write-Host 'SUCCESS: Got authentication token' -ForegroundColor Green
    Write-Host \"Token: \$(\$TOKEN.Substring(0, 20))...\" -ForegroundColor Yellow
    
    echo.
    Write-Host 'Step 2: Fetching operational data...' -ForegroundColor Cyan
    
    \$headers = @{
        'Authorization' = \"Bearer \$TOKEN\"
        'Content-Type' = 'application/json'
    }
    
    \$response = Invoke-RestMethod -Uri 'http://192.168.70.10:3000/api/operational-data' `
      -Method Get `
      -Headers \$headers `
      -ErrorAction Stop
    
    Write-Host 'SUCCESS: Got response from API' -ForegroundColor Green
    Write-Host \"Entries count: \$(\$response.entries.Count)\" -ForegroundColor Yellow
    
    if (\$response.entries.Count -gt 0) {
        Write-Host 'First entry:' -ForegroundColor Cyan
        Write-Host (\$response.entries[0] | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    } else {
        Write-Host 'WARNING: No entries returned' -ForegroundColor Yellow
    }
    
} catch {
    Write-Host \"ERROR: \$(\$_.Exception.Message)\" -ForegroundColor Red
    Write-Host \$_.Exception.StackTrace -ForegroundColor Gray
    exit 1
}
"

echo.
echo ========================================
echo Test completed
echo ========================================
