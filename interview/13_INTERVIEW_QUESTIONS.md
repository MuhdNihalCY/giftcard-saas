# Common Interview Questions - Interview Preparation

## Overview

This document covers common interview questions about the Gift Card SaaS Platform, organized by topic.

---

## System Design Questions

### Q: How would you scale this system to handle 1 million concurrent users?

**A:** Scaling strategy:

1. **Horizontal Scaling:**
   - Deploy multiple API instances (10-20+)
   - Load balancer distributes traffic
   - Stateless API enables easy scaling

2. **Database:**
   - Read replicas (5-10 replicas)
   - Connection pooling (20-50 connections per instance)
   - Proper indexing
   - Consider sharding if needed

3. **Redis:**
   - Redis Cluster (3+ nodes)
   - Caching frequently accessed data
   - Session storage

4. **Queue:**
   - Multiple workers (10-20 workers)
   - Scale workers based on queue length
   - Process jobs asynchronously

5. **Frontend:**
   - CDN for static assets
   - Cached server-side rendering
   - Client-side routing

6. **Monitoring:**
   - Real-time metrics
   - Auto-scaling based on load
   - Alerting for issues

**Key Points:**
- Stateless API is critical for horizontal scaling
- Database read replicas handle read-heavy workloads
- Caching reduces database load
- Queue system handles async operations

---

### Q: Explain the payment flow end-to-end.

**A:** Payment flow:

1. **Client Request:**
   - Customer selects gift card
   - Client creates payment request
   - Amount, payment method, gift card ID

2. **Backend Processing:**
   - Validate gift card
   - Calculate commission
   - Check merchant gateway preference
   - Create payment intent with gateway
   - Store payment record (PENDING)

3. **Gateway Interaction:**
   - Return payment intent/client secret
   - Client completes payment on gateway
   - Gateway processes payment

4. **Webhook:**
   - Gateway sends webhook
   - Verify webhook signature
   - Update payment status (COMPLETED/FAILED)
   - Activate gift card if successful
   - Schedule delivery

5. **Completion:**
   - Gift card activated
   - Delivery scheduled
   - Customer notified

**Key Points:**
- Idempotency prevents duplicate processing
- Webhook security via signature verification
- Payment state machine (PENDING → COMPLETED/FAILED)
- Commission calculated before payment

---

### Q: How does multi-tenancy work in this system?

**A:** Multi-tenancy implementation:

1. **Data-Level Isolation:**
   - Single database
   - Every table has `merchantId` column
   - All queries filtered by `merchantId`

2. **Authentication:**
   - JWT token contains user ID and role
   - Middleware extracts `merchantId` from user
   - All queries automatically filtered

3. **Security:**
   - Middleware ensures correct `merchantId`
   - No cross-tenant data access possible
   - Database-level constraints

4. **Benefits:**
   - Simpler than separate databases
   - Better performance than schema-per-tenant
   - Easier migrations
   - Cost-effective

**Alternatives Considered:**
- Separate databases: More complex, higher cost
- Schema per tenant: Complex migrations, connection pooling issues

**Why This Approach:**
- Simpler implementation
- Better performance
- Easier maintenance
- Sufficient for current scale

---

## Architecture Questions

### Q: Why did you choose a monolith over microservices?

**A:** Monolith chosen because:

1. **Team Size:** Small team, monolith easier to manage
2. **Simplicity:** Easier development, testing, deployment
3. **Performance:** No network overhead between services
4. **Transactions:** Easier to maintain ACID across features
5. **Current Scale:** Not at scale where microservices needed

**Future Consideration:**
- Can split into microservices when:
  - Team grows significantly
  - Clear service boundaries emerge
  - Different services need independent scaling

**Trade-offs:**
- Pros: Simpler, faster development, easier testing
- Cons: Harder to scale individual services, tighter coupling

---

### Q: Explain your backend architecture pattern.

**A:** Modified MVC pattern:

1. **Routes Layer:**
   - Define API endpoints
   - Apply middleware (auth, validation, rate limiting)
   - Route to controllers

2. **Controllers Layer:**
   - Handle HTTP requests/responses
   - Extract request data
   - Call services
   - Format responses

