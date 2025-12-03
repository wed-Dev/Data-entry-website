@echo off
echo ========================================
echo SHARING APP WITH USA CLIENT
echo ========================================
echo.
echo Step 1: Starting your server...
start "Transaction Server" cmd /k "cd /d %~dp0 && node server.js"
timeout /t 3
echo.
echo Step 2: Starting Ngrok tunnel...
echo.
echo IMPORTANT: Make sure you have downloaded ngrok.exe
echo Download from: https://ngrok.com/download
echo Place ngrok.exe in this folder
echo.
pause
start "Ngrok Tunnel" cmd /k "cd /d %~dp0 && ngrok http 3000"
echo.
echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo 1. Look at the Ngrok window
echo 2. Find the line that says "Forwarding"
echo 3. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
echo 4. Add /app.html to the end
echo 5. Send complete URL to your USA client
echo.
echo Example: https://abc123.ngrok-free.app/app.html
echo.
echo Your client can now access the app from USA!
echo.
echo Press any key to continue...
pause > nul
