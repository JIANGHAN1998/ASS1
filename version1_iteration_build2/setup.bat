@echo off
REM Swimmate Dashboard Setup Script for Windows
REM This script sets up the project with Azure MySQL credentials

echo 🏊‍♀️ Setting up Swimmate Dashboard...
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create .env file with Azure MySQL credentials
echo.
echo 🔧 Setting up database configuration...

(
echo # Database Configuration
echo # Azure MySQL Flexible Server Configuration
echo.
echo # MySQL Database Host ^(Azure MySQL server hostname^)
echo DB_HOST=swimmate-sql.mysql.database.azure.com
echo.
echo # Database Username
echo DB_USER=yjin0076
echo.
echo # Database Password
echo DB_PASSWORD=34688455YitingJin
echo.
echo # Database Port ^(default: 3306^)
echo DB_PORT=3306
echo.
echo # Enable SSL for Azure MySQL ^(recommended: true^)
echo DB_SSL=true
echo.
echo # Server Port ^(default: 3000^)
echo PORT=3000
echo.
echo # CORS Origins ^(comma-separated, leave empty to allow all^)
echo ALLOWED_ORIGINS=
) > .env

echo ✅ Database configuration created

echo.
echo 🎉 Setup complete!
echo ==================================
echo.
echo To start the dashboard:
echo   npm start
echo.
echo Then visit: http://localhost:3000/swimmate-dashboard.html
echo.
echo Happy swimming! 🏊‍♀️🏖️
echo.
pause
