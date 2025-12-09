import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { attachCSRFToken, validateCSRF, generateCSRFToken } from './middleware/csrf.middleware';
import { sessionMiddleware } from './config/session';
import { cspHeaders, hstsHeaders, removeServerHeaders } from './middleware/security-headers.middleware';
import logger from './utils/logger';

const app: Express = express();

// CORS configuration
const allowedOrigins = env.CORS_ORIGIN.includes(',') 
  ? env.CORS_ORIGIN.split(',').map(origin => origin.trim()) 
  : [env.CORS_ORIGIN];

// In development, be more permissive
const isDevelopment = env.NODE_ENV === 'development';

// Log allowed origins in development for debugging
if (isDevelopment) {
  logger.info(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // In development, allow requests with no origin
    if (isDevelopment && !origin) {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'XSRF-TOKEN', 'X-Requested-With'],
  exposedHeaders: ['X-CSRF-Token'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Health check routes - mount FIRST and handle completely independently
// This bypasses all other middleware to ensure it's always accessible
app.use('/health', (req, res, next) => {
  const origin = req.headers.origin;
  
  // Store origin in response locals so error handler can access it
  res.locals.origin = origin;
  
  // In development, log origin for debugging
  if (isDevelopment) {
    logger.info(`[HEALTH] ${req.method} ${req.path} from origin: ${origin || 'none'}, allowed: ${origin ? allowedOrigins.includes(origin) : 'N/A'}`);
  }
  
  // Handle OPTIONS preflight first
  if (req.method === 'OPTIONS') {
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    }
    return res.status(204).end();
  }
  
  // For actual GET requests to /health (root of health endpoint)
  // When mounted with app.use('/health', ...), req.path will be '/' for requests to /health
  // and '/detailed', '/status', etc. for sub-routes
  if (req.method === 'GET' && (req.path === '/' || req.path === '')) {
    // Set CORS headers
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
    }
    
    // Continue to next middleware to generate CSRF token, then respond
    next();
    return;
  }
  
  // For other health routes, continue to the health routes handler
  // But ensure CORS headers are set first
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
  }
  
  return next();
});

// Apply session middleware to health endpoint for CSRF token generation
// This allows the frontend to get a CSRF token when calling /health
app.use('/health', sessionMiddleware);

