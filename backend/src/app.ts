import express, { Express } from 'express';
import { env } from './infrastructure/env';
import prisma from './infrastructure/database';
import { configureMiddleware, errorHandler } from './server/middleware';
import { registerModules } from './server/module-registry';
import logger from './utils/logger';

const app: Express = express();

configureMiddleware(app);
registerModules(app);
app.use(errorHandler);

function redactDatabaseUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = '********';
    return u.toString();
  } catch {
    return url.replace(/:\/\/([^:]+):([^@]+)@/g, '://$1:********@');
  }
}

// Start workers and schedulers (only in production or when explicitly enabled)
if (env.NODE_ENV === 'production' || process.env.ENABLE_WORKERS === 'true') {
  import('./workers').then(() => {
    import('./shared/scheduler').then(({ schedulerService }) => {
      schedulerService.start();
      logger.info('Background workers and schedulers started');
    });

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, closing workers...');
      const { closeWorkers } = await import('./workers');
      await closeWorkers();
      process.exit(0);
    });
  });
}

async function start() {
  try {
    await prisma.$connect();
    logger.info(`✅ Database connected: ${redactDatabaseUrl(env.DATABASE_URL)}`);
  } catch (err) {
    logger.error('❌ Database connection failed (Prisma)', {
      databaseUrl: redactDatabaseUrl(env.DATABASE_URL),
      error: err instanceof Error ? { name: err.name, message: err.message } : err,
      hint: 'If using Docker, ensure docker-compose Postgres is running and DATABASE_URL matches.',
    });
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    logger.info('='.repeat(60));
    logger.info(`🚀 Server is running on port ${env.PORT}`);
    logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    logger.info(`🔗 CORS_ORIGIN: ${env.CORS_ORIGIN}`);
    logger.info(`📡 Health endpoint: http://localhost:${env.PORT}/health`);
    logger.info(`🔌 API endpoint: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
    logger.info('='.repeat(60));
  });
}

void start();

export default app;
