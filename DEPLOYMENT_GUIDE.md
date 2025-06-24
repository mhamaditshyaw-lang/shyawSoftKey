# Deployment Guide for cPanel Hosting

## Overview
This office management system is built with Node.js, React, and PostgreSQL. Deploying to cPanel requires specific considerations based on your hosting provider's capabilities.

## Prerequisites
- cPanel hosting account with Node.js support
- PostgreSQL database access
- File manager or FTP access
- Terminal/SSH access (if available)

## Deployment Options

### Option 1: cPanel with Node.js Support (Recommended)

#### Step 1: Check Node.js Availability
1. Log into your cPanel
2. Look for "Node.js" or "Node.js Selector" in the Software section
3. Verify Node.js version 18+ is available

#### Step 2: Database Setup
1. Go to "MySQL Databases" or "PostgreSQL Databases" in cPanel
2. Create a new database (e.g., `your_username_office_db`)
3. Create a database user with full privileges
4. Note the connection details:
   - Host: usually `localhost`
   - Database name: `your_username_office_db`
   - Username: `your_username_dbuser`
   - Password: [your chosen password]

#### Step 3: Upload Files
1. Build the project locally:
   ```bash
   npm run build
   ```
2. Upload these files to your domain's public_html folder:
   - All files from the project root
   - The built `dist` folder (frontend)
   - `node_modules` folder (or run `npm install` on server)

#### Step 4: Configure Environment
1. Create `.env` file in the root directory:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   SESSION_SECRET=your-long-random-secret-key-here
   PORT=3000
   ```

#### Step 5: Install Dependencies
1. If SSH access available:
   ```bash
   cd public_html
   npm install --production
   ```
2. Or upload the `node_modules` folder

#### Step 6: Configure Node.js App
1. In cPanel Node.js section:
   - Set Application Root: `/public_html`
   - Set Application URL: `your-domain.com`
   - Set Application Startup File: `server/index.js`
   - Set Node.js Version: 18+ or latest

#### Step 7: Database Migration
1. Run database setup:
   ```bash
   npm run db:push
   ```

### Option 2: Static Hosting with External Backend

If your cPanel doesn't support Node.js:

#### Frontend Only Deployment
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Upload only the `dist` folder contents to `public_html`
3. Use external services for backend:
   - Railway, Heroku, or Vercel for Node.js backend
   - Neon, Supabase, or ElephantSQL for PostgreSQL

### Option 3: Subdomain Deployment

If main domain restrictions exist:

1. Create a subdomain (e.g., `office.yourdomain.com`)
2. Point it to a subfolder
3. Deploy the application in that subfolder
4. Configure Node.js app for the subdomain

## Configuration Files

### package.json Scripts
Ensure these scripts are present:
```json
{
  "scripts": {
    "start": "NODE_ENV=production node server/index.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc server/index.ts --outDir dist/server"
  }
}
```

### .htaccess (if needed)
Create in public_html for URL rewriting:
```apache
RewriteEngine On
RewriteRule ^(?!api/).*$ /index.html [L]
```

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Session
SESSION_SECRET=your-secret-key

# Application
NODE_ENV=production
PORT=3000

# Optional: Custom domain
DOMAIN=yourdomain.com
```

## Common Issues and Solutions

### Issue 1: Node.js Not Available
**Solution**: Use static hosting + external backend services

### Issue 2: PostgreSQL Not Supported
**Solutions**:
- Use MySQL instead (modify schema)
- Use external PostgreSQL service
- Use SQLite for small deployments

### Issue 3: File Permissions
**Solution**: Set proper permissions:
- Folders: 755
- Files: 644
- Executable files: 755

### Issue 4: Memory Limits
**Solution**: 
- Optimize build size
- Use production builds only
- Remove dev dependencies

## Testing Deployment

1. Check if the application starts:
   - Visit `yourdomain.com`
   - Should see the login page

2. Test database connection:
   - Try logging in with admin credentials
   - Check if data loads properly

3. Test functionality:
   - Create test entries
   - Verify data persistence
   - Test all major features

## Maintenance

### Updates
1. Build locally
2. Upload changed files
3. Restart Node.js application in cPanel

### Backups
1. Database: Export via cPanel phpMyAdmin/PostgreSQL
2. Files: Download via File Manager
3. Schedule regular backups

### Monitoring
1. Check error logs in cPanel
2. Monitor resource usage
3. Set up uptime monitoring

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use restricted database users
3. **HTTPS**: Enable SSL certificate in cPanel
4. **Updates**: Keep dependencies updated
5. **Backups**: Regular database and file backups

## Alternative Deployment Services

If cPanel limitations are too restrictive:

1. **Vercel**: Frontend + Serverless functions
2. **Railway**: Full-stack Node.js hosting
3. **DigitalOcean App Platform**: Complete application hosting
4. **Heroku**: Traditional PaaS hosting
5. **AWS/Google Cloud**: Enterprise-grade hosting

## Support

For deployment issues:
1. Check cPanel documentation for Node.js support
2. Contact hosting provider for technical requirements
3. Consider upgrading hosting plan for Node.js support
4. Use alternative deployment services if needed