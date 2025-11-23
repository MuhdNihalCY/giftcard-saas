"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftCardTemplateService = void 0;
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
class GiftCardTemplateService {
    /**
     * Create a new template
     */
    async create(data) {
        const { merchantId, name, description, designData, isPublic = false } = data;
        if (!name || name.trim().length === 0) {
            throw new errors_1.ValidationError('Template name is required');
        }
        const template = await database_1.default.giftCardTemplate.create({
            data: {
                merchantId,
                name,
                description,
                designData: designData,
                isPublic,
            },
            include: {
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
            },
        });
        return template;
    }
    /**
     * Get template by ID
     */
    async getById(id) {
        const template = await database_1.default.giftCardTemplate.findUnique({
            where: { id },
            include: {
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
            },
        });
        if (!template) {
            throw new errors_1.NotFoundError('Template not found');
        }
        return template;
    }
    /**
     * List templates
     */
    async list(filters) {
        const { merchantId, isPublic, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (merchantId)
            where.merchantId = merchantId;
        if (isPublic !== undefined)
            where.isPublic = isPublic;
        const [templates, total] = await Promise.all([
            database_1.default.giftCardTemplate.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    merchant: {
                        select: {
                            id: true,
                            email: true,
                            businessName: true,
                        },
                    },
                },
            }),
            database_1.default.giftCardTemplate.count({ where }),
        ]);
        return {
            templates,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Update template
     */
    async update(id, data, userId) {
        const template = await this.getById(id);
        // Check if user is the owner
        if (template.merchantId !== userId) {
            throw new errors_1.ValidationError('You can only update your own templates');
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.designData !== undefined)
            updateData.designData = data.designData;
        if (data.isPublic !== undefined)
            updateData.isPublic = data.isPublic;
        const updated = await database_1.default.giftCardTemplate.update({
            where: { id },
            data: updateData,
            include: {
                merchant: {
                    select: {
                        id: true,
                        email: true,
                        businessName: true,
                    },
                },
            },
        });
        return updated;
    }
    /**
     * Delete template
     */
    async delete(id, userId) {
        const template = await this.getById(id);
        // Check if user is the owner
        if (template.merchantId !== userId) {
            throw new errors_1.ValidationError('You can only delete your own templates');
        }
        // Check if template is being used
        const giftCardsUsingTemplate = await database_1.default.giftCard.count({
            where: { templateId: id },
        });
        if (giftCardsUsingTemplate > 0) {
            throw new errors_1.ValidationError(`Cannot delete template. It is being used by ${giftCardsUsingTemplate} gift card(s)`);
        }
        await database_1.default.giftCardTemplate.delete({
            where: { id },
        });
        return { message: 'Template deleted successfully' };
    }
}
exports.GiftCardTemplateService = GiftCardTemplateService;
exports.default = new GiftCardTemplateService();
//# sourceMappingURL=giftcard-template.service.js.map