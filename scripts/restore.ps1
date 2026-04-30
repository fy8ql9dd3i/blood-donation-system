# PostgreSQL Restore Script for Windows (PowerShell)
# Usage: ./restore.ps1 -BackupFile ./backups/db_backup_xxxx.sql

param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Error: Backup file not found at $BackupFile" -ForegroundColor Red
    exit
}

# Load environment variables from .env
$envFile = Get-Content "../backend/.env"
foreach ($line in $envFile) {
    if ($line -match "^([^#\s][^=]*)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "Env:$key" -Value $value
    }
}

Write-Host "⚠️ WARNING: This will overwrite the current database ($env:DB_NAME)!" -ForegroundColor Yellow
$confirmation = Read-Host "Are you sure you want to proceed? (y/n)"
if ($confirmation -ne "y") {
    Write-Host "Operation cancelled."
    exit
}

Write-Host "🔄 Restoring Database from $BackupFile..." -ForegroundColor Cyan

# Run psql (Assumes psql is in PATH)
$env:PGPASSWORD = $env:DB_PASSWORD

# Drop and Recreate DB (Optional but safer for full restore)
# dropdb -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER $env:DB_NAME
# createdb -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER $env:DB_NAME

# Direct Restore
psql -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -d $env:DB_NAME -f $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Restore Completed Successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Restore Failed!" -ForegroundColor Red
}

# Cleanup password from env
Remove-Item -Path "Env:PGPASSWORD"
