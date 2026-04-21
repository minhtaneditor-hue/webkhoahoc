import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'hextaui.com',
      },
    ],
  },
};

export default nextConfig;
