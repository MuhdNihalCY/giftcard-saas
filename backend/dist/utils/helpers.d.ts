/**
 * Generate a unique gift card code
 * Format: GIFT-XXXX-XXXX-XXXX (e.g., GIFT-A1B2-C3D4-E5F6)
 */
export declare function generateGiftCardCode(): string;
/**
 * Generate a random alphanumeric string
 */
export declare function generateRandomString(length: number): string;
/**
 * Format currency amount
 */
export declare function formatCurrency(amount: number, currency?: string): string;
/**
 * Check if a date is expired
 */
export declare function isExpired(expiryDate: Date | null): boolean;
/**
 * Calculate days until expiry
 */
export declare function daysUntilExpiry(expiryDate: Date | null): number | null;
//# sourceMappingURL=helpers.d.ts.map