3. **Services Layer:**
   - Business logic
   - Data validation
   - Database operations
   - External API calls

4. **Database Layer (Prisma):**
   - Data access
   - Query building
   - Type-safe operations

**Benefits:**
- Clear separation of concerns
- Easy to test each layer
- Reusable services
- Maintainable codebase

---

## Database Questions

### Q: Why PostgreSQL over MongoDB?

**A:** PostgreSQL chosen because:

1. **ACID Compliance:** Critical for financial transactions
2. **Relational Data:** Complex relationships (users, gift cards, payments)
3. **Data Integrity:** Foreign keys, constraints ensure consistency
4. **Decimal Precision:** Accurate financial calculations
5. **JSON Support:** Still get flexibility with JSON fields

**MongoDB Limitations:**
- No ACID guarantees
- No joins
- Eventual consistency
- Not suitable for payment processing

**When MongoDB Would Be Better:**
- Document-based data
- Flexible schema requirements
- High write throughput
- Not financial transactions

---

### Q: Explain your indexing strategy.

**A:** Indexing strategy:

1. **Primary Keys:** All models have UUID primary keys (automatic index)

2. **Foreign Keys:** All foreign keys indexed for joins

3. **Frequently Queried Fields:**
   - `GiftCard.code` - Fast code lookup
   - `GiftCard.status` - Filter active cards
   - `Payment.paymentIntentId` - Webhook matching
   - `Transaction.type` - Filter by type

4. **Composite Indexes:** For common query patterns

**Query Optimization:**
- Indexes speed up WHERE clauses
- Indexes speed up JOINs
- Indexes speed up ORDER BY

**Monitoring:**
- Use EXPLAIN ANALYZE to check index usage
- Monitor slow queries
- Add indexes based on query patterns

---

## Security Questions

### Q: How do you prevent SQL injection?

**A:** SQL injection prevention:

1. **Prisma ORM:** All queries parameterized automatically
2. **Type Safety:** TypeScript prevents string concatenation
3. **Query Builder:** No raw SQL strings
4. **Input Validation:** Zod validates all input

**Code Example:**
```typescript
// Safe - Prisma handles parameterization
const user = await prisma.user.findUnique({
  where: { email: userEmail }, // Parameterized automatically
});

// Never do this (Prisma prevents it anyway)
// const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**Why This Works:**
- Prisma uses parameterized queries
- Database driver handles escaping
- No user input in SQL strings

---

### Q: Explain your authentication and authorization.

**A:** Authentication and authorization:

1. **Authentication (JWT):**
   - Access token (15 minutes)
   - Refresh token (30 days, rotated)
   - Token stored in database for revocation

2. **Authorization (RBAC):**
   - Roles: ADMIN, MERCHANT, CUSTOMER
   - Middleware checks role
   - Resource-level authorization (merchantId)

3. **2FA (Optional):**
   - TOTP-based
   - Backup codes
   - QR code setup

**Security Features:**
- Password hashing (bcrypt)
- Account lockout (5 attempts)
- Token rotation
- Device tracking

---

## Technology Choice Questions

### Q: Why Node.js over Python/Java?

**A:** Node.js chosen because:

1. **Unified Stack:** Same language (TypeScript) for frontend and backend
2. **Non-blocking I/O:** Perfect for payment gateway API calls
3. **Ecosystem:** Largest package registry
4. **Performance:** Fast execution for web APIs
5. **Real-time:** Built-in WebSocket support

**When Python Would Be Better:**
- Data processing, ML/AI
- Scientific computing
- Different use case

**When Java Would Be Better:**
- Enterprise applications
- Large teams
- Different requirements

---

### Q: Why Express.js over NestJS?

**A:** Express.js chosen because:

1. **Flexibility:** Unopinionated, allows custom architecture
2. **Simplicity:** Less boilerplate, easier to understand
3. **Ecosystem:** Largest middleware ecosystem
4. **Control:** Full control over architecture patterns

**NestJS Benefits:**
- Built-in TypeScript
- Dependency injection
- More structure

**Why Express:**
- More flexibility
- Simpler for this use case
- Team familiarity

---

### Q: Why Next.js App Router?

**A:** Next.js App Router chosen because:

1. **Server Components:** Better performance, SEO
2. **File-based Routing:** Intuitive routing structure
3. **Built-in Features:** Image optimization, code splitting
4. **Modern:** Latest React features support
5. **Production Ready:** Optimized builds

**Alternatives:**
- Pages Router: Older routing
- Create React App: No SSR
- Vite: More configuration needed

---

## Feature Implementation Questions

### Q: How does gift card redemption work?

**A:** Redemption flow:

1. **Validation:**
   - Validate gift card code
   - Check gift card status (must be ACTIVE)
   - Check balance

2. **Processing:**
   - Calculate redemption amount
   - Update balance
   - Update status if balance reaches 0

3. **Records:**
   - Create redemption record
   - Create transaction record
   - Log redemption method

4. **Methods:**
   - QR code scan
   - Code entry
   - Link click
   - API call

**Partial Redemption:**
- Supported if `allowPartialRedemption` is true
- Multiple redemptions allowed
- Balance tracked per redemption

---

### Q: Explain the delivery system.

**A:** Delivery system:

1. **Channels:**
   - Email (template-based)
   - SMS (template-based)
   - Link (shareable link)

2. **Implementation:**
   - Queue-based (BullMQ)
   - Async delivery
   - Retry mechanism

3. **Scheduled Delivery:**
   - Can schedule future delivery
   - Queue job with delay
   - Delivery on specified date/time

4. **Templates:**
   - Reusable email/SMS templates
   - Customizable design
   - Variable substitution

**Benefits:**
- Non-blocking API
- Reliable delivery
- Retry on failure
- Scheduled delivery support

---

## Performance Questions

### Q: How do you optimize database queries?

**A:** Database optimization:

1. **Select Only Needed Fields:** Use `select` instead of fetching all
2. **Use Indexes:** Index frequently queried fields
3. **Pagination:** Always paginate large result sets
4. **Includes Wisely:** Only include relations when needed
5. **Connection Pooling:** Use Prisma's connection pooling

**Example:**
```typescript
// Bad
const users = await prisma.user.findMany();

