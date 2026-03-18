import { GiftCardStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../infrastructure/database';

// ─── Template types ───────────────────────────────────────────────────────────

export type TemplateCreateData = {
  merchantId: string;
  name: string;
  description?: string;
  designData: any;
  isPublic?: boolean;
};

export type TemplateUpdateData = {
  name?: string;
  description?: string;
  designData?: any;
  isPublic?: boolean;
};

// ─── Product types ────────────────────────────────────────────────────────────

export type ProductCreateData = {
  merchantId: string;
  name: string;
  description?: string;
  image?: string;
  minAmount?: Decimal | null;
  maxAmount?: Decimal | null;
  minSalePrice?: Decimal | null;
  maxSalePrice?: Decimal | null;
  allowCustomAmount?: boolean;
  fixedAmounts?: any;
  fixedSalePrices?: any;
  currency?: string;
  expiryDays?: number;
  templateId?: string;
  category?: string;
  tags?: any;
  isActive?: boolean;
  isPublic?: boolean;
};

export type ProductUpdateData = Partial<Omit<ProductCreateData, 'merchantId'>>;

export class GiftCardRepository {
  async findById(id: string) {
    return prisma.giftCard.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true, businessLogo: true },
        },
        template: true,
      },
    });
  }

  async findByCode(code: string) {
    return prisma.giftCard.findUnique({
      where: { code },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true, businessLogo: true },
        },
        template: true,
      },
    });
  }

  async codeExists(code: string): Promise<boolean> {
    const existing = await prisma.giftCard.findUnique({ where: { code }, select: { id: true } });
    return existing !== null;
  }

  async create(data: Prisma.GiftCardCreateInput) {
    return prisma.giftCard.create({
      data,
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
        template: true,
      },
    });
  }

  async createWithId(data: {
    id: string;
    merchantId: string;
    code: string;
    qrCodeUrl: string;
    value: Decimal;
    currency: string;
    balance: Decimal;
    expiryDate?: Date;
    templateId?: string;
    productId?: string;
    customMessage?: string;
    recipientEmail?: string;
    recipientName?: string;
    allowPartialRedemption: boolean;
    status: GiftCardStatus;
  }) {
    return prisma.giftCard.create({
      data,
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
        template: true,
      },
    });
  }

  async update(id: string, data: Prisma.GiftCardUpdateInput) {
    return prisma.giftCard.update({
      where: { id },
      data,
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
        template: true,
      },
    });
  }

  async updateStatus(id: string, status: GiftCardStatus) {
    return prisma.giftCard.update({ where: { id }, data: { status } });
  }

  async updateBalance(id: string, balance: Decimal, status: GiftCardStatus) {
    return prisma.giftCard.update({ where: { id }, data: { balance, status } });
  }

  async delete(id: string) {
    return prisma.giftCard.delete({ where: { id } });
  }

  async findMany(where: Prisma.GiftCardWhereInput, skip: number, take: number) {
    return prisma.giftCard.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true, businessLogo: true },
        },
        template: true,
      },
    });
  }

  async count(where: Prisma.GiftCardWhereInput) {
    return prisma.giftCard.count({ where });
  }

  async findForSearch(where: Prisma.GiftCardWhereInput) {
    return prisma.giftCard.findMany({
      where,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: { select: { businessName: true } },
      },
    });
  }

  async createMany(data: Prisma.GiftCardCreateManyInput[]) {
    return prisma.giftCard.createMany({ data });
  }

  async findByIdWithPaymentsAndRedemptions(id: string) {
    return prisma.giftCard.findUnique({
      where: { id },
      include: {
        payments: {
          where: { status: 'COMPLETED' as any },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        redemptions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findProductById(productId: string) {
    return prisma.giftCardProduct.findUnique({
      where: { id: productId },
      select: { templateId: true },
    });
  }

  // ─── Share token methods ───────────────────────────────────────────────────

  async findByShareToken(token: string) {
    return prisma.giftCard.findUnique({
      where: { shareToken: token },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true, businessLogo: true },
        },
        template: true,
        product: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }

  async updateShareToken(id: string, token: string, expiry: Date) {
    return prisma.giftCard.update({
      where: { id },
      data: { shareToken: token, shareTokenExpiry: expiry },
    });
  }

  async revokeShareToken(id: string) {
    return prisma.giftCard.update({
      where: { id },
      data: { shareToken: null, shareTokenExpiry: null },
    });
  }

  // ─── Template methods ──────────────────────────────────────────────────────

  async createTemplate(data: TemplateCreateData) {
    return prisma.giftCardTemplate.create({
      data,
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async findTemplateById(id: string) {
    return prisma.giftCardTemplate.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async findTemplates(where: any, skip: number, take: number) {
    return prisma.giftCardTemplate.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async countTemplates(where: any) {
    return prisma.giftCardTemplate.count({ where });
  }

  async findTemplatesByMerchant(merchantId: string) {
    return prisma.giftCardTemplate.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'asc' },
      take: 1,
    });
  }

  async updateTemplate(id: string, data: TemplateUpdateData) {
    return prisma.giftCardTemplate.update({
      where: { id },
      data,
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true },
        },
      },
    });
  }

  async deleteTemplate(id: string) {
    return prisma.giftCardTemplate.delete({ where: { id } });
  }

  async countGiftCardsForTemplate(templateId: string) {
    return prisma.giftCard.count({ where: { templateId } });
  }

  async countProductsForTemplate(templateId: string) {
    return prisma.giftCardProduct.count({ where: { templateId } });
  }

  // ─── Product methods ───────────────────────────────────────────────────────

  async createProduct(data: ProductCreateData) {
    return prisma.giftCardProduct.create({
      data,
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true, businessLogo: true },
        },
        template: true,
      },
    });
  }

  async findProductByIdFull(id: string) {
    return prisma.giftCardProduct.findUnique({
      where: { id },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true, businessLogo: true },
        },
        template: true,
      },
    });
  }

  async findProducts(where: any, skip: number, take: number) {
    return prisma.giftCardProduct.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true, businessLogo: true },
        },
        template: true,
      },
    });
  }

  async countProducts(where: any) {
    return prisma.giftCardProduct.count({ where });
  }

  async findProductSuggestions(where: any) {
    return prisma.giftCardProduct.findMany({
      where,
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true },
    });
  }

  async updateProduct(id: string, data: any) {
    return prisma.giftCardProduct.update({
      where: { id },
      data,
      include: {
        merchant: {
          select: { id: true, email: true, businessName: true, businessLogo: true },
        },
        template: true,
      },
    });
  }

  async deleteProduct(id: string) {
    return prisma.giftCardProduct.delete({ where: { id } });
  }

  async countGiftCardsForProduct(productId: string) {
    return prisma.giftCard.count({ where: { productId } });
  }
}
