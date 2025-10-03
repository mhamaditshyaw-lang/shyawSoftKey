@echo off
echo ========================================
echo Shyaw Administration System - Setup
echo ========================================
echo.

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed: 
node --version

echo.
echo [2/5] Checking PostgreSQL installation...
psql --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: PostgreSQL command not found in PATH
    echo Make sure PostgreSQL is installed and accessible
)
echo.

echo [3/5] Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [4/5] Setting up environment configuration...
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit the .env file with your database credentials:
    echo - Database URL: postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin
    echo.
) else (
    echo .env file already exists
)

echo.
echo [5/5] Database Setup Instructions
echo ========================================
echo.
echo Before running the application, please:
echo.
echo 1. Start PostgreSQL service:
echo    net start postgresql-x64-14
echo.
echo 2. Create the database:
echo    psql -U postgres
echo    ALTER USER postgres WITH PASSWORD 'Hama10Kurd$$';
echo    CREATE DATABASE shyaw_admin;
echo    GRANT ALL PRIVILEGES ON DATABASE shyaw_admin TO postgres;
echo    \q
echo.
echo 3. Push database schema:
echo    npm run db:push
echo.
echo 4. Start the application:
echo    npm run dev
echo.
echo The application will be accessible at:
echo - http://localhost:5000
echo - http://192.168.70.10:5000 (if static IP is configured)
echo.
echo For detailed installation instructions, see LOCAL_INSTALLATION.md
echo.
echo ========================================
echo Setup Complete!
echo ========================================
pause
