/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' },
      // Production domains — update these when you deploy
      { protocol: 'https', hostname: 'api.yarajewels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.yarajewels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media.yarajewels.com', pathname: '/**' },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;