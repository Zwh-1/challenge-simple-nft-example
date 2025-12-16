/**
 * Route prefetching utilities for Next.js navigation optimization
 */

interface PrefetchOptions {
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface RoutePrefetcherConfig {
  maxConcurrent?: number;
  defaultPriority?: 'high' | 'medium' | 'low';
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Route prefetcher class for intelligent prefetching of Next.js routes
 */
export class RoutePrefetcher {
  private queue: Array<{ href: string; options: PrefetchOptions; attempts: number }> = [];
  private processing = false;
  private config: Required<RoutePrefetcherConfig>;
  private observer: IntersectionObserver | null = null;
  private prefetchedRoutes = new Set<string>();

  constructor(config: RoutePrefetcherConfig = {}) {
    this.config = {
      maxConcurrent: 3,
      defaultPriority: 'medium',
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Initialize intersection observer for visible links
   */
  initializeObserver(): void {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const href = link.getAttribute('href');
            if (href && !this.prefetchedRoutes.has(href)) {
              this.prefetch(href, { priority: 'low' });
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
  }

  /**
   * Observe a link element for prefetching when it becomes visible
   */
  observeLink(element: HTMLAnchorElement): void {
    if (!this.observer) {
      this.initializeObserver();
    }
    this.observer?.observe(element);
  }

  /**
   * Stop observing a link element
   */
  unobserveLink(element: HTMLAnchorElement): void {
    this.observer?.unobserve(element);
  }

  /**
   * Add a route to the prefetch queue
   */
  prefetch(href: string, options: PrefetchOptions = {}): void {
    if (this.prefetchedRoutes.has(href)) return;

    const prefetchOptions = { ...this.config, ...options };
    this.queue.push({ href, options: prefetchOptions, attempts: 0 });
    this.processQueue();
  }

  /**
   * Prefetch multiple routes
   */
  prefetchMultiple(hrefs: string[], options: PrefetchOptions = {}): void {
    hrefs.forEach((href) => this.prefetch(href, options));
  }

  /**
   * Process the prefetch queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    // Sort queue by priority
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.options.priority || 'medium'] - priorityOrder[a.options.priority || 'medium'];
    });

    const processingPromises: Promise<void>[] = [];

    while (this.queue.length > 0 && processingPromises.length < this.config.maxConcurrent) {
      const item = this.queue.shift()!;
      processingPromises.push(this.processItem(item));
    }

    await Promise.allSettled(processingPromises);
    this.processing = false;

    // Process remaining items
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  /**
   * Process a single prefetch item
   */
  private async processItem(item: { href: string; options: PrefetchOptions; attempts: number }): Promise<void> {
    try {
      // Simulate Next.js router prefetch
      if (typeof window !== 'undefined' && (window as any).next?.router) {
        await (window as any).next.router.prefetch(item.href);
      } else {
        // Fallback: create a link element to trigger prefetch
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = item.href;
        document.head.appendChild(link);
        setTimeout(() => document.head.removeChild(link), 1000);
      }

      this.prefetchedRoutes.add(item.href);
    } catch (error) {
      console.warn(`Failed to prefetch route: ${item.href}`, error);
      
      // Retry logic
      if (item.attempts < (item.options.retryAttempts || this.config.retryAttempts)) {
        item.attempts++;
        setTimeout(() => {
          this.queue.push(item);
          this.processQueue();
        }, item.options.retryDelay || this.config.retryDelay);
      }
    }
  }

  /**
   * Clear the prefetch cache
   */
  clearCache(): void {
    this.prefetchedRoutes.clear();
  }

  /**
   * Check if a route has been prefetched
   */
  hasPrefetched(href: string): boolean {
    return this.prefetchedRoutes.has(href);
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Destroy the prefetcher and clean up
   */
  destroy(): void {
    this.observer?.disconnect();
    this.queue = [];
    this.processing = false;
  }
}

/**
 * Singleton instance of RoutePrefetcher
 */
export const routePrefetcher = new RoutePrefetcher();

/**
 * Prefetch common routes
 */
export const prefetchCommonRoutes = (): void => {
  const commonRoutes = [
    '/',
    '/my-nfts',
    '/marketplace',
    '/mint',
    '/profile',
  ];
  routePrefetcher.prefetchMultiple(commonRoutes);
};

/**
 * Prefetch NFT-related routes
 */
export const prefetchNFTRoutes = (nftIds: string[]): void => {
  const routes = nftIds.map(id => `/nft/${id}`);
  routePrefetcher.prefetchMultiple(routes);
};

/**
 * Prefetch user-specific routes
 */
export const prefetchUserRoutes = (addresses: string[]): void => {
  const routes = addresses.map(address => `/profile/${address}`);
  routePrefetcher.prefetchMultiple(routes);
};

/**
 * Utility function to create a prefetch function for a specific set of routes
 */
export const createRoutePrefetcher = (routes: string[]) => {
  return () => routePrefetcher.prefetchMultiple(routes);
};

export default RoutePrefetcher;