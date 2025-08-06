#!/bin/bash

# Shyaw Administration System - Local Installation Script
# This script helps automate the local installation process

set -e

echo "🚀 Shyaw Administration System - Installation Script"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ PostgreSQL detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo ""
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
        echo "⚠️  Please edit .env file with your database credentials before continuing!"
        echo "   Default database URL: postgresql://postgres:password@localhost:5432/shyaw_admin"
        echo ""
        read -p "Press Enter after you've configured your .env file..."
    else
        echo "❌ .env.example file not found. Please create .env manually."
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi

# Create database if it doesn't exist
echo ""
echo "🗄️  Setting up database..."
read -p "Enter your PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter your database name (default: shyaw_admin): " DB_NAME
DB_NAME=${DB_NAME:-shyaw_admin}

echo "Creating database '$DB_NAME'..."
if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✅ Database '$DB_NAME' already exists"
else
    createdb -U "$DB_USER" "$DB_NAME"
    echo "✅ Database '$DB_NAME' created"
fi

# Push database schema
echo ""
echo "🔧 Setting up database schema..."
npm run db:push

# Create admin user
echo ""
echo "👤 Creating admin user..."
node scripts/seed-admin.js

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:5000"
echo "Login with:"
echo "  Username: admin"
echo "  Password: password123"
echo ""
echo "⚠️  Remember to change the default password after first login!"