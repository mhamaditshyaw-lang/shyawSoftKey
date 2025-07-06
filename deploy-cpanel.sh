#!/bin/bash

# cPanel Deployment Script for Office Management System
# This script automates the deployment process for cPanel hosting

set -e

echo "🚀 Starting cPanel Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="office-management-system"
ARCHIVE_NAME="${PROJECT_NAME}.tar.gz"
BUILD_DIR="dist"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    print_success "Node.js is installed: $(node --version)"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_success "npm is installed: $(npm --version)"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Build the application
build_application() {
    print_status "Building application for production..."
    
    # Build client
    print_status "Building client application..."
    npm run build:client
    
    # Build server
    print_status "Building server application..."
    npm run build:server
    
    print_success "Application built successfully"
}

# Create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    # Remove existing archive
    if [ -f "$ARCHIVE_NAME" ]; then
        rm "$ARCHIVE_NAME"
        print_status "Removed existing archive"
    fi
    
    # Create archive with necessary files
    tar -czf "$ARCHIVE_NAME" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=attached_assets \
        --exclude=migrations \
        --exclude=*.log \
        --exclude=.env \
        --exclude=.replit \
        --exclude=.config \
        --exclude=client/src \
        --exclude=server/*.ts \
        --exclude=shared/*.ts \
        --exclude=vite.config.ts \
        --exclude=tsconfig.json \
        --exclude=tailwind.config.ts \
        --exclude=postcss.config.js \
        --exclude=drizzle.config.ts \
        --exclude=components.json \
        . \
        --transform 's|^|office-management-system/|'
    
    print_success "Deployment package created: $ARCHIVE_NAME"
}

# Generate environment template
create_env_template() {
    print_status "Creating environment template..."
    
    cat > .env.production << EOF
# Production Environment Configuration
# Copy this file to .env and update with your actual values

NODE_ENV=production
PORT=3000

# Database Configuration
# Replace with your actual database credentials
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Secret - Generate a strong secret key
JWT_SECRET=your-super-secret-jwt-key-here-change-this

# Optional: Logging Configuration
LOG_LEVEL=info

# Optional: Session Configuration
SESSION_SECRET=your-session-secret-here
EOF
    
    print_success "Environment template created: .env.production"
}

# Generate deployment instructions
create_deployment_instructions() {
    print_status "Creating deployment instructions..."
    
    cat > DEPLOYMENT_INSTRUCTIONS.txt << EOF
=== cPanel Deployment Instructions ===

1. UPLOAD FILES:
   - Upload $ARCHIVE_NAME to your cPanel File Manager
   - Extract the archive in your public_html directory

2. CONFIGURE ENVIRONMENT:
   - Copy .env.production to .env
   - Update database credentials in .env file
   - Generate a strong JWT_SECRET

3. SETUP DATABASE:
   - Create PostgreSQL database in cPanel
   - Run: npm run db:push
   - Create admin user with provided SQL command

4. CONFIGURE NODE.JS APP:
   - Go to Node.js Selector in cPanel
   - Create new app with startup file: server/index.js
   - Set environment variables from .env file

5. START APPLICATION:
   - Run: npm install --production
   - Start the Node.js application from cPanel

6. ACCESS YOUR APP:
   - Visit your domain
   - Login with admin credentials
   - Default: admin / admin123 (change immediately)

For detailed instructions, see CPANEL_DEPLOYMENT_GUIDE.md
EOF
    
    print_success "Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.txt"
}

# Generate SQL for admin user creation
create_admin_sql() {
    print_status "Creating admin user SQL script..."
    
    cat > create_admin_user.sql << EOF
-- Create admin user for Office Management System
-- Password: admin123 (change immediately after first login)

INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'admin',
  'admin@yourdomain.com',
  '\$2b\$10\$rHQTlkqQtKvHpj1fW1KwJe8fqJgBkNjQXgJbJxMhCqWd5oVQgFgHS',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Create sample security user
INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'security',
  'security@yourdomain.com',
  '\$2b\$10\$rHQTlkqQtKvHpj1fW1KwJe8fqJgBkNjQXgJbJxMhCqWd5oVQgFgHS',
  'security',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Create sample manager user  
INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'manager',
  'manager@yourdomain.com',
  '\$2b\$10\$rHQTlkqQtKvHpj1fW1KwJe8fqJgBkNjQXgJbJxMhCqWd5oVQgFgHS',
  'manager',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;
EOF
    
    print_success "Admin user SQL script created: create_admin_user.sql"
}

# Verify package contents
verify_package() {
    print_status "Verifying package contents..."
    
    echo "Package contents:"
    tar -tzf "$ARCHIVE_NAME" | head -20
    
    echo "..."
    echo "Total files: $(tar -tzf "$ARCHIVE_NAME" | wc -l)"
    
    # Check package size
    PACKAGE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
    print_success "Package size: $PACKAGE_SIZE"
}

# Main deployment process
main() {
    echo "=========================================="
    echo "  Office Management System Deployment    "
    echo "=========================================="
    echo ""
    
    # Check system requirements
    check_nodejs
    check_npm
    
    # Build process
    install_dependencies
    build_application
    
    # Package creation
    create_package
    create_env_template
    create_deployment_instructions
    create_admin_sql
    
    # Verification
    verify_package
    
    echo ""
    echo "=========================================="
    print_success "Deployment package ready!"
    echo "=========================================="
    echo ""
    echo "Files created:"
    echo "  📦 $ARCHIVE_NAME (deployment package)"
    echo "  ⚙️  .env.production (environment template)"
    echo "  📋 DEPLOYMENT_INSTRUCTIONS.txt"
    echo "  🗄️  create_admin_user.sql"
    echo "  📚 CPANEL_DEPLOYMENT_GUIDE.md"
    echo ""
    echo "Next steps:"
    echo "  1. Upload $ARCHIVE_NAME to your cPanel hosting"
    echo "  2. Follow DEPLOYMENT_INSTRUCTIONS.txt"
    echo "  3. Read CPANEL_DEPLOYMENT_GUIDE.md for detailed setup"
    echo ""
    print_warning "Don't forget to:"
    echo "  - Update database credentials in .env"
    echo "  - Generate strong JWT_SECRET"
    echo "  - Change default admin password"
    echo "  - Enable SSL certificate"
    echo ""
}

# Run main function
main "$@"