# Code Examples & Patterns - Interview Preparation

## Overview

This document provides key code examples and design patterns used in the Gift Card SaaS Platform.

---

## Service Layer Pattern

### Example: Gift Card Service

**Purpose:** Encapsulate business logic

**Code:**
```typescript
export class GiftCardService {
  async createGiftCard(data: CreateGiftCardData) {
    // 1. Validate data
    if (data.value <= 0) {
      throw new ValidationError('Value must be positive');
    }
    
    // 2. Generate unique code
    const code = generateGiftCardCode();
    
    // 3. Generate QR code
    const qrCodeUrl = await qrCodeService.generateQRCode(code);
    
    // 4. Create gift card
    const giftCard = await prisma.giftCard.create({
      data: {
        merchantId: data.merchantId,
        code,
        qrCodeUrl,
        value: new Decimal(data.value),
        balance: new Decimal(data.value),
        currency: data.currency || 'USD',
        status: GiftCardStatus.ACTIVE,
      },
    });
    
    // 5. Schedule delivery if recipient provided
    if (data.recipientEmail) {
      await deliveryService.scheduleDelivery(giftCard.id, 'email');
    }
    
    return giftCard;
  }
  
  async getById(id: string) {
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
    
    if (!giftCard) {
      throw new NotFoundError('Gift card not found');
    }
    
    return giftCard;
  }
}
```

**Benefits:**
- Encapsulates business logic
- Reusable across controllers, jobs, webhooks
- Easy to test
- Single source of truth

---

## Middleware Pattern

### Example: Authentication Middleware

**Purpose:** Protect routes with authentication

**Code:**
```typescript
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }
    
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    
    // Attach user to request
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(error);
    }
  }
};

// Usage
router.get('/gift-cards', authenticate, controller.list);
```

**Benefits:**
- Reusable authentication
- Clean route definitions
- Consistent error handling

---

## Error Handling Pattern

### Custom Error Classes

**Code:**
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

**Code:**
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

**Benefits:**
- Consistent error responses
- Proper HTTP status codes
- Clear error messages
- Centralized error handling

---

## Validation Pattern

### Zod Schema Validation

**Code:**
```typescript
import { z } from 'zod';

const createGiftCardSchema = z.object({
  value: z.number().positive().max(10000),
  currency: z.string().length(3),
  expiryDate: z.date().optional(),
  recipientEmail: z.string().email().optional(),
});

type CreateGiftCardData = z.infer<typeof createGiftCardSchema>;

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
- Type-safe validation
- Runtime validation
- Clear error messages
- Automatic type inference

---

## Repository Pattern (via Prisma)

### Example: Database Operations

**Code:**
```typescript
// Prisma acts as repository
export class GiftCardRepository {
  async findById(id: string) {
    return prisma.giftCard.findUnique({
      where: { id },
    });
  }
  
  async findByCode(code: string) {
    return prisma.giftCard.findUnique({
      where: { code },
    });
  }
  
  async findByMerchant(merchantId: string, page: number, limit: number) {
    return prisma.giftCard.findMany({
      where: { merchantId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async create(data: CreateGiftCardData) {
    return prisma.giftCard.create({
      data,
    });
  }
  
  async update(id: string, data: UpdateGiftCardData) {
    return prisma.giftCard.update({
      where: { id },
      data,
    });
  }
  
  async delete(id: string) {
    return prisma.giftCard.delete({
      where: { id },
    });
  }
}
```

**Benefits:**
- Type-safe queries
- Prevents SQL injection
- Easy to test (can mock Prisma)
- Consistent query interface

---

## Factory Pattern

### Example: Payment Gateway Factory

**Code:**
```typescript
interface PaymentGateway {
  createPayment(amount: number, currency: string): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<Payment>;
  refundPayment(paymentId: string, amount?: number): Promise<Refund>;
}

class StripeGateway implements PaymentGateway {
  async createPayment(amount: number, currency: string) {
    return stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
    });
  }
  // ... other methods
}

class PayPalGateway implements PaymentGateway {
  async createPayment(amount: number, currency: string) {
    return paypal.orders.create({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
      }],
    });
  }
  // ... other methods
}

