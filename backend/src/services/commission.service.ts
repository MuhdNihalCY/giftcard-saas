import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PaymentMethod, CommissionType } from '@prisma/client';
import logger from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

export interface CommissionCalculationResult {
  originalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  commissionType: CommissionType;
}

export interface GetCommissionRateData {
  merchantId?: string;
  paymentMethod: PaymentMethod;
}

export interface CreateCommissionRecordData {
  paymentId: string;
  merchantId: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  commissionType: CommissionType;
  paymentMethod: PaymentMethod;
}

export class CommissionService {
  /**
   * Get commission rate for a merchant and payment method
   * Returns merchant-specific rate if exists, otherwise global rate
   */
  async getCommissionRate(data: GetCommissionRateData): Promise<{
    rate: number;
    type: CommissionType;
  }> {
    const { merchantId, paymentMethod } = data;

    // First, try to get merchant-specific commission rate
    if (merchantId) {
      const merchantCommission = await prisma.commissionSettings.findFirst({
        where: {
          merchantId,
          isActive: true,
          appliesTo: {
            array_contains: [paymentMethod],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (merchantCommission) {
        return {
          rate: Number(merchantCommission.commissionRate),
          type: merchantCommission.commissionType,
        };
      }
    }

    // Fall back to global commission rate
    const globalCommission = await prisma.commissionSettings.findFirst({
      where: {
        merchantId: null,
        isActive: true,
        appliesTo: {
          array_contains: [paymentMethod],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (globalCommission) {
      return {
        rate: Number(globalCommission.commissionRate),
        type: globalCommission.commissionType,
      };
    }

    // Default commission rate (5% percentage)
    logger.warn('No commission settings found, using default 5%', {
      merchantId,
      paymentMethod,
    });

    return {
      rate: 5.0, // 5% default
      type: CommissionType.PERCENTAGE,
    };
  }

  /**
   * Calculate commission for an amount
   */
  async calculateCommission(
    amount: number,
    merchantId?: string,
    paymentMethod: PaymentMethod = PaymentMethod.STRIPE
  ): Promise<CommissionCalculationResult> {
    if (amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    const { rate, type } = await this.getCommissionRate({
      merchantId,
      paymentMethod,
    });

    let commissionAmount: number;
    let netAmount: number;

    if (type === CommissionType.PERCENTAGE) {
      commissionAmount = (amount * rate) / 100;
      netAmount = amount - commissionAmount;
    } else {
      // Fixed commission
      commissionAmount = rate;
      netAmount = amount - commissionAmount;
    }

    // Round to 2 decimal places
    commissionAmount = Math.round(commissionAmount * 100) / 100;
    netAmount = Math.round(netAmount * 100) / 100;

    // Ensure net amount is not negative
    if (netAmount < 0) {
      netAmount = 0;
      commissionAmount = amount;
    }

    return {
      originalAmount: amount,
      commissionRate: rate,
      commissionAmount,
      netAmount,
      commissionType: type,
    };
  }

  /**
   * Apply commission to amount (returns net amount after commission)
   */
  async applyCommission(
    amount: number,
    commissionRate: number,
    commissionType: CommissionType = CommissionType.PERCENTAGE
  ): Promise<number> {
    let commissionAmount: number;

    if (commissionType === CommissionType.PERCENTAGE) {
      commissionAmount = (amount * commissionRate) / 100;
    } else {
      commissionAmount = commissionRate;
    }

    const netAmount = amount - commissionAmount;
    return Math.max(0, Math.round(netAmount * 100) / 100);
  }

  /**
   * Get net amount after commission
   */
  getNetAmount(amount: number, commission: number): number {
    const netAmount = amount - commission;
    return Math.max(0, Math.round(netAmount * 100) / 100);
  }

  /**
   * Create commission record (for tracking and reporting)
   */
  async createCommissionRecord(data: CreateCommissionRecordData) {
    const {
      paymentId,
      merchantId,
      amount,
      commissionRate,
      commissionAmount,
      commissionType,
      paymentMethod,
    } = data;

    // Store commission in payment metadata (already done in payment service)
    // This method is for future commission tracking table if needed

    logger.info('Commission calculated', {
      paymentId,
      merchantId,
      amount,
      commissionRate,
      commissionAmount,
      commissionType,
      paymentMethod,
    });

    return {
      paymentId,
      merchantId,
      amount,
      commissionRate,
      commissionAmount,
      netAmount: amount - commissionAmount,
      commissionType,
      paymentMethod,
    };
  }

  /**
   * Get total commission for a merchant in a date range
   */
  async getTotalCommission(
    merchantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const where: any = {
      giftCard: {
        merchantId,
      },
      status: 'COMPLETED',
      commissionAmount: {
        not: null,
      },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      select: {
        commissionAmount: true,
      },
    });

    const totalCommission = payments.reduce((sum, payment) => {
      return sum + Number(payment.commissionAmount || 0);
    }, 0);

    return Math.round(totalCommission * 100) / 100;
  }

  /**
   * Create or update commission settings
   */
  async setCommissionSettings(
    merchantId: string | null, // null for global settings
    commissionRate: number,
    commissionType: CommissionType,
    appliesTo: PaymentMethod[],
    isActive: boolean = true
  ) {
    // Check if settings already exist
    const existing = merchantId
      ? await prisma.commissionSettings.findFirst({
          where: {
            merchantId,
            isActive: true,
          },
        })
      : await prisma.commissionSettings.findFirst({
          where: {
            merchantId: null,
            isActive: true,
          },
        });

    if (existing) {
      // Update existing
      return await prisma.commissionSettings.update({
        where: { id: existing.id },
        data: {
          commissionRate: new Decimal(commissionRate),
          commissionType,
          appliesTo,
          isActive,
          updatedAt: new Date(),
        },
      });
    }

    // Create new
    return await prisma.commissionSettings.create({
      data: {
        merchantId,
        commissionRate: new Decimal(commissionRate),
        commissionType,
        appliesTo,
        isActive,
      },
    });
  }

  /**
   * Get commission settings for a merchant or global
   */
  async getCommissionSettings(merchantId?: string) {
    if (merchantId) {
      const merchantSettings = await prisma.commissionSettings.findFirst({
        where: {
          merchantId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (merchantSettings) {
        return merchantSettings;
      }
    }

    // Return global settings
    return await prisma.commissionSettings.findFirst({
      where: {
        merchantId: null,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export default new CommissionService();






