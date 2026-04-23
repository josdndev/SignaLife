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
  async rewrites() {
    return [
      {
        source: '/api/rppg/:path*',
        destination: 'http://signa-api:8000/rppg/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://signa-api:8000/:path*',
      },
      {
        source: '/pacientes/:path*',
        destination: 'http://signa-api:8000/pacientes/:path*',
      },
    ];
  },
};

export default nextConfig;
