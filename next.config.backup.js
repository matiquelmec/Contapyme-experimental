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
    const headers = [
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

    // 🔄 Disable cache in development
    if (process.env.NODE_ENV === 'development') {
      headers.push({
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
      });
    }

    return headers;
  },

  // ⚡ Experimental Features (Disabled temporarily for stability)
  experimental: {
    // Modern optimizations - disabled for debugging
    optimizeCss: false,
    // optimizePackageImports: [
    //   'lucide-react',
    //   '@supabase/supabase-js',
    //   'recharts',
    //   'date-fns',
    //   'zod'
    // ],
    // Fixed missing suspense issue
    missingSuspenseWithCSRBailout: false,
  },

  // 📦 Webpack Configuration (Fixed for chunk issues)
  webpack: (config, { dev, isServer }) => {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // Fix chunk loading issues
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendors',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };

      // Disable cache for development to prevent chunk issues
      config.cache = false;
    }

    return config;
  },

  // 🔄 Disable aggressive caching in development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // 🎯 TypeScript and ESLint Configuration (Temporarily more permissive)
  typescript: {
    ignoreBuildErrors: true, // Temporal para desarrollo
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporal para desarrollo
    dirs: ['src'],
  },
}

module.exports = nextConfig