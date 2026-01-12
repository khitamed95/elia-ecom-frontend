import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['192.168.1.158', 'localhost'],
  
  // إصلاح تحذير turbopack multiple lockfiles
  turbopack: {
    root: 'C:/Users/E-Tech/elia-ecom-frontend',
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.158',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // أي إعدادات أخرى لديك اتركها كما هي

  // إصلاح Google OAuth - COOP Policy
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
