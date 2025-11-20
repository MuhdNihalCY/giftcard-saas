import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
import { apiRateLimiter } from './middleware/rateLimit.middleware';
app.use(`/api/${env.API_VERSION}`, apiRateLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

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

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/gift-cards`, giftCardRoutes);
app.use(`/api/${env.API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${env.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${env.API_VERSION}/delivery`, deliveryRoutes);
app.use(`/api/${env.API_VERSION}/redemptions`, redemptionRoutes);
app.use(`/api/${env.API_VERSION}/analytics`, analyticsRoutes);

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

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

export default app;

