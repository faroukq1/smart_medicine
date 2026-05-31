@echo off
echo ============================================
echo   Smart Medicine - Windows Setup
echo ============================================
echo.

echo [1/5] Installing server dependencies...
cd /d "%~dp0server"
call npm i
if %ERRORLEVEL% neq 0 (
    echo ERROR: Server npm install failed!
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo [2/5] Installing client dependencies...
cd /d "%~dp0client"
call npm i
if %ERRORLEVEL% neq 0 (
    echo ERROR: Client npm install failed!
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo [3/5] Running database migration...
cd /d "%~dp0server"
call npm run db:migrate
if %ERRORLEVEL% neq 0 (
    echo ERROR: Database migration failed!
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo [4/5] Opening Prisma Studio in a new window...
start "Prisma Studio" cmd /k "cd /d %~dp0server && npm run db:studio"
echo.

echo [5/5] Running database seed...
cd /d "%~dp0server"
call npm run db:seed
if %ERRORLEVEL% neq 0 (
    echo ERROR: Database seed failed!
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo ============================================
echo   Setup complete!
echo ============================================
pause
