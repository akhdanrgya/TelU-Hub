/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8910",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "202-10-34-23.sslip.io",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },

  output: "standalone",
};

module.exports = nextConfig;
