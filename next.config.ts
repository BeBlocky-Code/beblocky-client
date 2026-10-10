import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import path from "node:path";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const blockedServerPackage = path.join(
  process.cwd(),
  "lib/blocked-server-package.ts",
);

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  serverExternalPackages: ["mongoose", "mongodb"],
  turbopack: {
    resolveAlias: {
      mongoose: "./lib/blocked-server-package.ts",
      mongodb: "./lib/blocked-server-package.ts",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        mongoose: blockedServerPackage,
        mongodb: blockedServerPackage,
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
