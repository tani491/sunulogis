import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" output is for Docker, NOT needed for Vercel
  // Remove output: "standalone" for Vercel deployment
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
