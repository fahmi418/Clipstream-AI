import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const emptyModulePath = path.resolve(currentDir, "src/lib/empty-module.ts");

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      "@farcaster/mini-app-solana": "./src/lib/empty-module.ts",
    },
  },
  webpack: (config) => {
    const normalizedEmptyModule = emptyModulePath.replace(/\\/g, "/");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@farcaster/mini-app-solana$": normalizedEmptyModule,
      "@farcaster/mini-app-solana": normalizedEmptyModule,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@farcaster/mini-app-solana": false,
    };

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /virtualMasterPool\.js/ },
      { module: /ox/ },
      { module: /@privy-io/ },
      { message: /@farcaster\/mini-app-solana/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];

    return config;
  },
};

export default nextConfig;

