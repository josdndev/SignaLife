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
    // Permite que la build pase aunque haya errores de tipos
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
