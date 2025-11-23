"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = __importDefault(require("../controllers/upload.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_service_1 = require("../services/upload.service");
const router = (0, express_1.Router)();
// All upload routes require authentication
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)('ADMIN', 'MERCHANT'));
// Single file upload
router.post('/image', upload_service_1.upload.single('image'), upload_controller_1.default.uploadImage.bind(upload_controller_1.default));
// Multiple files upload
router.post('/images', upload_service_1.upload.array('images', 10), upload_controller_1.default.uploadMultiple.bind(upload_controller_1.default));
// Delete file
router.delete('/:filename', upload_controller_1.default.deleteFile.bind(upload_controller_1.default));
exports.default = router;
//# sourceMappingURL=upload.routes.js.map