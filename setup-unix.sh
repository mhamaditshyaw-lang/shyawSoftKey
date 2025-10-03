#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "Shyaw Administration System - Setup"
echo "========================================"
echo ""

# Check Node.js
echo "[1/5] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}Node.js is installed: $(node --version)${NC}"
echo ""

# Check PostgreSQL
echo "[2/5] Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}WARNING: PostgreSQL command not found in PATH${NC}"
    echo "Make sure PostgreSQL is installed and accessible"
else
    echo -e "${GREEN}PostgreSQL is installed: $(psql --version)${NC}"
fi
echo ""

# Install dependencies
echo "[3/5] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}Dependencies installed successfully${NC}"
echo ""

# Setup .env file
echo "[4/5] Setting up environment configuration..."
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo -e "${YELLOW}IMPORTANT: Please edit the .env file with your database credentials:${NC}"
    echo "- Database URL: postgresql://postgres:Hama10Kurd\$\$@localhost:5432/shyaw_admin"
    echo ""
else
    echo -e "${GREEN}.env file already exists${NC}"
fi
echo ""

# Database setup instructions
echo "[5/5] Database Setup Instructions"
echo "========================================"
echo ""
echo "Before running the application, please:"
echo ""
echo "1. Start PostgreSQL service:"
echo "   # macOS (Homebrew):"
echo "   brew services start postgresql@14"
echo ""
echo "   # Linux (systemd):"
echo "   sudo systemctl start postgresql"
echo ""
echo "2. Create the database:"
echo "   psql -U postgres"
echo "   ALTER USER postgres WITH PASSWORD 'Hama10Kurd\$\$';"
echo "   CREATE DATABASE shyaw_admin;"
echo "   GRANT ALL PRIVILEGES ON DATABASE shyaw_admin TO postgres;"
echo "   \\q"
echo ""
echo "3. Push database schema:"
echo "   npm run db:push"
echo ""
echo "4. Start the application:"
echo "   npm run dev"
echo ""
echo "The application will be accessible at:"
echo "- http://localhost:5000"
echo "- http://192.168.70.10:5000 (if static IP is configured)"
echo ""
echo "For detailed installation instructions, see LOCAL_INSTALLATION.md"
echo ""
echo "========================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================"
