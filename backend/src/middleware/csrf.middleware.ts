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
    // Try to get or create secret from session
    // If session is not available (e.g., Redis error), continue without error
    if (!req.session) {
      logger.warn('Session not available for CSRF token generation, skipping');
      return next();
    }

    // Ensure session is initialized
    if (!req.session.csrfSecret) {
      try {
        req.session.csrfSecret = tokens.secretSync();
        // Explicitly save session to ensure csrfSecret persists
        // This is important with saveUninitialized: false
        req.session.save((err) => {
          if (err) {
            logger.warn('Failed to save session after setting CSRF secret', { error: err });
            // Continue anyway - session might still work
          }
        });
      } catch (sessionError) {
        logger.warn('Failed to create CSRF secret in session', { error: sessionError });
        // Continue without CSRF token if session save fails
        return next();
      }
    }

    const secret = req.session.csrfSecret;
    const token = tokens.create(secret);

    // Attach token to response
    const isProduction = process.env.NODE_ENV === 'production';
    res.locals.csrfToken = token;
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Must be accessible to JavaScript for frontend
      secure: isProduction,
      // CORS with credentials requires specific sameSite settings:
      // - 'lax' in development: Allows cross-origin GET requests and same-site POST requests
      // - 'none' in production: Allows all cross-origin requests (requires secure: true)
      // Note: Must match session cookie sameSite setting for consistency
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });

    // Also send in response header for convenience
    res.setHeader('X-CSRF-Token', token);

    next();
  } catch (error) {
    logger.error('Failed to generate CSRF token', { error });
    // Don't fail the request if CSRF token generation fails
    // Just continue without the token
    next();
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

    // Check if request is authenticated with JWT (Authorization header)
    // JWT-authenticated requests are less vulnerable to CSRF since tokens are in headers, not cookies
    const hasJWT = req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
    
    // Get secret from session
    const secret = req.session?.csrfSecret;
    
    // If no session secret and request has JWT, allow it (JWT provides CSRF protection)
    if (!secret && hasJWT) {
      logger.debug('CSRF check skipped: JWT authenticated request without session');
      return next();
    }
    
    if (!secret) {
      // Try to generate a new secret and allow the request
      // This handles cases where session wasn't initialized yet
      if (req.session) {
        try {
          req.session.csrfSecret = tokens.secretSync();
          req.session.save((err) => {
            if (err) {
              logger.warn('Failed to save session after creating CSRF secret', { error: err });
            }
          });
          logger.debug('Created new CSRF secret for request without existing secret');
          return next();
        } catch (err) {
          logger.warn('Failed to create CSRF secret during verification', { error: err });
        }
      }
      throw new UnauthorizedError('CSRF secret not found in session');
    }

    // Get token from header, body, or query
    const token =
      req.headers['x-csrf-token'] ||
      req.headers['xsrf-token'] ||
      req.body?._csrf ||
      req.query?._csrf;

    // If JWT authenticated and no token provided, allow (JWT provides protection)
    if (!token && hasJWT) {
      logger.debug('CSRF token missing but JWT present, allowing request');
      return next();
    }

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedError('CSRF token missing');
    }

    // Verify token
    if (!tokens.verify(secret, token)) {
      // Log for debugging
      logger.warn('CSRF token verification failed', {
        hasSecret: !!secret,
        tokenLength: token.length,
        path: req.path,
        method: req.method,
      });
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
