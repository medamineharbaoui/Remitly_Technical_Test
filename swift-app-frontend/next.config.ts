
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'seekvectorlogo.com',
        pathname: '/wp-content/uploads/**', // restrict to specific paths
      },
    ],
  },
};

module.exports = nextConfig;