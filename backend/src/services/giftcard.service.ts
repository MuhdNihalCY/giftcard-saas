import crypto from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';
import { NotFoundError, ValidationError } from '../utils/errors';
import { generateGiftCardCode, isExpired } from '../utils/helpers';
import qrCodeService from './qrcode.service';
import { GiftCardStatus, GiftCard, Prisma } from '@prisma/client';
import cacheService, { CacheKeys } from './cache.service';
import type { PaginationResult } from '../types';
import giftCardTemplateService from './giftcard-template.service';
import { GiftCardRepository } from '../modules/gift-cards/gift-card.repository';
import logger from '../utils/logger';

export interface CreateGiftCardData {
  merchantId: string;
  value: number;
  currency?: string;
  expiryDate?: Date;
  templateId?: string;
  productId?: string;
  customMessage?: string;
  recipientEmail?: string;
  recipientName?: string;
  allowPartialRedemption?: boolean;
}

export interface UpdateGiftCardData {
  value?: number;
  expiryDate?: Date;
  customMessage?: string;
  recipientEmail?: string;
  recipientName?: string;
  allowPartialRedemption?: boolean;
  status?: GiftCardStatus;
}

import type { GiftCardTemplate } from '@prisma/client';

type GiftCardWithRelations = GiftCard & {
  merchant: {
    id: string;
    email: string;
    businessName: string | null;
    businessLogo: string | null;
  };
  template: GiftCardTemplate | null;
};

export class GiftCardService {
  private readonly repository = new GiftCardRepository();

  /**
   * Create a new gift card
   */
  async create(data: CreateGiftCardData) {
    const {
      merchantId,
      value,
      currency = 'USD',
      expiryDate,
      templateId,
      productId,
      customMessage,
      recipientEmail,
      recipientName,
      allowPartialRedemption = true,
    } = data;

    // Validate value
    if (value <= 0) {
      throw new ValidationError('Gift card value must be greater than 0');
    }

    // Generate unique code
    let code = generateGiftCardCode();
    let codeExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure code is unique
    while (codeExists && attempts < maxAttempts) {
      const exists = await this.repository.codeExists(code);
      if (!exists) {
        codeExists = false;
      } else {
        code = generateGiftCardCode();
        attempts++;
      }
    }

    if (codeExists) {
      throw new Error('Failed to generate unique gift card code');
    }

    // Get template ID - use provided, product's template, or merchant's default
    let finalTemplateId = templateId;

    if (!finalTemplateId && productId) {
      // Get product's template if gift card is created from product
      const product = await this.repository.findProductById(productId);
      if (product?.templateId) {
        finalTemplateId = product.templateId;
      }
    }

    if (!finalTemplateId) {
      // Get merchant's default template
      const defaultTemplate = await giftCardTemplateService.getDefaultTemplate(merchantId);
      finalTemplateId = defaultTemplate.id;
    }

    // Generate QR code
    const giftCardId = crypto.randomUUID();
    const qrCodeData = qrCodeService.generateGiftCardData(giftCardId, code);
    const qrCodeDataURL = await qrCodeService.generateDataURL(qrCodeData);

    // Create gift card
    const giftCard = await this.repository.createWithId({
      id: giftCardId,
      merchantId,
      code,
      qrCodeUrl: qrCodeDataURL,
      value: new Decimal(value),
      currency,
      balance: new Decimal(value),
      expiryDate,
      templateId: finalTemplateId,
      productId,
      customMessage,
      recipientEmail,
      recipientName,
      allowPartialRedemption,
      status: 'ACTIVE',
    });

    // Invalidate merchant gift cards cache
    await cacheService.invalidate(`giftcards:merchant:${merchantId}:*`);

    return giftCard;
  }

  /**
   * Get gift card by ID
   */
  async getById(id: string, _userId?: string): Promise<GiftCardWithRelations> {
    const cacheKey = CacheKeys.giftCard(id);

    // Try to get from cache
    const cached = await cacheService.get<GiftCardWithRelations>(cacheKey);
    if (cached) {
      return cached;
    }

    const giftCard = await this.repository.findById(id);

    if (!giftCard) {
      throw new NotFoundError('Gift card not found');
    }

    // Check if expired
    if (giftCard.status === 'ACTIVE' && isExpired(giftCard.expiryDate)) {
      await this.updateStatus(id, 'EXPIRED');
      giftCard.status = 'EXPIRED';
    }

    // Cache for 5 minutes
    await cacheService.set(cacheKey, giftCard, 300);

    return giftCard as GiftCardWithRelations;
  }

