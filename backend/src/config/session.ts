/**
 * Session configuration
 * Uses Redis for session storage in production
 */

import session from 'express-session';
import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';

let redisClient: Redis | null = null;
let sessionStore: session.Store | undefined = undefined;

// Initialize Redis client and store if Redis URL is provided
if (env.REDIS_URL) {
  try {
    // connect-redis exports RedisStore as a named export
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { RedisStore } = require('connect-redis');
    
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis session store error', { error: err });
    });

    redisClient.on('connect', () => {
      logger.info('Redis session store connected');
    });

    // Create Redis store instance
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'sess:',
    });
  } catch (error) {
    logger.warn('Failed to initialize Redis for sessions, using memory store', { error });
  }
}

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
const sessionConfig: session.SessionOptions = {
  secret: env.SESSION_SECRET || env.JWT_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'giftcard.sid', // Don't use default 'connect.sid' for security
  cookie: {
    secure: isProduction, // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    // CORS with credentials requires specific sameSite settings:
    // - 'lax' in development: Allows cross-origin GET requests and same-site POST requests
    // - 'none' in production: Allows all cross-origin requests (requires secure: true)
    // Note: 'strict' blocks all cross-origin cookie sending, which breaks CORS with credentials
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  },
  store: sessionStore, // Use memory store if Redis not available
};

// Warn if using memory store in production
if (!redisClient && process.env.NODE_ENV === 'production') {
  logger.warn(
    'Using memory store for sessions in production. Sessions will be lost on server restart. Consider using Redis.'
  );
}

export const sessionMiddleware = session(sessionConfig);

export { redisClient };

