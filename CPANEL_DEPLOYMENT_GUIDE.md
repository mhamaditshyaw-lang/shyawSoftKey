# cPanel Deployment Guide for Office Management System

## Overview
This guide will help you deploy your Office Management System to a cPanel hosting environment like Hostinger. The application has been optimized for production deployment with proper environment configuration.

## Prerequisites
- cPanel hosting account (Hostinger or similar)
- Node.js support enabled on your hosting account
- PostgreSQL database access
- FTP/File Manager access

## Step 1: Prepare Your Project for Deployment

### 1.1 Build the Application
First, build the project for production:
```bash
npm run build
```

### 1.2 Create Production Archive
Create a compressed archive of your project:
```bash
tar -czf office-management-system.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=attached_assets \
  --exclude=migrations \
  --exclude=*.log \
  .
```

## Step 2: cPanel Setup

### 2.1 Create Database
1. Log in to your cPanel
2. Go to "MySQL Databases" or "PostgreSQL Databases"
3. Create a new database (e.g., `office_management`)
4. Create a database user with full privileges
5. Note down the database connection details

### 2.2 Upload Files
1. Go to "File Manager" in cPanel
2. Navigate to your domain's public_html folder
3. Upload the `office-management-system.tar.gz` file
4. Extract the archive

### 2.3 Install Dependencies
1. Open "Terminal" in cPanel (if available) or use SSH
2. Navigate to your project directory:
   ```bash
   cd public_html
   ```
3. Install Node.js dependencies:
   ```bash
   npm install --production
   ```

## Step 3: Environment Configuration

### 3.1 Create Environment File
Create a `.env` file in your project root:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3.2 Configure Database Connection
Update your database URL with the correct credentials:
- Replace `username` with your database username
- Replace `password` with your database password
- Replace `database_name` with your database name
- Replace `localhost` with your database host (usually localhost)

## Step 4: Database Migration

### 4.1 Run Database Migrations
```bash
npm run db:push
```

### 4.2 Create Admin User
Run the following SQL command in your database:
```sql
INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'admin',
  'admin@yourdomain.com',
  '$2b$10$rHQTlkqQtKvHpj1fW1KwJe8fqJgBkNjQXgJbJxMhCqWd5oVQgFgHS',
  'admin',
  'active',
  NOW(),
  NOW()
);
```
Note: The password hash above is for the password "admin123". Change it after first login.

## Step 5: Configure cPanel Application

### 5.1 Create Node.js App
1. In cPanel, go to "Node.js Selector" or "Node.js Apps"
2. Create a new Node.js application:
   - App Root: `/public_html`
   - App URL: Your domain
   - App Startup File: `server/index.js`
   - Node.js Version: 18 or higher

### 5.2 Set Environment Variables
In the Node.js app configuration, add environment variables:
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your database connection string
- `JWT_SECRET`: Your secret key

### 5.3 Configure Package.json
Ensure your `package.json` has the correct start script:
```json
{
  "scripts": {
    "start": "node server/index.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=server/index.js --external:pg-native"
  }
}
```

## Step 6: Build and Start

### 6.1 Build for Production
```bash
npm run build
```

### 6.2 Start the Application
```bash
npm start
```

## Step 7: Configure Domain and SSL

### 7.1 Domain Setup
1. Ensure your domain points to your hosting server
2. Configure subdomain if needed (e.g., `app.yourdomain.com`)

### 7.2 SSL Certificate
1. Go to "SSL/TLS" in cPanel
2. Install SSL certificate (Let's Encrypt is usually free)
3. Force HTTPS redirect

## Step 8: Final Configuration

### 8.1 Test the Application
1. Visit your domain
2. Try logging in with admin credentials
3. Test all major features

### 8.2 Production Optimizations
1. Enable gzip compression in cPanel
2. Configure caching headers
3. Set up regular database backups

## Step 9: Maintenance and Updates

### 9.1 Regular Backups
- Set up automated backups in cPanel
- Backup both files and database

### 9.2 Updates
To update the application:
1. Upload new files
2. Run `npm install` if dependencies changed
3. Run database migrations if needed
4. Restart the Node.js application

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify database credentials
- Check if PostgreSQL is enabled
- Ensure database user has proper permissions

**Node.js App Won't Start**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check application logs in cPanel

**404 Errors**
- Ensure static files are properly built
- Check file permissions
- Verify domain configuration

**Authentication Issues**
- Verify JWT_SECRET is set
- Check if admin user exists in database
- Ensure password hash is correct

## Security Considerations

1. **Change Default Passwords**: Change the default admin password immediately
2. **Environment Variables**: Keep sensitive data in environment variables
3. **HTTPS**: Always use HTTPS in production
4. **Regular Updates**: Keep dependencies updated
5. **Database Security**: Use strong database passwords
6. **Backup Strategy**: Implement regular backups

## Performance Optimization

1. **Static File Serving**: Use CDN for static assets
2. **Database Optimization**: Add indexes for frequently queried fields
3. **Caching**: Implement Redis caching if available
4. **Monitoring**: Set up application monitoring

## Support

If you encounter issues:
1. Check cPanel error logs
2. Review application logs
3. Verify environment configuration
4. Contact your hosting provider for server-related issues

## Conclusion

Your Office Management System is now deployed on cPanel hosting with:
- ✅ Production-ready configuration
- ✅ Secure database setup
- ✅ SSL certificate
- ✅ Environment-based configuration
- ✅ Admin user access

The application includes multilingual support (Kurdish and English) and comprehensive user management with Admin, Manager, and Security roles.