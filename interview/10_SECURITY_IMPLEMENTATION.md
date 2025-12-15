# Security Implementation - Interview Preparation

## Overview

This document covers comprehensive security implementation: authentication security, authorization (RBAC), input validation, SQL injection prevention, XSS prevention, CSRF protection, rate limiting, fraud prevention, audit logging, and data encryption.

---

## Authentication Security

### Password Security

**Hashing:** bcrypt with 10 rounds

**Storage:** Never store plain text passwords

**Code Example:**
```typescript
// Hash password
const passwordHash = await bcrypt.hash(password, 10);

// Verify password
const isValid = await bcrypt.compare(password, user.passwordHash);
```

**Account Lockout:**
- 5 failed attempts → 30-minute lockout
- Tracks `failedLoginAttempts` and `lockedUntil`

---

### JWT Security

**Access Token:**
- Short expiration (15 minutes)
- Signed with `JWT_SECRET`
- Contains user ID, email, role

**Refresh Token:**
- Long expiration (30 days)
- Signed with `JWT_REFRESH_SECRET` (different secret)
- Stored in database
- Rotated on each refresh
- Can be revoked individually

**Token Storage:**
- Access token: Memory (not localStorage)
- Refresh token: HttpOnly cookie (preferred) or localStorage

---

## Authorization (RBAC)

### Role-Based Access Control

**Roles:**
- **ADMIN:** Full system access
- **MERCHANT:** Merchant-specific access
- **CUSTOMER:** Customer access

**Implementation:**
```typescript
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    
    next();
  };
};

// Usage
router.get('/admin/users', authenticate, authorize('ADMIN'), controller.listUsers);
```

---

### Resource-Level Authorization

**Merchant Isolation:**
- All queries filtered by `merchantId`
- Middleware ensures correct `merchantId` from auth
- No cross-tenant data access

**Code Example:**
```typescript
// Middleware adds merchantId to request
req.user.merchantId = req.user.id; // For merchants

// Service filters by merchantId
const giftCards = await prisma.giftCard.findMany({
  where: { merchantId: req.user.merchantId },
});
```

---

## Input Validation

### Zod Schema Validation

**Purpose:** Validate and sanitize all input

**Implementation:**
```typescript
const createGiftCardSchema = z.object({
  value: z.number().positive().max(10000),
  currency: z.string().length(3),
  recipientEmail: z.string().email().optional(),
});

// Middleware validates all requests
router.post('/gift-cards', validate(createGiftCardSchema), controller.create);
```

**Benefits:**
- Type safety
- Runtime validation
- Clear error messages
- Prevents invalid data

---

### Sanitization

**HTML Sanitization:**
- Sanitize user input before storing
- Prevent XSS attacks
- Use libraries like `DOMPurify` (frontend)

**SQL Sanitization:**
- Prisma handles parameterization
- No raw SQL strings
- Prevents SQL injection

---

## SQL Injection Prevention

### Prisma ORM

**How It Prevents SQL Injection:**
- **Parameterized Queries:** All queries use parameters
- **Type Safety:** TypeScript prevents string concatenation
- **Query Builder:** No raw SQL strings

**Code Example:**
```typescript
// Safe - Prisma handles parameterization
const user = await prisma.user.findUnique({
  where: { email: userEmail }, // Parameterized automatically
});

// Never do this (Prisma prevents it anyway)
// const query = `SELECT * FROM users WHERE email = '${email}'`;
```

**Raw SQL (if needed):**
```typescript
// Even raw SQL is parameterized
await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

---

## XSS Prevention

### Strategies

1. **Content Security Policy (CSP):** Via Helmet middleware
2. **Input Sanitization:** Zod validation, HTML sanitization
3. **Output Encoding:** React automatically escapes
4. **HttpOnly Cookies:** Prevents JavaScript access

**React Protection:**
- React automatically escapes content in JSX
- Prevents XSS by default
- Use `dangerouslySetInnerHTML` only when necessary (with sanitization)

**Code Example:**
```typescript
// Safe - React escapes automatically
<div>{userInput}</div>

// Dangerous - Only use with sanitization
<div dangerouslySetInnerHTML={{ __html: sanitize(userInput) }} />
```

---

## CSRF Protection

### Implementation

**Library:** csrf

**Mechanism:**
- Token generated per session
- Token stored in session (`csrfSecret`)
- Token delivered via cookie and header
- Token verified on state-changing requests

**Code Example:**
```typescript
// Generate CSRF token
export const generateCSRFToken = (req: Request, res: Response) => {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = tokens.secretSync();
  }
  
  const token = tokens.create(req.session.csrfSecret);
  
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Accessible to JavaScript
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  
  res.setHeader('X-CSRF-Token', token);
};