// Generate CSRF token for health endpoint GET requests (but don't validate it)
app.use('/health', (req, res, next) => {
  if (req.method === 'GET' && (req.path === '/' || req.path === '')) {
    const origin = req.headers.origin;
    
    // Generate CSRF token for the session
    generateCSRFToken(req, res, (err) => {
      if (err) {
        // If CSRF token generation fails, log but continue
        logger.warn('CSRF token generation failed on health endpoint', { error: err });
      }
      
      // Ensure CORS headers are set
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
      }
      
      // Respond with health check (CSRF token is already in header/cookie from generateCSRFToken)
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

// Health routes - no CSRF validation required
import healthRoutes from './routes/health.routes';
app.use('/health', healthRoutes);

// Handle ALL OPTIONS preflight requests FIRST (before any other middleware)
// This must be before CORS, session, and all security middleware
// OPTIONS requests must be handled before session middleware to avoid cookie issues
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    
    // Check if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      // Set CORS headers for allowed origin
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, XSRF-TOKEN, X-Requested-With');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
    } else if (origin && isDevelopment) {
      // In development, log blocked origins for debugging
      logger.warn(`OPTIONS preflight from blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
    }
    
    // Always respond to OPTIONS requests (even if origin is not allowed)
    // This prevents the request from hanging
    return res.status(204).end();
  }
  return next();
});

// Now apply CORS and other middleware for all other routes
app.use(cors(corsOptions));

// Security middleware (configured to work with CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(removeServerHeaders);
app.use(cspHeaders);
app.use(hstsHeaders);
app.use(compression());
app.use(cookieParser());
app.use(sessionMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CSRF protection - attach token to all requests (skip for health and OPTIONS)
// Note: OPTIONS requests are already handled above, so they won't reach here
app.use((req, res, next) => {
  if (req.path.startsWith('/health') || req.method === 'OPTIONS') {
    return next(); // Skip CSRF for health checks and preflight requests
  }
  return attachCSRFToken(req, res, next);
});

// Validate CSRF token for state-changing operations
// Skip CSRF for:
// - Webhooks (external services)
// - Health checks (public endpoint)
// - Auth endpoints (login/register - public endpoints, users not authenticated yet)
// - OPTIONS requests (preflight)
// - JWT-authenticated requests (JWT in Authorization header provides CSRF protection)
app.use((req, res, next) => {
  // Skip CSRF for public endpoints
  if (
    req.path.includes('/webhook/') || 
    req.path.startsWith('/health') || 
    req.path.startsWith('/api/v1/auth/login') ||
    req.path.startsWith('/api/v1/auth/register') ||
    req.path.startsWith('/api/v1/auth/refresh') ||
    req.path.startsWith('/api/v1/password-reset') ||
    req.path.startsWith('/api/v1/email-verification') ||
    req.method === 'OPTIONS'
  ) {
    return next(); // Skip CSRF for public/auth endpoints
  }
  
  // Skip CSRF for JWT-authenticated requests (JWT tokens in headers are not vulnerable to CSRF)
  // CSRF attacks rely on browsers automatically sending cookies, but JWT tokens in Authorization
  // headers are NOT sent automatically, so they provide inherent CSRF protection
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next(); // Skip CSRF for JWT-authenticated requests
  }
  
  return validateCSRF(req, res, next);
});

// Request logging
app.use(requestLogger);

// Rate limiting
import { apiRateLimiter } from './middleware/rateLimit.middleware';
app.use(`/api/${env.API_VERSION}`, apiRateLimiter);

// API routes
app.get(`/api/${env.API_VERSION}`, (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Gift Card SaaS API',
    version: env.API_VERSION,
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import giftCardRoutes from './routes/giftcard.routes';
import giftCardProductRoutes from './routes/giftcard-product.routes';
import uploadRoutes from './routes/upload.routes';
import paymentRoutes from './routes/payment.routes';
import deliveryRoutes from './routes/delivery.routes';
import redemptionRoutes from './routes/redemption.routes';
import analyticsRoutes from './routes/analytics.routes';
import emailVerificationRoutes from './routes/emailVerification.routes';
import passwordResetRoutes from './routes/passwordReset.routes';
import communicationSettingsRoutes from './routes/communicationSettings.routes';
import otpRoutes from './routes/otp.routes';
import communicationLogRoutes from './routes/communicationLog.routes';
import giftCardShareRoutes from './routes/giftcard-share.routes';
import twoFactorRoutes from './routes/two-factor.routes';
import deviceRoutes from './routes/device.routes';
import auditLogRoutes from './routes/audit-log.routes';
import breakageRoutes from './routes/breakage.routes';
import chargebackRoutes from './routes/chargeback.routes';
import merchantPaymentGatewayRoutes from './routes/merchant-payment-gateway.routes';
import payoutRoutes from './routes/payout.routes';
import adminPayoutRoutes from './routes/admin-payout.routes';

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/auth/2fa`, twoFactorRoutes);
app.use(`/api/${env.API_VERSION}/auth/devices`, deviceRoutes);
app.use(`/api/${env.API_VERSION}/gift-cards`, giftCardRoutes);
app.use(`/api/${env.API_VERSION}/gift-card-share`, giftCardShareRoutes);
app.use(`/api/${env.API_VERSION}/gift-card-products`, giftCardProductRoutes);
app.use(`/api/${env.API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${env.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${env.API_VERSION}/delivery`, deliveryRoutes);
app.use(`/api/${env.API_VERSION}/redemptions`, redemptionRoutes);
app.use(`/api/${env.API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${env.API_VERSION}/email-verification`, emailVerificationRoutes);
app.use(`/api/${env.API_VERSION}/password-reset`, passwordResetRoutes);
app.use(`/api/${env.API_VERSION}/admin/communication-settings`, communicationSettingsRoutes);
app.use(`/api/${env.API_VERSION}/otp`, otpRoutes);
app.use(`/api/${env.API_VERSION}/admin/communication-logs`, communicationLogRoutes);
app.use(`/api/${env.API_VERSION}/admin/audit-logs`, auditLogRoutes);
app.use(`/api/${env.API_VERSION}/breakage`, breakageRoutes);
app.use(`/api/${env.API_VERSION}/chargebacks`, chargebackRoutes);
import blacklistRoutes from './routes/blacklist.routes';
app.use(`/api/${env.API_VERSION}/admin/blacklist`, blacklistRoutes);
app.use(`/api/${env.API_VERSION}/merchant/payment-gateways`, merchantPaymentGatewayRoutes);
app.use(`/api/${env.API_VERSION}/payouts`, payoutRoutes);
app.use(`/api/${env.API_VERSION}/admin/payouts`, adminPayoutRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/uploads/pdfs', express.static('uploads/pdfs'));

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = env.PORT;

// Start workers and schedulers (only in production or when explicitly enabled)
if (env.NODE_ENV === 'production' || process.env.ENABLE_WORKERS === 'true') {
  import('./workers').then(({ closeWorkers }) => {
    import('./services/scheduler.service').then(({ default: scheduler }) => {
      scheduler.start();
      logger.info('Background workers and schedulers started');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing workers...');
      await closeWorkers();
      process.exit(0);
    });
  });
}

app.listen(PORT, () => {
  logger.info('='.repeat(60));
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 CORS_ORIGIN: ${env.CORS_ORIGIN}`);
  logger.info(`📡 Health endpoint: http://localhost:${PORT}/health`);
  logger.info(`🔌 API endpoint: http://localhost:${PORT}/api/${env.API_VERSION}`);
  logger.info('='.repeat(60));
});

export default app;

