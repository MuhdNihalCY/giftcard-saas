"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const upload_service_1 = __importDefault(require("../services/upload.service"));
const errors_1 = require("../utils/errors");
class UploadController {
    async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.ValidationError('No file uploaded');
            }
            upload_service_1.default.validateFile(req.file);
            const fileUrl = upload_service_1.default.getFileUrl(req.file.filename);
            res.json({
                success: true,
                data: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    url: fileUrl,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                },
                message: 'File uploaded successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async uploadMultiple(req, res, next) {
        try {
            if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
                throw new errors_1.ValidationError('No files uploaded');
            }
            const files = Array.isArray(req.files) ? req.files : [req.files];
            const uploadedFiles = files.map((file) => {
                upload_service_1.default.validateFile(file);
                return {
                    filename: file.filename,
                    originalName: file.originalname,
                    url: upload_service_1.default.getFileUrl(file.filename),
                    size: file.size,
                    mimetype: file.mimetype,
                };
            });
            res.json({
                success: true,
                data: {
                    files: uploadedFiles,
                    count: uploadedFiles.length,
                },
                message: `${uploadedFiles.length} file(s) uploaded successfully`,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteFile(req, res, next) {
        try {
            const { filename } = req.params;
            upload_service_1.default.deleteFile(filename);
            res.json({
                success: true,
                message: 'File deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UploadController = UploadController;
exports.default = new UploadController();
//# sourceMappingURL=upload.controller.js.map