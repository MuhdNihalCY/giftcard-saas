/**
 * Input sanitization utilities
 * Prevents XSS attacks by sanitizing user input
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed by default
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize HTML but allow specific tags (for rich text content)
 */
export function sanitizeHtmlRich(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

/**
 * Sanitize plain text (removes all HTML)
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate and sanitize file upload
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFileUpload(
  file: Express.Multer.File,
  allowedTypes: string[] = ALLOWED_IMAGE_TYPES
): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.originalname);

  // Check file extension
  const extension = sanitizedFilename.substring(sanitizedFilename.lastIndexOf('.')).toLowerCase();
  if (allowedTypes === ALLOWED_IMAGE_TYPES && !ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed`,
    };
  }

  return {
    isValid: true,
    sanitizedFilename,
  };
}

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  let sanitized = filename.replace(/^.*[\\/]/, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove special characters except dots, dashes, underscores, and alphanumeric
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}


