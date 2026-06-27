@echo off
title Full Stack Dev Launcher
color 0A

echo ==============================
echo   Updating Project...
echo ==============================

git pull

if errorlevel 1 (
    echo.
    echo Git pull failed!
    pause
    exit /b
)

echo.
echo ==============================
echo   Starting Full Stack Project
echo ==============================

:: Start Backend Server
start "SERVER" cmd /k "cd server && npm run db:migrate && npm run dev"

timeout /t 2 >nul

:: Start Ngrok tunnel
start "NGROK" cmd /k "ngrok http 3000"

timeout /t 2 >nul

:: Start Expo Client
start "CLIENT" cmd /k "cd client && npx expo start --clear"

echo.
echo ==============================
echo   All services are running!
echo ==============================
pause