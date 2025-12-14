import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { RedemptionMethod, PaymentMethod } from '@prisma/client';
import giftCardService from './giftcard.service';
import cacheService, { CacheKeys } from './cache.service';
import fraudPreventionService from './fraud-prevention.service';
import commissionService from './commission.service';
import { isExpired } from '../utils/helpers';
import logger from '../utils/logger';

export interface RedeemGiftCardData {
  giftCardId?: string;
  code?: string;
  amount: number;
  merchantId: string;
  redemptionMethod: RedemptionMethod;
  location?: string;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ValidateGiftCardData {
  code: string;
}

export class RedemptionService {
  /**
   * Validate gift card code
   */
  async validateGiftCard(data: ValidateGiftCardData) {
    const { code } = data;

    const giftCard = await giftCardService.getByCode(code);

    // Check if expired
    if (giftCard.status === 'ACTIVE' && isExpired(giftCard.expiryDate)) {
      await giftCardService.updateStatus(giftCard.id, 'EXPIRED');
      throw new ValidationError('Gift card has expired');
    }

    if (giftCard.status !== 'ACTIVE') {
      throw new ValidationError(`Gift card is ${giftCard.status.toLowerCase()}`);
    }

    return {
      valid: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        balance: Number(giftCard.balance),
        value: Number(giftCard.value),
        currency: giftCard.currency,
        allowPartialRedemption: giftCard.allowPartialRedemption,
        expiryDate: giftCard.expiryDate,
        status: giftCard.status,
      },
    };
  }

