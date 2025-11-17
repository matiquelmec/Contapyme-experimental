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
    styledComponents: false,
    emotion: false,
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 🔒 Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
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
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400'
          },
          {
            key: 'X-RobotsTag',
            value: 'noindex'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // 🔄 Redirects
  async redirects() {
    return [
      // Redirect old paths if any
      {
        source: '/dashboard',
        destination: '/accounting',
        permanent: true,
      }
    ];
  },

  // ⚡ Performance Optimizations
  experimental: {
    // Modern bundling
    esmExternals: true,

    // CSS optimizations
    optimizeCss: true,

    // Package imports optimization
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'recharts',
      'date-fns',
      'zod',
      '@hookform/resolvers',
      'react-hook-form'
    ],

    // Server actions - ya habilitado por defecto en Next.js 14

    // Runtime optimizations
    missingSuspenseWithCSRBailout: false,

    // Turbo mode for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // 📦 Webpack Configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common',
              chunks: 'all',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 20,
            },
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };
    }

    // Development optimizations
    if (dev) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html'
        })
      );
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // 🎯 TypeScript and ESLint Configuration
  typescript: {
    // In production builds, don't ignore errors
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Only ignore during development builds
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
    dirs: ['src'],
  },

  // 🔄 Output Configuration
  output: 'standalone',

  // 📁 Environment Variables
  env: {
    CUSTOM_KEY: 'contapyme',
    BUILD_TIME: new Date().toISOString(),
  },

  // 🎪 Development Configuration
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },

  // 📊 Bundle Analysis
  generateBuildId: async () => {
    // Custom build ID for better caching
    return `${Date.now()}-${process.env.NODE_ENV}`;
  },
}

module.exports = nextConfig