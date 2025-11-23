"use strict";
/**
 * Validation utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidPhoneNumber = isValidPhoneNumber;
exports.isValidUrl = isValidUrl;
exports.isFutureDate = isFutureDate;
exports.isPastDate = isPastDate;
exports.isPositiveAmount = isPositiveAmount;
exports.sanitizeString = sanitizeString;
exports.isValidUUID = isValidUUID;
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate phone number format (basic)
 */
function isValidPhoneNumber(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}
/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Validate date is in the future
 */
function isFutureDate(date) {
    return date > new Date();
}
/**
 * Validate date is in the past
 */
function isPastDate(date) {
    return date < new Date();
}
/**
 * Validate amount is positive
 */
function isPositiveAmount(amount) {
    return amount > 0;
}
/**
 * Sanitize string input
 */
function sanitizeString(input) {
    return input.trim().replace(/[<>]/g, '');
}
/**
 * Validate UUID format
 */
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
//# sourceMappingURL=validation.js.map