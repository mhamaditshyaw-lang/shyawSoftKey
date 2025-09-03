# Database Recovery Guide - After Extended Inactivity

## The Problem
After 2+ weeks of inactivity, Neon database endpoints are automatically disabled to save resources. This is a normal behavior for free-tier databases and causes the error:

```
ERROR: The endpoint has been disabled. Enable it using Neon API and retry.
```

## Current Status
- ✅ Application code is intact
- ✅ Database schema definitions are preserved
- ❌ Database connection is disabled
- ❌ User data needs to be recreated

## Automatic Recovery Process

The system will automatically:

1. **Create New Database Connection**
   - A fresh PostgreSQL database has been provisioned
   - Environment variables have been updated

2. **Recreate Database Schema**
   - All tables (users, todos, interviews, etc.) will be recreated
   - User roles (admin, manager, security, office) will be restored
   - Permission system will be rebuilt

3. **Restore Test Users**
   - Admin: username `admin`, password `password123`
   - Manager: username `manager`, password `password123` 
   - Security: username `security`, password `password123`
   - Office: username `office`, password `password123`

## What Was Lost
- Previous user accounts (except test accounts)
- Todo lists and tasks
- Interview requests
- Historical data

## What's Preserved
- All application code and features
- User management system with permissions
- Complete functionality including:
  - User management with role-based permissions
  - Employee management system
  - Todo management
  - Interview scheduling
  - Reporting system
  - Multi-language support

## Prevention for Production

For production environments, consider:
1. Use a paid database tier with always-on connectivity
2. Implement regular database activity to prevent idle timeouts
3. Set up database monitoring and alerts
4. Create automated backup and restore procedures

## Recovery Commands

If manual recovery is needed:
```bash
# 1. Push database schema
npm run db:push --force

# 2. Run database recovery script  
tsx scripts/fix-database-after-idle.js

# 3. Restart application
npm run dev
```

## Current Test Users

After recovery, you can login with:
- **Admin**: full system access
- **Manager**: user management + reports  
- **Security**: basic access to tasks/reviews
- **Office**: limited permissions (configurable)

All users use password: `password123`