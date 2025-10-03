# Local Installation Guide - Shyaw Administration System

This guide will help you install and configure the Shyaw Administration System on your local computer.

**Important**: The application has been configured to work with local PostgreSQL installations using the standard PostgreSQL driver (pg). This is different from cloud-hosted Neon databases.

## Network Configuration

The application will be accessible at:
- **Local Network IP**: http://192.168.70.10:5000
- **Localhost**: http://localhost:5000

## Prerequisites

Ensure these are installed on your computer:

1. **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (version 12 or higher) - [Download](https://www.postgresql.org/download/)
3. **Git** - [Download](https://git-scm.com/downloads)

## Step-by-Step Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd shyaw-administration-system
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure PostgreSQL Database

#### 3.1 Start PostgreSQL Service

**On Windows:**
```bash
# Start PostgreSQL service
net start postgresql-x64-14
```

**On macOS:**
```bash
# Start PostgreSQL service
brew services start postgresql@14
```

**On Linux:**
```bash
# Start PostgreSQL service
sudo systemctl start postgresql
```

#### 3.2 Create Database

Open PostgreSQL command line:

```bash
# Connect to PostgreSQL
psql -U postgres
```

Create the database and set password:

```sql
-- Set the postgres user password
ALTER USER postgres WITH PASSWORD 'Hama10Kurd$$';

-- Create the database
CREATE DATABASE shyaw_admin;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE shyaw_admin TO postgres;

-- Exit psql
\q
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

The `.env` file should contain:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin

# JWT Secret
JWT_SECRET=shyaw-admin-jwt-secret-key-2024-secure

# Session Secret
SESSION_SECRET=shyaw-admin-session-secret-2024

# Optional: Logging Configuration
LOG_LEVEL=info
```

**Important Notes:**
- Database name: `shyaw_admin`
- Database password: `Hama10Kurd$$`
- PostgreSQL user: `postgres`

### Step 5: Setup Database Schema

Push the database schema to create all tables:

```bash
npm run db:push
```

This command will create all necessary tables in your PostgreSQL database.

### Step 6: Configure Network Access (Optional)

If you want to access the application from other devices on your network at `192.168.70.10:5000`:

#### 6.1 Set Static IP Address

**On Windows:**
1. Open Network Connections (Control Panel → Network and Internet → Network Connections)
2. Right-click your network adapter → Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" → Properties
4. Choose "Use the following IP address":
   - IP address: `192.168.70.10`
   - Subnet mask: `255.255.255.0`
   - Default gateway: `192.168.70.1` (your router IP)
   - Preferred DNS server: `8.8.8.8`

**On macOS:**
1. System Preferences → Network
2. Select your network connection → Advanced
3. Go to TCP/IP tab
4. Configure IPv4: Manually
   - IP Address: `192.168.70.10`
   - Subnet Mask: `255.255.255.0`
   - Router: `192.168.70.1`

**On Linux:**
```bash
# Edit network configuration (example for Ubuntu/Debian)
sudo nano /etc/netplan/01-netcfg.yaml
```

Add:
```yaml
network:
  version: 2
  ethernets:
    eth0:  # or your interface name
      addresses:
        - 192.168.70.10/24
      gateway4: 192.168.70.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Apply changes:
```bash
sudo netplan apply
```

#### 6.2 Configure Firewall

**Windows Firewall:**
```powershell
# Allow port 5000 through Windows Firewall
netsh advfirewall firewall add rule name="Shyaw Admin System" dir=in action=allow protocol=TCP localport=5000
```

**macOS Firewall:**
```bash
# Add firewall rule (if firewall is enabled)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

**Linux (ufw):**
```bash
# Allow port 5000
sudo ufw allow 5000/tcp
```

### Step 7: Start the Application

#### Development Mode

```bash
npm run dev
```

The application will start and be accessible at:
- http://localhost:5000
- http://192.168.70.10:5000 (if static IP is configured)

#### Production Mode

Build and start:

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Step 8: Create Admin User

After the application starts, you need to create an initial admin user.

**Option 1: Using SQL**

Connect to the database:
```bash
psql -U postgres -d shyaw_admin
```

Insert admin user (password: `admin123`):
```sql
INSERT INTO users (username, email, password, first_name, last_name, role, status) 
VALUES ('admin', 'admin@shyaw.com', '$2b$10$rXK8qLXN5yGHQH4K3F3JZeN9TvQ3Zx9jGQJZNZ8LvWGF3V9FQX1V2', 'System', 'Administrator', 'admin', 'active');
```

**Option 2: Using the Application**

If there's a seed script available:
```bash
npm run seed:admin
```

### Step 9: Access the Application

Open your web browser and navigate to:
- **http://192.168.70.10:5000** (from any device on your network)
- **http://localhost:5000** (from the local computer)

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`

## Troubleshooting

### Database Connection Errors

1. **Verify PostgreSQL is running:**
   ```bash
   # Windows
   sc query postgresql-x64-14
   
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Test database connection:**
   ```bash
   psql -U postgres -d shyaw_admin -h localhost
   ```

3. **Check if database exists:**
   ```bash
   psql -U postgres -l | grep shyaw_admin
   ```

### Cannot Access at 192.168.70.10:5000

1. **Verify IP address:**
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   # or
   ip addr
   ```

2. **Check if port 5000 is listening:**
   ```bash
   # Windows
   netstat -an | findstr :5000
   
   # macOS/Linux
   netstat -an | grep :5000
   # or
   lsof -i :5000
   ```

3. **Verify firewall settings** - Ensure port 5000 is allowed

### Port Already in Use

If port 5000 is occupied:

```bash
# Windows - Find process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# macOS/Linux - Find and kill process
lsof -ti:5000 | xargs kill -9
```

### Permission Errors

Ensure PostgreSQL user has proper permissions:

```sql
-- Connect as postgres superuser
psql -U postgres

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE shyaw_admin TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

## Database Management

### Backup Database

```bash
# Create backup
pg_dump -U postgres shyaw_admin > shyaw_admin_backup.sql

# With timestamp
pg_dump -U postgres shyaw_admin > shyaw_admin_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
psql -U postgres shyaw_admin < shyaw_admin_backup.sql
```

### Reset Database

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS shyaw_admin;"
psql -U postgres -c "CREATE DATABASE shyaw_admin;"

# Push schema again
npm run db:push
```

## Security Recommendations

1. **Change Default Passwords**: Update the admin password after first login
2. **Secure JWT Secrets**: Use strong, random values for JWT_SECRET and SESSION_SECRET
3. **Firewall Configuration**: Only allow port 5000 from trusted networks
4. **SSL/TLS**: Consider setting up HTTPS for production use
5. **Regular Backups**: Schedule automated database backups

## System Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 2GB
- Storage: 10GB free space
- Network: 100 Mbps

**Recommended:**
- CPU: 4 cores
- RAM: 4GB
- Storage: 20GB free space (SSD preferred)
- Network: 1 Gbps

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs in the console
3. Verify all configuration settings
4. Ensure PostgreSQL is running and accessible

---

**Installation Complete!** 🎉

Your Shyaw Administration System is now ready to use at http://192.168.70.10:5000
