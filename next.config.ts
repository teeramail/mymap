import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgp1.digitaloceanspaces.com"
      },
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com"
      }
    ]
  }
};

export default nextConfig;
