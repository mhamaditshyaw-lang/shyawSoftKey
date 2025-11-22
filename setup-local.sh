#!/bin/bash

# Shyaw Administration System - Local Setup Script
# This script automates the local installation and setup process

set -e  # Exit on any error

echo "================================"
echo "Shyaw Administration System"
echo "Local Setup Script"
echo "================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Step 1: Check if Node.js is installed
print_info "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js found: $NODE_VERSION"
echo ""

# Step 2: Check if npm is installed
print_info "Checking for npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm found: $NPM_VERSION"
echo ""

# Step 3: Check if PostgreSQL is installed
print_info "Checking for PostgreSQL..."
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/"
    exit 1
fi
PG_VERSION=$(psql --version)
print_success "PostgreSQL found: $PG_VERSION"
echo ""

# Step 4: Create .env file if it doesn't exist
print_info "Setting up environment variables..."
if [ ! -f .env ]; then
    print_info "Creating .env file from template..."
    cp .env.example .env
    print_success ".env file created"
    
    print_info "Please edit .env file with your database credentials:"
    print_info "  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/shyaw_admin"
    echo ""
    read -p "Press Enter after updating .env file (or Ctrl+C to cancel)..."
else
    print_success ".env file already exists"
fi
echo ""

# Step 5: Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"
echo ""

# Step 6: Create PostgreSQL database
print_info "Setting up PostgreSQL database..."
print_info "This will create the shyaw_admin database"
print_info "Make sure your PostgreSQL service is running"
echo ""

read -p "Do you want to create/reset the database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Connecting to PostgreSQL..."
    
    # Try to create database
    PGPASSWORD="${DB_PASSWORD:-}" psql -U postgres -h localhost -c "CREATE DATABASE shyaw_admin;" 2>/dev/null || print_info "Database may already exist"
    
    print_success "Database setup complete"
else
    print_info "Skipping database creation"
fi
echo ""

# Step 7: Run database migrations
print_info "Running database migrations..."
npm run db:push
print_success "Database schema updated"
echo ""

# Step 8: Summary
echo "================================"
print_success "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Start the application:"
echo "     PORT=3000 npm run dev"
echo ""
echo "  2. Open in your browser:"
echo "     http://localhost:3000"
echo ""
echo "  3. Login with:"
echo "     Username: admin"
echo "     Password: (check your admin user password)"
echo ""
echo "For more information, see LOCAL_INSTALLATION.md"
echo ""
