# Health Dossier - Android Build Helper Script
# Run this script with PowerShell to perform common Android build tasks

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('build', 'open', 'sync', 'clean', 'help')]
    [string]$Action = 'help'
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Health Dossier - Android Build Helper" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Show-Help {
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  .\android-build.ps1 build" -ForegroundColor Green
    Write-Host "    - Builds Angular app and syncs to Android" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\android-build.ps1 open" -ForegroundColor Green
    Write-Host "    - Opens project in Android Studio" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\android-build.ps1 sync" -ForegroundColor Green
    Write-Host "    - Syncs changes to Android without rebuilding" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\android-build.ps1 clean" -ForegroundColor Green
    Write-Host "    - Cleans build artifacts" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\android-build.ps1 build" -ForegroundColor Cyan
    Write-Host ""
}

function Build-Android {
    Write-Host "Building Angular app for production..." -ForegroundColor Yellow
    npm run build -- --configuration production

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Build successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Syncing to Android..." -ForegroundColor Yellow
        npx cap sync android

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Sync successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Your app is ready to test in Android Studio!" -ForegroundColor Cyan
            Write-Host "Run: .\android-build.ps1 open" -ForegroundColor Cyan
        } else {
            Write-Host "✗ Sync failed" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Build failed" -ForegroundColor Red
    }
}

function Open-AndroidStudio {
    Write-Host "Opening Android Studio..." -ForegroundColor Yellow
    npx cap open android
}

function Sync-Android {
    Write-Host "Syncing to Android..." -ForegroundColor Yellow
    npx cap sync android

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Sync successful!" -ForegroundColor Green
    } else {
        Write-Host "✗ Sync failed" -ForegroundColor Red
    }
}

function Clean-Build {
    Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow

    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "✓ Removed dist folder" -ForegroundColor Green
    }

    if (Test-Path "android\app\build") {
        Remove-Item -Recurse -Force "android\app\build"
        Write-Host "✓ Removed Android build folder" -ForegroundColor Green
    }

    if (Test-Path "android\.gradle") {
        Remove-Item -Recurse -Force "android\.gradle"
        Write-Host "✓ Removed Gradle cache" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Clean complete! Run 'build' to rebuild." -ForegroundColor Cyan
}

# Main script logic
switch ($Action) {
    'build' {
        Build-Android
    }
    'open' {
        Open-AndroidStudio
    }
    'sync' {
        Sync-Android
    }
    'clean' {
        Clean-Build
    }
    'help' {
        Show-Help
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

