# Quick Start Guide - Local Installation

## Automated Setup (Recommended)

### On Linux/Mac:
```bash
chmod +x setup-local.sh
./setup-local.sh
```

### On Windows:
```cmd
setup-local.bat
```

## What the Script Does:
1. ✅ Checks for Node.js, npm, and PostgreSQL
2. ✅ Creates .env file from template
3. ✅ Installs npm dependencies
4. ✅ Creates PostgreSQL database
5. ✅ Runs database migrations
6. ✅ Gives you next steps to start the app

## Manual Setup (If Script Fails)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ installed and running

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Edit .env File
Update your database credentials:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/shyaw_admin
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Create Database
```bash
psql -U postgres
```

In PostgreSQL prompt:
```sql
ALTER USER postgres WITH PASSWORD 'Hama10Kurd$$';
CREATE DATABASE shyaw_admin;
GRANT ALL PRIVILEGES ON DATABASE shyaw_admin TO postgres;
\q
```

### Step 5: Setup Database Schema
```bash
npm run db:push
```

### Step 6: Start Development Server
```bash
PORT=3000 npm run dev
```

### Step 7: Access the App
- Open your browser: `http://localhost:3000`
- Login with admin credentials

## Troubleshooting

### PostgreSQL Connection Error
- Make sure PostgreSQL service is running
- Verify DATABASE_URL in .env file
- Check if database shyaw_admin exists

### Port Already in Use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Database Migration Failed
```bash
# Force update schema
npm run db:push -- --force
```

## For More Details
See `LOCAL_INSTALLATION.md` for comprehensive setup instructions.
