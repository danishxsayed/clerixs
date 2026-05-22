import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { hostname: 'clerixs.com' },
      { hostname: 'app.clerixs.com' },
      { hostname: 'admin.clerixs.com' },
    ],
  },
};

export default nextConfig;
