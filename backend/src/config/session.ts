/**
 * Session configuration
 * Uses Redis for session storage in production
 */

import session from 'express-session';
import Redis from 'ioredis';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RedisStore = require('connect-redis').default;
import { env } from './env';
import logger from '../utils/logger';

let redisClient: Redis | null = null;

// Initialize Redis client for session store if Redis URL is provided
if (env.REDIS_URL) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis session store error', { error: err });
    });

    redisClient.on('connect', () => {
      logger.info('Redis session store connected');
    });
  } catch (error) {
    logger.warn('Failed to initialize Redis for sessions, using memory store', { error });
  }
}

// Session configuration
const sessionConfig: session.SessionOptions = {
  secret: env.SESSION_SECRET || env.JWT_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'giftcard.sid', // Don't use default 'connect.sid' for security
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  },
  store: redisClient
    ? new RedisStore({
        client: redisClient,
        prefix: 'sess:',
      })
    : undefined, // Use memory store if Redis not available
};

// Warn if using memory store in production
if (!redisClient && process.env.NODE_ENV === 'production') {
  logger.warn(
    'Using memory store for sessions in production. Sessions will be lost on server restart. Consider using Redis.'
  );
}

export const sessionMiddleware = session(sessionConfig);

export { redisClient };

