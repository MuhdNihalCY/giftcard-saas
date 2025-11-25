import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import giftCardProductService from '../services/giftcard-product.service';

export class GiftCardProductController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const product = await giftCardProductService.create({
        ...req.body,
        merchantId: userId,
      });
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      const product = await giftCardProductService.getById(id, includeInactive);
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId, isActive, category, search, page, limit } = req.query;
      const result = await giftCardProductService.list({
        merchantId: merchantId as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        category: category as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search, page, limit } = req.query;
      const result = await giftCardProductService.list({
        isActive: true, // Only active products for public
        isPublic: true, // Only public products
        category: category as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const product = await giftCardProductService.update(id, req.body, userId);
      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      await giftCardProductService.delete(id, userId);
      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GiftCardProductController();

