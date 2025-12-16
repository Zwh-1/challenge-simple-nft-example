/* eslint-disable prettier/prettier */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { imagePreloader, preloadIPFSUrl } from "~~/utils/scaffold-eth/imagePreloader";

interface ImagePreloaderProps {
  imageUrls: string[];
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  children: React.ReactNode;
}

/**
 * 图片预加载组件，在渲染子组件前预加载图片
 */
export const ImagePreloader: React.FC<ImagePreloaderProps> = ({ imageUrls, onProgress, onComplete, children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const preloadImages = async () => {
      if (!imageUrls || imageUrls.length === 0) {
        setIsLoading(false);
        onComplete?.();
        return;
      }

      try {
        // 将IPFS url转换为HTTP url并预加载
        const processedUrls = imageUrls.map(url => {
          if (url.startsWith("ipfs://")) {
            return preloadIPFSUrl(url);
          }
          return url;
        });

        // 跟踪进度
        const total = processedUrls.length;
        let loaded = 0;

        // 预加载所有图片
        await Promise.all(
          processedUrls.map(async url => {
            try {
              await imagePreloader.preloadImage(url);
              loaded++;
              const currentProgress = Math.round((loaded / total) * 100);
              setProgress(currentProgress);
              onProgress?.(currentProgress);
            } catch (error) {
              console.error(`图片预加载失败: ${url}`, error);
              loaded++;
              const currentProgress = Math.round((loaded / total) * 100);
              setProgress(currentProgress);
              onProgress?.(currentProgress);
            }
          }),
        );

        setIsLoading(false);
        onComplete?.();
      } catch (error) {
        console.error("图片预加载失败:", error);
        setIsLoading(false);
        onComplete?.();
      }
    };

    preloadImages();
  }, [imageUrls, onProgress, onComplete]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-lg font-medium">Loading images...</p>
        <div className="w-64 bg-base-300 rounded-full h-2 mt-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm opacity-70 mt-2">{progress}% complete</p>
      </div>
    );
  }

  return <>{children}</>;
};

interface PreloadedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

/**
 * 优化的图片组件，支持预加载和懒加载
 */
export const PreloadedImage: React.FC<PreloadedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  onLoad,
  onError,
  priority = false,
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) return;

      try {
        // 处理IPFS url并预加载优先级或尚未预加载的url
        const processedSrc = src.startsWith("ipfs://") ? preloadIPFSUrl(src) : src;

        // 如果是优先级图片或未预加载，则预加载
        if (priority || !imagePreloader.isImagePreloaded(processedSrc)) {
          await imagePreloader.preloadImage(processedSrc);
        }

        setImageSrc(processedSrc);
        setIsLoading(false);
        onLoad?.();
      } catch (err) {
        console.error("图片加载失败:", err);
        setError(true);
        setIsLoading(false);
        onError?.();
      }
    };

    loadImage();
  }, [src, priority, onLoad, onError]);

  if (isLoading && priority) {
    return (
      <div className={`${className} bg-base-300 animate-pulse`} style={{ width, height }}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="loading loading-spinner loading-sm"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-base-300 flex items-center justify-center`} style={{ width, height }}>
        <span className="text-error">❌</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
    />
  );
};

/**
 * 钩子函数，用于手动预加载图片
 */
export const useImagePreloader = (imageUrls: string[], options?: { onProgress?: (progress: number) => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const preloadImages = async () => {
      if (!imageUrls || imageUrls.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const processedUrls = imageUrls.map(url => {
          if (url.startsWith("ipfs://")) {
            return preloadIPFSUrl(url);
          }
          return url;
        });

        await imagePreloader.preloadImages(processedUrls);

        // Simulate progress for hook usage
        const total = processedUrls.length;
        let loaded = 0;

        processedUrls.forEach(url => {
          imagePreloader.preloadImage(url).then(() => {
            loaded++;
            const currentProgress = Math.round((loaded / total) * 100);
            setProgress(currentProgress);
            options?.onProgress?.(currentProgress);
          });
        });

        setIsLoading(false);
      } catch (error) {
        console.error("图片预加载失败:", error);
        setIsLoading(false);
      }
    };

    preloadImages();
  }, [imageUrls, options]);

  return { isLoading, progress };
};
