import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface CreateTemplateData {
  merchantId: string;
  name: string;
  description?: string;
  designData: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
    images?: {
      logo?: string;
      background?: string;
    };
    layout?: string;
  };
  isPublic?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  designData?: {
    colors?: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
    images?: {
      logo?: string;
      background?: string;
    };
    layout?: string;
  };
  isPublic?: boolean;
}

export class GiftCardTemplateService {
  /**
   * Create a new template
   */
  async create(data: CreateTemplateData) {
    const { merchantId, name, description, designData, isPublic = false } = data;

    if (!name || name.trim().length === 0) {
      throw new ValidationError('Template name is required');
    }

    // Provide default designData if not provided
    const defaultDesignData = {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#ffffff',
        text: '#000000',
      },
      layout: 'default',
    };

    const template = await prisma.giftCardTemplate.create({
      data: {
        merchantId,
        name,
        description,
        designData: (designData || defaultDesignData) as any,
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
  async getById(id: string) {
    const template = await prisma.giftCardTemplate.findUnique({
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
      throw new NotFoundError('Template not found');
    }

    return template;
  }

  /**
   * List templates
   */
  async list(filters: {
    merchantId?: string;
    isPublic?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { merchantId, isPublic, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (merchantId) where.merchantId = merchantId;
    if (isPublic !== undefined) where.isPublic = isPublic;

    const [templates, total] = await Promise.all([
      prisma.giftCardTemplate.findMany({
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
      prisma.giftCardTemplate.count({ where }),
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
  async update(id: string, data: UpdateTemplateData, userId: string) {
    const template = await this.getById(id);

    // Check if user is the owner
    if (template.merchantId !== userId) {
      throw new ValidationError('You can only update your own templates');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.designData !== undefined) updateData.designData = data.designData as any;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    const updated = await prisma.giftCardTemplate.update({
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
  async delete(id: string, userId: string) {
    const template = await this.getById(id);

    // Check if user is the owner
    if (template.merchantId !== userId) {
      throw new ValidationError('You can only delete your own templates');
    }

    // Check if template is being used
    const giftCardsUsingTemplate = await prisma.giftCard.count({
      where: { templateId: id },
    });

    if (giftCardsUsingTemplate > 0) {
      throw new ValidationError(
        `Cannot delete template. It is being used by ${giftCardsUsingTemplate} gift card(s)`
      );
    }

    await prisma.giftCardTemplate.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  }
}

export default new GiftCardTemplateService();

