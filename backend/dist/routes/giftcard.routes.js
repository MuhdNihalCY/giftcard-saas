"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const giftcard_controller_1 = __importDefault(require("../controllers/giftcard.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const giftcard_validator_1 = require("../validators/giftcard.validator");
const router = (0, express_1.Router)();
// Gift Card Routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(giftcard_validator_1.createGiftCardSchema), giftcard_controller_1.default.create.bind(giftcard_controller_1.default));
router.get('/', auth_middleware_1.authenticate, giftcard_controller_1.default.list.bind(giftcard_controller_1.default));
router.get('/:id', giftcard_controller_1.default.getById.bind(giftcard_controller_1.default));
router.get('/code/:code', giftcard_controller_1.default.getByCode.bind(giftcard_controller_1.default));
router.get('/:id/qr', giftcard_controller_1.default.getQRCode.bind(giftcard_controller_1.default));
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(giftcard_validator_1.updateGiftCardSchema), giftcard_controller_1.default.update.bind(giftcard_controller_1.default));
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), giftcard_controller_1.default.delete.bind(giftcard_controller_1.default));
router.post('/bulk', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(giftcard_validator_1.bulkCreateGiftCardSchema), giftcard_controller_1.default.bulkCreate.bind(giftcard_controller_1.default));
// Template Routes
router.post('/templates', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(giftcard_validator_1.createTemplateSchema), giftcard_controller_1.default.createTemplate.bind(giftcard_controller_1.default));
router.get('/templates', giftcard_controller_1.default.listTemplates.bind(giftcard_controller_1.default));
router.get('/templates/:id', giftcard_controller_1.default.getTemplateById.bind(giftcard_controller_1.default));
router.put('/templates/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), (0, validation_middleware_1.validate)(giftcard_validator_1.updateTemplateSchema), giftcard_controller_1.default.updateTemplate.bind(giftcard_controller_1.default));
router.delete('/templates/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'), giftcard_controller_1.default.deleteTemplate.bind(giftcard_controller_1.default));
exports.default = router;
//# sourceMappingURL=giftcard.routes.js.map