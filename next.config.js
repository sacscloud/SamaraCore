/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desactivar ESLint durante el build
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongodb', 'firebase-admin'],
  },
  webpack: (config, { isServer }) => {
    // Excluir undici del lado del cliente para evitar errores de module parse
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    if (!isServer) {
      config.externals = [...(config.externals || []), 'undici'];
    }
    
    // Optimizaciones adicionales
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
    };
    
    return config;
  },
  transpilePackages: ['firebase'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 