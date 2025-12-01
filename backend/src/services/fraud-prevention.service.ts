import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { PaymentMethod } from '@prisma/client';
import blacklistService from './blacklist.service';
import ipTrackingService from './ip-tracking.service';

export interface VelocityLimitConfig {
  maxGiftCardsPerUserPerDay: number;
  maxGiftCardsPerIPPerDay: number;
  maxTotalValuePerUserPerDay: number; // in USD or base currency
  maxValuePerSingleGiftCard: number; // in USD or base currency
}

export interface FraudCheckResult {
  allowed: boolean;
  reason?: string;
  requiresManualReview: boolean;
  riskScore: number; // 0-100, higher = more risky
}

// Default velocity limits as per SRS Section 3.3.1
const DEFAULT_VELOCITY_LIMITS: VelocityLimitConfig = {
  maxGiftCardsPerUserPerDay: 10,
  maxGiftCardsPerIPPerDay: 20,
  maxTotalValuePerUserPerDay: 5000, // $5,000 USD
  maxValuePerSingleGiftCard: 10000, // $10,000 USD
};

export class FraudPreventionService {
  private velocityLimits: VelocityLimitConfig;

  constructor(limits?: Partial<VelocityLimitConfig>) {
    this.velocityLimits = { ...DEFAULT_VELOCITY_LIMITS, ...limits };
  }

