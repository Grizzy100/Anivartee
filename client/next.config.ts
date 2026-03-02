import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/geo',
        destination: 'https://api.country.is',
      },
    ];
  },
};

export default nextConfig;
