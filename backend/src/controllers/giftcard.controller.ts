import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import giftCardService from '../services/giftcard.service';
import giftCardTemplateService from '../services/giftcard-template.service';

export class GiftCardController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const giftCard = await giftCardService.create({
        ...req.body,
        merchantId: userId,
      });
      res.status(201).json({
        success: true,
        data: giftCard,
        message: 'Gift card created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const role = req.user?.role;

      const giftCard = await giftCardService.getById(id);

      // If user is authenticated and not admin, check ownership
      if (userId && role !== 'ADMIN' && giftCard.merchantId !== userId) {
        // If it's a public route usage, we might want to allow it, but for dashboard usage we should restrict.
        // However, getById returns sensitive info like merchant details.
        // Let's assume strict ownership for getById.
        // If we need public access, we should use getByCode or a specific public endpoint.
        throw new Error('Unauthorized access to gift card');
      }

      res.json({
        success: true,
        data: giftCard,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const giftCard = await giftCardService.getByCode(code);
      res.json({
        success: true,
        data: giftCard,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { merchantId, status, page, limit } = req.query;
      const userId = req.user!.userId;
      const role = req.user!.role;

      // If not admin, force merchantId to be current user
      const filterMerchantId = role === 'ADMIN' ? (merchantId as string) : userId;

      const result = await giftCardService.list({
        merchantId: filterMerchantId,
        status: status as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({
        success: true,
        data: result.giftCards,
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
      const giftCard = await giftCardService.update(id, req.body, userId);
      res.json({
        success: true,
        data: giftCard,
        message: 'Gift card updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      await giftCardService.delete(id, userId);
      res.json({
        success: true,
        message: 'Gift card deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await giftCardService.bulkCreate({
        ...req.body,
        merchantId: userId,
      });
      res.status(201).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const giftCard = await giftCardService.getById(id);
      res.json({
        success: true,
        data: {
          qrCodeUrl: giftCard.qrCodeUrl,
          code: giftCard.code,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Template methods
  async createTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const template = await giftCardTemplateService.create({
        ...req.body,
        merchantId: userId,
      });
      res.status(201).json({
        success: true,
        data: template,
        message: 'Template created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getTemplateById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const template = await giftCardTemplateService.getById(id);
      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  async listTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const { merchantId, isPublic, page, limit } = req.query;
      const result = await giftCardTemplateService.list({
        merchantId: merchantId as string,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json({
        success: true,
        data: result.templates,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const template = await giftCardTemplateService.update(id, req.body, userId);
      res.json({
        success: true,
        data: template,
        message: 'Template updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      await giftCardTemplateService.delete(id, userId);
      res.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GiftCardController();

