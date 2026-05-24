@echo off
cd /d "%~dp0"

echo ============================================
echo   Alton's Carwash - Starting Website
echo ============================================
echo.

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
)

echo Setting up database...
call npm run setup

echo.
echo Starting server...
echo.
echo   Website:  http://localhost:3000
echo   Admin:    http://localhost:3000/admin/login
echo.
echo Keep this window OPEN while using the site.
echo Press Ctrl+C to stop the server.
echo.

start "" "http://localhost:3000"
call npm run dev
