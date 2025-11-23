import Redis from 'ioredis';
export declare const getRedisClient: () => Redis | null;
export declare const closeRedisConnection: () => Promise<void>;
export default getRedisClient;
//# sourceMappingURL=redis.d.ts.map