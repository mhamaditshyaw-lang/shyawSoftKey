#!/bin/bash

# Deployment script for cPanel hosting
# Run this script locally before uploading to cPanel

echo "🚀 Building Office Management System for cPanel deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/
rm -rf deploy/

# Create deployment directory
mkdir -p deploy

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Copy necessary files to deploy directory
echo "📁 Preparing deployment files..."

# Copy package files
cp package.json deploy/
cp package-lock.json deploy/

# Copy server files
cp -r server/ deploy/

# Copy client build
cp -r dist/ deploy/

# Copy shared files
cp -r shared/ deploy/

# Copy configuration files
cp drizzle.config.ts deploy/
cp tsconfig.json deploy/
cp vite.config.ts deploy/
cp tailwind.config.ts deploy/
cp postcss.config.js deploy/

# Create production environment template
cat > deploy/.env.example << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Session Configuration
SESSION_SECRET=your-long-random-secret-key-here-make-it-very-long-and-random

# Application Configuration
NODE_ENV=production
PORT=3000

# Optional: Domain Configuration
DOMAIN=yourdomain.com
EOF

# Create deployment README
cat > deploy/DEPLOY_README.md << 'EOF'
# cPanel Deployment Instructions

## Files to Upload
Upload all files in this directory to your cPanel public_html folder.

## Environment Setup
1. Rename `.env.example` to `.env`
2. Update the database connection details
3. Generate a strong SESSION_SECRET

## Database Setup
1. Create PostgreSQL database in cPanel
2. Run: `npm run db:push`

## Node.js Configuration
1. Go to Node.js section in cPanel
2. Set Application Root: /public_html
3. Set Startup File: server/index.js
4. Install dependencies: npm install --production

## First Run
1. Start the application
2. Login with: admin / admin123
3. Change default credentials immediately

## Troubleshooting
- Check error logs in cPanel
- Verify database connection
- Ensure Node.js version 18+
EOF

# Create start script for cPanel
cat > deploy/app.js << 'EOF'
// Entry point for cPanel Node.js applications
const path = require('path');

// Set environment to production if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Start the server
require('./server/index.js');
EOF

# Remove development dependencies from package.json
echo "🔧 Optimizing package.json for production..."
node -e "
const pkg = require('./deploy/package.json');
delete pkg.devDependencies;
pkg.scripts = {
  'start': 'node app.js',
  'db:push': 'drizzle-kit push',
  'db:migrate': 'drizzle-kit migrate'
};
require('fs').writeFileSync('./deploy/package.json', JSON.stringify(pkg, null, 2));
"

# Create zip file for easy upload
echo "📦 Creating deployment package..."
cd deploy
zip -r ../office-management-system-cpanel.zip . -x "*.DS_Store" "node_modules/*"
cd ..

echo "✅ Deployment package ready!"
echo ""
echo "📁 Files prepared in: ./deploy/"
echo "📦 Zip package: ./office-management-system-cpanel.zip"
echo ""
echo "Next steps:"
echo "1. Upload the zip file to your cPanel File Manager"
echo "2. Extract it in your public_html directory"
echo "3. Follow instructions in DEPLOY_README.md"
echo "4. Configure Node.js application in cPanel"
echo "5. Set up your database and environment variables"
echo ""
echo "🔗 For detailed instructions, see: DEPLOYMENT_GUIDE.md"