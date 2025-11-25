/**
 * API-specific type definitions
 */

import { UserRole } from '@prisma/client';

// Authentication types
export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Request types
export interface AuthenticatedRequest {
  user: AuthUser;
}

// File upload types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

// Webhook types
export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature?: string;
}


