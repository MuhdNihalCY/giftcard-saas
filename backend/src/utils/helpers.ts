import crypto from 'crypto';

/**
 * Generate a unique gift card code
 * Format: GIFT-XXXX-XXXX-XXXX (e.g., GIFT-A1B2-C3D4-E5F6)
 */
export function generateGiftCardCode(): string {
  const segments = [];
  for (let i = 0; i < 3; i++) {
    const segment = crypto.randomBytes(2).toString('hex').toUpperCase();
    segments.push(segment);
  }
  return `GIFT-${segments.join('-')}`;
}

/**
 * Generate a random alphanumeric string
 */
export function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Check if a date is expired
 */
export function isExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

/**
 * Calculate days until expiry
 */
export function daysUntilExpiry(expiryDate: Date | null): number | null {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

