"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftCardController = void 0;
const giftcard_service_1 = __importDefault(require("../services/giftcard.service"));
const giftcard_template_service_1 = __importDefault(require("../services/giftcard-template.service"));
class GiftCardController {
    async create(req, res, next) {
        try {
            const userId = req.user.userId;
            const giftCard = await giftcard_service_1.default.create({
                ...req.body,
                merchantId: userId,
            });
            res.status(201).json({
                success: true,
                data: giftCard,
                message: 'Gift card created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const giftCard = await giftcard_service_1.default.getById(id);
            res.json({
                success: true,
                data: giftCard,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getByCode(req, res, next) {
        try {
            const { code } = req.params;
            const giftCard = await giftcard_service_1.default.getByCode(code);
            res.json({
                success: true,
                data: giftCard,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const { merchantId, status, page, limit } = req.query;
            const result = await giftcard_service_1.default.list({
                merchantId: merchantId,
                status: status,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: result.giftCards,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const giftCard = await giftcard_service_1.default.update(id, req.body, userId);
            res.json({
                success: true,
                data: giftCard,
                message: 'Gift card updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            await giftcard_service_1.default.delete(id, userId);
            res.json({
                success: true,
                message: 'Gift card deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async bulkCreate(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await giftcard_service_1.default.bulkCreate({
                ...req.body,
                merchantId: userId,
            });
            res.status(201).json({
                success: true,
                data: result,
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getQRCode(req, res, next) {
        try {
            const { id } = req.params;
            const giftCard = await giftcard_service_1.default.getById(id);
            res.json({
                success: true,
                data: {
                    qrCodeUrl: giftCard.qrCodeUrl,
                    code: giftCard.code,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Template methods
    async createTemplate(req, res, next) {
        try {
            const userId = req.user.userId;
            const template = await giftcard_template_service_1.default.create({
                ...req.body,
                merchantId: userId,
            });
            res.status(201).json({
                success: true,
                data: template,
                message: 'Template created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getTemplateById(req, res, next) {
        try {
            const { id } = req.params;
            const template = await giftcard_template_service_1.default.getById(id);
            res.json({
                success: true,
                data: template,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async listTemplates(req, res, next) {
        try {
            const { merchantId, isPublic, page, limit } = req.query;
            const result = await giftcard_template_service_1.default.list({
                merchantId: merchantId,
                isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: result.templates,
                pagination: result.pagination,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateTemplate(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const template = await giftcard_template_service_1.default.update(id, req.body, userId);
            res.json({
                success: true,
                data: template,
                message: 'Template updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTemplate(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            await giftcard_template_service_1.default.delete(id, userId);
            res.json({
                success: true,
                message: 'Template deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GiftCardController = GiftCardController;
exports.default = new GiftCardController();
//# sourceMappingURL=giftcard.controller.js.map