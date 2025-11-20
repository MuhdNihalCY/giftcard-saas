import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../services/upload.service';
import { env } from '../config/env';

const router = Router();

// All upload routes require authentication
router.use(authenticate);
router.use(authorize('ADMIN', 'MERCHANT'));

// Single file upload
router.post(
  '/image',
  upload.single('image'),
  uploadController.uploadImage.bind(uploadController)
);

// Multiple files upload
router.post(
  '/images',
  upload.array('images', 10),
  uploadController.uploadMultiple.bind(uploadController)
);

// Delete file
router.delete(
  '/:filename',
  uploadController.deleteFile.bind(uploadController)
);

export default router;

