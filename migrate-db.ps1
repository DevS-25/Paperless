$ErrorActionPreference = "Stop"

# --- Configuration ---
$LocalDbName = "paperless_db"
$LocalUser = "paperless_user"
$LocalPass = "Paperless@123" # Note: Putting password here for convenience, usually safer to prompt
$DumpFile = "backup.sql"

Write-Host "=== Database Migration Tool ===" -ForegroundColor Cyan
Write-Host "This script will export your local '$LocalDbName' and import it to a cloud database."
Write-Host ""

# --- Check for MySQL Tools ---
if (-not (Get-Command mysqldump -ErrorAction SilentlyContinue)) {
    Write-Error "Error: 'mysqldump' command not found. Please ensure MySQL Server / bin folder is in your System PATH."
}
if (-not (Get-Command mysql -ErrorAction SilentlyContinue)) {
    Write-Error "Error: 'mysql' command not found. Please ensure MySQL Server / bin folder is in your System PATH."
}

# --- Step 1: Export Local Data ---
Write-Host "1. Exporting local database..." -ForegroundColor Yellow
try {
    # Using --column-statistics=0 for compatibility with some older/newer versions
    # Using cmd /c to handle redirection properly in PowerShell
    $dumpCommand = "mysqldump -u $LocalUser -p$LocalPass --column-statistics=0 --databases $LocalDbName --add-drop-database --result-file=$DumpFile"
    Invoke-Expression $dumpCommand

    if (Test-Path $DumpFile) {
        Write-Host "   Success! Backup saved to $DumpFile" -ForegroundColor Green
    } else {
        throw "Backup file was not created."
    }
}
catch {
    Write-Error "Failed to export local database. Check if your local MySQL is running and credentials are correct."
}

# --- Step 2: Get Cloud Credentials ---
Write-Host ""
Write-Host "2. Enter Cloud Database Details:" -ForegroundColor Yellow
$CloudHost = Read-Host "   Cloud Host (e.g., mysql-xx.aivencloud.com)"
$CloudPort = Read-Host "   Cloud Port (e.g., 20596)"
$CloudUser = Read-Host "   Cloud Username"
$CloudPass = Read-Host -AsSecureString
$CloudPassPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($CloudPass))
$CloudDbName = Read-Host "   Cloud Database Name (Target DB)"

if ([string]::IsNullOrWhiteSpace($CloudHost) -or [string]::IsNullOrWhiteSpace($CloudUser)) {
    Write-Error "Host and Username are required."
}

# --- Step 3: Import to Cloud ---
Write-Host ""
Write-Host "3. Importing to Cloud Database..." -ForegroundColor Yellow
Write-Host "   Connecting to $CloudHost..."

try {
    # We pipe the file content into the mysql command
    # Note: We use Get-Content | mysql ...
    # Warning: This might be slow for huge DBs, but fine for this size.
    # Better approach: mysql -h ... < file.sql

    $importCommand = "mysql -h $CloudHost -P $CloudPort -u $CloudUser -p$CloudPassPlain $CloudDbName < $DumpFile"

    # We need to execute this via cmd to handle the '<' redirection which PowerShell handles differently
    cmd /c "mysql -h $CloudHost -P $CloudPort -u $CloudUser -p$CloudPassPlain $CloudDbName < $DumpFile"

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ MIGRATION SUCCESSFUL!" -ForegroundColor Green
        Write-Host "Your local data is now on the cloud."
    } else {
        Write-Error "Import command failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Error "Failed to import to cloud database. Check your cloud credentials and network connection."
}

