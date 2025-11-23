"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGiftCardCode = generateGiftCardCode;
exports.generateRandomString = generateRandomString;
exports.formatCurrency = formatCurrency;
exports.isExpired = isExpired;
exports.daysUntilExpiry = daysUntilExpiry;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a unique gift card code
 * Format: GIFT-XXXX-XXXX-XXXX (e.g., GIFT-A1B2-C3D4-E5F6)
 */
function generateGiftCardCode() {
    const segments = [];
    for (let i = 0; i < 3; i++) {
        const segment = crypto_1.default.randomBytes(2).toString('hex').toUpperCase();
        segments.push(segment);
    }
    return `GIFT-${segments.join('-')}`;
}
/**
 * Generate a random alphanumeric string
 */
function generateRandomString(length) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
/**
 * Format currency amount
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}
/**
 * Check if a date is expired
 */
function isExpired(expiryDate) {
    if (!expiryDate)
        return false;
    return new Date(expiryDate) < new Date();
}
/**
 * Calculate days until expiry
 */
function daysUntilExpiry(expiryDate) {
    if (!expiryDate)
        return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}
//# sourceMappingURL=helpers.js.map