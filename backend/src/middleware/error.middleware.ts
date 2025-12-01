import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { env } from '../config/env';

// Helper to set CORS headers
const setCORSHeaders = (req: Request, res: Response): void => {
  // Check if headers already sent
  if (res.headersSent) return;
  
  // Try to get origin from response locals first (set by health endpoint)
  const origin = (res.locals.origin as string) || req.headers.origin;
  if (!origin) return;

  const allowedOrigins = env.CORS_ORIGIN.includes(',') 
    ? env.CORS_ORIGIN.split(',').map(o => o.trim()) 
    : [env.CORS_ORIGIN];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
  }
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Check if headers have already been sent - if so, just log and return
  if (res.headersSent) {
    logger.error('Error occurred but headers already sent', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
    return;
  }

  // Always set CORS headers on errors to prevent CORS blocking
  setCORSHeaders(req, res);

  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.constructor.name,
        message: err.message,
      },
    });
  }

  // Unknown error
  logger.error(`Unknown Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    },
  });
};

