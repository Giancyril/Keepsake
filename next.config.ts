import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // Allow sharp to work in Next.js (it's a native module)
  serverExternalPackages: ["sharp", "exifr", "heic-convert"],
};

export default nextConfig;
