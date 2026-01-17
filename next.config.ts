import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,
  reactCompiler: true,
  
  // تعطيل source maps في development لتفادي الأخطاء
  devIndicators: {
    position: 'bottom-right',
  },
  
  // إعدادات Turbopack للـ development
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // زيادة حد الـ body size إلى 5MB
    },
  },

  // السماح بطلبات Cross-Origin من شبكة محلية
  allowedDevOrigins: ['192.168.1.158'],

  images: {
    unoptimized: true, // تعطيل تحسين الصور للسماح بـ IPs خاصة
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'elia-ecom-backend.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'th.bing.com',
        pathname: '/**',
      },
    ],
  },

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
