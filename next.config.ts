import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages でのデプロイ時は opennextjs-cloudflare build を使用するため
  // output: 'standalone' は不要
};

export default nextConfig;
