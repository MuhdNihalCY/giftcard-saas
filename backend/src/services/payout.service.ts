import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PayoutStatus, GatewayType } from '@prisma/client';
import logger from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';
import merchantPaymentGatewayService from './merchant-payment-gateway.service';
import stripeConnectService from './payment/stripe-connect.service';
import paypalConnectService from './payment/paypal-connect.service';
import payoutSettingsService from './payout-settings.service';

export interface RequestPayoutData {
  merchantId: string;
  amount: number;
  method?: string; // STRIPE_CONNECT, PAYPAL, BANK_TRANSFER
}

export interface ProcessPayoutData {
  payoutId: string;
}

export interface SchedulePayoutData {
  merchantId: string;
  amount: number;
  scheduleDate: Date;
  method?: string;
}

export class PayoutService {
  /**
   * Calculate available balance for payout (merchant balance minus pending payouts)
   */
  async calculateAvailableBalance(merchantId: string): Promise<number> {
    const merchant = await prisma.user.findUnique({
      where: { id: merchantId },
      select: { merchantBalance: true },
    });

    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    // Get sum of pending and processing payouts
    const pendingPayouts = await prisma.payout.aggregate({
      where: {
        merchantId,
        status: {
          in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING],
        },
      },
      _sum: {
        amount: true,
      },
    });

    const pendingAmount = Number(pendingPayouts._sum.amount || 0);
    const totalBalance = Number(merchant.merchantBalance);
    const availableBalance = Math.max(0, totalBalance - pendingAmount);