  /**
   * Redeem gift card
   */
  async redeemGiftCard(data: RedeemGiftCardData) {
    const {
      giftCardId,
      code,
      amount,
      merchantId,
      redemptionMethod,
      location,
      notes,
    } = data;

    // Get gift card
    let giftCard;
    if (giftCardId) {
      giftCard = await giftCardService.getById(giftCardId);
    } else if (code) {
      giftCard = await giftCardService.getByCode(code);
    } else {
      throw new ValidationError('Either giftCardId or code must be provided');
    }

    // Validate gift card status
    if (giftCard.status === 'ACTIVE' && isExpired(giftCard.expiryDate)) {
      await giftCardService.updateStatus(giftCard.id, 'EXPIRED');
      throw new ValidationError('Gift card has expired');
    }

    if (giftCard.status !== 'ACTIVE') {
      throw new ValidationError(`Gift card is ${giftCard.status.toLowerCase()}`);
    }

    // Validate amount
    const currentBalance = Number(giftCard.balance);
    if (amount <= 0) {
      throw new ValidationError('Redemption amount must be greater than 0');
    }

    if (amount > currentBalance) {
      throw new ValidationError(
        `Redemption amount (${amount}) exceeds available balance (${currentBalance})`
      );
    }

    // Check if partial redemption is allowed
    if (amount < currentBalance && !giftCard.allowPartialRedemption) {
      throw new ValidationError(
        'Partial redemption is not allowed for this gift card'
      );
    }

    // Perform fraud prevention checks for redemption patterns
    try {
      const fraudCheck = await fraudPreventionService.checkRedemptionPatterns(
        giftCard.id,
        merchantId
      );

      if (fraudCheck.requiresManualReview) {
        logger.warn('Redemption flagged for manual review', {
          giftCardId: giftCard.id,
          merchantId,
          amount,
          riskScore: fraudCheck.riskScore,
          reason: fraudCheck.reason,
        });
        // Continue with redemption but log for review
      }
    } catch (error) {
      // Don't block redemption if fraud check fails, just log it
      logger.error('Fraud check error during redemption', {
        giftCardId: giftCard.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Calculate new balance
    const newBalance = currentBalance - amount;
    const balanceBefore = new Decimal(currentBalance);
    const balanceAfter = new Decimal(newBalance);

    // Update gift card balance
    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: {
        balance: balanceAfter,
        status: newBalance <= 0 ? 'REDEEMED' : 'ACTIVE',
      },
    });

    // Track IP address for redemption
    if (data.ipAddress) {
      const ipTrackingService = (await import('./ip-tracking.service')).default;
      await ipTrackingService.trackIP({
        ipAddress: data.ipAddress,
        userId: merchantId,
        action: 'REDEMPTION',
        resourceId: giftCard.id,
        userAgent: data.userAgent,
      });
    }

    // Create redemption record
    const redemption = await prisma.redemption.create({
      data: {
        giftCardId: giftCard.id,
        merchantId,
        amount: new Decimal(amount),
        balanceBefore,
        balanceAfter,
        redemptionMethod,
        location,
        notes,
      },
      include: {
        giftCard: {
          select: {
            id: true,
            code: true,
            value: true,
            currency: true,
          },
        },
        merchant: {
          select: {
            id: true,
            email: true,
            businessName: true,
          },
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        giftCardId: giftCard.id,
        type: 'REDEMPTION',
        amount: new Decimal(amount),
        balanceBefore,
        balanceAfter,
        userId: merchantId,
        metadata: {
          redemptionId: redemption.id,
          redemptionMethod,
          location,
        } as any,
      },
    });

    // Calculate commission and update merchant balance
    // Commission is calculated on redemption amount (what merchant receives)
    const commissionResult = await commissionService.calculateCommission(
      amount,
      merchantId,
      PaymentMethod.STRIPE // Default, commission is same regardless of payment method
    );

    const netAmount = commissionResult.netAmount;

    // Update merchant balance with net amount (after commission)
    const merchant = await prisma.user.findUnique({
      where: { id: merchantId },
      select: { merchantBalance: true },
    });

    if (merchant) {
      const currentBalance = Number(merchant.merchantBalance);
      const newMerchantBalance = currentBalance + netAmount;

      await prisma.user.update({
        where: { id: merchantId },
        data: {
          merchantBalance: new Decimal(newMerchantBalance),
        },
      });

      logger.info('Merchant balance updated after redemption', {
        merchantId,
        redemptionAmount: amount,
        commissionAmount: commissionResult.commissionAmount,
        netAmount,
        previousBalance: currentBalance,
        newBalance: newMerchantBalance,
      });
    }

    // Invalidate cache
    await cacheService.delete(CacheKeys.giftCard(giftCard.id));
    await cacheService.delete(CacheKeys.giftCardByCode(giftCard.code));
    await cacheService.invalidate(`giftcards:merchant:${giftCard.merchantId}:*`);

    return {
      redemption,
      remainingBalance: newBalance,
      isFullyRedeemed: newBalance <= 0,
      commission: {
        amount: commissionResult.commissionAmount,
        rate: commissionResult.commissionRate,
        netAmount,
      },
    };
  }

  /**
   * Get redemption by ID
   */
  async getById(id: string) {
    const redemption = await prisma.redemption.findUnique({
      where: { id },
      include: {
        giftCard: {
          include: {
            merchant: {
              select: {
                id: true,
                email: true,
                businessName: true,
              },
            },
          },
        },
        merchant: {
          select: {
            id: true,
            email: true,
            businessName: true,
          },
        },
      },
    });

    if (!redemption) {
      throw new NotFoundError('Redemption not found');
    }

    return redemption;
  }

  /**
   * List redemptions
   */
  async list(filters: {
    giftCardId?: string;
    merchantId?: string;
    redemptionMethod?: RedemptionMethod;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      giftCardId,
      merchantId,
      redemptionMethod,
      search,
      page = 1,
      limit = 20,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (giftCardId) where.giftCardId = giftCardId;
    if (merchantId) where.merchantId = merchantId;
    if (redemptionMethod) where.redemptionMethod = redemptionMethod;
    
    // Add search functionality
    if (search && search.trim()) {
      where.OR = [
        { location: { contains: search.trim(), mode: 'insensitive' } },
        { notes: { contains: search.trim(), mode: 'insensitive' } },
        {
          giftCard: {
            code: { contains: search.trim(), mode: 'insensitive' },
          },
        },
      ];
    }

    const [redemptions, total] = await Promise.all([
      prisma.redemption.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          giftCard: {
            select: {
              id: true,
              code: true,
              value: true,
              currency: true,
            },
          },
          merchant: {
            select: {
              id: true,
              email: true,
              businessName: true,
            },
          },
        },
      }),
      prisma.redemption.count({ where }),
    ]);

    return {
      redemptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get suggestions for autocomplete
   */
  async suggestions(query: string): Promise<Array<{
    id: string;
    giftCardCode: string;
    location?: string;
    displayText: string;
  }>> {
    if (!query || !query.trim()) {
      return [];
    }

    const searchTerm = query.trim();
    const where: any = {
      OR: [
        { location: { contains: searchTerm, mode: 'insensitive' } },
        { notes: { contains: searchTerm, mode: 'insensitive' } },
        {
          giftCard: {
            code: { contains: searchTerm, mode: 'insensitive' },
          },
        },
      ],
    };

    const redemptions = await prisma.redemption.findMany({
      where,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        giftCard: {
          select: {
            code: true,
          },
        },
      },
    });

    return redemptions.map((redemption) => ({
      id: redemption.id,
      giftCardCode: redemption.giftCard.code,
      location: redemption.location || undefined,
      displayText: `${redemption.giftCard.code}${redemption.location ? ` - ${redemption.location}` : ''}`,
    }));
  }

  /**
   * Get redemption history for a gift card
   */
  async getGiftCardHistory(giftCardId: string) {
    const giftCard = await giftCardService.getById(giftCardId);

    const redemptions = await prisma.redemption.findMany({
      where: { giftCardId },
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
    });

    return {
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        value: Number(giftCard.value),
        balance: Number(giftCard.balance),
        currency: giftCard.currency,
        status: giftCard.status,
      },
      redemptions,
      totalRedeemed: Number(giftCard.value) - Number(giftCard.balance),
    };
  }

  /**
   * Check gift card balance
   */
  async checkBalance(code: string) {
    const giftCard = await giftCardService.getByCode(code);

    // Check if expired
    if (giftCard.status === 'ACTIVE' && isExpired(giftCard.expiryDate)) {
      await giftCardService.updateStatus(giftCard.id, 'EXPIRED');
      return {
        code: giftCard.code,
        balance: Number(giftCard.balance),
        value: Number(giftCard.value),
        currency: giftCard.currency,
        status: 'EXPIRED',
        expiryDate: giftCard.expiryDate,
      };
    }

    return {
      code: giftCard.code,
      balance: Number(giftCard.balance),
      value: Number(giftCard.value),
      currency: giftCard.currency,
      status: giftCard.status,
      expiryDate: giftCard.expiryDate,
      allowPartialRedemption: giftCard.allowPartialRedemption,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(giftCardId: string) {
    const giftCard = await giftCardService.getById(giftCardId);

    const transactions = await prisma.transaction.findMany({
      where: { giftCardId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        value: Number(giftCard.value),
        balance: Number(giftCard.balance),
        currency: giftCard.currency,
      },
      transactions,
    };
  }
}

export default new RedemptionService();

