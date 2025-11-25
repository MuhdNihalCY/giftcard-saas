import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import cacheService, { CacheKeys } from './cache.service';

export interface CreateProductData {
  merchantId: string;
  name: string;
  description?: string;
  image?: string;
  minAmount?: number; // Gift card value
  maxAmount?: number; // Gift card value
  minSalePrice?: number; // What customer pays
  maxSalePrice?: number; // What customer pays
  allowCustomAmount?: boolean;
  fixedAmounts?: number[]; // Gift card values
  fixedSalePrices?: number[]; // Sale prices (corresponding to fixedAmounts)
  currency?: string;
  expiryDays?: number;
  templateId?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  isPublic?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  image?: string;
  minAmount?: number;
  maxAmount?: number;
  minSalePrice?: number;
  maxSalePrice?: number;
  allowCustomAmount?: boolean;
  fixedAmounts?: number[];
  fixedSalePrices?: number[];
  currency?: string;
  expiryDays?: number;
  templateId?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  isPublic?: boolean;
}

type ProductWithRelations = {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  image: string | null;
  minAmount: Decimal | null;
  maxAmount: Decimal | null;
  minSalePrice: Decimal | null;
  maxSalePrice: Decimal | null;
  allowCustomAmount: boolean;
  fixedAmounts: any;
  fixedSalePrices: any;
  currency: string;
  expiryDays: number | null;
  templateId: string | null;
  category: string | null;
  tags: any;
  isActive: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  merchant: {
    id: string;
    email: string;
    businessName: string | null;
    businessLogo: string | null;
  };
  template: any;
};

export class GiftCardProductService {
  /**
   * Create a new gift card product
   */
  async create(data: CreateProductData) {
    let {
      merchantId,
      name,
      description,
      image,
      minAmount,
      maxAmount,
      minSalePrice,
      maxSalePrice,
      allowCustomAmount = false,
      fixedAmounts,
      fixedSalePrices,
      currency = 'USD',
      expiryDays,
      templateId,
      category,
      tags,
      isActive = true,
      isPublic = false,
    } = data;

    if (!name || name.trim().length === 0) {
      throw new ValidationError('Product name is required');
    }

    // Validate amounts
    if (minAmount !== undefined && minAmount <= 0) {
      throw new ValidationError('Minimum amount must be greater than 0');
    }

    if (maxAmount !== undefined && maxAmount <= 0) {
      throw new ValidationError('Maximum amount must be greater than 0');
    }

    if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
      throw new ValidationError('Minimum amount cannot be greater than maximum amount');
    }

    // Validate fixed amounts
    if (fixedAmounts && fixedAmounts.length > 0) {
      for (const amount of fixedAmounts) {
        if (amount <= 0) {
          throw new ValidationError('All fixed amounts must be greater than 0');
        }
        if (minAmount !== undefined && amount < minAmount) {
          throw new ValidationError(`Fixed amount ${amount} is less than minimum amount ${minAmount}`);
        }
        if (maxAmount !== undefined && amount > maxAmount) {
          throw new ValidationError(`Fixed amount ${amount} is greater than maximum amount ${maxAmount}`);
        }
      }
      
      // Validate fixed sale prices match fixed amounts
      let finalFixedSalePrices = fixedSalePrices;
      if (fixedSalePrices) {
        if (fixedSalePrices.length !== fixedAmounts.length) {
          throw new ValidationError('Fixed sale prices must have the same length as fixed amounts');
        }
        for (const salePrice of fixedSalePrices) {
          if (salePrice <= 0) {
            throw new ValidationError('All fixed sale prices must be greater than 0');
          }
        }
      } else {
        // If no sale prices provided, use amounts as sale prices (no discount)
        finalFixedSalePrices = [...fixedAmounts];
      }
      
      // Update the variable for use in create
      fixedSalePrices = finalFixedSalePrices;
    }
    
