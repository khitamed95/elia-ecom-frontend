import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Dev cross-origin warnings will be ignored; allowedDevOrigins not supported here
  
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
      // Add your production backend domain
      {
        protocol: 'https',
        hostname: 'elia-ecom-backend.onrender.com',
        pathname: '/uploads/**',
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
