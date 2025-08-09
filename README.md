# Shyaw Administration System

A comprehensive Employee Affairs Management System with role-based access control, built with React, Express.js, TypeScript, and PostgreSQL.

## Features

- **User Management**: Role-based access control (Admin, Manager, Security)
- **Task Management**: Todo lists with assignment and priority tracking
- **Interview System**: Employee evaluation and interview request management
- **Dashboard**: Real-time statistics and analytics
- **Multilingual Support**: English and Kurdish language support
- **Modern UI**: Glass morphism design with dark/light theme support

## Prerequisites

Before installing, make sure you have the following installed on your local computer:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (version 12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/downloads)

## Local Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_ACTUAL_USERNAME/shyaw-administration-system.git
cd shyaw-administration-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database

1. Start PostgreSQL service on your computer
2. Create a new database:

```sql
-- Connect to PostgreSQL as superuser
createdb shyaw_admin
```

Or using PostgreSQL command line:
```bash
psql -U postgres
CREATE DATABASE shyaw_admin;
\q
```

#### Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/shyaw_admin

# JWT Secret (change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
NODE_ENV=development
PORT=5000
```

**Important**: Replace the database URL with your actual PostgreSQL credentials:
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `shyaw_admin`: Your database name

### 4. Database Migration

Push the database schema:

```bash
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

### 5. Create Admin User

The system requires an initial admin user. Run this command to create one:

```bash
npm run seed:admin
```

Or manually insert an admin user via SQL:

```sql
INSERT INTO users (username, email, password, first_name, last_name, role, status) 
VALUES ('admin', 'admin@shyaw.com', '$2b$12$v0vreM0M8QenNiyKhY0i6uhFv5baHPkBEU2BCY1gyoD6N0lHPTtpW', 'System', 'Administrator', 'admin', 'active');
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `password123`

### 6. Start the Application

Start the development server:

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Environment Setup

Create a production `.env` file:

```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@localhost:5432/shyaw_admin
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

### 3. Start Production Server

```bash
npm start
```

## Database Management

### Reset Database (Development Only)

To clear all data except users:

```bash
npm run db:reset
```

### Backup Database

```bash
pg_dump -U username shyaw_admin > backup.sql
```

### Restore Database

```bash
psql -U username shyaw_admin < backup.sql
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:reset` - Reset database (development only)

## Default Users

After installation, you can create additional users through the admin panel or use these test accounts:

**Admin Account:**
- Username: `admin`
- Password: `password123`
- Role: Admin (full access)

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   # On Windows (if using PostgreSQL service)
   net start postgresql-x64-12
   
   # On macOS (if using Homebrew)
   brew services start postgresql
   
   # On Linux
   sudo systemctl start postgresql
   ```

2. Check database credentials in `.env` file
3. Test database connection:
   ```bash
   psql -U username -d shyaw_admin -h localhost
   ```

### Port Already in Use

If port 5000 is already in use, change the PORT in `.env` file:

```env
PORT=3000
```

### Permission Issues

Ensure your PostgreSQL user has necessary permissions:

```sql
GRANT ALL PRIVILEGES ON DATABASE shyaw_admin TO username;
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt
- **Build Tools**: Vite (frontend), esbuild (backend)

## Support

For technical support or questions:

1. Check the troubleshooting section above
2. Review the application logs in the console
3. Ensure all prerequisites are properly installed
4. Verify database connection and credentials

## License

This project is proprietary software for Shyaw Administration System.