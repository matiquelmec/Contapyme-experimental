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

  // 🔒 Security Headers (Excluye archivos estáticos de Next.js)
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          // Solo aplicar no-cache a páginas HTML, NO a archivos estáticos
          source: '/((?!_next/static|_next/image|favicon.ico).*)',
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

  // 📦 Webpack Configuration - Simplified for stability
  webpack: (config, { dev, isServer }) => {
    // Remove problematic configurations
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