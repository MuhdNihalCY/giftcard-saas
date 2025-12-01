import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// Initialize Prisma Client
const prisma: PrismaClient = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Verify Prisma client is properly initialized on module load
if (!prisma) {
  logger.error('Prisma client is null or undefined');
  throw new Error('Prisma client initialization failed');
}

if (typeof prisma.user === 'undefined') {
  logger.error('Prisma client user model is undefined - Prisma Client may not be generated correctly');
  logger.error('Run: npx prisma generate');
  throw new Error('Prisma client user model not found - run npx prisma generate');
}

logger.info('Prisma client initialized successfully');

export default prisma;

