@echo off
echo ========================================
echo Starting Paperless Backend Server
echo ========================================
echo.

cd /d "%~dp0"

set "MAVEN_HOME=C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.4\plugins\maven\lib\maven3"
set "PATH=%MAVEN_HOME%\bin;%PATH%"

echo Backend server starting on http://localhost:8080
echo.
echo Wait for message: "Started PaperlessApplication"
echo.
echo Press Ctrl+C to stop the server
echo.

call "%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run
