import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.max(env.RATE_LIMIT_MAX_REQUESTS, 5000), // Increased to 5000 requests per window (15 minutes = ~333 requests/minute)
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased to 100 to allow for testing/multiple attempts
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
});

export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Increased to 100 payment requests per minute
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many payment requests, please try again later.',
    },
  },
});

