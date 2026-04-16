import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Next.js image optimization blocks NAT64 IPv6 addresses locally.
    // Supabase Storage resolves to these on some networks in dev.
    // On Vercel this flag is false and optimization runs normally.
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