  /**
   * Get gift card by code
   */
  async getByCode(code: string): Promise<GiftCardWithRelations> {
    const cacheKey = CacheKeys.giftCardByCode(code);

    // Try to get from cache
    const cached = await cacheService.get<GiftCardWithRelations>(cacheKey);
    if (cached) {
      return cached;
    }

    const giftCard = await this.repository.findByCode(code);

    if (!giftCard) {
      throw new NotFoundError('Gift card not found');
    }

    // Check if expired
    if (giftCard.status === 'ACTIVE' && isExpired(giftCard.expiryDate)) {
      await this.updateStatus(giftCard.id, 'EXPIRED');
      giftCard.status = 'EXPIRED';
    }

    // Cache for 5 minutes
    await cacheService.set(cacheKey, giftCard, 300);
    // Also cache by ID
    await cacheService.set(CacheKeys.giftCard(giftCard.id), giftCard, 300);

    return giftCard as GiftCardWithRelations;
  }

  /**
   * List gift cards with filters
   */
  async list(filters: {
    merchantId?: string;
    status?: GiftCardStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ giftCards: GiftCardWithRelations[]; pagination: PaginationResult }> {
    const { merchantId, status, search, page = 1, limit = 20 } = filters;

    // Build cache key
    let cacheKey: string;
    if (merchantId) {
      cacheKey = CacheKeys.merchantGiftCards(merchantId, page, limit);
      if (search) {
        cacheKey += `:search:${search}`;
      }
      if (status) {
        cacheKey += `:status:${status}`;
      }
    } else {
      cacheKey = `giftcards:all:page:${page}:limit:${limit}:status:${status || 'all'}`;
      if (search) {
        cacheKey += `:search:${search}`;
      }
    }

    // Try to get from cache (errors are handled internally, won't throw)
    let cached: { giftCards: GiftCardWithRelations[]; pagination: PaginationResult } | null = null;
    try {
      cached = await cacheService.get<{ giftCards: GiftCardWithRelations[]; pagination: PaginationResult }>(cacheKey);
    } catch (error) {
      // Cache errors should not break the request - just log and continue
      logger.warn('Cache get error in gift card list', { error });
    }
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;

    const where: Prisma.GiftCardWhereInput = {};
    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;

    // Add search functionality
    if (search && search.trim()) {
      where.OR = [
        { code: { contains: search.trim(), mode: 'insensitive' } },
        { recipientEmail: { contains: search.trim(), mode: 'insensitive' } },
        { recipientName: { contains: search.trim(), mode: 'insensitive' } },
        {
          merchant: {
            businessName: { contains: search.trim(), mode: 'insensitive' },
          },
        },
      ];
    }

    const [giftCards, total] = await Promise.all([
      this.repository.findMany(where, skip, limit),
      this.repository.count(where),
    ]);

    const result = {
      giftCards: giftCards as GiftCardWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache for 2 minutes (errors are handled internally, won't throw)
    try {
    await cacheService.set(cacheKey, result, 120);
    } catch (error) {
      // Cache errors should not break the request - just log and continue
      logger.warn('Cache set error in gift card list', { error });
    }

    return result;
  }

  /**
   * Get suggestions for autocomplete
   */
  async suggestions(query: string, merchantId?: string): Promise<Array<{
    id: string;
    code: string;
    merchantName: string;
    recipientEmail?: string;
    displayText: string;
  }>> {
    if (!query || !query.trim()) {
      return [];
    }

    const searchTerm = query.trim();
    const where: Prisma.GiftCardWhereInput = {};

    if (merchantId) {
      where.merchantId = merchantId;
    }

    // Add search functionality
    where.OR = [
      { code: { contains: searchTerm, mode: 'insensitive' } },
      { recipientEmail: { contains: searchTerm, mode: 'insensitive' } },
      { recipientName: { contains: searchTerm, mode: 'insensitive' } },
      {
        merchant: {
          businessName: { contains: searchTerm, mode: 'insensitive' },
        },
      },
    ];

    const giftCards = await this.repository.findForSearch(where);

    return giftCards.map((card) => ({
      id: card.id,
      code: card.code,
      merchantName: card.merchant.businessName || 'Unknown Merchant',
      recipientEmail: card.recipientEmail || undefined,
      displayText: `${card.code}${card.merchant.businessName ? ` - ${card.merchant.businessName}` : ''}${card.recipientEmail ? ` (${card.recipientEmail})` : ''}`,
    }));
  }

  /**
   * Update gift card
   */
  async update(id: string, data: UpdateGiftCardData, userId: string) {
    const giftCard = await this.getById(id);

    // Check if user is the merchant
    if (giftCard.merchantId !== userId) {
      throw new ValidationError('You can only update your own gift cards');
    }

    // Validate value if provided
    if (data.value !== undefined && data.value <= 0) {
      throw new ValidationError('Gift card value must be greater than 0');
    }

    const updateData: Prisma.GiftCardUpdateInput = {};
    if (data.value !== undefined) {
      updateData.value = new Decimal(data.value);
      // If balance is still full, update balance too
      if (giftCard.balance.equals(giftCard.value)) {
        updateData.balance = new Decimal(data.value);
      }
    }
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate;
    if (data.customMessage !== undefined) updateData.customMessage = data.customMessage;
    if (data.recipientEmail !== undefined) updateData.recipientEmail = data.recipientEmail;
    if (data.recipientName !== undefined) updateData.recipientName = data.recipientName;
    if (data.allowPartialRedemption !== undefined) updateData.allowPartialRedemption = data.allowPartialRedemption;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await this.repository.update(id, updateData);

    // Invalidate cache
    await cacheService.delete(CacheKeys.giftCard(id));
    await cacheService.delete(CacheKeys.giftCardByCode(updated.code));
    await cacheService.invalidate(`giftcards:merchant:${updated.merchantId}:*`);

    return updated;
  }

  /**
   * Delete gift card
   */
  async delete(id: string, userId: string) {
    const giftCard = await this.getById(id);

    // Check if user is the merchant
    if (giftCard.merchantId !== userId) {
      throw new ValidationError('You can only delete your own gift cards');
    }

    // Only allow deletion if not redeemed
    if (giftCard.status === 'REDEEMED') {
      throw new ValidationError('Cannot delete a redeemed gift card');
    }

    await this.repository.delete(id);

    // Invalidate cache
    await cacheService.delete(CacheKeys.giftCard(id));
    await cacheService.delete(CacheKeys.giftCardByCode(giftCard.code));
    await cacheService.invalidate(`giftcards:merchant:${giftCard.merchantId}:*`);

    return { message: 'Gift card deleted successfully' };
  }

  /**
   * Update gift card status
   */
  async updateStatus(id: string, status: GiftCardStatus) {
    return this.repository.updateStatus(id, status);
  }

  /**
   * Bulk create gift cards
   */
  async bulkCreate(data: {
    merchantId: string;
    count: number;
    value: number;
    currency?: string;
    expiryDate?: Date;
    templateId?: string;
  }) {
    const { merchantId, count, value, currency = 'USD', expiryDate, templateId } = data;

    if (count <= 0 || count > 1000) {
      throw new ValidationError('Count must be between 1 and 1000');
    }

    if (value <= 0) {
      throw new ValidationError('Gift card value must be greater than 0');
    }

    const giftCards = [];

    for (let i = 0; i < count; i++) {
      let code = generateGiftCardCode();
      let codeExists = true;
      let attempts = 0;

      while (codeExists && attempts < 10) {
        const exists = await this.repository.codeExists(code);
        if (!exists) {
          codeExists = false;
        } else {
          code = generateGiftCardCode();
          attempts++;
        }
      }

      if (codeExists) {
        throw new Error(`Failed to generate unique code for gift card ${i + 1}`);
      }

      const giftCardId = crypto.randomUUID();
      const qrCodeData = qrCodeService.generateGiftCardData(giftCardId, code);
      const qrCodeDataURL = await qrCodeService.generateDataURL(qrCodeData);

      giftCards.push({
        id: giftCardId,
        merchantId,
        code,
        qrCodeUrl: qrCodeDataURL,
        value: new Decimal(value),
        currency,
        balance: new Decimal(value),
        expiryDate,
        templateId,
        allowPartialRedemption: true,
        status: 'ACTIVE' as GiftCardStatus,
      });
    }

    // Use createMany for better performance
    const result = await this.repository.createMany(giftCards);

    return {
      count: result.count,
      message: `Successfully created ${result.count} gift cards`,
    };
  }
}

export default new GiftCardService();

