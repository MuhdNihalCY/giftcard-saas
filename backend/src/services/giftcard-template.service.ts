import { NotFoundError, ValidationError } from '../utils/errors';
import { GiftCardRepository } from '../modules/gift-cards/gift-card.repository';

export interface TemplateDesignData {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    accent?: string;
  };
  typography?: {
    fontFamily?: string;
    headingSize?: string;
    bodySize?: string;
    fontWeight?: string;
  };
  images?: {
    logo?: string;
    background?: string;
    pattern?: string;
  };
  layout?: 'classic' | 'card' | 'minimal' | 'premium' | 'modern' | 'bold' | 'elegant' | 'default';
  spacing?: {
    padding?: string;
    margin?: string;
  };
  borderRadius?: string;
  shadows?: boolean;
}

export interface CreateTemplateData {
  merchantId: string;
  name: string;
  description?: string;
  designData: TemplateDesignData;
  isPublic?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  designData?: TemplateDesignData;
  isPublic?: boolean;
}

export class GiftCardTemplateService {
  private readonly repository = new GiftCardRepository();

  /**
   * Create a new template
   */
  async create(data: CreateTemplateData) {
    const { merchantId, name, description, designData, isPublic = false } = data;

    if (!name || name.trim().length === 0) {
      throw new ValidationError('Template name is required');
    }

    // Provide default designData if not provided - Modern, impressive design
    const defaultDesignData: TemplateDesignData = {
      colors: {
        primary: '#1a365d',      // Deep navy - professional and modern
        secondary: '#2d3748',    // Charcoal - sophisticated
        background: '#ffffff',   // Pure white - clean
        text: '#1a202c',         // Dark gray - excellent readability
        accent: '#d69e2e',       // Gold accent - premium feel
      },
      typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        headingSize: '32px',
        bodySize: '16px',
        fontWeight: '700',
      },
      layout: 'modern',
      spacing: {
        padding: '32px',
        margin: '16px',
      },
      borderRadius: '16px',
      shadows: true,
    };

    const template = await this.repository.createTemplate({
      merchantId,
      name,
      description,
      designData: (designData || defaultDesignData) as any,
      isPublic,
    });

    return template;
  }

  /**
   * Get template by ID
   */
  async getById(id: string) {
    const template = await this.repository.findTemplateById(id);

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
      this.repository.findTemplates(where, skip, limit),
      this.repository.countTemplates(where),
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

    const updated = await this.repository.updateTemplate(id, updateData);

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
    const giftCardsUsingTemplate = await this.repository.countGiftCardsForTemplate(id);

    if (giftCardsUsingTemplate > 0) {
      throw new ValidationError(
        `Cannot delete template. It is being used by ${giftCardsUsingTemplate} gift card(s)`
      );
    }

    await this.repository.deleteTemplate(id);

    return { message: 'Template deleted successfully' };
  }

  /**
   * Get default template for merchant
   */
  async getDefaultTemplate(merchantId: string) {
    try {
      // Try to find merchant's default template (first template or one marked as default)
      const templates = await this.repository.findTemplatesByMerchant(merchantId);

      if (templates.length > 0) {
        return templates[0];
      }

      // Create a default template if none exists
      return this.createDefaultTemplate(merchantId);
    } catch (error: any) {
      throw new Error(`Failed to get default template: ${error.message}`);
    }
  }

  /**
   * Create default template for merchant
   */
  async createDefaultTemplate(merchantId: string) {
    const defaultDesignData: TemplateDesignData = {
      colors: {
        primary: '#1a365d',      // Deep navy - professional and modern
        secondary: '#2d3748',    // Charcoal - sophisticated
        background: '#ffffff',   // Pure white - clean
        text: '#1a202c',         // Dark gray - excellent readability
        accent: '#d69e2e',       // Gold accent - premium feel
      },
      typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        headingSize: '32px',
        bodySize: '16px',
        fontWeight: '700',
      },
      layout: 'modern',
      spacing: {
        padding: '32px',
        margin: '16px',
      },
      borderRadius: '16px',
      shadows: true,
    };

    return this.create({
      merchantId,
      name: 'Default Template',
      description: 'Default gift card template',
      designData: defaultDesignData,
      isPublic: false,
    });
  }

  /**
   * Set template as default for merchant
   */
  async setAsDefault(templateId: string, merchantId: string) {
    const template = await this.getById(templateId);

    if (template.merchantId !== merchantId) {
      throw new ValidationError('You can only set your own templates as default');
    }

    // For now, we'll just return the template
    // In the future, you could add an `isDefault` field to the schema
    return template;
  }

  /**
   * Get template usage statistics
   */
  async getUsageStats(templateId: string) {
    const [giftCardCount, productCount] = await Promise.all([
      this.repository.countGiftCardsForTemplate(templateId),
      this.repository.countProductsForTemplate(templateId),
    ]);

    return {
      giftCardCount,
      productCount,
      totalUsage: giftCardCount + productCount,
    };
  }

  /**
   * Duplicate template
   */
  async duplicate(templateId: string, merchantId: string, newName?: string) {
    const template = await this.getById(templateId);

    return this.create({
      merchantId,
      name: newName || `${template.name} (Copy)`,
      description: template.description || undefined,
      designData: template.designData as any,
      isPublic: template.isPublic,
    });
  }
}

export default new GiftCardTemplateService();
