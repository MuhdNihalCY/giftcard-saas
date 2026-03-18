import { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from '../infrastructure/env';
import { sessionMiddleware } from '../infrastructure/session';
import { errorHandler } from '../middleware/error.middleware';
import { requestLogger } from '../middleware/logger.middleware';
import {
  attachCSRFToken,
  validateCSRF,
  generateCSRFToken,
} from '../middleware/csrf.middleware';
import {
  cspHeaders,
  hstsHeaders,
  removeServerHeaders,
} from '../middleware/security-headers.middleware';
import { apiRateLimiter } from '../middleware/rateLimit.middleware';
import logger from '../utils/logger';
import express from 'express';

const allowedOrigins = env.CORS_ORIGIN.includes(',')
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [env.CORS_ORIGIN];

const isDevelopment = env.NODE_ENV === 'development';

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (isDevelopment && !origin) return callback(null, true);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      if (isDevelopment) {
        logger.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'XSRF-TOKEN',
    'X-Requested-With',
  ],
  exposedHeaders: ['X-CSRF-Token'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export function configureMiddleware(app: Express): void {
  if (isDevelopment) {
    logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  }

  // Health check — mounted first, independently of all other middleware
  app.use('/health', (req, res, next) => {
    const origin = req.headers.origin;
    res.locals.origin = origin;

    if (req.method === 'OPTIONS') {
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization'
        );
        res.setHeader('Access-Control-Max-Age', '86400');
      }
      return res.status(204).end();
    }

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
    }

    return next();
  });

  app.use('/health', sessionMiddleware);

  app.use('/health', (req, res, next) => {
    if (req.method === 'GET' && (req.path === '/' || req.path === '')) {
      generateCSRFToken(req, res, (err) => {
        if (err) logger.warn('CSRF token generation failed on health endpoint', { error: err });
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: env.NODE_ENV,
        });
      });
    } else {
      next();
    }
  });

  // OPTIONS preflight — before all other middleware
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        );
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, X-CSRF-Token, XSRF-TOKEN, X-Requested-With'
        );
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
      }
      return res.status(204).end();
    }
    return next();
  });

  app.use(cors(corsOptions));
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(removeServerHeaders);
  app.use(cspHeaders);
  app.use(hstsHeaders);
  app.use(compression());
  app.use(cookieParser());
  app.use(sessionMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CSRF attach (skip for health and OPTIONS)
  app.use((req, res, next) => {
    if (
      req.path.startsWith('/health') ||
      req.path.includes('/health') ||
      req.method === 'OPTIONS'
    ) {
      return next();
    }
    return attachCSRFToken(req, res, next);
  });

  // CSRF validate (skip for public endpoints and JWT-authenticated requests)
  app.use((req, res, next) => {
    if (
      req.path.includes('/webhook/') ||
      req.path.startsWith('/health') ||
      req.path.includes('/health') ||
      req.path.startsWith(`/api/${env.API_VERSION}/auth/login`) ||
      req.path.startsWith(`/api/${env.API_VERSION}/auth/register`) ||
      req.path.startsWith(`/api/${env.API_VERSION}/auth/refresh`) ||
      req.path.startsWith(`/api/${env.API_VERSION}/password-reset`) ||
      req.path.startsWith(`/api/${env.API_VERSION}/email-verification`) ||
      req.method === 'OPTIONS'
    ) {
      return next();
    }
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      return next();
    }
    return validateCSRF(req, res, next);
  });

  app.use(requestLogger);
  app.use(`/api/${env.API_VERSION}`, apiRateLimiter);

  // Static files
  app.use('/uploads', express.static('uploads'));
  app.use('/uploads/pdfs', express.static('uploads/pdfs'));
}

export { errorHandler, allowedOrigins };
