import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Additional build optimizations
  images: {
    unoptimized: true,
  },
  // Fix for client reference manifest issues
  // output: 'standalone', // Commented out for Docker deployment
};

export default nextConfig;
