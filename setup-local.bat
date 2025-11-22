@echo off
REM Shyaw Administration System - Local Setup Script for Windows
REM This script automates the local installation and setup process

setlocal enabledelayedexpansion

echo ================================
echo Shyaw Administration System
echo Local Setup Script (Windows)
echo ================================
echo.

REM Step 1: Check if Node.js is installed
echo Checking for Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js found: %NODE_VERSION%
echo.

REM Step 2: Check if npm is installed
echo Checking for npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [SUCCESS] npm found: %NPM_VERSION%
echo.

REM Step 3: Check if PostgreSQL is installed
echo Checking for PostgreSQL...
where psql >nul 2>nul
if errorlevel 1 (
    echo [ERROR] PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('psql --version') do set PG_VERSION=%%i
echo [SUCCESS] PostgreSQL found: %PG_VERSION%
echo.

REM Step 4: Create .env file if it doesn't exist
echo Setting up environment variables...
if not exist .env (
    echo [INFO] Creating .env file from template...
    copy .env.example .env
    echo [SUCCESS] .env file created
    echo.
    echo [INFO] Please edit .env file with your database credentials:
    echo [INFO]   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/shyaw_admin
    echo.
    pause
) else (
    echo [SUCCESS] .env file already exists
)
echo.

REM Step 5: Install dependencies
echo Installing dependencies...
call npm install
echo [SUCCESS] Dependencies installed
echo.

REM Step 6: Create PostgreSQL database
echo Setting up PostgreSQL database...
echo [INFO] This will create the shyaw_admin database
echo [INFO] Make sure your PostgreSQL service is running
echo.

set /p DB_CREATE="Do you want to create/reset the database? (y/n) "
if /i "%DB_CREATE%"=="y" (
    echo [INFO] Connecting to PostgreSQL...
    
    REM Create database (ignore if already exists)
    psql -U postgres -h localhost -c "CREATE DATABASE shyaw_admin;" 2>nul || (
        echo [INFO] Database may already exist
    )
    
    echo [SUCCESS] Database setup complete
) else (
    echo [INFO] Skipping database creation
)
echo.

REM Step 7: Run database migrations
echo Running database migrations...
call npm run db:push
echo [SUCCESS] Database schema updated
echo.

REM Step 8: Summary
echo ================================
echo [SUCCESS] Setup Complete!
echo ================================
echo.
echo Next steps:
echo   1. Start the application:
echo      PORT=3000 npm run dev
echo.
echo   2. Open in your browser:
echo      http://localhost:3000
echo.
echo   3. Login with:
echo      Username: admin
echo      Password: (check your admin user password)
echo.
echo For more information, see LOCAL_INSTALLATION.md
echo.
pause