  /**
   * Check velocity limits before creating a gift card
   */
  async checkVelocityLimits(
    userId: string,
    ipAddress: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<FraudCheckResult> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // Convert amount to base currency (USD) for comparison
    // In production, use a currency conversion service
    const amountInUSD = await this.convertToUSD(amount, currency);

    // Check single gift card value limit
    if (amountInUSD > this.velocityLimits.maxValuePerSingleGiftCard) {
      return {
        allowed: false,
        reason: `Gift card value exceeds maximum allowed value of $${this.velocityLimits.maxValuePerSingleGiftCard}`,
        requiresManualReview: true,
        riskScore: 90,
      };
    }

    // Check user's gift cards created today
    const userGiftCardsToday = await prisma.giftCard.count({
      where: {
        merchantId: userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (userGiftCardsToday >= this.velocityLimits.maxGiftCardsPerUserPerDay) {
      return {
        allowed: false,
        reason: `Maximum ${this.velocityLimits.maxGiftCardsPerUserPerDay} gift cards per user per day limit exceeded`,
        requiresManualReview: true,
        riskScore: 80,
      };
    }

    // Check user's total value today
    const userPaymentsToday = await prisma.payment.findMany({
      where: {
        customerId: userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'COMPLETED',
      },
      select: {
        amount: true,
        currency: true,
      },
    });

    let totalValueToday = 0;
    for (const payment of userPaymentsToday) {
      totalValueToday += await this.convertToUSD(Number(payment.amount), payment.currency);
    }

    totalValueToday += amountInUSD;

    if (totalValueToday > this.velocityLimits.maxTotalValuePerUserPerDay) {
      return {
        allowed: false,
        reason: `Maximum total value of $${this.velocityLimits.maxTotalValuePerUserPerDay} per user per day limit exceeded`,
        requiresManualReview: true,
        riskScore: 85,
      };
    }

    // Check IP address activity using IP tracking service
    const ipGiftCardsToday = await ipTrackingService.getIPActionCount(
      ipAddress,
      'GIFT_CARD_CREATION',
      24
    );

    if (ipGiftCardsToday >= this.velocityLimits.maxGiftCardsPerIPPerDay) {
      return {
        allowed: false,
        reason: `Maximum ${this.velocityLimits.maxGiftCardsPerIPPerDay} gift cards per IP per day limit exceeded`,
        requiresManualReview: true,
        riskScore: 80,
      };
    }

    return {
      allowed: true,
      requiresManualReview: false,
      riskScore: this.calculateRiskScore(userGiftCardsToday, totalValueToday, amountInUSD),
    };
  }

  /**
   * Detect unusual purchase patterns
   */
  async detectUnusualPatterns(
    userId: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<FraudCheckResult> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const amountInUSD = await this.convertToUSD(amount, currency);

    // Check for multiple high-value cards in short time (3+ cards > $1,000 within 1 hour)
    const recentHighValuePayments = await prisma.payment.findMany({
      where: {
        customerId: userId,
        createdAt: {
          gte: oneHourAgo,
        },
        status: 'COMPLETED',
      },
      select: {
        amount: true,
        currency: true,
      },
    });

    let highValueCount = 0;
    for (const payment of recentHighValuePayments) {
      const paymentAmountUSD = await this.convertToUSD(Number(payment.amount), payment.currency);
      if (paymentAmountUSD > 1000) {
        highValueCount++;
      }
    }

    if (amountInUSD > 1000) {
      highValueCount++;
    }

    if (highValueCount >= 3) {
      return {
        allowed: false,
        reason: 'Unusual purchase pattern detected: Multiple high-value cards purchased in short time',
        requiresManualReview: true,
        riskScore: 95,
      };
    }

    // Check for single transaction > $1,000
    if (amountInUSD > 1000) {
      return {
        allowed: true,
        reason: 'High-value transaction requires manual review',
        requiresManualReview: true,
        riskScore: 70,
      };
    }

    return {
      allowed: true,
      requiresManualReview: false,
      riskScore: 20,
    };
  }

  /**
   * Check if email domain is suspicious (disposable/temporary email)
   */
  async validateEmailDomain(email: string): Promise<boolean> {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    // List of known disposable email domains (simplified - use a service in production)
    const disposableDomains = [
      'tempmail.com',
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
      // Add more as needed
    ];

    if (disposableDomains.includes(domain)) {
      logger.warn('Disposable email domain detected', { email, domain });
      return false;
    }

    return true;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // International phone number validation (simplified)
    // In production, use a library like libphonenumber-js
    const phonePattern = /^\+?[1-9]\d{1,14}$/;
    return phonePattern.test(phone.replace(/\s/g, ''));
  }

  /**
   * Check for duplicate payment methods across accounts
   */
  async checkDuplicatePaymentMethod(
    paymentMethodId: string,
    paymentMethod: PaymentMethod
  ): Promise<FraudCheckResult> {
    // Check if same payment method used across multiple accounts recently
    const recentPayments = await prisma.payment.findMany({
      where: {
        paymentMethod,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      select: {
        customerId: true,
      },
      distinct: ['customerId'],
    });

    if (recentPayments.length > 3) {
      return {
        allowed: true,
        reason: 'Payment method used across multiple accounts - requires review',
        requiresManualReview: true,
        riskScore: 75,
      };
    }

    return {
      allowed: true,
      requiresManualReview: false,
      riskScore: 10,
    };
  }

  /**
   * Check for suspicious redemption patterns
   */
  async checkRedemptionPatterns(
    giftCardId: string,
    merchantId: string
  ): Promise<FraudCheckResult> {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id: giftCardId },
      include: {
        payments: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        redemptions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!giftCard) {
      throw new ValidationError('Gift card not found');
    }

    // Check if redemption immediately after purchase
    if (giftCard.payments.length > 0 && giftCard.redemptions.length > 0) {
      const purchaseTime = giftCard.payments[0].createdAt;
      const redemptionTime = giftCard.redemptions[0].createdAt;
      const timeDiff = redemptionTime.getTime() - purchaseTime.getTime();

      // If redeemed within 5 minutes of purchase
      if (timeDiff < 5 * 60 * 1000) {
        return {
          allowed: true,
          reason: 'Redemption immediately after purchase - requires review',
          requiresManualReview: true,
          riskScore: 80,
        };
      }
    }

    // Check for multiple redemptions from same merchant in short time
    const recentRedemptions = await prisma.redemption.count({
      where: {
        merchantId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentRedemptions > 10) {
      return {
        allowed: true,
        reason: 'High redemption frequency from merchant - requires review',
        requiresManualReview: true,
        riskScore: 65,
      };
    }

    return {
      allowed: true,
      requiresManualReview: false,
      riskScore: 15,
    };
  }

  /**
   * Calculate risk score based on various factors
   */
  private calculateRiskScore(
    userGiftCardsToday: number,
    totalValueToday: number,
    currentAmount: number
  ): number {
    let riskScore = 0;

    // Higher risk if approaching limits
    const cardsRatio = userGiftCardsToday / this.velocityLimits.maxGiftCardsPerUserPerDay;
    if (cardsRatio > 0.8) riskScore += 30;
    else if (cardsRatio > 0.5) riskScore += 15;

    const valueRatio = totalValueToday / this.velocityLimits.maxTotalValuePerUserPerDay;
    if (valueRatio > 0.8) riskScore += 30;
    else if (valueRatio > 0.5) riskScore += 15;

    // High value transaction
    if (currentAmount > 1000) riskScore += 20;
    else if (currentAmount > 500) riskScore += 10;

    return Math.min(riskScore, 100);
  }

  /**
   * Convert amount to USD (simplified - use real currency service in production)
   */
  private async convertToUSD(amount: number, currency: string): Promise<number> {
    // Simplified conversion - in production, use a currency conversion API
    const conversionRates: Record<string, number> = {
      USD: 1,
      INR: 0.012, // Approximate
      EUR: 1.1,
      GBP: 1.25,
    };

    const rate = conversionRates[currency.toUpperCase()] || 1;
    return amount * rate;
  }

  /**
   * Comprehensive fraud check before payment
   */
  async performFraudCheck(
    userId: string,
    ipAddress: string,
    amount: number,
    currency: string,
    email?: string,
    phone?: string,
    paymentMethodId?: string,
    paymentMethod?: PaymentMethod
  ): Promise<FraudCheckResult> {
    // Check blacklist first
    const blacklistChecks: Array<{ type: 'EMAIL' | 'IP' | 'PHONE' | 'PAYMENT_METHOD' | 'USER_ID'; value: string }> = [
      { type: 'IP', value: ipAddress },
    ];

    if (email) blacklistChecks.push({ type: 'EMAIL', value: email });
    if (phone) blacklistChecks.push({ type: 'PHONE', value: phone });
    if (paymentMethodId) blacklistChecks.push({ type: 'PAYMENT_METHOD', value: paymentMethodId });
    if (userId) blacklistChecks.push({ type: 'USER_ID', value: userId });

    const blacklistResult = await blacklistService.checkMultiple(blacklistChecks);
    if (blacklistResult.isBlacklisted && blacklistResult.entry?.autoBlock) {
      return {
        allowed: false,
        reason: `Transaction blocked: ${blacklistResult.entry.type} is blacklisted. ${blacklistResult.entry.reason || ''}`,
        requiresManualReview: true,
        riskScore: 100,
      };
    }

    // Check velocity limits
    const velocityCheck = await this.checkVelocityLimits(userId, ipAddress, amount, currency);
    if (!velocityCheck.allowed) {
      return velocityCheck;
    }

    // Check unusual patterns
    const patternCheck = await this.detectUnusualPatterns(userId, amount, currency);
    if (!patternCheck.allowed) {
      return patternCheck;
    }

    // Validate email domain
    if (email) {
      const isValidEmail = await this.validateEmailDomain(email);
      if (!isValidEmail) {
        return {
          allowed: false,
          reason: 'Disposable or temporary email domain detected',
          requiresManualReview: true,
          riskScore: 60,
        };
      }
    }

    // Validate phone number
    if (phone) {
      const isValidPhone = this.validatePhoneNumber(phone);
      if (!isValidPhone) {
        return {
          allowed: false,
          reason: 'Invalid phone number format',
          requiresManualReview: false,
          riskScore: 40,
        };
      }
    }

    // Check duplicate payment method
    if (paymentMethodId && paymentMethod) {
      const duplicateCheck = await this.checkDuplicatePaymentMethod(paymentMethodId, paymentMethod);
      if (duplicateCheck.requiresManualReview) {
        return duplicateCheck;
      }
    }

    // Get IP statistics for additional risk assessment
    const ipStats = await ipTrackingService.getIPStats(ipAddress, 24);
    let ipRiskScore = 0;
    if (ipStats.suspiciousScore > 50) {
      ipRiskScore = ipStats.suspiciousScore;
    }
    if (ipStats.uniqueUsers > 3) {
      ipRiskScore = Math.max(ipRiskScore, 60);
    }

    // Combine risk scores
    const combinedRiskScore = Math.max(
      velocityCheck.riskScore,
      patternCheck.riskScore,
      ipRiskScore,
      patternCheck.requiresManualReview ? 70 : 0,
      blacklistResult.isBlacklisted ? 80 : 0
    );

    // Auto-blacklist if risk is very high
    if (combinedRiskScore >= 90) {
      try {
        if (email) {
          await blacklistService.autoBlacklist('EMAIL', email, 'High risk transaction detected', 'HIGH');
        }
        if (ipAddress) {
          await blacklistService.autoBlacklist('IP', ipAddress, 'High risk transaction detected', 'HIGH');
        }
      } catch (error) {
        // Don't fail transaction if blacklisting fails
        logger.error('Failed to auto-blacklist high risk transaction', { error });
      }
    }

    return {
      allowed: true,
      requiresManualReview: patternCheck.requiresManualReview || combinedRiskScore > 70,
      riskScore: combinedRiskScore,
    };
  }
}

export default new FraudPreventionService();

