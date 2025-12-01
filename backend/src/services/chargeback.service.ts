import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { PaymentMethod, PaymentStatus, GiftCardStatus } from '@prisma/client';
import giftCardService from './giftcard.service';
import emailService from './delivery/email.service';

export interface ChargebackData {
  paymentId: string;
  paymentMethod: PaymentMethod;
  chargebackId: string; // From payment gateway
  amount: number;
  currency: string;
  reason?: string;
  fee?: number; // Chargeback fee
  disputeId?: string;
}

export interface ChargebackRecord {
  id: string;
  paymentId: string;
  giftCardId: string;
  merchantId: string;
  amount: number;
  currency: string;
  fee: number;
  status: 'PENDING' | 'WON' | 'LOST' | 'WITHDRAWN';
  reason?: string;
  evidence?: Record<string, unknown>;
  resolvedAt?: Date;
  createdAt: Date;
}

export class ChargebackService {
  /**
   * Handle chargeback notification from payment gateway
   */
  async handleChargeback(data: ChargebackData) {
    const { paymentId, paymentMethod, chargebackId, amount, currency, reason, fee = 0, disputeId } = data;

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        giftCard: {
          include: {
            merchant: true,
          },
        },
        customer: true,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.paymentMethod !== paymentMethod) {
      throw new ValidationError('Payment method mismatch');
    }

