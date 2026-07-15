import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['playwright', 'playwright-core'],
  /* config options here */
};

export default nextConfig;
