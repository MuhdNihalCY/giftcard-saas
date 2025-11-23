"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const communicationSettings_controller_1 = __importDefault(require("../controllers/communicationSettings.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const updateSettingsSchema = zod_1.z.object({
    emailEnabled: zod_1.z.boolean().optional(),
    smsEnabled: zod_1.z.boolean().optional(),
    otpEnabled: zod_1.z.boolean().optional(),
    pushEnabled: zod_1.z.boolean().optional(),
    emailRateLimit: zod_1.z.number().int().min(1).optional(),
    smsRateLimit: zod_1.z.number().int().min(1).optional(),
    otpRateLimit: zod_1.z.number().int().min(1).optional(),
    otpExpiryMinutes: zod_1.z.number().int().min(1).max(60).optional(),
    otpLength: zod_1.z.number().int().min(4).max(8).optional(),
});
// All routes require admin authentication
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)('ADMIN'));
router.get('/', communicationSettings_controller_1.default.getSettings.bind(communicationSettings_controller_1.default));
router.put('/', (0, validation_middleware_1.validate)(updateSettingsSchema), communicationSettings_controller_1.default.updateSettings.bind(communicationSettings_controller_1.default));
exports.default = router;
//# sourceMappingURL=communicationSettings.routes.js.map