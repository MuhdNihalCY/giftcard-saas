import prisma from '../../infrastructure/database';
import { PaymentMethod } from '@prisma/client';

export class PaymentRepository {
  // Payment operations
  async createPayment(data: any) {
    return prisma.payment.create({ data });
  }

  async createPaymentFull(data: any) {
    return prisma.payment.create({
      data,
      include: {
        giftCard: true,
        customer: { select: { id: true, email: true } },
      },
    });
  }

  async updatePaymentWithIncludes(id: string, data: any) {
    return prisma.payment.update({
      where: { id },
      data,
      include: { giftCard: true, customer: true },
    });
  }

  async findPaymentsWithDetails(where: any, skip: number, take: number) {
    return prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        giftCard: { select: { id: true, code: true, value: true } },
        customer: { select: { id: true, email: true } },
      },
    });
  }

  async findPaymentSuggestions(where: any) {
    return prisma.payment.findMany({
      where,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        giftCard: { select: { code: true } },
        customer: { select: { email: true } },
      },
    });
  }

  async findPaymentById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        giftCard: {
          include: {
            merchant: {
              select: { id: true, email: true, businessName: true },
            },
          },
        },
      },
    });
  }

  async findPaymentByIntentId(paymentIntentId: string) {
    return prisma.payment.findFirst({ where: { paymentIntentId } });
  }

  async findPaymentByIntentIdAndMethod(paymentIntentId: string, paymentMethod: string) {
    return prisma.payment.findFirst({
      where: { paymentIntentId, paymentMethod: paymentMethod as any },
    });
  }

  async findPaymentByTransactionId(transactionId: string) {
    return prisma.payment.findFirst({
      where: { transactionId },
      include: { giftCard: { select: { id: true, balance: true, merchantId: true } } },
    });
  }

  async findPaymentByIntentIdWithGiftCard(paymentIntentId: string, paymentMethod: string) {
    return prisma.payment.findFirst({
      where: { paymentIntentId, paymentMethod: paymentMethod as any },
      include: { giftCard: { select: { balance: true } } },
    });
  }

  async updatePayment(id: string, data: any) {
    return prisma.payment.update({ where: { id }, data });
  }

  async findPayments(where: any, skip: number, take: number) {
    return prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        giftCard: {
          select: { id: true, code: true, merchantId: true },
        },
      },
    });
  }

  async countPayments(where: any) {
    return prisma.payment.count({ where });
  }

  async createTransaction(data: any) {
    return prisma.transaction.create({ data });
  }

  // Commission operations — uses CommissionSettings model
  async findMerchantCommissionSettings(merchantId: string, paymentMethod: PaymentMethod) {
    return prisma.commissionSettings.findFirst({
      where: {
        merchantId,
        isActive: true,
        appliesTo: { array_contains: [paymentMethod] },
      },
    });
  }

  async findGlobalCommissionSettings(paymentMethod: PaymentMethod) {
    return prisma.commissionSettings.findFirst({
      where: {
        merchantId: null,
        isActive: true,
        appliesTo: { array_contains: [paymentMethod] },
      },
    });
  }

  async findCommissionSettingsFirst(where: any) {
    return prisma.commissionSettings.findFirst({ where, orderBy: { createdAt: 'desc' } });
  }

  async updateCommissionSettings(id: string, data: any) {
    return prisma.commissionSettings.update({ where: { id }, data });
  }

  async createCommissionSettings(data: any) {
    return prisma.commissionSettings.create({ data });
  }

  async findPaymentAmountsByCriteria(where: any) {
    return prisma.payment.findMany({ where, select: { amount: true, currency: true } });
  }

  async findDistinctCustomersByPaymentMethod(paymentMethod: string, since: Date) {
    return prisma.payment.findMany({
      where: { paymentMethod: paymentMethod as any, createdAt: { gte: since } },
      select: { customerId: true },
      distinct: ['customerId'],
    });
  }

  async findPaymentsForCommission(where: any) {
    return prisma.payment.findMany({
      where,
      select: { commissionAmount: true },
    });
  }

  // Merchant gateway operations
  async findMerchantGateway(merchantId: string, gatewayType: string) {
    return prisma.merchantPaymentGateway.findFirst({
      where: { merchantId, gatewayType: gatewayType as any },
    });
  }

  async findMerchantGatewayByConnectAccountId(connectAccountId: string, gatewayType: string) {
    return prisma.merchantPaymentGateway.findFirst({
      where: { connectAccountId, gatewayType: gatewayType as any },
    });
  }

  async findMerchantGatewayById(id: string) {
    return prisma.merchantPaymentGateway.findUnique({ where: { id } });
  }

  async findMerchantGatewayByMerchantAndType(merchantId: string, gatewayType: string) {
    return prisma.merchantPaymentGateway.findUnique({
      where: { merchantId_gatewayType: { merchantId, gatewayType: gatewayType as any } },
    });
  }

  async findActiveMerchantGatewaysPublic(merchantId: string) {
    return prisma.merchantPaymentGateway.findMany({
      where: { merchantId, isActive: true, verificationStatus: 'VERIFIED' as any },
      select: {
        id: true, gatewayType: true, isActive: true, connectAccountId: true,
        verificationStatus: true, metadata: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllMerchantGatewaysPublic(merchantId: string) {
    return prisma.merchantPaymentGateway.findMany({
      where: { merchantId },
      select: {
        id: true, gatewayType: true, isActive: true, connectAccountId: true,
        verificationStatus: true, metadata: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMerchantGateways(merchantId: string) {
    return prisma.merchantPaymentGateway.findMany({ where: { merchantId } });
  }

  async createMerchantGateway(data: any) {
    return prisma.merchantPaymentGateway.create({ data });
  }

  async updateMerchantGateway(id: string, data: any) {
    return prisma.merchantPaymentGateway.update({ where: { id }, data });
  }

  async deleteMerchantGateway(id: string) {
    return prisma.merchantPaymentGateway.delete({ where: { id } });
  }
}
