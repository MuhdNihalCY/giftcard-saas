export declare class CacheService {
    private client;
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache
     */
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    /**
     * Delete value from cache
     */
    delete(key: string): Promise<boolean>;
    /**
     * Delete multiple keys matching pattern
     */
    deletePattern(pattern: string): Promise<number>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Get or set with cache
     */
    getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds?: number): Promise<T>;
    /**
     * Invalidate cache for a key pattern
     */
    invalidate(pattern: string): Promise<void>;
}
export declare const CacheKeys: {
    giftCard: (id: string) => string;
    giftCardByCode: (code: string) => string;
    userGiftCards: (userId: string, page?: number, limit?: number) => string;
    merchantGiftCards: (merchantId: string, page?: number, limit?: number) => string;
    user: (id: string) => string;
    userByEmail: (email: string) => string;
};
declare const _default: CacheService;
export default _default;
//# sourceMappingURL=cache.service.d.ts.map