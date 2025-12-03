@echo off
echo ========================================
echo Starting Business Transaction System
echo ========================================
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting server...
echo.
start http://localhost:3000/app.html
node server.js
