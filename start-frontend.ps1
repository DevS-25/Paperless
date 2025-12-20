# Start Paperless Frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Paperless Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location -Path "$PSScriptRoot\frontend"

Write-Host "Frontend starting on http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Browser will open automatically" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start React application
npm start

