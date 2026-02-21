# PowerShell script to add operational data

Write-Host "Getting authentication token..." -ForegroundColor Cyan

$loginResponse = Invoke-RestMethod -Uri "http://192.168.70.10:3000/api/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"password123"}'

$TOKEN = $loginResponse.accessToken

if (-not $TOKEN) {
  Write-Host "Failed to get authentication token" -ForegroundColor Red
  exit 1
}

Write-Host "Got token successfully" -ForegroundColor Green

$headers = @{
  "Authorization" = "Bearer $TOKEN"
  "Content-Type" = "application/json"
}

# Staff Count
Write-Host "Adding Staff Count..." -ForegroundColor Cyan
$body = @{
  type = "staffCount"
  data = @{
    "Total employees today" = 45
    "Permanent employees" = 35
    "Non-permanent employees" = 10
  }
  stats = @{
    total = 45
    average = 45
    max = 45
    min = 45
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.70.10:3000/api/operational-data" `
  -Method Post `
  -Headers $headers `
  -Body $body | Out-Null

Write-Host "Added Staff Count" -ForegroundColor Green

# Operations
Write-Host "Adding Operations..." -ForegroundColor Cyan
$body = @{
  type = "operations"
  data = @{
    "Day - Start of work" = 7
    "Day - Giving up" = 3
    "Night - Start of work" = 8
    "Night - Giving up" = 2
  }
  stats = @{
    total = 20
    average = 5
    max = 8
    min = 2
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.70.10:3000/api/operational-data" `
  -Method Post `
  -Headers $headers `
  -Body $body | Out-Null

Write-Host "Added Operations" -ForegroundColor Green

# Production
Write-Host "Adding Production..." -ForegroundColor Cyan
$body = @{
  type = "yesterdayProduction"
  data = @{
    "Day - Ice cream" = 150
    "Night - Ice cream" = 120
    "Day - Albany" = 80
    "Night - Albany" = 95
    "Day - Do" = 60
    "Night - Do" = 70
  }
  stats = @{
    total = 575
    average = 95.8
    max = 150
    min = 60
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.70.10:3000/api/operational-data" `
  -Method Post `
  -Headers $headers `
  -Body $body | Out-Null

Write-Host "Added Production" -ForegroundColor Green

# Loading
Write-Host "Adding Loading..." -ForegroundColor Cyan
$body = @{
  type = "yesterdayLoading"
  data = @{
    "Ice cream / Loading vehicles" = 5
    "Albany / Loading vehicles" = 3
    "Do / Loading vehicles" = 2
    "VEHICLE 1 (TONS)" = 25
    "VEHICLE 2 (TONS)" = 30
    "VEHICLE 3 (TONS)" = 22
  }
  stats = @{
    total = 87
    average = 14.5
    max = 30
    min = 2
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://192.168.70.10:3000/api/operational-data" `
  -Method Post `
  -Headers $headers `
  -Body $body | Out-Null

Write-Host "Added Loading" -ForegroundColor Green

Write-Host "All data added successfully!" -ForegroundColor Green