    // Automatically invalidate gift card
    const giftCard = payment.giftCard;
    if (giftCard.status === 'ACTIVE' || giftCard.status === 'REDEEMED') {
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: {
          status: GiftCardStatus.CANCELLED,
          balance: new Decimal(0),
        },
      });

      // Create transaction record for invalidation
      await prisma.transaction.create({
        data: {
          giftCardId: giftCard.id,
          type: 'REFUND',
          amount: giftCard.balance,
          balanceBefore: giftCard.balance,
          balanceAfter: new Decimal(0),
          userId: payment.customerId || null,
          metadata: {
            reason: 'chargeback',
            chargebackId,
            paymentId: payment.id,
          },
        },
      });

      logger.info('Gift card invalidated due to chargeback', {
        giftCardId: giftCard.id,
        paymentId: payment.id,
        chargebackId,
      });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        metadata: {
          ...((payment.metadata as Record<string, unknown>) || {}),
          chargeback: true,
          chargebackId,
          disputeId,
          chargebackFee: fee,
        },
      },
    });

    // Adjust merchant balance (deduct chargeback amount + fee)
    const chargebackTotal = amount + fee;
    const currentBalance = Number(payment.giftCard.merchant.merchantBalance);
    const newBalance = Math.max(0, currentBalance - chargebackTotal);

    await prisma.user.update({
      where: { id: payment.giftCard.merchantId },
      data: {
        merchantBalance: new Decimal(newBalance),
      },
    });

    // Create chargeback record
    const chargebackRecord = await prisma.chargeback.create({
      data: {
        paymentId: payment.id,
        giftCardId: giftCard.id,
        merchantId: payment.giftCard.merchantId,
        amount: new Decimal(amount),
        currency,
        fee: new Decimal(fee),
        status: 'PENDING',
        reason: reason || 'Chargeback received from payment gateway',
        chargebackId,
        disputeId: disputeId || null,
        metadata: {
          paymentMethod,
          originalAmount: Number(payment.amount),
        },
      },
    });

    // Send notifications
    try {
      // Notify merchant
      if (payment.giftCard.merchant.email) {
        await emailService.sendEmail({
          to: payment.giftCard.merchant.email,
          subject: 'Chargeback Received - Gift Card Invalidated',
          html: `
            <h2>Chargeback Received</h2>
            <p>A chargeback has been received for payment ${payment.id}.</p>
            <p><strong>Amount:</strong> ${currency} ${amount}</p>
            <p><strong>Fee:</strong> ${currency} ${fee}</p>
            <p><strong>Reason:</strong> ${reason || 'Not provided'}</p>
            <p>The associated gift card has been automatically invalidated.</p>
            <p>Chargeback ID: ${chargebackId}</p>
          `,
        });
      }

      // Notify customer if email available
      if (payment.customer?.email) {
        await emailService.sendEmail({
          to: payment.customer.email,
          subject: 'Gift Card Cancelled - Chargeback',
          html: `
            <h2>Gift Card Cancelled</h2>
            <p>Your gift card has been cancelled due to a chargeback on the payment.</p>
            <p>Gift Card Code: ${giftCard.code}</p>
            <p>If you believe this is an error, please contact support.</p>
          `,
        });
      }
    } catch (error) {
      logger.error('Failed to send chargeback notifications', { error, chargebackId });
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: payment.giftCard.merchantId,
        userEmail: payment.giftCard.merchant.email,
        action: 'CHARGEBACK_RECEIVED',
        resourceType: 'Payment',
        resourceId: payment.id,
        metadata: {
          chargebackId,
          amount,
          fee,
          giftCardId: giftCard.id,
        },
      },
    });

    return chargebackRecord;
  }

  /**
   * Update chargeback status (when dispute is resolved)
   */
  async updateChargebackStatus(
    chargebackId: string,
    status: 'WON' | 'LOST' | 'WITHDRAWN',
    evidence?: Record<string, unknown>
  ) {
    const chargeback = await prisma.chargeback.findUnique({
      where: { id: chargebackId },
      include: {
        payment: {
          include: {
            giftCard: true,
          },
        },
      },
    });

    if (!chargeback) {
      throw new NotFoundError('Chargeback not found');
    }

    const updateData: any = {
      status,
      resolvedAt: new Date(),
    };

    if (evidence) {
      updateData.evidence = evidence;
    }

    const updated = await prisma.chargeback.update({
      where: { id: chargebackId },
      data: updateData,
    });

    // If chargeback was won, restore gift card and merchant balance
    if (status === 'WON') {
      const payment = chargeback.payment;
      const giftCard = payment.giftCard;

      // Restore gift card if it was cancelled
      if (giftCard.status === 'CANCELLED') {
        await prisma.giftCard.update({
          where: { id: giftCard.id },
          data: {
            status: GiftCardStatus.ACTIVE,
            balance: giftCard.value, // Restore original value
          },
        });
      }

      // Restore merchant balance
      const merchant = await prisma.user.findUnique({
        where: { id: chargeback.merchantId },
      });

      if (merchant) {
        const currentBalance = Number(merchant.merchantBalance);
        const chargebackTotal = Number(chargeback.amount) + Number(chargeback.fee);
        const newBalance = currentBalance + chargebackTotal;

        await prisma.user.update({
          where: { id: chargeback.merchantId },
          data: {
            merchantBalance: new Decimal(newBalance),
          },
        });
      }

      logger.info('Chargeback won - gift card and balance restored', {
        chargebackId,
        giftCardId: giftCard.id,
      });
    }

    return updated;
  }

  /**
   * Submit evidence for chargeback dispute
   */
  async submitEvidence(chargebackId: string, evidence: Record<string, unknown>) {
    const chargeback = await prisma.chargeback.findUnique({
      where: { id: chargebackId },
    });

    if (!chargeback) {
      throw new NotFoundError('Chargeback not found');
    }

    if (chargeback.status !== 'PENDING') {
      throw new ValidationError('Evidence can only be submitted for pending chargebacks');
    }

    return prisma.chargeback.update({
      where: { id: chargebackId },
      data: {
        evidence: {
          ...((chargeback.evidence as Record<string, unknown>) || {}),
          ...evidence,
          evidenceSubmittedAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Get chargeback records
   */
  async getChargebacks(filters: {
    merchantId?: string;
    paymentId?: string;
    status?: 'PENDING' | 'WON' | 'LOST' | 'WITHDRAWN';
    page?: number;
    limit?: number;
  }) {
    const { merchantId, paymentId, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (merchantId) where.merchantId = merchantId;
    if (paymentId) where.paymentId = paymentId;
    if (status) where.status = status;

    const [chargebacks, total] = await Promise.all([
      prisma.chargeback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payment: {
            include: {
              giftCard: {
                select: {
                  id: true,
                  code: true,
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
      }),
      prisma.chargeback.count({ where }),
    ]);

    return {
      chargebacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get chargeback statistics
   */
  async getChargebackStatistics(merchantId?: string) {
    const where: any = {};
    if (merchantId) where.merchantId = merchantId;

    const [total, pending, won, lost, totalAmount, totalFees] = await Promise.all([
      prisma.chargeback.count({ where }),
      prisma.chargeback.count({ where: { ...where, status: 'PENDING' } }),
      prisma.chargeback.count({ where: { ...where, status: 'WON' } }),
      prisma.chargeback.count({ where: { ...where, status: 'LOST' } }),
      prisma.chargeback.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.chargeback.aggregate({
        where,
        _sum: { fee: true },
      }),
    ]);

    return {
      total,
      pending,
      won,
      lost,
      totalAmount: Number(totalAmount._sum.amount || 0),
      totalFees: Number(totalFees._sum.fee || 0),
      winRate: total > 0 ? (won / total) * 100 : 0,
    };
  }
}

export default new ChargebackService();

