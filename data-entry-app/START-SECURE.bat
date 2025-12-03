@echo off
echo ========================================
echo Starting SECURE Transaction System
echo ========================================
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Deleting old database to apply new security...
if exist transactions.db del transactions.db
echo.
echo Starting secure server...
echo.
start http://localhost:3000/login.html
node server.js
