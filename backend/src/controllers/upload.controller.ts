import { Request, Response, NextFunction } from 'express';
import uploadService from '../services/upload.service';
import { ValidationError } from '../utils/errors';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export class UploadController {
  async uploadImage(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new ValidationError('No file uploaded');
      }

      uploadService.validateFile(req.file);
      const fileUrl = uploadService.getFileUrl(req.file.filename);

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
    } catch (error) {
      next(error);
    }
  }

  async uploadMultiple(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        throw new ValidationError('No files uploaded');
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];
      const uploadedFiles = (files as Express.Multer.File[]).map((file) => {
        uploadService.validateFile(file);
        return {
          filename: file.filename,
          originalName: file.originalname,
          url: uploadService.getFileUrl(file.filename),
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
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename } = req.params;
      uploadService.deleteFile(filename);
      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();

