# PostgreSQL Backup Script for Windows (PowerShell)
# This script dumps the database to a .sql file in the backups folder.

# Load environment variables from .env
$envFile = Get-Content "../backend/.env"
foreach ($line in $envFile) {
    if ($line -match "^([^#\s][^=]*)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "Env:$key" -Value $value
    }
}

# Configuration
$BACKUP_DIR = "./backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Create backups directory if it doesn't exist
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR
}

Write-Host "🚀 Starting Database Backup..." -ForegroundColor Cyan
Write-Host "Database: $env:DB_NAME"
Write-Host "Target: $BACKUP_FILE"

# Run pg_dump (Assumes pg_dump is in PATH)
$env:PGPASSWORD = $env:DB_PASSWORD
pg_dump -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -F p -f $BACKUP_FILE $env:DB_NAME

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup Completed Successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Backup Failed! Check your PG installation and .env credentials." -ForegroundColor Red
}

# Cleanup password from env
Remove-Item -Path "Env:PGPASSWORD"
