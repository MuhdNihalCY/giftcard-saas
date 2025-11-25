/**
 * CSRF Protection Middleware
 * Protects state-changing operations from Cross-Site Request Forgery attacks
 */

import { Request, Response, NextFunction } from 'express';
import csrf from 'csrf';
import { UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

const tokens = new csrf();

/**
 * Generate CSRF token for the session
 * Should be called on GET requests to provide token to frontend
 */
export const generateCSRFToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get or create secret from session
    if (!req.session?.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync();
    }

    const secret = req.session.csrfSecret;
    const token = tokens.create(secret);

    // Attach token to response
    res.locals.csrfToken = token;
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Must be accessible to JavaScript for frontend
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    // Also send in response header for convenience
    res.setHeader('X-CSRF-Token', token);

    next();
  } catch (error) {
    logger.error('Failed to generate CSRF token', { error });
    next(new UnauthorizedError('Failed to generate CSRF token'));
  }
};

/**
 * Verify CSRF token on state-changing requests
 * Should be used on POST, PUT, PATCH, DELETE requests
 */
export const verifyCSRF = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Get secret from session
    const secret = req.session?.csrfSecret;
    if (!secret) {
      throw new UnauthorizedError('CSRF secret not found in session');
    }

    // Get token from header, body, or query
    const token =
      req.headers['x-csrf-token'] ||
      req.headers['xsrf-token'] ||
      req.body?._csrf ||
      req.query?._csrf;

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedError('CSRF token missing');
    }

    // Verify token
    if (!tokens.verify(secret, token)) {
      throw new UnauthorizedError('Invalid CSRF token');
    }

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    logger.error('CSRF verification error', { error });
    next(new UnauthorizedError('CSRF verification failed'));
  }
};

// Aliases for backward compatibility
export const attachCSRFToken = generateCSRFToken;
export const validateCSRF = verifyCSRF;

/**
 * Optional CSRF - doesn't fail if token is missing (for API endpoints with alternative auth)
 */
export const optionalCSRF = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const secret = req.session?.csrfSecret;
    if (!secret) {
      // No session, skip CSRF check (might be API key auth)
      return next();
    }

    const token =
      req.headers['x-csrf-token'] ||
      req.headers['xsrf-token'] ||
      req.body?._csrf ||
      req.query?._csrf;

    if (token && typeof token === 'string') {
      if (!tokens.verify(secret, token)) {
        throw new UnauthorizedError('Invalid CSRF token');
      }
    }

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    next();
  }
};
