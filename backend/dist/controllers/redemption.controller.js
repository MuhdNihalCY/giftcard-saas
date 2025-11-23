"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedemptionController = void 0;
const redemption_service_1 = __importDefault(require("../services/redemption.service"));
class RedemptionController {
    async validateGiftCard(req, res, next) {
        try {
            const result = await redemption_service_1.default.validateGiftCard(req.body);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async redeemGiftCard(req, res, next) {
        try {
            const merchantId = req.user.userId;
            const result = await redemption_service_1.default.redeemGiftCard({
                ...req.body,
                merchantId,
            });
            res.json({
                success: true,
                data: result,
                message: 'Gift card redeemed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getRedemption(req, res, next) {
        try {
            const { id } = req.params;
            const redemption = await redemption_service_1.default.getById(id);
            res.json({
                success: true,
                data: redemption,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async listRedemptions(req, res, next) {
        try {
            const { giftCardId, merchantId, redemptionMethod, page, limit, } = req.query;
            const result = await redemption_service_1.default.list({
                giftCardId: giftCardId,
                merchantId: merchantId,
                redemptionMethod: redemptionMethod,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: result.redemptions,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getGiftCardHistory(req, res, next) {
        try {
            const { id } = req.params;
            const result = await redemption_service_1.default.getGiftCardHistory(id);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async checkBalance(req, res, next) {
        try {
            const { code } = req.body;
            const result = await redemption_service_1.default.checkBalance(code);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTransactionHistory(req, res, next) {
        try {
            const { id } = req.params;
            const result = await redemption_service_1.default.getTransactionHistory(id);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Redeem via QR code (from QR code data)
     */
    async redeemViaQR(req, res, next) {
        try {
            const merchantId = req.user.userId;
            const { qrData, amount, location, notes } = req.body;
            // Parse QR code data
            let giftCardId;
            let code;
            try {
                const parsed = JSON.parse(qrData);
                giftCardId = parsed.id;
                code = parsed.code;
            }
            catch {
                // If not JSON, treat as code
                code = qrData;
            }
            const result = await redemption_service_1.default.redeemGiftCard({
                giftCardId,
                code,
                amount,
                merchantId,
                redemptionMethod: 'QR_CODE',
                location,
                notes,
            });
            res.json({
                success: true,
                data: result,
                message: 'Gift card redeemed successfully via QR code',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Redeem via link (public endpoint)
     */
    async redeemViaLink(req, res, next) {
        try {
            const { code } = req.params;
            const { amount, merchantId, location, notes } = req.body;
            if (!merchantId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MERCHANT_ID_REQUIRED',
                        message: 'Merchant ID is required for redemption',
                    },
                });
            }
            const result = await redemption_service_1.default.redeemGiftCard({
                code,
                amount,
                merchantId,
                redemptionMethod: 'LINK',
                location,
                notes,
            });
            res.json({
                success: true,
                data: result,
                message: 'Gift card redeemed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RedemptionController = RedemptionController;
exports.default = new RedemptionController();
//# sourceMappingURL=redemption.controller.js.map