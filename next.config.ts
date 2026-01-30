import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows images from ANY secure website
      },
      {
        protocol: "http",
        hostname: "**", // Allows images from older news sources
      },
      // You can keep these for explicit clarity,
      // but the wildcard above covers all of them.
      {
        protocol: "https",
        hostname: "s.yimg.com",
      },
      {
        protocol: "https",
        hostname: "finnhub.io",
      },
      {
        protocol: "https",
        hostname: "static.finnhub.io",
      },
      {
        protocol: "https",
        hostname: "sa.investing.com",
      },
      {
        protocol: "https",
        hostname: "image.cnbcfm.com",
      },
    ],
  },
  /* other config options here */
};

export default nextConfig;
