# Performance & Optimization - Interview Preparation

## Overview

This document covers performance optimization strategies: database query optimization, caching (Redis), API response optimization, frontend optimization, indexing, and connection pooling.

---

## Database Query Optimization

### Query Optimization Techniques

**1. Select Only Needed Fields**
```typescript
// Bad - Selects all fields
const users = await prisma.user.findMany();

// Good - Selects only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
  },
});
```

**2. Use Includes Wisely**
```typescript
// Only include relations when needed
const giftCard = await prisma.giftCard.findUnique({
  where: { id },
  include: {
    merchant: {
      select: {
        id: true,
        businessName: true,
      },
    },
  },
});
```

**3. Pagination**
```typescript
// Always paginate large result sets
const giftCards = await prisma.giftCard.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

**4. Use Indexes**
```prisma
// Index frequently queried fields
model GiftCard {
  code String @unique
  status GiftCardStatus
  
  @@index([merchantId])
  @@index([status])
  @@index([code])
}
```

---

### Indexing Strategy

**Indexes Created:**
- Primary keys (automatic)
- Foreign keys (for joins)
- Frequently queried fields
- Unique constraints

**Examples:**
```prisma
model GiftCard {
  merchantId String
  code String @unique
  status GiftCardStatus
  
  @@index([merchantId])  // Filter by merchant
  @@index([status])      // Filter by status
  @@index([code])         // Fast code lookup
}

model Payment {
  giftCardId String
  paymentIntentId String
  
  @@index([giftCardId])        // Payments per gift card
  @@index([paymentIntentId])   // Webhook lookup
}
```

**Query Performance:**
- Indexes speed up WHERE clauses
- Indexes speed up JOINs
- Indexes speed up ORDER BY

---

## Caching Strategy (Redis)

### Caching Patterns

**1. Cache-Aside Pattern**
```typescript
async getGiftCard(id: string) {
  // Check cache first
  const cached = await redis.get(`gift-card:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const giftCard = await prisma.giftCard.findUnique({
    where: { id },
  });
  
  // Store in cache
  await redis.set(`gift-card:${id}`, JSON.stringify(giftCard), 'EX', 3600);
  
  return giftCard;
}
```

**2. Write-Through Pattern**
```typescript
async updateGiftCard(id: string, data: UpdateData) {
  // Update database
  const giftCard = await prisma.giftCard.update({
    where: { id },
    data,
  });
  
  // Update cache
  await redis.set(`gift-card:${id}`, JSON.stringify(giftCard), 'EX', 3600);
  
  return giftCard;
}
```

**3. Cache Invalidation**
```typescript
async deleteGiftCard(id: string) {
  // Delete from database
  await prisma.giftCard.delete({ where: { id } });
  
  // Invalidate cache
  await redis.del(`gift-card:${id}`);
}
```

---

### Cache Keys

**Naming Convention:**
```
{resource}:{id}
{resource}:{merchantId}:{status}
{resource}:{merchantId}:list:{page}
```

**Examples:**
- `gift-card:123`
- `gift-card:merchant:456:ACTIVE`
- `gift-card:merchant:456:list:1`

---

### Cache TTL

**Time-to-Live:**
- **Frequently Updated:** 5-15 minutes
- **Rarely Updated:** 1-24 hours
- **Static Data:** 24+ hours

**Code Example:**
```typescript
// Short TTL for frequently updated data
await redis.set(`gift-card:${id}`, data, 'EX', 300); // 5 minutes

// Long TTL for static data
await redis.set(`template:${id}`, data, 'EX', 86400); // 24 hours
```

---

## API Response Optimization

### Response Compression

**Middleware:** compression

**Code Example:**
```typescript
import compression from 'compression';

app.use(compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses > 1KB
}));
```

**Benefits:**
- Reduces response size
- Faster transfer
- Better performance

---

### Response Pagination

**Always Paginate:**
```typescript
async listGiftCards(req: Request) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  
  const [data, total] = await Promise.all([
    prisma.giftCard.findMany({ skip: (page - 1) * limit, take: limit }),
    prisma.giftCard.count(),
  ]);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

**Benefits:**
- Prevents large responses
- Better performance
- Lower memory usage

---

### Field Selection

**Select Only Needed Fields:**
```typescript
// Bad - Returns all fields
const giftCards = await prisma.giftCard.findMany();

// Good - Returns only needed fields
const giftCards = await prisma.giftCard.findMany({
  select: {
    id: true,
    code: true,
    value: true,
    balance: true,
  },
});
```

**Benefits:**
- Smaller response size
- Faster queries
- Less data transfer

---

## Frontend Optimization

### Code Splitting

**Next.js Automatic Code Splitting:**
- Each route is a separate chunk
- Dynamic imports for large components
- Lazy loading for heavy libraries

**Code Example:**
```typescript
// Dynamic import
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Disable SSR if needed
});
```

---

### Image Optimization

**Next.js Image Component:**
```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority // For above-the-fold images
/>
```

**Benefits:**
- Automatic optimization
- Lazy loading
- Responsive images
- WebP format support

---

### Bundle Optimization

**Tree Shaking:**
- Remove unused code
- Import only needed functions

**Code Example:**
```typescript
// Bad - Imports entire library
import _ from 'lodash';

