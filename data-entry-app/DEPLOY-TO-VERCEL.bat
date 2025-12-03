@echo off
echo ========================================
echo   VERCEL DEPLOYMENT SCRIPT
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    call npm install -g vercel
    echo.
)

echo Current directory: %CD%
echo.

echo Choose deployment type:
echo [1] First Time Setup (with prompts)
echo [2] Deploy to Production
echo [3] Deploy to Preview
echo [4] Add Environment Variables
echo [5] View Deployment Logs
echo.

set /p choice="Enter choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Starting initial deployment...
    echo.
    vercel
) else if "%choice%"=="2" (
    echo.
    echo Deploying to production...
    echo.
    vercel --prod
) else if "%choice%"=="3" (
    echo.
    echo Deploying to preview...
    echo.
    vercel
) else if "%choice%"=="4" (
    echo.
    echo Adding environment variables...
    echo.
    echo Copy your database credentials from Vercel dashboard
    echo.
    echo Adding POSTGRES_URL...
    vercel env add POSTGRES_URL
    echo.
    echo Adding POSTGRES_PRISMA_URL...
    vercel env add POSTGRES_PRISMA_URL
    echo.
    echo Adding POSTGRES_URL_NON_POOLING...
    vercel env add POSTGRES_URL_NON_POOLING
    echo.
    echo Adding POSTGRES_USER...
    vercel env add POSTGRES_USER
    echo.
    echo Adding POSTGRES_HOST...
    vercel env add POSTGRES_HOST
    echo.
    echo Adding POSTGRES_PASSWORD...
    vercel env add POSTGRES_PASSWORD
    echo.
    echo Adding POSTGRES_DATABASE...
    vercel env add POSTGRES_DATABASE
    echo.
    echo Environment variables added!
    echo Now run option 2 to deploy to production.
) else if "%choice%"=="5" (
    echo.
    echo Fetching deployment logs...
    echo.
    vercel logs
) else (
    echo Invalid choice!
)

echo.
echo ========================================
echo   Done!
echo ========================================
pause
