import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // CMS images can be pasted from anywhere (Vercel Blob, Unsplash, …).
      // Both protocols so an http:// paste degrades instead of throwing.
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
