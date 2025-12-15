# Testing Strategy - Interview Preparation

## Overview

This document covers testing strategy, test setup, unit testing, integration testing, E2E testing, test coverage goals, mocking strategies, and test data management.

---

## Testing Philosophy

### Testing Pyramid

```
        /\
       /  \
      / E2E \        Few, slow, expensive
     /--------\
    /          \
   / Integration \   Some, medium speed
  /--------------\
 /                \
/   Unit Tests      \  Many, fast, cheap
/--------------------\
```

**Strategy:**
- **Unit Tests:** Many, fast, test individual functions
- **Integration Tests:** Some, test component interactions
- **E2E Tests:** Few, test complete user flows

---

## Test Setup

### Jest Configuration

**Backend (jest.config.js):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

**Frontend (jest.config.js):**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

---

## Unit Testing

### Service Layer Tests

**Example: Gift Card Service**

**Code:**
```typescript
import { GiftCardService } from '../services/giftcard.service';
import prisma from '../config/database';

jest.mock('../config/database');

describe('GiftCardService', () => {
  let service: GiftCardService;
  
  beforeEach(() => {
    service = new GiftCardService();
    jest.clearAllMocks();
  });
  
  describe('createGiftCard', () => {
    it('should create a gift card successfully', async () => {
      const mockData = {
        merchantId: 'merchant-1',
        value: 100,
        currency: 'USD',
      };
      
      const mockGiftCard = {
        id: 'card-1',
        code: 'ABC123',
        value: new Decimal(100),
        balance: new Decimal(100),
        status: 'ACTIVE',
        ...mockData,
      };
      
      (prisma.giftCard.create as jest.Mock).mockResolvedValue(mockGiftCard);
      
      const result = await service.createGiftCard(mockData);
      
      expect(result).toEqual(mockGiftCard);
      expect(prisma.giftCard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          merchantId: mockData.merchantId,
          value: new Decimal(mockData.value),
        }),
      });
    });
    
    it('should throw error for invalid value', async () => {
      const mockData = {
        merchantId: 'merchant-1',
        value: -100, // Invalid
        currency: 'USD',
      };
      
      await expect(service.createGiftCard(mockData)).rejects.toThrow('Value must be positive');
    });
  });
  
  describe('getById', () => {
    it('should return gift card if found', async () => {
      const mockGiftCard = {
        id: 'card-1',
        code: 'ABC123',
        value: new Decimal(100),
      };
      
      (prisma.giftCard.findUnique as jest.Mock).mockResolvedValue(mockGiftCard);
      
      const result = await service.getById('card-1');
      
      expect(result).toEqual(mockGiftCard);
    });
    
    it('should throw error if not found', async () => {
      (prisma.giftCard.findUnique as jest.Mock).mockResolvedValue(null);
      
      await expect(service.getById('card-1')).rejects.toThrow('Gift card not found');
    });
  });
});
```

---

### Controller Tests

**Example: Gift Card Controller**

**Code:**
```typescript
import { GiftCardController } from '../controllers/giftcard.controller';
import { GiftCardService } from '../services/giftcard.service';

jest.mock('../services/giftcard.service');

describe('GiftCardController', () => {
  let controller: GiftCardController;
  let mockService: jest.Mocked<GiftCardService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  
  beforeEach(() => {
    mockService = new GiftCardService() as jest.Mocked<GiftCardService>;
    controller = new GiftCardController(mockService);
    
    mockReq = {
      user: { userId: 'user-1', merchantId: 'merchant-1' },
      body: {},
    };
    
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    
    mockNext = jest.fn();
  });
  
  describe('create', () => {
    it('should create gift card and return success', async () => {
      const mockGiftCard = {
        id: 'card-1',
        code: 'ABC123',
        value: new Decimal(100),
      };
      
      mockService.createGiftCard.mockResolvedValue(mockGiftCard);
      mockReq.body = { value: 100, currency: 'USD' };
      
      await controller.create(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockService.createGiftCard).toHaveBeenCalledWith({
        merchantId: 'merchant-1',
        value: 100,
        currency: 'USD',
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockGiftCard,
      });
    });
  });
});
```

---

## Integration Testing

### API Integration Tests

**Example: Gift Card API**

**Code:**
```typescript
import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

describe('Gift Card API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
    
    // Create test user and get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginResponse.body.data.accessToken;
  });
  
  afterAll(async () => {
    // Cleanup test data
    await prisma.giftCard.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });
  
  describe('POST /api/v1/gift-cards', () => {
    it('should create a gift card', async () => {
      const response = await request(app)
        .post('/api/v1/gift-cards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          value: 100,
          currency: 'USD',
        })
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.value).toBe(100);
    });
    
    it('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/v1/gift-cards')
        .send({ value: 100 })
        .expect(401);
    });
  });
  
  describe('GET /api/v1/gift-cards', () => {
    it('should return list of gift cards', async () => {
      // Create test gift cards
      await prisma.giftCard.createMany({
        data: [
          { merchantId: 'merchant-1', code: 'ABC123', value: 100, balance: 100, currency: 'USD', status: 'ACTIVE' },
          { merchantId: 'merchant-1', code: 'DEF456', value: 200, balance: 200, currency: 'USD', status: 'ACTIVE' },
        ],
      });
      
      const response = await request(app)
        .get('/api/v1/gift-cards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });
  });
});
```

