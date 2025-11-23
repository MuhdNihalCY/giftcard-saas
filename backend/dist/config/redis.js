"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedisConnection = exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const logger_1 = __importDefault(require("../utils/logger"));
let redisClient = null;
const getRedisClient = () => {
    if (redisClient) {
        return redisClient;
    }
    try {
        redisClient = new ioredis_1.default(env_1.env.REDIS_URL, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });
        redisClient.on('connect', () => {
            logger_1.default.info('Redis client connected');
        });
        redisClient.on('ready', () => {
            logger_1.default.info('Redis client ready');
        });
        redisClient.on('error', (error) => {
            logger_1.default.error('Redis client error', { error: error.message });
        });
        redisClient.on('close', () => {
            logger_1.default.warn('Redis client connection closed');
        });
        // Connect to Redis
        redisClient.connect().catch((error) => {
            logger_1.default.warn('Failed to connect to Redis, caching will be disabled', { error: error.message });
            redisClient = null;
        });
        return redisClient;
    }
    catch (error) {
        logger_1.default.warn('Redis initialization failed, caching will be disabled', { error: error.message });
        return null;
    }
};
exports.getRedisClient = getRedisClient;
const closeRedisConnection = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger_1.default.info('Redis connection closed');
    }
};
exports.closeRedisConnection = closeRedisConnection;
exports.default = exports.getRedisClient;
//# sourceMappingURL=redis.js.map