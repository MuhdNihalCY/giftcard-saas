import multer from 'multer';
export declare const upload: multer.Multer;
export declare class UploadService {
    /**
     * Get file URL
     */
    getFileUrl(filename: string): string;
    /**
     * Delete file
     */
    deleteFile(filename: string): void;
    /**
     * Validate file
     */
    validateFile(file: Express.Multer.File): void;
}
declare const _default: UploadService;
export default _default;
//# sourceMappingURL=upload.service.d.ts.map