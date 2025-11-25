/**
 * Audit Middleware
 * Automatically logs requests for sensitive operations
 */

import { Request, Response, NextFunction } from 'express';
import auditLogService from '../services/audit-log.service';
import { AuthRequest } from './auth.middleware';

/**
 * Get client IP address from request
 */
const getClientIP = (req: Request): string | undefined => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    undefined
  );
};

/**
 * Get user agent from request
 */
const getUserAgent = (req: Request): string | undefined => {
  return req.headers['user-agent'];
};

/**
 * Audit middleware factory
 * Creates middleware to log specific actions
 */
export const audit = (action: string, resourceType: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Log after response is sent to avoid blocking
    res.on('finish', () => {
      const userId = req.user?.userId;
      const userEmail = req.user?.email;
      const resourceId = req.params.id || req.params.code || req.body?.id;
      const ipAddress = getClientIP(req);
      const userAgent = getUserAgent(req);

      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        auditLogService.log({
          userId,
          userEmail,
          action,
          resourceType,
          resourceId,
          ipAddress,
          userAgent,
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          },
        });
      }
    });

    next();
  };
};

/**
 * Audit authentication events
 */
export const auditAuth = (action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'TOKEN_REFRESH') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      const ipAddress = getClientIP(req);
      const userAgent = getUserAgent(req);
      const email = req.body?.email || (req as AuthRequest).user?.email;
      const userId = (req as AuthRequest).user?.userId;

      if (action === 'LOGIN_FAILED' || (action === 'LOGIN_SUCCESS' && res.statusCode < 300)) {
        auditLogService.logAuth(action, {
          userId,
          userEmail: email,
          ipAddress,
          userAgent,
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          },
        });
      }
    });

    next();
  };
};

