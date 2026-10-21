# MiniLedger Deployment & Operations Guide

## 1. Containerization & Docker Compose

MiniLedger provides a production-grade multi-stage Dockerfile and Docker Compose configuration.

### Local Container Startup

```bash
# Build and run PostgreSQL and API services
docker compose up --build -d

# Check health and service logs
docker compose ps
docker compose logs -f api
```

---

## 2. Cloud Production Deployment Architecture (AWS)

```text
       Users / Mobile Client
                 │
                 ▼
     AWS Application Load Balancer (ALB)
          [HTTPS / ACM SSL]
                 │
                 ▼
       Amazon ECS Fargate (API)
  - Docker Container (services/api/Dockerfile)
  - Auto-scaling task definitions
  - Environment secrets pulled from AWS Secrets Manager
                 │
                 ▼
       Amazon RDS PostgreSQL
  - Multi-AZ Deployment
  - Automated daily snapshots
  - Committed Prisma schema migrations
```

---

## 3. Database Migration & Rollback Operations

### Applying Migrations in Production

Production pipelines execute migrations via:

```bash
npx prisma migrate deploy --schema=services/api/prisma/schema.prisma
```

This applies only pending migrations from `prisma/migrations` and never runs destructive resets or data wiping.

### Backup and Restore

```bash
# Backup
pg_dump -h <host> -U postgres -d miniledger -F c -b -v -f miniledger_backup.dump

# Restore
pg_restore -h <host> -U postgres -d miniledger -v miniledger_backup.dump
```

---

## 4. Mobile Production Builds (EAS)

1. Configure `app.json` with correct bundle identifiers and icons.
2. Build Android APK/AAB:

```bash
cd apps/mobile
npx eas-cli build --platform android --profile production
```

3. Build iOS IPA:

```bash
cd apps/mobile
npx eas-cli build --platform ios --profile production
```
