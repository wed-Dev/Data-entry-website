@echo off
echo ========================================
echo    CODE SAFETY VERIFICATION TOOL
echo ========================================
echo.
echo This will help you verify the code is safe.
echo.
echo Step 1: Opening code in Notepad for manual review...
timeout /t 2 > nul
start notepad server.js
echo.
echo Step 2: Running npm security audit...
call npm audit
echo.
echo Step 3: Checking for suspicious patterns...
powershell -Command "Write-Host 'Scanning for external URLs...' -ForegroundColor Yellow; $content = Get-Content 'server.js' -Raw; if ($content -match 'https?://(?!localhost)') { Write-Host 'WARNING: External URLs found!' -ForegroundColor Red } else { Write-Host 'PASS: No external URLs' -ForegroundColor Green }"
echo.
echo Step 4: Verifying database location...
powershell -Command "if (Test-Path 'transactions.db') { Write-Host 'Database location: ' -NoNewline; Write-Host (Resolve-Path 'transactions.db').Path -ForegroundColor Green } else { Write-Host 'Database will be created in this folder' -ForegroundColor Yellow }"
echo.
echo ========================================
echo    VERIFICATION COMPLETE
echo ========================================
echo.
echo Read the opened server.js file and check:
echo   1. No suspicious external URLs
echo   2. Only uses localhost
echo   3. Only accesses files in this folder
echo   4. No eval() or exec() functions
echo   5. Uses standard libraries (express, sqlite3, cors)
echo.
echo Full security report: SECURITY-VERIFICATION.txt
echo.
pause
