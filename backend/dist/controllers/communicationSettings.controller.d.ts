import { Request, Response, NextFunction } from 'express';
export declare class CommunicationSettingsController {
    /**
     * Get communication settings (Admin only)
     */
    getSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Update communication settings (Admin only)
     */
    updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: CommunicationSettingsController;
export default _default;
//# sourceMappingURL=communicationSettings.controller.d.ts.map