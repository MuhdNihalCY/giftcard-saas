"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = __importDefault(require("../services/analytics.service"));
class AnalyticsController {
    async getSalesAnalytics(req, res, next) {
        try {
            const { merchantId, startDate, endDate } = req.query;
            const result = await analytics_service_1.default.getSalesAnalytics({
                merchantId: merchantId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getRedemptionAnalytics(req, res, next) {
        try {
            const { merchantId, startDate, endDate } = req.query;
            const result = await analytics_service_1.default.getRedemptionAnalytics({
                merchantId: merchantId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCustomerAnalytics(req, res, next) {
        try {
            const { merchantId, startDate, endDate } = req.query;
            const result = await analytics_service_1.default.getCustomerAnalytics({
                merchantId: merchantId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getGiftCardStats(req, res, next) {
        try {
            const { merchantId } = req.query;
            const result = await analytics_service_1.default.getGiftCardStats({
                merchantId: merchantId,
            });
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
exports.default = new AnalyticsController();
//# sourceMappingURL=analytics.controller.js.map