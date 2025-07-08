/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/WebIntractMCP' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/WebIntractMCP' : '',
  experimental: {
    mdxRs: true,
  },
}

module.exports = nextConfig
