"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { imagePreloader } from "~~/utils/scaffold-eth/imagePreloader";

const idle = (cb: () => void, timeout = 1200) => {
  // requestIdleCallback fallback
  if (typeof (window as any).requestIdleCallback === "function") {
    (window as any).requestIdleCallback(cb, { timeout });
  } else {
    setTimeout(cb, timeout);
  }
};

export const AppWarmup = () => {
  const router = useRouter();

  useEffect(() => {
    idle(async () => {
      try {
        // Prefetch common routes
        [
          "/myNFTs",
          "/marketplace",
          "/ipfsUpload",
          "/ipfsDownload",
          "/transfers",
          "/blockexplorer",
        ].forEach(path => {
          try { router.prefetch(path); } catch {}
        });

        // Preload lightweight assets
        const assets = ["/logo.svg", "/favicon.png", "/hero.png"];
        assets.forEach(src => {
          imagePreloader.preloadImage(src).catch(() => void 0);
        });

        // Warm API caches (fast local stubs)
        const apis = [
          "/api/esports/leagues",
          "/api/esports/standings?league=LCK",
          "/api/esports/schedule?league=LCK",
          "/api/esports/rosters?league=LCK",
        ];
        await Promise.all(
          apis.map(u => fetch(u, { method: "GET" }).catch(() => void 0))
        );
      } catch {
        // ignore warmup errors
      }
    }, 800);
  }, [router]);

  return null;
};

export default AppWarmup;