import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  swcMinify: true,
  reactStrictMode: false,
  reactCompiler: true,
  distDir: 'build' // 默认是 .next
}

export default nextConfig
