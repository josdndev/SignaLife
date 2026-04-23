import type { NextConfig } from "next";

const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL || "http://signa-api:8000";

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
  async rewrites() {
    return [
      {
        source: '/api/rppg/:path*',
        destination: `${internalApiBaseUrl}/rppg/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${internalApiBaseUrl}/:path*`,
      },
      {
        source: '/pacientes/:path*',
        destination: `${internalApiBaseUrl}/pacientes/:path*`,
      },
    ];
  },
};

export default nextConfig;
