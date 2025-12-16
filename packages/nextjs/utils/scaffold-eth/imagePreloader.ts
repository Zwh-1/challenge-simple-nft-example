/**
 * Image preloading utility for optimizing NFT and other image loading
 */

interface PreloadedImage {
  src: string;
  loaded: boolean;
  promise: Promise<void>;
}

class ImagePreloader {
  private preloadedImages = new Map<string, PreloadedImage>();
  private maxConcurrentLoads = 6;
  private currentLoads = 0;
  private loadQueue: Array<() => void> = [];

  /**
   * Preload a single image
   */
  async preloadImage(src: string): Promise<void> {
    // Return existing promise if already loading/loaded
    const existing = this.preloadedImages.get(src);
    if (existing) {
      return existing.promise;
    }

    // Create new preload promise
    const preloadPromise = this.loadImageWithQueue(src);
    this.preloadedImages.set(src, {
      src,
      loaded: false,
      promise: preloadPromise,
    });

    return preloadPromise;
  }

  /**
   * Preload multiple images
   */
  async preloadImages(srcs: string[]): Promise<void[]> {
    const uniqueSrcs = [...new Set(srcs)]; // Remove duplicates
    return Promise.all(uniqueSrcs.map(src => this.preloadImage(src)));
  }

  /**
   * Check if an image is already preloaded
   */
  isImagePreloaded(src: string): boolean {
    const image = this.preloadedImages.get(src);
    return image ? image.loaded : false;
  }

  /**
   * Get preloaded image URL (for use with Next.js Image component)
   */
  getPreloadedImageUrl(src: string): string {
    return src; // For now, just return the original src
  }

  /**
   * Clear preloaded images cache
   */
  clearCache(): void {
    this.preloadedImages.clear();
    this.loadQueue = [];
    this.currentLoads = 0;
  }

  /**
   * Get loading progress for a set of images
   */
  getLoadingProgress(srcs: string[]): { loaded: number; total: number; percentage: number } {
    const total = srcs.length;
    const loaded = srcs.filter(src => this.isImagePreloaded(src)).length;
    return {
      loaded,
      total,
      percentage: total > 0 ? Math.round((loaded / total) * 100) : 100,
    };
  }

  /**
   * Load image with queue management to limit concurrent loads
   */
  private loadImageWithQueue(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const loadImage = () => {
        this.currentLoads++;
        
        const img = new Image();
        
        img.onload = () => {
          this.updateImageStatus(src, true);
          this.currentLoads--;
          this.processQueue();
          resolve();
        };

        img.onerror = () => {
          this.updateImageStatus(src, false);
          this.currentLoads--;
          this.processQueue();
          reject(new Error(`Failed to load image: ${src}`));
        };

        // Add loading optimization
        img.decoding = 'async';
        img.loading = 'eager'; // Use eager loading for preloaded images
        
        img.src = src;
      };

      if (this.currentLoads >= this.maxConcurrentLoads) {
        this.loadQueue.push(loadImage);
      } else {
        loadImage();
      }
    });
  }

  /**
   * Process the next image in the queue
   */
  private processQueue(): void {
    if (this.loadQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
      const nextLoad = this.loadQueue.shift();
      if (nextLoad) {
        nextLoad();
      }
    }
  }

  /**
   * Update image status in cache
   */
  private updateImageStatus(src: string, loaded: boolean): void {
    const image = this.preloadedImages.get(src);
    if (image) {
      image.loaded = loaded;
    }
  }
}

// Create singleton instance
export const imagePreloader = new ImagePreloader();

/**
 * Utility function to preload IPFS images with gateway optimization
 */
export const preloadIPFSImage = (ipfsHash: string, gateway: string = 'https://gateway.pinata.cloud'): string => {
  const imageUrl = `${gateway}/ipfs/${ipfsHash}`;
  imagePreloader.preloadImage(imageUrl).catch(console.error);
  return imageUrl;
};

/**
 * Utility function to preload multiple IPFS images
 */
export const preloadIPFSImages = (ipfsHashes: string[], gateway: string = 'https://gateway.pinata.cloud'): string[] => {
  const imageUrls = ipfsHashes.map(hash => `${gateway}/ipfs/${hash}`);
  imagePreloader.preloadImages(imageUrls).catch(console.error);
  return imageUrls;
};

/**
 * Convert IPFS URL to HTTP URL and preload
 */
export const preloadIPFSUrl = (ipfsUrl: string): string => {
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return preloadIPFSImage(hash);
  }
  
  // If it's already an HTTP URL, just preload it
  imagePreloader.preloadImage(ipfsUrl).catch(console.error);
  return ipfsUrl;
};