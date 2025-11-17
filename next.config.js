/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🎯 Core Configuration
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,

  // 🔧 Compiler Optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

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

  // 🔒 Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  // ⚡ Experimental Features
  experimental: {
    // Modern optimizations
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'recharts',
      'date-fns',
      'zod'
    ],
    // Fixed missing suspense issue
    missingSuspenseWithCSRBailout: false,
  },

  // 📦 Webpack Configuration (Simplified)
  webpack: (config, { dev, isServer }) => {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // Development optimizations
    if (dev) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
      };
    }

    return config;
  },

  // 🎯 TypeScript and ESLint Configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },
}

module.exports = nextConfig