    // Validate sale prices
    if (minSalePrice !== undefined && minSalePrice <= 0) {
      throw new ValidationError('Minimum sale price must be greater than 0');
    }
    if (maxSalePrice !== undefined && maxSalePrice <= 0) {
      throw new ValidationError('Maximum sale price must be greater than 0');
    }
    if (minSalePrice !== undefined && maxSalePrice !== undefined && minSalePrice > maxSalePrice) {
      throw new ValidationError('Minimum sale price cannot be greater than maximum sale price');
    }

    // If allowCustomAmount is true, minAmount and maxAmount are required
    if (allowCustomAmount && (!minAmount || !maxAmount)) {
      throw new ValidationError('Minimum and maximum amounts are required when custom amounts are allowed');
    }

    const product = await prisma.giftCardProduct.create({
      data: {
        merchantId,
        name,
        description,
        image,
        minAmount: minAmount ? new Decimal(minAmount) : null,
        maxAmount: maxAmount ? new Decimal(maxAmount) : null,
        minSalePrice: minSalePrice ? new Decimal(minSalePrice) : null,
        maxSalePrice: maxSalePrice ? new Decimal(maxSalePrice) : null,
        allowCustomAmount,
        fixedAmounts: fixedAmounts ? (fixedAmounts as any) : null,
        fixedSalePrices: fixedSalePrices ? (fixedSalePrices as any) : null,
        currency,
        expiryDays,
        templateId,
        category,
        tags: tags ? (tags as any) : null,
        isActive,
        isPublic,
      },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            businessName: true,
            businessLogo: true,
          },
        },
        template: true,
      },
    });

    // Invalidate cache
    await cacheService.invalidate(`products:merchant:${merchantId}:*`);
    await cacheService.invalidate('products:public:*');

    return product;
  }

  /**
   * Get product by ID
   */
  async getById(id: string, includeInactive: boolean = false): Promise<ProductWithRelations> {
    const cacheKey = `product:${id}`;
    
    // Try to get from cache
    const cached = await cacheService.get<ProductWithRelations>(cacheKey);
    if (cached) {
      if (!includeInactive && !cached.isActive) {
        throw new NotFoundError('Product not found');
      }
      return cached;
    }

    const product = await prisma.giftCardProduct.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            businessName: true,
            businessLogo: true,
          },
        },
        template: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!includeInactive && !product.isActive) {
      throw new NotFoundError('Product not found');
    }

    // Cache for 5 minutes
    await cacheService.set(cacheKey, product, 300);

    return product as ProductWithRelations;
  }

  /**
   * List products with filters
   */
  async list(filters: {
    merchantId?: string;
    isActive?: boolean;
    isPublic?: boolean;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { merchantId, isActive, isPublic, category, search, page = 1, limit = 20 } = filters;
    
    // Build cache key
    let cacheKey: string;
    if (merchantId) {
      cacheKey = `products:merchant:${merchantId}:page:${page}:limit:${limit}:active:${isActive ?? 'all'}`;
    } else {
      cacheKey = `products:public:page:${page}:limit:${limit}:category:${category || 'all'}:search:${search || 'none'}`;
    }

    // Try to get from cache
    const cached = await cacheService.get<{ products: ProductWithRelations[]; pagination: any }>(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = (page - 1) * limit;

    const where: any = {};
    if (merchantId) where.merchantId = merchantId;
    if (isActive !== undefined) where.isActive = isActive;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.giftCardProduct.findMany({
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
              businessLogo: true,
            },
          },
          template: true,
        },
      }),
      prisma.giftCardProduct.count({ where }),
    ]);

    const result = {
      products: products as ProductWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache for 2 minutes
    await cacheService.set(cacheKey, result, 120);

    return result;
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductData, userId: string) {
    const product = await this.getById(id, true); // Include inactive for update

    // Check if user is the merchant
    if (product.merchantId !== userId) {
      throw new ValidationError('You can only update your own products');
    }

    // Validate amounts if provided
    if (data.minAmount !== undefined && data.minAmount <= 0) {
      throw new ValidationError('Minimum amount must be greater than 0');
    }

    if (data.maxAmount !== undefined && data.maxAmount <= 0) {
      throw new ValidationError('Maximum amount must be greater than 0');
    }

    const finalMinAmount = data.minAmount !== undefined ? data.minAmount : Number(product.minAmount || 0);
    const finalMaxAmount = data.maxAmount !== undefined ? data.maxAmount : Number(product.maxAmount || 0);

    if (finalMinAmount > 0 && finalMaxAmount > 0 && finalMinAmount > finalMaxAmount) {
      throw new ValidationError('Minimum amount cannot be greater than maximum amount');
    }

    // Validate fixed amounts
    const finalFixedAmounts = data.fixedAmounts !== undefined ? data.fixedAmounts : (product.fixedAmounts as number[] || []);
    if (finalFixedAmounts && finalFixedAmounts.length > 0) {
      for (const amount of finalFixedAmounts) {
        if (amount <= 0) {
          throw new ValidationError('All fixed amounts must be greater than 0');
        }
        if (finalMinAmount > 0 && amount < finalMinAmount) {
          throw new ValidationError(`Fixed amount ${amount} is less than minimum amount ${finalMinAmount}`);
        }
        if (finalMaxAmount > 0 && amount > finalMaxAmount) {
          throw new ValidationError(`Fixed amount ${amount} is greater than maximum amount ${finalMaxAmount}`);
        }
      }
    }

    // If allowCustomAmount is true, minAmount and maxAmount are required
    const finalAllowCustomAmount = data.allowCustomAmount !== undefined ? data.allowCustomAmount : product.allowCustomAmount;
    if (finalAllowCustomAmount && (finalMinAmount <= 0 || finalMaxAmount <= 0)) {
      throw new ValidationError('Minimum and maximum amounts are required when custom amounts are allowed');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.minAmount !== undefined) updateData.minAmount = new Decimal(data.minAmount);
    if (data.maxAmount !== undefined) updateData.maxAmount = new Decimal(data.maxAmount);
    if (data.minSalePrice !== undefined) updateData.minSalePrice = new Decimal(data.minSalePrice);
    if (data.maxSalePrice !== undefined) updateData.maxSalePrice = new Decimal(data.maxSalePrice);
    if (data.allowCustomAmount !== undefined) updateData.allowCustomAmount = data.allowCustomAmount;
    if (data.fixedAmounts !== undefined) updateData.fixedAmounts = data.fixedAmounts as any;
    if (data.fixedSalePrices !== undefined) updateData.fixedSalePrices = data.fixedSalePrices as any;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.expiryDays !== undefined) updateData.expiryDays = data.expiryDays;
    if (data.templateId !== undefined) updateData.templateId = data.templateId;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags as any;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    const updated = await prisma.giftCardProduct.update({
      where: { id },
      data: updateData,
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            businessName: true,
            businessLogo: true,
          },
        },
        template: true,
      },
    });

    // Invalidate cache
    await cacheService.delete(`product:${id}`);
    await cacheService.invalidate(`products:merchant:${product.merchantId}:*`);
    await cacheService.invalidate('products:public:*');

    return updated;
  }

  /**
   * Delete product
   */
  async delete(id: string, userId: string) {
    const product = await this.getById(id, true); // Include inactive for delete

    // Check if user is the merchant
    if (product.merchantId !== userId) {
      throw new ValidationError('You can only delete your own products');
    }

    // Check if product is being used
    const giftCardsUsingProduct = await prisma.giftCard.count({
      where: { productId: id },
    });

    if (giftCardsUsingProduct > 0) {
      throw new ValidationError(
        `Cannot delete product. It is being used by ${giftCardsUsingProduct} gift card(s)`
      );
    }

    await prisma.giftCardProduct.delete({
      where: { id },
    });

    // Invalidate cache
    await cacheService.delete(`product:${id}`);
    await cacheService.invalidate(`products:merchant:${product.merchantId}:*`);
    await cacheService.invalidate('products:public:*');

    return { message: 'Product deleted successfully' };
  }
}

export default new GiftCardProductService();

