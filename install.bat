@echo off
REM Shyaw Administration System - Windows Installation Script

echo 🚀 Shyaw Administration System - Installation Script
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo ✅ PostgreSQL detected

REM Install dependencies
echo.
echo 📦 Installing dependencies...
npm install

REM Check if .env exists
if not exist ".env" (
    if exist ".env.example" (
        echo.
        echo 📝 Creating .env file from .env.example...
        copy .env.example .env
        echo ⚠️  Please edit .env file with your database credentials!
        echo    Default: postgresql://postgres:password@localhost:5432/shyaw_admin
        echo.
        pause
    ) else (
        echo ❌ .env.example file not found. Please create .env manually.
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file already exists
)

REM Setup database schema
echo.
echo 🔧 Setting up database schema...
npm run db:push

REM Create admin user
echo.
echo 👤 Creating admin user...
node scripts/seed-admin.js

echo.
echo 🎉 Installation completed successfully!
echo.
echo To start the application:
echo   npm run dev
echo.
echo Then visit: http://localhost:5000
echo Login with:
echo   Username: admin
echo   Password: password123
echo.
echo ⚠️  Remember to change the default password after first login!
pause