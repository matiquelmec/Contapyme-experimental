/** @type {import('next').NextConfig} */

// CONFIGURACIÓN DE EMERGENCIA - SIN OPTIMIZACIONES
const nextConfig = {
  // Core básico
  reactStrictMode: false, // Deshabilitado para debugging
  swcMinify: false, // Deshabilitado para evitar problemas
  poweredByHeader: false,

  // NO optimizaciones de imágenes que puedan fallar
  images: {
    unoptimized: true, // Deshabilitado completamente
  },

  // Headers mínimos
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
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
  },

  // SIN experimental features
  experimental: {},

  // Webpack MÍNIMO - solo lo esencial
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // DESHABILITADO: Todo cache
      config.cache = false;

      // DESHABILITADO: Split chunks complejos
      config.optimization.splitChunks = false;

      // Configuración mínima
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },

  // Compilación permisiva
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Output standalone para evitar problemas de paths
  output: 'standalone',
}

module.exports = nextConfig