// Good
const users = await prisma.user.findMany({
  select: { id: true, email: true },
  take: 20,
  skip: 0,
});
```

---

### Q: Explain your caching strategy.

**A:** Caching strategy:

1. **Redis:** In-memory cache
2. **Cache-Aside Pattern:** Check cache first, fetch from DB if miss
3. **Cache Keys:** Consistent naming convention
4. **TTL:** Appropriate time-to-live per data type
5. **Invalidation:** Invalidate on updates/deletes

**Benefits:**
- Reduces database load
- Faster responses
- Better performance

---

## Problem-Solving Scenarios

### Q: How would you handle a payment gateway outage?

**A:** Handling gateway outage:

1. **Detection:**
   - Monitor gateway health
   - Detect failures quickly
   - Alert team

2. **Fallback:**
   - Switch to alternative gateway
   - Retry with exponential backoff
   - Queue payments for later processing

3. **User Experience:**
   - Show error message
   - Suggest alternative payment method
   - Allow retry

4. **Recovery:**
   - Process queued payments when gateway recovers
   - Notify users of successful payments
   - Update payment status

**Prevention:**
- Multiple payment gateways
- Health checks
- Automatic failover

---

### Q: How would you handle a database connection issue?

**A:** Handling database issues:

1. **Connection Pooling:**
   - Prisma handles connection pooling
   - Retry failed connections
   - Connection timeout

2. **Error Handling:**
   - Catch connection errors
   - Return appropriate error to client
   - Log errors for monitoring

3. **Fallback:**
   - Use cached data if available
   - Queue operations for later
   - Graceful degradation

4. **Recovery:**
   - Automatic reconnection
   - Process queued operations
   - Health checks

**Prevention:**
- Proper connection pooling
- Database monitoring
- Read replicas for redundancy

---

## Key Takeaways

1. **System Design:** Understand scaling, architecture, trade-offs
2. **Technology Choices:** Know why each technology was chosen
3. **Security:** Understand authentication, authorization, prevention
4. **Features:** Know how each feature works end-to-end
5. **Performance:** Understand optimization strategies
6. **Problem Solving:** Think through edge cases and failures

---

*See other documents for detailed technical explanations.*
