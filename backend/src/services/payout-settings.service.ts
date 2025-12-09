import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PayoutSchedule } from '@prisma/client';
import logger from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';

export interface UpdatePayoutSettingsData {
  payoutMethod?: string; // STRIPE_CONNECT, PAYPAL, BANK_TRANSFER
  payoutSchedule?: PayoutSchedule;
  minimumPayoutAmount?: number;
  payoutAccountId?: string;
  isActive?: boolean;
}

export class PayoutSettingsService {
  /**
   * Get payout settings for a merchant
   */
  async getPayoutSettings(merchantId: string) {
    const settings = await prisma.payoutSettings.findUnique({
      where: { merchantId },
    });

    if (!settings) {
      // Return default settings
      return {
        merchantId,
        payoutMethod: 'STRIPE_CONNECT',
        payoutSchedule: PayoutSchedule.IMMEDIATE,
        minimumPayoutAmount: new Decimal(10),
        isActive: true,
      };
    }

    return settings;
  }

  /**
   * Update payout settings
   */
  async updatePayoutSettings(
    merchantId: string,
    data: UpdatePayoutSettingsData
  ) {
    // Verify merchant exists
    const merchant = await prisma.user.findUnique({
      where: { id: merchantId },
      select: { id: true, role: true },
    });

    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    if (merchant.role !== 'MERCHANT' && merchant.role !== 'ADMIN') {
      throw new ValidationError('User must be a merchant or admin');
    }

    // Validate minimum payout amount
    if (data.minimumPayoutAmount !== undefined && data.minimumPayoutAmount < 1) {
      throw new ValidationError('Minimum payout amount must be at least 1');
    }

    // Check if settings exist
    const existing = await prisma.payoutSettings.findUnique({
      where: { merchantId },
    });

    const updateData: any = {
      merchantId,
      updatedAt: new Date(),
    };

    if (data.payoutMethod !== undefined) {
      updateData.payoutMethod = data.payoutMethod;
    }
    if (data.payoutSchedule !== undefined) {
      updateData.payoutSchedule = data.payoutSchedule;
    }
    if (data.minimumPayoutAmount !== undefined) {
      updateData.minimumPayoutAmount = new Decimal(data.minimumPayoutAmount);
    }
    if (data.payoutAccountId !== undefined) {
      updateData.payoutAccountId = data.payoutAccountId;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    let settings;
    if (existing) {
      // Update existing
      settings = await prisma.payoutSettings.update({
        where: { merchantId },
        data: updateData,
      });
    } else {
      // Create new
      settings = await prisma.payoutSettings.create({
        data: {
          merchantId,
          payoutMethod: data.payoutMethod || 'STRIPE_CONNECT',
          payoutSchedule: data.payoutSchedule || PayoutSchedule.IMMEDIATE,
          minimumPayoutAmount: new Decimal(
            data.minimumPayoutAmount || 10
          ),
          payoutAccountId: data.payoutAccountId || null,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    }

    logger.info('Payout settings updated', {
      merchantId,
      settings: updateData,
    });

    return settings;
  }

  /**
   * Validate payout request
   */
  async validatePayoutRequest(merchantId: string, amount: number): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    const settings = await this.getPayoutSettings(merchantId);

    if (!settings.isActive) {
      return {
        valid: false,
        reason: 'Payout settings are not active',
      };
    }

    const minimumAmount = Number(settings.minimumPayoutAmount);
    if (amount < minimumAmount) {
      return {
        valid: false,
        reason: `Amount must be at least ${minimumAmount}`,
      };
    }

    return { valid: true };
  }
}

export default new PayoutSettingsService();

