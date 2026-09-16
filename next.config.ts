import type { NextConfig } from "next";

const rpID = process.env.RP_ID ?? "localhost";

const nextConfig: NextConfig = {
  allowedDevOrigins: rpID ? [rpID] : [],
  experimental: {
    serverActions: {
      allowedOrigins: rpID ? [rpID] : [],
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
