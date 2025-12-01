import { Router, Request, Response } from 'express';
import healthController from '../controllers/health.controller';
import apiDocsController from '../controllers/api-docs.controller';

const router = Router();

// Handle OPTIONS for all health routes
router.options('*', (_req: Request, res: Response) => {
  res.status(204).end();
});

// Health check endpoints (no authentication required)
router.get('/', healthController.healthCheck.bind(healthController));
router.get('/detailed', healthController.detailedHealthCheck.bind(healthController));
router.get('/metrics', healthController.getMetrics.bind(healthController));
router.get('/status', healthController.getStatus.bind(healthController));

// API documentation endpoint
router.get('/docs', apiDocsController.getApiDocs.bind(apiDocsController));

export default router;
