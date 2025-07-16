/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
  // SEO and Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}

module.exports = nextConfig
