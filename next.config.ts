import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zmoqqnsnxqaxsfmxuaum.supabase.co",
      },
    ],
  },
};

export default nextConfig;
