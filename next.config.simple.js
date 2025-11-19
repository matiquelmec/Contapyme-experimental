/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🎯 Core Configuration - Minimal for stability
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,

  // 🖼️ Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['localhost', 'contapymepuq.cl'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // 🔒 Security Headers (Minimal)
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, max-age=0, must-revalidate'
            },
            {
              key: 'Pragma',
              value: 'no-cache'
            },
            {
              key: 'Expires',
              value: '0'
            }
          ]
        }
      ];
    }
    return [];
  },

  // ⚡ Experimental Features - NONE for stability
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // 📦 Webpack Configuration - Minimal
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Completely disable cache in development
      config.cache = false;

      // Simplify chunk splitting
      config.optimization.splitChunks = {
        chunks: 'async',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // 🎯 TypeScript and ESLint Configuration
  typescript: {
    ignoreBuildErrors: true, // Temporal para desarrollo
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporal para desarrollo
    dirs: ['src'],
  },
}

module.exports = nextConfig