/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' },
      // When you deploy with a CDN, add it here, e.g.:
      // { protocol: 'https', hostname: 'cdn.yarajewels.com', pathname: '/**' },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;