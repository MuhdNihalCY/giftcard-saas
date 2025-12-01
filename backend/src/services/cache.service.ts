import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

export class CacheService {
  private client = getRedisClient();
  private isRedisAvailable = false;
  private redisErrorCount = 0;
  private readonly MAX_REDIS_ERRORS = 3;

  constructor() {
    // Check Redis availability on initialization
    if (this.client) {
      this.client.on('ready', () => {
        this.isRedisAvailable = true;
        this.redisErrorCount = 0; // Reset error count on successful connection
      });
      this.client.on('error', () => {
        this.redisErrorCount++;
        // Disable Redis after too many errors
        if (this.redisErrorCount >= this.MAX_REDIS_ERRORS) {
          this.isRedisAvailable = false;
          logger.warn(`Redis disabled after ${this.MAX_REDIS_ERRORS} errors`);
        }
      });
      // Check initial status
      this.isRedisAvailable = this.client.status === 'ready';
    } else {
      // No Redis client available
      this.isRedisAvailable = false;
    }
  }

  /**
   * Get value from cache
   */
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
      // Mark Redis as unavailable if we get errors
      this.isRedisAvailable = false;
      // Silently fail - cache is optional
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache get error', { key, error: error.message });
      }
      return null;
    }
  }

  /**
   * Set value in cache
   */
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
      // Mark Redis as unavailable if we get errors
      this.isRedisAvailable = false;
      // Silently fail - cache is optional
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache set error', { key, error: error.message });
      }
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.client || !this.isRedisAvailable) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      // Mark Redis as unavailable if we get errors
      this.isRedisAvailable = false;
      // Silently fail - cache is optional
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache delete error', { key, error: error.message });
      }
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.client || !this.isRedisAvailable) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      // Use pipeline for multiple deletions to avoid syntax errors
      if (keys.length === 1) {
        await this.client.del(keys[0]);
      } else {
        const pipeline = this.client.pipeline();
        keys.forEach(key => pipeline.del(key));
        await pipeline.exec();
      }
      return keys.length;
    } catch (error: any) {
      // Mark Redis as unavailable if we get errors
      this.isRedisAvailable = false;
      // Silently fail - cache is optional
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache delete pattern error', { pattern, error: error.message });
      }
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isRedisAvailable) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      // Mark Redis as unavailable if we get errors
      this.isRedisAvailable = false;
      // Silently fail - cache is optional
      if (error.message && !error.message.includes('Connection') && !error.message.includes('syntax')) {
        logger.warn('Cache exists error', { key, error: error.message });
      }
      return false;
    }
  }

  /**
   * Get or set with cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const value = await fetchFn();

    // Store in cache
    await this.set(key, value, ttlSeconds);

    return value;
  }

  /**
   * Invalidate cache for a key pattern
   */
  async invalidate(pattern: string): Promise<void> {
    await this.deletePattern(pattern);
  }
}

// Cache key generators
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

export default new CacheService();


