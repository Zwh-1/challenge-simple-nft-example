/**
 * Preloading service for caching and preloading data with retry logic
 * Optimized for NFT metadata, API calls, and IPFS content
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface PreloadingOptions {
  maxAge?: number; // Cache duration in milliseconds
  retryAttempts?: number;
  retryDelay?: number;
  priority?: 'high' | 'medium' | 'low';
  timeout?: number;
}

interface PreloadingServiceConfig {
  maxCacheSize?: number;
  defaultMaxAge?: number;
  cleanupInterval?: number;
  enableCompression?: boolean;
}

/**
 * PreloadingService class for intelligent data caching and preloading
 */
export class PreloadingService {
  private cache = new Map<string, CacheEntry>();
  private config: Required<PreloadingServiceConfig>;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private activeRequests = new Map<string, Promise<any>>();

  constructor(config: PreloadingServiceConfig = {}) {
    this.config = {
      maxCacheSize: 100,
      defaultMaxAge: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      enableCompression: false,
      ...config,
    };

    this.startCleanupTimer();
  }

  /**
   * Fetch data with caching and retry logic
   */
  async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: PreloadingOptions = {}
  ): Promise<T> {
    const opts = { maxAge: this.config.defaultMaxAge, retryAttempts: 3, retryDelay: 1000, ...options };

    // Check cache first
    const cached = this.getFromCache<T>(key);
    if (cached) {
      return cached;
    }

    // Check if there's an active request for this key
    const activeRequest = this.activeRequests.get(key);
    if (activeRequest) {
      return activeRequest;
    }

    // Create new request with retry logic
    const request = this.fetchWithRetry(fetchFn, opts)
      .then((data) => {
        this.setCache(key, data, opts.maxAge);
        this.activeRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.activeRequests.delete(key);
        throw error;
      });

    this.activeRequests.set(key, request);
    return request;
  }

  /**
   * Get data from cache if available and not expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.lastAccessed = now;
    entry.accessCount++;

    return entry.data;
  }

  /**
   * Set data in cache
   */
  private setCache<T>(key: string, data: T, maxAge: number): void {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + maxAge,
      accessCount: 1,
      lastAccessed: now,
    };

    this.cache.set(key, entry);

    // Enforce max cache size
    if (this.cache.size > this.config.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }
  }

  /**
   * Fetch with retry logic and timeout
   */
  private async fetchWithRetry<T>(
    fetchFn: () => Promise<T>,
    options: PreloadingOptions
  ): Promise<T> {
    const { retryAttempts = 3, retryDelay = 1000, timeout = 30000 } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });

        // Race between fetch and timeout
        const result = await Promise.race([
          fetchFn(),
          timeoutPromise,
        ]);

        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Preload NFT metadata
   */
  async preloadNFTMetadata(nftId: string, fetchFn: () => Promise<any>): Promise<void> {
    const key = `nft-metadata-${nftId}`;
    try {
      await this.fetchWithCache(key, fetchFn, { maxAge: 10 * 60 * 1000, priority: 'high' }); // 10 minutes
    } catch (error) {
      console.warn(`Failed to preload NFT metadata for ${nftId}:`, error);
    }
  }

  /**
   * Preload multiple NFT metadata
   */
  async preloadMultipleNFTMetadata(nftIds: string[], fetchFn: (id: string) => Promise<any>): Promise<void> {
    const promises = nftIds.map((id) => this.preloadNFTMetadata(id, () => fetchFn(id)));
    await Promise.allSettled(promises);
  }

  /**
   * Preload API endpoint data
   */
  async preloadAPI(endpoint: string, fetchFn: () => Promise<any>): Promise<void> {
    const key = `api-${endpoint}`;
    try {
      await this.fetchWithCache(key, fetchFn, { maxAge: 5 * 60 * 1000, priority: 'medium' }); // 5 minutes
    } catch (error) {
      console.warn(`Failed to preload API data for ${endpoint}:`, error);
    }
  }

  /**
   * Preload IPFS content
   */
  async preloadIPFSContent(hash: string, fetchFn: () => Promise<any>): Promise<void> {
    const key = `ipfs-${hash}`;
    try {
      await this.fetchWithCache(key, fetchFn, { maxAge: 30 * 60 * 1000, priority: 'low' }); // 30 minutes
    } catch (error) {
      console.warn(`Failed to preload IPFS content for ${hash}:`, error);
    }
  }

  /**
   * Preload user data
   */
  async preloadUserData(userId: string, fetchFn: () => Promise<any>): Promise<void> {
    const key = `user-${userId}`;
    try {
      await this.fetchWithCache(key, fetchFn, { maxAge: 15 * 60 * 1000, priority: 'medium' }); // 15 minutes
    } catch (error) {
      console.warn(`Failed to preload user data for ${userId}:`, error);
    }
  }

  /**
   * Evict least recently used items from cache
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    const toRemove = entries.slice(0, Math.ceil(this.config.maxCacheSize * 0.2)); // Remove 20%
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (typeof window !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanup(), this.config.cleanupInterval);
    }
  }

  /**
   * Stop cleanup timer
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.activeRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
    totalRequests: number;
  } {
    const totalRequests = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );
    const hits = totalRequests > 0 ? totalRequests - this.cache.size : 0;
    const hitRate = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate,
      missRate: 100 - hitRate,
      totalRequests,
    };
  }
}

/**
 * Specialized preloader for NFT data
 */
export class NFTPreloader extends PreloadingService {
  constructor(config: PreloadingServiceConfig = {}) {
    super({
      maxCacheSize: 50,
      defaultMaxAge: 10 * 60 * 1000, // 10 minutes
      ...config,
    });
  }

  async preloadNFT(nftId: string, fetchFn: () => Promise<any>): Promise<void> {
    return this.preloadNFTMetadata(nftId, fetchFn);
  }

  async preloadNFTBatch(nftIds: string[], fetchFn: (id: string) => Promise<any>): Promise<void> {
    return this.preloadMultipleNFTMetadata(nftIds, fetchFn);
  }
}

/**
 * Specialized preloader for IPFS content
 */
export class IPFSPreloader extends PreloadingService {
  constructor(config: PreloadingServiceConfig = {}) {
    super({
      maxCacheSize: 30,
      defaultMaxAge: 30 * 60 * 1000, // 30 minutes
      ...config,
    });
  }

  async preloadIPFS(hash: string, fetchFn: () => Promise<any>): Promise<void> {
    return this.preloadIPFSContent(hash, fetchFn);
  }

  async preloadIPFSBatch(hashes: string[], fetchFn: (hash: string) => Promise<any>): Promise<void> {
    const promises = hashes.map((hash) => this.preloadIPFS(hash, () => fetchFn(hash)));
    await Promise.allSettled(promises);
  }
}

/**
 * Singleton instances
 */
export const preloadingService = new PreloadingService();
export const nftPreloader = new NFTPreloader();
export const ipfsPreloader = new IPFSPreloader();

export default PreloadingService;