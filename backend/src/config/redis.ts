import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (redisClient) {
    return redisClient;
  }

  // If REDIS_URL is not set, don't try to connect
  if (!env.REDIS_URL) {
    logger.info('Redis URL not configured, caching disabled');
    return null;
  }

  try {
    redisClient = new Redis(env.REDIS_URL, {
      retryStrategy: (times) => {
        // Stop retrying after 3 attempts
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries, disabling Redis');
          redisClient = null;
          return null; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: null, // Don't retry on individual requests
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 5000, // 5 second timeout
      commandTimeout: 3000, // 3 second command timeout
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (error) => {
      logger.warn('Redis client error, disabling Redis', { error: error.message });
      // Disable Redis completely on error to prevent crashes
      try {
        redisClient?.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      redisClient = null;
    });

    redisClient.on('close', () => {
      logger.warn('Redis client connection closed');
    });

    // Connect to Redis
    redisClient.connect().catch((error) => {
      logger.warn('Failed to connect to Redis, caching will be disabled', { error: error.message });
      redisClient = null;
    });

    return redisClient;
  } catch (error: any) {
    logger.warn('Redis initialization failed, caching will be disabled', { error: error.message });
    return null;
  }
};

export const closeRedisConnection = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

export default getRedisClient;


