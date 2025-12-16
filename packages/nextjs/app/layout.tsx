import { Space_Grotesk } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import AppWarmup from "~~/components/AppWarmup";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = getMetadata({
  title: "简单 NFT 示例 | SpeedRunEthereum",
  description: "使用 🏗 Scaffold-ETH 2 构建",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={`${spaceGrotesk.variable} font-space-grotesk`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Preload critical images */}
        <link rel="preload" href="/hero.png" as="image" />
        <link rel="preload" href="/logo.svg" as="image" />
        <link rel="preload" href="/favicon.png" as="image" />

        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://gateway.pinata.cloud" />
        <link rel="dns-prefetch" href="https://api.pinata.cloud" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://gateway.pinata.cloud" />
        <link rel="preconnect" href="https://api.pinata.cloud" />
      </head>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            {children}
            <AppWarmup />
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
