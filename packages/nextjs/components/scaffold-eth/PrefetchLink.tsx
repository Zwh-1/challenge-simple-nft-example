import { useEffect, useRef, useCallback } from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";

interface PrefetchLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  prefetchOnHover?: boolean;
  prefetchOnVisible?: boolean;
  prefetchDelay?: number;
  as?: string;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
}

/**
 * Enhanced Link component with automatic route prefetching
 * Supports hover prefetching and intersection observer-based visible prefetching
 */
export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  children,
  href,
  className,
  prefetchOnHover = true,
  prefetchOnVisible = false,
  prefetchDelay = 200,
  ...linkProps
}) => {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasPrefetchedRef = useRef(false);

  const prefetchRoute = useCallback(() => {
    if (hasPrefetchedRef.current) return;
    
    try {
      if (typeof href === 'string') {
        router.prefetch(href);
      } else if (href && typeof href === 'object' && href.pathname) {
        router.prefetch(href.pathname);
      }
      hasPrefetchedRef.current = true;
    } catch (error) {
      console.warn('路由预加载失败:', href, error);
    }
  }, [router, href]);

  // Handle hover prefetching
  const handleMouseEnter = useCallback(() => {
    if (!prefetchOnHover || hasPrefetchedRef.current) return;
    
    prefetchTimeoutRef.current = setTimeout(() => {
      prefetchRoute();
    }, prefetchDelay);
  }, [prefetchOnHover, prefetchDelay, prefetchRoute]);

  const handleMouseLeave = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }
  }, []);

  // Handle intersection observer for visible prefetching
  useEffect(() => {
    if (!prefetchOnVisible || !linkRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPrefetchedRef.current) {
            prefetchRoute();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observer.observe(linkRef.current);

    return () => {
      observer.disconnect();
    };
  }, [prefetchOnVisible, prefetchRoute]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...linkProps}
    >
      {children}
    </Link>
  );
};

/**
 * Hook for programmatic route prefetching
 */
export const usePrefetch = () => {
  const router = useRouter();
  const prefetchedRoutes = useRef<Set<string>>(new Set());

  const prefetch = useCallback((href: string) => {
    if (prefetchedRoutes.current.has(href)) return;
    
    try {
      router.prefetch(href);
      prefetchedRoutes.current.add(href);
    } catch (error) {
      console.warn('路由预加载失败:', href, error);
    }
  }, [router]);

  const prefetchMultiple = useCallback((hrefs: string[]) => {
    hrefs.forEach((href) => prefetch(href));
  }, [prefetch]);

  const clearCache = useCallback(() => {
    prefetchedRoutes.current.clear();
  }, []);

  return {
    prefetch,
    prefetchMultiple,
    clearCache,
    hasPrefetched: (href: string) => prefetchedRoutes.current.has(href),
  };
};

/**
 * Component to prefetch common routes on mount
 */
export const CommonRoutesPrefetcher: React.FC<{ routes?: string[] }> = ({ routes }) => {
  const { prefetchMultiple } = usePrefetch();

  const defaultRoutes = [
    '/',
    '/my-nfts',
    '/marketplace',
    '/mint',
  ];

  const routesToPrefetch = routes || defaultRoutes;

  useEffect(() => {
    prefetchMultiple(routesToPrefetch);
  }, [prefetchMultiple, routesToPrefetch]);

  return null;
};

/**
 * Prefetch NFT-related routes
 */
export const prefetchNFTRoutes = (nftIds: string[]) => {
  const routes = nftIds.map(id => `/nft/${id}`);
  return routes;
};

/**
 * Prefetch user-specific routes
 */
export const prefetchUserRoutes = (addresses: string[]) => {
  const routes = addresses.map(address => `/profile/${address}`);
  return routes;
};

export default PrefetchLink;