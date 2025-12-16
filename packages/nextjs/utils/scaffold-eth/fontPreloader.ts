"use client";

import { useEffect, useState } from "react";

interface FontPreloadOptions {
  family: string;
  weight?: string;
  display?: 'swap' | 'block' | 'fallback' | 'optional';
}

/**
 * 使用动态链接注入预加载谷歌字体
 */
export const preloadGoogleFont = async (options: FontPreloadOptions): Promise<void> => {
  const { family, weight = '400', display = 'swap' } = options;
  
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, '+')}:wght@${weight}&display=${display}`;
    link.rel = 'stylesheet';
    
    link.onload = () => {
      // 等待字体加载完成
      if ('fonts' in document) {
        document.fonts.ready.then(() => resolve()).catch(reject);
      } else {
        resolve();
      }
    };
    
    link.onerror = () => reject(new Error(`Failed to load Google Font: ${family}`));
    document.head.appendChild(link);
  });
};

/**
 * 预加载多个 Google 字体
 */
export const preloadGoogleFonts = async (fonts: FontPreloadOptions[]): Promise<void[]> => {
  return Promise.all(fonts.map(font => preloadGoogleFont(font)));
};

/**
 * 应用中常用的字体
 */
export const commonFonts = [
  { family: 'Space Grotesk', weight: '300' },
  { family: 'Space Grotesk', weight: '400' },
  { family: 'Space Grotesk', weight: '500' },
  { family: 'Space Grotesk', weight: '600' },
  { family: 'Space Grotesk', weight: '700' },
  { family: 'Inter', weight: '400' },
  { family: 'Inter', weight: '500' },
  { family: 'Inter', weight: '600' },
  { family: 'Inter', weight: '700' },
];

/**
 * 预加载所有通用字体
 */
export const preloadCommonFonts = async (): Promise<void> => {
  try {
    await preloadGoogleFonts(commonFonts);
  } catch (error) {
    console.error('预加载通用字体失败:', error);
  }
};

/**
 * 用于在 React 组件中预加载字体的 Hook
 */
export const useFontPreloader = (fonts: FontPreloadOptions[]) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await preloadGoogleFonts(fonts);
        setIsLoading(false);
      } catch (error) {
        console.error('字体预加载失败:', error);
        setIsLoading(false);
      }
    };

    loadFonts();
  }, [fonts]);

  return { isLoading };
};