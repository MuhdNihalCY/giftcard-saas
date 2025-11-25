/**
 * Enhanced Security Headers Middleware
 * Configures Content Security Policy, HSTS, and other security headers
 */

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Set Content Security Policy headers
 */
export const cspHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  const frontendUrl = env.FRONTEND_URL || 'http://localhost:3001';
  const isProduction = process.env.NODE_ENV === 'production';

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${isProduction ? '' : 'http://localhost:*'}`,
    `style-src 'self' 'unsafe-inline' ${frontendUrl}`,
    `img-src 'self' data: https: blob: ${frontendUrl}`,
    `font-src 'self' data: ${frontendUrl}`,
    `connect-src 'self' ${frontendUrl} ${isProduction ? 'https://api.stripe.com https://api.razorpay.com' : 'http://localhost:*'}`,
    `frame-src 'self' ${isProduction ? 'https://js.stripe.com https://checkout.razorpay.com' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspDirectives);

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options (redundant with CSP frame-ancestors, but for older browsers)
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection (legacy, but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );

  next();
};

/**
 * Set HSTS (HTTP Strict Transport Security) header
 * Only in production with HTTPS
 */
export const hstsHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') {
    // HSTS: Force HTTPS for 1 year, include subdomains, preload
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
};

/**
 * Remove server information headers
 */
export const removeServerHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  // Remove X-Powered-By header (Express default)
  res.removeHeader('X-Powered-By');
  next();
};


