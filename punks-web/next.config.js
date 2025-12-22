/** @type {import('next').NextConfig} */

const nextConfig = {
  // CHANGED: 'standalone' is required for Docker deployments on Railway
  // 'export' is for static sites (like Vercel/Netlify/S3), which doesn't work well with API routes in Docker
  output: 'standalone',

  // Trailing slashes - can keep if preferred, but usually cleaner without
  trailingSlash: false,

  // Image optimization settings
  images: {
    // UNCHANGED: Remote patterns for IPFS
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: '*.ipfs.dweb.link',
      },
    ],
  },

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002',
    NEXT_PUBLIC_MAIN_SITE_URL: process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://24hrmvp.xyz',
  },

  // Strict mode for React
  reactStrictMode: true,

  // Custom webpack configuration
  webpack: (config) => {
    // Handle potential issues with certain packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
