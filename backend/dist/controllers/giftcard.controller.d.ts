import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class GiftCardController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getByCode(req: Request, res: Response, next: NextFunction): Promise<void>;
    list(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    bulkCreate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getQRCode(req: Request, res: Response, next: NextFunction): Promise<void>;
    createTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTemplateById(req: Request, res: Response, next: NextFunction): Promise<void>;
    listTemplates(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTemplate(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: GiftCardController;
export default _default;
//# sourceMappingURL=giftcard.controller.d.ts.map