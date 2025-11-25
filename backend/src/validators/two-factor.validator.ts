/**
 * Two-Factor Authentication Validators
 */

import { z } from 'zod';

export const setup2FASchema = z.object({
  body: z.object({}),
});

export const enable2FASchema = z.object({
  body: z.object({
    secret: z.string().min(1, 'Secret is required'),
    token: z.string().length(6, 'Token must be 6 digits'),
  }),
});

export const verify2FASchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    token: z.string().length(6, 'Token must be 6 digits'),
  }),
});

export const verify2FABackupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    backupCode: z.string().min(8, 'Backup code is required'),
  }),
});

export const disable2FASchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password is required'),
  }),
});

export const regenerateBackupCodesSchema = z.object({
  body: z.object({}),
});

