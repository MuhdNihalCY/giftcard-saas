import { PrismaClient } from '@prisma/client';

// Setup test environment
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/giftcard_test?schema=public';
  process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters-long';
});

afterAll(async () => {
  // Cleanup
});

// Mock Prisma for tests
jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/giftcard_test?schema=public',
      },
    },
  }),
}));


