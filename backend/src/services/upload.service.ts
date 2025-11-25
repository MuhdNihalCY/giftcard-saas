import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { sanitizeFilename } from '../utils/sanitize';
import { ValidationError } from '../utils/errors';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedOriginalName = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedOriginalName);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only images are allowed.'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export class UploadService {
  /**
   * Get file URL
   */
  getFileUrl(filename: string): string {
    return `${env.BACKEND_URL}/uploads/${filename}`;
  }

  /**
   * Delete file
   */
  deleteFile(filename: string): void {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Validate file
   */
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only images are allowed.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ValidationError('File size exceeds 5MB limit.');
    }
  }
}

export default new UploadService();

