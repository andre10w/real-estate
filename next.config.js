/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['dyqpd3w9nj7ap.cloudfront.net'],
  },
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  experimental: { esmExternals: true },
}

const withTM = require("next-transpile-modules")(["gsap"]);

module.exports = withTM({ nextConfig });
