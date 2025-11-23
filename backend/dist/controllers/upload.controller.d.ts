import { Request, Response, NextFunction } from 'express';
export declare class UploadController {
    uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadMultiple(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteFile(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: UploadController;
export default _default;
//# sourceMappingURL=upload.controller.d.ts.map