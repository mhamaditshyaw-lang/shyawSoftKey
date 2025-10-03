# Installation Checklist

Use this checklist to ensure proper installation of the Shyaw Administration System.

## Pre-Installation

- [ ] Node.js (v18+) installed
- [ ] PostgreSQL (v12+) installed
- [ ] Git installed
- [ ] Administrator/sudo privileges available

## Database Configuration

- [ ] PostgreSQL service is running
- [ ] Database `shyaw_admin` created
- [ ] PostgreSQL user password set to `Hama10Kurd$$`
- [ ] Database privileges granted to postgres user

## Application Setup

- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created from `.env.example`
- [ ] `.env` file contains correct database credentials:
  ```
  DATABASE_URL=postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin
  ```
- [ ] Database schema pushed (`npm run db:push`)

## Network Configuration (Optional)

- [ ] Static IP address 192.168.70.10 configured on network adapter
- [ ] Subnet mask set to 255.255.255.0
- [ ] Default gateway configured (usually 192.168.70.1)
- [ ] Firewall rule added for port 5000

## Verification

- [ ] Application starts without errors (`npm run dev`)
- [ ] Application accessible at http://localhost:5000
- [ ] Application accessible at http://192.168.70.10:5000 (if static IP configured)
- [ ] Admin user created
- [ ] Can login with admin credentials

## Quick Setup Commands

### Windows
```batch
# Run the automated setup
setup-windows.bat

# Manual setup
npm install
copy .env.example .env
# Edit .env file
npm run db:push
npm run dev
```

### macOS/Linux
```bash
# Run the automated setup
./setup-unix.sh

# Manual setup
npm install
cp .env.example .env
# Edit .env file
npm run db:push
npm run dev
```

## Database Connection String Format

```
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

For this installation:
- user: postgres
- password: Hama10Kurd$$
- host: localhost
- port: 5432
- database: shyaw_admin
```

## Access URLs

- **Local Computer**: http://localhost:5000
- **Network Access**: http://192.168.70.10:5000
- **API Endpoint**: http://localhost:5000/api or http://192.168.70.10:5000/api

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Database connection failed | Verify PostgreSQL is running and credentials are correct |
| Port 5000 in use | Change PORT in .env or kill process using port 5000 |
| Cannot access at 192.168.70.10 | Configure static IP and check firewall settings |
| npm install fails | Delete node_modules and package-lock.json, run npm install again |
| Database schema errors | Run `npm run db:push --force` to force schema update |

## Support Files

- `LOCAL_INSTALLATION.md` - Complete installation guide
- `README.md` - Project documentation
- `.env.example` - Environment variable template
- `setup-windows.bat` - Windows setup script
- `setup-unix.sh` - macOS/Linux setup script

---

**Note**: Always keep your database credentials secure and never commit `.env` file to version control.