// Verify CSRF token
export const verifyCSRF = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.session?.csrfSecret;
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!tokens.verify(secret, token)) {
    throw new UnauthorizedError('Invalid CSRF token');
  }
  
  next();
};
```

---

## Rate Limiting

### Implementation

**Library:** express-rate-limit

**Strategies:**

1. **API Rate Limiter:**
   - Window: 15 minutes
   - Max: 5000 requests
   - Scope: All API endpoints

2. **Auth Rate Limiter:**
   - Window: 15 minutes
   - Max: 100 attempts
   - Scope: Login, register, password reset

3. **Payment Rate Limiter:**
   - Window: 1 minute
   - Max: 100 payments
   - Scope: Payment endpoints

**Code Example:**
```typescript
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.',
    },
  },
});
```

---

## Fraud Prevention

### Device Fingerprinting

**Purpose:** Track devices for fraud detection

**Data Collected:**
- IP address
- User agent
- Device type
- Device name

**Usage:**
- Stored with payments
- Used for fraud detection
- Tracked in RefreshToken model

---

### Fraud Blacklist

**Purpose:** Block known fraudulent entities

**Types:**
- Email addresses
- IP addresses
- Phone numbers
- Payment methods
- User IDs

**Implementation:**
```typescript
async checkBlacklist(type: BlacklistType, value: string): Promise<boolean> {
  const blacklist = await prisma.fraudBlacklist.findUnique({
    where: { type_value: { type, value } },
  });
  
  if (blacklist && (!blacklist.expiresAt || blacklist.expiresAt > new Date())) {
    return true; // Blocked
  }
  
  return false; // Not blocked
}
```

**Check Before Actions:**
- User registration
- Payment processing
- Login attempts

---

### Fraud Detection Logic

**Checks:**
- Multiple payments from same IP
- Unusual payment patterns
- Device fingerprint changes
- Velocity checks

**Code Example:**
```typescript
async performFraudCheck(customerId: string, ipAddress: string) {
  // Check blacklist
  if (await this.checkBlacklist('IP', ipAddress)) {
    throw new ValidationError('Blocked IP address');
  }
  
  // Check payment velocity
  const recentPayments = await prisma.payment.count({
    where: {
      customerId,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    },
  });
  
  if (recentPayments > 10) {
    throw new ValidationError('Too many payments in short time');
  }
  
  return { passed: true };
}
```

---

## Audit Logging

### Implementation

**Purpose:** Track all security-relevant actions

**Logged Events:**
- Login attempts (success/failure)
- Password changes
- 2FA enable/disable
- Payment creation
- Gift card creation/deletion
- Admin actions

**AuditLog Model:**
```prisma
model AuditLog {
  id           String   @id
  userId       String?
  userEmail    String?
  action       String   // LOGIN, PAYMENT_CREATED, etc.
  resourceType String   // User, Payment, GiftCard
  resourceId   String?
  ipAddress    String?
  userAgent    String?
  metadata     Json?
  createdAt    DateTime
}
```

**Code Example:**
```typescript
async logAction(action: string, resourceType: string, resourceId?: string) {
  await prisma.auditLog.create({
    data: {
      userId: req.user?.userId,
      userEmail: req.user?.email,
      action,
      resourceType,
      resourceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });
}
```

---

## Data Encryption

### Credential Encryption

**Purpose:** Encrypt sensitive credentials before storage

**Implementation:**
- Encrypt payment gateway credentials
- Store encrypted credentials in database
- Decrypt when needed

**Code Example:**
```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedText] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## Security Headers

### Helmet Middleware

**Headers Set:**
- **Content-Security-Policy:** Prevents XSS attacks
- **X-DNS-Prefetch-Control:** Controls DNS prefetching
- **X-Frame-Options:** Prevents clickjacking
- **X-Content-Type-Options:** Prevents MIME sniffing
- **Referrer-Policy:** Controls referrer information
- **Strict-Transport-Security:** Forces HTTPS

**Code Example:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

---

## Session Security

### Redis Session Store

**Configuration:**
- Secure cookies
- HttpOnly cookies
- SameSite attribute
- Session expiration

**Code Example:**
```typescript
app.use(session({
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // HTTPS only in production
    httpOnly: true, // Not accessible to JavaScript
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
```

---

## Interview Questions & Answers

### Q: How do you prevent SQL injection?

**A:** SQL injection prevention:
1. **Prisma ORM:** All queries parameterized
2. **Type Safety:** TypeScript prevents string concatenation
3. **Query Builder:** No raw SQL strings
4. **Input Validation:** Zod validates all input

Prisma automatically parameterizes all queries, preventing SQL injection.

### Q: Explain XSS prevention.

**A:** XSS prevention:
1. **CSP:** Content Security Policy via Helmet
2. **Input Sanitization:** Zod validation, HTML sanitization
3. **Output Encoding:** React automatically escapes
4. **HttpOnly Cookies:** Prevents JavaScript access

React automatically escapes content in JSX, preventing XSS by default.

### Q: How does CSRF protection work?

**A:** CSRF protection:
1. **Token Generation:** Server generates per session
2. **Token Storage:** Session (`csrfSecret`)
3. **Token Delivery:** Cookie and header
4. **Token Verification:** Verified on state-changing requests
5. **JWT Alternative:** JWT in headers provides some protection

Why needed: Prevents cross-site request forgery attacks.

### Q: Explain fraud prevention.

**A:** Fraud prevention:
1. **Device Fingerprinting:** Track devices
2. **Blacklist:** Block known fraudulent entities
3. **Velocity Checks:** Limit rapid transactions
4. **Pattern Detection:** Detect unusual patterns
5. **IP Tracking:** Track IP addresses

Checks performed before: Registration, payments, login.

---

## Key Takeaways

1. **Password Security:** bcrypt hashing, account lockout
2. **JWT Security:** Short-lived access tokens, rotated refresh tokens
3. **Authorization:** RBAC, resource-level authorization
4. **Input Validation:** Zod schema validation
5. **SQL Injection:** Prevented by Prisma ORM
6. **XSS Prevention:** CSP, sanitization, React escaping
7. **CSRF Protection:** Token-based protection
8. **Rate Limiting:** Multiple rate limiters
9. **Fraud Prevention:** Device fingerprinting, blacklist
10. **Audit Logging:** Complete audit trail

---

*See other documents for authentication details and payment security.*
