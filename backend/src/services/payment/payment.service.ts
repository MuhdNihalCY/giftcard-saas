import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../config/database';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import logger from '../../utils/logger';
import stripeService from './stripe.service';
import paypalService from './paypal.service';
import razorpayService from './razorpay.service';
import giftCardService from '../giftcard.service';
import giftCardProductService from '../giftcard-product.service';
import deliveryService from '../delivery/delivery.service';

export interface CreatePaymentData {
  giftCardId: string;
  customerId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface ConfirmPaymentData {
  paymentId: string;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  orderId?: string;
  paymentMethodId?: string;
  signature?: string;
}

export interface RefundPaymentData {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface BulkPurchaseRecipient {
  email: string;
  name?: string;
  customMessage?: string;
  amount: number;
}

export interface BulkPurchaseData {
  productId?: string;
  merchantId?: string;
  recipients: BulkPurchaseRecipient[];
  currency: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
  customerId?: string;
}

export class PaymentService {
  /**
   * Create payment
   */
  async createPayment(data: CreatePaymentData) {
    const { giftCardId, customerId, amount, currency, paymentMethod, returnUrl, cancelUrl } = data;

    // Verify gift card exists
    const giftCard = await giftCardService.getById(giftCardId);

    if (giftCard.status !== 'ACTIVE') {
      throw new ValidationError('Gift card is not active');
    }

    // Validate amount matches gift card value (allow small floating point differences)
    const amountDiff = Math.abs(amount - Number(giftCard.value));
    if (amountDiff > 0.01) {
      throw new ValidationError('Payment amount does not match gift card value');
    }

    let paymentIntentId: string | undefined;
    let orderId: string | undefined;
    let clientSecret: string | null | undefined;
    let status: PaymentStatus = PaymentStatus.PENDING;

    // Create payment based on method
    switch (paymentMethod) {
      case PaymentMethod.STRIPE:
        const stripeResult = await stripeService.createPaymentIntent({
          amount,
          currency,
          giftCardId,
          customerId,
        });
        paymentIntentId = stripeResult.paymentIntentId;
        clientSecret = stripeResult.clientSecret;
        status = stripeResult.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
        break;

      case PaymentMethod.PAYPAL:
        if (!returnUrl || !cancelUrl) {
          throw new ValidationError('Return URL and Cancel URL are required for PayPal');
        }
        const paypalResult = await paypalService.createOrder({
          amount,
          currency,
          giftCardId,
          returnUrl,
          cancelUrl,
        });
        orderId = paypalResult.orderId;
        break;

      case PaymentMethod.RAZORPAY:
        const razorpayResult = await razorpayService.createOrder({
          amount,
          currency,
          giftCardId,
        });
        orderId = razorpayResult.orderId;
        break;

      case PaymentMethod.UPI:
        // UPI integration would go here
        // For now, we'll treat it similar to Razorpay
        throw new ValidationError('UPI payment method not yet implemented');

      default:
        throw new ValidationError('Invalid payment method');
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        giftCardId,
        customerId,
        amount: new Decimal(amount),
        currency,
        paymentMethod,
        paymentIntentId: paymentIntentId || orderId || '',
        status,
        metadata: {
          returnUrl,
          cancelUrl,
        } as any,
      },
      include: {
        giftCard: true,
        customer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return {
      payment,
      clientSecret,
      orderId,
      paymentIntentId,
    };
  }

  /**
   * Confirm payment
   */
  async confirmPayment(data: ConfirmPaymentData) {
    const { paymentId, paymentMethod, paymentIntentId, orderId, paymentMethodId, signature } = data;

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { giftCard: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new ValidationError('Payment already completed');
    }

    let transactionId: string | undefined;
    let confirmed = false;

    // Confirm payment based on method
    switch (paymentMethod) {
      case PaymentMethod.STRIPE:
        if (!paymentIntentId) {
          throw new ValidationError('Payment intent ID is required for Stripe');
        }
        const stripeResult = await stripeService.confirmPaymentIntent({
          paymentIntentId,
          paymentMethodId,
        });
        transactionId = stripeResult.transactionId;
        confirmed = stripeResult.status === 'succeeded';
        break;

      case PaymentMethod.PAYPAL:
        if (!orderId) {
          throw new ValidationError('Order ID is required for PayPal');
        }
        const paypalResult = await paypalService.captureOrder(orderId);
        transactionId = paypalResult.transactionId;
        confirmed = paypalResult.status === 'COMPLETED';
        break;

      case PaymentMethod.RAZORPAY:
        if (!orderId || !signature) {
          throw new ValidationError('Order ID and signature are required for Razorpay');
        }
        // Get payment ID from metadata or request
        const paymentIdFromRazorpay = payment.paymentIntentId; // This would be the Razorpay payment ID
        const isValid = razorpayService.verifyPaymentSignature({
          orderId,
          paymentId: paymentIdFromRazorpay,
          signature,
        });
        if (!isValid) {
          throw new ValidationError('Invalid payment signature');
        }
        const razorpayPayment = await razorpayService.getPayment(paymentIdFromRazorpay);
        transactionId = razorpayPayment.transactionId;
        confirmed = razorpayPayment.status === 'captured';
        break;

      default:
        throw new ValidationError('Invalid payment method');
    }

    if (!confirmed) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.FAILED },
      });
      throw new ValidationError('Payment confirmation failed');
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId,
      },
      include: {
        giftCard: true,
        customer: true,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        giftCardId: payment.giftCardId,
        type: 'PURCHASE',
        amount: payment.amount,
        balanceBefore: new Decimal(0),
        balanceAfter: payment.amount,
        userId: payment.customerId || null,
        metadata: {
          paymentId: payment.id,
          paymentMethod: payment.paymentMethod,
        } as any,
      },
    });

    // If this is a bulk purchase, deliver all gift cards
    const metadata = payment.metadata as any;
    if (metadata?.type === 'bulk_purchase' && metadata.giftCardIds) {
      const giftCardIds = metadata.giftCardIds as string[];
      for (const giftCardId of giftCardIds) {
        try {
          const giftCard = await giftCardService.getById(giftCardId);
          if (giftCard.recipientEmail) {
            await deliveryService.deliverGiftCard({
              giftCardId: giftCard.id,
              deliveryMethod: 'email',
              recipientEmail: giftCard.recipientEmail,
              recipientName: giftCard.recipientName || undefined,
            });
          }
        } catch (error) {
          // Log error but don't fail the entire transaction
          logger.error(`Failed to deliver gift card ${giftCardId}:`, { error, giftCardId });
        }
      }
    } else {
      // Deliver single gift card
      const giftCard = await giftCardService.getById(payment.giftCardId);
      if (giftCard.recipientEmail) {
        try {
          await deliveryService.deliverGiftCard({
            giftCardId: giftCard.id,
            deliveryMethod: 'email',
            recipientEmail: giftCard.recipientEmail,
            recipientName: giftCard.recipientName || undefined,
          });
        } catch (error) {
          // Log error but don't fail the transaction
          logger.error(`Failed to deliver gift card:`, { error, giftCardId: giftCard.id });
        }
      }
    }

    return updatedPayment;
  }

  /**
   * Get payment by ID
   */
  async getById(id: string) {
    const payment = await prisma.payment.findUnique({
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
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  /**
   * List payments
   */
  async list(filters: {
    giftCardId?: string;
    customerId?: string;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    page?: number;
    limit?: number;
  }) {
    const { giftCardId, customerId, status, paymentMethod, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (giftCardId) where.giftCardId = giftCardId;
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
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
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Process refund
   */
  async refundPayment(data: RefundPaymentData) {
    const { paymentId, amount, reason } = data;

    const payment = await this.getById(paymentId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new ValidationError('Only completed payments can be refunded');
    }

    if (!payment.transactionId) {
      throw new ValidationError('Payment transaction ID not found');
    }

    let refundResult: any;

    // Process refund based on payment method
    switch (payment.paymentMethod) {
      case PaymentMethod.STRIPE:
        refundResult = await stripeService.refundPayment(payment.paymentIntentId, amount);
        break;

      case PaymentMethod.PAYPAL:
        refundResult = await paypalService.refundPayment(payment.transactionId, amount);
        break;

      case PaymentMethod.RAZORPAY:
        refundResult = await razorpayService.refundPayment(payment.transactionId, amount);
        break;

      default:
        throw new ValidationError('Refund not supported for this payment method');
    }

    // Update payment status
    const refundAmount = amount || Number(payment.amount);
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });

    // Update gift card balance if needed
    const giftCard = await giftCardService.getById(payment.giftCardId);
    const newBalance = Number(giftCard.balance) - refundAmount;

    await prisma.giftCard.update({
      where: { id: payment.giftCardId },
      data: {
        balance: new Decimal(Math.max(0, newBalance)),
        status: newBalance <= 0 ? 'CANCELLED' : giftCard.status,
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        giftCardId: payment.giftCardId,
        type: 'REFUND',
        amount: new Decimal(refundAmount),
        balanceBefore: giftCard.balance,
        balanceAfter: new Decimal(Math.max(0, newBalance)),
        userId: payment.customerId || null,
        metadata: {
          paymentId: payment.id,
          refundId: refundResult.refundId,
          reason,
        } as any,
      },
    });

    return {
      refundId: refundResult.refundId,
      amount: refundAmount,
      status: refundResult.status,
    };
  }

  /**
   * Create payment for product with custom amount
   */
  async createPaymentFromProduct(data: {
    productId: string;
    amount: number; // This is the gift card value the customer wants
    customerId?: string;
    currency: string;
    paymentMethod: PaymentMethod;
    recipientEmail?: string;
    recipientName?: string;
    customMessage?: string;
    returnUrl?: string;
    cancelUrl?: string;
  }) {
    const { productId, amount, customerId, currency, paymentMethod, recipientEmail, recipientName, customMessage, returnUrl, cancelUrl } = data;

    // Get product
    const product = await giftCardProductService.getById(productId);

    // Validate amount (gift card value)
    let giftCardValue = amount;
    let salePrice = amount; // Default: sale price equals gift card value

    if (product.allowCustomAmount) {
      const minAmount = Number(product.minAmount || 0);
      const maxAmount = Number(product.maxAmount || 0);
      if (amount < minAmount || amount > maxAmount) {
        throw new ValidationError(`Gift card value must be between ${minAmount} and ${maxAmount}`);
      }
      
      // Calculate sale price based on ratio if sale prices are set
      if (product.minSalePrice && product.maxSalePrice && product.minAmount && product.maxAmount) {
        const minSale = Number(product.minSalePrice);
        const maxSale = Number(product.maxSalePrice);
        const minVal = Number(product.minAmount);
        const maxVal = Number(product.maxAmount);
        
        // Linear interpolation to calculate sale price
        if (maxVal > minVal) {
          const ratio = (amount - minVal) / (maxVal - minVal);
          salePrice = minSale + (maxSale - minSale) * ratio;
        } else {
          salePrice = minSale;
        }
      }
    } else {
      // Check if amount is in fixed amounts
      const fixedAmounts = (product.fixedAmounts as number[]) || [];
      const fixedSalePrices = (product.fixedSalePrices as number[]) || [];
      
      if (fixedAmounts.length > 0) {
        const index = fixedAmounts.indexOf(amount);
        if (index === -1) {
          throw new ValidationError(`Gift card value must be one of: ${fixedAmounts.join(', ')}`);
        }
        
        // Get corresponding sale price
        if (fixedSalePrices && fixedSalePrices.length > index) {
          salePrice = fixedSalePrices[index];
        } else {
          salePrice = amount; // No discount
        }
      }
    }

    // Calculate expiry date if expiryDays is set
    let expiryDate: Date | undefined;
    if (product.expiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + product.expiryDays);
    }

    // Create gift card from product with actual gift card value
    const giftCard = await giftCardService.create({
      merchantId: product.merchantId,
      value: giftCardValue, // Actual gift card value (what customer gets)
      currency: product.currency,
      expiryDate,
      templateId: product.templateId || undefined,
      productId: product.id,
      customMessage,
      recipientEmail,
      recipientName,
      allowPartialRedemption: true,
    });

    // Create payment for the gift card using sale price (what customer pays)
    return this.createPayment({
      giftCardId: giftCard.id,
      customerId,
      amount: salePrice, // Customer pays sale price
      currency: product.currency,
      paymentMethod,
      returnUrl,
      cancelUrl,
    });
  }

  /**
   * Bulk purchase - create multiple gift cards with different recipients
   */
  async bulkPurchase(data: BulkPurchaseData) {
    const { productId, merchantId, recipients, currency, paymentMethod, returnUrl, cancelUrl, customerId } = data;

    if (!recipients || recipients.length === 0) {
      throw new ValidationError('At least one recipient is required');
    }

    if (recipients.length > 50) {
      throw new ValidationError('Maximum 50 recipients allowed per bulk purchase');
    }

    let product: any = null;
    let finalMerchantId = merchantId;

    // If productId is provided, get product details
    if (productId) {
      product = await giftCardProductService.getById(productId);
      finalMerchantId = product.merchantId;

      // Validate all amounts against product and calculate sale prices
      for (const recipient of recipients) {
        if (product.allowCustomAmount) {
          const minAmount = Number(product.minAmount || 0);
          const maxAmount = Number(product.maxAmount || 0);
          if (recipient.amount < minAmount || recipient.amount > maxAmount) {
            throw new ValidationError(`Gift card value ${recipient.amount} for ${recipient.email} must be between ${minAmount} and ${maxAmount}`);
          }
        } else {
          const fixedAmounts = (product.fixedAmounts as number[]) || [];
          if (fixedAmounts.length > 0 && !fixedAmounts.includes(recipient.amount)) {
            throw new ValidationError(`Gift card value ${recipient.amount} for ${recipient.email} must be one of: ${fixedAmounts.join(', ')}`);
          }
        }
      }
    } else if (!merchantId) {
      throw new ValidationError('Either productId or merchantId is required');
    }

    // Calculate total sale price (what customer pays)
    let totalSalePrice = 0;
    const recipientSalePrices: number[] = [];
    
    if (product) {
      for (const recipient of recipients) {
        let salePrice = recipient.amount; // Default: no discount
        
        if (product.allowCustomAmount) {
          // Calculate sale price based on ratio
          if (product.minSalePrice && product.maxSalePrice && product.minAmount && product.maxAmount) {
            const minSale = Number(product.minSalePrice);
            const maxSale = Number(product.maxSalePrice);
            const minVal = Number(product.minAmount);
            const maxVal = Number(product.maxAmount);
            
            if (maxVal > minVal) {
              const ratio = (recipient.amount - minVal) / (maxVal - minVal);
              salePrice = minSale + (maxSale - minSale) * ratio;
            } else {
              salePrice = minSale;
            }
          }
        } else {
          // Get sale price from fixed sale prices
          const fixedAmounts = (product.fixedAmounts as number[]) || [];
          const fixedSalePrices = (product.fixedSalePrices as number[]) || [];
          const index = fixedAmounts.indexOf(recipient.amount);
          if (index !== -1 && fixedSalePrices && fixedSalePrices.length > index) {
            salePrice = fixedSalePrices[index];
          }
        }
        
        recipientSalePrices.push(salePrice);
        totalSalePrice += salePrice;
      }
    } else {
      // No product, use amounts as sale prices
      totalSalePrice = recipients.reduce((sum, recipient) => sum + recipient.amount, 0);
      recipientSalePrices.push(...recipients.map(r => r.amount));
    }

    // Validate all recipients have valid emails
    for (const recipient of recipients) {
      if (!recipient.email || !recipient.email.includes('@')) {
        throw new ValidationError(`Invalid email for recipient: ${recipient.email || 'unknown'}`);
      }
    }

    // Calculate expiry date if product has expiryDays
    let expiryDate: Date | undefined;
    if (product?.expiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + product.expiryDays);
    }

    // Create all gift cards with actual gift card values
    const giftCards = [];
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const giftCard = await giftCardService.create({
        merchantId: finalMerchantId!,
        value: recipient.amount, // Actual gift card value (what customer gets)
        currency: product?.currency || currency,
        expiryDate,
        templateId: product?.templateId || undefined,
        productId: product?.id || undefined,
        customMessage: recipient.customMessage,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        allowPartialRedemption: true,
      });
      giftCards.push(giftCard);
    }

    // Create a single payment for the total sale price (what customer pays)
    // We'll use the first gift card as the primary payment reference
    // In a real system, you might want to create a separate bulk purchase record
    const primaryGiftCard = giftCards[0];
    
    let paymentIntentId: string | undefined;
    let orderId: string | undefined;
    let clientSecret: string | null | undefined;
    let status: PaymentStatus = PaymentStatus.PENDING;

    // Create payment based on method using total sale price
    switch (paymentMethod) {
      case PaymentMethod.STRIPE:
        const stripeResult = await stripeService.createPaymentIntent({
          amount: totalSalePrice, // Customer pays total sale price
          currency: product?.currency || currency,
          giftCardId: primaryGiftCard.id,
          customerId,
        });
        paymentIntentId = stripeResult.paymentIntentId;
        clientSecret = stripeResult.clientSecret;
        status = stripeResult.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
        break;

      case PaymentMethod.PAYPAL:
        if (!returnUrl || !cancelUrl) {
          throw new ValidationError('Return URL and Cancel URL are required for PayPal');
        }
        const paypalResult = await paypalService.createOrder({
          amount: totalSalePrice, // Customer pays total sale price
          currency: product?.currency || currency,
          giftCardId: primaryGiftCard.id,
          returnUrl,
          cancelUrl,
        });
        orderId = paypalResult.orderId;
        break;

      case PaymentMethod.RAZORPAY:
        const razorpayResult = await razorpayService.createOrder({
          amount: totalSalePrice, // Customer pays total sale price
          currency: product?.currency || currency,
          giftCardId: primaryGiftCard.id,
        });
        orderId = razorpayResult.orderId;
        break;

      case PaymentMethod.UPI:
        throw new ValidationError('UPI payment method not yet implemented');

      default:
        throw new ValidationError('Invalid payment method');
    }

    // Create payment record with metadata containing all gift card IDs
    const payment = await prisma.payment.create({
      data: {
        giftCardId: primaryGiftCard.id,
        customerId,
        amount: new Decimal(totalSalePrice), // Customer pays total sale price
        currency: product?.currency || currency,
        paymentMethod,
        paymentIntentId: paymentIntentId || orderId || '',
        status,
        metadata: {
          type: 'bulk_purchase',
          giftCardIds: giftCards.map(gc => gc.id),
          recipientCount: recipients.length,
          totalGiftCardValue: recipients.reduce((sum, r) => sum + r.amount, 0), // Total actual gift card values
          totalSalePrice, // Total what customer paid
          returnUrl,
          cancelUrl,
        } as any,
      },
      include: {
        giftCard: true,
        customer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // If payment is completed immediately, deliver all gift cards
    if (status === PaymentStatus.COMPLETED) {
      for (let i = 0; i < giftCards.length; i++) {
        const giftCard = giftCards[i];
        const recipient = recipients[i];
        try {
          await deliveryService.deliverGiftCard({
            giftCardId: giftCard.id,
            deliveryMethod: 'email',
            recipientEmail: recipient.email,
            recipientName: recipient.name,
          });
        } catch (error) {
          // Log error but don't fail the entire transaction
          logger.error(`Failed to deliver gift card ${giftCard.id}:`, { error, giftCardId: giftCard.id });
        }
      }
    }

    return {
      payment,
      giftCards,
      clientSecret,
      orderId,
      paymentIntentId,
      totalSalePrice, // What customer pays
      totalGiftCardValue: recipients.reduce((sum, r) => sum + r.amount, 0), // Total actual gift card values
    };
  }
}

export default new PaymentService();

