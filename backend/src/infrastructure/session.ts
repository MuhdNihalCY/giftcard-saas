/**
 * Session configuration
 * Uses Redis for session storage in production
 */

import session from 'express-session';
import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';
import { RedisStore } from 'connect-redis';

let redisClient: Redis | null = null;
let sessionStore: session.Store | undefined = undefined;

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

    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'sess:',
    });
  } catch (error) {
    logger.warn('Failed to initialize Redis for sessions, using memory store', { error });
  }
}

const isProduction = process.env.NODE_ENV === 'production';
const sessionConfig: session.SessionOptions = {
  secret: env.SESSION_SECRET || env.JWT_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'giftcard.sid',
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  },
  store: sessionStore,
};

if (!redisClient && process.env.NODE_ENV === 'production') {
  logger.warn(
    'Using memory store for sessions in production. Sessions will be lost on server restart. Consider using Redis.'
  );
}

export const sessionMiddleware = session(sessionConfig);

export { redisClient };
