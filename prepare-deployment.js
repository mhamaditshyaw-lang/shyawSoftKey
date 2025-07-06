import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Preparing project for cPanel deployment...\n');

// Step 1: Build the client application
console.log('📦 Building client application...');
try {
  execSync('npm run build:client', { stdio: 'inherit' });
  console.log('✅ Client build completed\n');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Step 2: Build the server application
console.log('⚙️ Building server application...');
try {
  execSync('npm run build:server', { stdio: 'inherit' });
  console.log('✅ Server build completed\n');
} catch (error) {
  console.error('❌ Server build failed:', error.message);
  process.exit(1);
}

// Step 3: Create production package.json
console.log('📄 Creating production package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Create production version with minimal dependencies
const prodPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  type: "module",
  license: packageJson.license,
  scripts: {
    start: "NODE_ENV=production node dist/index.js",
    "db:push": "drizzle-kit push"
  },
  dependencies: {
    // Only production dependencies needed for running the built application
    "@neondatabase/serverless": packageJson.dependencies["@neondatabase/serverless"],
    "bcrypt": packageJson.dependencies["bcrypt"],
    "express": packageJson.dependencies["express"],
    "express-session": packageJson.dependencies["express-session"],
    "jsonwebtoken": packageJson.dependencies["jsonwebtoken"],
    "drizzle-orm": packageJson.dependencies["drizzle-orm"],
    "drizzle-kit": packageJson.dependencies["drizzle-kit"],
    "zod": packageJson.dependencies["zod"],
    "zod-validation-error": packageJson.dependencies["zod-validation-error"]
  }
};

fs.writeFileSync('package.prod.json', JSON.stringify(prodPackageJson, null, 2));
console.log('✅ Production package.json created\n');

// Step 4: Create deployment archive
console.log('📦 Creating deployment archive...');
try {
  // Remove old archive if exists
  if (fs.existsSync('office-management-cpanel.tar.gz')) {
    fs.unlinkSync('office-management-cpanel.tar.gz');
  }
  
  execSync(`tar -czf office-management-cpanel.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=attached_assets \
    --exclude=migrations \
    --exclude=client/src \
    --exclude=server/*.ts \
    --exclude=shared/*.ts \
    --exclude=scripts \
    --exclude=*.log \
    --exclude=.env \
    --exclude=.replit \
    --exclude=.config \
    --exclude=vite.config.ts \
    --exclude=tsconfig.json \
    --exclude=tailwind.config.ts \
    --exclude=postcss.config.js \
    --exclude=drizzle.config.ts \
    --exclude=components.json \
    --exclude=prepare-deployment.js \
    --exclude=deploy-cpanel.sh \
    dist/ \
    client/dist/ \
    shared/ \
    package.prod.json \
    drizzle.config.ts \
    CPANEL_DEPLOYMENT_GUIDE.md \
    create_admin_user.sql \
    .env.production`, { stdio: 'inherit' });
  
  console.log('✅ Deployment archive created: office-management-cpanel.tar.gz\n');
} catch (error) {
  console.error('❌ Archive creation failed:', error.message);
  process.exit(1);
}

// Step 5: Show deployment summary
console.log('🎉 Deployment preparation completed!\n');
console.log('📁 Files ready for cPanel upload:');
console.log('   📦 office-management-cpanel.tar.gz (main deployment file)');
console.log('   📋 CPANEL_DEPLOYMENT_GUIDE.md (setup instructions)');
console.log('   🗄️ create_admin_user.sql (database setup)');
console.log('\n📝 Next steps:');
console.log('   1. Upload office-management-cpanel.tar.gz to your cPanel');
console.log('   2. Extract the archive in public_html');
console.log('   3. Rename package.prod.json to package.json');
console.log('   4. Follow CPANEL_DEPLOYMENT_GUIDE.md for complete setup');
console.log('\n🔒 Security reminders:');
console.log('   - Create strong database credentials');
console.log('   - Generate secure JWT_SECRET');
console.log('   - Change default admin password immediately');
console.log('   - Enable SSL certificate');