import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { RedemptionMethod, TransactionType } from '@prisma/client';
import giftCardService from './giftcard.service';
import { isExpired } from '../utils/helpers';

export interface RedeemGiftCardData {
  giftCardId?: string;
  code?: string;
  amount: number;
  merchantId: string;
  redemptionMethod: RedemptionMethod;
  location?: string;
  notes?: string;
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

    // Calculate new balance
    const newBalance = currentBalance - amount;
    const balanceBefore = new Decimal(currentBalance);
    const balanceAfter = new Decimal(newBalance);

    // Update gift card balance
    const updatedGiftCard = await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: {
        balance: balanceAfter,
        status: newBalance <= 0 ? 'REDEEMED' : 'ACTIVE',
      },
    });

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

    return {
      redemption,
      remainingBalance: newBalance,
      isFullyRedeemed: newBalance <= 0,
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
    page?: number;
    limit?: number;
  }) {
    const {
      giftCardId,
      merchantId,
      redemptionMethod,
      page = 1,
      limit = 20,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (giftCardId) where.giftCardId = giftCardId;
    if (merchantId) where.merchantId = merchantId;
    if (redemptionMethod) where.redemptionMethod = redemptionMethod;

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

