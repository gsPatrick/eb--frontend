/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'www.figma.com', pathname: '/api/mcp/asset/**' }],
  },
};

module.exports = nextConfig;
