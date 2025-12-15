# API Design - Interview Preparation

## Overview

This document covers RESTful API design principles, route structure, request/response patterns, validation, pagination, and error handling.

---

## RESTful API Principles

### Why REST?

**Benefits:**
- **Simplicity:** Easy to understand and use
- **Stateless:** Each request contains all information
- **Cacheable:** HTTP caching works well
- **Standard:** Uses standard HTTP methods
- **Tooling:** Excellent tooling support

**Alternatives Considered:**
- **GraphQL:** More complex, harder caching, overkill for this use case
- **gRPC:** Binary protocol, less web-friendly
- **SOAP:** XML-based, more verbose

---

## API Structure

### Base URL

```
https://api.example.com/api/v1
```

**Versioning:** `/v1` for future compatibility

### Route Modules (25+)

1. **Auth Routes** (`/auth`)
   - POST `/auth/register`
   - POST `/auth/login`
   - POST `/auth/refresh`
   - POST `/auth/logout`
   - GET `/auth/profile`

2. **Gift Card Routes** (`/gift-cards`)
   - GET `/gift-cards` (list)
   - POST `/gift-cards` (create)
   - GET `/gift-cards/:id` (get one)
   - PUT `/gift-cards/:id` (update)
   - DELETE `/gift-cards/:id` (delete)

3. **Payment Routes** (`/payments`)
   - POST `/payments` (create)
   - POST `/payments/:id/confirm` (confirm)
   - POST `/payments/:id/refund` (refund)
   - GET `/payments` (list)

4. **Redemption Routes** (`/redemptions`)
   - POST `/redemptions` (redeem)
   - GET `/redemptions` (list)

5. **Product Routes** (`/gift-card-products`)
   - GET `/gift-card-products` (list)
   - POST `/gift-card-products` (create)
   - GET `/gift-card-products/:id` (get one)
   - PUT `/gift-card-products/:id` (update)
   - DELETE `/gift-card-products/:id` (delete)

6. **Template Routes** (`/templates`)
   - GET `/templates` (list)
   - POST `/templates` (create)
   - GET `/templates/:id` (get one)
   - PUT `/templates/:id` (update)
   - DELETE `/templates/:id` (delete)

7. **Delivery Routes** (`/delivery`)
   - POST `/delivery/send` (send gift card)
   - GET `/delivery/status/:id` (get status)

8. **Payout Routes** (`/payouts`)
   - GET `/payouts` (list)
   - POST `/payouts/request` (request payout)
   - GET `/payouts/:id` (get one)

9. **Analytics Routes** (`/analytics`)
   - GET `/analytics/sales` (sales analytics)
   - GET `/analytics/redemptions` (redemption analytics)

10. **Admin Routes** (`/admin/*`)
    - Admin-specific endpoints

... and 15+ more route modules

---

## HTTP Methods

### Usage

- **GET:** Retrieve resources
- **POST:** Create resources
- **PUT:** Update entire resource
- **PATCH:** Partial update
- **DELETE:** Delete resource

**Example:**
```
GET    /api/v1/gift-cards        # List gift cards
POST   /api/v1/gift-cards        # Create gift card
GET    /api/v1/gift-cards/:id    # Get gift card
PUT    /api/v1/gift-cards/:id    # Update gift card
DELETE /api/v1/gift-cards/:id    # Delete gift card
```

---

## Request/Response Patterns

### Request Format

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
X-CSRF-Token: <csrf_token>
```

**Body (JSON):**
```json
{
  "value": 100.00,
  "currency": "USD",
  "expiryDate": "2024-12-31"
}
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "value": 100.00,
    "currency": "USD"
  },
  "message": "Gift card created successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "value",
        "message": "Value must be positive"
      }
    ]
  }
}
```

**Pagination Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## HTTP Status Codes

### Usage

- **200 OK:** Successful GET, PUT, PATCH
- **201 Created:** Successful POST
- **204 No Content:** Successful DELETE
- **400 Bad Request:** Validation error
- **401 Unauthorized:** Authentication required
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource conflict
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error

**Code Example:**
```typescript
// Success
res.status(201).json({
  success: true,
  data: giftCard,
});

// Validation error
res.status(400).json({
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
  },
});

// Not found
res.status(404).json({
  success: false,
  error: {
    code: 'NOT_FOUND',
    message: 'Gift card not found',
  },
});
```

---

## Input Validation

### Zod Schema Validation

**Purpose:** Validate and sanitize input

**Implementation:**
```typescript
import { z } from 'zod';

const createGiftCardSchema = z.object({
  value: z.number().positive().max(10000),
  currency: z.string().length(3),
  expiryDate: z.date().optional(),
  recipientEmail: z.string().email().optional(),
});

// Middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Validation failed', error.errors);
      }
      next(error);
    }
  };
};

// Usage
router.post('/gift-cards', validate(createGiftCardSchema), controller.create);
```

**Benefits:**
- Type safety
- Runtime validation
- Clear error messages
- Automatic type inference

---

## Pagination

### Implementation

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Code Example:**
```typescript
async listGiftCards(req: Request) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;
  
  const [giftCards, total] = await Promise.all([
    prisma.giftCard.findMany({
      where: { merchantId: req.user.merchantId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.giftCard.count({
      where: { merchantId: req.user.merchantId },
    }),
  ]);
  
  return {
    data: giftCards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Filtering & Sorting

### Filtering

**Query Parameters:**
- `status`: Filter by status
- `minValue`: Minimum value
- `maxValue`: Maximum value
- `createdAfter`: Created after date
- `createdBefore`: Created before date

**Code Example:**
```typescript
const where: Prisma.GiftCardWhereInput = {
  merchantId: req.user.merchantId,
};

if (req.query.status) {
  where.status = req.query.status as GiftCardStatus;
}

if (req.query.minValue) {
  where.value = { gte: parseFloat(req.query.minValue as string) };
}

if (req.query.maxValue) {
  where.value = { ...where.value, lte: parseFloat(req.query.maxValue as string) };
}

const giftCards = await prisma.giftCard.findMany({ where });
```

### Sorting

**Query Parameters:**
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: asc or desc (default: desc)

**Code Example:**
```typescript
const sortBy = req.query.sortBy as string || 'createdAt';
const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

const giftCards = await prisma.giftCard.findMany({
  orderBy: { [sortBy]: sortOrder },
});
```

---

## Error Handling

### Error Classes

**Custom Error Classes:**
```typescript
export class ValidationError extends Error {
  constructor(message: string, public details?: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
```

### Error Middleware

**Global Error Handler:**
```typescript
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('API Error', { error: err, path: req.path });
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details,
      },
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: err.message,
      },
    });
  }
  
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: err.message,
      },
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An error occurred',
    },
  });
};
```

---

## API Versioning

### Strategy

**URL Versioning:**
```
/api/v1/gift-cards
/api/v2/gift-cards
```

**Why URL Versioning?**
- **Clear:** Easy to understand
- **Explicit:** Version in URL
- **Backward Compatible:** Old versions still work

**Alternatives:**
- **Header Versioning:** `Accept: application/vnd.api+json;version=1`
- **Query Parameter:** `/api/gift-cards?version=1`

---

## API Documentation

### OpenAPI/Swagger

**Considered:** OpenAPI specification

**Current:** Inline documentation in code

**Future:** Generate OpenAPI spec from code

---

## Interview Questions & Answers

### Q: Why REST over GraphQL?

**A:** REST chosen because:
1. **Simplicity:** Easier to understand and implement
2. **Caching:** HTTP caching works well with REST
3. **Tooling:** Better tooling and documentation
4. **Team:** Team more familiar with REST
5. **Use Case:** REST sufficient for this API

GraphQL considered but:
- More complex to implement
- Harder caching
- Overkill for this use case

### Q: Explain your pagination strategy.

**A:** Pagination:
1. **Query Parameters:** `page` and `limit`
2. **Default:** Page 1, limit 20
3. **Max Limit:** 100 items per page
4. **Response:** Includes pagination metadata
5. **Efficiency:** Uses `skip` and `take` in Prisma

Benefits:
- Prevents large result sets
- Better performance
- Clear pagination info

### Q: How do you handle errors?

**A:** Error handling:
1. **Custom Error Classes:** ValidationError, NotFoundError, etc.
2. **Error Middleware:** Global error handler
3. **Status Codes:** Appropriate HTTP status codes
4. **Error Format:** Consistent error response format
5. **Logging:** All errors logged

Error response includes:
- Error code
- Error message
- Details (for validation errors)

### Q: Explain your validation strategy.

**A:** Validation:
1. **Zod Schemas:** Define validation rules
2. **Middleware:** Validate before controller
3. **Type Safety:** Generates TypeScript types
4. **Error Messages:** Clear validation errors
5. **Sanitization:** Can sanitize input

Benefits:
- Type safety
- Runtime validation
- Clear error messages

---

## Key Takeaways

1. **RESTful Design:** Standard HTTP methods and status codes
2. **Consistent Format:** Standard request/response format
3. **Validation:** Zod schema validation
4. **Pagination:** Page-based pagination
5. **Error Handling:** Custom error classes and middleware
6. **Versioning:** URL-based versioning
7. **25+ Route Modules:** Well-organized routes

---

*See other documents for authentication, security, and feature details.*