---

## E2E Testing

### Playwright E2E Tests

**Example: Gift Card Creation Flow**

**Code:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Gift Card Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });
  
  test('should create a gift card', async ({ page }) => {
    // Navigate to create gift card page
    await page.goto('/dashboard/gift-cards/create');
    
    // Fill form
    await page.fill('input[name="value"]', '100');
    await page.selectOption('select[name="currency"]', 'USD');
    await page.fill('input[name="recipientEmail"]', 'recipient@example.com');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('Gift card created successfully');
  });
  
  test('should show validation errors', async ({ page }) => {
    await page.goto('/dashboard/gift-cards/create');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check validation errors
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Value is required');
  });
});
```

---

## Mocking Strategies

### Prisma Mocking

**Code:**
```typescript
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    giftCard: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});
```

---

### External API Mocking

**Code:**
```typescript
import axios from 'axios';

jest.mock('axios');

describe('PaymentService', () => {
  it('should create payment with Stripe', async () => {
    const mockStripeResponse = {
      id: 'pi_123',
      client_secret: 'secret_123',
    };
    
    (axios.post as jest.Mock).mockResolvedValue({
      data: mockStripeResponse,
    });
    
    const result = await paymentService.createPayment({...});
    
    expect(result).toEqual(mockStripeResponse);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('stripe.com'),
      expect.any(Object)
    );
  });
});
```

---

## Test Data Management

### Test Fixtures

**Code:**
```typescript
export const testUsers = {
  merchant: {
    id: 'merchant-1',
    email: 'merchant@example.com',
    password: 'password',
    role: 'MERCHANT',
  },
  customer: {
    id: 'customer-1',
    email: 'customer@example.com',
    password: 'password',
    role: 'CUSTOMER',
  },
};

export const testGiftCards = {
  active: {
    id: 'card-1',
    merchantId: 'merchant-1',
    code: 'ABC123',
    value: new Decimal(100),
    balance: new Decimal(100),
    status: 'ACTIVE',
  },
  expired: {
    id: 'card-2',
    merchantId: 'merchant-1',
    code: 'DEF456',
    value: new Decimal(100),
    balance: new Decimal(0),
    status: 'EXPIRED',
  },
};
```

---

### Database Seeding

**Code:**
```typescript
export async function seedTestData() {
  // Create test users
  await prisma.user.createMany({
    data: [testUsers.merchant, testUsers.customer],
  });
  
  // Create test gift cards
  await prisma.giftCard.createMany({
    data: [testGiftCards.active, testGiftCards.expired],
  });
}

export async function cleanupTestData() {
  await prisma.giftCard.deleteMany();
  await prisma.user.deleteMany();
}
```

---

## Test Coverage Goals

### Coverage Targets

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** 70%+ coverage
- **E2E Tests:** Critical user flows

**Coverage Areas:**
- Service layer: 90%+
- Controllers: 80%+
- Utilities: 85%+
- Middleware: 75%+

---

## Interview Questions & Answers

### Q: How do you test async code?

**A:** Testing async code:
1. **Use async/await:** `it('should...', async () => { ... })`
2. **Await promises:** `await expect(...).resolves.toBe(...)`
3. **Mock async functions:** `mockFunction.mockResolvedValue(...)`
4. **Test error cases:** `await expect(...).rejects.toThrow(...)`

### Q: How do you mock external dependencies?

**A:** Mocking strategies:
1. **Jest mocks:** `jest.mock('module')`
2. **Manual mocks:** Create `__mocks__` directory
3. **Mock implementations:** Provide mock implementations
4. **Spy on methods:** `jest.spyOn(object, 'method')`

### Q: Explain your testing strategy.

**A:** Testing strategy:
1. **Unit Tests:** Test individual functions/services
2. **Integration Tests:** Test API endpoints with database
3. **E2E Tests:** Test complete user flows
4. **Coverage Goals:** 80%+ unit, 70%+ integration
5. **Mocking:** Mock external dependencies (Prisma, APIs)

---

## Key Takeaways

1. **Testing Pyramid:** Many unit tests, some integration, few E2E
2. **Unit Tests:** Fast, test individual functions
3. **Integration Tests:** Test component interactions
4. **E2E Tests:** Test complete user flows
5. **Mocking:** Mock external dependencies
6. **Coverage:** Aim for 80%+ coverage
7. **Test Data:** Use fixtures and seeders

---

*See other documents for implementation details.*
