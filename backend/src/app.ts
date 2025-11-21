import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import logger from './utils/logger';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
import { apiRateLimiter } from './middleware/rateLimit.middleware';
app.use(`/api/${env.API_VERSION}`, apiRateLimiter);

// Health check routes (before rate limiting)
import healthRoutes from './routes/health.routes';
app.use('/', healthRoutes);

// API routes
app.get(`/api/${env.API_VERSION}`, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Gift Card SaaS API',
    version: env.API_VERSION,
  });
});

// Import routes
import authRoutes from './routes/auth.routes';
import giftCardRoutes from './routes/giftcard.routes';
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

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/gift-cards`, giftCardRoutes);
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

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
app.use('/uploads/pdfs', express.static('uploads/pdfs'));

// 404 handler
app.use((req: Request, res: Response) => {
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
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

export default app;

