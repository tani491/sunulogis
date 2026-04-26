import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const cspDirectives = [
  "default-src 'self'",
  // unsafe-eval required by Next.js in dev; removed in production
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "media-src 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS — force HTTPS for 2 years, include subdomains
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer leakage
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable browser features not needed by this app
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // Content Security Policy
          { key: 'Content-Security-Policy', value: cspDirectives },
        ],
      },
    ];
  },
};

export default nextConfig;
