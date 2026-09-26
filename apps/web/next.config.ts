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
      "@farcaster/mini-app-solana": emptyModulePath,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@farcaster/mini-app-solana": emptyModulePath,
    };

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /virtualMasterPool\.js/ },
      { module: /ox/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];

    return config;
  },
};

export default nextConfig;

