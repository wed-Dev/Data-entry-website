@echo off
echo ========================================
echo   RESET DATABASE (Remove Test Data)
echo ========================================
echo.
echo This will DELETE ALL transactions and users
echo (except the admin account)
echo.
echo Your admin login will remain:
echo   Username: admin
echo   Password: admin123
echo.
set /p confirm="Are you sure? Type YES to confirm: "
if /i not "%confirm%"=="YES" (
    echo.
    echo Cancelled. No changes made.
    pause
    exit
)

echo.
echo Stopping server if running...
taskkill /F /IM node.exe 2>nul

echo Backing up current database...
if exist transactions.db (
    copy transactions.db transactions_backup_%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%.db >nul
    echo Backup created.
)

echo Deleting old database...
del transactions.db 2>nul

echo Starting fresh server (will create clean database)...
start "Transaction Server" cmd /k "cd /d %~dp0 && node server.js"

echo.
echo ========================================
echo Database reset complete!
echo ========================================
echo.
echo A clean database has been created.
echo Admin account ready: admin / admin123
echo.
echo The server is running in the new window.
echo Visit: http://localhost:3000/login.html
echo.
pause
