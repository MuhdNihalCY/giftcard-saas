# Scalability & Deployment - Interview Preparation

## Overview

This document covers horizontal scaling strategy, load balancing, database scaling, Redis clustering, queue scaling, Docker containerization, CI/CD pipeline, environment configuration, health checks, and monitoring.

---

## Horizontal Scaling Strategy

### Stateless API Design

**Key Principle:** API is stateless

**Why Stateless?**
- No server-side sessions (JWT tokens)
- No server-side state
- Any instance can handle any request
- Easy to scale horizontally

**Implementation:**
- JWT tokens (no server-side sessions)
- Redis for shared state (sessions, cache)
- Database for persistent state

---

### Scaling Backend

**Architecture:**
```
Load Balancer → [API Instance 1, API Instance 2, API Instance N]
```

**Steps:**
1. Deploy multiple API instances
2. Load balancer distributes requests
3. All instances share same database and Redis
4. Scale instances independently

**Benefits:**
- Handle more traffic
- Better availability
- Easy to scale up/down

---

## Load Balancing

### Load Balancer Configuration

**Strategies:**
- **Round Robin:** Distribute requests evenly
- **Least Connections:** Route to instance with fewest connections
- **IP Hash:** Route based on client IP (sticky sessions)

**Health Checks:**
- Check `/health` endpoint
- Remove unhealthy instances
- Add back when healthy

**Code Example:**
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

---

## Database Scaling

### Read Replicas

**Purpose:** Distribute read load

**Architecture:**
```
Primary Database (Writes) → Read Replica 1, Read Replica 2, ...
```

**Implementation:**
- Primary database for writes
- Read replicas for reads
- Prisma can use read replicas

**Code Example:**
```typescript
// Write to primary
const prismaWrite = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_PRIMARY },
  },
});

// Read from replica
const prismaRead = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_REPLICA },
  },
});
```

---

### Connection Pooling

**Configuration:**
```env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=20&pool_timeout=20"
```

**Best Practices:**
- Set appropriate connection limit
- Monitor connection usage
- Adjust based on load

---

### Database Indexing

**Critical for Performance:**
- Index frequently queried fields
- Index foreign keys
- Composite indexes for common queries

**See Performance Optimization document for details.**

---

## Redis Clustering

### Redis Cluster

**Purpose:** High availability and scalability

**Architecture:**
```
Redis Cluster (3+ nodes)
├── Node 1 (Master)
├── Node 2 (Master)
└── Node 3 (Master)
```

**Benefits:**
- High availability
- Horizontal scaling
- Data sharding

**Configuration:**
```typescript
import Redis from 'ioredis';

const redis = new Redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 },
]);
```

---

### Redis Sentinel

**Purpose:** High availability with automatic failover

**Architecture:**
```
Redis Master → Redis Sentinel (monitors master)
├── Redis Replica 1
└── Redis Replica 2
```

**Benefits:**
- Automatic failover
- High availability
- No single point of failure

---

## Queue Scaling

### Worker Scaling

**Multiple Workers:**
- Deploy multiple worker instances
- Each worker processes jobs independently
- Scale workers based on queue length

**Configuration:**
```typescript
const worker = new Worker('gift-card-expiry', processJob, {
  concurrency: 5, // Process 5 jobs concurrently per worker
});
```

**Scaling:**
- Monitor queue length
- Add workers when queue grows
- Remove workers when queue empty

---

### Queue Monitoring

**Metrics:**
- Jobs waiting
- Jobs active
- Jobs completed
- Jobs failed

**Alerting:**
- Alert when queue length > threshold
- Alert on high failure rate
- Alert on worker downtime

---

## Docker Containerization

### Dockerfile

**Multi-stage Build:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 8000
CMD ["node", "dist/server.js"]
```

**Benefits:**
- Smaller image size
- Faster builds
- Better security

---

### Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## CI/CD Pipeline

### GitHub Actions

**Workflow:**
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t app:latest .

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment steps
```

---

### Deployment Strategy

**Blue-Green Deployment:**
1. Deploy new version (green)
2. Test new version
3. Switch traffic to green
4. Keep blue as backup
5. Remove blue after verification

**Rolling Deployment:**
1. Deploy to subset of instances
2. Gradually roll out to all instances
3. Monitor for issues
4. Rollback if needed

---

## Environment Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=...
PAYPAL_CLIENT_ID=...
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
NEXT_PUBLIC_BACKEND_URL=https://api.example.com
```

**Secrets Management:**
- Use environment variables
- Never commit secrets
- Use secret management service (AWS Secrets Manager, etc.)

---

## Health Checks

### Health Check Endpoint

**Implementation:**
```typescript
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
  
  const healthy = Object.values(checks).every(v => v === true);
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
  });
});

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
```

---

### Readiness vs Liveness

**Liveness Probe:**
- Checks if application is running
- Simple endpoint check
- Restart if unhealthy

**Readiness Probe:**
- Checks if application is ready to serve traffic
- Checks dependencies (database, Redis)
- Remove from load balancer if not ready

---

## Monitoring Strategy

### Application Monitoring

**Metrics:**
- Request rate
- Response time
- Error rate
- CPU usage
- Memory usage

**Tools:**
- **APM:** New Relic, Datadog, Sentry
- **Logging:** Winston, Pino
- **Metrics:** Prometheus, Grafana

---

### Logging

**Structured Logging:**
```typescript
logger.info('Payment created', {
  paymentId: payment.id,
  amount: payment.amount,
  merchantId: payment.merchantId,
});
```

**Log Levels:**
- **error:** Errors that need attention
- **warn:** Warnings
- **info:** Informational messages
- **debug:** Debug information

---

### Alerting

**Alerts:**
- High error rate
- High response time
- Low availability
- Queue backup
- Database connection issues

**Notification Channels:**
- Email
- Slack
- PagerDuty

---

## Interview Questions & Answers

### Q: How would you scale this system?

**A:** Scaling strategy:
1. **Horizontal Scaling:** Multiple API instances behind load balancer
2. **Database:** Read replicas for read-heavy workloads
3. **Redis:** Redis Cluster for high availability
4. **Queue:** Multiple workers, scale based on queue length
5. **Frontend:** CDN for static assets, cached SSR

Key: Stateless API enables horizontal scaling.

### Q: Explain your deployment strategy.

**A:** Deployment:
1. **CI/CD:** GitHub Actions for testing and building
2. **Docker:** Containerized applications
3. **Blue-Green:** Zero-downtime deployments
4. **Health Checks:** Monitor application health
5. **Rollback:** Quick rollback if issues

### Q: How do you handle database scaling?

**A:** Database scaling:
1. **Read Replicas:** Distribute read load
2. **Connection Pooling:** Efficient connection management
3. **Indexing:** Proper indexes for performance
4. **Query Optimization:** Optimize slow queries
5. **Future:** Consider sharding if needed

### Q: Explain Redis clustering.

**A:** Redis clustering:
- **Purpose:** High availability and scalability
- **Architecture:** Multiple Redis nodes
- **Benefits:** No single point of failure, horizontal scaling
- **Configuration:** Redis Cluster or Sentinel

---

## Key Takeaways

1. **Horizontal Scaling:** Stateless API enables scaling
2. **Load Balancing:** Distribute traffic across instances
3. **Database Scaling:** Read replicas, connection pooling
4. **Redis Clustering:** High availability, scalability
5. **Queue Scaling:** Multiple workers, independent scaling
6. **Docker:** Containerized deployments
7. **CI/CD:** Automated testing and deployment
8. **Monitoring:** Health checks, metrics, alerting

---

*See other documents for performance optimization and architecture details.*
