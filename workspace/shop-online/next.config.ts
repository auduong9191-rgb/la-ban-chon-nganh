import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "qr.sepay.vn" }],
  },
};

export default nextConfig;
