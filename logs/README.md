# RustBot Logging Stack (Grafana + Loki + Promtail)

This stack collects Docker container logs and lets you view them in Grafana at `https://logs.fzbw.ru` via the SWAG reverse proxy. Grafana, Loki, and Promtail run only on internal networks and are not exposed directly to the Internet.

## Components

- Grafana (UI) — provisioned with a Loki datasource
- Loki (log store)
- Promtail (log collector) — discovers Docker containers via docker.sock

## Networks

- `rustbot-main` (external): Shared with your app and SWAG for name resolution
- `logs-internal` (bridge): Internal network for this stack

## Requirements

- SWAG is running and serving `logs.fzbw.ru`
- The `rustbot-main` Docker network exists
- Windows PowerShell environment

## Setup

1. Create an env file:

```powershell
cd logs
Copy-Item .env.example .env
# Edit .env and set strong credentials
```

2. Start the stack:

```powershell
docker-compose up -d
```

3. Verify health:

```powershell
docker-compose ps
docker-compose logs loki -f
docker-compose logs promtail -f
```

4. Access Grafana via SWAG:

- URL: https://logs.fzbw.ru
- User: from .env (default admin)
- Password: from .env

## Enable log collection for services

Promtail keeps only containers with label `logging=enabled` and annotates with `logging_job` and compose labels. Make sure your docker-compose services include labels, for example:

```yaml
labels:
  logging: "enabled"
  logging_job: "rustbot-api"
```

I've already added labels to the database stack (postgres, pgadmin).

## Query examples in Grafana (LogQL)

- All logs from a service:
```
{job="docker-containers", service="postgres"}
```
- Errors across all containers:
```
{job="docker-containers"} |= "error" |~ `(?i)error|fail|exception`
```

## Notes

- No container ports are published; access is via SWAG only.
- If you change Grafana domain, update SWAG proxy file at `swag/nginx/proxy-confs/logs.subdomain.conf`.
- To remove, run:

```powershell
docker-compose down -v
```
