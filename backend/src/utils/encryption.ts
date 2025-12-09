import crypto from 'crypto';
import { env } from '../config/env';
import logger from './logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const SALT_LENGTH = 64; // 64 bytes for salt
const TAG_LENGTH = 16; // 16 bytes for GCM tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

/**
 * Get encryption key from environment or generate a default (for development only)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    if (env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY environment variable is required in production');
    }
    // Development fallback - should never be used in production
    logger.warn('ENCRYPTION_KEY not set, using default key (INSECURE - for development only)');
    return crypto.scryptSync('default-dev-key-change-in-production', 'salt', KEY_LENGTH);
  }

  // Key should be 32 bytes (256 bits) for AES-256
  // If provided as hex string, decode it; otherwise use scrypt to derive key
  if (key.length === 64) {
    // Assume hex-encoded 32-byte key
    return Buffer.from(key, 'hex');
  }

  // Derive key from provided string using scrypt
  return crypto.scryptSync(key, 'encryption-salt', KEY_LENGTH);
}

/**
 * Encrypt sensitive data (e.g., payment gateway credentials)
 * @param data - Data to encrypt (will be JSON stringified)
 * @returns Encrypted data as hex string (format: salt:iv:tag:encrypted)
 */
export function encryptSensitiveData(data: any): string {
  try {
    const key = getEncryptionKey();
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from master key and salt
    const derivedKey = crypto.scryptSync(key, salt, KEY_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:encrypted (all hex-encoded)
    return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error: any) {
    logger.error('Encryption failed', { error: error.message });
    throw new Error(`Failed to encrypt data: ${error.message}`);
  }
}

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data string (format: salt:iv:tag:encrypted)
 * @returns Decrypted data (parsed as JSON if possible, otherwise string)
 */
export function decryptSensitiveData(encryptedData: string): any {
  try {
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');
    
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }

    const [saltHex, ivHex, tagHex, encrypted] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    // Derive key from master key and salt
    const derivedKey = crypto.scryptSync(key, salt, KEY_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Try to parse as JSON, return as string if not valid JSON
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error: any) {
    logger.error('Decryption failed', { error: error.message });
    throw new Error(`Failed to decrypt data: ${error.message}`);
  }
}

/**
 * Generate a secure encryption key (for initial setup)
 * @returns Hex-encoded 32-byte key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

