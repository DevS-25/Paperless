# Start Paperless Backend Server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Paperless Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set location to project root
Set-Location -Path $PSScriptRoot

# Set Maven path
$env:MAVEN_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.4\plugins\maven\lib\maven3"
$env:PATH = "$env:MAVEN_HOME\bin;$env:PATH"

Write-Host "Backend server starting on http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "Wait for message: 'Started PaperlessApplication'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start Spring Boot application
& mvn spring-boot:run

