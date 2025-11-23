"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationSettingsController = void 0;
const communicationSettings_service_1 = __importDefault(require("../services/communicationSettings.service"));
const errors_1 = require("../utils/errors");
class CommunicationSettingsController {
    /**
     * Get communication settings (Admin only)
     */
    async getSettings(req, res, next) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'ADMIN') {
                throw new errors_1.UnauthorizedError('Only administrators can view communication settings');
            }
            const settings = await communicationSettings_service_1.default.getSettings();
            res.json({
                success: true,
                data: settings,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update communication settings (Admin only)
     */
    async updateSettings(req, res, next) {
        try {
            // Check if user is admin
            if (req.user?.role !== 'ADMIN') {
                throw new errors_1.UnauthorizedError('Only administrators can update communication settings');
            }
            const settings = await communicationSettings_service_1.default.updateSettings(req.body, req.user.userId);
            res.json({
                success: true,
                data: settings,
                message: 'Communication settings updated successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CommunicationSettingsController = CommunicationSettingsController;
exports.default = new CommunicationSettingsController();
//# sourceMappingURL=communicationSettings.controller.js.map