    return Math.round(availableBalance * 100) / 100;
  }

  /**
   * Request payout (creates payout record)
   */
  async requestPayout(data: RequestPayoutData) {
    const { merchantId, amount, method } = data;

    // Validate merchant
    const merchant = await prisma.user.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        role: true,
        merchantBalance: true,
      },
    });

    if (!merchant) {
      throw new NotFoundError('Merchant not found');
    }

    if (merchant.role !== 'MERCHANT' && merchant.role !== 'ADMIN') {
      throw new ValidationError('User must be a merchant or admin');
    }

    // Get payout settings
    const settings = await payoutSettingsService.getPayoutSettings(merchantId);

    // Validate amount
    if (amount <= 0) {
      throw new ValidationError('Payout amount must be greater than zero');
    }

    // Check minimum payout amount
    const minimumAmount = settings?.minimumPayoutAmount
      ? Number(settings.minimumPayoutAmount)
      : 10; // Default minimum

    if (amount < minimumAmount) {
      throw new ValidationError(
        `Payout amount must be at least ${minimumAmount} ${merchant.merchantBalance ? 'USD' : ''}`
      );
    }

    // Check available balance
    const availableBalance = await this.calculateAvailableBalance(merchantId);
    if (amount > availableBalance) {
      throw new ValidationError(
        `Insufficient balance. Available: ${availableBalance}, Requested: ${amount}`
      );
    }

    // Determine payout method from settings or parameter
    const payoutMethod =
      method || settings?.payoutMethod || 'STRIPE_CONNECT';

    // Get payout account ID from settings or gateway
    let payoutAccountId: string | null = null;

    if (payoutMethod === 'STRIPE_CONNECT') {
      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.STRIPE
      );
      payoutAccountId = gateway?.connectAccountId || null;
    } else if (payoutMethod === 'PAYPAL') {
      const gateway = await merchantPaymentGatewayService.getGatewayForMerchant(
        merchantId,
        GatewayType.PAYPAL
      );
      if (gateway?.metadata?.email) {
        payoutAccountId = gateway.metadata.email as string;
      }
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        merchantId,
        amount: new Decimal(amount),
        currency: 'USD', // Default currency - can be made dynamic based on merchant settings in future
        status: PayoutStatus.PENDING,
        payoutMethod,
        payoutAccountId,
        netAmount: new Decimal(amount), // No commission on payouts (commission already deducted)
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

    logger.info('Payout requested', {
      payoutId: payout.id,
      merchantId,
      amount,
      method: payoutMethod,
    });

    // Process immediately if schedule is IMMEDIATE
    if (settings?.payoutSchedule === 'IMMEDIATE' || !settings) {
      try {
        await this.processPayout({ payoutId: payout.id });
      } catch (error: any) {
        logger.error('Failed to process immediate payout', {
          payoutId: payout.id,
          error: error.message,
        });
        // Don't throw - payout is created and can be retried
      }
    }

    return payout;
  }

  /**
   * Process payout (execute the actual transfer)
   */
  async processPayout(data: ProcessPayoutData) {
    const { payoutId } = data;

    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!payout) {
      throw new NotFoundError('Payout not found');
    }

    if (payout.status !== PayoutStatus.PENDING) {
      throw new ValidationError(`Payout is already ${payout.status}`);
    }

    // Update status to PROCESSING
    await prisma.payout.update({
      where: { id: payoutId },
      data: { status: PayoutStatus.PROCESSING },
    });

    try {
      const amount = Number(payout.amount);
      const currency = payout.currency;

      let transactionId: string | undefined;
      let success = false;

      // Process based on payout method
      switch (payout.payoutMethod) {
        case 'STRIPE_CONNECT':
          if (!payout.payoutAccountId) {
            throw new ValidationError('Stripe Connect account ID is required');
          }
          const stripeResult = await stripeConnectService.createPayout(
            payout.payoutAccountId,
            amount,
            currency
          );
          transactionId = stripeResult.payoutId;
          success = stripeResult.status === 'paid' || stripeResult.status === 'pending';
          break;

        case 'PAYPAL':
          if (!payout.payoutAccountId) {
            throw new ValidationError('PayPal account email is required');
          }
          const paypalResult = await paypalConnectService.payoutToMerchant({
            merchantId: payout.merchantId,
            amount,
            currency,
            email: payout.payoutAccountId,
          });
          transactionId = paypalResult.payoutBatchId;
          success = paypalResult.status === 'SUCCESS' || paypalResult.status === 'PENDING';
          break;

        case 'BANK_TRANSFER':
          // Bank transfer requires manual processing
          // For now, mark as processing and require admin action
          logger.info('Bank transfer payout requires manual processing', {
            payoutId,
            merchantId: payout.merchantId,
            amount,
          });
          // Keep status as PROCESSING - admin needs to manually complete
          return await prisma.payout.findUnique({
            where: { id: payoutId },
          });
        default:
          throw new ValidationError(`Unsupported payout method: ${payout.payoutMethod}`);
      }

      if (success) {
        // Update payout status to COMPLETED
        const updatedPayout = await prisma.payout.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.COMPLETED,
            transactionId,
            processedAt: new Date(),
            webhookData: {
              processedAt: new Date().toISOString(),
              transactionId,
            },
          },
        });

        // Deduct from merchant balance
        const merchant = await prisma.user.findUnique({
          where: { id: payout.merchantId },
          select: { merchantBalance: true },
        });

        if (merchant) {
          const currentBalance = Number(merchant.merchantBalance);
          const newBalance = Math.max(0, currentBalance - amount);

          await prisma.user.update({
            where: { id: payout.merchantId },
            data: {
              merchantBalance: new Decimal(newBalance),
            },
          });

          logger.info('Merchant balance updated after payout', {
            merchantId: payout.merchantId,
            payoutAmount: amount,
            previousBalance: currentBalance,
            newBalance,
          });
        }

        logger.info('Payout processed successfully', {
          payoutId,
          transactionId,
          method: payout.payoutMethod,
        });

        return updatedPayout;
      } else {
        throw new ValidationError('Payout processing failed');
      }
    } catch (error: any) {
      // Update payout status to FAILED
      await prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.FAILED,
          failureReason: error.message,
        },
      });

      logger.error('Payout processing failed', {
        payoutId,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Schedule payout for future processing
   */
  async schedulePayout(data: SchedulePayoutData) {
    const { merchantId, amount, scheduleDate, method } = data;

    // Validate schedule date is in the future
    if (scheduleDate <= new Date()) {
      throw new ValidationError('Schedule date must be in the future');
    }

    // Create payout with scheduled date
    const payout = await prisma.payout.create({
      data: {
        merchantId,
        amount: new Decimal(amount),
        currency: 'USD', // Default currency - can be made dynamic based on merchant settings in future
        status: PayoutStatus.PENDING,
        payoutMethod: method || 'STRIPE_CONNECT',
        scheduledFor: scheduleDate,
      },
    });

    logger.info('Payout scheduled', {
      payoutId: payout.id,
      merchantId,
      amount,
      scheduleDate,
    });

    return payout;
  }

  /**
   * Process scheduled payouts (called by scheduler)
   */
  async processScheduledPayouts() {
    const now = new Date();

    // Find payouts scheduled for now or earlier
    const scheduledPayouts = await prisma.payout.findMany({
      where: {
        status: PayoutStatus.PENDING,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    logger.info(`Processing ${scheduledPayouts.length} scheduled payouts`);

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const payout of scheduledPayouts) {
      try {
        await this.processPayout({ payoutId: payout.id });
        results.processed++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Payout ${payout.id}: ${error.message}`);
        logger.error('Failed to process scheduled payout', {
          payoutId: payout.id,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Retry failed payout
   */
  async retryFailedPayout(payoutId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new NotFoundError('Payout not found');
    }

    if (payout.status !== PayoutStatus.FAILED) {
      throw new ValidationError('Can only retry failed payouts');
    }

    // Reset status to PENDING and increment retry count
    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.PENDING,
        retryCount: payout.retryCount + 1,
        failureReason: null,
      },
    });

    // Process the payout
    return await this.processPayout({ payoutId });
  }

  /**
   * Get payout by ID
   */
  async getById(id: string) {
    const payout = await prisma.payout.findUnique({
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

    if (!payout) {
      throw new NotFoundError('Payout not found');
    }

    return payout;
  }

  /**
   * Get payout history for a merchant
   */
  async getPayoutHistory(merchantId: string, filters?: {
    status?: PayoutStatus;
    page?: number;
    limit?: number;
  }) {
    const { status, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = { merchantId };
    if (status) where.status = status;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payout.count({ where }),
    ]);

    return {
      payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all payouts (admin)
   */
  async getAllPayouts(filters?: {
    merchantId?: string;
    status?: PayoutStatus;
    page?: number;
    limit?: number;
  }) {
    const { merchantId, status, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
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
      prisma.payout.count({ where }),
    ]);

    return {
      payouts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new PayoutService();






