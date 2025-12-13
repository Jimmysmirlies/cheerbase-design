/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Reduce console noise in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  webpack: (config, { isServer }) => {
    // Suppress url.parse deprecation warnings
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        url: false,
      }
    }
    return config
  },
}

export default nextConfig
