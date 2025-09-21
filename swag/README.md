# SWAG Reverse Proxy Setup

This directory contains the configuration for a SWAG reverse proxy using LinuxServer's SWAG container.

## Features

- **Wildcard SSL certificates** for `*.fzbw.ru` domain
- **Cloudflare DNS validation** for certificate generation
- **Hot-reloadable configuration** with auto-reload mod
- **Docker network integration** with `rustbot-main` network
- **Persistent volumes** for config and SSL certificates
- **Health checks** for container monitoring

## Setup Instructions

### 1. Configure Cloudflare Credentials

Copy the example environment file and add your Cloudflare credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Cloudflare credentials:

**Option A: API Key (Global API Key)**
```env
CF_API_EMAIL=your-email@cloudflare.com
CF_API_KEY=your-global-api-key
```

**Option B: API Token (Recommended)**
```env
CF_API_TOKEN=your-zone-edit-token
```

To create an API Token:
1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Create a Custom Token with:
   - Zone:Zone:Edit permissions
   - Zone Resources: Include specific zone (fzbw.ru)

### 2. Create the Docker Network

If the `rustbot-main` network doesn't exist, create it:

```bash
docker network create rustbot-main
```

### 3. Configure Proxy Rules

1. Copy sample configurations from `nginx/proxy-confs/`:
   ```bash
   cp nginx/proxy-confs/app.subdomain.conf.sample nginx/proxy-confs/app.subdomain.conf
   ```

2. Edit the configuration to match your service:
   - Update `server_name` to your desired subdomain
   - Update `$upstream_app` to your service name in the docker network
   - Update `$upstream_port` to your service port

### 4. Start SWAG

```bash
docker-compose up -d
```

### 5. Monitor Logs

```bash
docker-compose logs -f swag
```

## Directory Structure

```
swag/
├── docker-compose.yml          # Main SWAG configuration
├── .env.example               # Environment variables template
├── .env                      # Your actual environment variables (create this)
├── nginx/
│   ├── proxy-confs/          # Proxy configurations for subdomains
│   │   ├── *.conf.sample     # Example configurations
│   │   └── *.conf           # Active configurations (copy from samples)
│   └── site-confs/          # Custom nginx configurations
│       └── custom.conf      # Global nginx settings
└── README.md                # This file
```

## Hot Reload

The container is configured with auto-reload functionality. Any changes to nginx configuration files will automatically trigger a reload without restarting the container.

## Adding New Services

1. Create a new proxy configuration file in `nginx/proxy-confs/`:
   ```bash
   cp nginx/proxy-confs/app.subdomain.conf.sample nginx/proxy-confs/newservice.subdomain.conf
   ```

2. Edit the file to configure:
   - `server_name` (e.g., `newservice.fzbw.ru`)
   - `$upstream_app` (your service container name)
   - `$upstream_port` (your service port)

3. The configuration will be automatically reloaded.

## Volumes

- `swag-config`: Main SWAG configuration and certificates
- `swag-ssl`: SSL certificates (separate volume for easier backup)

## Security Features

- Automatic SSL certificate generation and renewal
- Security headers configured globally
- Rate limiting for API endpoints
- Gzip compression enabled
- Server version hiding

## Troubleshooting

1. **Certificate generation fails**: Check Cloudflare credentials in `.env`
2. **Service not accessible**: Verify the service is on the `rustbot-main` network
3. **Configuration not reloading**: Check nginx syntax with `docker exec swag nginx -t`

## Health Check

The container includes a health check that verifies HTTPS connectivity. Monitor with:

```bash
docker ps  # Check health status
docker-compose logs swag  # Check detailed logs
```