// Good - Imports only needed function
import debounce from 'lodash/debounce';
```

---

### Memoization

**React.memo:**
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive computation
  return <div>{processData(data)}</div>;
});
```

**useMemo:**
```typescript
const expensiveValue = useMemo(() => {
  return expensiveComputation(data);
}, [data]);
```

**useCallback:**
```typescript
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

---

## Database Connection Pooling

### Prisma Connection Pooling

**Configuration:**
```env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=20"
```

**Parameters:**
- `connection_limit`: Max connections (default: number of CPU cores + 1)
- `pool_timeout`: Connection timeout in seconds

**Benefits:**
- Reuse connections
- Better performance
- Resource efficiency

---

### Connection Management

**Prisma Handles:**
- Connection pooling
- Connection reuse
- Connection cleanup

**Best Practices:**
- Use single Prisma instance
- Don't create multiple Prisma clients
- Let Prisma manage connections

---

## Query Performance Monitoring

### Slow Query Logging

**Prisma Logging:**
```typescript
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log queries > 1 second
    logger.warn('Slow query', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

---

### Query Analysis

**EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT * FROM gift_cards WHERE merchant_id = '123' AND status = 'ACTIVE';
```

**Use to:**
- Identify slow queries
- Check index usage
- Optimize queries

---

## Interview Questions & Answers

### Q: How do you optimize database queries?

**A:** Database query optimization:
1. **Select Only Needed Fields:** Use `select` instead of fetching all fields
2. **Use Indexes:** Index frequently queried fields
3. **Pagination:** Always paginate large result sets
4. **Includes Wisely:** Only include relations when needed
5. **Connection Pooling:** Use Prisma's connection pooling

### Q: Explain your caching strategy.

**A:** Caching strategy:
1. **Redis:** In-memory cache for frequently accessed data
2. **Cache-Aside:** Check cache first, fetch from DB if miss
3. **Cache Keys:** Consistent naming convention
4. **TTL:** Appropriate time-to-live per data type
5. **Invalidation:** Invalidate on updates/deletes

Benefits: Reduces database load, faster responses.

### Q: How do you optimize frontend performance?

**A:** Frontend optimization:
1. **Code Splitting:** Next.js automatic code splitting
2. **Image Optimization:** Next.js Image component
3. **Bundle Optimization:** Tree shaking, dynamic imports
4. **Memoization:** React.memo, useMemo, useCallback
5. **Lazy Loading:** Lazy load heavy components

### Q: Explain connection pooling.

**A:** Connection pooling:
- **Purpose:** Reuse database connections
- **Configuration:** Set via DATABASE_URL parameters
- **Benefits:** Better performance, resource efficiency
- **Management:** Prisma handles connection pooling automatically

---

## Key Takeaways

1. **Database Optimization:** Select only needed fields, use indexes, paginate
2. **Caching:** Redis cache-aside pattern, appropriate TTL
3. **API Optimization:** Compression, pagination, field selection
4. **Frontend Optimization:** Code splitting, image optimization, memoization
5. **Connection Pooling:** Prisma handles automatically
6. **Monitoring:** Slow query logging, query analysis

---

*See other documents for scalability and deployment details.*
