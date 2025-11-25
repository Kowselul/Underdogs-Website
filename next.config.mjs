/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/settings',
        destination: '/',
      },
      {
        source: '/profile',
        destination: '/',
      },
      {
        source: '/members',
        destination: '/',
      },
      {
        source: '/education',
        destination: '/',
      },
      {
        source: '/search',
        destination: '/',
      },
      {
        source: '/edit-profile',
        destination: '/',
      },
      {
        source: '/login',
        destination: '/',
      },
      {
        source: '/register',
        destination: '/',
      },
    ]
  },
}

export default nextConfig
