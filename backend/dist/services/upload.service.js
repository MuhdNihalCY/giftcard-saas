"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});
// File filter
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errors_1.ValidationError('Invalid file type. Only images are allowed.'));
    }
};
// Multer configuration
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
class UploadService {
    /**
     * Get file URL
     */
    getFileUrl(filename) {
        return `${env_1.env.BACKEND_URL}/uploads/${filename}`;
    }
    /**
     * Delete file
     */
    deleteFile(filename) {
        const filePath = path_1.default.join(uploadsDir, filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    /**
     * Validate file
     */
    validateFile(file) {
        if (!file) {
            throw new errors_1.ValidationError('No file provided');
        }
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new errors_1.ValidationError('Invalid file type. Only images are allowed.');
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new errors_1.ValidationError('File size exceeds 5MB limit.');
        }
    }
}
exports.UploadService = UploadService;
exports.default = new UploadService();
//# sourceMappingURL=upload.service.js.map