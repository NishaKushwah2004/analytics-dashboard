/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [],
  
  // Disable static optimization for error pages
  experimental: {
    optimizeCss: false,
  },
  
  // Ensure proper output configuration
  output: 'standalone',
  
  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    VANNA_API_URL: process.env.VANNA_API_URL,
  },
}

module.exports = nextConfig