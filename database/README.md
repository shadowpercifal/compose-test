# Database Setup - PostgreSQL + pgAdmin

This directory contains the configuration for PostgreSQL database and pgAdmin management interface.

## Features

- **PostgreSQL 15** with Alpine Linux (lightweight)
- **pgAdmin 4** web interface for database management
- **Reverse proxy integration** with SWAG (accessible at https://pgadmin.fzbw.ru)
- **Docker network integration** with `rustbot-main` network
- **Health checks** for both services
- **Persistent volumes** for database data and pgAdmin settings
- **Auto-configuration** with pre-configured server connection

## Setup Instructions

### 1. Configure Environment Variables

Copy the example environment file and set your passwords:

```bash
cp .env.example .env
```

Edit `.env` and update:
```env
POSTGRES_PASSWORD=your-secure-password-here
PGADMIN_PASSWORD=your-admin-password-here
```

### 2. Update pgAdmin Password File

Edit `pgadmin/pgpass` and replace the password:
```
postgres:5432:rustbot:rustbot:your-secure-password-here
postgres:5432:*:rustbot:your-secure-password-here
```

### 3. Ensure Docker Network Exists

```bash
docker network create rustbot-main
```

### 4. Start Database Services

```bash
docker-compose up -d
```

### 5. Configure SWAG Proxy (if not already done)

The pgAdmin proxy configuration is already created at:
`../swag/nginx/proxy-confs/pgadmin.subdomain.conf`

Make sure SWAG is running to access pgAdmin via the web.

## Access Information

### PostgreSQL Database
- **Host**: `rustbot-postgres` (from other containers in rustbot-main network)
- **Port**: `5432`
- **Database**: `rustbot`
- **Username**: `rustbot`
- **Password**: (set in .env file)

### pgAdmin Web Interface
- **URL**: https://pgadmin.fzbw.ru (via SWAG proxy)
- **Direct access**: http://localhost:8080 (if port mapping enabled)
- **Email**: admin@rustbot.local (or set in .env)
- **Password**: (set in .env file)

## Directory Structure

```
database/
├── docker-compose.yml          # Main database services configuration
├── .env.example               # Environment variables template
├── .env                      # Your actual environment variables (create this)
├── init/                     # PostgreSQL initialization scripts
│   └── 01-init.sql          # Initial database schema
├── pgadmin/                  # pgAdmin configuration
│   ├── servers.json         # Pre-configured server connections
│   └── pgpass              # Password file for auto-login
└── README.md                # This file
```

## Networks

- **rustbot-main**: External network for communication with other services
- **database-internal**: Internal network for database communication

## Volumes

- **postgres-data**: PostgreSQL data directory
- **pgadmin-data**: pgAdmin configuration and session data

## Initial Database Schema

The setup includes a sample schema with:
- `users` table with common fields
- Automatic `updated_at` timestamp trigger
- Email index for performance

You can customize the initialization by editing `init/01-init.sql`.

## Connection Examples

### From Node.js Application
```javascript
const pg = require('pg');
const client = new pg.Client({
  host: 'rustbot-postgres',
  port: 5432,
  database: 'rustbot',
  user: 'rustbot',
  password: process.env.POSTGRES_PASSWORD
});
```

### From Rust Application
```toml
# Cargo.toml
[dependencies]
tokio-postgres = "0.7"
```

```rust
use tokio_postgres::{NoTls, Error};

#[tokio::main]
async fn main() -> Result<(), Error> {
    let (client, connection) = tokio_postgres::connect(
        "host=rustbot-postgres user=rustbot dbname=rustbot password=your-password",
        NoTls,
    ).await?;
    
    // Handle connection...
    Ok(())
}
```

### Environment Variables for Applications
```env
DATABASE_URL=postgresql://rustbot:your-password@rustbot-postgres:5432/rustbot
```

## Backup and Restore

### Create Backup
```bash
docker exec rustbot-postgres pg_dump -U rustbot rustbot > backup.sql
```

### Restore Backup
```bash
cat backup.sql | docker exec -i rustbot-postgres psql -U rustbot rustbot
```

## Monitoring

### Check Service Health
```bash
docker-compose ps
docker-compose logs postgres
docker-compose logs pgadmin
```

### Check Database Status
```bash
docker exec rustbot-postgres pg_isready -U rustbot -d rustbot
```

## Security Notes

1. **Change default passwords** in production
2. **Use strong passwords** for database and pgAdmin
3. **Consider restricting pgAdmin access** to specific IP ranges
4. **Enable SSL** for database connections in production
5. **Regular backups** are recommended

## Troubleshooting

1. **Connection refused**: Check if services are running and networks are correct
2. **pgAdmin login fails**: Verify PGADMIN_PASSWORD in .env matches what you're using
3. **Database authentication fails**: Check POSTGRES_PASSWORD and pgpass file
4. **Can't access via domain**: Ensure SWAG is running and DNS is configured