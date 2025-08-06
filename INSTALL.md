# Local Installation Guide

This guide will help you install the Shyaw Administration System on your local computer.

## Quick Start

1. **Install Prerequisites**
   - Node.js 18+ 
   - PostgreSQL 12+
   - Git

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd shyaw-administration-system
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb shyaw_admin
   
   # Copy environment file
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Push database schema
   npm run db:push
   ```

4. **Create Admin User**
   ```bash
   node scripts/seed-admin.js
   ```

5. **Start Application**
   ```bash
   npm run dev
   ```

Visit http://localhost:5000 and login with:
- Username: `admin`
- Password: `password123`

## Detailed Setup Instructions

### 1. Prerequisites

#### Install Node.js
- Download from https://nodejs.org/
- Choose LTS version (18.x or higher)
- Verify: `node --version`

#### Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql` or download from website
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

#### Start PostgreSQL Service
- **Windows**: PostgreSQL should start automatically
- **macOS**: `brew services start postgresql`
- **Linux**: `sudo systemctl start postgresql`

### 2. Database Configuration

#### Create Database
```bash
# Method 1: Command line
createdb shyaw_admin

# Method 2: PostgreSQL console
psql -U postgres
CREATE DATABASE shyaw_admin;
\q
```

#### Configure Environment
Copy `.env.example` to `.env` and edit:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/shyaw_admin
JWT_SECRET=change-this-to-a-secure-random-string
NODE_ENV=development
PORT=5000
```

**Replace placeholders:**
- `username`: Your PostgreSQL username (usually `postgres`)
- `password`: Your PostgreSQL password
- `shyaw_admin`: Your database name

### 3. Application Setup

#### Install Dependencies
```bash
npm install
```

#### Setup Database Schema
```bash
npm run db:push
```

#### Create Admin User
```bash
node scripts/seed-admin.js
```

#### Start Development Server
```bash
npm run dev
```

## Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:push        # Push schema changes
node scripts/seed-admin.js     # Create admin user
node scripts/reset-db.js       # Clear all data except users

# TypeScript
npm run check          # Type checking
```

## Default Login

After setup, use these credentials:
- **URL**: http://localhost:5000
- **Username**: admin
- **Password**: password123

⚠️ **Change the default password after first login!**

## Troubleshooting

### Database Connection Failed
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Test connection: `psql -U username -d shyaw_admin`

### Port Already in Use
Change port in `.env`:
```env
PORT=3000
```

### Permission Denied
Grant database permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE shyaw_admin TO username;
```

### Node Modules Issues
Clear and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### 1. Build Application
```bash
npm run build
```

### 2. Configure Production Environment
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/shyaw_admin
JWT_SECRET=secure-production-secret
PORT=5000
```

### 3. Start Production Server
```bash
npm start
```

## System Requirements

- **Node.js**: 18.x or higher
- **PostgreSQL**: 12.x or higher
- **Memory**: 2GB RAM minimum
- **Storage**: 1GB free space
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Verify all prerequisites are installed
3. Check console logs for error details
4. Ensure database connection works

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt