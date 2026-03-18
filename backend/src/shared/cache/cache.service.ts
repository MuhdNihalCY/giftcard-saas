import { getRedisClient } from '../../infrastructure/redis';
import logger from '../../utils/logger';

export class CacheService {
  private client = getRedisClient();
  private isRedisAvailable = false;
  private redisErrorCount = 0;
  private readonly MAX_REDIS_ERRORS = 3;

  constructor() {
    if (this.client) {
      this.client.on('ready', () => {
        this.isRedisAvailable = true;
        this.redisErrorCount = 0;
      });
      this.client.on('error', () => {
        this.redisErrorCount++;
        if (this.redisErrorCount >= this.MAX_REDIS_ERRORS) {
          this.isRedisAvailable = false;
          logger.warn(`Redis disabled after ${this.MAX_REDIS_ERRORS} errors`);
        }
      });
      this.isRedisAvailable = this.client.status === 'ready';
    } else {
      this.isRedisAvailable = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isRedisAvailable) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error: any) {
      this.isRedisAvailable = false;
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache get error', { key, error: error.message });
      }
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.client || !this.isRedisAvailable) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error: any) {
      this.isRedisAvailable = false;
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache set error', { key, error: error.message });
      }
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client || !this.isRedisAvailable) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      this.isRedisAvailable = false;
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache delete error', { key, error: error.message });
      }
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    if (!this.client || !this.isRedisAvailable) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      if (keys.length === 1) {
        await this.client.del(keys[0]);
      } else {
        const pipeline = this.client.pipeline();
        keys.forEach(key => pipeline.del(key));
        await pipeline.exec();
      }
      return keys.length;
    } catch (error: any) {
      this.isRedisAvailable = false;
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache delete pattern error', { pattern, error: error.message });
      }
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isRedisAvailable) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      this.isRedisAvailable = false;
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache exists error', { key, error: error.message });
      }
      return false;
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async invalidate(pattern: string): Promise<void> {
    await this.deletePattern(pattern);
  }
}

export const CacheKeys = {
  giftCard: (id: string) => `giftcard:${id}`,
  giftCardByCode: (code: string) => `giftcard:code:${code}`,
  userGiftCards: (userId: string, page?: number, limit?: number) =>
    `giftcards:user:${userId}:page:${page || 1}:limit:${limit || 10}`,
  merchantGiftCards: (merchantId: string, page?: number, limit?: number) =>
    `giftcards:merchant:${merchantId}:page:${page || 1}:limit:${limit || 10}`,
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
};
