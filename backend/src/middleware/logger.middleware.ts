import { Request, Response, NextFunction } from 'express';
import logger, { setRequestId, clearRequestId, getRequestId } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Set request ID for this request
  setRequestId();
  
  const start = Date.now();
  const requestId = getRequestId() || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    // Clear request ID after request completes
    clearRequestId();
  });

  res.on('close', () => {
    // Clear request ID if connection closes early
    clearRequestId();
  });

  next();
};

