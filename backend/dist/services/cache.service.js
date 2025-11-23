"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = exports.CacheService = void 0;
const redis_1 = require("../config/redis");
const logger_1 = __importDefault(require("../utils/logger"));
class CacheService {
    client = (0, redis_1.getRedisClient)();
    /**
     * Get value from cache
     */
    async get(key) {
        if (!this.client) {
            return null;
        }
        try {
            const value = await this.client.get(key);
            if (value) {
                return JSON.parse(value);
            }
            return null;
        }
        catch (error) {
            logger_1.default.error('Cache get error', { key, error });
            return null;
        }
    }
    /**
     * Set value in cache
     */
    async set(key, value, ttlSeconds) {
        if (!this.client) {
            return false;
        }
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, serialized);
            }
            else {
                await this.client.set(key, serialized);
            }
            return true;
        }
        catch (error) {
            logger_1.default.error('Cache set error', { key, error });
            return false;
        }
    }
    /**
     * Delete value from cache
     */
    async delete(key) {
        if (!this.client) {
            return false;
        }
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            logger_1.default.error('Cache delete error', { key, error });
            return false;
        }
    }
    /**
     * Delete multiple keys matching pattern
     */
    async deletePattern(pattern) {
        if (!this.client) {
            return 0;
        }
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length === 0) {
                return 0;
            }
            await this.client.del(...keys);
            return keys.length;
        }
        catch (error) {
            logger_1.default.error('Cache delete pattern error', { pattern, error });
            return 0;
        }
    }
    /**
     * Check if key exists
     */
    async exists(key) {
        if (!this.client) {
            return false;
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            logger_1.default.error('Cache exists error', { key, error });
            return false;
        }
    }
    /**
     * Get or set with cache
     */
    async getOrSet(key, fetchFn, ttlSeconds) {
        // Try to get from cache
        const cached = await this.get(key);
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
    async invalidate(pattern) {
        await this.deletePattern(pattern);
    }
}
exports.CacheService = CacheService;
// Cache key generators
exports.CacheKeys = {
    giftCard: (id) => `giftcard:${id}`,
    giftCardByCode: (code) => `giftcard:code:${code}`,
    userGiftCards: (userId, page, limit) => `giftcards:user:${userId}:page:${page || 1}:limit:${limit || 10}`,
    merchantGiftCards: (merchantId, page, limit) => `giftcards:merchant:${merchantId}:page:${page || 1}:limit:${limit || 10}`,
    user: (id) => `user:${id}`,
    userByEmail: (email) => `user:email:${email}`,
};
exports.default = new CacheService();
//# sourceMappingURL=cache.service.js.map