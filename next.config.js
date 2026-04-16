/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack and force Webpack
  experimental: {
    turbo: {
      resolveAlias: {},
      loaders: {},
    },
  },
  // Force webpack bundler
  webpack: (config, { dev, isServer }) => {
    // Force webpack usage
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
}

module.exports = nextConfig
