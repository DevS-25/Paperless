@echo off
echo ========================================
echo Starting Paperless Frontend
echo ========================================
echo.

cd /d "%~dp0\frontend"

echo Frontend starting on http://localhost:3000
echo.
echo Browser will open automatically
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

