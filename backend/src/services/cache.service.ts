// Re-export shim — canonical location is shared/cache/
export { CacheService, CacheKeys } from '../shared/cache';

import { CacheService } from '../shared/cache';
const cacheInstance = new CacheService();
export default cacheInstance;
