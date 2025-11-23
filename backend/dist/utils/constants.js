"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSACTION_TYPES = exports.REDEMPTION_METHODS = exports.PAYMENT_STATUS = exports.PAYMENT_METHODS = exports.GIFT_CARD_STATUS = exports.USER_ROLES = void 0;
exports.USER_ROLES = {
    ADMIN: 'ADMIN',
    MERCHANT: 'MERCHANT',
    CUSTOMER: 'CUSTOMER',
};
exports.GIFT_CARD_STATUS = {
    ACTIVE: 'ACTIVE',
    REDEEMED: 'REDEEMED',
    EXPIRED: 'EXPIRED',
    CANCELLED: 'CANCELLED',
};
exports.PAYMENT_METHODS = {
    STRIPE: 'STRIPE',
    PAYPAL: 'PAYPAL',
    RAZORPAY: 'RAZORPAY',
    UPI: 'UPI',
};
exports.PAYMENT_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
};
exports.REDEMPTION_METHODS = {
    QR_CODE: 'QR_CODE',
    CODE_ENTRY: 'CODE_ENTRY',
    LINK: 'LINK',
    API: 'API',
};
exports.TRANSACTION_TYPES = {
    PURCHASE: 'PURCHASE',
    REDEMPTION: 'REDEMPTION',
    REFUND: 'REFUND',
    EXPIRY: 'EXPIRY',
};
//# sourceMappingURL=constants.js.map