class PaymentGatewayFactory {
  static createGateway(method: PaymentMethod): PaymentGateway {
    switch (method) {
      case PaymentMethod.STRIPE:
        return new StripeGateway();
      case PaymentMethod.PAYPAL:
        return new PayPalGateway();
      case PaymentMethod.RAZORPAY:
        return new RazorpayGateway();
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}

// Usage
const gateway = PaymentGatewayFactory.createGateway(PaymentMethod.STRIPE);
const paymentIntent = await gateway.createPayment(100, 'USD');
```

**Benefits:**
- Encapsulates gateway creation
- Easy to add new gateways
- Consistent interface
- Testable

---

## Observer Pattern

### Example: Event System

**Code:**
```typescript
type EventHandler = (data: any) => Promise<void>;

class EventEmitter {
  private handlers: Map<string, EventHandler[]> = new Map();
  
  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }
  
  async emit(event: string, data: any) {
    const handlers = this.handlers.get(event) || [];
    await Promise.all(handlers.map(handler => handler(data)));
  }
}

// Usage
const eventEmitter = new EventEmitter();

eventEmitter.on('payment.completed', async (payment) => {
  await giftCardService.activateGiftCard(payment.giftCardId);
  await deliveryService.scheduleDelivery(payment.giftCardId, 'email');
});

eventEmitter.on('payment.completed', async (payment) => {
  await analyticsService.trackSale(payment);
});

// Emit event
await eventEmitter.emit('payment.completed', payment);
```

**Benefits:**
- Decoupled components
- Easy to add new handlers
- Flexible event system

---

## Strategy Pattern

### Example: Commission Calculation

**Code:**
```typescript
interface CommissionStrategy {
  calculate(amount: number): number;
}

class PercentageCommissionStrategy implements CommissionStrategy {
  constructor(private rate: number) {}
  
  calculate(amount: number): number {
    return amount * (this.rate / 100);
  }
}

class FixedCommissionStrategy implements CommissionStrategy {
  constructor(private fixedAmount: number) {}
  
  calculate(amount: number): number {
    return this.fixedAmount;
  }
}

class CommissionCalculator {
  private strategy: CommissionStrategy;
  
  setStrategy(strategy: CommissionStrategy) {
    this.strategy = strategy;
  }
  
  calculate(amount: number): number {
    return this.strategy.calculate(amount);
  }
}

// Usage
const calculator = new CommissionCalculator();

if (settings.commissionType === CommissionType.PERCENTAGE) {
  calculator.setStrategy(new PercentageCommissionStrategy(settings.commissionRate));
} else {
  calculator.setStrategy(new FixedCommissionStrategy(settings.commissionRate));
}

const commission = calculator.calculate(amount);
```

**Benefits:**
- Flexible commission calculation
- Easy to add new strategies
- Testable
- Clean code

---

## Singleton Pattern

### Example: Prisma Client

**Code:**
```typescript
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export default function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    });
  }
  return prisma;
}

// Usage
const prisma = getPrismaClient();
```

**Benefits:**
- Single instance
- Connection pooling
- Resource efficiency

---

## Async/Await Pattern

### Example: Payment Processing

**Code:**
```typescript
async function processPayment(paymentId: string) {
  try {
    // 1. Get payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }
    
    // 2. Verify with gateway
    const gateway = PaymentGatewayFactory.createGateway(payment.paymentMethod);
    const gatewayPayment = await gateway.confirmPayment(payment.paymentIntentId);
    
    // 3. Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.COMPLETED },
    });
    
    // 4. Activate gift card
    await giftCardService.activateGiftCard(payment.giftCardId);
    
    // 5. Schedule delivery
    await deliveryService.scheduleDelivery(payment.giftCardId, 'email');
    
    return payment;
  } catch (error) {
    logger.error('Payment processing failed', { paymentId, error });
    throw error;
  }
}
```

**Benefits:**
- Clean async code
- Error handling
- Sequential operations
- Readable

---

## Key Takeaways

1. **Service Layer:** Encapsulates business logic
2. **Middleware:** Reusable request processing
3. **Error Handling:** Consistent error responses
4. **Validation:** Type-safe input validation
5. **Repository:** Type-safe database operations
6. **Factory:** Encapsulates object creation
7. **Observer:** Decoupled event system
8. **Strategy:** Flexible algorithm selection
9. **Singleton:** Single instance management
10. **Async/Await:** Clean asynchronous code

---

*See other documents for detailed feature implementations.*
